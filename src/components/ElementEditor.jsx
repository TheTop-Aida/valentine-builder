import { STICKERS, FONTS, ANIMATIONS, SWATCHES } from '../constants.js';

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

      {el.type === 'audio' && (
        <div>
          <label style={labelStyle}>ชื่อเพลงประกอบ</label>
          <input value={el.title || ''} onChange={e => upd({ title: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>ลิงก์ YouTube หรือ URL เพลง (.mp3)</label>
          <input value={el.src || ''} onChange={e => {
            const val = e.target.value;
            const ytMatch = val.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
            if (ytMatch) {
              const vid = ytMatch[1];
              upd({ src: val, ytId: vid, coverSrc: `https://img.youtube.com/vi/${vid}/hqdefault.jpg` });
            } else {
              upd({ src: val, ytId: '', coverSrc: '' });
            }
          }} style={inputStyle} placeholder="https://youtu.be/xxx หรือ .mp3" />
          {el.ytId && (
            <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'8px'}}>
              <img src={`https://img.youtube.com/vi/${el.ytId}/hqdefault.jpg`} style={{width:'80px',height:'56px',objectFit:'cover',borderRadius:'6px',border:'1px solid rgba(255,107,157,0.3)'}} alt="thumbnail" />
              <span style={{fontSize:'0.72rem',color:'#ff9a9e'}}>✅ ดึง Thumbnail จาก YouTube แล้ว</span>
            </div>
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
          <label style={labelStyle}>ลิงก์ URL เพลง (.mp3)</label>
          <input value={el.audioSrc || ''} onChange={e => upd({ audioSrc: e.target.value })} style={inputStyle} placeholder="https://example.com/song.mp3" />
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
          <label style={labelStyle}>📁 อัปโหลดรูปภาพ (เลือกได้หลายรูป)</label>
          <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer'}}>
            📸 เพิ่มรูปภาพ
            <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{
              const files=Array.from(e.target.files); if(!files.length)return;
              const newImgs=[...(el.images||[])]; let loaded=0;
              files.forEach(file=>{const reader=new FileReader();reader.onload=ev=>{newImgs.push(ev.target.result);loaded++;if(loaded===files.length)upd({images:newImgs});};reader.readAsDataURL(file);});
            }} />
          </label>
          {(el.images||[]).length > 0 && (
            <div style={{display:'grid',gridTemplateColumns:`repeat(${el.cols||2},1fr)`,gap:'4px',marginBottom:'8px',padding:'6px',background:'rgba(0,0,0,0.2)',borderRadius:'8px'}}>
              {(el.images||[]).map((img,i)=>(
                <div key={i} style={{position:'relative',borderRadius:'6px',overflow:'hidden'}}>
                  <img src={img} style={{width:'100%',height:'60px',objectFit:'cover',display:'block'}} alt="" />
                  <button onClick={()=>upd({images:(el.images||[]).filter((_,j)=>j!==i)})} style={{position:'absolute',top:'2px',right:'2px',width:'18px',height:'18px',background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',color:'#fff',fontSize:'0.6rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
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
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </select>
          <label style={labelStyle}>📁 เพิ่มรูปโพลารอยด์</label>
          <label style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'10px',marginBottom:'8px',background:'rgba(255,107,157,0.08)',border:'2px dashed rgba(255,107,157,0.4)',borderRadius:'8px',color:'#ff9a9e',fontSize:'0.8rem',cursor:'pointer'}}>
            🖼️ เพิ่มรูปภาพ
            <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>{
              const files=Array.from(e.target.files); if(!files.length)return;
              const newPhotos=[...(el.photos||[])]; let loaded=0;
              files.forEach(file=>{const reader=new FileReader();reader.onload=ev=>{newPhotos.push({src:ev.target.result,caption:''});loaded++;if(loaded===files.length)upd({photos:newPhotos});};reader.readAsDataURL(file);});
            }} />
          </label>
          {(el.photos||[]).map((p,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,107,157,0.2)',borderRadius:'8px',padding:'8px',marginBottom:'6px',display:'flex',gap:'8px',alignItems:'flex-start'}}>
              <img src={p.src} style={{width:'50px',height:'50px',objectFit:'cover',borderRadius:'4px',flexShrink:0}} alt=""/>
              <div style={{flex:1}}>
                <input value={p.caption||''} onChange={e=>{ const ph=[...(el.photos||[])]; ph[i]={...ph[i],caption:e.target.value}; upd({photos:ph}); }} style={{...inputStyle,marginBottom:'4px'}} placeholder="caption..." />
              </div>
              <button onClick={()=>upd({photos:(el.photos||[]).filter((_,j)=>j!==i)})} style={{background:'rgba(255,80,80,0.2)',border:'none',color:'#ff8080',borderRadius:'4px',padding:'4px 6px',cursor:'pointer',fontSize:'0.7rem'}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {el.type === 'counter' && (
        <div>
          <label style={labelStyle}>หัวข้อคำถามชวนตอบ</label>
          <input value={el.question || ''} onChange={e => upd({ question: e.target.value })} style={inputStyle} />
          <div className="row2">
            <div>
              <label style={labelStyle}>ข้อความปุ่ม Yes</label>
              <input value={el.yesLabel || ''} onChange={e => upd({ yesLabel: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>สีปุ่ม Yes</label>
              <input type="color" value={el.yesColor || themeObj.yes} onChange={e => upd({ yesColor: e.target.value })} style={{width:'100%',height:'35px',padding:'0',border:'none',cursor:'pointer',borderRadius:'6px'}} />
            </div>
          </div>
          <label style={labelStyle}>หากกดตกลงแล้วไปหน้าไหน</label>
          <select value={el.yesTarget || ''} onChange={e => upd({ yesTarget: e.target.value })} style={selStyle}>
            <option value="">— เลือกหน้าปลายทาง —</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <label style={labelStyle}>ข้อความปุ่ม No</label>
          <input value={el.noLabel || ''} onChange={e => upd({ noLabel: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>ลูกเล่นเมื่อกดปุ่ม No</label>
          <select value={el.noBehavior || 'runaway'} onChange={e => upd({ noBehavior: e.target.value })} style={selStyle}>
            <option value="runaway">🏃‍♂️ วิ่งหนีตามปกติ</option>
            <option value="fast">⚡ วิ่งหนีความเร็วแสง</option>
            <option value="growYes">🟢 ปุ่ม Yes ขยาย No หดสลาย</option>
          </select>
          <label style={labelStyle}>ข้อความบ่นเมื่อกด No (แยกบรรทัด)</label>
          <textarea value={(el.noMessages || []).join('\n')} onChange={e => upd({ noMessages: e.target.value.split('\n') })} style={inputStyle} placeholder="คิดดีๆ นะ..&#10;โอกาสสุดท้าย!" />
        </div>
      )}

      {el.type === 'spacer' && (
        <div className="field">
          <label style={labelStyle}>ความสูงช่องว่าง (px)</label>
          <input type="number" value={el.height || 20} onChange={e => upd({ height: +e.target.value })} style={inputStyle} />
        </div>
      )}

      {/* Universal Style Controls */}
      <div style={{borderTop:'1px dashed rgba(255,107,157,0.2)', margin:'14px 0 10px 0'}}/>
      <div style={{fontSize:'0.7rem', color:'#ff6b9d', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px', fontWeight:'600'}}>🎨 ดีไซน์ฟอนต์ & สีเฉพาะ element นี้</div>
      <div className="row2">
        <div className="field">
          <label style={labelStyle}>แบบตัวอักษร</label>
          <select value={el.fontFamily || ''} onChange={e => upd({ fontFamily: e.target.value })} style={selStyle}>
            <option value="">— ดีฟอลต์ —</option>
            {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>ขนาดอักษร (px)</label>
          <input type="number" value={el.fontSize || ''} onChange={e => upd({ fontSize: e.target.value ? +e.target.value : undefined })} style={inputStyle} />
        </div>
      </div>
      <div className="field">
        <label style={labelStyle}>สีตัวอักษร</label>
        <div style={{display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center'}}>
          {SWATCHES.map(c => (
            <div key={c} className={`palette-swatch ${(el.color||themeObj.text)===c?'active':''}`} style={{background:c}} onClick={() => upd({color: c})} />
          ))}
          <input type="color" value={el.color || themeObj.text} onChange={e => upd({ color: e.target.value })} style={{width:'26px',height:'26px',padding:0,border:'none',cursor:'pointer',borderRadius:'50%'}} />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label style={labelStyle}>แอนิเมชัน</label>
          <select value={el.animation || 'none'} onChange={e => upd({ animation: e.target.value })} style={selStyle}>
            {ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label style={labelStyle}>หน่วงเวลา (วินาที)</label>
          <input type="number" step="0.1" min="0" value={el.animDelay || 0} onChange={e => upd({ animDelay: +e.target.value })} style={inputStyle} />
        </div>
      </div>
    </div>
  );
}
