(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if(window.gsap && window.ScrollTrigger){ gsap.registerPlugin(ScrollTrigger); }
  const root = document.documentElement;

  /* =========================================================
     THEME SYSTEM
  ========================================================= */
  const ACCENTS = [
    { name:'Mono',    hex:'#f2f2ed' },
    { name:'Lime',    hex:'#c8ff00' },
    { name:'Cyan',    hex:'#00e5ff' },
    { name:'Magenta', hex:'#ff2ecb' },
    { name:'Amber',   hex:'#ffb000' },
    { name:'Red',     hex:'#ff3b3b' },
    { name:'Violet',  hex:'#b26bff' },
  ];
  function hexLuminance(hex){
    const c = hex.replace('#','');
    const r = parseInt(c.substr(0,2),16)/255, g = parseInt(c.substr(2,2),16)/255, b = parseInt(c.substr(4,2),16)/255;
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }
  function hexToRgb(hex){
    const c = hex.replace('#','');
    return { r:parseInt(c.substr(0,2),16), g:parseInt(c.substr(2,2),16), b:parseInt(c.substr(4,2),16) };
  }
  function rgbToHex(r,g,b){
    const h = (n)=> Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
    return '#' + h(r) + h(g) + h(b);
  }
  function mixHex(hexA, hexB, t){
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    return rgbToHex(a.r + (b.r-a.r)*t, a.g + (b.g-a.g)*t, a.b + (b.b-a.b)*t);
  }

  function setAccent(hex){
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-contrast', hexLuminance(hex) > 0.55 ? '#0a0a0a' : '#f5f5f0');
    document.querySelectorAll('.swatch').forEach(s=> s.classList.toggle('active', s.dataset.hex.toLowerCase() === hex.toLowerCase()));
  }

  const BACKGROUND_MOODS = [
    { name:'Void',     top:'#0a0a0a', bottom:'#131313' },
    { name:'Navy',     top:'#071122', bottom:'#0b1c35' },
    { name:'Charcoal', top:'#1f1f21', bottom:'#2c2c2f' },
    { name:'Paper',    top:'#f7f5ef', bottom:'#d8d5c9' },
  ];

  function updateMoodButtons(selectedName){
    document.querySelectorAll('.bg-opt[data-name]').forEach(btn => {
      const isSelected = btn.dataset.name === selectedName;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function setBackgroundMood(mood){
    const bgValue = `linear-gradient(180deg, ${mood.top} 0%, ${mood.bottom} 100%)`;
    const fgValue = textColorFor(mood.top);
    const panelValue = mixHex(mood.top, fgValue, 0.06);
    const panel2Value = mixHex(mood.top, fgValue, 0.12);
    const lineValue = mixHex(mood.top, fgValue, 0.22);
    const fgDimValue = mixHex(fgValue, mood.top, 0.35);

    root.style.setProperty('--bg', bgValue);
    root.style.setProperty('--bg-panel', panelValue);
    root.style.setProperty('--bg-panel-2', panel2Value);
    root.style.setProperty('--line', lineValue);
    root.style.setProperty('--fg', fgValue);
    root.style.setProperty('--fg-dim', fgDimValue);

    updateMoodButtons(mood.name);
  }

  /* ---- theme backgrounds ---- */

  function textColorFor(bgHex){
    return hexLuminance(bgHex) > 0.5 ? '#0c0c0a' : '#f2f2ed';
  }

  const accentSwatchRow = document.getElementById('accentSwatches');
  ACCENTS.forEach(a=>{
    const el = document.createElement('div');
    el.className = 'swatch';
    el.style.background = a.hex;
    el.dataset.hex = a.hex;
    el.title = a.name;
    el.addEventListener('click', ()=> setAccent(a.hex));
    accentSwatchRow.appendChild(el);
  });

  document.getElementById('customAccent').addEventListener('input', (e)=> setAccent(e.target.value));
  setAccent('#f2f2ed');

  document.querySelectorAll('.bg-opt[data-name]').forEach(btn => {
    btn.addEventListener('click', ()=> setBackgroundMood({
      name: btn.dataset.name,
      top: btn.dataset.top,
      bottom: btn.dataset.bottom,
    }));
  });
  setBackgroundMood(BACKGROUND_MOODS[0]);

  const themeBtn = document.getElementById('themeBtn');
  const themePanel = document.getElementById('themePanel');
  let panelOpen = false;
  themeBtn.addEventListener('click', ()=>{
    panelOpen = !panelOpen;
    themePanel.classList.toggle('open', panelOpen);
    if(window.gsap){
      gsap.to(themePanel, { opacity: panelOpen ? 1 : 0, y: panelOpen ? 0 : 12, scale: panelOpen ? 1 : 0.98, duration:0.25, ease:'power2.out' });
    } else {
      themePanel.style.opacity = panelOpen ? 1 : 0;
    }
  });
  document.addEventListener('click', (e)=>{
    if(panelOpen && !themePanel.contains(e.target) && e.target !== themeBtn){
      panelOpen = false;
      themePanel.classList.remove('open');
      if(window.gsap) gsap.to(themePanel, { opacity:0, y:12, scale:0.98, duration:0.2 });
    }
  });

  /* =========================================================
     TOASTS (achievement / level-up)
  ========================================================= */
  const toastLayer = document.getElementById('toastLayer');
  function showToast(label, sub){
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="t-label">' + label + '</span><span class="t-sub">' + sub + '</span>';
    toastLayer.appendChild(el);
    if(window.gsap){
      gsap.fromTo(el, { opacity:0, x:40 }, { opacity:1, x:0, duration:0.4, ease:'power3.out' });
      gsap.to(el, { opacity:0, x:20, duration:0.4, delay:2.6, ease:'power2.in', onComplete:()=> el.remove() });
    } else {
      el.style.opacity = 1;
      setTimeout(()=> el.remove(), 3000);
    }
  }

  /* =========================================================
     CURSOR (gsap quickTo smoothing)
  ========================================================= */
  const cursorDot = document.getElementById('cursorDot');
  if(!isTouch && window.gsap){
    const xTo = gsap.quickTo(cursorDot, 'x', { duration:0.25, ease:'power3' });
    const yTo = gsap.quickTo(cursorDot, 'y', { duration:0.25, ease:'power3' });
    window.addEventListener('mousemove', (e)=>{ xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button, .chip, .proj-card, .swatch, .bg-opt').forEach(el=>{
      el.addEventListener('mouseenter', ()=> cursorDot.classList.add('active'));
      el.addEventListener('mouseleave', ()=> cursorDot.classList.remove('active'));
    });
  } else if(!isTouch){
    window.addEventListener('mousemove', (e)=>{ cursorDot.style.left = e.clientX+'px'; cursorDot.style.top = e.clientY+'px'; });
  }

  /* =========================================================
     MOBILE MENU
  ========================================================= */
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', ()=> navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> navLinks.classList.remove('open')));

  /* =========================================================
     NAV UNDERLINE + ACTIVE LINK
  ========================================================= */
  const navAnchors = document.querySelectorAll('.nav-links a');
  navAnchors.forEach(a=>{
    const underline = a.querySelector('.nav-underline');
    if(window.gsap){
      a.addEventListener('mouseenter', ()=> gsap.to(underline, { width:'100%', duration:0.25 }));
      a.addEventListener('mouseleave', ()=>{ if(!a.classList.contains('active')) gsap.to(underline, { width:'0%', duration:0.25 }); });
    }
  });

  const seenLevels = new Set();
  const sections = document.querySelectorAll('section[data-level]');
  const flashLayer = document.getElementById('flashLayer');

  if(window.gsap && window.ScrollTrigger){
    sections.forEach(sec=>{
      ScrollTrigger.create({
        trigger: sec,
        start: 'top center',
        onEnter: ()=>{
          const id = sec.id;
          const underline = document.querySelector('.nav-links a[href="#'+id+'"] .nav-underline');
          navAnchors.forEach(a=>{
            a.classList.toggle('active', a.getAttribute('href') === '#'+id);
            if(!a.classList.contains('active')) gsap.to(a.querySelector('.nav-underline'), { width:'0%', duration:0.2 });
          });
          if(underline) gsap.to(underline, { width:'100%', duration:0.3 });

          const lvl = sec.dataset.level;
          if(!seenLevels.has(lvl)){
            seenLevels.add(lvl);
            gsap.fromTo(flashLayer, { opacity:0.5 }, { opacity:0, duration:0.5, ease:'power2.out' });
            showToast('LEVEL ' + lvl + ' UNLOCKED', sec.dataset.levelName + ' section reached');
          }
        }
      });
    });
  }

  /* =========================================================
     HERO ENTRANCE
  ========================================================= */
  function splitChars(el){
    const text = el.textContent;
    el.textContent = '';
    text.split('').forEach(ch=>{
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
    });
    return el.querySelectorAll('.split-char');
  }

  const heroSub = document.getElementById('heroSub');
  const subText = heroSub.textContent;
  const heroTitle = document.getElementById('heroTitle');
  const titleNode = document.createTextNode('Hexilon Payno');
  heroTitle.innerHTML = '';
  const titleSpan = document.createElement('span');
  titleSpan.appendChild(titleNode);
  heroTitle.appendChild(titleSpan);
  heroTitle.appendChild(heroSub);
  heroSub.textContent = subText;
  const titleChars = splitChars(titleSpan);
  const subChars = splitChars(heroSub);

  if(window.gsap){
    const tl = gsap.timeline({ defaults:{ ease:'power4.out' } });
    tl.set(titleChars, { yPercent:120 })
      .set(subChars, { yPercent:120 })
      .from('.eyebrow-row', { opacity:0, y:-10, duration:0.5 })
      .to(titleChars, { yPercent:0, duration:0.9, stagger:0.025 }, '-=0.2')
      .to(subChars, { yPercent:0, duration:0.6, stagger:0.012 }, '-=0.5')
      .from('.typed-line', { opacity:0, duration:0.4 }, '-=0.2')
      .from('.stat-bars .stat-row', { opacity:0, x:-16, duration:0.4, stagger:0.1 }, '-=0.1')
      .from('.hero-ctas .btn-pixel', { opacity:0, y:14, duration:0.4, stagger:0.1 }, '-=0.3')
      .from('.scroll-hint', { opacity:0, duration:0.4 }, '-=0.2')
      .from('#cubeStage', { opacity:0, scale:0.8, rotateY:40, duration:0.9, ease:'back.out(1.4)' }, '-=1');

    setTimeout(()=> showToast('WELCOME, PLAYER ONE', 'Scroll to explore the build'), 900);
  }

  /* =========================================================
     SECTION REVEALS (staggered groups)
  ========================================================= */
  if(window.gsap && window.ScrollTrigger){
    gsap.utils.toArray('.sec-head.reveal').forEach(el=>{
      gsap.fromTo(el, { opacity:0, y:24 }, {
        opacity:1, y:0, duration:0.7, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 85%' }
      });
    });

    gsap.utils.toArray('.about-grid > .reveal').forEach((el,i)=>{
      gsap.fromTo(el, { opacity:0, y:24 }, {
        opacity:1, y:0, duration:0.7, delay:i*0.1, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 85%' }
      });
    });

    gsap.utils.toArray('.quest.reveal').forEach((el,i)=>{
      gsap.fromTo(el, { opacity:0, x:-30 }, {
        opacity:1, x:0, duration:0.6, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });

    gsap.fromTo('.proj-card.reveal', { opacity:0, y:40 }, {
      opacity:1, y:0, duration:0.6, stagger:0.12, ease:'power3.out',
      scrollTrigger:{ trigger:'.proj-grid', start:'top 82%' }
    });

    gsap.utils.toArray('.node.reveal').forEach((el,i)=>{
      gsap.fromTo(el, { opacity:0, x:-20 }, {
        opacity:1, x:0, duration:0.6, ease:'power3.out',
        scrollTrigger:{ trigger: el, start:'top 88%' }
      });
    });

    gsap.fromTo('.chip.reveal', { opacity:0, y:16, scale:0.9 }, {
      opacity:1, y:0, scale:1, duration:0.4, stagger:0.05, ease:'back.out(2)',
      scrollTrigger:{ trigger:'.skills-strip', start:'top 88%' }
    });

    gsap.fromTo('.contact-panel.reveal', { opacity:0, y:30 }, {
      opacity:1, y:0, duration:0.7, ease:'power3.out',
      scrollTrigger:{ trigger:'.contact-panel', start:'top 85%' }
    });

    /* XP bars + number count-up */
    document.querySelectorAll('.bar-fill').forEach(bar=>{
      const val = bar.getAttribute('data-value');
      const numEl = bar.closest('.stat-row').querySelector('.stat-num');
      ScrollTrigger.create({
        trigger: bar, start:'top 90%', once:true,
        onEnter: ()=>{
          gsap.to(bar, { width: val+'%', duration:1.2, ease:'power2.out' });
          gsap.to({ v:0 }, { v: parseInt(val,10), duration:1.2, ease:'power2.out',
            onUpdate: function(){ numEl.textContent = Math.round(this.targets()[0].v); } });
        }
      });
    });
  } else {
    document.querySelectorAll('.bar-fill').forEach(bar=>{
      bar.style.width = bar.getAttribute('data-value') + '%';
    });
  }

  /* =========================================================
   LEVEL COUNTER (Dynamic Age)
========================================================= */
const lvlCount = document.getElementById('lvlCount');

// Birth date: October 21, 2003
const birthDate = new Date(2003, 9, 21); // Month is 0-based (9 = October)
const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();
const hasHadBirthday =
  today.getMonth() > birthDate.getMonth() ||
  (today.getMonth() === birthDate.getMonth() &&
   today.getDate() >= birthDate.getDate());

if (!hasHadBirthday) age--;

if (window.gsap) {
  gsap.to({ v: 0 }, {
    v: age,
    duration: 2,
    delay: 0.6,
    ease: "power1.out",

    onUpdate: function () {
      const current = Math.round(this.targets()[0].v);
      lvlCount.textContent = String(current).padStart(2, "0");

      // Gradually brighten as it approaches final value
      const progress = current / age;
      lvlCount.style.filter = `brightness(${1 + progress * 0.8})`;
      lvlCount.style.textShadow = `
        0 0 ${10 * progress}px rgba(255,255,255,0.8),
        0 0 ${20 * progress}px rgba(0,255,255,0.6)
      `;
    },

    onComplete: () => {
      // Celebration glow when reaching final age
      gsap.fromTo(
        lvlCount,
        {
          scale: 1,
          filter: "brightness(1.8)"
        },
        {
          scale: 1.15,
          filter: "brightness(2.2)",
          textShadow: `
            0 0 15px rgba(255,255,255,1),
            0 0 30px rgba(0,255,255,0.9),
            0 0 60px rgba(0,255,255,0.7)
          `,
          duration: 0.4,
          yoyo: true,
          repeat: 1
        }
      );
    }
  });
} else {
  lvlCount.textContent = String(age).padStart(2, "0");
}

  /* =========================================================
     TYPEWRITER
  ========================================================= */
  const typedTextEl = document.getElementById('typedText');
  const phrases = [
    '> building interfaces that feel like games_',
    '> currently shipping pixel-perfect UI_',
    '> designer by day, dungeon master by night_'
  ];
  if(reduceMotion){
    typedTextEl.textContent = phrases[0];
  } else {
    let phraseIndex = 0, charIndex = 0, deleting = false;
    function typeLoop(){
      const current = phrases[phraseIndex];
      if(!deleting){
        charIndex++;
        typedTextEl.textContent = current.slice(0, charIndex);
        if(charIndex === current.length){ deleting = true; setTimeout(typeLoop, 1600); return; }
      } else {
        charIndex--;
        typedTextEl.textContent = current.slice(0, charIndex);
        if(charIndex === 0){ deleting = false; phraseIndex = (phraseIndex+1) % phrases.length; }
      }
      setTimeout(typeLoop, deleting ? 30 : 55);
    }
    typeLoop();
  }

  /* =========================================================
     MAGNETIC BUTTONS
  ========================================================= */
  if(!isTouch && window.gsap){
    document.querySelectorAll('.magnetic').forEach(btn=>{
      const xTo = gsap.quickTo(btn, 'x', { duration:0.3, ease:'power3' });
      const yTo = gsap.quickTo(btn, 'y', { duration:0.3, ease:'power3' });
      btn.addEventListener('mousemove', (e)=>{
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width/2) * 0.35);
        yTo((e.clientY - r.top - r.height/2) * 0.35);
      });
      btn.addEventListener('mouseleave', ()=>{ xTo(0); yTo(0); });
    });
  }

  /* =========================================================
     BUTTON CLICK: pixel-burst + punch
  ========================================================= */
  function pixelBurst(x, y){
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#fff';
    for(let i=0;i<10;i++){
      const p = document.createElement('div');
      p.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:6px;height:6px;background:'+accent+';z-index:9600;pointer-events:none;';
      document.body.appendChild(p);
      const angle = (Math.PI*2) * (i/10);
      const dist = 40 + Math.random()*40;
      if(window.gsap){
        gsap.to(p, {
          x: Math.cos(angle)*dist, y: Math.sin(angle)*dist,
          opacity:0, duration:0.6, ease:'power2.out',
          onComplete: ()=> p.remove()
        });
      } else { p.remove(); }
    }
  }

  document.querySelectorAll('.btn-pixel').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      pixelBurst(e.clientX, e.clientY);
      if(window.gsap) gsap.fromTo(btn, { scale:0.92 }, { scale:1, duration:0.3, ease:'elastic.out(1,0.4)' });
    });
  });

  document.querySelectorAll('.proj-link').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const card = btn.closest('.proj-card');
      pixelBurst(e.clientX, e.clientY);
      showToast('ACHIEVEMENT UNLOCKED', card.dataset.title + ' logged');
      if(window.gsap) gsap.fromTo(card, { boxShadow:'0 0 0px var(--accent)' }, { boxShadow:'0 0 24px var(--accent)', duration:0.2, yoyo:true, repeat:1 });
    });
  });

  /* =========================================================
     GLITCH / SCRAMBLE HEADING ON HOVER
  ========================================================= */
  const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________';
  document.querySelectorAll('.glitch-target').forEach(h=>{
    const original = h.textContent;
    let running = false;
    h.addEventListener('mouseenter', ()=>{
      if(running || reduceMotion) return;
      running = true;
      let frame = 0;
      const totalFrames = 14;
      const interval = setInterval(()=>{
        h.textContent = original.split('').map((ch,i)=>{
          if(ch === ' ') return ' ';
          const progress = frame - i*0.8;
          if(progress > totalFrames*0.5) return ch;
          if(progress < 0) return ch;
          return GLITCH_CHARS[Math.floor(Math.random()*GLITCH_CHARS.length)];
        }).join('');
        frame++;
        if(frame > totalFrames + original.length){
          clearInterval(interval);
          h.textContent = original;
          running = false;
        }
      }, 35);
    });
  });

  /* =========================================================
     CUBE: idle auto-rotate + drag interaction
  ========================================================= */
  const cube = document.getElementById('cube');
  const cubeStage = document.getElementById('cubeStage');
  let rotX = -18, rotY = 28;
  let idle = true, dragging = false, lastX = 0, lastY = 0;
  let velX = 0.15, velY = 0.2;

  function applyCubeTransform(){
    cube.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
  }
  applyCubeTransform();

  if(window.gsap && !reduceMotion){
    gsap.ticker.add(()=>{
      if(idle && !dragging){
        rotX += velX * 0.4;
        rotY += velY * 0.4;
        applyCubeTransform();
      }
    });
  }

  function pointerDown(e){
    dragging = true; idle = false;
    const p = e.touches ? e.touches[0] : e;
    lastX = p.clientX; lastY = p.clientY;
  }
  function pointerMove(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastX, dy = p.clientY - lastY;
    rotY += dx * 0.4;
    rotX -= dy * 0.4;
    velX = -dy * 0.02;
    velY = dx * 0.02;
    lastX = p.clientX; lastY = p.clientY;
    applyCubeTransform();
  }
  function pointerUp(){
    dragging = false;
    setTimeout(()=> idle = true, 600);
  }
  cubeStage.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  cubeStage.addEventListener('touchstart', pointerDown, { passive:true });
  window.addEventListener('touchmove', pointerMove, { passive:true });
  window.addEventListener('touchend', pointerUp);

  /* =========================================================
     KONAMI CODE EASTER EGG
  ========================================================= */
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;
  window.addEventListener('keydown', (e)=>{
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if(key === konami[konamiIndex]){
      konamiIndex++;
      if(konamiIndex === konami.length){
        konamiIndex = 0;
        showToast('CHEAT CODE ACCEPTED', 'Infinite style unlocked');
        if(window.gsap){
          let i = 0;
          const cycle = setInterval(()=>{
            setAccent(ACCENTS[i % ACCENTS.length].hex);
            i++;
            if(i > 14){ clearInterval(cycle); }
          }, 120);
          gsap.fromTo(flashLayer, { opacity:0.6 }, { opacity:0, duration:0.8 });
        }
      }
    } else {
      konamiIndex = key === konami[0] ? 1 : 0;
    }
  });

  /* =========================================================
     BACK TO TOP BUTTON
  ========================================================= */
  const backToTop = document.getElementById('backToTop');
  if(backToTop){
    const toggle = ()=> backToTop.classList.toggle('visible', window.scrollY > 320);
    window.addEventListener('scroll', toggle, { passive:true });
    // initial state
    toggle();
    backToTop.addEventListener('click', ()=>{ window.scrollTo({ top:0, behavior:'smooth' }); backToTop.blur(); });
    // keyboard shortcut: press 't' to jump top
    window.addEventListener('keydown', (e)=>{ if(e.key === 't' || e.key === 'T') window.scrollTo({ top:0, behavior:'smooth' }); });
  }

})();