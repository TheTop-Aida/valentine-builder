import { STICKERS, FONTS, ANIMATIONS, SWATCHES } from '../constants.js';

// แปลง Google Drive URL ทุกรูปแบบเป็น direct stream URL
function parseDriveUrl(val) {
  // รูปแบบ: /file/d/FILE_ID/view หรือ /file/d/FILE_ID/
  const fileMatch = val.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  // รูปแบบ: open?id=FILE_ID
  const openMatch = val.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  // รูปแบบ: uc?id=FILE_ID (มีอยู่แล้ว แต่ยังไม่มี export)
  const ucMatch = val.match(/drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return `https://drive.google.com/uc?export=download&id=${ucMatch[1]}`;
  return null;
}

export default function ElementEditor({ el, themeObj, pages, onUpdate, onClose }) {
  const inputStyle = { width:'100%', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,100,150,.2)', borderRadius:'7px', color:'#e8d0f0', fontFamily:'Mitr,sans-serif', fontSize:'0.8rem', padding:'6px 9px', outline:'none', marginBottom:'8px' };
  const selStyle = { ...inputStyle, cursor:'pointer' };
  const labelStyle = { display:'block', fontSize:'0.68rem', color:'#9a7aaa', marginBottom:'4px', fontWeight:'500' };
  const upd = (patch) => onUpdate(patch);

  return (
    <div className="elem-edit-panel">
      <div className="elem-edit-title">
        <span>✏️ ตั้งค่าวัตถุละเอียด ({el.type.toUpperCase()})</span>
        <button className="btn-close-edit" onClick={onClose}>✕</button>
      </div>

      {(el.type === 'heading' || el.type === 'subtext') && (
        <div className="field">
          <label style={labelStyle}>ข้อความตัวอักษร</label>
          <textarea value={el.text || ''} onChange={e => upd({ text: e.target.value })} style={inputStyle} rows={3} placeholder="พิมพ์ข้อความที่นี่..." />
        </div>
      )}

      {el.type === 'image' && (
        <div>
          <label style={labelStyle}>📁 อัปโหลดรูปจากเครื่อง หรือ URL</label>
          <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer'}}>
            🖼️ เลือกรูปภาพจากเครื่อง
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>upd({src:ev.target.result});reader.readAsDataURL(file);}} />
          </label>
          {el.src && el.src.startsWith('data:') && (
            <div style={{marginBottom:'8px',borderRadius:'8px',overflow:'hidden',border:'1px solid rgba(255,107,157,0.2)'}}>
              <img src={el.src} style={{width:'100%',maxHeight:'120px',objectFit:'cover',display:'block'}} alt="preview" />
            </div>
          )}
          <input value={el.src && el.src.startsWith('data:') ? '(รูปจากเครื่อง ✓)' : (el.src||'')} onChange={e=>upd({src:e.target.value})} style={inputStyle} placeholder="https://example.com/photo.jpg" readOnly={!!(el.src && el.src.startsWith('data:'))} />
          {el.src && el.src.startsWith('data:') && (
            <button onClick={()=>upd({src:''})} style={{width:'100%',padding:'5px',marginBottom:'8px',background:'rgba(255,80,80,0.15)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:'6px',color:'#ff8080',fontSize:'0.75rem',cursor:'pointer',fontFamily:'Mitr,sans-serif'}}>✕ ลบรูปนี้ออก</button>
          )}
          <label style={labelStyle}>ความกว้างรูปภาพ (px)</label>
          <input type="number" value={el.maxWidth || 220} onChange={e => upd({ maxWidth: +e.target.value })} style={inputStyle} />
        </div>
      )}

      {el.type === 'sticker' && (
        <div className="field">
          <label style={labelStyle}>เลือก Emoji สติกเกอร์</label>
          <div className="sticker-grid" style={{marginBottom:'8px'}}>
            {STICKERS.map(s => <button key={s} className="sticker-btn" onClick={() => upd({ emoji: s })} type="button">{s}</button>)}
          </div>
          <input value={el.emoji || '❤️'} onChange={e => upd({ emoji: e.target.value })} style={inputStyle} placeholder="หรือพิมพ์อิโมจิอื่นที่นี่" />
        </div>
      )}

      {el.type === 'animated_sticker' && (
        <div>
          <label style={labelStyle}>🎞️ URL สติกเกอร์เคลื่อนไหว (.gif / .webp)</label>
          <input value={el.stickerSrc || ''} onChange={e => upd({ stickerSrc: e.target.value })} style={inputStyle} placeholder="https://media.giphy.com/media/xxx/giphy.gif" />
          {el.stickerSrc && (
            <div style={{textAlign:'center',marginBottom:'8px',background:'rgba(0,0,0,0.2)',borderRadius:'8px',padding:'8px'}}>
              <img src={el.stickerSrc} style={{maxWidth:'100px',maxHeight:'100px',objectFit:'contain'}} alt="preview"/>
            </div>
          )}
          <label style={labelStyle}>ขนาดสติกเกอร์ (px)</label>
          <input type="number" value={el.stickerSize || 120} onChange={e => upd({ stickerSize: +e.target.value })} style={inputStyle} min="40" max="300" />
        </div>
      )}

      {el.type === 'button' && (
        <div>
          <label style={labelStyle}>ข้อความบนปุ่ม</label>
          <input value={el.label || ''} onChange={e => upd({ label: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>คลิกแล้วเชื่อมโยงไปหน้าไหน</label>
          <select value={el.target || ''} onChange={e => upd({ target: e.target.value })} style={selStyle}>
            <option value="">— เลือกหน้าปลายทาง —</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {el.type === 'letter' && (
        <div className="field">
          <label style={labelStyle}>เนื้อหาความในใจภายในจดหมาย</label>
          <textarea value={el.text || ''} onChange={e => upd({ text: e.target.value })} style={{...inputStyle, minHeight:'100px'}} placeholder="บอกรักความในใจแบบยาวเหยียดที่นี่..." />
        </div>
      )}

      {el.type === 'player' && (
        <div>
          {/* รูปปก */}
          <label style={labelStyle}>🖼️ รูปปกเพลง (Album Art)</label>
          {(el.coverSrc && el.coverSrc.startsWith('data:')) ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
              <img src={el.coverSrc} style={{width:'44px',height:'44px',borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,107,157,0.5)'}} alt="cover"/>
              <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{el.coverFileName||'รูปปก'}</span>
              <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px'}}>
                เปลี่ยน
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd({coverSrc:ev.target.result,coverFileName:f.name});r.readAsDataURL(f);}} />
              </label>
              <button onClick={()=>upd({coverSrc:'',coverFileName:''})} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
            </div>
          ) : (
            <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box'}}>
              📸 เลือกรูปปกเพลง
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd({coverSrc:ev.target.result,coverFileName:f.name});r.readAsDataURL(f);}} />
            </label>
          )}
          {/* ชื่อเพลง + ศิลปิน */}
          <label style={labelStyle}>ชื่อเพลง</label>
          <input value={el.title||''} onChange={e=>upd({title:e.target.value})} style={inputStyle} placeholder="Summer Girl" />
          <label style={labelStyle}>ชื่อศิลปิน</label>
          <input value={el.artist||''} onChange={e=>upd({artist:e.target.value})} style={inputStyle} placeholder="HAIM" />
          {/* ไฟล์เพลง */}
          <label style={labelStyle}>🎵 ไฟล์เพลง</label>
          {(el.audioSrc && el.audioSrc.startsWith('data:') && el.audioFileName) ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
              <span style={{fontSize:'1.1rem'}}>🎵</span>
              <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{el.audioFileName}</span>
              <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px'}}>
                เปลี่ยน
                <input type="file" accept="audio/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd({audioSrc:ev.target.result,audioFileName:f.name});r.readAsDataURL(f);}} />
              </label>
              <button onClick={()=>upd({audioSrc:'',audioFileName:''})} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
            </div>
          ) : (
            <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box'}}>
              📂 เลือกไฟล์เพลง (.mp3 / .m4a / .ogg)
              <input type="file" accept="audio/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd({audioSrc:ev.target.result,audioFileName:f.name});r.readAsDataURL(f);}} />
            </label>
          )}
          {!(el.audioSrc && el.audioSrc.startsWith('data:')) && (
            <>
              <label style={labelStyle}>หรือวาง URL เพลง (.mp3)</label>
              <input value={el.audioSrc||''} onChange={e=>upd({audioSrc:e.target.value,audioFileName:''})} style={inputStyle} placeholder="https://example.com/song.mp3" />
            </>
          )}
        </div>
      )}

      {el.type === 'audio' && (
        <div>
          <label style={labelStyle}>ชื่อเพลงประกอบ</label>
          <input value={el.title || ''} onChange={e => upd({ title: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>🎵 เพิ่มเพลง</label>
          {/* Widget อัปโหลด — รวมในกล่องเดียว */}
          {(el.src && el.src.startsWith('data:') && el.audioFileName) ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
              <span style={{fontSize:'1.1rem'}}>🎵</span>
              <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{el.audioFileName}</span>
              <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px'}}>
                เปลี่ยน
                <input type="file" accept="audio/*" style={{display:'none'}} onChange={e => {
                  const file = e.target.files[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => upd({ src: ev.target.result, ytId:'', coverSrc:'', driveConverted:'', audioFileName: file.name });
                  reader.readAsDataURL(file);
                }} />
              </label>
              <button onClick={() => upd({ src:'', audioFileName:'', ytId:'', coverSrc:'' })} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
            </div>
          ) : (
            <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box'}}>
              📂 เลือกไฟล์เพลงจากเครื่อง (.mp3 / .m4a / .ogg)
              <input type="file" accept="audio/*" style={{display:'none'}} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => upd({ src: ev.target.result, ytId:'', coverSrc:'', driveConverted:'', audioFileName: file.name });
                reader.readAsDataURL(file);
              }} />
            </label>
          )}
          {/* หรือวาง URL */}
          {!(el.src && el.src.startsWith('data:')) && (
            <>
              <label style={labelStyle}>หรือวาง URL เพลง (.mp3 / YouTube)</label>
              <input value={el.src || ''} onChange={e => {
                const val = e.target.value;
                const ytMatch = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
                if (ytMatch) {
                  const vid = ytMatch[1];
                  upd({ src: val, ytId: vid, coverSrc: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`, driveConverted:'', audioFileName:'' });
                } else {
                  upd({ src: val, ytId:'', coverSrc:'', driveConverted:'', audioFileName:'' });
                }
              }} style={inputStyle} placeholder="https://youtu.be/xxx หรือ https://example.com/song.mp3" />
              {el.ytId && (
                <div style={{marginTop:'4px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <img src={`https://img.youtube.com/vi/${el.ytId}/hqdefault.jpg`} style={{width:'80px',height:'56px',objectFit:'cover',borderRadius:'6px',border:'1px solid rgba(255,107,157,0.3)'}} alt="thumbnail" />
                  <span style={{fontSize:'0.72rem',color:'#ff9a9e'}}>✅ ดึง Thumbnail จาก YouTube แล้ว</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {el.type === 'vinyl' && (
        <div>
          <label style={labelStyle}>หน้าปกแผ่นเสียง (รูปภาพ)</label>
          <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer'}}>
            📸 เลือกรูปปก
            <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>upd({src:ev.target.result});reader.readAsDataURL(file);}} />
          </label>
          {el.src && <div style={{textAlign:'center',marginBottom:'8px'}}><img src={el.src} style={{width:'80px',height:'80px',borderRadius:'50%',objectFit:'cover',border:'2px solid #333'}} alt="cover"/></div>}
          <label style={labelStyle}>🎵 เพิ่มเพลง</label>
          {(el.audioSrc && el.audioSrc.startsWith('data:') && el.vinylAudioFileName) ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 12px',marginBottom:'8px',background:'rgba(255,107,157,0.1)',border:'1px solid rgba(255,107,157,0.4)',borderRadius:'8px'}}>
              <span style={{fontSize:'1.1rem'}}>🎵</span>
              <span style={{flex:1,fontSize:'0.78rem',color:'#ff9a9e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{el.vinylAudioFileName}</span>
              <label style={{fontSize:'0.72rem',color:'#ccc',cursor:'pointer',whiteSpace:'nowrap',padding:'3px 8px',background:'rgba(255,255,255,0.08)',borderRadius:'5px'}}>
                เปลี่ยน
                <input type="file" accept="audio/*" style={{display:'none'}} onChange={e => {
                  const file = e.target.files[0]; if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => upd({ audioSrc: ev.target.result, vinylAudioFileName: file.name });
                  reader.readAsDataURL(file);
                }} />
              </label>
              <button onClick={() => upd({ audioSrc:'', vinylAudioFileName:'' })} style={{background:'none',border:'none',color:'#ff8080',cursor:'pointer',fontSize:'1rem',lineHeight:1}}>✕</button>
           