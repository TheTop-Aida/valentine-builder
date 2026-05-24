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
          function fmt(s){if(isNaN(s)||!isFinite(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}
          a.addEventListener("timeupdate",function(){if(a.duration){document.getElementById("player-prog-${el.id}").style.width=(a.currentTime/a.duration*100)+"%";document.getElementById("player-cur-${el.id}").textContent=fmt(a.currentTime);}});
          a.addEventListener("loadedmetadata",function(){document.getElementById("player-dur-${el.id}").textContent=fmt(a.duration);});
          a.addEventListener("ended",function(){isPlaying=false;btn.textContent="▶";img.style.animationPlayState="paused";document.getElementById("player-prog-${el.id}").style.width="0%";a.currentTime=0;});
          window.playerCtrl_${el.id}=function(cmd){
            if(cmd==="play"){if(isPlaying){a.pause();btn.textContent="▶";img.style.animationPlayState="paused";isPlaying=false;}else{a.play().catch(function(){});btn.textContent="⏸";img.style.animationPlayState="running";isPlaying=true;}}
            else if(cmd==="prev"){a.currentTime=Math.max(0,a.currentTime-10);}
            else if(cmd==="next"){if(a.duration)a.currentTime=Math.min(a.duration,a.currentTime+10);}
          };
          window.playerSeek_${el.id}=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));if(a.duration)a.currentTime=pct*a.duration;};
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
        'function fmt(s){if(isNaN(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}' +
        'a.addEventListener("timeupdate",function(){if(a.duration){document.getElementById("prog-' + el.id + '").style.width=(a.currentTime/a.duration*100)+"%";document.getElementById("cur-' + el.id + '").textContent=fmt(a.currentTime);}});' +
        'a.addEventListener("loadedmetadata",function(){document.getElementById("dur-' + el.id + '").textContent=fmt(a.duration);});' +
        'a.addEventListener("ended",function(){isPlaying=false;document.getElementById("playbtn-' + el.id + '").textContent="▶";document.getElementById("prog-' + el.id + '").style.width="0%";});' +
        'window.audioCtrl_' + el.id + '=function(){var btn=document.getElementById("playbtn-' + el.id + '");if(isPlaying){a.pause();btn.textContent="▶";isPlaying=false;}else{a.play();btn.textContent="⏸";isPlaying=true;}};' +
        'window.audioSeek_' + el.id + '=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));if(a.duration)a.currentTime=pct*a.duration;};' +
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
          function fmt(s){if(isNaN(s)||!isFinite(s))return"0:00";var m=Math.floor(s/60),sc=Math.floor(s%60);return m+":"+(sc<10?"0":"")+sc;}
          a.addEventListener("timeupdate",function(){if(a.duration){document.getElementById("vinyl-prog-${el.id}").style.width=(a.currentTime/a.duration*100)+"%";document.getElementById("vinyl-cur-${el.id}").textContent=fmt(a.currentTime);}});
          a.addEventListener("loadedmetadata",function(){document.getElementById("vinyl-dur-${el.id}").textContent=fmt(a.duration);});
          a.addEventListener("ended",function(){isPlaying=false;btn.textContent="▶";img.style.animationPlayState="paused";document.getElementById("vinyl-prog-${el.id}").style.width="0%";});
          window.vinylCtrl_${el.id}=function(){if(isPlaying){a.pause();btn.textContent="▶";img.style.animationPlayState="paused";isPlaying=false;}else{a.play();btn.textContent="⏸";img.style.animationPlayState="running";isPlaying=true;}};
          window.vinylSeek_${el.id}=function(e,bar){var rect=bar.getBoundingClientRect();var pct=Math.min(1,Math.max(0,(e.clientX-rect.left)/rect.width));if(a.duration)a.currentTime=pct*a.duration;};
        })()</script>`;
    }
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
      const noAnim = el.noAnim || 'none';
      const noAnimScript = (() => {
        const btnId = `no-${el.id}`;
        if (noAnim === 'shrink') return `
          (function(){
            var btn=document.getElementById('${btnId}'), scale=1;
            btn.addEventListener('click',function(){
              scale=Math.max(0.3, scale-0.15);
              btn.style.transform='scale('+scale+')';
              btn.style.opacity=scale;
            });
          })();`;
        if (noAnim === 'runaway') return `
          (function(){
            var btn=document.getElementById('${btnId}');
            btn.style.position='relative';
            btn.addEventListener('mouseover',function(){
              var wrap=btn.parentElement;
              var maxX=wrap.offsetWidth-btn.offsetWidth-20;
              var maxY=40;
              var rx=(Math.random()*maxX)|0;
              var ry=((Math.random()*maxY)-maxY/2)|0;
              btn.style.transform='translate('+rx+'px,'+ry+'px)';
            });
          })();`;
        if (noAnim === 'shake') return `
          (function(){
            var btn=document.getElementById('${btnId}');
            btn.addEventListener('click',function(){
              btn.style.animation='none';
              void btn.offsetWidth;
              btn.style.animation='shakeNo 0.5s ease';
            });
          })();`;
        if (noAnim === 'disappear') return `
          (function(){
            var btn=document.getElementById('${btnId}'), op=1;
            btn.addEventListener('click',function(){
              op=Math.max(0, op-0.25);
              btn.style.opacity=op;
              if(op<=0) btn.style.pointerEvents='none';
            });
          })();`;
        return '';
      })();
      return `
        <div class="${animClass}" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:12px; z-index:2; ${animDelay}">
          ${reactionHtml}
          <h3 id="q-text-${el.id}" style="${fontFamily}${fontSize}${color} font-weight:600; text-align:center; transition:all 0.3s;">${el.question || 'คุณรักฉันไหม?'}</h3>
          <div style="display:flex; gap:12px; justify-content:center; align-items:center; min-height:60px; width:100%; overflow:hidden;">
            <button id="yes-${el.id}" onclick="goTo('${el.yesTarget||''}')" style="z-index:10; padding:8px 20px; font-size:15px; font-weight:600; border:none; border-radius:20px; background:${el.yesColor || th.yes || '#4caf50'}; color:#fff; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.1); transition:all 0.3s ease; white-space:nowrap;">${el.yesLabel || 'รักมากที่สุด 💚'}</button>
            <button id="no-${el.id}" style="z-index:10; padding:8px 20px; font-size:15px; font-weight:600; border:none; border-radius:20px; background:${el.noColor || th.no || '#e63462'}; color:#fff; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.1); transition:all 0.4s ease; white-space:nowrap;">${el.noLabel || 'ไม่รัก 🚫'}</button>
          </div>
        </div>
        <style>#no-${el.id}{animation-fill-mode:both;}@keyframes shakeNo{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}</style>
        <script>${noAnimScript}</script>`;
    }
    default:
      return '';
  }
}