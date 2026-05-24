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
            </div>
          ) : (
            <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box'}}>
              📂 เลือกไฟล์เพลง (.mp3 / .m4a / .ogg)
              <input type="file" accept="audio/*" style={{display:'none'}} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => upd({ audioSrc: ev.target.result, vinylAudioFileName: file.name });
                reader.readAsDataURL(file);
              }} />
            </label>
          )}
          {!(el.audioSrc && el.audioSrc.startsWith('data:')) && (
            <>
              <label style={labelStyle}>หรือวาง URL เพลง (.mp3)</label>
              <input value={el.audioSrc || ''} onChange={e => upd({ audioSrc: e.target.value, vinylAudioFileName: '' })} style={inputStyle} placeholder="https://example.com/song.mp3" />
            </>
          )}
        </div>
      )}

      {el.type === 'spacer' && (
        <div>
          <label style={labelStyle}>ความสูง (px)</label>
          <input type="number" value={el.height || 20} onChange={e => upd({ height: +e.target.value })} style={inputStyle} min="4" max="300" />
        </div>
      )}

      {el.type === 'divider' && (
        <div>
          <label style={labelStyle}>สีเส้นคั่น</label>
          <input type="color" value={el.color || '#cccccc'} onChange={e => upd({ color: e.target.value })} style={{...inputStyle, height:'36px', padding:'2px 6px'}} />
          <label style={labelStyle}>ความหนา (px)</label>
          <input type="number" value={el.thickness || 1} onChange={e => upd({ thickness: +e.target.value })} style={inputStyle} min="1" max="10" />
        </div>
      )}

      {el.type === 'counter' && (
        <div>
          <label style={labelStyle}>หัวข้อคำถามชวนตอบ</label>
          <input value={el.question || ''} onChange={e => upd({ question: e.target.value })} style={inputStyle} placeholder="วันวาเลนไทน์ปีนี้... ตกลงเธอรักเค้าไหม? 🥺" />

          <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>ข้อความปุ่มตกลง (Yes)</label>
              <input value={el.yesLabel || ''} onChange={e => upd({ yesLabel: e.target.value })} style={inputStyle} placeholder="รักที่สุดเลยนะ 💚" />
            </div>
            <div style={{ width:'64px' }}>
              <label style={labelStyle}>สีปุ่ม Yes</label>
              <input type="color" value={el.yesColor || '#4caf50'} onChange={e => upd({ yesColor: e.target.value })} style={{ ...inputStyle, padding:'4px', height:'38px', cursor:'pointer', marginBottom:0 }} />
            </div>
          </div>

          <label style={labelStyle}>หากดดตกลงแล้วไปหน้าไหน</label>
          <select value={el.yesTarget || ''} onChange={e => upd({ yesTarget: e.target.value })} style={selStyle}>
            <option value="">— ไม่ได้เชื่อมโยง —</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>ข้อความปุ่มปฏิเสธ (No)</label>
              <input value={el.noLabel || ''} onChange={e => upd({ noLabel: e.target.value })} style={inputStyle} placeholder="ไม่รักหรอก 🚫" />
            </div>
            <div style={{ width:'64px' }}>
              <label style={labelStyle}>สีปุ่ม No</label>
              <input type="color" value={el.noColor || '#e63462'} onChange={e => upd({ noColor: e.target.value })} style={{ ...inputStyle, padding:'4px', height:'38px', cursor:'pointer', marginBottom:0 }} />
            </div>
          </div>

          <label style={labelStyle}>ลูกเล่นเมื่อพยายามกดปุ่ม No</label>
          <select value={el.noBehavior || 'growYes'} onChange={e => upd({ noBehavior: e.target.value })} style={selStyle}>
            <option value="growYes">🟢 ปุ่ม Yes ขยาย และปุ่ม No หดจนสลายไป</option>
            <option value="runaway">🏃 ปุ่ม No หนีเมาส์</option>
            <option value="fast">⚡ ปุ่ม No หนีเมาส์ (เร็วมาก)</option>
          </select>

          <label style={labelStyle}>ข้อความบ่นเมื่อกด/เล็ง No (แยกบรรทัดกวน ๆ)</label>
          <textarea
            value={(el.noMessages || []).join('\n')}
            onChange={e => upd({ noMessages: e.target.value.split('\n') })}
            style={{ ...inputStyle, height:'90px', resize:'vertical', fontFamily:'Mitr,sans-serif', lineHeight:1.6 }}
            placeholder={'คิดดีๆ นะ 🥺\nโอกาสสุดท้ายจริงๆ 😡\nยอมรับเถอะว่ารักเค้า!\nกด YES เถอะนะ...'}
          />
        </div>
      )}

      {el.type === 'gift_buttons' && (
        <div>
          <label style={labelStyle}>ขนาดไอคอน (px)</label>
          <input type="number" value={el.iconSize || 48} onChange={e => upd({ iconSize: +e.target.value })} style={inputStyle} min="24" max="120" />
          {(el.gifts || [{ icon:'🎁', label:'ของขวัญ', target:'', color:'#ff6b9d' }]).map((g, i) => (
            <div key={i} style={{border:'1px solid rgba(255,107,157,0.25)',borderRadius:'8px',padding:'10px',marginBottom:'8px'}}>
              <label style={labelStyle}>ของขวัญ {i + 1}</label>
              <input value={g.icon || '🎁'} onChange={e => { const gs = [...(el.gifts||[])]; gs[i] = {...gs[i], icon: e.target.value}; upd({gifts: gs}); }} style={inputStyle} placeholder="🎁" />
              <input value={g.label || ''} onChange={e => { const gs = [...(el.gifts||[])]; gs[i] = {...gs[i], label: e.target.value}; upd({gifts: gs}); }} style={inputStyle} placeholder="ชื่อของขวัญ" />
              <select value={g.target || ''} onChange={e => { const gs = [...(el.gifts||[])]; gs[i] = {...gs[i], target: e.target.value}; upd({gifts: gs}); }} style={selStyle}>
                <option value="">— ไม่ได้เชื่อมโยง —</option>
                {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => upd({ gifts: [...(el.gifts||[]), { icon:'🎁', label:'', target:'', color:'#ff6b9d' }] })} style={{width:'100%',padding:'7px',background:'rgba(255,107,157,0.15)',border:'1px solid rgba(255,107,157,0.3)',borderRadius:'7px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',fontFamily:'Mitr,sans-serif'}}>+ เพิ่มของขวัญ</button>
        </div>
      )}

      {el.type === 'gallery' && (
        <div>
          <label style={labelStyle}>จำนวนคอลัมน์</label>
          <select value={el.cols || 2} onChange={e => upd({ cols: +e.target.value })} style={selStyle}>
            <option value={1}>1 คอลัมน์</option>
            <option value={2}>2 คอลัมน์</option>
            <option value={3}>3 คอลัมน์</option>
          </select>
          <label style={labelStyle}>เพิ่มรูปภาพ</label>
          <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',boxSizing:'border-box'}}>
            📸 เลือกรูปภาพ (เลือกได้หลายรูป)
            <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e => {
              const files = Array.from(e.target.files);
              Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(f); }))).then(imgs => upd({ images: [...(el.images||[]), ...imgs] }));
            }} />
          </label>
          {(el.images||[]).length > 0 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'4px',marginBottom:'8px'}}>
              {(el.images||[]).map((img, i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={img} style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:'4px'}} alt="" />
                  <button onClick={() => { const imgs = [...(el.images||[])]; imgs.splice(i,1); upd({images:imgs}); }} style={{position:'absolute',top:'2px',right:'2px',width:'18px',height:'18px',borderRadius:'50%',border:'none',background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'0.65rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {el.type === 'polaroid_gallery' && (
        <div>
          <label style={labelStyle}>จำนวนคอลัมน์</label>
          <select value={el.cols || 2} onChange={e => upd({ cols: +e.target.value })} style={selStyle}>
            <option value={1}>1 คอลัมน์</option>
            <option value={2}>2 คอลัมน์</option>
            <option value={3}>3 คอลัมน์</option>
          </select>
          {(el.photos || []).map((photo, i) => (
            <div key={i} style={{border:'1px solid rgba(255,107,157,0.2)',borderRadius:'8px',padding:'8px',marginBottom:'8px'}}>
              <label style={labelStyle}>รูปที่ {i+1}</label>
              <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',width:'100%',padding:'8px',marginBottom:'6px',background:'rgba(255,107,157,0.08)',border:'1px dashed rgba(255,107,157,0.35)',borderRadius:'6px',color:'#ff9a9e',fontSize:'0.75rem',cursor:'pointer',boxSizing:'border-box'}}>
                📸 เลือกรูป
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const ps=[...(el.photos||[])];ps[i]={...ps[i],src:ev.target.result};upd({photos:ps});};r.readAsDataURL(f);}} />
              </label>
              {photo.src && <img src={photo.src} style={{width:'100%',maxHeight:'80px',objectFit:'cover',borderRadius:'4px',marginBottom:'6px'}} alt="" />}
              <input value={photo.caption || ''} onChange={e => { const ps = [...(el.photos||[])]; ps[i] = {...ps[i], caption: e.target.value}; upd({photos: ps}); }} style={inputStyle} placeholder="คำบรรยายใต้รูป..." />
              <button onClick={() => { const ps = [...(el.photos||[])]; ps.splice(i,1); upd({photos:ps}); }} style={{width:'100%',padding:'4px',background:'rgba(255,80,80,0.12)',border:'1px solid rgba(255,80,80,0.25)',borderRadius:'5px',color:'#ff8080',fontSize:'0.72rem',cursor:'pointer',fontFamily:'Mitr,sans-serif'}}>ลบรูปนี้</button>
            </div>
          ))}
          <button onClick={() => upd({ photos: [...(el.photos||[]), { src:'', caption:'' }] })} style={{width:'100%',padding:'7px',background:'rgba(255,107,157,0.15)',border:'1px solid rgba(255,107,157,0.3)',borderRadius:'7px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer',fontFamily:'Mitr,sans-serif'}}>+ เพิ่มรูปโพลารอยด์</button>
        </div>
      )}

      {/* ── ส่วนตั้งค่าร่วม ── */}
      {(el.type === 'heading' || el.type === 'subtext') && (
        <div>
          <label style={labelStyle}>ฟอนต์</label>
          <select value={el.fontFamily || 'Mali'} onChange={e => upd({ fontFamily: e.target.value })} style={selStyle}>
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <label style={labelStyle}>ขนาดตัวอักษร (rem)</label>
          <input type="number" step="0.1" value={el.fontSize || 1.2} onChange={e => upd({ fontSize: +e.target.value })} style={inputStyle} min="0.5" max="5" />
          <label style={labelStyle}>สีตัวอักษร</label>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'8px'}}>
            {['#ffffff','#000000','#ff6b9d','#e63462','#9b59b6','#3498db','#52b788','#f1c40f'].map(c => (
              <button key={c} onClick={() => upd({ color: c })} style={{width:'24px',height:'24px',borderRadius:'50%',background:c,border: el.color===c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',cursor:'pointer',flexShrink:0}} />
            ))}
          </div>
          <input type="color" value={el.color || '#ffffff'} onChange={e => upd({ color: e.target.value })} style={{...inputStyle, height:'36px', padding:'2px 6px'}} />
          <label style={labelStyle}>การจัดวาง</label>
          <select value={el.align || 'center'} onChange={e => upd({ align: e.target.value })} style={selStyle}>
            <option value="left">ซ้าย</option>
            <option value="center">กลาง</option>
            <option value="right">ขวา</option>
          </select>
        </div>
      )}

      {(el.type === 'sticker' || el.type === 'player' || el.type === 'vinyl') && (
        <div>
          <label style={labelStyle}>ขนาด (px)</label>
          <input type="number" value={el.size || 80} onChange={e => upd({ size: +e.target.value })} style={inputStyle} min="20" max="400" />
        </div>
      )}

      {/* Animation */}
      {el.type !== 'spacer' && el.type !== 'divider' && (
        <div>
          <label style={labelStyle}>แอนิเมชัน</label>
          <select value={el.animation || 'none'} onChange={e => upd({ animation: e.target.value })} style={selStyle}>
            {ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
          </select>
          {el.animation && el.animation !== 'none' && (
            <>
              <label style={labelStyle}>หน่วงเวลา (วินาที)</label>
              <input type="number" step="0.1" value={el.delay || 0} onChange={e => upd({ delay: +e.target.value })} style={inputStyle} min="0" max="5" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
