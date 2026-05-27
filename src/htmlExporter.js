import { THEMES } from './constants.js';
import { renderElement, getAnimCSS } from './elementRenderer.js';

export function getPageLayoutStyles(p, th) {
  const bg = p.customBg || th.bg;
  const cardBg = p.customCardBg || th.card;
  const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
  const contentAlign = alignMap[p.contentAlign] || 'center';
  const textJustify = p.contentAlign || 'center';
  const elementsGap = p.elementsGap !== undefined ? p.elementsGap : 16;
  const cardWidth = p.cardWidth || 440;
  const cardPadding = p.cardPadding !== undefined ? p.cardPadding : 32;
  const cardRadius = p.cardRadius !== undefined ? p.cardRadius : 24;

  let containerStyles = `background:${bg}; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; width:100%; box-sizing:border-box; padding:16px; position:relative; overflow:hidden; z-index:1;`;
  let cardStyles = `background:${cardBg}; padding:${cardPadding}px; border-radius:${cardRadius}px; max-width:${cardWidth}px; width:100%; box-sizing:border-box; display:flex; flex-direction:column; gap:${elementsGap}px; align-items:${contentAlign}; text-align:${textJustify}; box-shadow:0 10px 35px rgba(0,0,0,0.06); position:relative; z-index:2;`;

  if (p.layout === 'full') {
    cardStyles = `width:100%; max-width:100%; min-height:100vh; border-radius:0; padding:${cardPadding}px; background:${cardBg}; display:flex; flex-direction:column; gap:${elementsGap}px; align-items:${contentAlign}; text-align:${textJustify}; justify-content:center; box-shadow:none; margin:0; position:relative; z-index:2;`;
  } else if (p.layout === 'top') {
    cardStyles += ` margin-top: 30px; margin-bottom: auto;`;
  } else if (p.layout === 'minimal') {
    cardStyles = `background:transparent; padding:12px; max-width:${cardWidth}px; width:100%; display:flex; flex-direction:column; gap:${elementsGap}px; align-items:${contentAlign}; text-align:${textJustify}; box-shadow:none; position:relative; z-index:2;`;
  }

  return { containerStyles, cardStyles };
}

export function generateHTML(pages) {
  const getTheme = (id) => THEMES[id] || THEMES.pink;

  const sectionsHtml = pages.map((p, i) => {
    const th = getTheme(p.theme);
    const isFirst = i === 0;
    const { containerStyles, cardStyles } = getPageLayoutStyles(p, th);
    const elementsRendered = (p.elements || []).map(el =>
      `<div data-eid="${el.id}" class="vb-tap-elem">${renderElement(el, th)}</div>`
    ).join('\n');

    const bgImageLayer = p.bgImage
      ? `<div style="position:absolute; inset:0; background-image:url('${p.bgImage}'); background-size:${p.bgZoom ? p.bgZoom+'%' : 'cover'}; background-position:center; opacity:${p.bgOpacity ?? 0.5}; z-index:0; pointer-events:none;"></div>`
      : '';
    const cardBgImageLayer = p.cardBgImage && p.layout !== 'minimal'
      ? `<div style="position:absolute; inset:0; background-image:url('${p.cardBgImage}'); background-size:${p.cardBgZoom ? p.cardBgZoom+'%' : 'cover'}; background-position:center; opacity:${p.cardBgOpacity ?? 0.5}; z-index:0; border-radius:${p.layout === 'full' ? 0 : (p.cardRadius || 24)}px; pointer-events:none;"></div>`
      : '';

    const counterEls = (p.elements || []).filter(el => el.type === 'counter');
    const pageCounterScripts = counterEls.map(el => {
      const msgs = JSON.stringify(el.noMessages || ["คิดดีๆ นะ 🥺","โอกาสสุดท้ายจริงๆ 😡","ยอมรับเถอะว่ารักเค้า!","กด YES เถอะนะ..."]);
      const behavior = el.noBehavior || 'runaway';
      return `
        (function(){
          var idx=0, msgs=${msgs};
          var reactionImgs=${JSON.stringify(el.reactionImages || [])};
          var noBtn=document.getElementById('no-${el.id}');
          var yesBtn=document.getElementById('yes-${el.id}');
          var qText=document.getElementById('q-text-${el.id}');
          var reactImg=document.getElementById('react-img-${el.id}');
          if(!noBtn||!yesBtn) return;
          var yesScale=1, noScale=1;
          function runAway(e){
            if('${behavior}'==='growYes'){
              if(!noBtn.dataset.initMax){noBtn.dataset.initMax=noBtn.offsetWidth;noBtn.style.boxSizing='border-box';}
              var initM=parseInt(noBtn.dataset.initMax);
              yesScale=Math.min(yesScale+0.3,1.8); noScale=Math.max(noScale-0.25,0);
              yesBtn.style.transform='scale('+yesScale+')';
              if(noScale<=0){noBtn.style.display='none';}
              else{noBtn.style.transform='scale('+noScale+')';noBtn.style.opacity=noScale;noBtn.style.maxWidth=(initM*noScale)+'px';noBtn.style.paddingLeft=(20*noScale)+'px';noBtn.style.paddingRight=(20*noScale)+'px';if(noScale<0.5)noBtn.style.color='transparent';}
            } else {
              if(noBtn.style.position!=='fixed'){var r=noBtn.getBoundingClientRect();noBtn.style.width=r.width+'px';noBtn.style.height=r.height+'px';noBtn.style.left=r.left+'px';noBtn.style.top=r.top+'px';noBtn.style.position='fixed';noBtn.style.zIndex='9999';}
              var w=window.innerWidth-noBtn.offsetWidth-20, h=window.innerHeight-noBtn.offsetHeight-20;
              noBtn.style.left=Math.max(10,Math.floor(Math.random()*w))+'px';
              noBtn.style.top=Math.max(10,Math.floor(Math.random()*h))+'px';
            }
            if(idx<msgs.length&&qText) qText.textContent=msgs[idx];
            if(reactImg&&reactionImgs.length>0){var imgIdx=Math.min(idx,reactionImgs.length-1);reactImg.style.transform='scale(1.15)';setTimeout(function(){reactImg.style.transform='';},300);reactImg.src=reactionImgs[imgIdx];}
            if(idx<msgs.length) idx++;
          }
          if('${behavior}'==='fast'){noBtn.addEventListener('mouseenter',runAway);noBtn.style.transition='all 0.3s ease, top 0.05s linear, left 0.05s linear';}
          else if('${behavior}'==='runaway'){noBtn.addEventListener('mouseover',runAway);noBtn.style.transition='all 0.3s ease, top 0.3s ease-out, left 0.3s ease-out';}
          else{noBtn.addEventListener('mouseover',function(e){e.preventDefault();runAway(e);});noBtn.addEventListener('click',function(e){e.preventDefault();runAway(e);});}
          noBtn.addEventListener('touchstart',function(e){e.preventDefault();runAway(e);},{passive:false});
        })();
      `;
    }).join('\n');

    return `
      <section id="${p.id}" class="page-container" style="${containerStyles} display:${isFirst ? 'flex' : 'none'};">
        ${bgImageLayer}
        <div class="card anim-${p.pageAnimation || 'fadeIn'}" style="${cardStyles}">
          ${cardBgImageLayer}
          ${elementsRendered}
        </div>
        <script>setTimeout(function(){ ${pageCounterScripts} }, 100);<\/script>
      </section>
    `;
  }).join('\n');

  const effectsEngine = `
    window.activeIntervals = window.activeIntervals || [];
    function clearEffects() {
      if(window.activeIntervals){ window.activeIntervals.forEach(clearInterval); window.activeIntervals = []; }
      document.querySelectorAll('.effect-node').forEach(function(el){ el.remove(); });
    }
    function startEffect(id, accent, density) {
      clearEffects();
      if(!id || id === 'none') return;
      density = density || 50;
      if(['hearts','petals','snow','bubbles'].includes(id)) {
        var sym = id==='hearts'?'❤️':id==='petals'?'🌸':id==='snow'?'❄️':'🫧';
        var intervalTime = Math.max(50, 220 * (50 / density));
        var inv = setInterval(function(){
          var el = document.createElement('div');
          el.className = 'effect-node';
          el.textContent = sym;
          el.style.cssText = 'position:fixed;top:-20px;left:'+(Math.random()*100)+'vw;font-size:'+(Math.random()*16+12)+'px;pointer-events:none;z-index:1;opacity:'+(Math.random()*0.7+0.3)+';transition:transform 3.5s linear,opacity 3.5s;';
          document.body.appendChild(el);
          setTimeout(function(){ el.style.transform = 'translateY('+(window.innerHeight+40)+'px) rotate('+(Math.random()*360)+'deg)'; }, 30);
          setTimeout(function(){ el.remove(); }, 3500);
        }, intervalTime);
        window.activeIntervals.push(inv);
      }
      if(id === 'confetti') {
        var colors = [accent,'#ff6b9d','#ffd166','#06d6a0','#ff9f1c'];
        var intervalTime = Math.max(15, 50 * (50 / density));
        var inv = setInterval(function(){
          var el = document.createElement('div');
          el.className = 'effect-node';
          el.style.cssText = 'position:fixed;top:-10px;left:'+(Math.random()*100)+'vw;width:'+(Math.random()*8+6)+'px;height:'+(Math.random()*12+6)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';pointer-events:none;z-index:1;';
          document.body.appendChild(el);
          el.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:'translate('+(Math.random()*120-60)+'px,'+(window.innerHeight+20)+'px) rotate('+(Math.random()*540)+'deg)',opacity:0}],{duration:2500,easing:'linear'});
          setTimeout(function(){ el.remove(); }, 2500);
        }, intervalTime);
        window.activeIntervals.push(inv);
      }
      if(['stars','fireflies'].includes(id)) {
        var sym = id==='stars'?'⭐':'✨';
        var intervalTime = Math.max(30, 120 * (50 / density));
        var inv = setInterval(function(){
          var el = document.createElement('div');
          el.className = 'effect-node';
          el.textContent = sym;
          el.style.cssText = 'position:fixed;top:'+(Math.random()*100)+'vh;left:'+(Math.random()*100)+'vw;font-size:'+(Math.random()*10+8)+'px;pointer-events:none;z-index:1;';
          document.body.appendChild(el);
          el.animate([{opacity:0,transform:'scale(0.5)'},{opacity:Math.random()*0.8+0.2,transform:'scale(1.2)'},{opacity:0,transform:'scale(0.5)'}],{duration:1800,easing:'ease-in-out'});
          setTimeout(function(){ el.remove(); }, 1800);
        }, intervalTime);
        window.activeIntervals.push(inv);
      }
    }
  `;

  const routeDictionary = JSON.stringify(pages.reduce((acc, p) => {
    acc[p.id] = { effect: p.pageEffect || 'none', accent: getTheme(p.theme).accent, bgm: p.bgMusic || '', bgmStart: p.bgMusicStart || 0, bgmEnd: p.bgMusicEnd || 0, density: p.pageEffectDensity ?? 50 };
    return acc;
  }, {}));

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>💌 Our Valentine's Day</title>
  <link href="https://fonts.googleapis.com/css2?family=Mali:wght@400;600;700&family=Mitr:wght@300;400;500&family=Sarabun:wght@300;400;500;700&family=Kanit:wght@300;400;500;700&family=Charm:wght@400;700&family=Itim&family=Prompt:wght@300;400;500;700&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Mitr',sans-serif;min-height:100vh;overflow-x:hidden;background:#fff0f3;}
    .page-container{width:100%;min-height:100vh;transition:all 0.4s;}
    ${getAnimCSS()}
  </style>
</head>
<body>
  <audio id="global-bgm" loop></audio>
  ${sectionsHtml}
  <script>
    var metaDict = ${routeDictionary};
    function goTo(pageId) {
      if(!pageId||!document.getElementById(pageId)) return;
      document.querySelectorAll('.page-container').forEach(function(s){ s.style.display='none'; });
      var t=document.getElementById(pageId); t.style.display='flex';
      var card=t.querySelector('.card');
      if(card){ var cls=card.className; card.className=''; void card.offsetWidth; card.className=cls; }
      if(metaDict[pageId]){
        if(window.startEffect) startEffect(metaDict[pageId].effect,metaDict[pageId].accent,metaDict[pageId].density);
        var bgmEl=document.getElementById('global-bgm');
        if(bgmEl&&metaDict[pageId].bgm){
          var newSrc=metaDict[pageId].bgm;
          var bgmS=metaDict[pageId].bgmStart||0;
          var bgmE=metaDict[pageId].bgmEnd||0;
          bgmEl._bgmStart=bgmS; bgmEl._bgmEnd=bgmE;
          if(!bgmEl._loopListener){
            bgmEl._loopListener=function(){if(bgmEl._bgmEnd>0&&bgmEl.currentTime>=bgmEl._bgmEnd){bgmEl.currentTime=bgmEl._bgmStart||0;}};
            bgmEl.addEventListener('timeupdate',bgmEl._loopListener);
          }
          if(bgmEl.src!==newSrc){
            bgmEl.src=newSrc;
            bgmEl.onloadedmetadata=function(){bgmEl.currentTime=bgmS;bgmEl.play().catch(function(){});};
          } else {
            bgmEl.currentTime=bgmS;
            bgmEl.play().catch(function(){});
          }
        } else if(bgmEl){ bgmEl.pause(); }
      }
    }
    ${effectsEngine}
    // ── long-press-to-edit: กดค้าง 500ms เพื่อเปิด editor ──
    (function(){
      var _timer = null;
      var _moved = false;

      function cancel() {
        if (_timer) { clearTimeout(_timer); _timer = null; }
      }

      document.addEventListener('touchstart', function(e) {
        var wrap = e.target.closest('[data-eid]');
        if (!wrap) return;
        _moved = false;
        cancel();
        var eid = wrap.getAttribute('data-eid');
        _timer = setTimeout(function() {
          _timer = null;
          if (_moved) return;
          // visual feedback: flash the element
          wrap.style.transition = 'opacity 0.15s';
          wrap.style.opacity = '0.55';
          setTimeout(function(){ wrap.style.opacity = '1'; }, 200);
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'vb_tap_edit', eid: eid }, '*');
          }
        }, 500);
      }, { passive: true });

      document.addEventListener('touchmove',   function(){ _moved = true; cancel(); }, { passive: true });
      document.addEventListener('touchend',    cancel, { passive: true });
      document.addEventListener('touchcancel', cancel, { passive: true });
    })();
    window.addEventListener('DOMContentLoaded', function(){
      var firstId = "${pages[0]?.id || ''}";
      if(firstId&&metaDict[firstId]){
        startEffect(metaDict[firstId].effect, metaDict[firstId].accent, metaDict[firstId].density);
        var bgmEl=document.getElementById('global-bgm');
        if(bgmEl&&metaDict[firstId].bgm){
          var bgmS0=metaDict[firstId].bgmStart||0;
          var bgmE0=metaDict[firstId].bgmEnd||0;
          bgmEl.src=metaDict[firstId].bgm;
          bgmEl._bgmStart=bgmS0; bgmEl._bgmEnd=bgmE0;
          if(!bgmEl._loopListener){
            bgmEl._loopListener=function(){if(bgmEl._bgmEnd>0&&bgmEl.currentTime>=bgmEl._bgmEnd){bgmEl.currentTime=bgmEl._bgmStart||0;}};
            bgmEl.addEventListener('timeupdate',bgmEl._loopListener);
          }
          document.body.addEventListener('click',function initAudio(){bgmEl.currentTime=bgmS0;bgmEl.play();document.body.removeEventListener('click',initAudio);},{once:true});
        }
      }
    });
  <\/script>
</body>
</html>`;
}
