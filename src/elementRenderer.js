export function getAnimCSS() {
  return `
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideDown{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}
@keyframes zoomIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-15px)}60%{transform:translateY(-7px)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes heartbeat{0%,100%{transform:scale(1)}14%,42%{transform:scale(1.1)}28%{transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes sparkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.03)}}
@keyframes typewriter{from{width:0}to{width:100%}}
@keyframes spin{100%{transform:rotate(360deg)}}
.anim-fadeIn{animation:fadeIn 0.6s ease both}
.anim-slideUp{animation:slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both}
.anim-slideDown{animation:slideDown 0.6s cubic-bezier(0.16,1,0.3,1) both}
.anim-zoomIn{animation:zoomIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both}
.anim-bounce{animation:bounce 0.8s ease both}
.anim-shake{animation:shake 0.5s ease both}
.anim-heartbeat{animation:heartbeat 1.4s ease infinite}
.anim-float{animation:float 2.5s ease-in-out infinite}
.anim-sparkle{animation:sparkle 1.8s ease-in-out infinite}
.anim-typewriter{display:inline-block;overflow:hidden;white-space:nowrap;border-right:2px solid;animation:typewriter 2s steps(30,end) both, fadeIn 0.3s;}
`;
}

export function renderElement(el, th) {
  const fontFamily = el.fontFamily ? `font-family:'${el.fontFamily}',sans-serif;` : '';
  const fontSize = el.fontSize ? `font-size:${el.fontSize}px;` : '';
  const color = el.color ? `color:${el.color};` : '';
  const textAlign = el.textAlign ? `text-align:${el.textAlign}; width:100%;` : '';
  const animClass = el.animation && el.animation !== 'none' ? `anim-${el.animation}` : '';
  const animDelay = el.animDelay ? `animation-delay:${el.animDelay}s;` : '';
  const itemStyle = `${fontFamily}${fontSize}${color}${textAlign}${animDelay}`;

  switch (el.type) {
    case 'heading':
      return `<h1 class="${animClass}" style="${itemStyle} font-weight:700; margin-bottom:4px; line-height:1.3; z-index:2;">${el.text || 'หัวข้อหลัก'}</h1>`;
    case 'subtext':
      return `<p class="${animClass}" style="${itemStyle} margin-bottom:4px; line-height:1.6; white-space:pre-wrap; z-index:2;">${el.text || 'ใส่ข้อความของคุณที่นี่...'}</p>`;
    case 'image':
      if (!el.src) return `<div style="width:100%; padding:30px; background:rgba(0,0,0,.04); border-radius:12px; text-align:center; font-size:1.5rem; z-index:2;">🖼️ ยังไม่ได้ใส่ URL รูปภาพ</div>`;
      return `<div class="${animClass}" style="${animDelay} text-align:center; width:100%; z-index:2;"><img src="${el.src}" style="max-width:100%; width:${el.maxWidth||220}px; border-radius:${el.radius||12}px; object-fit:cover; box-shadow:0 4px 12px rgba(0,0,0,0.05);" alt="Valentine img"/></div>`;
    case 'sticker':
      return `<div class="${animClass}" style="font-size:${el.fontSize||48}px; margin:4px 0; display:inline-block; text-align:center; width:100%; z-index:2; ${animDelay}">${el.emoji || '❤️'}</div>`;
    case 'button':
      return `<div style="${textAlign} z-index:2;"><button onclick="goTo('${el.target||''}')" class="${animClass}" style="font-family:inherit; padding:10px 24px; border-radius:30px; border:none; background:${el.bgColor||th.btn}; color:${el.textColor||'#fff'}; font-size:${el.fontSize||15}px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.1); ${animDelay}">${el.label||'ปุ่มกด'}</button></div>`;
    case 'divider':
      return `<hr style="border:none; border-top:${el.thickness||1}px solid ${el.color||th.accent}33; margin:12px 0; width:100%; z-index:2;"/>`;
    case 'spacer':
      return `<div style="height:${el.height||20}px; width:100%; z-index:2;"></div>`;
    case 'letter':
      return `
        <div class="${animClass}" style="${animDelay} z-index:2; background:linear-gradient(135deg, rgba(255,107,157,.04), rgba(255,107,157,.01)); border:2px dashed ${th.accent}; border-radius:16px; padding:18px; text-align:left; width:100%;">
          <div style="font-size:1.8rem; text-align:center; margin-bottom:8px; cursor:pointer;" onclick="var s=this.nextElementSibling; s.style.display=s.style.display==='none'?'block':'none';">✉️ <span style="font-size:0.75rem; color:${th.accent}; display:inline;">(คลิกเปิดจดหมาย)</span></div>
          <div style="display:none; transition:all 0.3s; ${fontFamily}${fontSize}${color} line-height:1.6; white-space:pre-wrap;">${el.text || 'เขียนความในใจซึ้ง ๆ ไว้ที่นี่...'}</div>
        </div>`;
    case 'audio': {
      const ytThumb = el.ytId ? 'https://img.youtube.com/vi/' + el.ytId + '/hqdefault.jpg' : (el.coverSrc || '');
      const isYT = !!el.ytId;
      if (isYT) {
        return (
          '<div class="' + animClass + '" style="' + animDelay + ' z-index:2; width:100%;">' +
          '<div style="border-radius:16px;overflow:hidden;width:100%;background:' + th.btn + ';box-shadow:0 4px 24px rgba(0,0,0,0.25);">' +
          '<div style="position:relative;width:100%;padding-bottom:56.25%;overflow:hidden;">' +
          '<img src="' + ytThumb + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />' +
          '<div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.7))"></div>' +
          '<div style="position:absolute;bottom:10px;left:14px;right:14px;color:#fff;font-size:0.9rem;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.8);">' + (el.title||'เพลงของเรา') + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:20px;padding:14px 16px;">' +
          '<button onclick="ytMusicCtrl_' + el.id + '(\'prev\')" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer;opacity:0.85;padding:0;">⏮</button>' +
          '<button id="yt-playbtn-' + el.id + '" onclick="ytMusicCtrl_' + el.id + '(\'play\')" style="background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:1.6rem;cursor:pointer;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;">▶</button>' +
          '<button onclick="ytMusicCtrl_' + el.id + '(\'next\')" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer;opacity:0.85;padding:0;">⏭</button>' +
          '</div>' +
          '<div id="yt-player-' + el.id + '" style="width:1px;height:1px;overflow:hidden;position:absolute;"></div>' +
          '</div>' +
          '<script>(function(){' +
          'var _player_' + el.id + '=null,_playing_' + el.id + '=false;' +
          'function initPlayer_' + el.id + '(){if(typeof YT==="undefined"||!YT.Player){setTimeout(initPlayer_' + el.id + ',300);return;}' +
          '_player_' + el.id + '=new YT.Player("yt-player-' + el.id + '",{width:"1",height:"1",videoId:"' + el.ytId + '",' +
          'playerVars:{autoplay:0,controls:0,playsinline:1,loop:1,playlist:"' + el.ytId + '"},' +
          'events:{onStateChange:function(e){var btn=document.getElementById("yt-playbtn-' + el.id + '");' +
          'if(e.data===1){_playing_' + el.id + '=true;if(btn)btn.textContent="⏸";}else{_playing_' + el.id + '=false;if(btn)btn.textContent="▶";}}}});}' +
          'window.ytMusicCtrl_' + el.id + '=function(cmd){if(!_player_' + el.id + ')return;' +
          'if(cmd==="play"){_playing_' + el.id + '?_player_' + el.id + '.pauseVideo():_player_' + el.id + '.playVideo();}' +
          'else if(cmd==="prev"){var t=_player_' + el.id + '.getCurrentTime();_player_' + el.id + '.seekTo(Math.max(0,t-10),true);}' +
          'else if(cmd==="next"){var t=_player_' + el.id + '.getCurrentTime();_player_' + el.id + '.seekTo(t+10,true);}};' +
          'if(!window._ytApiLoaded){window._ytApiLoaded=true;var s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";document.head.appendChild(s);}' +
          'if(typeof YT!=="undefined"&&YT.Player){initPlayer_' + el.id + '();}' +
          'else{var prev2=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev2)prev2();initPlayer_' + el.id + '();};}' +
          '})()<\/script></div>'
        );
      }
      return (
        '<div class="' + animClass + '" style="' + animDelay + ' z-index:2; width:100%;">' +
        '<div style="display:flex;align-items:center;border-radius:12px;overflow:hidden;width:100%;background:' + th.btn + ';box-shadow:0 4px 18px rgba(0,0,0,0.18);padding:12px 16px;gap:12px;">' +
        '<div style="font-size:2rem;">🎵</div>' +
        '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:0.9rem;font-weight:600;color:#fff;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (el.title || 'เพลงของเรา') + '</div>' +
        '<audio controls src="' + (el.src||'') + '" style="width:100%;height:32px;"></audio>' +
        '</div></div></div>'
      );
    }
    case 'vinyl':
      return `
        <div class="${animClass}" style="${animDelay} z-index:2; display:flex; flex-direction:column; align-items:center; gap:10px; width:100%;">
          <img src="${el.src || 'https://cdn-icons-png.flaticon.com/512/1753/1753114.png'}" id="vinyl-img-${el.id}" style="width:${el.size||120}px; height:${el.size||120}px; border-radius:50%; object-fit:cover; animation:spin 4s linear infinite; animation-play-state:paused; box-shadow:0 4px 15px rgba(0,0,0,0.3); border:2px solid #333; background:#fff;" />
          <audio id="vinyl-aud-${el.id}" controls src="${el.audioSrc||''}" style="width:100%; height:32px;" onplay="document.getElementById('vinyl-img-${el.id}').style.animationPlayState='running'" onpause="document.getElementById('vinyl-img-${el.id}').style.animationPlayState='paused'"></audio>
        </div>`;
    case 'gallery': {
      const items = el.images || [];
      const cols = el.cols || 2;
      if (items.length === 0) return `<div style="padding:20px; background:rgba(0,0,0,0.03); border-radius:10px; text-align:center; font-size:0.75rem; color:#888; z-index:2;">📸 คลังภาพยังว่างเปล่า</div>`;
      return `<div class="gallery-container ${animClass}" style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:6px; width:100%; z-index:2; ${animDelay}">
          ${items.map(img => `<img src="${img}" style="width:100%; height:110px; object-fit:cover; border-radius:8px;" />`).join('')}
        </div>`;
    }
    case 'animated_sticker': {
      const src = el.stickerSrc || '';
      const sz = el.stickerSize || 120;
      if (!src) return `<div style="padding:16px;border:2px dashed rgba(255,107,157,0.3);border-radius:12px;text-align:center;color:#9a7aaa;font-size:0.8rem;z-index:2;">🎞️ ยังไม่ได้ใส่ URL สติกเกอร์เคลื่อนไหว</div>`;
      return `<div class="${animClass}" style="${animDelay} z-index:2; display:flex; justify-content:center;">
        <img src="${src}" style="width:${sz}px;height:${sz}px;object-fit:contain;background:transparent;" alt="sticker" />
      </div>`;
    }
    case 'gift_buttons': {
      const gifts = el.gifts || [{ icon:'🎁', label:'ของขวัญ', target:'', color:'#ff6b9d' }];
      const giftHtml = gifts.map((g) => {
        const action = g.target ? (g.target.startsWith('http') ? `window.open('${g.target}','_blank')` : `goTo('${g.target}')`) : '';
        return `<div onclick="${action}" style="display:inline-flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:all .25s;padding:10px;border-radius:14px;border:2px solid ${g.color||'#ff6b9d'}33;background:${g.color||'#ff6b9d'}11;" onmouseover="this.style.transform='translateY(-4px) scale(1.06)'" onmouseout="this.style.transform=''">
          <span class="gi" style="font-size:${el.iconSize||48}px;line-height:1;">${g.icon||'🎁'}</span>
          ${g.label ? `<span style="font-size:0.75rem;color:${g.color||'#ff6b9d'};font-family:'Mali',cursive;font-weight:600;">${g.label}</span>` : ''}
        </div>`;
      }).join('');
      return `<div class="${animClass}" style="${animDelay} z-index:2; display:flex; justify-content:center; flex-wrap:wrap; gap:12px; width:100%;">
        <style>@keyframes giftWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}</style>
        ${giftHtml}
      </div>`;
    }
    case 'polaroid_gallery': {
      const pitems = el.photos || [];
      if (pitems.length === 0) return `<div style="padding:20px;background:rgba(0,0,0,0.03);border-radius:10px;text-align:center;font-size:0.75rem;color:#888;z-index:2;">🖼️ ยังไม่มีรูปโพลารอยด์</div>`;
      const cols2 = el.cols || 2;
      return `
        <style>
          .polaroid-item{background:#fff;padding:10px 10px 30px;box-shadow:0 4px 14px rgba(0,0,0,0.15);display:inline-block;position:relative;transition:transform .3s;}
          .polaroid-item:nth-child(odd){transform:rotate(-2.2deg);}
          .polaroid-item:nth-child(even){transform:rotate(1.8deg);}
          .polaroid-item:hover{transform:rotate(0) scale(1.05)!important;box-shadow:0 10px 28px rgba(0,0,0,0.22);z-index:10;}
          .polaroid-caption{text-align:center;margin-top:6px;font-family:'Mali',cursive;font-size:0.72rem;color:#333;line-height:1.3;word-break:break-word;}
        </style>
        <div class="${animClass}" style="${animDelay} display:grid; grid-template-columns:repeat(${cols2},1fr); gap:14px; width:100%; z-index:2;">
          ${pitems.map(p => `<div class="polaroid-item"><img src="${p.src||''}" style="width:100%;aspect-ratio:1;object-fit:cover;display:block;" />${p.caption ? `<div class="polaroid-caption">${p.caption}</div>` : ''}</div>`).join('')}
        </div>`;
    }
    case 'counter': {
      const reactionImgs = el.reactionImages || [];
      const reactionHtml = reactionImgs.length > 0
        ? `<img id="react-img-${el.id}" src="${reactionImgs[0]}" class="reaction-img" style="margin-bottom:8px;" />`
        : '';
      return `
        <div class="${animClass}" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:12px; z-index:2; ${animDelay}">
          ${reactionHtml}
          <h3 id="q-text-${el.id}" style="${fontFamily}${fontSize}${color} font-weight:600; text-align:center; transition:all 0.3s;">${el.question || 'คุณรักฉันไหม?'}</h3>
          <div style="display:flex; gap:12px; justify-content:center; align-items:center; min-height:45px; width:100%;">
            <button id="yes-${el.id}" onclick="goTo('${el.yesTarget||''}')" style="z-index:10; padding:8px 20px; font-size:15px; font-weight:600; border:none; border-radius:20px; background:${el.yesColor || th.yes}; color:#fff; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.1); transition:all 0.3s ease; white-space:nowrap;">${el.yesLabel || 'รักมากที่สุด 💚'}</button>
            <button id="no-${el.id}" style="z-index:10; padding:8px 20px; font-size:15px; font-weight:600; border:none; border-radius:20px; background:${el.noColor || th.no}; color:#fff; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.1); transition:all 0.3s ease; white-space:nowrap; overflow:hidden;">${el.noLabel || 'ไม่รัก 🚫'}</button>
          </div>
        </div>`;
    }
    default:
      return '';
  }
}
