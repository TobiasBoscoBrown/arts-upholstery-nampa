/* Art's Upholstery Shop — shared interactivity (theme, menu, hours, gallery, carousel, counters) */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- THEME TOGGLE (signature feature) ---------- */
  function currentTheme(){ return document.documentElement.classList.contains('dark') ? 'dark' : 'light'; }
  function applyTheme(t){
    var root = document.documentElement;
    if(t === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  window.__setTheme = function(t){ try{ localStorage.setItem('arts-theme', t); }catch(e){} applyTheme(t); };
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-theme-toggle]');
    if(!t) return;
    document.documentElement.classList.add('theme-transition');
    window.__setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  // keyboard: space/enter already fire click on <button>

  /* ---------- MOBILE MENU ---------- */
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-menu-toggle]');
    if(b){ var m = document.getElementById('mobnav'); if(m){ m.classList.toggle('hidden'); b.setAttribute('aria-expanded', m.classList.contains('hidden')?'false':'true'); } return; }
    if(e.target.closest('#mobnav a')){ var m2 = document.getElementById('mobnav'); if(m2) m2.classList.add('hidden'); }
  });

  /* ---------- OPEN / CLOSED BADGE ---------- */
  // hours index 0=Sun..6=Sat -> [open,close] in minutes, null = closed
  var HRS = { 0:null, 1:[540,1020], 2:[540,1020], 3:[540,1020], 4:[540,1020], 5:[540,900], 6:null };
  function refreshOpen(){
    var els = document.querySelectorAll('[data-openbadge]'); if(!els.length) return;
    var now = new Date(); var d = now.getDay(); var mins = now.getHours()*60 + now.getMinutes();
    var span = HRS[d]; var open = !!(span && mins >= span[0] && mins < span[1]);
    els.forEach(function(el){
      var dot = el.querySelector('[data-dot]'); var txt = el.querySelector('[data-txt]');
      if(txt) txt.textContent = open ? 'Open now' : 'Closed now';
      if(dot){ dot.style.background = open ? '#3f9d57' : '#b14a3a'; }
    });
  }
  refreshOpen(); setInterval(refreshOpen, 60000);

  /* ---------- DUPLICATE CAROUSEL/MARQUEE TRACKS FOR SEAMLESS LOOP ---------- */
  document.querySelectorAll('[data-loop]').forEach(function(tr){
    tr.innerHTML = tr.innerHTML + tr.innerHTML;
  });

  /* ---------- ANIMATED COUNTERS ---------- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count')); var dec = (el.getAttribute('data-dec')==='1');
    if(reduce){ el.textContent = dec ? target.toFixed(1) : Math.round(target); return; }
    var start = null, dur = 1200;
    function step(ts){ if(!start) start = ts; var p = Math.min((ts-start)/dur,1); var v = target*(0.5-Math.cos(Math.PI*p)/2);
      el.textContent = dec ? v.toFixed(1) : Math.round(v); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); io.unobserve(e.target); } });
  }, {threshold:.6}) : null;
  document.querySelectorAll('[data-count]').forEach(function(el){ if(io) io.observe(el); else animateCount(el); });

  /* ---------- GALLERY LIGHTBOX ---------- */
  var imgs = [].slice.call(document.querySelectorAll('[data-lb]'));
  if(imgs.length){
    var lb = document.createElement('div'); lb.className='lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
    lb.innerHTML = '<button class="lb__btn lb__close" aria-label="Close">&times;</button>'+
      '<button class="lb__btn lb__prev" aria-label="Previous">&#8249;</button>'+
      '<img alt="">'+
      '<button class="lb__btn lb__next" aria-label="Next">&#8250;</button>'+
      '<div class="lb__cap"></div>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb__cap'); var idx = 0;
    function show(i){ idx = (i+imgs.length)%imgs.length; var s = imgs[idx]; lbImg.src = s.getAttribute('data-full')||s.src; lbImg.alt = s.alt||''; lbCap.textContent = s.alt||''; }
    function open(i){ show(i); lb.classList.add('open'); lb.querySelector('.lb__close').focus(); }
    function close(){ lb.classList.remove('open'); }
    imgs.forEach(function(im,i){ im.style.cursor='zoom-in'; im.setAttribute('tabindex','0'); im.setAttribute('role','button');
      im.addEventListener('click', function(){ open(i); });
      im.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(i);} });
    });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__next').addEventListener('click', function(){ show(idx+1); });
    lb.querySelector('.lb__prev').addEventListener('click', function(){ show(idx-1); });
    lb.addEventListener('click', function(e){ if(e.target===lb) close(); });
    document.addEventListener('keydown', function(e){ if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') close(); else if(e.key==='ArrowRight') show(idx+1); else if(e.key==='ArrowLeft') show(idx-1); });
    // swipe
    var sx=0; lb.addEventListener('touchstart',function(e){ sx=e.touches[0].clientX; },{passive:true});
    lb.addEventListener('touchend',function(e){ var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>40){ show(dx<0?idx+1:idx-1);} });
  }

  /* reveal year */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
