import { useState, useEffect, useRef } from 'react';
import { THEMES, FONTS, ANIMATIONS, PAGE_EFFECTS, LAYOUTS, ELEMENT_TYPES, PAGE_TYPES, SWATCHES } from './constants.js';
import { generateHTML } from './htmlExporter.js';
import PageList from './components/PageList.jsx';
import ElementEditor from './components/ElementEditor.jsx';
import Preview from './components/Preview.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import LoginPage from './components/LoginPage.jsx';
import MobileLayout from './components/MobileLayout.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { supabase } from './supabase.js';
import { compressImage } from './utils/imageUtils.js';

// ── Export Modal ──────────────────────────────────────────────────────────────
const EXPORT_RATE_KEY = 'vb_export_rate';
const EXPORT_MAX_ATTEMPTS = 3;
const EXPORT_LOCKOUT_MS   = 4 * 60 * 1000;

function getExportRate() { try { return JSON.parse(localStorage.getItem(EXPORT_RATE_KEY) || '{}'); } catch { return {}; } }
function setExportRate(d) { localStorage.setItem(EXPORT_RATE_KEY, JSON.stringify(d)); }

function ExportModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [code,     setCode]     = useState('');
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [lockUntil, setLockUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const d = getExportRate();
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

  async function handleExport(e) {
    e.preventDefault();
    if (isLocked || busy || !code.trim()) return;
    setBusy(true); setError('');
    try {
      const codeKey = code.trim().toUpperCase();

      const { data: rec, error: fetchErr } = await supabase
        .from('export_codes')
        .select('*')
        .eq('code', codeKey)
        .single();

      if (fetchErr || !rec)          throw new Error('รหัสไม่ถูกต้อง');
      if (rec.used)                  throw new Error('รหัสนี้ถูกใช้แล้ว');
      if (rec.user_id !== user.id)   throw new Error('รหัสนี้ไม่ใช่ของคุณ');
      if (new Date(rec.expires_at) < new Date()) throw new Error('รหัสหมดอายุแล้ว');

      // Mark used + increment export count
      await supabase.from('export_codes').update({ used: true, used_at: new Date().toISOString() }).eq('code', codeKey);
      await supabase.from('profiles').update({ exports_used: (rec.exports_used || 0) + 1 }).eq('id', user.id);

      setExportRate({});
      onSuccess();
    } catch (err) {
      const d = getExportRate();
      const attempts = (d.attempts || 0) + 1;
      if (attempts >= EXPORT_MAX_ATTEMPTS) {
        const until = Date.now() + EXPORT_LOCKOUT_MS;
        setExportRate({ lockUntil: until });
        setLockUntil(until);
      } else {
        setExportRate({ attempts });
        setError(`${err.message} — เหลือ ${EXPORT_MAX_ATTEMPTS - attempts} ครั้ง`);
      }
    } finally { setBusy(false); }
  }

  const lockMin = Math.floor(remaining / 60);
  const lockSec = remaining % 60;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9998, fontFamily:'Mitr,sans-serif' }}>
      <div style={{ background:'#1a0a2e', border:'1px solid rgba(255,107,157,0.35)', borderRadius:'18px', padding:'32px', width:'100%', maxWidth:'360px', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
        <h3 style={{ color:'#ff9a9e', margin:'0 0 6px', fontSize:'1.1rem', textAlign:'center' }}>⬇️ Export HTML</h3>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.77rem', textAlign:'center', marginBottom:'22px' }}>
          กรอก Export Code ที่ได้รับ เพื่อดาวน์โหลด
        </p>

        {isLocked ? (
          <div style={{ textAlign:'center', padding:'16px', background:'rgba(255,80,80,0.1)', borderRadius:'12px' }}>
            <p style={{ color:'#ff8080', fontSize:'0.88rem' }}>🔒 ลองใหม่อีก</p>
            <p style={{ color:'#ff6060', fontSize:'1.4rem', fontWeight:700, fontFamily:'monospace' }}>
              {lockMin > 0 ? `${lockMin}:${String(lockSec).padStart(2,'0')}` : `${lockSec} วิ`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleExport}>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              style={{
                width:'100%', padding:'12px', textAlign:'center', letterSpacing:'6px',
                fontFamily:'monospace', fontSize:'1.4rem', fontWeight:700,
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,107,157,0.3)',
                borderRadius:'10px', color:'#f0d0ff', outline:'none',
                boxSizing:'border-box', marginBottom:'8px', textTransform:'uppercase',
              }}
            />
            {error && <p style={{ color:'#ff8080', fontSize:'0.75rem', textAlign:'center', marginBottom:'10px' }}>{error}</p>}
            <button type="submit" disabled={busy} style={{
              width:'100%', padding:'11px', background:'linear-gradient(135deg,#ff6b9d,#e63462)',
              border:'none', borderRadius:'10px', color:'#fff', fontFamily:'Mitr,sans-serif',
              fontSize:'0.95rem', fontWeight:600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
            }}>{busy ? '⏳ กำลังตรวจสอบ...' : '✅ ยืนยัน & Export'}</button>
          </form>
        )}

        <button onClick={onClose} style={{ marginTop:'12px', width:'100%', padding:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'8px', color:'#aaa', cursor:'pointer', fontFamily:'Mitr,sans-serif' }}>
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

function showToast(msg, duration = 2200) {
  const el = document.getElementById('global-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._tid);
  el._tid = setTimeout(() => el.classList.remove('show'), duration);
}

function getInitialTemplate() {
  return [
    {
      id: 'p1', name: '❤️ หน้าแรกเปิดตัว', theme: 'pink', layout: 'center',
      pageAnimation: 'fadeIn', pageEffect: 'hearts', pageEffectDensity: 50,
      elements: [
        { id: 'e1', type: 'sticker', emoji: '💖', fontSize: 60, animation: 'heartbeat' },
        { id: 'e2', type: 'heading', text: 'Happy Valentine Day', fontSize: 1.75, fontFamily: 'Mali', color: '#ff6b9d', animation: 'zoomIn' },
        { id: 'e3', type: 'subtext', text: 'ยินดีต้อนรับเข้าสู่เว็บไซต์แห่งความทรงจำของเรา\nมีของขวัญบางอย่างรออยู่ เปิดดูสิครับ ✨', fontSize: 1.0, fontFamily: 'Mitr', animation: 'slideUp', animDelay: 0.3 },
        { id: 'e4', type: 'button', label: 'เปิดของขวัญก้อนแรก 🎁', target: 'p2', animation: 'bounce', animDelay: 0.6 }
      ]
    },
    {
      id: 'p2', name: '❓ หน้าถามคำถามวัดใจ', theme: 'pink', layout: 'center',
      pageAnimation: 'zoomIn', pageEffect: 'stars', pageEffectDensity: 50,
      elements: [
        { id: 'e5', type: 'counter', question: 'วันวาเลนไทน์ปีนี้... ตกลงเธอรักเค้าไหม? 🥺', fontSize: 20, fontFamily: 'Mali', color: '#e63462', yesLabel: 'รักที่สุดเลยนะ 💚', noLabel: 'ไม่รักหรอก 🚫', yesTarget: 'p3', noBehavior: 'growYes', noMessages: ["คิดดีๆนะ 🥺", "เอ๊ะ! ลองกดใหม่จิ๊", "กดยังไงก็หนีไม่พ้นหรอก 😜", "งื้ออ กด YES เหอะน้า"] }
      ]
    },
    {
      id: 'p3', name: '💌 หน้าเปิดจดหมายลับ', theme: 'pink', layout: 'center',
      pageAnimation: 'slideUp', pageEffect: 'confetti', pageEffectDensity: 50,
      elements: [
        { id: 'e6', type: 'heading', text: 'เย้! ขอบคุณที่รักกันนะ 💖', fontSize: 1.5, fontFamily: 'Charm', color: '#ff6b9d' },
        { id: 'e8', type: 'button', label: '← กลับหน้าแรก', target: 'p1' }
      ]
    }
  ];
}

export default function App() {
  const { user, isAdmin, logout } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [pages, setPages] = useState(() => {
    try { const saved = localStorage.getItem('vb_pages_v5'); if (saved) return JSON.parse(saved); } catch(e) {}
    return getInitialTemplate();
  });

  const historyRef = useRef([]);
  const historyIdxRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const mountedRef = useRef(false);
  const counterIdRef = useRef(100);
  const iframeRef = useRef();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const cloudSaveTimerRef = useRef(null);
  const importJsonRef = useRef(null);
  const [activePageId, setActivePageId] = useState(() => {
    try {
      const saved = localStorage.getItem('vb_pages_v5');
      if (saved) { const ps = JSON.parse(saved); if (ps && ps.length > 0) return ps[0].id; }
    } catch(e) {}
    return 'p1';
  });
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('elements');
  const [editingElemId, setEditingElemId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPageType, setNewPageType] = useState('custom');
  const [newPageName, setNewPageName] = useState('');

  const activePage = pages.find(p => p.id === activePageId);
  const activeThemeObj = activePage ? (THEMES[activePage.theme] || THEMES.pink) : null;

  const selStyle = { width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,100,150,.2)', borderRadius:'7px', color:'#e8d0f0', fontFamily:'Mitr,sans-serif', fontSize:'0.8rem', padding:'6px 9px', outline:'none', cursor:'pointer' };
  const labelStyle = { display:'block', fontSize:'0.72rem', color:'#9a7aaa', marginBottom:'5px', fontWeight:'500' };

  useEffect(() => {
    if (!mountedRef.current) {
      historyRef.current = [JSON.parse(JSON.stringify(pages))];
      historyIdxRef.current = 0;
      mountedRef.current = true;
      return;
    }
    if (isUndoRedoRef.current) { isUndoRedoRef.current = false; return; }
    const newHistory = historyRef.current.slice(0, historyIdxRef.current + 1);
    newHistory.push(JSON.parse(JSON.stringify(pages)));
    if (newHistory.length > 50) newHistory.shift();
    historyRef.current = newHistory;
    historyIdxRef.current = newHistory.length - 1;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
    try { localStorage.setItem('vb_pages_v5', JSON.stringify(pages)); } catch(e) {}
    // ถ้ายังไม่ login → mark dirty (มีงานที่ยังไม่ได้ sync)
    if (!user) {
      try { localStorage.setItem('vb_dirty', '1'); } catch(e) {}
    }
    // Cloud save (debounced) เมื่อ login แล้ว
    if (user) {
      if (cloudSaveTimerRef.current) clearTimeout(cloudSaveTimerRef.current);
      cloudSaveTimerRef.current = setTimeout(async () => {
        try { await supabase.from('profiles').update({ pages_data: pages }).eq('id', user.id); } catch(e) {}
      }, 1500);
    }
  }, [pages, user]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); handleRedo(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // โหลดหน้าจาก Cloud เมื่อ login
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase.from('profiles').select('pages_data').eq('id', user.id).single();
        const cloudPages = data?.pages_data;
        const isDirty = localStorage.getItem('vb_dirty') === '1';

        if (isDirty) {
          // มีงานที่ทำก่อน login → อัปโหลด local ขึ้น cloud แทน
          try {
            await supabase.from('profiles').update({ pages_data: pages }).eq('id', user.id);
            localStorage.removeItem('vb_dirty');
            showToast('☁️ บันทึกงานของคุณขึ้น Cloud แล้ว');
          } catch(e) {}
        } else if (cloudPages && cloudPages.length > 0) {
          // ไม่มีงาน local → โหลด cloud มาใช้
          setPages(cloudPages);
          setActivePageId(cloudPages[0].id);
        }
      } catch(e) {}
    })();
  }, [user?.id]);

  useEffect(() => { setPreviewHtml(generateHTML(pages)); }, [pages]);

  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const win = iframeRef.current.contentWindow;
      if (win && typeof win.clearEffects === 'function') { try { win.clearEffects(); } catch(e) {} }
      const doc = iframeRef.current.contentDocument || win.document;
      doc.open(); doc.write(previewHtml); doc.close();
      if (win && typeof win.goTo === 'function') win.goTo(activePageId);
    }
  }, [previewHtml, activePageId]);

  function handleUndo() {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    isUndoRedoRef.current = true;
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current])));
    setCanUndo(historyIdxRef.current > 0); setCanRedo(true);
    showToast('↩️ Undo สำเร็จ');
  }

  function handleRedo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    isUndoRedoRef.current = true;
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current])));
    setCanUndo(true); setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
    showToast('↪️ Redo สำเร็จ');
  }

  const generateUid = () => 'p_' + Math.random().toString(36).substr(2, 9);
  const generateEid = () => 'e_' + (++counterIdRef.current);

  function updatePage(id, patch) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }

  function deletePage(id) {
    if (pages.length <= 1) { alert("จำเป็นต้องมีหน้าเว็บเหลืออยู่อย่างน้อย 1 หน้าครับ"); return; }
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหน้านี้?")) {
      const remaining = pages.filter(p => p.id !== id);
      setPages(remaining);
      if (activePageId === id) setActivePageId(remaining[0].id);
    }
  }

  function updateElement(pId, eId, patch) {
    const pg = pages.find(p => p.id === pId);
    if (!pg) return;
    updatePage(pId, { elements: pg.elements.map(el => el.id === eId ? { ...el, ...patch } : el) });
  }

  function deleteElement(pId, eId) {
    const pg = pages.find(p => p.id === pId);
    if (!pg) return;
    updatePage(pId, { elements: pg.elements.filter(el => el.id !== eId) });
    if (editingElemId === eId) setEditingElemId(null);
  }

  function createNewPage() {
    const pId = generateUid();
    const base = {
      id: pId,
      type: newPageType,
      name: newPageName.trim() || PAGE_TYPES.find(t => t.value === newPageType).label,
      theme: 'pink', layout: 'center', pageAnimation: 'fadeIn', pageEffect: 'none', pageEffectDensity: 50, elements: []
    };
    if (newPageType === 'question') base.elements = [{ id: generateEid(), type: 'counter', question: 'คุณจะยอมรับเป็นแฟนกับผมไหม? 💖', yesLabel: 'ตกลง 🥰', noLabel: 'เป็นแค่เพื่อน 🥹', noBehavior: 'growYes', noMessages: ["คิดใหม่สิ.."] }];
    else if (newPageType === 'gallery') base.elements = [{ id: generateEid(), type: 'heading', text: 'คลังภาพความทรงจำ 📸', fontSize: 1.5, fontFamily: 'Mali' }, { id: generateEid(), type: 'gallery', images: [], cols: 2 }];
    else if (newPageType === 'music') base.elements = [{ id: generateEid(), type: 'heading', text: 'เพลงนี้มอบให้เธอ 🎵', fontSize: 1.4, fontFamily: 'Itim' }, { id: generateEid(), type: 'vinyl', audioSrc: '' }];
    else base.elements = [{ id: generateEid(), type: 'heading', text: 'หน้าใหม่ ✨', fontSize: 1.8 }];
    setPages(prev => [...prev, base]);
    setActivePageId(pId);
    setNewPageName('');
    setShowAddModal(false);
  }

  function addElement(type) {
    if (!activePage) return;
    const freshNode = { id: generateEid(), type };
    if (type === 'heading') { freshNode.text = 'หัวข้อข้อความใหม่'; freshNode.fontSize = 1.8; }
    if (type === 'subtext') { freshNode.text = 'รายละเอียดข้อความ'; freshNode.fontSize = 1.0; }
    if (type === 'sticker') freshNode.emoji = '❤️';
    if (type === 'animated_sticker') { freshNode.stickerSrc = ''; freshNode.stickerSize = 120; }
    if (type === 'button') { freshNode.label = 'ปุ่มนำทาง'; freshNode.target = ''; }
    if (type === 'gift_buttons') { freshNode.gifts = [{icon:'🎁',label:'ของขวัญ 1',target:'',color:'#ff6b9d'}]; freshNode.iconSize = 48; }
    if (type === 'polaroid_gallery') { freshNode.photos = []; freshNode.cols = 2; }
    if (type === 'player') { freshNode.title = 'ชื่อเพลง'; freshNode.artist = ''; freshNode.coverSrc = ''; freshNode.audioSrc = ''; freshNode.size = 140; }
    if (type === 'counter') { freshNode.question = 'คุณรักฉันไหม?'; freshNode.yesLabel = 'รัก 💚'; freshNode.noLabel = 'ไม่รัก 🚫'; freshNode.noBehavior = 'runaway'; freshNode.reactionImages = ['','','','']; }
    updatePage(activePage.id, { elements: [...(activePage.elements || []), freshNode] });
    setEditingElemId(freshNode.id);
  }

  function handleElementDrop(targetIndex) {
    if (dragIdx === null || dragIdx === targetIndex) return;
    const reordered = [...(activePage.elements || [])];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIndex, 0, moved);
    updatePage(activePage.id, { elements: reordered });
    setDragIdx(null); setDragOverIdx(null);
  }

  function exportCompleteHTML() {
    const blob = new Blob([generateHTML(pages)], { type: 'text/html;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'our-valentine.html';
    a.click();
    showToast('✅ Export สำเร็จ! ดาวน์โหลดแล้ว');
  }

  function handleExportClick() {
    if (isAdmin) {
      // Admin export โดยตรงโดยไม่ต้องใช้ code
      exportCompleteHTML();
    } else {
      setShowExportModal(true);
    }
  }

  // ── Import / Export Project JSON ───────────────────────────────────────────
  function handleExportJSON() {
    const project = { version: 1, exportedAt: new Date().toISOString(), pages };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valentine-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.pages || !Array.isArray(data.pages)) throw new Error('ไฟล์ไม่ถูกต้อง');
        if (!window.confirm('📂 นำเข้าโปรเจกต์ "' + file.name + '"?\nงานปัจจุบันจะถูกแทนที่')) return;
        setPages(data.pages);
        setActivePageId(data.pages[0]?.id || null);
        setEditingElemId(null);
      } catch (err) { alert('❌ นำเข้าไม่สำเร็จ: ' + err.message); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  // ────────────────────────────────────────────────────────────────────────────

    const activeEditingElement = activePage ? (activePage.elements || []).find(e => e.id === editingElemId) : null;

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) return (
    <>
      <MobileLayout
        pages={pages}
        activePageId={activePageId}
        setActivePageId={setActivePageId}
        activePage={activePage}
        activeThemeObj={activeThemeObj}
        iframeRef={iframeRef}
        canUndo={canUndo}
        canRedo={canRedo}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        user={user}
        isAdmin={isAdmin}
        logout={logout}
        setShowLoginModal={setShowLoginModal}
        setShowAdminPanel={setShowAdminPanel}
        editingElemId={editingElemId}
        setEditingElemId={setEditingElemId}
        addElement={addElement}
        updateElement={updateElement}
        deleteElement={deleteElement}
        updatePage={updatePage}
        deletePage={deletePage}
        newPageType={newPageType}
        setNewPageType={setNewPageType}
        newPageName={newPageName}
        setNewPageName={setNewPageName}
        createNewPage={createNewPage}
        handleExportClick={handleExportClick}
      />
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onSuccess={() => { setShowExportModal(false); exportCompleteHTML(); }}
        />
      )}
      {showLoginModal && (
        <LoginPage isModal={true} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );

  return (
    <div id="root" style={{display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden'}}>
      {/* TOP BAR */}
      <div className="topbar">
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <span className="logo">💌 Valentine Builder Pro</span>
          <span className="version-badge">v6.0</span>
          <button className="btn-undo" onClick={handleUndo} disabled={!canUndo}>↩️ Undo</button>
          <button className="btn-undo" onClick={handleRedo} disabled={!canRedo}>↪️ Redo</button>
        </div>
        <div className="topbar-actions">
          {isAdmin && (
            <button className="btn-top" onClick={() => setShowAdminPanel(true)}
              style={{ background:'rgba(255,200,100,0.15)', border:'1px solid rgba(255,200,100,0.3)', color:'#ffd166' }}>
              ⚙️ Admin
            </button>
          )}
          {user ? (
            <>
              <input ref={importJsonRef} type="file" accept=".json" style={{display:'none'}} onChange={handleImportJSON} />
              <button className="btn-top" onClick={() => importJsonRef.current?.click()}
                style={{background:'rgba(100,200,255,0.12)',border:'1px solid rgba(100,200,255,0.3)',color:'#90e0ff'}}
                title="นำเข้าโปรเจกต์จากไฟล์ .json">📂 นำเข้า</button>
              <button className="btn-top" onClick={handleExportJSON}
                style={{background:'rgba(100,255,160,0.12)',border:'1px solid rgba(100,255,160,0.3)',color:'#90ffb8'}}
                title="บันทึกโปรเจกต์เป็นไฟล์ .json">💾 บันทึก</button>
              <button className="btn-top btn-export" onClick={handleExportClick}>⬇️ Export HTML</button>
              <button onClick={logout} title="ออกจากระบบ"
                style={{ padding:'6px 12px', background:'rgba(255,80,80,0.15)', border:'1px solid rgba(255,80,80,0.3)', borderRadius:'8px', color:'#ff8080', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Mitr,sans-serif' }}>
                🚪 ออก
              </button>
            </>
          ) : (
            <>
              <button className="btn-top btn-export" onClick={() => setShowLoginModal(true)}
                style={{ opacity:0.55, cursor:'pointer', position:'relative' }}
                title="กรุณาเข้าสู่ระบบก่อน Export">
                🔒 Export HTML
              </button>
              <button onClick={() => setShowLoginModal(true)}
                style={{ padding:'6px 14px', background:'linear-gradient(135deg,#ff6b9d,#e63462)', border:'none', borderRadius:'8px', color:'#fff', cursor:'pointer', fontSize:'0.8rem', fontFamily:'Mitr,sans-serif', fontWeight:600 }}>
                🔐 เข้าสู่ระบบ
              </button>
            </>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* LEFT: PAGE LIST */}
        <PageList
          pages={pages}
          activePageId={activePageId}
          onSelect={setActivePageId}
          onDelete={deletePage}
          onAdd={() => setShowAddModal(true)}
        />

        {/* CENTER: EDITOR */}
        <div className="panel-center">
          {activePage ? (
            <div style={{display:'flex', flexDirection:'column', height:'100%', overflow:'hidden'}}>
              <div className="editor-tabs">
                {['elements','layout','background','music','theme'].map(tab => (
                  <div key={tab} className={`editor-tab ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
                    {tab==='elements'?'🧩 วัตถุ':tab==='layout'?'📐 Layout':tab==='background'?'🖼️ พื้นหลัง':tab==='music'?'🎵 เพลง':'🎨 Theme'}
                  </div>
                ))}
              </div>

              <div className="editor-body">
                {/* TAB: ELEMENTS */}
                {activeTab === 'elements' && (
                  <div>
                    <div className="sec-header">🧩 วัตถุในหน้านี้</div>
                    <div className="elements-list">
                      {(activePage.elements || []).map((el, idx) => (
                        <div
                          key={el.id}
                          className={`element-item ${dragIdx===idx?'dragging':''} ${dragOverIdx===idx?'drag-over':''}`}
                          draggable
                          onDragStart={() => setDragIdx(idx)}
                          onDragOver={e => { e.preventDefault(); setDragOverIdx(idx); }}
                          onDrop={() => handleElementDrop(idx)}
                          onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                        >
                          <span className="element-drag-handle">⠿</span>
                          <span className="element-icon">{ELEMENT_TYPES.find(t=>t.type===el.type)?.icon||'📦'}</span>
                          <div className="element-info">
                            <div className="element-type">{el.type}</div>
                            <div className="element-val">{el.text||el.emoji||el.label||el.question||el.type}</div>
                          </div>
                          <div className="element-actions">
                            <button className={`element-edit-btn ${editingElemId===el.id?'active':''}`} onClick={() => setEditingElemId(editingElemId===el.id?null:el.id)}>✏️</button>
                            <button className="element-del" onClick={() => deleteElement(activePage.id, el.id)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {activeEditingElement && (
                      <ElementEditor
                        el={activeEditingElement}
                        themeObj={activeThemeObj}
                        pages={pages}
                        onUpdate={(patch) => updateElement(activePage.id, activeEditingElement.id, patch)}
                        onClose={() => setEditingElemId(null)}
                      />
                    )}

                    <div className="sec-header" style={{marginTop:14}}>➕ เพิ่มวัตถุใหม่</div>
                    <div className="add-elements">
                      {ELEMENT_TYPES.map(t => (
                        <button key={t.type} className="btn-elem" onClick={() => addElement(t.type)}>
                          {t.icon} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB: LAYOUT */}
                {activeTab === 'layout' && (
                  <div>
                    <div className="sec-header">📐 รูปแบบ Layout การจัดวาง</div>
                    <div className="layout-grid">
                      {LAYOUTS.map(l => (
                        <div key={l.id} className={`layout-opt ${activePage.layout===l.id?'selected':''}`} onClick={() => updatePage(activePage.id, {layout:l.id})}>
                          <div className="layout-icon">{l.icon}</div>
                          <div>{l.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="field">
                      <label style={labelStyle}>ความกว้าง Card (px)</label>
                      <input type="number" value={activePage.cardWidth||440} onChange={e=>updatePage(activePage.id,{cardWidth:+e.target.value})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none'}} />
                    </div>
                    <div className="field">
                      <label style={labelStyle}>Padding ภายใน Card (px)</label>
                      <input type="number" value={activePage.cardPadding??32} onChange={e=>updatePage(activePage.id,{cardPadding:+e.target.value})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none'}} />
                    </div>
                    <div className="field">
                      <label style={labelStyle}>ความโค้งมน Card (border-radius px)</label>
                      <input type="number" value={activePage.cardRadius??24} onChange={e=>updatePage(activePage.id,{cardRadius:+e.target.value})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none'}} />
                    </div>
                    <div className="sec-header" style={{marginTop:12}}>🎬 แอนิเมชันเมื่อเปิดหน้า</div>
                    <div className="anim-grid">
                      {ANIMATIONS.map(a => (
                        <div key={a.id} className={`anim-opt ${activePage.pageAnimation===a.id?'selected':''}`} onClick={() => updatePage(activePage.id, {pageAnimation:a.id})}>
                          {a.icon}<br/>{a.label}
                        </div>
                      ))}
                    </div>
                    <div className="sec-header" style={{marginTop:12}}>✨ เอฟเฟกต์พิเศษบนหน้า</div>
                    <div className="anim-grid">
                      {PAGE_EFFECTS.map(ef => (
                        <div key={ef.id} className={`anim-opt ${activePage.pageEffect===ef.id?'selected':''}`} onClick={() => updatePage(activePage.id, {pageEffect:ef.id})}>
                          {ef.icon}<br/>{ef.label}
                        </div>
                      ))}
                    </div>
                    <div className="field" style={{marginTop:10}}>
                      <label style={labelStyle}>ความหนาแน่นเอฟเฟกต์ ({activePage.pageEffectDensity??50}%)</label>
                      <input type="range" min="10" max="100" value={activePage.pageEffectDensity??50} onChange={e=>updatePage(activePage.id,{pageEffectDensity:+e.target.value})} style={{width:'100%'}} />
                    </div>
                  </div>
                )}

                {/* TAB: BACKGROUND */}
                {activeTab === 'background' && (
                  <div>
                    <div className="sec-header">🎨 สีพื้นหลังหน้าเว็บ</div>
                    <div className="field">
                      <label style={labelStyle}>สีพื้นหลังหลัก (Custom Bg Color)</label>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center',marginBottom:'8px'}}>
                        {SWATCHES.map(c=>(
                          <div key={c} className={`palette-swatch ${activePage.customBg===c?'active':''}`} style={{background:c}} onClick={()=>updatePage(activePage.id,{customBg:c})} />
                        ))}
                        <input type="color" value={activePage.customBg||'#fff0f3'} onChange={e=>updatePage(activePage.id,{customBg:e.target.value})} style={{width:'26px',height:'26px',padding:0,border:'none',cursor:'pointer',borderRadius:'50%'}} />
                      </div>
                    </div>
                    <div className="field">
                      <label style={labelStyle}>สีพื้นหลัง Card</label>
                      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',alignItems:'center'}}>
                        {SWATCHES.map(c=>(
                          <div key={c} className={`palette-swatch ${activePage.customCardBg===c?'active':''}`} style={{background:c}} onClick={()=>updatePage(activePage.id,{customCardBg:c})} />
                        ))}
                        <input type="color" value={activePage.customCardBg||'#ffffff'} onChange={e=>updatePage(activePage.id,{customCardBg:e.target.value})} style={{width:'26px',height:'26px',padding:0,border:'none',cursor:'pointer',borderRadius:'50%'}} />
                      </div>
                    </div>
                    <div className="field" style={{marginTop:10}}>
                      <label style={labelStyle}>🖼️ รูปพื้นหลังหน้า (Page BG Image)</label>
                      {(activePage.bgImage && activePage.bgImage.startsWith('data:') && activePage.bgImageFileName) ? (
                        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
                          <span style={{fontSize:'1.1rem'}}>🖼️</span>
                          <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activePage.bgImageFileName}</span>
                          <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px',fontFamily:'Mitr,sans-serif'}}>
                            เปลี่ยน
                            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;compressImage(f).then(compressed=>updatePage(activePage.id,{bgImage:compressed,bgImageFileName:f.name}));}} />
                          </label>
                          <button onClick={()=>updatePage(activePage.id,{bgImage:'',bgImageFileName:''})} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
                        </div>
                      ) : (
                        <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box',fontFamily:'Mitr,sans-serif'}}>
                          📂 เลือกรูปพื้นหลัง
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;compressImage(f).then(compressed=>updatePage(activePage.id,{bgImage:compressed,bgImageFileName:f.name}));}} />
                        </label>
                      )}
                      {!(activePage.bgImage && activePage.bgImage.startsWith('data:')) && (
                        <input value={activePage.bgImage||''} onChange={e=>updatePage(activePage.id,{bgImage:e.target.value,bgImageFileName:''})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none',marginBottom:'4px'}} placeholder="หรือวาง URL รูปภาพ..." />
                      )}
                      {activePage.bgImage && (
                        <>
                          <label style={labelStyle}>ความโปร่งใสรูปพื้นหลัง ({Math.round((activePage.bgOpacity??0.5)*100)}%)</label>
                          <input type="range" min="0" max="1" step="0.05" value={activePage.bgOpacity??0.5} onChange={e=>updatePage(activePage.id,{bgOpacity:+e.target.value})} style={{width:'100%'}} />
                          <label style={labelStyle}>ซูมรูปพื้นหลัง ({activePage.bgZoom||100}%)</label>
                          <input type="range" min="100" max="300" step="5" value={activePage.bgZoom||100} onChange={e=>updatePage(activePage.id,{bgZoom:+e.target.value})} style={{width:'100%'}} />
                        </>
                      )}
                    </div>
                    <div className="field" style={{marginTop:10}}>
                      <label style={labelStyle}>🖼️ รูปพื้นหลัง Card (Card BG Image)</label>
                      {(activePage.cardBgImage && activePage.cardBgImage.startsWith('data:') && activePage.cardBgImageFileName) ? (
                        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(107,157,255,0.1)',border:'1px solid rgba(107,157,255,0.4)',borderRadius:'8px'}}>
                          <span style={{fontSize:'1.1rem'}}>🖼️</span>
                          <span style={{flex:1,fontSize:'0.78rem',color:'#9ac0ff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activePage.cardBgImageFileName}</span>
                          <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px',fontFamily:'Mitr,sans-serif'}}>
                            เปลี่ยน
                            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;compressImage(f).then(compressed=>updatePage(activePage.id,{cardBgImage:compressed,cardBgImageFileName:f.name}));}} />
                          </label>
                          <button onClick={()=>updatePage(activePage.id,{cardBgImage:'',cardBgImageFileName:''})} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
                        </div>
                      ) : (
                        <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(107,157,255,0.08)',border:'2px dashed rgba(107,157,255,0.35)',borderRadius:'8px',color:'#9ac0ff',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box',fontFamily:'Mitr,sans-serif'}}>
                          📂 เลือกรูปพื้นหลัง Card
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;compressImage(f).then(compressed=>updatePage(activePage.id,{cardBgImage:compressed,cardBgImageFileName:f.name}));}} />
                        </label>
                      )}
                      {!(activePage.cardBgImage && activePage.cardBgImage.startsWith('data:')) && (
                        <input value={activePage.cardBgImage||''} onChange={e=>updatePage(activePage.id,{cardBgImage:e.target.value,cardBgImageFileName:''})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(100,150,255,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none',marginBottom:'4px'}} placeholder="หรือวาง URL รูปภาพ..." />
                      )}
                      {activePage.cardBgImage && (
                        <>
                          <label style={labelStyle}>ความโปร่งใส Card BG ({Math.round((activePage.cardBgOpacity??0.5)*100)}%)</label>
                          <input type="range" min="0" max="1" step="0.05" value={activePage.cardBgOpacity??0.5} onChange={e=>updatePage(activePage.id,{cardBgOpacity:+e.target.value})} style={{width:'100%'}} />
                          <label style={labelStyle}>ซูมรูปพื้นหลัง Card ({activePage.cardBgZoom||100}%)</label>
                          <input type="range" min="100" max="300" step="5" value={activePage.cardBgZoom||100} onChange={e=>updatePage(activePage.id,{cardBgZoom:+e.target.value})} style={{width:'100%'}} />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: MUSIC */}
                {activeTab === 'music' && (
                  <div>
                    <div className="sec-header">🎵 เพลงประกอบพื้นหลัง (BGM)</div>
                    <div className="field">
                      <p style={{fontSize:'0.7rem',color:'#9a7aaa',marginBottom:'10px',lineHeight:1.5}}>เพลงจะเล่นอัตโนมัติเมื่อผู้รับแตะหน้าจอครั้งแรก ไม่มีปุ่มใดๆ แสดงให้เห็น</p>
                      {/* อัปโหลดไฟล์ */}
                      {(activePage.bgMusic && activePage.bgMusic.startsWith('data:') && activePage.bgMusicFileName) ? (
                        <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
                          <span style={{fontSize:'1.1rem'}}>🎵</span>
                          <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activePage.bgMusicFileName}</span>
                          <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px',fontFamily:'Mitr,sans-serif'}}>
                            เปลี่ยน
                            <input type="file" accept="audio/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>updatePage(activePage.id,{bgMusic:ev.target.result,bgMusicFileName:f.name});r.readAsDataURL(f);}} />
                          </label>
                          <button onClick={()=>updatePage(activePage.id,{bgMusic:'',bgMusicFileName:''})} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
                        </div>
                      ) : (
                        <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box',fontFamily:'Mitr,sans-serif'}}>
                          📂 เลือกไฟล์เพลง BGM (.mp3 / .m4a)
                          <input type="file" accept="audio/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>updatePage(activePage.id,{bgMusic:ev.target.result,bgMusicFileName:f.name});r.readAsDataURL(f);}} />
                        </label>
                      )}
                      {!(activePage.bgMusic && activePage.bgMusic.startsWith('data:')) && (
                        <>
                          <label style={labelStyle}>หรือวาง URL เพลง (.mp3)</label>
                          <input value={activePage.bgMusic||''} onChange={e=>updatePage(activePage.id,{bgMusic:e.target.value,bgMusicFileName:''})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none',marginBottom:'4px'}} placeholder="https://example.com/music.mp3" />
                        </>
                      )}
                      {activePage.bgMusic && (
                        <div style={{marginTop:'10px'}}>
                          <label style={labelStyle}>⏱️ ช่วงเวลาที่เล่น (วินาที)</label>
                          <div style={{display:'flex',gap:'8px',alignItems:'flex-start'}}>
                            <div style={{flex:1}}>
                              <label style={{...labelStyle,fontSize:'0.68rem',marginBottom:'3px'}}>เริ่มที่ (วิ)</label>
                              <input type="number" min="0" step="1" value={activePage.bgMusicStart||0} onChange={e=>updatePage(activePage.id,{bgMusicStart:+e.target.value})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none'}} />
                            </div>
                            <div style={{flex:1}}>
                              <label style={{...labelStyle,fontSize:'0.68rem',marginBottom:'3px'}}>สิ้นสุด (วิ) — 0 = จนจบ</label>
                              <input type="number" min="0" step="1" value={activePage.bgMusicEnd||0} onChange={e=>updatePage(activePage.id,{bgMusicEnd:+e.target.value})} style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,100,150,.2)',borderRadius:'7px',color:'#e8d0f0',fontFamily:'Mitr,sans-serif',fontSize:'0.8rem',padding:'6px 9px',outline:'none'}} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: THEME */}
                {activeTab === 'theme' && (
                  <div>
                    <div className="sec-header">🎨 เลือกโทนสีหลัก (Theme)</div>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                      {Object.keys(THEMES).map(k => {
                        const th = THEMES[k];
                        return (
                          <div key={k} style={{padding:'10px',background:'rgba(255,255,255,0.03)',border:`1px solid ${activePage.theme===k?'#ff6b9d':'rgba(255,100,150,0.15)'}`,borderRadius:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}} onClick={() => updatePage(activePage.id, {theme:k})}>
                            <span style={{fontSize:'0.82rem',fontWeight:500,flex:1,color:'#e8d0f0'}}>{th.name}</span>
                            <div style={{display:'flex',gap:'4px'}}>
                              <div style={{width:'14px',height:'14px',borderRadius:'50%',background:th.bg,border:'1px solid #777'}}/>
                              <div style={{width:'14px',height:'14px',borderRadius:'50%',background:th.accent}}/>
                              <div style={{width:'14px',height:'14px',borderRadius:'50%',background:th.btn}}/>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{padding:'40px',textAlign:'center',color:'#4a3a5a'}}>กรุณาเลือกหรือเพิ่มหน้าเว็บใหม่จากเมนูด้านซ้าย</div>
          )}
        </div>

        {/* RIGHT: PREVIEW */}
        <Preview iframeRef={iframeRef} />
      </div>

      {/* MODAL: ADD PAGE */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>➕ เพิ่มหน้าสไลด์ใหม่</h3>
            <div className="field">
              <label>รูปแบบหน้าเทมเพลต</label>
              <select value={newPageType} onChange={e => setNewPageType(e.target.value)} style={{width:'100%',padding:'6px',background:'#2a1a34',color:'#fff',border:'1px solid rgba(255,100,150,0.3)',borderRadius:'6px'}}>
                {PAGE_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.icon} {pt.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>ชื่อหน้า</label>
              <input type="text" placeholder="เว้นว่างไว้เพื่อใช้ชื่ออัตโนมัติ" value={newPageName} onChange={e => setNewPageName(e.target.value)} style={{width:'100%',padding:'6px',background:'#2a1a34',color:'#fff',border:'1px solid rgba(255,100,150,0.3)',borderRadius:'6px'}} onKeyDown={e => e.key==='Enter' && createNewPage()} />
            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
              <button className="btn-confirm" onClick={createNewPage}>ตกลงสร้างหน้าใหม่</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onSuccess={() => { setShowExportModal(false); exportCompleteHTML(); }}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginPage isModal={true} onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
}
