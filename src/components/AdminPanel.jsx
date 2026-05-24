import { useState, useEffect } from 'react';
import { supabase, supabaseSecondary } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

function genCode() {
  // ใช้ crypto.getRandomValues() แทน Math.random() เพื่อความปลอดภัย
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัดตัวที่สับสนออก (0,O,1,I)
  const arr   = new Uint8Array(6);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => chars[b % chars.length]).join('');
}

export default function AdminPanel({ onClose }) {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('users');

  // Create user
  const [newUser, setNewUser]   = useState('');
  const [newPass, setNewPass]   = useState('');
  const [createMsg, setCreateMsg] = useState('');

  // Generate code
  const [codeFor,  setCodeFor]  = useState('');
  const [codeHrs,  setCodeHrs]  = useState(1);
  const [codeGen,  setCodeGen]  = useState('');
  const [codeMsg,  setCodeMsg]  = useState('');

  // Lists
  const [users,       setUsers]       = useState([]);
  const [recentCodes, setRecentCodes] = useState([]);
  const [loadingU,    setLoadingU]    = useState(false);

  if (!isAdmin) return null;

  async function loadUsers() {
    setLoadingU(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoadingU(false);
  }

  async function loadCodes() {
    const { data } = await supabase.from('export_codes').select('*').order('created_at', { ascending: false }).limit(20);
    setRecentCodes(data || []);
  }

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'code')  loadCodes();
  }, [tab]);

  async function createUser() {
    if (!newUser.trim() || !newPass.trim()) { setCreateMsg('❌ กรุณากรอกข้อมูลให้ครบ'); return; }
    const uname = newUser.trim().toLowerCase();
    if (!/^[a-z0-9_-]+$/.test(uname)) { setCreateMsg('❌ Username ใช้ได้เฉพาะ a-z, 0-9, _ และ - เท่านั้น (ห้ามมี @ หรือ .)'); return; }
    setCreateMsg('⏳ กำลังสร้าง...');
    const email = `${uname}@vb.app`;

    // ตรวจ username ซ้ำ
    const { data: existing } = await supabase.from('usernames').select('username').eq('username', uname).single();
    if (existing) { setCreateMsg('❌ Username นี้มีอยู่แล้ว'); return; }

    // สร้าง user ด้วย secondary client (ไม่กระทบ session admin)
    const { data: signData, error: signErr } = await supabaseSecondary.auth.signUp({ email, password: newPass.trim() });
    if (signErr) { setCreateMsg(`❌ ${signErr.message}`); return; }

    const uid = signData.user?.id;
    if (!uid) { setCreateMsg('❌ สร้าง user ไม่สำเร็จ'); return; }

    // บันทึกข้อมูล
    await supabase.from('usernames').insert({ username: uname, user_id: uid, email });
    await supabase.from('profiles').insert({ id: uid, username: uname, exports_used: 0, is_admin: false });

    // Sign out secondary client
    await supabaseSecondary.auth.signOut();

    setCreateMsg(`✅ สร้าง "${uname}" สำเร็จแล้ว!`);
    setNewUser(''); setNewPass('');
    loadUsers();
  }

  async function generateCode() {
    if (!codeFor.trim()) { setCodeMsg('❌ กรุณากรอก username'); return; }
    setCodeMsg('⏳ กำลังสร้างรหัส...');
    setCodeGen('');
    const uname = codeFor.trim().toLowerCase();

    const { data: rec } = await supabase.from('usernames').select('user_id').eq('username', uname).single();
    if (!rec) { setCodeMsg('❌ ไม่พบ username นี้'); return; }

    const code      = genCode();
    const expiresAt = new Date(Date.now() + codeHrs * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('export_codes').insert({
      code, user_id: rec.user_id, username: uname, expires_at: expiresAt, used: false,
    });

    if (error) { setCodeMsg(`❌ ${error.message}`); return; }
    setCodeGen(code);
    setCodeMsg(`✅ รหัสสำหรับ "${uname}" — ใช้ได้ ${codeHrs} ชั่วโมง`);
    loadCodes();
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const tabBtnStyle = (t) => ({
    padding:'7px 16px', borderRadius:'8px', border:'none', cursor:'pointer',
    background: tab === t ? 'linear-gradient(135deg,#ff6b9d,#e63462)' : 'rgba(255,255,255,0.08)',
    color:'#fff', fontFamily:'Mitr,sans-serif', fontSize:'0.8rem',
  });
  const inpStyle = { width:'100%', padding:'9px 12px', marginBottom:'10px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,107,157,0.3)', borderRadius:'8px', color:'#f0d0ff', fontFamily:'Mitr,sans-serif', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' };
  const btnStyle = (bg='#ff6b9d') => ({ padding:'9px 18px', background:bg, border:'none', borderRadius:'8px', color:'#fff', fontFamily:'Mitr,sans-serif', fontSize:'0.85rem', cursor:'pointer', fontWeight:600 });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, fontFamily:'Mitr,sans-serif' }}>
      <div style={{ background:'#1a0a2e', border:'1px solid rgba(255,107,157,0.4)', borderRadius:'18px', padding:'28px', width:'100%', maxWidth:'520px', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ color:'#ff9a9e', margin:0, fontSize:'1.1rem' }}>⚙️ Admin Panel</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#aaa', fontSize:'1.3rem', cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
          <button style={tabBtnStyle('users')} onClick={() => setTab('users')}>👥 รายชื่อ</button>
          <button style={tabBtnStyle('create')} onClick={() => setTab('create')}>➕ เพิ่ม User</button>
          <button style={tabBtnStyle('code')} onClick={() => setTab('code')}>🔑 Export Code</button>
        </div>

        {/* ── Tab: Users ──────────────────────────────────────────────── */}
        {tab === 'users' && (
          <div>
            {loadingU ? (
              <p style={{ color:'#aaa', textAlign:'center' }}>⏳ กำลังโหลด...</p>
            ) : users.length === 0 ? (
              <p style={{ color:'#888', textAlign:'center' }}>ยังไม่มี user</p>
            ) : (
              users.map(u => (
                <div key={u.id} style={{ background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                  <div>
                    <span style={{ color:'#ff9a9e', fontWeight:600 }}>{u.username}</span>
                    {u.is_admin && <span style={{ marginLeft:'6px', fontSize:'0.65rem', background:'rgba(255,209,102,0.2)', color:'#ffd166', padding:'2px 6px', borderRadius:'4px' }}>ADMIN</span>}
                  </div>
                  <span style={{ background:'rgba(255,107,157,0.15)', color:'#ff9a9e', borderRadius:'6px', padding:'3px 8px', fontSize:'0.72rem' }}>Export: {u.exports_used}</span>
                </div>
              ))
            )}
            <button onClick={loadUsers} style={{ marginTop:'10px', width:'100%', padding:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#ccc', cursor:'pointer', fontFamily:'Mitr,sans-serif' }}>🔄 รีโหลด</button>
          </div>
        )}

        {/* ── Tab: Create User ────────────────────────────────────────── */}
        {tab === 'create' && (
          <div>
            <label style={{ color:'#c9a8e8', fontSize:'0.75rem', display:'block', marginBottom:'5px' }}>Username (ตัวเล็กทั้งหมด)</label>
            <input style={inpStyle} value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="เช่น nook2025" />
            <label style={{ color:'#c9a8e8', fontSize:'0.75rem', display:'block', marginBottom:'5px' }}>Password</label>
            <input style={inpStyle} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="รหัสผ่านที่จะให้ลูกค้า" type="text" />
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'4px' }}>
              <button style={btnStyle()} onClick={createUser}>➕ สร้าง User</button>
            </div>
            {createMsg && <p style={{ color: createMsg.startsWith('✅') ? '#52b788' : '#ff8080', fontSize:'0.8rem', marginTop:'12px' }}>{createMsg}</p>}
          </div>
        )}

        {/* ── Tab: Export Code ────────────────────────────────────────── */}
        {tab === 'code' && (
          <div>
            <label style={{ color:'#c9a8e8', fontSize:'0.75rem', display:'block', marginBottom:'5px' }}>Username ลูกค้า</label>
            <input style={inpStyle} value={codeFor} onChange={e => setCodeFor(e.target.value)} placeholder="username ของลูกค้า" />
            <label style={{ color:'#c9a8e8', fontSize:'0.75rem', display:'block', marginBottom:'5px' }}>หมดอายุใน</label>
            <select value={codeHrs} onChange={e => setCodeHrs(+e.target.value)} style={{ ...inpStyle, cursor:'pointer' }}>
              <option value={1}>1 ชั่วโมง</option>
              <option value={3}>3 ชั่วโมง</option>
              <option value={6}>6 ชั่วโมง</option>
              <option value={24}>24 ชั่วโมง</option>
            </select>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button style={btnStyle()} onClick={generateCode}>🎲 สร้าง Export Code</button>
            </div>

            {codeGen && (
              <div style={{ marginTop:'14px', background:'rgba(82,183,136,0.12)', border:'1px solid rgba(82,183,136,0.4)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
                <p style={{ color:'#aaa', fontSize:'0.75rem', margin:'0 0 6px' }}>รหัส Export สำหรับ "{codeFor}"</p>
                <p style={{ color:'#52b788', fontSize:'2rem', fontWeight:700, letterSpacing:'6px', margin:'0 0 8px', fontFamily:'monospace' }}>{codeGen}</p>
                <button onClick={() => navigator.clipboard.writeText(codeGen)} style={{ background:'rgba(82,183,136,0.15)', border:'1px solid rgba(82,183,136,0.35)', borderRadius:'6px', color:'#52b788', padding:'4px 12px', cursor:'pointer', fontFamily:'Mitr,sans-serif', fontSize:'0.75rem' }}>📋 คัดลอก</button>
              </div>
            )}
            {codeMsg && <p style={{ color: codeMsg.startsWith('✅') ? '#52b788' : '#ff8080', fontSize:'0.78rem', marginTop:'10px' }}>{codeMsg}</p>}

            {recentCodes.length > 0 && (
              <div style={{ marginTop:'18px' }}>
                <p style={{ color:'#777', fontSize:'0.72rem', marginBottom:'8px' }}>รหัสล่าสุด (20 อัน)</p>
                {recentCodes.map(c => (
                  <div key={c.code} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:'7px', background: c.used ? 'rgba(255,255,255,0.02)' : 'rgba(255,107,157,0.06)', marginBottom:'4px' }}>
                    <span style={{ fontFamily:'monospace', color: c.used ? '#555' : '#ff9a9e', fontWeight:700, fontSize:'0.9rem' }}>{c.code}</span>
                    <span style={{ fontSize:'0.7rem', color:'#777' }}>{c.username}</span>
                    <span style={{ fontSize:'0.68rem', padding:'2px 6px', borderRadius:'4px', background: c.used ? 'rgba(255,80,80,0.12)' : 'rgba(82,183,136,0.12)', color: c.used ? '#ff8080' : '#52b788' }}>{c.used ? 'ใช้แล้ว' : 'ว่าง'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
