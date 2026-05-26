import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const MAX_ATTEMPTS = 3;
const LOCKOUT_MS   = 4 * 60 * 1000;
const RATE_KEY     = 'vb_login_rate';

function getRateData() { try { return JSON.parse(localStorage.getItem(RATE_KEY) || '{}'); } catch { return {}; } }
function setRateData(d) { localStorage.setItem(RATE_KEY, JSON.stringify(d)); }

export default function LoginPage({ isModal = false, onClose = null }) {
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [busy,      setBusy]      = useState(false);
  const [lockUntil, setLockUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const d = getRateData();
    if (d.lockUntil && Date.now() < d.lockUntil) setLockUntil(d.lockUntil);
  }, []);

  useEffect(() => {
    if (!lockUntil) return;
    const iv = setInterval(() => {
      const rem = lockUntil - Date.now();
      if (rem <= 0) { setLockUntil(0); setRemaining(0); clearInterval(iv); }
      else setRemaining(Math.ceil(rem / 1000));
    }, 500);
    return () => clearInterval(iv);
  }, [lockUntil]);

  const isLocked = lockUntil && Date.now() < lockUntil;

  async function handleLogin(e) {
    e.preventDefault();
    if (isLocked || busy) return;
    if (!username.trim() || !password.trim()) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
    setBusy(true); setError('');

    try {
      let email = username.trim();

      // ถ้าไม่ใช่ email → lookup username
      if (!email.includes('@')) {
        const { data: rec, error: lookupErr } = await supabase
          .from('usernames')
          .select('email')
          .eq('username', email.toLowerCase())
          .single();
        if (lookupErr || !rec) throw new Error('ไม่พบชื่อผู้ใช้นี้');
        email = rec.email;
      }

      const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr) throw new Error('รหัสผ่านไม่ถูกต้อง');

      setRateData({});
      if (onClose) onClose(); // ปิด modal หลัง login สำเร็จ
    } catch (err) {
      const d = getRateData();
      const attempts = (d.attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setRateData({ lockUntil: until });
        setLockUntil(until);
      } else {
        setRateData({ attempts });
        setError(`${err.message} — เหลืออีก ${MAX_ATTEMPTS - attempts} ครั้ง`);
      }
    } finally { setBusy(false); }
  }

  const lockMin = Math.floor(remaining / 60);
  const lockSec = remaining % 60;

  const inp = { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,107,157,0.3)', borderRadius:'9px', color:'#f0d0ff', fontFamily:'Mitr,sans-serif', fontSize:'0.9rem', outline:'none', width:'100%', padding:'10px 12px', marginBottom:'14px', boxSizing:'border-box' };

  const wrapStyle = isModal
    ? { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, fontFamily:'Mitr,sans-serif' }
    : { minHeight:'100vh', background:'linear-gradient(135deg,#1a0a2e,#2c1040)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Mitr,sans-serif' };

  return (
    <div style={wrapStyle} onClick={isModal ? (e => { if(e.target===e.currentTarget && onClose) onClose(); }) : undefined}>
      <div style={{ position:'relative', background:'rgba(26,10,46,0.98)', border:'1px solid rgba(255,107,157,0.3)', borderRadius:'20px', padding:'40px 36px', width:'100%', maxWidth:'380px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        {isModal && onClose && (
          <button onClick={onClose} style={{ position:'absolute', top:'14px', right:'16px', background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'1.2rem', cursor:'pointer', lineHeight:1 }}>✕</button>
        )}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'2.8rem', marginBottom:'8px' }}>💌</div>
          <h1 style={{ color:'#ff9a9e', fontSize:'1.4rem', fontWeight:600, margin:0 }}>Valentine Builder Pro</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.78rem', marginTop:'6px' }}>กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        {isLocked ? (
          <div style={{ background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.35)', borderRadius:'12px', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'8px' }}>🔒</div>
            <p style={{ color:'#ff8080', fontSize:'0.9rem', margin:0 }}>กรอกผิดเกินจำนวน — รออีก</p>
            <p style={{ color:'#ff6060', fontSize:'1.4rem', fontWeight:700, margin:'8px 0 0' }}>
              {lockMin > 0 ? `${lockMin}:${String(lockSec).padStart(2,'0')}` : `${lockSec} วิ`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ display:'block', color:'#c9a8e8', fontSize:'0.75rem', marginBottom:'5px' }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="ชื่อผู้ใช้" style={inp} />
            <label style={{ display:'block', color:'#c9a8e8', fontSize:'0.75rem', marginBottom:'5px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่าน" style={{ ...inp, marginBottom: error ? '6px' : '14px' }} />
            {error && <p style={{ color:'#ff8080', fontSize:'0.78rem', textAlign:'center', marginBottom:'12px' }}>{error}</p>}
            <button type="submit" disabled={busy} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#ff6b9d,#e63462)', border:'none', borderRadius:'10px', color:'#fff', fontFamily:'Mitr,sans-serif', fontSize:'0.95rem', fontWeight:600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? '⏳ กำลังตรวจสอบ...' : '🔓 เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.68rem', textAlign:'center', marginTop:'22px' }}>
          ต้องการบัญชี? ติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}

