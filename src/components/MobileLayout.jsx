import { useState, useEffect, useRef } from 'react';
import {
  ELEMENT_TYPES, THEMES, LAYOUTS, ANIMATIONS, PAGE_EFFECTS, SWATCHES, PAGE_TYPES,
} from '../constants.js';
import ElementEditor from './ElementEditor.jsx';
import { uploadAsset } from '../utils/storageUtils.js';

const F = 'Mitr,sans-serif';

const inp = (extra = {}) => ({
  width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,107,157,0.3)', borderRadius: '8px', color: '#f0d0ff',
  fontFamily: F, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
  marginBottom: '12px', ...extra,
});
const lbl = { display: 'block', fontSize: '0.73rem', color: '#9a7aaa', marginBottom: '4px', fontWeight: 500 };

export default function MobileLayout({
  pages, activePageId, setActivePageId, activePage, activeThemeObj,
  iframeRef,
  canUndo, canRedo, handleUndo, handleRedo,
  user, isAdmin, logout, setShowLoginModal, setShowAdminPanel,
  editingElemId, setEditingElemId,
  addElement, updateElement, deleteElement, updatePage, deletePage,
  newPageType, setNewPageType, newPageName, setNewPageName, createNewPage,
  handleExportClick,
}) {
  const [activeScreen, setActiveScreen] = useState('preview'); // preview | pages | settings
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('add'); // add | list | edit
  const [settingsTab, setSettingsTab] = useState('layout'); // layout | theme | bg | music
  const [showAddPage, setShowAddPage] = useState(false);

  // ── touch drag-to-reorder ──
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const listRef = useRef(null);

  function onGripStart(e, idx) {
    e.stopPropagation();
    setDragIdx(idx);
    setDropIdx(idx);
  }
  function onListMove(e) {
    if (dragIdx === null || !listRef.current) return;
    const t = e.touches[0];
    const rows = listRef.current.querySelectorAll('[data-rowidx]');
    let best = dropIdx; let bestDist = Infinity;
    rows.forEach(row => {
      const rect = row.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(t.clientY - mid);
      if (dist < bestDist) { bestDist = dist; best = parseInt(row.getAttribute('data-rowidx')); }
    });
    if (best !== dropIdx) setDropIdx(best);
  }
  function onListEnd() {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx && activePage) {
      const elems = [...(activePage.elements || [])];
      const [moved] = elems.splice(dragIdx, 1);
      elems.splice(dropIdx, 0, moved);
      updatePage(activePage.id, { elements: elems });
    }
    setDragIdx(null); setDropIdx(null);
  }

  const activeEditingElement = activePage
    ? (activePage.elements || []).find(e => e.id === editingElemId)
    : null;

  // รับ tap-to-edit จาก iframe
  useEffect(() => {
    function onMsg(e) {
      if (e.data?.type !== 'vb_tap_edit') return;
      const eid = e.data.eid;
      // ตรวจว่า element นี้อยู่ใน activePage ไหม
      const found = activePage && (activePage.elements || []).find(el => el.id === eid);
      if (!found) return;
      setEditingElemId(eid);
      setDrawerOpen(true);
      setDrawerTab('edit');
      setActiveScreen('preview');
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  function navTo(id) {
    if (id === 'edit') {
      if (drawerOpen && activeScreen === 'preview') { setDrawerOpen(false); }
      else { setDrawerOpen(true); setDrawerTab('add'); setActiveScreen('preview'); }
    } else if (id === 'export') {
      handleExportClick();
    } else {
      setActiveScreen(id);
      setDrawerOpen(false);
    }
  }

  const TOP_H = 46;
  const BOT_H = 58;

  return (
    <div style={{ fontFamily: F, background: '#0d0d1a' }}>

      {/* ── TOP BAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: TOP_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', background: 'rgba(18,6,36,0.97)', borderBottom: '1px solid rgba(255,107,157,0.2)', zIndex: 100 }}>
        <span style={{ color: '#ff9a9e', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.3px' }}>💌 Valentine Builder</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isAdmin && (
            <button onClick={() => setShowAdminPanel(true)} style={{ padding: '5px 9px', background: 'rgba(255,200,100,0.15)', border: '1px solid rgba(255,200,100,0.3)', borderRadius: '7px', color: '#ffd166', fontSize: '0.72rem', cursor: 'pointer', fontFamily: F }}>⚙️</button>
          )}
          <button onClick={handleUndo} disabled={!canUndo} style={{ padding: '5px 9px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: canUndo ? '#ccc' : '#3a3a3a', fontSize: '0.78rem', cursor: canUndo ? 'pointer' : 'default', fontFamily: F }}>↩</button>
          <button onClick={handleRedo} disabled={!canRedo} style={{ padding: '5px 9px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: canRedo ? '#ccc' : '#3a3a3a', fontSize: '0.78rem', cursor: canRedo ? 'pointer' : 'default', fontFamily: F }}>↪</button>
          {user ? (
            <button onClick={logout} style={{ padding: '5px 9px', background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '7px', color: '#ff8080', fontSize: '0.72rem', cursor: 'pointer', fontFamily: F }}>🚪</button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} style={{ padding: '5px 10px', background: 'linear-gradient(135deg,#ff6b9d,#e63462)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '0.72rem', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>🔐 Login</button>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{ position: 'fixed', top: TOP_H, left: 0, right: 0, bottom: BOT_H, overflow: 'hidden' }}>

        {/* PREVIEW SCREEN */}
        <div style={{ width: '100%', height: '100%', display: activeScreen === 'preview' ? 'flex' : 'none', flexDirection: 'column', position: 'relative' }}>
          <iframe
            ref={iframeRef}
            style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
            title="preview"
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Page indicator dots */}
          {pages.length > 1 && (
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 5, pointerEvents: 'auto' }}>
              {pages.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActivePageId(p.id)}
                  style={{ width: p.id === activePageId ? '18px' : '7px', height: '7px', borderRadius: '4px', background: p.id === activePageId ? '#ff6b9d' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: p.id === activePageId ? '0 0 6px #ff6b9d' : 'none' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGES SCREEN */}
        {activeScreen === 'pages' && (
          <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '14px', fontSize: '0.9rem' }}>📑 จัดการหน้าเว็บ ({pages.length} หน้า)</div>
            {pages.map((p, idx) => (
              <div
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: p.id === activePageId ? 'rgba(255,107,157,0.14)' : 'rgba(255,255,255,0.05)', border: `1px solid ${p.id === activePageId ? 'rgba(255,107,157,0.5)' : 'rgba(255,255,255,0.09)'}`, borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => { setActivePageId(p.id); setActiveScreen('preview'); }}
              >
                <span style={{ color: '#666', fontSize: '0.7rem', minWidth: '18px', textAlign: 'center' }}>{idx + 1}</span>
                <span style={{ flex: 1, color: p.id === activePageId ? '#ff9a9e' : '#f0d0ff', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: p.id === activePageId ? 600 : 400 }}>{p.name}</span>
                {p.id === activePageId && <span style={{ fontSize: '0.65rem', background: 'rgba(255,107,157,0.2)', color: '#ff9a9e', padding: '2px 7px', borderRadius: '5px' }}>active</span>}
                <button
                  onClick={e => { e.stopPropagation(); deletePage(p.id); }}
                  style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '1rem', cursor: 'pointer', padding: '3px 5px', lineHeight: 1 }}
                >✕</button>
              </div>
            ))}
            <button
              onClick={() => setShowAddPage(true)}
              style={{ width: '100%', padding: '13px', background: 'rgba(255,107,157,0.08)', border: '2px dashed rgba(255,107,157,0.4)', borderRadius: '12px', color: '#ff9a9e', fontSize: '0.85rem', cursor: 'pointer', fontFamily: F, marginTop: '4px' }}
            >➕ เพิ่มหน้าใหม่</button>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {activeScreen === 'settings' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,107,157,0.2)', flexShrink: 0, overflowX: 'auto' }}>
              {[['layout', '📐 Layout'], ['theme', '🎨 Theme'], ['bg', '🖼️ พื้นหลัง'], ['music', '🎵 เพลง']].map(([id, label]) => (
                <div key={id} onClick={() => setSettingsTab(id)} style={{ padding: '11px 16px', fontSize: '0.78rem', color: settingsTab === id ? '#ff9a9e' : '#666', borderBottom: settingsTab === id ? '2px solid #ff6b9d' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: F, flexShrink: 0 }}>
                  {label}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {!activePage ? (
                <div style={{ color: '#555', textAlign: 'center', padding: '40px 20px', fontSize: '0.85rem' }}>กรุณาเลือกหน้าก่อน</div>
              ) : settingsTab === 'layout' ? (
                <SettingsLayout activePage={activePage} updatePage={updatePage} />
              ) : settingsTab === 'theme' ? (
                <SettingsTheme activePage={activePage} updatePage={updatePage} />
              ) : settingsTab === 'bg' ? (
                <SettingsBg activePage={activePage} updatePage={updatePage} />
              ) : (
                <SettingsMusic activePage={activePage} updatePage={updatePage} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── DRAWER OVERLAY ── */}
      {drawerOpen && activeScreen === 'preview' && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 40 }}
            onClick={() => setDrawerOpen(false)}
          />
          <div style={{ position: 'fixed', bottom: BOT_H, left: 0, right: 0, height: '66vh', background: '#16072a', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,107,157,0.3)', borderBottom: 'none', zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div style={{ width: '38px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.18)' }} />
            </div>
            {/* Drawer tabs */}
            <div style={{ display: 'flex', padding: '0 14px', gap: '8px', marginBottom: '10px', flexShrink: 0 }}>
              {[['add', '➕ เพิ่มใหม่'], ['list', '📋 รายการ'], ['edit', '✏️ แก้ไข']].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setDrawerTab(id)}
                  style={{ flex: 1, padding: '8px 4px', background: drawerTab === id ? 'linear-gradient(135deg,#ff6b9d,#e63462)' : 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', fontFamily: F, fontWeight: drawerTab === id ? 700 : 400, transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Drawer content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 16px', WebkitOverflowScrolling: 'touch' }}>
              {/* ADD TAB */}
              {drawerTab === 'add' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {ELEMENT_TYPES.map(t => (
                    <button
                      key={t.type}
                      onClick={() => {
                        addElement(t.type);
                        setDrawerTab('edit');
                      }}
                      style={{ padding: '11px 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,107,157,0.2)', borderRadius: '11px', color: '#e8d0f0', fontSize: '0.78rem', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: '7px', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{t.icon}</span>
                      <span style={{ lineHeight: 1.3 }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* LIST TAB */}
              {drawerTab === 'list' && (
                <div
                  ref={listRef}
                  onTouchMove={onListMove}
                  onTouchEnd={onListEnd}
                  onTouchCancel={onListEnd}
                >
                  {activePage && (activePage.elements || []).length === 0 ? (
                    <div style={{ color: '#555', textAlign: 'center', padding: '32px 20px', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>🧩</div>
                      ยังไม่มีวัตถุในหน้านี้<br />กด <strong style={{ color: '#ff9a9e' }}>➕ เพิ่มใหม่</strong> เพื่อเริ่มต้น
                    </div>
                  ) : (
                    (activePage?.elements || []).map((el, idx) => {
                      const isDragging = dragIdx === idx;
                      const isDropTarget = dropIdx === idx && dragIdx !== null && dragIdx !== idx;
                      const dropAbove = isDropTarget && dragIdx > idx;
                      const dropBelow = isDropTarget && dragIdx < idx;
                      return (
                        <div
                          key={el.id}
                          data-rowidx={idx}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '9px',
                            padding: '10px 12px',
                            background: isDragging ? 'rgba(255,107,157,0.22)' : editingElemId === el.id ? 'rgba(255,107,157,0.14)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isDragging ? 'rgba(255,107,157,0.6)' : editingElemId === el.id ? 'rgba(255,107,157,0.45)' : 'rgba(255,255,255,0.08)'}`,
                            borderTop: dropAbove ? '3px solid #ff6b9d' : undefined,
                            borderBottom: dropBelow ? '3px solid #ff6b9d' : undefined,
                            borderRadius: '11px', marginBottom: '6px',
                            opacity: isDragging ? 0.65 : 1,
                            transform: isDragging ? 'scale(0.97)' : 'none',
                            transition: 'transform 0.1s, opacity 0.1s',
                          }}
                        >
                          {/* GRIP HANDLE */}
                          <div
                            onTouchStart={e => onGripStart(e, idx)}
                            style={{ padding: '6px 3px', color: '#555', fontSize: '1rem', lineHeight: 1, touchAction: 'none', userSelect: 'none', flexShrink: 0, cursor: 'grab' }}
                          >☰</div>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{ELEMENT_TYPES.find(t => t.type === el.type)?.icon || '📦'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#f0d0ff', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.text || el.emoji || el.label || el.question || el.type}</div>
                            <div style={{ color: '#666', fontSize: '0.67rem', marginTop: '2px' }}>{el.type}</div>
                          </div>
                          <button
                            onClick={() => { setEditingElemId(editingElemId === el.id ? null : el.id); setDrawerTab('edit'); }}
                            style={{ padding: '4px 9px', background: 'rgba(255,107,157,0.15)', border: '1px solid rgba(255,107,157,0.35)', borderRadius: '7px', color: '#ff9a9e', fontSize: '0.72rem', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}
                          >✏️</button>
                          <button
                            onClick={() => deleteElement(activePage.id, el.id)}
                            style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.9rem', cursor: 'pointer', padding: '3px 4px', lineHeight: 1, flexShrink: 0 }}
                          >✕</button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* EDIT TAB */}
              {drawerTab === 'edit' && (
                <div>
                  {activeEditingElement ? (
                    <ElementEditor
                      el={activeEditingElement}
                      themeObj={activeThemeObj}
                      pages={pages}
                      onUpdate={patch => updateElement(activePage.id, activeEditingElement.id, patch)}
                      onClose={() => setEditingElemId(null)}
                    />
                  ) : (
                    <div style={{ color: '#555', textAlign: 'center', padding: '32px 20px', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>✏️</div>
                      ยังไม่ได้เลือกวัตถุ<br />ไปที่ <strong style={{ color: '#ff9a9e' }}>📋 รายการ</strong> แล้วกด ✏️ เพื่อแก้ไข
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── BOTTOM NAVIGATION ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: BOT_H, display: 'flex', background: 'rgba(10,2,20,0.98)', borderTop: '1px solid rgba(255,107,157,0.18)', zIndex: 100 }}>
        {[
          { id: 'preview', icon: '👁️', label: 'Preview' },
          { id: 'pages',   icon: '📑', label: 'หน้า' },
          { id: 'edit',    icon: '✏️', label: 'แก้ไข', special: true },
          { id: 'settings',icon: '⚙️', label: 'ตั้งค่า' },
          { id: 'export',  icon: user ? '⬇️' : '🔒', label: 'Export', special: true },
        ].map(({ id, icon, label, special }) => {
          const isActive = !special
            ? (activeScreen === id)
            : (id === 'edit' && drawerOpen);
          return (
            <button
              key={id}
              onClick={() => navTo(id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', transition: 'opacity 0.1s' }}
            >
              <span style={{ fontSize: '1.35rem', lineHeight: 1, filter: isActive ? 'none' : 'grayscale(60%) opacity(0.55)' }}>{icon}</span>
              <span style={{ fontSize: '0.6rem', fontFamily: F, color: isActive ? '#ff9a9e' : '#555', fontWeight: isActive ? 600 : 400 }}>{label}</span>
              {isActive && !special && <div style={{ width: '16px', height: '2px', background: '#ff6b9d', borderRadius: '1px', position: 'absolute', bottom: '6px' }} />}
            </button>
          );
        })}
      </div>

      {/* ── ADD PAGE MODAL ── */}
      {showAddPage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }} onClick={() => setShowAddPage(false)}>
          <div style={{ width: '100%', background: '#1a0a2e', borderRadius: '20px 20px 0 0', padding: '24px', boxSizing: 'border-box', border: '1px solid rgba(255,107,157,0.3)', borderBottom: 'none' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>➕ เพิ่มหน้าใหม่</div>
            <label style={lbl}>รูปแบบหน้า</label>
            <select value={newPageType} onChange={e => setNewPageType(e.target.value)} style={inp({ cursor: 'pointer' })}>
              {PAGE_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.icon} {pt.label}</option>)}
            </select>
            <label style={lbl}>ชื่อหน้า</label>
            <input value={newPageName} onChange={e => setNewPageName(e.target.value)} placeholder="เว้นว่างเพื่อใช้ชื่ออัตโนมัติ" style={inp()} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddPage(false)} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9px', color: '#aaa', cursor: 'pointer', fontFamily: F }}>ยกเลิก</button>
              <button onClick={() => { createNewPage(); setShowAddPage(false); }} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#ff6b9d,#e63462)', border: 'none', borderRadius: '9px', color: '#fff', cursor: 'pointer', fontFamily: F, fontWeight: 700 }}>✅ สร้างหน้า</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Settings sub-panels ─────────────────── */

function SettingsLayout({ activePage, updatePage }) {
  const id = activePage.id;
  return (
    <div>
      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>📐 Layout</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
        {LAYOUTS.map(l => (
          <div key={l.id} onClick={() => updatePage(id, { layout: l.id })} style={{ padding: '10px 8px', background: activePage.layout === l.id ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activePage.layout === l.id ? '#ff6b9d' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', color: activePage.layout === l.id ? '#ff9a9e' : '#bbb', fontSize: '0.78rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '3px' }}>{l.icon}</div>
            {l.label}
          </div>
        ))}
      </div>

      <label style={lbl}>ความกว้าง Card (px)</label>
      <input type="number" value={activePage.cardWidth || 440} onChange={e => updatePage(id, { cardWidth: +e.target.value })} style={inp()} />

      <label style={lbl}>Padding ภายใน Card (px)</label>
      <input type="number" value={activePage.cardPadding ?? 32} onChange={e => updatePage(id, { cardPadding: +e.target.value })} style={inp()} />

      <label style={lbl}>ความโค้งมน Card (px)</label>
      <input type="number" value={activePage.cardRadius ?? 24} onChange={e => updatePage(id, { cardRadius: +e.target.value })} style={inp()} />

      <div style={{ color: '#ff9a9e', fontWeight: 600, margin: '14px 0 10px', fontSize: '0.85rem' }}>🎬 แอนิเมชันเปิดหน้า</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '14px' }}>
        {ANIMATIONS.map(a => (
          <div key={a.id} onClick={() => updatePage(id, { pageAnimation: a.id })} style={{ padding: '8px 4px', background: activePage.pageAnimation === a.id ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activePage.pageAnimation === a.id ? '#ff6b9d' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: activePage.pageAnimation === a.id ? '#ff9a9e' : '#999', fontSize: '0.68rem' }}>
            <div style={{ fontSize: '1.1rem' }}>{a.icon}</div>
            {a.label}
          </div>
        ))}
      </div>

      <div style={{ color: '#ff9a9e', fontWeight: 600, margin: '14px 0 10px', fontSize: '0.85rem' }}>✨ เอฟเฟกต์พิเศษ</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '12px' }}>
        {PAGE_EFFECTS.map(ef => (
          <div key={ef.id} onClick={() => updatePage(id, { pageEffect: ef.id })} style={{ padding: '8px 4px', background: activePage.pageEffect === ef.id ? 'rgba(255,107,157,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activePage.pageEffect === ef.id ? '#ff6b9d' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: activePage.pageEffect === ef.id ? '#ff9a9e' : '#999', fontSize: '0.68rem' }}>
            <div style={{ fontSize: '1.1rem' }}>{ef.icon}</div>
            {ef.label}
          </div>
        ))}
      </div>
      <label style={lbl}>ความหนาแน่นเอฟเฟกต์ ({activePage.pageEffectDensity ?? 50}%)</label>
      <input type="range" min="10" max="100" value={activePage.pageEffectDensity ?? 50} onChange={e => updatePage(id, { pageEffectDensity: +e.target.value })} style={{ width: '100%' }} />
    </div>
  );
}

function SettingsTheme({ activePage, updatePage }) {
  return (
    <div>
      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>🎨 โทนสี (Theme)</div>
      {Object.keys(THEMES).map(k => {
        const th = THEMES[k];
        const selected = activePage.theme === k;
        return (
          <div key={k} onClick={() => updatePage(activePage.id, { theme: k })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: selected ? 'rgba(255,107,157,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selected ? '#ff6b9d' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: selected ? '#ff9a9e' : '#e8d0f0', fontWeight: selected ? 600 : 400 }}>{th.name}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[th.bg, th.accent, th.btn].map((c, i) => <div key={i} style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsBg({ activePage, updatePage }) {
  const id = activePage.id;
  return (
    <div>
      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>🎨 สีพื้นหลัง</div>
      <label style={lbl}>สีหน้า (Page BG)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
        {SWATCHES.map(c => <div key={c} onClick={() => updatePage(id, { customBg: c })} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, cursor: 'pointer', border: activePage.customBg === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', boxSizing: 'border-box' }} />)}
        <input type="color" value={activePage.customBg || '#fff0f3'} onChange={e => updatePage(id, { customBg: e.target.value })} style={{ width: '26px', height: '26px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '50%' }} />
      </div>
      <label style={lbl}>สี Card</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', alignItems: 'center' }}>
        {SWATCHES.map(c => <div key={c} onClick={() => updatePage(id, { customCardBg: c })} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, cursor: 'pointer', border: activePage.customCardBg === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)', boxSizing: 'border-box' }} />)}
        <input type="color" value={activePage.customCardBg || '#ffffff'} onChange={e => updatePage(id, { customCardBg: e.target.value })} style={{ width: '26px', height: '26px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '50%' }} />
      </div>

      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '10px', fontSize: '0.85rem' }}>🖼️ รูปพื้นหลังหน้า</div>
      {activePage.bgImage && activePage.bgImage.startsWith('http') && activePage.bgImageFileName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.4)', borderRadius: '8px', marginBottom: '10px' }}>
          <span>🖼️</span>
          <span style={{ flex: 1, fontSize: '0.78rem', color: '#ff9a9e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.bgImageFileName}</span>
          <label style={{ fontSize: '0.72rem', color: '#ccc', cursor: 'pointer', padding: '3px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', fontFamily: F }}>
            เปลี่ยน<input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'images'); if (url) updatePage(id, { bgImage: url, bgImageFileName: f.name }); }} />
          </label>
          <button onClick={() => updatePage(id, { bgImage: '', bgImageFileName: '' })} style={{ background: 'none', border: 'none', color: '#ff8080', cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: 'rgba(255,107,157,0.08)', border: '2px dashed rgba(255,107,157,0.4)', borderRadius: '8px', color: '#ff9a9e', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box', fontFamily: F, marginBottom: '10px' }}>
          📂 เลือกรูปพื้นหลัง<input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'images'); if (url) updatePage(id, { bgImage: url, bgImageFileName: f.name }); }} />
        </label>
      )}
      {activePage.bgImage && (
        <>
          <label style={lbl}>ความโปร่งใส ({Math.round((activePage.bgOpacity ?? 0.5) * 100)}%)</label>
          <input type="range" min="0" max="1" step="0.05" value={activePage.bgOpacity ?? 0.5} onChange={e => updatePage(id, { bgOpacity: +e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
          <label style={lbl}>ซูม ({activePage.bgZoom || 100}%)</label>
          <input type="range" min="100" max="300" step="5" value={activePage.bgZoom || 100} onChange={e => updatePage(id, { bgZoom: +e.target.value })} style={{ width: '100%', marginBottom: '14px' }} />
        </>
      )}

      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '10px', fontSize: '0.85rem' }}>🖼️ รูปพื้นหลัง Card</div>
      {activePage.cardBgImage && activePage.cardBgImage.startsWith('http') && activePage.cardBgImageFileName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(107,157,255,0.1)', border: '1px solid rgba(107,157,255,0.4)', borderRadius: '8px', marginBottom: '10px' }}>
          <span>🖼️</span>
          <span style={{ flex: 1, fontSize: '0.78rem', color: '#9ac0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.cardBgImageFileName}</span>
          <label style={{ fontSize: '0.72rem', color: '#ccc', cursor: 'pointer', padding: '3px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', fontFamily: F }}>
            เปลี่ยน<input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'images'); if (url) updatePage(id, { cardBgImage: url, cardBgImageFileName: f.name }); }} />
          </label>
          <button onClick={() => updatePage(id, { cardBgImage: '', cardBgImageFileName: '' })} style={{ background: 'none', border: 'none', color: '#ff8080', cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: 'rgba(107,157,255,0.08)', border: '2px dashed rgba(107,157,255,0.35)', borderRadius: '8px', color: '#9ac0ff', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box', fontFamily: F, marginBottom: '10px' }}>
          📂 เลือกรูปพื้นหลัง Card<input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'images'); if (url) updatePage(id, { cardBgImage: url, cardBgImageFileName: f.name }); }} />
        </label>
      )}
      {activePage.cardBgImage && (
        <>
          <label style={lbl}>ความโปร่งใส Card BG ({Math.round((activePage.cardBgOpacity ?? 0.5) * 100)}%)</label>
          <input type="range" min="0" max="1" step="0.05" value={activePage.cardBgOpacity ?? 0.5} onChange={e => updatePage(id, { cardBgOpacity: +e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
          <label style={lbl}>ซูม Card BG ({activePage.cardBgZoom || 100}%)</label>
          <input type="range" min="100" max="300" step="5" value={activePage.cardBgZoom || 100} onChange={e => updatePage(id, { cardBgZoom: +e.target.value })} style={{ width: '100%' }} />
        </>
      )}
    </div>
  );
}

function SettingsMusic({ activePage, updatePage }) {
  const id = activePage.id;
  return (
    <div>
      <div style={{ color: '#ff9a9e', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem' }}>🎵 เพลงพื้นหลัง (BGM)</div>
      <p style={{ fontSize: '0.72rem', color: '#7a5a8a', marginBottom: '12px', lineHeight: 1.5 }}>เพลงจะเล่นอัตโนมัติเมื่อผู้รับแตะหน้าจอครั้งแรก</p>
      {activePage.bgMusic && activePage.bgMusic.startsWith('http') && activePage.bgMusicFileName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,107,157,0.1)', border: '1px solid rgba(255,107,157,0.4)', borderRadius: '8px', marginBottom: '12px' }}>
          <span>🎵</span>
          <span style={{ flex: 1, fontSize: '0.78rem', color: '#ff9a9e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.bgMusicFileName}</span>
          <label style={{ fontSize: '0.72rem', color: '#ccc', cursor: 'pointer', padding: '3px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', fontFamily: F }}>
            เปลี่ยน<input type="file" accept="audio/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'audio'); if (url) updatePage(id, { bgMusic: url, bgMusicFileName: f.name }); }} />
          </label>
          <button onClick={() => updatePage(id, { bgMusic: '', bgMusicFileName: '' })} style={{ background: 'none', border: 'none', color: '#ff8080', cursor: 'pointer' }}>✕</button>
        </div>
      ) : (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '10px', background: 'rgba(255,107,157,0.08)', border: '2px dashed rgba(255,107,157,0.4)', borderRadius: '8px', color: '#ff9a9e', fontSize: '0.8rem', cursor: 'pointer', boxSizing: 'border-box', fontFamily: F, marginBottom: '10px' }}>
          🎵 เลือกไฟล์เพลง (.mp3 / .m4a)<input type="file" accept="audio/*" style={{ display: 'none' }} onChange={async e => { const f = e.target.files[0]; if (!f) return; const url = await uploadAsset(f, 'audio'); if (url) updatePage(id, { bgMusic: url, bgMusicFileName: f.name }); }} />
        </label>
      )}
      {!(activePage.bgMusic && activePage.bgMusic.startsWith('http')) && (
        <>
          <label style={lbl}>หรือวาง URL เพลง (.mp3)</label>
          <input value={activePage.bgMusic || ''} onChange={e => updatePage(id, { bgMusic: e.target.value, bgMusicFileName: '' })} placeholder="https://example.com/music.mp3" style={inp()} />
        </>
      )}
      {activePage.bgMusic && (
        <div style={{ marginTop: '4px' }}>
          <label style={lbl}>เริ่มเล่นที่ (วินาที)</label>
          <input type="number" min="0" value={activePage.bgMusicStart || 0} onChange={e => updatePage(id, { bgMusicStart: +e.target.value })} style={inp()} />
          <label style={lbl}>หยุดที่ (วินาที) — 0 = จนจบ</label>
          <input type="number" min="0" value={activePage.bgMusicEnd || 0} onChange={e => updatePage(id, { bgMusicEnd: +e.target.value })} style={inp()} />
        </div>
      )}
    </div>
  );
}
