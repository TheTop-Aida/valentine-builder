import { PAGE_TYPES } from '../constants.js';

export default function PageList({ pages, activePageId, onSelect, onDelete, onAdd }) {
  return (
    <div className="panel-left">
      <div className="panel-section">
        <div className="panel-label">📄 หน้าทั้งหมด ({pages.length})</div>
      </div>
      <div className="page-list">
        {pages.map(p => (
          <div
            key={p.id}
            className={`page-item ${p.id === activePageId ? 'active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <div className="page-item-name">{p.name}</div>
            <div className="page-item-type">{p.layout || 'center'} · {p.theme || 'pink'}</div>
            {pages.length > 1 && (
              <button
                className="page-del"
                onClick={e => { e.stopPropagation(); onDelete(p.id); }}
              >✕</button>
            )}
          </div>
        ))}
        <button className="btn-add-page" onClick={onAdd}>＋ เพิ่มหน้าใหม่</button>
      </div>
    </div>
  );
}
