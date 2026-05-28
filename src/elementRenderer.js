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
  const fontSize = el.fontSize ? `font-size:${el.fontSize > 10 ? (el.fontSize / 16).toFixed(3) : el.fontSize}rem;` : '';
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
    case 'button': {
      const btnSizeMap = { sm: {fs:'13px', pad:'7px 18px'}, md: {fs:'15px', pad:'10px 24px'}, lg: {fs:'19px', pad:'14px 34px'} };
      const bs = btnSizeMap[el.btnSize] || btnSizeMap.md;
      const shapeMap = { pill: '999px', rounded: '12px', square: '4px' };
      const bRadius = shapeMap[el.btnShape] || '999px';
      return `<div style="${textAlign} z-index:2;"><button onclick="goTo('${el.target||''}')" class="${animClass}" style="font-family:inherit; padding:${bs.pad}; border-radius:${bRadius}; border:none; background:${el.bgColor||th.btn}; color:${el.textColor||'#fff'}; font-size:${bs.fs}; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,.1); ${animDelay}">${el.label||'ปุ่มกด'}</button></div>`;
    }
    case 'divider':
      return `<hr style="border:none; border-top:${el.thickness||1}px solid ${el.color||th.accent}33; margin:12px 0; width:100%; z-index:2;"/>`;
    case 'spacer':
      return `<div style="height:${el.height||20}px; width:100%; z-index:2;"></div>`;
    case 'letter': {
      const lt  = el.text || 'เขียนความในใจซึ้ง ๆ ไว้ที่นี่...';
      const acc = th.accent || '#ff6b9d';
      const sid = el.id;
      const envStyle = el.letterStyle || 'peach';

      /* ── SVG Envelopes ── */
      const bodyPeach = `<svg viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <defs><linearGradient id="pb-${sid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fcd5bc"/><stop offset="100%" stop-color="#f0ae91"/></linearGradient></defs>
        <rect width="300" height="185" rx="12" fill="url(#pb-${sid})"/>
        <polygon points="0,0 0,185 148,95" fill="#e89d80" opacity="0.35"/>
        <polygon points="300,0 300,185 152,95" fill="#e4977a" opacity="0.30"/>
        <polygon points="0,185 300,185 150,97" fill="#dd8f6e" opacity="0.38"/>
        <rect x="248" y="10" width="40" height="30" rx="4" fill="rgba(255,255,255,0.45)" stroke="${acc}" stroke-width="1" opacity="0.75"/>
        <text x="268" y="23" text-anchor="middle" font-size="10" fill="${acc}" font-family="sans-serif">💕</text>
        <text x="268" y="34" text-anchor="middle" font-size="7.5" fill="${acc}" font-family="sans-serif" letter-spacing="0.5">LOVE</text>
        <circle cx="150" cy="95" r="18" fill="${acc}" opacity="0.85"/>
        <text x="150" y="102" text-anchor="middle" font-size="17" fill="white">♡</text>
      </svg>`;
      const flapPeach = `<svg viewBox="0 0 300 122" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <defs><linearGradient id="pf-${sid}" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0%" stop-color="#eba882"/><stop offset="100%" stop-color="#f5bda0"/></linearGradient></defs>
        <polygon points="0,0 300,0 150,121" fill="url(#pf-${sid})"/>
      </svg>`;

      const bodySketch = `<svg viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <rect x="0.75" y="0.75" width="298.5" height="183.5" rx="6" fill="#ffffff" stroke="#2a1a14" stroke-width="1.5"/>
        <line x1="1" y1="1" x2="150" y2="95" stroke="#2a1a14" stroke-width="1.2" opacity="0.65"/>
        <line x1="299" y1="1" x2="150" y2="95" stroke="#2a1a14" stroke-width="1.2" opacity="0.65"/>
        <line x1="1" y1="184" x2="150" y2="95" stroke="#2a1a14" stroke-width="1" opacity="0.45"/>
        <line x1="299" y1="184" x2="150" y2="95" stroke="#2a1a14" stroke-width="1" opacity="0.45"/>
        <path d="M150 104 C150 104 139 93 139 87 C139 81.5 143 78 147 78 C149 78 150 80.5 150 80.5 C150 80.5 151 78 153 78 C157 78 161 81.5 161 87 C161 93 150 104 150 104Z" fill="#e05c6f"/>
      </svg>`;
      const flapSketch = `<svg viewBox="0 0 300 122" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <polygon points="0.75,0.75 299.25,0.75 150,121" fill="#ffffff" stroke="#2a1a14" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>`;

      const bodyRed = `<svg viewBox="0 0 300 185" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <rect x="0.75" y="0.75" width="298.5" height="183.5" rx="16" fill="#c94040" stroke="#2a2020" stroke-width="1.5"/>
        <rect x="7" y="7" width="286" height="171" rx="12" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 5" opacity="0.65"/>
        <line x1="1" y1="1" x2="150" y2="95" stroke="#9e3030" stroke-width="1.5" opacity="0.55"/>
        <line x1="299" y1="1" x2="150" y2="95" stroke="#9e3030" stroke-width="1.5" opacity="0.55"/>
        <line x1="1" y1="184" x2="150" y2="95" stroke="#882828" stroke-width="1.5" opacity="0.45"/>
        <line x1="299" y1="184" x2="150" y2="95" stroke="#882828" stroke-width="1.5" opacity="0.45"/>
        <path d="M150 107 C150 107 130 91 130 79 C130 71 136 65 143 65 C146.5 65 149 68 150 70 C151 68 153.5 65 157 65 C164 65 170 71 170 79 C170 91 150 107 150 107Z" fill="white" opacity="0.88"/>
      </svg>`;
      const flapRed = `<svg viewBox="0 0 300 122" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
        <polygon points="0.75,0.75 299.25,0.75 150,121" fill="#c94040" stroke="#2a2020" stroke-width="1.5" stroke-linejoin="round"/>
        <polyline points="9,0.75 150,116 291,0.75" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 5" stroke-linejoin="round" opacity="0.6"/>
      </svg>`;

      const bodies = { peach: bodyPeach, sketch: bodySketch, red: bodyRed };
      const flaps  = { peach: flapPeach, sketch: flapSketch, red: flapRed };
      const bodySvg = bodies[envStyle] || bodyPeach;
      const flapSvg = flaps[envStyle]  || flapPeach;

      return `<div class="${animClass}" style="${animDelay} z-index:2; width:100%; display:flex; flex-direction:column; align-items:center; font-family:Mitr,sans-serif; overflow:visible;">
<style>
  /* ===== LETTER ${sid} ===== */
  #vbe-${sid}{position:relative;width:300px;max-width:100%;cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;overflow:visible;}
  /* FLAP — rotates open */
  #vbf-${sid}{position:absolute;top:0;left:0;width:100%;z-index:6;transform-origin:top center;transition:transform .75s cubic-bezier(.4,0,.2,1);pointer-events:none;line-height:0;}
  #vbe-${sid}.open #vbf-${sid}{transform:perspective(700px) rotateX(-180deg);}
  /* ENVELOPE BODY */
  #vbd-${sid}{position:relative;line-height:0;}
  /* FLOATING HEARTS */
  #vbhts-${sid}{position:absolute;inset:0;pointer-events:none;overflow:hidden;}
  @keyframes vbflt-${sid}{0%{transform:translateY(0)scale(1);opacity:1;}100%{transform:translateY(-90px)scale(.5);opacity:0;}}
  .vbht-${sid}{position:absolute;bottom:10px;animation:vbflt-${sid} 1.8s ease-out forwards;}
  /* LETTER PAPER — sits hidden below envelope, pops UP to cover it on open */
  #vbltr-${sid}{
    position:absolute;left:6px;right:6px;bottom:0;
    z-index:3;
    transform-origin:center bottom;
    transform:translateY(48%);
    opacity:0;
    transition:transform .8s cubic-bezier(.34,1.35,.64,1), opacity .38s ease;
    pointer-events:none;
    filter:drop-shadow(0 -8px 26px rgba(0,0,0,.24));
  }
  #vbe-${sid}.open #vbltr-${sid}{
    transform:translateY(-14%);
    opacity:1;
    z-index:8;
    pointer-events:auto;
  }
  /* INNER PAPER */
  #vbinn-${sid}{
    padding:22px 18px 26px;
    background:#fffef8;
    background-image:repeating-linear-gradient(transparent,transparent 27px,${acc}18 28px);
    background-size:100% 28px;
    border:1.5px solid ${acc}40;
    border-bottom:1.5px solid ${acc}40;
    border-radius:12px 12px 6px 6px;
    box-shadow:0 -6px 24px rgba(0,0,0,.16),0 -2px 8px rgba(0,0,0,.08);
  }
  /* HINT */
  #vbhint-${sid}{font-size:.7rem;color:${acc};margin-top:10px;opacity:.75;letter-spacing:1px;transition:opacity .3s;}
</style>
<div id="vbe-${sid}" onclick="vbTog_${sid}()">
  <div id="vbd-${sid}">
    ${bodySvg}
    <div id="vbhts-${sid}"></div>
  </div>
  <div id="vbf-${sid}">${flapSvg}</div>
  <div id="vbltr-${sid}">
    <div id="vbinn-${sid}">
      <div style="text-align:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1.5px dashed ${acc}45;">
        <span style="font-size:.78rem;color:${acc};letter-spacing:2px;font-weight:600;">~ ถึงคนที่ฉันรัก ~</span>
      </div>
      <div style="${fontFamily}${fontSize}${color} line-height:2;white-space:pre-wrap;font-size:.88rem;">${lt}</div>
      <div style="text-align:right;margin-top:16px;padding-top:10px;border-top:1px dashed ${acc}35;font-size:.76rem;color:${acc}aa;letter-spacing:.5px;">ด้วยความรักทั้งหัวใจ 💕</div>
    </div>
  </div>
</div>
<div id="vbhint-${sid}">💌 แตะเพื่อเปิดจดหมาย</div>
<script>(function(){
  var H=['❤️','💕','💗','🌹','✨','💖','🩷','💓'];
  window.vbTog_${sid}=function(){
    var e=document.getElementById('vbe-${sid}');
    var h=document.getElementById('vbhint-${sid}');
    var hts=document.getElementById('vbhts-${sid}');
    if(!e.classList.contains('open')){
      e.classList.add('open');
      h.textContent='💌 แตะเพื่อปิดจดหมาย';
      hts.innerHTML='';
      for(var i=0;i<8;i++){(function(i){setTimeout(function(){
        var d=document.createElement('div');d.className='vbht-${sid}';
        d.textContent=H[i%H.length];d.style.left=(10+Math.random()*80)+'%';
        d.style.fontSize=(.65+Math.random()*.55)+'rem';hts.appendChild(d);
        setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},2000);
      },i*180);})(i);}
    }else{
      e.classList.remove('open');
      h.textContent='💌 แตะเพื่อเปิดจดหมาย';
    }
  };
})()</script>
</div>`;}

    case 'player': {
      const cvr = el.coverSrc || '';
      const aSrc = el.audioSrc || '';
      const ptitle = el.title || 'ชื่อเพลง';
      const artist = el.artist || '';
      const psz = el.size || 140;
      const bgLayer = cvr
        ? `<div style="position:absolute;inset:0;background-image:url('${cvr}');background-size:cover;background-position:center;filter:blur(20px) brightness(0.45);transform:scale(1.15);"></div>`
        : `<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a0a2e,#2c1040);"></div>`;
      return `<div class="${animClass}" style="${animDelay} z-index:2; width:100%;">
        <div style="position:relative;border-radius:22px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.45);">
          ${bgLayer}
          <div style="position:absolute;inset:0;background:rgba(0,0,0,0.22);"></div>
          <div style="position:relative;padding:24px 20px 20px;text-align:center;">
            <div style="position:relative;width:${psz}px;height:${psz}px;margin:0 auto 18px;">
              <img src="${cvr || 'https://cdn-icons-png.flaticon.com/512/1753/1753114.png'}" id="player-img-${el.id}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;animation:spin 4s linear infinite;animation-play-state:paused;box-shadow:0 6px 28px rgba(0,0,0,0.6);border:3px solid rgba(255,255,255,0.12);display:block;" />
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#1a1a1a;border:2px solid rgba(255,255,255,0.3);"></div>
            </div>
            <div style="font-size:1rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;text-shadow:0 1px 8px rgba(0,0,0,0.6);">${ptitle}</div>
            ${artist ? `<div style="font-size:0.78rem;color:rgba(255,255,255,0.6);margin-bottom:16px;">${artist}</div>` : `<div style="margin-bottom:16px;"></div>`}
            <div style="height:3px;background:rgba(255,255,255,0.2);border-radius:2px;cursor:pointer;margin-bottom:6px;overflow:hidden;" onclick="playerSeek_${el.id}(event,this)">
              <div id="player-prog-${el.id}" style="height:100%;background:rgba(255,255,255,0.9);border-radius:2px;width:0%;transition:width 0.2s linear;pointer-events:none;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:18px;">
              <span id="player-cur-${el.id}" style="font-size:0.65rem;color:rgba(255,255,255,0.55);">0:00</span>
              <span id="player-dur-${el.id}" style="font-size:0.65rem;color:rgba(255,255,255,0.55);">--:--</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;gap:32px;">
              <button onclick="playerCtrl_${el.id}('prev')" style="background:none;border:none;color:rgba(255,255,255,0.85);font-size:1.6rem;cursor:pointer;padding:0;line-height:1;transition:opacity 0.2s;">⏮</button>
              <button id="player-btn-${el.id}" onclick="playerCtrl_${el.id}('play')" style="width:54px;height:54px;border-radius:50%;border:none;background:rgba(255,255,255,0.18);color:#fff;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 14px rgba(0,0,0,0.4);transition:background 0.2s;">▶</button>
              <button onclick="playerCtrl_${el.id}('next')" style="background:none;border:none;color:rgba(255,255,255,0.85);font-size:1.6rem;cursor:pointer;padding:0;line-height:1;transition:opacity 0.2s;">⏭</button>
            </div>
          </div>
        </div>
        <audio id="player-aud-${el.id}" src="${aSrc}" style="display:none;"></audio>
        <script>(function(){
          var a=document.getElementById("player-aud-${el.id}");
          var img=document.getElementById("player-img-${el.id}");
          var btn=document.getElementById("player-btn-${el.id}");
          var isPlaying=false;
          var startT=${el.startTime||0},endT=${el.endTime||0};
          function fmt(s){if(isNaN(s)||!isFinite(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}
          function dispDur(){var d=endT>0?endT:a.duration;document.getElementById("player-dur-${el.id}").textContent=fmt(endT>0?endT-startT:d);}
          a.addEventListener("timeupdate",function(){
            var base=startT,tot=endT>0?endT:a.duration;
            var cur=a.currentTime;
            if(endT>0&&cur>=endT){a.currentTime=startT;if(isPlaying)a.play().catch(function(){});return;}
            var pct=tot>base?(cur-base)/(tot-base)*100:0;
            document.getElementById("player-prog-${el.id}").style.width=pct+"%";
            document.getElementById("player-cur-${el.id}").textContent=fmt(cur-base);
          });
          a.addEventListener("loadedmetadata",function(){dispDur();if(startT>0)a.currentTime=startT;});
          a.addEventListener("ended",function(){isPlaying=false;btn.textContent="▶";img.style.animationPlayState="paused";document.getElementById("player-prog-${el.id}").style.width="0%";a.currentTime=startT;});
          window.playerCtrl_${el.id}=function(cmd){
            var tot=endT>0?endT:a.duration;
            if(cmd==="play"){if(isPlaying){a.pause();btn.textContent="▶";img.style.animationPlayState="paused";isPlaying=false;}else{if(a.currentTime<startT)a.currentTime=startT;a.play().catch(function(){});btn.textContent="⏸";img.style.animationPlayState="running";isPlaying=true;}}
            else if(cmd==="prev"){a.currentTime=Math.max(startT,a.currentTime-10);}
            else if(cmd==="next"){if(tot)a.currentTime=Math.min(tot,a.currentTime+10);}
          };
          window.playerSeek_${el.id}=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));var tot=endT>0?endT:a.duration;if(tot)a.currentTime=startT+pct*(tot-startT);};
        })()<\/script>
      </div>`;
    }
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
        '<div style="border-radius:16px;width:100%;background:' + th.btn + ';box-shadow:0 4px 18px rgba(0,0,0,0.18);padding:14px 16px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
        '<button id="playbtn-' + el.id + '" onclick="audioCtrl_' + el.id + '()" style="width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,0.25);color:#fff;font-size:1.2rem;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">▶</button>' +
        '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:0.88rem;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px;">' + (el.title||'เพลงของเรา') + '</div>' +
        '<div style="position:relative;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;cursor:pointer;" onclick="audioSeek_' + el.id + '(event,this)">' +
        '<div id="prog-' + el.id + '" style="height:100%;background:#fff;border-radius:2px;width:0%;transition:width 0.2s linear;pointer-events:none;"></div></div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:5px;">' +
        '<span id="cur-' + el.id + '" style="font-size:0.68rem;color:rgba(255,255,255,0.8);">0:00</span>' +
        '<span id="dur-' + el.id + '" style="font-size:0.68rem;color:rgba(255,255,255,0.8);">--:--</span>' +
        '</div></div></div></div>' +
        '<audio id="aud-' + el.id + '" src="' + (el.src||'') + '" style="display:none;"></audio>' +
        '<script>(function(){' +
        'var a=document.getElementById("aud-' + el.id + '"),isPlaying=false;' +
        'var startT=' + (el.startTime||0) + ',endT=' + (el.endTime||0) + ';' +
        'function fmt(s){if(isNaN(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}' +
        'a.addEventListener("timeupdate",function(){' +
        'var base=startT,tot=endT>0?endT:a.duration;var cur=a.currentTime;' +
        'if(endT>0&&cur>=endT){a.currentTime=startT;if(isPlaying)a.play().catch(function(){});return;}' +
        'var pct=tot>base?(cur-base)/(tot-base)*100:0;' +
        'document.getElementById("prog-' + el.id + '").style.width=pct+"%";' +
        'document.getElementById("cur-' + el.id + '").textContent=fmt(cur-base);});' +
        'a.addEventListener("loadedmetadata",function(){document.getElementById("dur-' + el.id + '").textContent=fmt(endT>0?endT-startT:a.duration);if(startT>0)a.currentTime=startT;});' +
        'a.addEventListener("ended",function(){isPlaying=false;document.getElementById("playbtn-' + el.id + '").textContent="▶";document.getElementById("prog-' + el.id + '").style.width="0%";a.currentTime=startT;});' +
        'window.audioCtrl_' + el.id + '=function(){var btn=document.getElementById("playbtn-' + el.id + '");if(isPlaying){a.pause();btn.textContent="▶";isPlaying=false;}else{if(a.currentTime<startT)a.currentTime=startT;a.play();btn.textContent="⏸";isPlaying=true;}};' +
        'window.audioSeek_' + el.id + '=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));var tot=endT>0?endT:a.duration;if(tot)a.currentTime=startT+pct*(tot-startT);};' +
        '})()<\/script></div>'
      );
    }
    case 'vinyl': {
      const vsz = el.size || 120;
      return `
        <div class="${animClass}" style="${animDelay} z-index:2; display:flex; flex-direction:column; align-items:center; gap:10px; width:100%;">
          <div style="position:relative; width:${vsz}px; height:${vsz}px; flex-shrink:0;">
            <img src="${el.src || 'https://cdn-icons-png.flaticon.com/512/1753/1753114.png'}" id="vinyl-img-${el.id}" style="width:100%; height:100%; border-radius:50%; object-fit:cover; animation:spin 4s linear infinite; animation-play-state:paused; box-shadow:0 4px 20px rgba(0,0,0,0.35); border:3px solid #222; background:#fff; display:block;" />
            <button id="vinyl-btn-${el.id}" onclick="vinylCtrl_${el.id}()" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,0.92);color:#333;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.35);">▶</button>
          </div>
          <div style="width:${vsz}px;">
            <div style="height:3px;background:rgba(0,0,0,0.12);border-radius:2px;cursor:pointer;overflow:hidden;" onclick="vinylSeek_${el.id}(event,this)">
              <div id="vinyl-prog-${el.id}" style="height:100%;background:${th.btn};border-radius:2px;width:0%;transition:width 0.2s linear;pointer-events:none;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span id="vinyl-cur-${el.id}" style="font-size:0.62rem;color:#999;">0:00</span>
              <span id="vinyl-dur-${el.id}" style="font-size:0.62rem;color:#999;">--:--</span>
            </div>
          </div>
        </div>
        <audio id="vinyl-aud-${el.id}" src="${el.audioSrc||''}" style="display:none;"></audio>
        <script>(function(){
          var a=document.getElementById("vinyl-aud-${el.id}"),isPlaying=false;
          var img=document.getElementById("vinyl-img-${el.id}");
          var btn=document.getElementById("vinyl-btn-${el.id}");
          var startT=${el.startTime||0},endT=${el.endTime||0};
          function fmt(s){if(isNaN(s)||!isFinite(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}
          function dispDur(){var d=endT>0?endT:a.duration;document.getElementById("vinyl-dur-${el.id}").textContent=fmt(d);}
          a.addEventListener("timeupdate",function(){
            var base=startT,tot=endT>0?endT:a.duration;
            var cur=a.currentTime;
            if(endT>0&&cur>=endT){a.currentTime=startT;if(isPlaying)a.play().catch(function(){});return;}
            var pct=tot>base?(cur-base)/(tot-base)*100:0;
            document.getElementById("vinyl-prog-${el.id}").style.width=pct+"%";
            document.getElementById("vinyl-cur-${el.id}").textContent=fmt(cur-base);
          });
          a.addEventListener("loadedmetadata",function(){dispDur();if(startT>0)a.currentTime=startT;});
          a.addEventListener("ended",function(){isPlaying=false;btn.textContent="▶";img.style.animationPlayState="paused";document.getElementById("vinyl-prog-${el.id}").style.width="0%";a.currentTime=startT;});
          window.vinylCtrl_${el.id}=function(){if(isPlaying){a.pause();btn.textContent="▶";img.style.animationPlayState="paused";isPlaying=false;}else{if(a.currentTime<startT||a.currentTime===0)a.currentTime=startT;a.play();btn.textContent="⏸";img.style.animationPlayState="running";isPlaying=true;}};
          window.vinylSeek_${el.id}=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));var tot=endT>0?endT:a.duration;if(tot)a.currentTime=startT+pct*(tot-startT);};
        })()</script>`;
    }
    case 'gallery': {
      const items = el.images || [];
      const cols = el.cols || 2;
      if (items.length === 0) return `<div style="padding:20px; background:rgba(0,0,0,0.03); border-radius:10px; text-align:center; font-size:0.75rem; color:#888; z-index:2;">📸 คลังภาพยังว่างเปล่า</div>`;
      return `<div class="gallery-container ${animClass}" style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:6px; width:100%; z-index:2; ${animDelay}">
          ${items.map(img => `<img src="${img}" style="width:100%; height:auto; display:block; border-radius:8px; object-fit:contain;" />`).join('')}
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
      const stickerSrc  = el.stickerGif || '';
      const stickerSize = el.stickerSize || 150;
      const reactionHtml = stickerSrc
        ? `<img id="react-img-${el.id}" src="${stickerSrc}" style="width:${stickerSize}px;height:${stickerSize}px;object-fit:contain;border-radius:12px;margin-bottom:6px;transition:transform 0.3s cubic-bezier(.34,1.56,.64,1);" />`
        : '';
      const noAnim   = el.noAnim   || 'none';
      const noTaunts = (el.noTaunts || []).filter(t => t.trim());
      const tauntsJson = JSON.stringify(noTaunts).replace(/'/g, '&#39;');

      // ข้อความบ่น — โชว์แบบสุ่มเมื่อโต้ตอบปุ่ม NO
      const tauntCode = noTaunts.length > 0
        ? `var _td=document.getElementById('taunt-${el.id}');var _ts=JSON.parse(this.dataset.taunts||'[]');if(_ts.length){_td.textContent=_ts[Math.floor(Math.random()*_ts.length)];_td.style.opacity='1';}`
        : '';

      // onclick handler
      let noOnClick = '';
      if (noAnim === 'grow_shrink') {
        noOnClick = `var _y=document.getElementById('yes-${el.id}');var _ys=parseFloat(_y.dataset.scale||'1')+0.12;_ys=Math.min(2,_ys);_y.dataset.scale=_ys;_y.style.transform='scale('+_ys+')';var _ns=parseFloat(this.dataset.scale||'1')-0.2;_ns=Math.max(0,_ns);this.dataset.scale=_ns;this.style.transform='scale('+_ns+')';this.style.opacity=_ns;if(_ns<=0)this.style.pointerEvents='none';${tauntCode}`;
      } else if (noAnim === 'shake') {
        noOnClick = `this.style.animation='none';void this.offsetWidth;this.style.animation='shakeNo_${el.id} 0.5s ease';${tauntCode}`;
      } else if (noAnim === 'disappear') {
        noOnClick = `var _o=parseFloat(this.dataset.op||'1')-0.25;_o=Math.max(0,_o);this.dataset.op=_o;this.style.opacity=_o;if(_o<=0)this.style.pointerEvents='none';${tauntCode}`;
      } else if (noAnim === 'shrink') {
        noOnClick = `var _s=parseFloat(this.dataset.scale||'1')-0.15;_s=Math.max(0.3,_s);this.dataset.scale=_s;this.style.transform='scale('+_s+')';this.style.opacity=_s;${tauntCode}`;
      } else {
        noOnClick = tauntCode;
      }

      // onmouseover handler (runaway + taunt)
      const noOnMouseOver = noAnim === 'runaway'
        ? `var _p=this.parentElement;var _mxX=Math.max(0,(_p.offsetWidth||200)-this.offsetWidth-12);var _rx=(Math.random()*_mxX)|0;var _ry=((Math.random()*50)-25)|0;this.style.transform='translate('+_rx+'px,'+_ry+'px)';${tauntCode}`
        : '';

      const shakeStyle = noAnim === 'shake'
        ? `<style>@keyframes shakeNo_${el.id}{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}</style>`
        : '';

      const tauntDiv = noTaunts.length > 0
        ? `<div id="taunt-${el.id}" style="min-height:24px;${color} font-size:0.88rem;font-weight:600;text-align:center;opacity:0;transition:opacity 0.3s;padding:2px 8px;"></div>`
        : '';

      return `
        ${shakeStyle}
        <div class="${animClass}" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:10px; z-index:2; ${animDelay}">
          ${reactionHtml}
          <h3 id="q-text-${el.id}" style="${fontFamily}${fontSize}${color} font-weight:600; text-align:center; transition:all 0.3s;">${el.question || 'คุณรักฉันไหม?'}</h3>
          ${tauntDiv}
          <div style="display:flex; gap:14px; justify-content:center; align-items:center; min-height:50px; width:100%; overflow:visible; position:relative;">
            <button id="yes-${el.id}" onclick="goTo('${el.yesTarget||''}')" style="z-index:10; padding:10px 22px; font-size:15px; font-weight:700; border:none; border-radius:22px; background:${el.yesColor || th.yes || '#4caf50'}; color:#fff; cursor:pointer; box-shadow:0 3px 12px rgba(0,0,0,0.15); transition:all 0.35s ease; white-space:nowrap; transform-origin:center;">${el.yesLabel || 'รักมากที่สุด 💚'}</button>
            <button id="no-${el.id}"
              data-taunts='${tauntsJson}'
              onclick="${noOnClick}"
              onmouseover="${noOnMouseOver}"
              style="z-index:10; padding:10px 22px; font-size:15px; font-weight:700; border:none; border-radius:22px; background:${el.noColor || th.no || '#e63462'}; color:#fff; cursor:pointer; box-shadow:0 3px 12px rgba(0,0,0,0.15); transition:all 0.35s ease; white-space:nowrap; transform-origin:center;">${el.noLabel || 'ไม่รัก 🚫'}</button>
          </div>
        </div>`;
    }
    default:
      return '';
  }
}
