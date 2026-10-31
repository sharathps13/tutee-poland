/* ==========================================================================
   Tutee Connect — Study in Poland
   All interaction and motion for index.html and universities.html.
   Vanilla JS, no dependencies (the CSP allows same-origin scripts only).
   Loaded with `defer`, so the DOM is ready when this runs.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* requestAnimationFrame with a timer fallback: some embedded or throttled
     views never paint, and counters / scroll scenes must still settle. */
  function frame(cb) {
    var done = false;
    var f = function () { if (done) return; done = true; cb(performance.now()); };
    requestAnimationFrame(f);
    setTimeout(f, 60);
  }

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE    = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var isMobile = function () { return window.innerWidth <= 760; };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Minimal markdown: **bold**, paragraphs, line breaks. Escapes HTML first. */
  function mdToHtml(s) {
    return esc(s).split(/\n{2,}/).map(function (p) {
      return '<p>' + p.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /* City positions on the 600-wide Poland map (equirectangular, cos 52°). */
  var CITY_XY = {
    'Warsaw': [408.3, 262.1], 'Kraków': [346.0, 467.4], 'Poznań': [170.7, 245.1], 'Gdańsk': [270.9, 61.5],
    'Wrocław': [177.1, 368.1], 'Łódź': [318.1, 306.6], 'Toruń': [268.0, 188.3], 'Katowice': [292.4, 448.5],
    'Lublin': [499.2, 354.8], 'Szczecin': [32.0, 148.5], 'Białystok': [533.6, 176.9], 'Bydgoszcz': [233.0, 177.9],
    'Kielce': [386.2, 390.8], 'Bielsko-Biała': [293.6, 490.1], 'Gdynia': [263.9, 45.4], 'Opole': [228.9, 409.7],
    'Rzeszów': [466.0, 469.3], 'Olsztyn': [378.1, 115.4], 'Częstochowa': [298.3, 396.4], 'Gliwice': [272.0, 445.6]
  };
  var cityOf = function (loc) { return String(loc || '').split(',')[0].trim(); };
  var regionOf = function (loc) { var p = String(loc || '').split(','); return (p[1] || '').trim(); };

  /* ------------------------------------------------------------------ *
   * Navigation helpers
   * ------------------------------------------------------------------ */
  var isHome = !!document.getElementById('home');

  function smoothTo(id) {
    var t = document.getElementById(id);
    if (!t) return false;
    var y = t.getBoundingClientRect().top + window.pageYOffset - (id === 'contact' ? 20 : 70);
    window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
    return true;
  }
  function goToSection(id) {
    if (id === 'top') {
      if (isHome) window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      else window.location.href = './index.html';
      return;
    }
    if (!smoothTo(id)) window.location.href = './index.html#' + id;
  }

  /* ------------------------------------------------------------------ *
   * 1. Page ready — no loading screen; the hero eases in on the first frame
   * ------------------------------------------------------------------ */
  function initCurtain() {
    frame(function () {
      document.documentElement.classList.add('is-loaded');
      document.body.classList.add('is-loaded');
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Header, progress bar, mobile menu, section rail
   * ------------------------------------------------------------------ */
  function initHeader() {
    var header = $('[data-header]');
    var bar = $('.progress');
    var lastY = window.pageYOffset;
    function onScroll() {
      var y = window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      if (!header) return;
      header.classList.toggle('scrolled', y > 30);
      var menuOpen = document.body.classList.contains('menu-open');
      if (!menuOpen && y > 700 && y > lastY + 4) header.classList.add('hide');
      else if (y < lastY - 4 || y < 700) header.classList.remove('hide');
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!isHome) $$('[data-nav="universities"]').forEach(function (a) { a.classList.add('active'); });
  }

  function initMobileMenu() {
    var btn = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!btn || !menu) return;
    function set(open) {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    btn.addEventListener('click', function () { set(!document.body.classList.contains('menu-open')); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  function initScrollLinks() {
    $$('[data-scroll-to]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var id = el.getAttribute('data-scroll-to');
        if (document.getElementById(id)) {
          e.preventDefault();
          setTimeout(function () { smoothTo(id); }, document.body.classList.contains('menu-open') ? 450 : 0);
        } else if (el.tagName !== 'A') {
          goToSection(id);
        }
      });
    });
    $$('[data-scroll-top]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (!isHome) return;            // on the directory the logo goes home
        e.preventDefault();
        goToSection('top');
      });
    });
  }

  function initRail() {
    var rail = $('[data-rail]');
    var sections = $$('[data-rail-label]');
    if (!rail || sections.length < 3) return;
    rail.innerHTML = sections.map(function (s, i) {
      return '<a href="#' + s.id + '" data-label="' + esc(s.getAttribute('data-rail-label')) + '" aria-label="' + esc(s.getAttribute('data-rail-label')) + '" data-i="' + i + '"></a>';
    }).join('');
    var dots = $$('a', rail);
    dots.forEach(function (d, i) {
      d.addEventListener('click', function (e) { e.preventDefault(); smoothTo(sections[i].id); });
    });
    function onScroll() {
      var mid = window.innerHeight * 0.5, cur = 0;
      sections.forEach(function (s, i) { if (s.getBoundingClientRect().top <= mid) cur = i; });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
      rail.classList.toggle('dark', sections[cur].hasAttribute('data-dark'));
      rail.classList.toggle('show', window.pageYOffset > window.innerHeight * 0.6);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------ *
   * 3. Reveals, split headings, count-ups
   * ------------------------------------------------------------------ */
  function splitWords(root) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inner = document.createElement('span'); inner.style.setProperty('--i', i++); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('swash')) {
          walk(n);
        }
      });
    })(root);
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if (REDUCED) { el.textContent = target; return; }
    var t0 = null, dur = 1600;
    (function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame(step);
    })(performance.now());
  }

  function initReveal() {
    $$('[data-split]').forEach(splitWords);
    var targets = $$('[data-reveal], [data-split], [data-count]');
    if (!('IntersectionObserver' in window) || REDUCED) {
      targets.forEach(function (el) {
        el.classList.add('in');
        if (el.hasAttribute('data-count')) el.textContent = el.getAttribute('data-count');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute('data-count')) {
          // hero counters wait for the curtain
          var delay = el.closest('.hero, .u-hero') ? 250 : 0;
          el.__counted = true;
          setTimeout(function () { countUp(el); }, delay);
        } else {
          el.classList.add('in');
        }
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });

    /* Safety net: if the observer never reports (non-painting embeds), settle
       whatever is on screen so nothing is left invisible or reading 0. */
    setTimeout(function () {
      targets.forEach(function (el) {
        if (el.classList.contains('in') || el.__counted) return;
        var r = el.getBoundingClientRect();
        if (r.top > window.innerHeight || r.bottom < 0) return;
        io.unobserve(el);
        if (el.hasAttribute('data-count')) { el.__counted = true; el.textContent = el.getAttribute('data-count'); }
        else el.classList.add('in');
      });
    }, 2600);
  }

  /* A click sends out a tight ring of short, thin lines in the colours of the Polish flag,
     alternating white and red, that flick out just around the point of the click and fade.
     One canvas over the page, drawn only while lines are alive. Mouse and trackpad
     only, off for reduced motion. */
  function initFlagCursor() {
    if (!FINE || REDUCED) return;
    var cv = document.createElement('canvas'), cx = cv.getContext('2d');
    cv.className = 'pl-sparks'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var dpr = 1, bursts = [], running = false, RAYS = 14, DUR = 420;
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    }
    size(); window.addEventListener('resize', size);
    function draw(t) {
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx.clearRect(0, 0, innerWidth, innerHeight);
      bursts = bursts.filter(function (b) { return t - b.t0 < DUR; });
      bursts.forEach(function (b) {
        var k = (t - b.t0) / DUR, e = 1 - Math.pow(1 - k, 3);   // ease out
        var inner = 3 + 5 * e, outer = 6 + 8 * Math.min(1, e * 1.25);   // a tight ring of short lines
        cx.globalAlpha = 1 - k; cx.lineWidth = 1.2; cx.lineCap = 'round';
        for (var i = 0; i < RAYS; i++) {
          var a = b.a0 + i * Math.PI * 2 / RAYS, c = Math.cos(a), s = Math.sin(a);
          cx.strokeStyle = i % 2 ? '#d4213d' : '#ffffff';
          cx.shadowColor = i % 2 ? 'transparent' : 'rgba(29, 14, 15, .55)'; cx.shadowBlur = i % 2 ? 0 : 1.5;
          cx.beginPath(); cx.moveTo(b.x + c * inner, b.y + s * inner); cx.lineTo(b.x + c * outer, b.y + s * outer); cx.stroke();
        }
        cx.shadowBlur = 0;
      });
      if (bursts.length) requestAnimationFrame(draw); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      bursts.push({ x: e.clientX, y: e.clientY, t0: performance.now(), a0: Math.random() * Math.PI });
      if (!running) { running = true; requestAnimationFrame(draw); }
    });
  }

  /* Sections off screen get .idle, which pauses their looping CSS animations (spinning
     rosettes, logo and story marquees, the waving flag, the Select buttons' ring) so they
     cost nothing there. */
  function initIdleSections() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('idle', !e.isIntersecting); });
    }, { rootMargin: '200px 0px' });
    $$('main > section, .dir-body, .contact, .footer').forEach(function (s) { io.observe(s); });
  }

  /* Magnetic buttons + the cursor-following fill. */
  function initButtons() {
    if (!FINE || REDUCED) return;
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      if (!b) return;
      var r = b.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      b.style.setProperty('--mx', (x / r.width * 100) + '%');
      b.style.setProperty('--my', (y / r.height * 100) + '%');
      b.style.transform = 'translate(' + ((x - r.width / 2) * 0.12) + 'px,' + ((y - r.height / 2) * 0.2) + 'px)';
    });
    document.addEventListener('pointerout', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      if (b && !b.contains(e.relatedTarget)) b.style.transform = '';
    });
  }

  /* Duplicate marquee content so translateX(-50%) loops seamlessly. */
  function initMarquees() {
    $$('[data-marquee]').forEach(function (m) {
      var g = $('.marquee-group', m);
      if (!g) return;
      var c = g.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('a, button', c).forEach(function (x) { x.tabIndex = -1; });
      m.appendChild(c);
    });
    $$('[data-logo-row]').forEach(function (row) {
      $$('img', row).forEach(function (img) {
        var c = img.cloneNode(true); c.alt = ''; c.setAttribute('aria-hidden', 'true'); row.appendChild(c);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Hero (POLSKA): a gold seam opens the letterbox; the landmark
   *    photo lies dimmed across the screen and shows at full brightness
   *    through the giant letters, lined up exactly; places crossfade and
   *    gold dust drifts and gathers at the cursor.
   * ------------------------------------------------------------------ */
  function initHero() {
    var hero = $('.im');
    if (!hero) return;

    // --- the opening: a gold seam, then the letterbox parts -----------------
    // wait for the first HD photo to decode (up to 1.5s) so it never opens on a blank frame
    var opened = false;
    function open() { if (opened) return; opened = true; hero.classList.add('open'); }
    var firstImg = $('[data-im-photos] figure.on img', hero);
    if (REDUCED) open();
    else {
      if (firstImg && firstImg.decode) firstImg.decode().then(function () { setTimeout(open, 120); }, function () { open(); });
      else setTimeout(open, 300);
      setTimeout(open, 1500);
    }
    // later photos load just before they're needed
    function ensure(fig) {
      var img = fig && $('img', fig);
      if (!img || !img.getAttribute('data-src')) return;
      $$('source[data-srcset]', fig).forEach(function (so) { so.setAttribute('srcset', so.getAttribute('data-srcset')); so.removeAttribute('data-srcset'); });
      img.setAttribute('srcset', img.getAttribute('data-srcset'));
      img.setAttribute('src', img.getAttribute('data-src'));
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    }

    // --- cities ------------------------------------------------------------
    // the row of places: the line above a place fills while its photo plays;
    // clicking (or hovering, with a mouse) jumps straight there
    var figs = $$('[data-im-photos] figure', hero), nav = $('[data-im-cities]', hero), frameEl = $('[data-im-frame]', hero) || hero;
    var noteEl = $('[data-im-note]', hero), i = 0, DUR = 7000, timer = 0;
    if (nav) nav.innerHTML = figs.map(function (f, j) {
      return '<button type="button" aria-pressed="' + (j === 0) + '"><b>' + esc(f.getAttribute('data-short') || f.getAttribute('data-city')) +
        '</b><small><span>' + esc(f.getAttribute('data-note')) + '</span></small></button>';
    }).join('');
    var tabs = nav ? $$('button', nav) : [];

    // --- the word: one copy per photo, each painted with that photo -------
    // sized and positioned to match the dimmed full-screen copy behind it
    var word = $('[data-pl-word]', hero), copies = [];
    if (word) {
      var letters = '<span class="pl-l1">POLSKA</span><span class="pl-l2">POL<br>SKA</span>';
      word.innerHTML = '<span class="pl-ghost">' + letters + '</span>' + figs.map(function (f, j) {
        return '<span class="pl-copy-l' + (j === 0 ? ' on' : '') + '">' + letters + '</span>';
      }).join('');
      copies = $$('.pl-copy-l', word);
    }
    function fitWord() {
      if (!word) return;
      var ghost = word.firstChild;
      word.style.fontSize = '100px';
      var r = ghost.getBoundingClientRect(), two = r.height > r.width * .5;
      var fs = Math.min(100 * word.clientWidth / r.width, 100 * window.innerHeight * (two ? .42 : .36) / r.height);
      word.style.fontSize = fs.toFixed(1) + 'px';
    }
    function paint(j) {
      var img = $('img', figs[j]), c = copies[j];
      if (!c || !img || !img.naturalWidth || !img.currentSrc) return;
      var hr = frameEl.getBoundingClientRect(), cr = c.getBoundingClientRect();
      var s = Math.max(hr.width / img.naturalWidth, hr.height / img.naturalHeight), bw = img.naturalWidth * s, bh = img.naturalHeight * s;
      c.style.backgroundImage = 'url("' + img.currentSrc + '")';
      c.style.backgroundSize = bw.toFixed(1) + 'px ' + bh.toFixed(1) + 'px';
      c.style.backgroundPosition = ((hr.width - bw) / 2 + hr.left - cr.left).toFixed(1) + 'px ' + ((hr.height - bh) / 2 + hr.top - cr.top).toFixed(1) + 'px';
    }
    function layoutWord() { fitWord(); copies.forEach(function (c, j) { paint(j); }); }
    figs.forEach(function (f, j) {
      var img = $('img', f);
      if (img) img.addEventListener('load', function () { paint(j); });
    });
    layoutWord();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWord);
    window.addEventListener('resize', function () { clearTimeout(layoutWord.t); layoutWord.t = setTimeout(layoutWord, 120); });

    function mark(play) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-pressed', String(j === i));
        t.classList.remove('on');
        if (j === i && play) { void t.offsetWidth; t.classList.add('on'); }
      });
    }
    function show(j) {
      if (j === i) return;
      figs[i].classList.remove('on');
      i = j;
      ensure(figs[i]); ensure(figs[(i + 1) % figs.length]);
      figs[i].classList.add('on');
      copies.forEach(function (c, k) { c.classList.toggle('on', k === i); });
      paint(i);
      if (noteEl) noteEl.innerHTML = '<span>' + esc(figs[i].getAttribute('data-note')) + '</span>';
    }
    function schedule() { clearTimeout(timer); if (!REDUCED) { mark(true); timer = setTimeout(next, DUR); } else mark(false); }
    function next() {
      if (document.hidden) { timer = setTimeout(next, DUR); return; }
      show((i + 1) % figs.length); schedule();
    }
    tabs.forEach(function (t, j) {
      t.addEventListener('click', function () { show(j); schedule(); });
      if (FINE) t.addEventListener('mouseenter', function () { if (j !== i) { show(j); schedule(); } });
    });
    if (figs.length > 1 && !REDUCED) { setTimeout(function () { ensure(figs[1]); schedule(); }, 2600); }

    // --- the cursor, for the dust -------------------------------------------
    var mouse = { x: -9999, y: -9999 };
    if (FINE && !REDUCED) {
      hero.addEventListener('pointermove', function (e) {
        var r = frameEl.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      });
      hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    }

    // on phones the floating chat buttons would sit over the hero's controls, so
    // they wait until the hero has mostly scrolled away
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      document.body.classList.toggle('at-hero', es[0].intersectionRatio > .35);
    }, { threshold: [0, .35, 1] }).observe(hero);

    // --- gold dust ----------------------------------------------------------
    var canvas = $('[data-im-dust]', hero);
    if (!canvas || REDUCED || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // the glow, drawn once: a soft gold dot with a warm halo, stamped at each particle's size and strength
    var glowImg = document.createElement('canvas'); glowImg.width = glowImg.height = 64;
    (function () {
      var g2 = glowImg.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255, 220, 150, 1)'); gr.addColorStop(.4, 'rgba(244, 161, 58, .45)'); gr.addColorStop(1, 'rgba(244, 161, 58, 0)');
      g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
    })();
    var W = 0, H = 0, parts = [], visible = true;
    function size() {
      var r = frameEl.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 760 ? 26 : 60;
      parts = [];
      for (var k = 0; k < n; k++) parts.push(spawn(true));
    }
    function spawn(anywhere) {
      return {
        x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10,
        r: .6 + Math.random() * 2.2, vy: .15 + Math.random() * .45, vx: (Math.random() - .5) * .25,
        a: .25 + Math.random() * .6, tw: Math.random() * Math.PI * 2
      };
    }
    function draw() {
      if (!visible || document.hidden) { setTimeout(function () { frame(draw); }, 250); return; }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k];
        var dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy, near = d2 < 26000;
        if (near) { var d = Math.sqrt(d2) || 1; p.vx += dx / d * .012; p.vy += .004; }   // drawn gently toward the cursor
        p.vx *= .985; p.x += p.vx; p.y -= p.vy; p.tw += .04;
        if (p.y < -10 || p.x < -20 || p.x > W + 20) parts[k] = spawn(false);
        var glow = (near ? 1.6 : 1) * p.a * (.65 + .35 * Math.sin(p.tw)), rad = p.r * (near ? 4.5 : 3.2);
        ctx.globalAlpha = Math.min(1, glow);
        ctx.drawImage(glowImg, p.x - rad, p.y - rad, rad * 2, rad * 2);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    size();
    window.addEventListener('resize', function () { clearTimeout(size.t); size.t = setTimeout(size, 200); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------ *
   * 5. Scroll-linked scenes (one rAF loop)
   * ------------------------------------------------------------------ */
  var scenes = [];
  function addScene(fn) { scenes.push(fn); }
  function initSceneLoop() {
    var ticking = false;
    function run() { ticking = false; scenes.forEach(function (fn) { fn(); }); }
    function req() { if (!ticking) { ticking = true; frame(run); } }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    run();
  }

  /* Why Poland: vertical scroll drives a horizontal track, one card at a time.
     The scroll is shared out as one stop per card and the track glides between
     them, easing behind the scroll. Each scroll moves exactly one card (see
     below). A scrubber and a skip button let the reader jump through or past it
     instead of being held in it. */
  var HSCROLL_STEP = 0.36;   // viewport heights of scroll per card…
  var HSCROLL_STEP_MIN = 260, HSCROLL_STEP_MAX = 380;   // …kept within these, in px
  var HSCROLL_HOLD = 0.08;   // share of each step spent standing still, at each end
  function initHScroll() {
    var pin = $('[data-hscroll]');
    var track = $('[data-hscroll-track]');
    if (!pin || !track) return;
    var nav = $('[data-hscroll-nav]');
    var scrub = $('[data-hscroll-scrub]');
    var idxEl = $('[data-hscroll-index]');
    var cards = $$('.why-card', track);
    var stops = [0], owner = [-1], stopOf = [], ticks = [];
    // phones list the reasons as slim rows: tap one to read it (one open at a time)
    cards.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'why-more';
      b.setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-label', 'Read about: ' + ($('h3', c) || c).textContent);
      c.appendChild(b);
      b.addEventListener('click', function () {
        var open = !c.classList.contains('open');
        cards.forEach(function (o) { o.classList.remove('open'); $('.why-more', o).setAttribute('aria-expanded', 'false'); });
        if (open) { c.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
      });
      if (i === 0) { c.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
    var enabled = false, p = 0, x = 0, tx = 0, gliding = false, on = -2;
    snapDots(track, Array.prototype.slice.call(track.children));

    // a stop for the intro, then one that centres each card (the first and last cards can't
    // centre, so their stops may barely move the track; the focus still steps card to card)
    function measure() {
      enabled = !REDUCED && !isMobile();
      track.classList.toggle('hs-on', enabled);
      if (!enabled) { pin.style.height = ''; track.style.transform = ''; track.classList.remove('has-on'); return; }
      track.style.transform = 'translate3d(0,0,0)';
      var vw = window.innerWidth;
      var dist = Math.max(0, track.lastElementChild.getBoundingClientRect().right - vw + parseFloat(getComputedStyle(track).paddingLeft));
      stops = [0]; owner = [-1];
      cards.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        stops.push(clamp(r.left + r.width / 2 - vw / 2, 0, dist)); owner.push(i);
      });
      stopOf = cards.map(function (c, i) { return i + 1; });
      var step = clamp(window.innerHeight * HSCROLL_STEP, HSCROLL_STEP_MIN, HSCROLL_STEP_MAX);
      pin.style.height = (window.innerHeight + (stops.length - 1) * step) + 'px';
      ticks.forEach(function (t, i) { t.style.left = (stopQ(stopOf[i]) * 100) + '%'; });
      x = tx = target(); paint();
    }

    var stopQ = function (j) { return stops.length > 1 ? j / (stops.length - 1) : 0; };
    // progress → track offset: hold on a stop, ease across to the next, hold again
    function target() {
      var k = stops.length - 1;
      if (k < 1) return stops[0];
      var seg = p * k, i = Math.min(k - 1, Math.floor(seg));
      var m = clamp((seg - i - HSCROLL_HOLD) / (1 - 2 * HSCROLL_HOLD), 0, 1);
      m = m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
      return stops[i] + (stops[i + 1] - stops[i]) * m;
    }

    function paint() {
      track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      var o = owner[Math.round(p * (stops.length - 1))];
      if (o === on) return;
      on = o;
      cards.forEach(function (c, i) { c.classList.toggle('on', i === on); });
      track.classList.toggle('has-on', on >= 0);
      var n = Math.max(0, on) + 1;
      if (idxEl) idxEl.textContent = ('0' + n).slice(-2);
      if (scrub) scrub.setAttribute('aria-valuenow', String(n));
    }
    function glide() {
      x += (tx - x) * 0.14;
      if (Math.abs(tx - x) < 0.5) { x = tx; gliding = false; } else frame(glide);
      paint();
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // where on the page a given progress (0..1) sits
    function yFor(q) { return pin.getBoundingClientRect().top + window.pageYOffset + clamp(q, 0, 1) * (pin.offsetHeight - window.innerHeight); }
    function goTo(q, smooth) { driving = false; pending = 0; window.scrollTo({ top: yFor(q), behavior: smooth && !REDUCED ? 'smooth' : 'auto' }); }
    var cardQ = function (i) { return stopQ(stopOf[i] || 0); };

    if (scrub) {
      // one tick per card, each a jump target
      cards.forEach(function (c, i) {
        var t = document.createElement('button');
        t.type = 'button'; t.className = 'tick'; t.style.left = (cardQ(i) * 100) + '%';
        t.setAttribute('aria-label', 'Card ' + (i + 1) + ': ' + ($('h3', c) || c).textContent);
        t.addEventListener('click', function (e) { e.stopPropagation(); goTo(cardQ(i), true); });
        scrub.appendChild(t);
        ticks.push(t);
      });
      var dragging = false;
      var fromX = function (e) { var r = scrub.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
      scrub.addEventListener('pointerdown', function (e) {
        if (e.target.classList.contains('tick')) return;
        dragging = true; scrub.classList.add('drag');
        try { scrub.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
        goTo(fromX(e), false);
      });
      scrub.addEventListener('pointermove', function (e) { if (dragging) goTo(fromX(e), false); });
      var stop = function () { dragging = false; scrub.classList.remove('drag'); setTimeout(settle, 120); };
      scrub.addEventListener('pointerup', stop);
      scrub.addEventListener('pointercancel', stop);
      scrub.addEventListener('keydown', function (e) {
        var n = Math.max(0, on);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n++;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n--;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = cards.length - 1;
        else return;
        e.preventDefault();
        goTo(cardQ(clamp(n, 0, cards.length - 1)), true);
      });
    }
    var skip = $('[data-hscroll-skip]');
    if (skip) skip.addEventListener('click', function () { if (!smoothTo('services')) goTo(1, true); });

    // One card per scroll. While the cards are on screen, any scroll (the lightest touch
    // of a trackpad, a hard flick, a long spin of the wheel) slides exactly one card in and
    // the rest of that scroll is absorbed. The next scroll, after a short pause or a fresh
    // push rising out of the last one's glide, moves the next card; one that comes while a
    // card is still sliding in is kept and played when it lands, so no scroll is lost.
    // Arriving from above or below lands on the first or last stop, and at either end a
    // new scroll lets the page carry on. A scroll that keeps going after its card has
    // been on screen for a moment moves on to the next one, still one at a time.
    var OUT = -1, END = -2;   // stopFor: not near the section / at its edge, heading out
    var HOLD = 700;           // ms a card stays put against a scroll that keeps going
    var vy = 0, lastSet = 0, driving = false, pending = 0, used = false, touchY = null, touchUsed = false;
    var lastWheel = 0, lastDelta = 0, lastDir = 0, gestureAt = 0, landedAt = 0, settleT = null;
    function pinned() {
      if (!enabled) return false;
      var r = pin.getBoundingClientRect();
      return r.top <= 1 && r.bottom >= window.innerHeight - 1;
    }
    var stopY = function (j) { return yFor(stopQ(j)); };
    // the stop a scroll this way leads to; from outside, only if this scroll (d px) reaches the section
    function stopFor(dir, d) {
      if (!enabled) return OUT;
      var y = driving ? vy : window.pageYOffset, k = stops.length - 1, j;
      if (dir > 0) {
        if (y < stopY(0) - 1) return d && y + d >= stopY(0) ? 0 : OUT;
        for (j = 0; j <= k; j++) if (stopY(j) > y + 1) return j;
      } else {
        if (y > stopY(k) + 1) return d && y + d <= stopY(k) ? k : OUT;
        for (j = k; j >= 0; j--) if (stopY(j) < y - 1) return j;
      }
      return END;
    }
    // slide the page to a stop (the track glides behind it), then play a kept scroll
    function slideTo(j) {
      vy = stopY(j);
      if (!driving) { driving = true; lastSet = 0; frame(drive); }
    }
    // A scroll the page made on its own (the scrollbar, a momentum flick that slipped in
    // before the section caught it) can come to rest between two cards. When it does,
    // glide on to the nearest one so the section never sits half way.
    function settle() {
      if (!enabled || driving || scrubbing()) return;
      var y = window.pageYOffset, k = stops.length - 1;
      if (y < stopY(0) - 1 || y > stopY(k) + 1) return;
      var best = 0;
      for (var j = 1; j <= k; j++) if (Math.abs(stopY(j) - y) < Math.abs(stopY(best) - y)) best = j;
      if (Math.abs(stopY(best) - y) > 2) slideTo(best);
    }
    var scrubbing = function () { return !!(scrub && scrub.classList.contains('drag')); };
    // a nav link, the rail or the logo takes the page elsewhere: stop sliding first, so
    // the slide can't cancel the page's own smooth scroll
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-scroll-to], [data-scroll-top], [data-rail] a, a[href^="#"]')) { driving = false; pending = 0; }
    }, true);
    function drive() {
      if (!driving) return;                                                // the scrubber took over
      var cur = window.pageYOffset, d = vy - cur;
      // something else moved the page mid-slide (a nav link, the rail): let it have the page
      if (lastSet && Math.abs(cur - lastSet) > 3) { driving = false; pending = 0; lastSet = 0; return; }
      if (Math.abs(d) >= 1) {
        window.scrollTo({ top: cur + (d > 0 ? 1 : -1) * Math.max(1, Math.abs(d) * 0.24), behavior: 'auto' });
        lastSet = window.pageYOffset;
        frame(drive);
        return;
      }
      window.scrollTo({ top: vy, behavior: 'auto' });
      driving = false; lastSet = 0; landedAt = performance.now();
      var dir = pending, t;
      pending = 0;
      if (dir && (t = stopFor(dir)) >= 0) slideTo(t);
    }
    // a scroll that wants to move a card: now, or as soon as the current one lands
    function want(dir, t) {
      if (driving) pending = dir; else slideTo(t);
    }

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || !e.deltaY || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      var now = performance.now(), ad = Math.abs(e.deltaY), dir = e.deltaY > 0 ? 1 : -1;
      // a new scroll: after a pause, the other way, or a push clearly rising out of a dying glide
      if (now - lastWheel > 150 || dir !== lastDir || (now - gestureAt > 350 && ad > lastDelta * 1.6 + 4)) { used = false; gestureAt = now; }
      lastWheel = now; lastDelta = ad; lastDir = dir;
      var t = stopFor(dir, e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1));
      if (t === OUT) return;
      // the same scroll still going: absorbed while its card slides in and for a moment
      // after, then it may move on (to the next card, or out of the section)
      var held = used && (driving || now - landedAt < HOLD);
      if (t === END) { if (held || driving) e.preventDefault(); return; }
      e.preventDefault();
      if (held) return;
      used = true;
      want(dir, t);
    }, { passive: false });

    // touch screens wide enough to pin (tablets): one swipe, one card
    window.addEventListener('touchstart', function (e) {
      touchY = enabled && e.touches.length === 1 && !e.target.closest('[data-hscroll-nav]') ? e.touches[0].clientY : null;
      touchUsed = false;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (touchY === null) return;
      var dy = touchY - e.touches[0].clientY, dir = dy > 0 ? 1 : -1;
      if (Math.abs(dy) < 6) return;
      var t = stopFor(dir, dy);
      if (t === OUT || (t === END && !touchUsed && !driving)) { touchY = null; return; }   // the page scrolls on
      e.preventDefault();
      if (touchUsed || t === END) return;
      touchUsed = true;
      want(dir, t);
    }, { passive: false });
    window.addEventListener('touchend', function () { touchY = null; });

    window.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || !pinned()) return;
      if (e.target.closest && e.target.closest('a, button, input, textarea, select, [contenteditable], [role="slider"]')) return;
      var dir = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (!dir) return;
      if (e.key === ' ' && e.shiftKey) dir = -1;
      var t = stopFor(dir);
      if (t < 0) return;
      e.preventDefault();
      want(dir, t);
    });

    addScene(function () {
      if (!enabled) return;
      var r = pin.getBoundingClientRect();
      p = clamp(-r.top / Math.max(1, pin.offsetHeight - window.innerHeight), 0, 1);
      if (nav) nav.style.setProperty('--wp', p.toFixed(4));
      if (!driving) { clearTimeout(settleT); settleT = setTimeout(settle, 180); }
      tx = target();
      if (gliding) return;
      if (Math.abs(tx - x) >= 0.5) { gliding = true; frame(glide); } else paint();
    });
  }

  /* Phones: dot indicator under a horizontal swipe row (CSS hides it on wider screens). */
  function snapDots(track, items) {
    if (!track || items.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'snap-dots';
    dots.innerHTML = items.map(function (_, i) {
      return '<button type="button" aria-label="Show card ' + (i + 1) + ' of ' + items.length + '"></button>';
    }).join('');
    track.parentNode.insertBefore(dots, track.nextSibling);
    var btns = $$('button', dots), cur = -1, ticking = false;
    function paint() {
      ticking = false;
      var tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2, best = 0, bd = Infinity;
      items.forEach(function (el, i) {
        var r = el.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = items.length - 1;
      if (best === cur) return;
      cur = best;
      btns.forEach(function (b, j) { b.classList.toggle('on', j === cur); });
    }
    track.addEventListener('scroll', function () { if (!ticking) { ticking = true; frame(paint); } }, { passive: true });
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        var dx = items[i].getBoundingClientRect().left - track.getBoundingClientRect().left - pad;
        track.scrollBy({ left: dx, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
    paint();
  }

  /* Funding: sticky cards shrink as the next one slides over them.
     On phones they sit in a swipe row instead, so the effect stands down. */
  function initStack() {
    var stack = $('[data-stack]');
    var cards = $$('[data-stack] .stack-card');
    snapDots(stack, cards);
    // phones switch between the cards with tabs instead of swiping sideways
    if (stack && cards.length > 1) {
      var tabs = document.createElement('div');
      tabs.className = 'stack-tabs';
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'Ways to fund your degree');
      tabs.innerHTML = cards.map(function (c, i) {
        var name = c.getAttribute('data-tab') || ($('.label', c) || c).textContent.split('\u00b7').pop().trim();
        return '<button type="button" role="tab" aria-controls="' + c.id + '" aria-selected="' + (i ? 'false' : 'true') + '"' + (i ? ' tabindex="-1"' : '') + '>' + esc(name) + '</button>';
      }).join('');
      stack.parentNode.insertBefore(tabs, stack);
      var tabBtns = $$('button', tabs), tabAt = 0;
      var showCard = function (i) {
        tabAt = (i + cards.length) % cards.length;
        cards.forEach(function (c, j) { c.classList.toggle('on', j === tabAt); });
        tabBtns.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === tabAt)); b.tabIndex = j === tabAt ? 0 : -1; });
      };
      tabBtns.forEach(function (b, i) { b.addEventListener('click', function () { showCard(i); }); });
      tabs.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault(); showCard(tabAt + d); tabBtns[tabAt].focus();
      });
      stack.classList.add('tabbed');
      showCard(0);
    }
    if (cards.length < 2 || REDUCED) return;
    var cleared = false;
    addScene(function () {
      if (isMobile() || getComputedStyle(cards[0]).position !== 'sticky') {
        if (!cleared) cards.forEach(function (c) { c.style.removeProperty('--s'); c.style.filter = ''; });
        cleared = true;
        return;
      }
      cleared = false;
      cards.forEach(function (c, i) {
        var next = cards[i + 1];
        if (!next) return;
        var topPx = parseFloat(getComputedStyle(c).top) || 0;
        var t = clamp(1 - (next.getBoundingClientRect().top - topPx) / window.innerHeight, 0, 1);
        c.style.setProperty('--s', (1 - t * 0.06).toFixed(4));
        c.style.filter = t > 0.01 ? 'brightness(' + (1 - t * 0.18).toFixed(3) + ')' : '';
      });
    });
  }

  /* Pathway: the route line fills and each milestone lights up. */
  function initSteps() {
    var wrap = $('[data-steps]');
    if (!wrap) return;
    var line = $('.line', wrap);
    var steps = $$('.step', wrap);
    addScene(function () {
      var vh = window.innerHeight, mark = vh * 0.62;
      var r = wrap.getBoundingClientRect();
      line.style.setProperty('--lp', clamp((mark - r.top) / r.height, 0, 1).toFixed(4));
      steps.forEach(function (s) { s.classList.toggle('lit', s.getBoundingClientRect().top < mark); });
    });
  }

  /* Settle in Poland: bounce cards. The five stages are a fanned hand of photo cards that bounce in;
     hovering (or tapping) one straightens and lifts it while its neighbours spring aside, and opening
     it shows the stage in a pop-up with its working instrument: a visa file, nine months in three phases, an
     EU Blue Card, a residence record or a family switchboard. */
  var FAM_SWITCH = [
    { partner: 'Not yet', child: 'Not yet' },
    { partner: 'Can join you', child: 'Can join you' },
    { partner: 'Joins, and may work', child: 'Can join you' }
  ];

  function initBento() {
    var root = $('[data-bx]');
    if (!root) return;
    var NS = 'http://www.w3.org/2000/svg';
    var svgEl = function (tag, attrs) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    };
    var fmt = function (v) { return String(Math.round(v * 100) / 100); };

    var seen = function (el, cb, t) {
      if (!('IntersectionObserver' in window)) { cb(); return; }
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); cb(); } }, { threshold: t || 0.5 });
      io.observe(el);
    };

    // the hand of cards: each sits at its own angle and offset; the one brought forward straightens
    // and lifts while its neighbours spring aside (as far as the row has room for)
    var fan = $('[data-bnc-fan]', root), cards = $$('[data-bx-tile]', root), up = -1, lastPointer = '';
    var ROT = [9, 4, -3, -8, 3];
    var PHONE = window.matchMedia('(max-width: 700px)');
    var layout = function () {
      if (PHONE.matches) {   // phones swipe a carousel instead; the fan transforms stand down
        cards.forEach(function (c) { c.style.removeProperty('--t'); c.style.removeProperty('--dl'); c.classList.remove('up'); });
        return;
      }
      var cw = cards[0].offsetWidth, half = fan.clientWidth / 2;
      var step = Math.min(cw * .7, (half * 2 - cw) / 4), push = Math.max(0, Math.min(cw * .5, 120, half - cw / 2 - 2 * step - 8));
      cards.forEach(function (c, j) {
        var x = (j - 2) * step, rot = ROT[j], y = 0, s = 1;
        if (up >= 0) {
          if (j === up) { rot = 0; y = -14; s = 1.06; }
          else x += j < up ? -push : push;
        }
        c.style.setProperty('--t', 'translate(' + x.toFixed(1) + 'px, ' + y + 'px) rotate(' + rot + 'deg) scale(' + s + ')');
        c.style.setProperty('--dl', up >= 0 ? Math.abs(j - up) * 40 + 'ms' : '0ms');
        c.classList.toggle('up', j === up);
      });
    };
    var bring = function (j) { if (j !== up) { up = j; layout(); } };
    layout();
    var resizeT;
    window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(setMode, 120); });
    cards.forEach(function (c, j) {
      var face = $('[data-bnc-face]', c);
      c.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') bring(j); });
      face.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType; });
      face.addEventListener('focus', function () { bring(j); });
      // a mouse click or Enter opens the stage; on touch the first tap brings the card forward
      face.addEventListener('click', function () {
        var touch = lastPointer === 'touch' || lastPointer === 'pen';
        lastPointer = '';
        if (touch && up !== j && !PHONE.matches) { bring(j); return; }
        openPop(j);
      });
    });
    fan.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') bring(-1); });
    fan.addEventListener('focusout', function (e) { if (!fan.contains(e.relatedTarget)) bring(-1); });
    document.addEventListener('pointerdown', function (e) { if (up >= 0 && !fan.contains(e.target) && !(pop && pop.contains(e.target))) bring(-1); });
    // phones: the centred card stands straight, its neighbours lean away and shrink, and dots
    // show where you are in the row
    var dotBox = $('[data-bnc-dots]', root), hint = $('[data-bnc-hint]', root), spinQ = false;
    dotBox.innerHTML = cards.map(function () { return '<i></i>'; }).join('');
    var dots = $$('i', dotBox);
    var spin = function () {
      spinQ = false;
      if (!PHONE.matches) return;
      var mid = fan.scrollLeft + fan.clientWidth / 2, best = 0, bestD = Infinity;
      cards.forEach(function (c, j) {
        var off = clamp((c.offsetLeft + c.offsetWidth / 2 - mid) / c.offsetWidth, -1.5, 1.5);
        c.style.setProperty('--rot', (off * 7).toFixed(2) + 'deg');
        c.style.setProperty('--sc', (1 - Math.min(Math.abs(off), 1) * .12).toFixed(3));
        if (Math.abs(off) < bestD) { bestD = Math.abs(off); best = j; }
      });
      cards.forEach(function (c, j) { c.classList.toggle('mid', j === best); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === best); });
    };
    fan.addEventListener('scroll', function () { if (!spinQ) { spinQ = true; frame(spin); } }, { passive: true });
    var setMode = function () {
      layout();
      if (PHONE.matches) spin();
      else cards.forEach(function (c) { c.style.removeProperty('--rot'); c.style.removeProperty('--sc'); c.classList.remove('mid'); });
      hint.textContent = PHONE.matches ? 'Swipe through the steps. Tap a card for the details.'
        : FINE ? 'Hover a card to bring it forward. Click it for the details.'
        : 'Tap a card to bring it forward. Tap it again for the details.';
    };
    if (PHONE.addEventListener) PHONE.addEventListener('change', setMode); else PHONE.addListener(setMode);
    setMode();
    // the bounce in, once the hand comes into view
    if (!REDUCED) {
      root.classList.add('armed');
      seen(fan, function () { root.classList.add('go'); }, 0.3);
    }

    // 01 · the visa file ticks itself off, then the stamp comes down; tap it to check again
    var file = $('[data-bx-file]', root);
    if (file) {
      var items = $$('.bx-file-list > span', file), timers = [];
      var runFile = function () {
        timers.forEach(clearTimeout); timers = [];
        file.classList.remove('stamped', 'thud');
        items.forEach(function (li) { li.classList.remove('ok'); });
        if (REDUCED) { items.forEach(function (li) { li.classList.add('ok'); }); file.classList.add('stamped'); return; }
        items.forEach(function (li, i) { timers.push(setTimeout(function () { li.classList.add('ok'); }, 350 + i * 420)); });
        timers.push(setTimeout(function () { file.classList.add('stamped'); }, 350 + items.length * 420 + 150));
        timers.push(setTimeout(function () { file.classList.add('thud'); }, 350 + items.length * 420 + 450));
      };
      file.addEventListener('click', runFile);
      file.__run = runFile;   // runs each time the Study pop-up opens
    }

    // 02 · the nine months: each time the pop-up opens, the month pages light up one by one
    var nine = $('.bx-nine', root);
    if (nine) {
      var pages = $$('.bx-ph-mo i', nine), nineT = [];
      nine.__run = function () {
        nineT.forEach(clearTimeout); nineT = [];
        if (REDUCED) { pages.forEach(function (pg) { pg.classList.add('on'); }); return; }
        pages.forEach(function (pg) { pg.classList.remove('on'); });
        pages.forEach(function (pg, k) { nineT.push(setTimeout(function () { pg.classList.add('on'); }, 450 + k * 160)); });
      };
    }
    // 03 · the EU Blue Card turns over
    var card = $('[data-bx-card]', root);
    if (card) {
      var stars = $('[data-bx-stars]', card);
      for (var s = 0; s < 12; s++) {
        var sa = s * Math.PI / 6, cx = 30 + Math.sin(sa) * 22, cyy = 30 - Math.cos(sa) * 22, pts = [];
        for (var p = 0; p < 10; p++) {
          var pr = p % 2 ? 1.6 : 4, pa = p * Math.PI / 5;
          pts.push((cx + Math.sin(pa) * pr).toFixed(2) + ' ' + (cyy - Math.cos(pa) * pr).toFixed(2));
        }
        stars.appendChild(svgEl('path', { d: 'M' + pts.join('L') + 'Z' }));
      }
      card.addEventListener('click', function () {
        var on = !card.classList.contains('flip');
        card.classList.toggle('flip', on);
        card.setAttribute('aria-pressed', String(on));
      });
    }

    // 04 · the residence record: five years as ten half-year boxes. Each year of study stamps
    // one box (it counts at half), each year of work stamps two; at five years the card is stamped
    var cellBox = $('[data-bx-cells]', root);
    if (cellBox) {
      var passEl = cellBox.closest('.bx-pass'), yrs = { study: 3, work: 2 }, MAX = { study: 6, work: 5 }, filled = [];
      cellBox.innerHTML = [1, 2, 3, 4, 5].map(function (y) {
        return '<span class="bx-yr"><span class="bx-cell"></span><span class="bx-cell"></span><small>Year ' + y + '</small></span>';
      }).join('');
      var cells = $$('.bx-cell', cellBox);
      var yearsEl = $('[data-bx-years]', passEl), verdict = $('[data-bx-verdict]', passEl);
      var STAMP = { study: '<svg width="16" height="16"><use href="#i-cap"/></svg>', work: '<svg width="16" height="16"><use href="#i-brief"/></svg>' };
      var paintPass = function (first) {
        var st = Math.min(yrs.study, 10), wk = Math.min(yrs.work * 2, 10 - st), total = (st + wk) / 2;
        cells.forEach(function (c, k) {
          var kind = k < st ? 'study' : k < st + wk ? 'work' : '';
          if (filled[k] === kind) return;
          filled[k] = kind;
          c.className = 'bx-cell' + (kind ? ' is-' + kind + (first || REDUCED ? '' : ' land') : '');
          c.innerHTML = kind ? STAMP[kind] : '';
        });
        ['study', 'work'].forEach(function (k) {
          $('[data-bx-out="' + k + '"]', passEl).textContent = yrs[k];
          $('[data-bx-dec="' + k + '"]', passEl).disabled = yrs[k] <= 0;
          $('[data-bx-inc="' + k + '"]', passEl).disabled = yrs[k] >= MAX[k];
        });
        yearsEl.textContent = fmt(total);
        var left = 5 - total;
        verdict.textContent = left <= 0 ? 'Five years reached: you can apply' : fmt(left) + (left === 1 ? ' year' : ' years') + ' to go';
        passEl.classList.toggle('done', left <= 0);
      };
      $$('[data-bx-inc], [data-bx-dec]', passEl).forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-bx-inc') || b.getAttribute('data-bx-dec');
          yrs[k] = clamp(yrs[k] + (b.hasAttribute('data-bx-inc') ? 1 : -1), 0, MAX[k]);
          paintPass(false);
        });
      });
      paintPass(true);
    }

    // 05 · the family switchboard
    var seg = $('[data-bx-seg]', root);
    if (seg) {
      var opts = $$('[data-bx-stage]', seg), who = {}, stageNow = -1;
      $$('[data-bx-who]', root).forEach(function (li) { who[li.getAttribute('data-bx-who')] = li; });
      var setStage = function (i) {
        if (i === stageNow) return;
        stageNow = i;
        opts.forEach(function (o, j) { o.setAttribute('aria-checked', String(j === i)); o.tabIndex = j === i ? 0 : -1; });
        ['partner', 'child'].forEach(function (k) {
          var txt = FAM_SWITCH[i][k], li = who[k];
          $('[data-bx-st]', li).textContent = txt;
          li.classList.toggle('on', txt !== 'Not yet');
        });
      };
      opts.forEach(function (o, i) { o.addEventListener('click', function () { setStage(i); }); });
      seg.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        setStage((stageNow + d + opts.length) % opts.length);
        opts[stageNow].focus();
      });
      setStage(0);
    }

    // the pop-up: the stage's photo with its instrument moved in over it, and the full story beside;
    // arrows step through the five
    var tiles = cards, kits = cards.map(function (c) { return $('[data-bx-kit]', c); });
    var pop = null, popAt = -1, popLast = null;
    var buildPop = function () {
      var el = document.createElement('div');
      el.className = 'bxp';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML =
        '<div class="bxp-card" role="dialog" aria-modal="true" aria-labelledby="bxp-title" tabindex="-1">' +
          '<button type="button" class="bxp-x" data-bxp-close aria-label="Close details"><svg width="18" height="18"><use href="#i-x"/></svg></button>' +
          '<div class="bxp-photo" data-bxp-photo><img alt="" data-bxp-img><span class="bxp-num" data-bxp-num aria-hidden="true"></span>' +
            '<ol class="bxp-route" data-bxp-route>' + tiles.map(function (t, j) {
              return '<li><button type="button" data-bxp-go="' + j + '" aria-label="' + esc($('.bnc-title', t).textContent) + '"><i></i><span>' + esc($('.bnc-kick', t).lastChild.textContent.trim()) + '</span></button></li>';
            }).join('') + '<span class="bxp-route-plane" data-bxp-plane aria-hidden="true"><svg width="16" height="16"><use href="#i-plane"/></svg></span></ol>' +
            '<div class="bxp-cap"><span class="bxp-kick" data-bxp-kick></span><h3 id="bxp-title" data-bxp-title></h3></div>' +
            '<div class="bxp-kit" data-bxp-kit></div>' +
          '</div>' +
          '<div class="bxp-main">' +
            '<div class="bxp-body" data-bxp-body></div>' +
            '<div class="bxp-foot">' +
              '<div class="bxp-nav">' +
                '<button type="button" data-bxp-step="-1" aria-label="Previous step"><svg width="18" height="18"><use href="#i-left"/></svg></button>' +
                '<span data-bxp-count></span>' +
                '<button type="button" data-bxp-step="1" aria-label="Next step"><svg width="18" height="18"><use href="#i-right"/></svg></button>' +
              '</div>' +
              '<a class="btn sm" href="#contact" data-bxp-cta>Plan my route <svg class="arrow" width="16" height="16"><use href="#i-arrow"/></svg></a>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(el);
      el.addEventListener('click', function (e) {
        if (e.target === el || e.target.closest('[data-bxp-close]')) closePop();
        var s = e.target.closest('[data-bxp-step]');
        if (s) fillPop(popAt + +s.getAttribute('data-bxp-step'), true);
        var go = e.target.closest('[data-bxp-go]');
        if (go && +go.getAttribute('data-bxp-go') !== popAt) fillPop(+go.getAttribute('data-bxp-go'), true);
      });
      $('[data-bxp-cta]', el).addEventListener('click', function (e) { e.preventDefault(); closePop(); setTimeout(function () { smoothTo('contact'); }, 250); });
      // the Blue Card in the pop-up still tilts with the cursor
      var photo = $('[data-bxp-photo]', el);
      if (FINE && !REDUCED) {
        photo.addEventListener('pointermove', function (e) {
          var r = photo.getBoundingClientRect();
          photo.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
          photo.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
        });
        photo.addEventListener('pointerleave', function () { photo.style.removeProperty('--mx'); photo.style.removeProperty('--my'); });
      }
      window.addEventListener('keydown', function (e) {
        if (!el.classList.contains('open')) return;
        var inKit = document.activeElement && document.activeElement.closest && document.activeElement.closest('.bxp-kit');
        if (e.key === 'Escape') { e.stopPropagation(); closePop(); }
        else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !inKit) fillPop(popAt + (e.key === 'ArrowRight' ? 1 : -1), true);
        else if (e.key === 'Tab') {   // keep focus inside the pop-up
          var f = $$('button, a[href], input, [tabindex="0"]', el);
          if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      }, true);
      return el;
    };
    var fillPop = function (i, swap) {
      var box = $('[data-bxp-kit]', pop);
      if (popAt >= 0 && box.firstElementChild) kits[popAt].appendChild(box.firstElementChild);
      popAt = (i + tiles.length) % tiles.length;
      var t = tiles[popAt], img = $('.bnc-photo img', t), g = kits[popAt].firstElementChild;
      $('[data-bxp-img]', pop).src = img.currentSrc || img.src;
      $('[data-bxp-kick]', pop).innerHTML = $('.bnc-kick', t).innerHTML;
      $('[data-bxp-title]', pop).textContent = $('.bnc-title', t).textContent;
      $('[data-bxp-body]', pop).innerHTML = $('[data-bx-info]', t).innerHTML;
      $('[data-bxp-count]', pop).textContent = (popAt + 1) + ' of ' + tiles.length;
      $('[data-bxp-num]', pop).textContent = '0' + (popAt + 1);
      $$('[data-bxp-go]', pop).forEach(function (b, j) { b.classList.toggle('past', j < popAt); b.classList.toggle('on', j === popAt); b.setAttribute('aria-current', j === popAt ? 'step' : 'false'); });
      $('[data-bxp-plane]', pop).style.left = 'calc(12px + ' + (popAt / (tiles.length - 1)).toFixed(3) + ' * (100% - 24px))';
      $('.bxp-card', pop).setAttribute('data-stage', popAt);
      if (g) { box.appendChild(g); if (g.__run) g.__run(); }
      $('[data-bxp-body]', pop).scrollTop = 0;
      $('.bxp-card', pop).scrollTop = 0;
      if (swap && !REDUCED) { pop.classList.remove('swap'); void pop.offsetWidth; pop.classList.add('swap'); }
    };
    var openPop = function (i) {
      if (!pop) pop = buildPop();
      fillPop(i);
      // the pop-up grows out of the card that was opened
      var r = tiles[i].getBoundingClientRect(), card = $('.bxp-card', pop);
      card.style.setProperty('--fx', Math.round((r.left + r.width / 2 - window.innerWidth / 2) * .4) + 'px');
      card.style.setProperty('--fy', Math.round((r.top + r.height / 2 - window.innerHeight / 2) * .4) + 'px');
      popLast = document.activeElement;
      pop.classList.add('open');
      pop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { card.focus(); }, 50);
    };
    var closePop = function () {
      if (!pop || !pop.classList.contains('open')) return;
      pop.classList.remove('open');
      pop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (popLast && popLast.focus) popLast.focus({ preventScroll: true });
    };

    // on phones and tablets the floating chat buttons step aside while the instruments are on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { document.body.classList.toggle('at-fam', es[0].isIntersecting); }, { rootMargin: '-15% 0px -15% 0px' }).observe(root);
    }
  }

  /* What each stage means for your family (the switchboard and Tutee AI both read it). */
  var FAM_STAGES = [
    { name: 'Year 1: first permit', status: 'Not yet', text: "Your first permit runs 15 months, so reunification can't start from it. We plan the timing from day one." },
    { name: 'Year 2: as a student', status: 'Family can join', text: 'After two years on consecutive permits, with the current one issued for at least a year, your partner and children under 18 can join you.' },
    { name: 'EU Blue Card', status: 'Simplest route', text: 'On an EU Blue Card, bringing your family is far simpler, and your partner may work with no separate work permit.' }
  ];

  function initParallax() {
    if (REDUCED) return;
    var els = $$('[data-parallax]');
    var arch = $('.hero .arch');
    addScene(function () {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        el.style.setProperty('--py', (((r.top + r.height / 2) - vh / 2) * -k - r.height * 0.07).toFixed(1));
      });
      if (arch && window.pageYOffset < vh) arch.style.setProperty('--py', (window.pageYOffset * 0.08).toFixed(1));
    });
  }

  /* Phones: the floating chat buttons slide away while you scroll down to read and come back the
     moment you scroll up (or reach the end), so they never sit on what you're reading or tapping. */
  function initFabTuck() {
    if (!$('.fab-wrap')) return;
    var phone = window.matchMedia('(max-width: 760px)'), lastY = window.pageYOffset, queued = false;
    var check = function () {
      queued = false;
      var y = window.pageYOffset, dy = y - lastY;
      if (!phone.matches) { document.body.classList.remove('fab-tuck'); lastY = y; return; }
      if (Math.abs(dy) < 8) return;
      var nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 140;
      document.body.classList.toggle('fab-tuck', dy > 0 && y > 160 && !nearEnd);
      lastY = y;
    };
    window.addEventListener('scroll', function () { if (!queued) { queued = true; frame(check); } }, { passive: true });
  }

  /* Contact: the dark panel grows to full width as it arrives. */
  function initClipGrow() {
    var el = $('[data-clip-grow]');
    if (!el || REDUCED || !FINE) return;
    addScene(function () {
      var vh = window.innerHeight, r = el.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh * 0.7), 0, 1);
      var max = Math.min(70, window.innerWidth * 0.06);
      el.style.setProperty('--ci', ((1 - p) * max).toFixed(1) + 'px');
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. Services: a rosette dial that turns the chosen service to the pointer
   * ------------------------------------------------------------------ */
  function paragraphs(desc) {
    return String(desc || '').split(/\n{2,}/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  }

  function initServices(services) {
    var root = $('[data-svc-dial]');
    var dial = root && $('.dial', root);
    var wheel = $('[data-svc-wheel]');
    var panel = $('[data-svc-panel]');
    var index = $('[data-svc-index]');
    if (!root || !dial || !wheel || !panel || !services.length) return;
    var pad = function (n) { return ('0' + n).slice(-2); };
    var n = services.length, step = 360 / n;

    wheel.innerHTML = services.map(function (s, i) {
      return '<button type="button" class="dial-node" role="tab" aria-selected="false" aria-label="' + esc(s.title) + '" data-svc="' + i + '" style="--a:' + (i * step) + 'deg">' +
        '<span class="face">' + (s.icon || '') + '<span class="lbl">' + esc(s.title) + '</span></span>' +
      '</button>';
    }).join('');
    if (index) index.innerHTML = services.map(function (s, i) {
      return '<li><button type="button" data-svc="' + i + '"><span>' + pad(i + 1) + '</span>' + esc(s.title) + '</button></li>';
    }).join('');

    var nodes = $$('.dial-node', wheel);
    var links = index ? $$('button', index) : [];
    var moreBtn = $('[data-svc-more]', panel);
    var cur = -1, rot = null, timer = null, touched = false, hovering = false, inView = false;

    // --home is where the pointer sits: 3 o'clock beside the text, 6 o'clock above it on narrow screens
    function home() { return parseFloat(getComputedStyle(dial).getPropertyValue('--home')) || 0; }
    function still(fn) { dial.classList.add('still'); fn(); void dial.offsetWidth; frame(function () { dial.classList.remove('still'); }); }
    function turn() {
      var target = home() - cur * step;
      if (rot === null) rot = target;
      else rot += ((target - rot) % 360 + 540) % 360 - 180;   // always the short way round
      wheel.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
      wheel.style.setProperty('--counter', (-rot).toFixed(2) + 'deg');
    }

    function fill() {
      var s = services[cur];
      $('[data-svc-count]', root).textContent = pad(cur + 1);
      $('[data-svc-short]', root).textContent = s.title;
      $('[data-svc-icon]', panel).innerHTML = s.icon || '';
      $('[data-svc-tagline]', panel).textContent = s.tagline;
      $('[data-svc-title]', panel).textContent = s.title;
      $('[data-svc-body]', panel).innerHTML = paragraphs(s.desc);
      panel.classList.remove('more');
      if (moreBtn) {
        // there's more to read when the text has a second paragraph, or when phones cut the first one short
        var first = $('[data-svc-body] p', panel);
        moreBtn.hidden = String(s.desc || '').split(/\n{2,}/).length < 2 && !(first && first.scrollHeight > first.clientHeight + 2);
        moreBtn.setAttribute('aria-expanded', 'false');
        moreBtn.textContent = 'Read more';
      }
    }

    function paint(i, instant) {
      i = (i + n) % n;
      if (i === cur) return;
      cur = i;
      nodes.forEach(function (b, j) {
        b.classList.toggle('on', j === cur);
        b.setAttribute('aria-selected', String(j === cur));
        b.tabIndex = j === cur ? 0 : -1;
      });
      links.forEach(function (b, j) { b.classList.toggle('on', j === cur); });
      if (instant) { still(turn); fill(); return; }
      turn();
      root.classList.add('out');
      clearTimeout(timer);
      timer = setTimeout(function () { fill(); root.classList.remove('out'); }, 300);
    }

    function pick(i) { touched = true; paint(i); }
    nodes.concat(links).forEach(function (b) {
      b.addEventListener('click', function () { pick(+b.getAttribute('data-svc')); });
    });
    wheel.addEventListener('keydown', function (e) {
      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(e.key) < 0) return;
      e.preventDefault();
      pick(cur + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1));
      nodes[cur].focus();
    });
    var prev = $('[data-svc-prev]', panel), next = $('[data-svc-next]', panel);
    if (prev) prev.addEventListener('click', function () { pick(cur - 1); });
    if (next) next.addEventListener('click', function () { pick(cur + 1); });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      touched = true;
      var open = panel.classList.toggle('more');
      moreBtn.setAttribute('aria-expanded', String(open));
      moreBtn.textContent = open ? 'Show less' : 'Read more';
    });

    // The breakpoint moves the pointer, so re-aim the wheel without spinning it.
    var lastHome = home();
    window.addEventListener('resize', function () {
      var h = home();
      if (h === lastHome) return;
      lastHome = h; rot = null; still(turn);
    });

    // Scrolling over the dial turns it one service per notch. Past the last service
    // (or before the first) the scroll is let through, so the page never gets stuck.
    var wheelSum = 0, wheelAt = 0, WHEEL_GAP = 420;
    dial.addEventListener('wheel', function (e) {
      if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      var dir = e.deltaY > 0 ? 1 : -1;
      if ((dir > 0 && cur === n - 1) || (dir < 0 && cur === 0)) { wheelSum = 0; return; }
      e.preventDefault();
      var now = performance.now();
      if (now - wheelAt < WHEEL_GAP) return;             // one turn per gesture, even from a trackpad
      if (wheelSum && (wheelSum > 0) !== (dir > 0)) wheelSum = 0;
      wheelSum += e.deltaMode ? dir * 100 : e.deltaY;
      if (Math.abs(wheelSum) < 40) return;
      wheelSum = 0; wheelAt = now;
      pick(cur + dir);
    }, { passive: false });

    // A finger dragged round the ring turns the wheel with it and, on letting go, it settles on
    // the nearest service; a quick flick turns it one step. Only the ring takes the gesture:
    // the centre and everything around the dial still scroll the page.
    var drag = null, dragged = false;
    var angleAt = function (e) { return Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI; };
    wheel.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var r = dial.getBoundingClientRect();
      drag = { id: e.pointerId, cx: r.left + r.width / 2, cy: r.top + r.height / 2, acc: 0, t: performance.now(), on: false };
      drag.last = angleAt(e);
      drag.rot0 = rot === null ? home() - cur * step : rot;
    });
    wheel.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var a = angleAt(e);
      drag.acc += ((a - drag.last) % 360 + 540) % 360 - 180;
      drag.last = a;
      if (!drag.on && Math.abs(drag.acc) > 6) {
        drag.on = true; touched = true;
        dial.classList.add('still');
        try { wheel.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (!drag.on) return;
      var r2 = drag.rot0 + drag.acc;
      wheel.style.transform = 'rotate(' + r2.toFixed(2) + 'deg)';
      wheel.style.setProperty('--counter', (-r2).toFixed(2) + 'deg');
    });
    var endDrag = function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.on) return;
      dragged = true;
      dial.classList.remove('still');
      rot = d.rot0 + d.acc;
      var i = Math.round((home() - rot) / step);
      // a short, quick flick still counts as one step in its direction
      if (Math.abs(d.acc) < step / 2 && performance.now() - d.t < 350) i = cur + (d.acc > 0 ? -1 : 1);
      i = (i % n + n) % n;
      if (i === cur) turn(); else paint(i);
    };
    wheel.addEventListener('pointerup', endDrag);
    wheel.addEventListener('pointercancel', endDrag);
    // the lift at the end of a drag is not a tap on a service
    wheel.addEventListener('click', function (e) { if (dragged) { dragged = false; e.stopPropagation(); e.preventDefault(); } }, true);
    if (!FINE) {
      var hint = $('.dial-hint', dial);
      if (hint) hint.lastChild.textContent = 'Swipe round the dial to turn it';
    }

    // The wheel turns itself until the reader takes over.
    root.addEventListener('mouseenter', function () { hovering = true; });
    root.addEventListener('mouseleave', function () { hovering = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.35 }).observe(root);
    }
    if (!REDUCED) setInterval(function () {
      if (!touched && inView && !hovering && !document.hidden) paint(cur + 1);
    }, 6000);

    paint(0, true);
  }

  /* ------------------------------------------------------------------ *
   * 7. Home universities: the campus skyline
   * ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ *
   * 7a. University details pop-up (home skyline + directory cards)
   * ------------------------------------------------------------------ */
  /* QS World University Rankings 2027 (published 18 June 2026): each ranked Polish
     institution's WORLD position, by its Polish name. The 
ank field in the data is
     the position within Poland (1-20); this is the global one. Bands are as QS
     publishes them below #500. Source: QS 2027 table as reported by
     wszystkoconajwazniejsze.pl, cross-checked with the universities' own releases. */
  var QS_WORLD_2027 = {
    'Uniwersytet Warszawski': '289',
    'Uniwersytet Jagielloński w Krakowie': '329',
    'Politechnika Warszawska': '504',
    'Uniwersytet im. Adama Mickiewicza w Poznaniu': '731–740',
    'Akademia Górniczo-Hutnicza im. Stanisława Staszica w Krakowie': '761–770',
    'Politechnika Gdańska': '801–850',
    'Uniwersytet Wrocławski': '851–900',
    'Uniwersytet Gdański': '901–950',
    'Politechnika Wrocławska': '901–950',
    'Politechnika Krakowska im. Tadeusza Kościuszki': '1001–1200',
    'Politechnika Łódzka': '1001–1200',
    'Uniwersytet Mikołaja Kopernika w Toruniu': '1001–1200',
    'Uniwersytet Przyrodniczy w Poznaniu': '1001–1200',
    'Politechnika Poznańska': '1001–1200',
    'Politechnika Śląska': '1001–1200',
    'Uniwersytet Łódzki': '1001–1200',
    'Uniwersytet Śląski w Katowicach': '1201–1400',
    'Uniwersytet Warmińsko-Mazurski w Olsztynie': '1201–1400',
    'Szkoła Główna Gospodarstwa Wiejskiego w Warszawie': '1201–1400',
    'Politechnika Lubelska': '1401+'
  };
  var qsWorld = function (u) { return u && u.ranked ? QS_WORLD_2027[u.name] || '' : ''; };
  var englishName = function (u) { var e = String(u.alt || '').split(',')[0].trim(); return e && e !== u.name ? e : ''; };
  var udEl = null, udOpts = null, udLastFocus = null;

  function buildUniDetail() {
    var el = document.createElement('div');
    el.className = 'ud-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="ud-card" role="dialog" aria-modal="true" aria-labelledby="ud-title" tabindex="-1">' +
        '<button type="button" class="ud-x" data-ud-close aria-label="Close details"><svg width="18" height="18"><use href="#i-x"/></svg></button>' +
        '<div class="ud-head">' +
          '<svg class="ud-rosette" viewBox="0 0 200 200" aria-hidden="true"><use href="#rosette"/></svg>' +
          '<div class="ud-badges"><span class="ud-rank" data-ud-rank></span><span class="ud-pl" data-ud-pl></span><span class="ud-type" data-ud-type></span></div>' +
          '<h3 id="ud-title" data-ud-name></h3>' +
          '<p class="ud-en" data-ud-en></p>' +
          '<p class="ud-loc"><svg viewBox="0 0 24 24" width="16" height="16"><use href="#i-pin"/></svg><span data-ud-loc></span></p>' +
        '</div>' +
        '<div class="ud-body">' +
          '<div class="ud-stats" data-ud-stats></div>' +
          '<div class="ud-cols">' +
            '<div class="ud-main">' +
              '<h4>Fields of study</h4><div class="ud-chips" data-ud-fields></div>' +
              '<h4>International admission</h4>' +
              '<p class="ud-note"><svg viewBox="0 0 24 24" width="20" height="20"><use href="#i-shield"/></svg><span>Can admit international students: it is on the Ministry of the Interior’s approved list or exempt from it, so a temporary residence permit for studies can be issued.</span></p>' +
            '</div>' +
            '<figure class="ud-map"><svg viewBox="-20 -20 640 610" aria-hidden="true"><path class="land"/><g data-ud-dot></g></svg><figcaption data-ud-cap></figcaption></figure>' +
          '</div>' +
        '</div>' +
        '<div class="ud-foot">' +
          '<button type="button" class="btn ghost sm" data-ud-alt hidden></button>' +
          '<button type="button" class="btn sm" data-ud-cta></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    var land = $('[data-pl-land]') || $('.pl-map .land');
    if (land) $('.ud-map .land', el).setAttribute('d', land.getAttribute('d'));
    else $('.ud-map', el).hidden = true;

    el.addEventListener('click', function (e) { if (e.target === el || e.target.closest('[data-ud-close]')) closeUniDetail(); });
    window.addEventListener('keydown', function (e) {
      if (!el.classList.contains('open')) return;
      if (e.key === 'Escape') { e.stopPropagation(); closeUniDetail(); }
      if (e.key === 'Tab') {   // keep focus inside the dialog
        var f = $$('button:not([hidden]), a[href]', el).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }, true);
    $('[data-ud-cta]', el).addEventListener('click', function () { if (udOpts && udOpts.onCta) udOpts.onCta(); });
    $('[data-ud-alt]', el).addEventListener('click', function () { if (udOpts && udOpts.onAlt) { udOpts.onAlt(); paintAlt(); } });
    return el;
  }

  function paintAlt() {
    var alt = $('[data-ud-alt]', udEl);
    alt.hidden = !(udOpts && udOpts.altLabel);
    if (!alt.hidden) alt.textContent = udOpts.altLabel();
  }

  function openUniDetail(u, opts) {
    if (!udEl) udEl = buildUniDetail();
    udOpts = opts || {};
    var city = cityOf(u.location), region = regionOf(u.location), en = englishName(u);
    var world = qsWorld(u);
    $('[data-ud-rank]', udEl).innerHTML = world ? '#' + esc(world) + ' <small>in the world · QS 2027</small>' : 'Not in the QS world rankings';
    $('[data-ud-pl]', udEl).textContent = u.ranked ? '#' + u.rank + ' in Poland' : '';
    $('[data-ud-pl]', udEl).hidden = !u.ranked;
    $('[data-ud-rank]', udEl).classList.toggle('none', !world);
    $('[data-ud-type]', udEl).textContent = u.type || 'Institution';
    $('[data-ud-name]', udEl).textContent = u.name;
    $('[data-ud-en]', udEl).textContent = en;
    $('[data-ud-en]', udEl).hidden = !en;
    $('[data-ud-loc]', udEl).textContent = u.location;
    var stats = [
      ['QS World 2027', world ? '#' + esc(world) : 'Not ranked'],
      ['Rank in Poland', u.ranked ? '#' + u.rank + ' <i>of 20</i>' : '—'],
      ['Study programmes', esc(u.programmes || '—')],
      ['Location', esc(city || '—') + (region ? '<i>' + esc(region) + '</i>' : '')]
    ];
    $('[data-ud-stats]', udEl).innerHTML = stats.map(function (s) { return '<div><small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join('');
    var fields = String(u.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    $('[data-ud-fields]', udEl).innerHTML = fields.length ? fields.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') : '<span>Ask us for the programme list</span>';
    var xy = CITY_XY[city], dot = $('[data-ud-dot]', udEl);
    dot.innerHTML = xy ? '<circle class="halo" cx="' + xy[0] + '" cy="' + xy[1] + '" r="10"/><circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="10"/>' : '';
    $('[data-ud-cap]', udEl).textContent = xy ? city + ', ' + region : city + (region ? ', ' + region : '') + ' (not on the overview map)';
    $('[data-ud-cta]', udEl).innerHTML = esc(udOpts.ctaLabel || 'Enquire about this university') + ' <svg class="arrow" width="16" height="16"><use href="#i-arrow"/></svg>';
    paintAlt();

    udLastFocus = document.activeElement;
    udEl.classList.add('open');
    udEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.ud-body', udEl).scrollTop = 0;
    setTimeout(function () { $('.ud-card', udEl).focus(); }, 50);
  }

  function closeUniDetail(keepScrollLock) {
    if (!udEl || !udEl.classList.contains('open')) return;
    udEl.classList.remove('open');
    udEl.setAttribute('aria-hidden', 'true');
    if (!keepScrollLock) document.body.style.overflow = '';
    if (udLastFocus && udLastFocus.focus) udLastFocus.focus();
  }

  /* Where each city's label sits relative to its dot, so labels clear the coast,
     the eastern border and each other. Anything unlisted goes to the right. */
  var LABEL_SIDE = {
    'Gdańsk': 'right', 'Gdynia': 'up', 'Szczecin': 'right', 'Olsztyn': 'up',
    'Białystok': 'left', 'Lublin': 'left', 'Rzeszów': 'left', 'Kielce': 'left',
    'Gliwice': 'left', 'Katowice': 'right', 'Bielsko-Biała': 'down', 'Kraków': 'right',
    'Bydgoszcz': 'left', 'Toruń': 'right', 'Opole': 'left', 'Częstochowa': 'right'
  };
  function labelAt(name, xy, r) {
    var side = LABEL_SIDE[name] || (xy[0] > 470 ? 'left' : 'right'), x = +xy[0], y = +xy[1], g = +r + 7;
    if (side === 'up') return 'x="' + x + '" y="' + (y - g - 2) + '" text-anchor="middle"';
    if (side === 'down') return 'x="' + x + '" y="' + (y + g + 12) + '" text-anchor="middle"';
    if (side === 'left') return 'x="' + (x - g) + '" y="' + (y + 5) + '" text-anchor="end"';
    return 'x="' + (x + g) + '" y="' + (y + 5) + '" text-anchor="start"';
  }

  /* Campus skyline: the twelve highest-ranked universities stand side by side as real
     campus photographs at dusk, each as tall as its programme list. Hovering (or
     tapping) one opens it out in full colour with its card floating above it; clicking
     it again opens the full details. Field chips dim the ones that don't teach it.
     Photos are from Wikimedia Commons, credited in the card, the footer and CREDITS.md. */
  var SKY_FIELDS = ['Engineering', 'ICT', 'Business & Law', 'Health & Welfare', 'Natural Sciences', 'Social Sciences', 'Arts & Humanities', 'Education'];
  // by Polish name: file in assets/img/photos/unis/, focal point, photographer, licence
  var SKY_PHOTOS = {
    'Uniwersytet Warszawski': ['uw', '45% 50%', 'Thomas Quine', 'CC BY 2.0'],
    'Uniwersytet Jagielloński w Krakowie': ['uj', '30% 50%', 'Igor123121', 'CC BY 4.0'],
    'Politechnika Warszawska': ['pw', '50% 40%', 'Cybularny', 'CC BY 4.0'],
    'Uniwersytet im. Adama Mickiewicza w Poznaniu': ['amu', '50% 35%', 'Аимаина хикари', 'CC0'],
    'Akademia Górniczo-Hutnicza im. Stanisława Staszica w Krakowie': ['agh', '48% 45%', 'Zyxist', 'CC0'],
    'Politechnika Gdańska': ['pg', '50% 45%', 'Asik29', 'CC BY 4.0'],
    'Uniwersytet Wrocławski': ['uwr', '40% 35%', 'Palickap', 'CC BY 4.0'],
    'Uniwersytet Gdański': ['ug', '50% 45%', 'Artur Andrzej', 'CC0'],
    'Politechnika Wrocławska': ['pwr', '35% 40%', 'Daniel.zolopa', 'CC BY 4.0'],
    'Politechnika Krakowska im. Tadeusza Kościuszki': ['pk', '30% 50%', 'Politechnika Krakowska', 'CC0'],
    'Politechnika Łódzka': ['pl', '45% 50%', 'Qasinka', 'CC0'],
    'Uniwersytet Mikołaja Kopernika w Toruniu': ['umk', '50% 35%', 'Bydgoszczanin z miłości', 'CC BY 4.0']
  };

  function initSkyline() {
    var root = $('[data-sky]');
    if (!root || !window.PL_UNIVERSITIES) return;
    var scene = $('[data-sky-scene]', root), line = $('[data-sky-line]', root), card = $('[data-sky-card]', root);
    var filters = $('[data-sky-filters]', root);
    var unis = window.PL_UNIVERSITIES.filter(function (u) { return u.ranked; })
      .sort(function (a, b) { return a.rank - b.rank; }).slice(0, 12);
    var count = function (u) { return parseInt(u.programmes, 10) || 0; };
    var max = Math.max.apply(null, unis.map(count).concat(1));
    var fieldsOf = function (u) { return String(u.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean); };

    line.innerHTML = unis.map(function (u, i) {
      var en = englishName(u), ph = SKY_PHOTOS[u.name];
      return '<button type="button" class="bld" data-i="' + i + '"' +
        ' style="--h:' + (34 + 66 * count(u) / max).toFixed(1) + '%;--i:' + i + (ph ? ';--fx:' + ph[1] : '') + '"' +
        ' aria-label="#' + u.rank + ' in Poland: ' + esc(en || u.name) + ', ' + esc(cityOf(u.location)) + ', ' + esc(u.programmes) + ' programmes">' +
        (ph ? '<picture><source type="image/webp" srcset="./assets/img/photos/unis/' + ph[0] + '.webp"><img src="./assets/img/photos/unis/' + ph[0] + '.jpg" alt="" loading="lazy" decoding="async"></picture>' : '') +
        '<span class="bld-city">' + esc(cityOf(u.location)) + '</span>' +
        '<span class="bld-rank"><small>#</small>' + u.rank + '</span>' +
        // shown on the photo itself in the phone carousel
        '<span class="bld-info"><span class="bi-top"><b class="bi-rank"><small>#</small>' + u.rank + '</b>' +
          (qsWorld(u) ? '<span class="bi-qs">QS World #' + esc(qsWorld(u)) + '</span>' : '') + '</span>' +
          '<b class="bi-name">' + esc(en || u.name) + '</b>' +
          '<span class="bi-meta">' + esc(cityOf(u.location)) + ' · ' + esc(u.programmes) + ' programmes</span></span>' +
      '</button>' +
      // the phone list's own shortlist button, beside its row (CSS shows it only there)
      '<button type="button" class="bld-sl" data-sky-sl="' + i + '" style="--i:' + i + '" aria-pressed="false"></button>';
    }).join('');
    var blds = $$('.bld', line), rowSl = $$('[data-sky-sl]', line);
    // phones swipe through the photos as a carousel, with a dot per photo underneath
    var phone = function () { return window.matchMedia('(max-width: 760px), (max-height: 500px) and (orientation: landscape)').matches; };
    var dotRow = document.createElement('div');
    dotRow.className = 'sky-dots';
    dotRow.setAttribute('aria-hidden', 'true');
    dotRow.innerHTML = unis.map(function () { return '<i></i>'; }).join('');
    line.parentNode.insertBefore(dotRow, line.nextSibling);
    var dots = $$('i', dotRow);

    var fields = SKY_FIELDS.filter(function (f) { return unis.some(function (u) { return fieldsOf(u).indexOf(f) > -1; }); });
    filters.innerHTML = ['All fields'].concat(fields).map(function (f, k) {
      var n = k ? unis.filter(function (u) { return fieldsOf(u).indexOf(f) > -1; }).length : unis.length;
      return '<button type="button" aria-pressed="' + (k ? 'false' : 'true') + '"' + (k ? ' data-field="' + esc(f) + '"' : ' class="on"') + '>' + esc(f) + ' <b>' + n + '</b></button>';
    }).join('');
    var chips = $$('button', filters);
    // phones choose a field from a dropdown instead of a row of chips to swipe along
    var pick = document.createElement('label');
    pick.className = 'sky-pick';
    pick.innerHTML = '<span>Field of study</span><select>' + chips.map(function (c, k) {
      return '<option value="' + k + '">' + esc(c.firstChild.textContent.trim()) + ' (' + $('b', c).textContent + ')</option>';
    }).join('') + '</select>';
    filters.parentNode.insertBefore(pick, filters);
    var pickSel = $('select', pick);
    pickSel.addEventListener('change', function () { chips[+pickSel.value].click(); });
    // phones list the top five, with a button for the rest
    var moreBtn = document.createElement('button'), showAll = false;
    moreBtn.type = 'button';
    moreBtn.className = 'btn ghost sm sky-more';
    line.parentNode.insertBefore(moreBtn, dotRow.nextSibling);
    function paintCut() {
      var n = 0;
      blds.forEach(function (b, j) { var s = shown(j); if (s) n++; b.classList.toggle('cut', s && !showAll && n > 5); });
      moreBtn.hidden = n <= 5;
      moreBtn.textContent = showAll ? 'Show fewer' : 'Show all ' + n + ' universities';
      moreBtn.setAttribute('aria-expanded', String(showAll));
    }
    moreBtn.addEventListener('click', function () { showAll = !showAll; paintCut(); });

    var active = -1, field = '', hovering = false, touched = false, inView = false, swapT = null, followUntil = 0;
    var shown = function (i) { return !field || fieldsOf(unis[i]).indexOf(field) > -1; };

    function fillCard() {
      var u = unis[active], en = englishName(u), world = qsWorld(u), ph = SKY_PHOTOS[u.name];
      card.innerHTML =
        '<div class="sc-top"><span class="sc-rank"><small>#</small>' + u.rank + '</span>' +
          '<span class="sc-badge">' + (world ? 'QS World #' + esc(world) : 'QS-ranked') + '</span>' +
          '<span class="sc-badge soft">' + esc(u.type || 'University') + '</span></div>' +
        '<h3 class="sc-name">' + esc(en || u.name) + '</h3>' +
        (en ? '<p class="sc-pl">' + esc(u.name) + '</p>' : '') +
        '<div class="sc-meta"><span><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>' + esc(cityOf(u.location)) + '</span>' +
          '<span><b>' + esc(u.programmes) + '</b> programmes</span></div>' +
        '<div class="sc-fields">' + fieldsOf(u).map(function (f) { return '<span' + (f === field ? ' class="hit"' : '') + '>' + esc(f) + '</span>'; }).join('') + '</div>' +
        '<div class="sc-foot"><span class="sc-acts"><button type="button" class="sel-btn" data-sky-pick aria-pressed="false"></button>' +
          '<button type="button" class="sc-more" data-sky-open>Full details <svg width="16" height="16"><use href="#i-arrow"/></svg></button></span>' +
          (ph ? '<p class="sc-credit">Photo: ' + esc(ph[2]) + ' (' + ph[3] + ')</p>' : '') + '</div>';
      paintPicks();
    }
    // the card's Select button and the phone rows' buttons show whether each one is shortlisted
    function paintPicks() {
      var cardBtn = $('[data-sky-pick]', card);
      if (cardBtn && active > -1) {
        paintSelBtn(cardBtn, shortlist.has(unis[active].name), englishName(unis[active]) || unis[active].name);
        // the card is redrawn for every university; keep its 7s ring on the clock, not restarted
        cardBtn.style.setProperty('--ping-at', (-(performance.now() / 1000) % 7).toFixed(2) + 's');
      }
      rowSl.forEach(function (b, j) {
        var on = shortlist.has(unis[j].name), nm = englishName(unis[j]) || unis[j].name;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + nm + (on ? ' from' : ' to') + ' your shortlist');
        b.innerHTML = '<span class="tick" aria-hidden="true">' + (on ? '✓' : '+') + '</span>';
      });
    }
    function shortlistUni(i) { shortlist.toggle(unis[i].name); }
    shortlist.onChange(paintPicks);
    rowSl.forEach(function (b, j) { b.addEventListener('click', function () { shortlistUni(j); }); });

    // the card floats above its photo (clamped inside the scene) with the caret over it;
    // on phones it sits in the flow above the skyline and only the caret moves
    function aim() {
      if (active < 0) return;
      var s = scene.getBoundingClientRect(), b = blds[active].getBoundingClientRect();
      var cx = b.left + b.width / 2 - s.left, w = card.offsetWidth, left = card.offsetLeft;
      if (getComputedStyle(card).position === 'absolute') {
        left = clamp(cx - w / 2, 16, s.width - w - 16);
        card.style.setProperty('--cx', left.toFixed(1) + 'px');
        card.style.setProperty('--cy', Math.max(16, b.top - s.top - card.offsetHeight - 18).toFixed(1) + 'px');
      }
      card.style.setProperty('--caret', clamp(cx - left, 26, w - 26).toFixed(1) + 'px');
    }
    // keep aiming while the photos slide to their new widths
    function follow(ms) {
      if (phone()) return;                                  // the phone card sits in the flow: nothing to chase
      var running = followUntil > performance.now();
      followUntil = Math.max(followUntil, performance.now() + ms);
      if (running) return;
      (function tick() { aim(); if (performance.now() < followUntil) frame(tick); })();
    }

    // on phones, bring a chosen photo to the front of the carousel (unless the swipe already did)
    function reveal(i) {
      var pad = parseFloat(getComputedStyle(line).paddingLeft) || 0;
      line.scrollTo({ left: blds[i].offsetLeft - pad, behavior: REDUCED ? 'auto' : 'smooth' });
    }
    function set(i, instant, fromSwipe) {
      i = (i + unis.length) % unis.length;
      if (i === active) return;
      active = i;
      blds.forEach(function (b, j) { b.classList.toggle('on', j === active); b.classList.toggle('near', Math.abs(j - active) === 1); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === active); });
      if (phone() && !fromSwipe && !instant) reveal(i);
      clearTimeout(swapT);
      if (instant || !card.innerHTML) { fillCard(); if (!phone()) aim(); return; }
      card.classList.add('swap');
      swapT = setTimeout(function () { fillCard(); card.classList.remove('swap'); aim(); }, 140);
      follow(520);
    }
    function step(dir) {
      for (var k = 1; k <= unis.length; k++) {
        var j = (active + dir * k + unis.length * k) % unis.length;
        if (shown(j)) { set(j); return j; }
      }
      return active;
    }
    function open(i) {
      openUniDetail(unis[i], {
        altLabel: function () { return shortlist.has(unis[i].name) ? 'Remove from shortlist' : 'Add to shortlist'; },
        onAlt: function () { shortlistUni(i); },
        ctaLabel: 'Evaluate my profile for this university',
        onCta: function () { closeUniDetail(); shortlist.add(unis[i].name); setTimeout(function () { smoothTo('contact'); }, 60); }
      });
    }

    // The photo under the cursor (or a finger sliding across on a tablet) opens straight
    // away, and its neighbours open a little, so sweeping across ripples through them.
    // A change needs real movement since the last one: opening a photo reshuffles the
    // widths under a still cursor, and the browser's synthetic moves must not chain on.
    var lastX = null, swiped = false, swipeFrom = null;
    function under(e) {
      var el = e.pointerType === 'mouse' ? e.target : document.elementFromPoint(e.clientX, e.clientY);
      var b = el && el.closest && el.closest('.bld');
      return b && line.contains(b) ? +b.getAttribute('data-i') : -1;
    }
    line.addEventListener('pointermove', function (e) {
      if (phone()) return;
      var touch = e.pointerType !== 'mouse';
      if (touch && swipeFrom === null) return;              // a finger only steers while it is down
      if (touch && Math.abs(e.clientX - swipeFrom) > 10) swiped = true;
      hovering = true;
      if (lastX !== null && Math.abs(e.clientX - lastX) < 6) return;
      var i = under(e);
      if (i < 0 || i === active || !shown(i)) return;
      lastX = e.clientX; touched = touched || touch;
      set(i);
    });
    line.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { swipeFrom = e.clientX; swiped = false; } });
    ['pointerup', 'pointercancel'].forEach(function (t) { line.addEventListener(t, function () { swipeFrom = null; }); });
    line.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovering = false; lastX = null; } });
    // a first tap opens a photo out, a second opens the details; keyboard focus opens it out
    var pressing = false, wasOpen = false;
    blds.forEach(function (b, i) {
      b.addEventListener('pointerdown', function () { pressing = true; wasOpen = active === i; });
      b.addEventListener('focus', function () { if (!pressing) set(i); });
      b.addEventListener('click', function () {
        var again = pressing ? wasOpen : active === i;
        pressing = false; touched = true;
        if (swiped) { swiped = false; return; }           // the end of a swipe is not a tap
        if (again || phone()) open(i); else set(i);       // in the phone list one tap opens it
      });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); touched = true;
        blds[step(e.key === 'ArrowRight' ? 1 : -1)].focus();
      });
    });
    // a swipe makes the photo it settles on the chosen one
    var swipeT = null;
    line.addEventListener('scroll', function () {
      if (!phone()) return;
      clearTimeout(swipeT);
      swipeT = setTimeout(function () {
        var pad = parseFloat(getComputedStyle(line).paddingLeft) || 0, best = -1, bd = Infinity;
        blds.forEach(function (b, j) {
          if (!shown(j)) return;
          var d = Math.abs(b.offsetLeft - pad - line.scrollLeft);
          if (d < bd) { bd = d; best = j; }
        });
        if (best > -1) { touched = true; set(best, false, true); }
      }, 90);
    }, { passive: true });
    card.addEventListener('mouseenter', function () { hovering = true; });
    card.addEventListener('mouseleave', function () { hovering = false; });
    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-sky-open]')) open(active);
      else if (e.target.closest('[data-sky-pick]')) shortlistUni(active);
    });

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        touched = true;
        field = c.getAttribute('data-field') || '';
        chips.forEach(function (o) { o.classList.toggle('on', o === c); o.setAttribute('aria-pressed', String(o === c)); });
        blds.forEach(function (b, j) { b.classList.toggle('off', !shown(j)); b.tabIndex = shown(j) ? 0 : -1; });
        dots.forEach(function (d, j) { d.hidden = !shown(j); });
        pickSel.value = String(chips.indexOf(c));
        paintCut();
        if (!shown(active)) step(1);
        else { fillCard(); aim(); if (phone()) reveal(active); }
      });
    });

    window.addEventListener('resize', aim);
    // the photos rise out of the water when the scene arrives
    function rise() {
      if (root.classList.contains('risen')) return;
      root.classList.add('risen');
      follow(400);
    }
    if ('IntersectionObserver' in window && !REDUCED) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (inView) rise();
      }, { threshold: 0.3 }).observe(scene);
    } else { inView = true; rise(); }
    setTimeout(function () { var r = scene.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) rise(); }, 2600);
    // until the reader takes over, the skyline walks through the universities by itself
    if (!REDUCED) setInterval(function () { if (!touched && inView && !hovering && !document.hidden && !phone()) step(1); }, 4200);
    set(0, true);
    paintCut();
  }

  /* ------------------------------------------------------------------ *
   * 8. FAQ accordion (one open at a time)
   * ------------------------------------------------------------------ */
  function initFaq() {
    var acc = $('[data-acc]');
    if (!acc) return;
    var items = $$('.acc-item', acc);
    items.forEach(function (item) {
      var q = $('.acc-q', item);
      q.addEventListener('click', function () {
        var open = !item.classList.contains('open');
        items.forEach(function (o) { o.classList.remove('open'); $('.acc-q', o).setAttribute('aria-expanded', 'false'); });
        if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 9. Lead forms → /api/enquiry (our own Netlify function)
   * ------------------------------------------------------------------ */
  var ENQUIRY_ENDPOINT = '/api/enquiry';
  function enquiryPage() { try { return location.host + location.pathname; } catch (e) { return ''; } }

  /* ------------------------------------------------------------------ *
   * 9a. Lead form helpers: flag country-code picker + live validation.
   * Everything here is front-end only; the enquiry function still runs its
   * own server-side check, which is the one that counts.
   * ------------------------------------------------------------------ */
  // [iso, name, dial code, [min, max] national-number digits]
  var COUNTRIES = [
    ['in', 'India', '+91', [10, 10]], ['ae', 'United Arab Emirates', '+971', [8, 9]],
    ['pl', 'Poland', '+48', [9, 9]], ['gb', 'United Kingdom', '+44', [9, 10]],
    ['us', 'United States', '+1', [10, 10]], ['ca', 'Canada', '+1', [10, 10]],
    ['af', 'Afghanistan', '+93', [9, 9]], ['dz', 'Algeria', '+213', [9, 9]],
    ['ar', 'Argentina', '+54', [10, 11]], ['au', 'Australia', '+61', [9, 9]],
    ['at', 'Austria', '+43', [7, 13]], ['be', 'Belgium', '+32', [8, 9]],
    ['br', 'Brazil', '+55', [10, 11]], ['cl', 'Chile', '+56', [9, 9]],
    ['cn', 'China', '+86', [10, 11]], ['co', 'Colombia', '+57', [10, 10]],
    ['dk', 'Denmark', '+45', [8, 8]], ['eg', 'Egypt', '+20', [9, 10]],
    ['fi', 'Finland', '+358', [6, 11]], ['fr', 'France', '+33', [9, 9]],
    ['de', 'Germany', '+49', [7, 12]], ['gr', 'Greece', '+30', [10, 10]],
    ['hu', 'Hungary', '+36', [8, 9]], ['id', 'Indonesia', '+62', [9, 12]],
    ['ir', 'Iran', '+98', [10, 10]], ['ie', 'Ireland', '+353', [7, 9]],
    ['it', 'Italy', '+39', [6, 11]], ['jp', 'Japan', '+81', [9, 10]],
    ['kz', 'Kazakhstan', '+7', [10, 10]], ['ke', 'Kenya', '+254', [9, 9]],
    ['my', 'Malaysia', '+60', [9, 10]], ['mx', 'Mexico', '+52', [10, 10]],
    ['ma', 'Morocco', '+212', [9, 9]], ['mm', 'Myanmar', '+95', [7, 10]],
    ['nl', 'Netherlands', '+31', [9, 9]], ['nz', 'New Zealand', '+64', [8, 10]],
    ['ng', 'Nigeria', '+234', [8, 10]], ['no', 'Norway', '+47', [8, 8]],
    ['pk', 'Pakistan', '+92', [10, 10]], ['pe', 'Peru', '+51', [8, 9]],
    ['ph', 'Philippines', '+63', [8, 10]], ['pt', 'Portugal', '+351', [9, 9]],
    ['qa', 'Qatar', '+974', [8, 8]], ['ro', 'Romania', '+40', [9, 9]],
    ['ru', 'Russia', '+7', [10, 10]], ['sa', 'Saudi Arabia', '+966', [9, 9]],
    ['sg', 'Singapore', '+65', [8, 8]], ['za', 'South Africa', '+27', [9, 9]],
    ['kr', 'South Korea', '+82', [8, 10]], ['es', 'Spain', '+34', [9, 9]],
    ['lk', 'Sri Lanka', '+94', [9, 9]], ['se', 'Sweden', '+46', [7, 9]],
    ['ch', 'Switzerland', '+41', [9, 9]], ['tz', 'Tanzania', '+255', [9, 9]],
    ['th', 'Thailand', '+66', [8, 9]], ['tn', 'Tunisia', '+216', [8, 8]],
    ['tr', 'Turkey', '+90', [10, 10]], ['ug', 'Uganda', '+256', [9, 9]],
    ['ua', 'Ukraine', '+380', [9, 9]], ['ve', 'Venezuela', '+58', [10, 10]],
    ['vn', 'Vietnam', '+84', [9, 10]]
  ];
  var FLAG_DIR = './assets/img/flags/';
  var COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com',
    'rediffmail.com', 'yahoo.co.in', 'yahoo.co.uk', 'hotmail.co.uk', 'protonmail.com', 'aol.com', 'msn.com', 'zoho.com'];

  function country(iso) { for (var i = 0; i < COUNTRIES.length; i++) if (COUNTRIES[i][0] === iso) return COUNTRIES[i]; return COUNTRIES[0]; }

  function editDistance(a, b) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }

  /* Each rule returns { ok, msg, hint?, fix? }: ok=false blocks submit, a hint without
     an error is advisory only (e.g. "did you mean gmail.com?"). */
  var RULES = {
    name: function (v) {
      v = v.trim();
      if (!v) return { ok: false, msg: 'Please enter your name.' };
      if (v.length < 2 || !/\p{L}/u.test(v)) return { ok: false, msg: 'Please enter your full name.' };
      if (/\d/.test(v)) return { ok: false, msg: 'Names can\'t contain numbers.' };
      return { ok: true };
    },
    email: function (v) {
      v = v.trim();
      if (!v) return { ok: false, msg: 'Please enter your email address.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || /\.\./.test(v)) return { ok: false, msg: 'That doesn\'t look like a valid email — check for typos.' };
      var at = v.lastIndexOf('@'), local = v.slice(0, at), domain = v.slice(at + 1).toLowerCase();
      if (COMMON_DOMAINS.indexOf(domain) < 0) {
        var best = null, bd = 3;
        COMMON_DOMAINS.forEach(function (d) { var k = editDistance(domain, d); if (k < bd) { bd = k; best = d; } });
        if (best && bd <= 2) return { ok: true, hint: 'Did you mean ', fix: local + '@' + best };
      }
      return { ok: true };
    },
    state: function (v) { return v ? { ok: true } : { ok: false, msg: 'Please select your state.' }; },
    phone: function (v, iso) {
      var c = country(iso), min = c[3][0], max = c[3][1];
      var raw = v.trim();
      if (!raw) return { ok: false, msg: 'Please enter your phone number.' };
      if (/^\+|^00/.test(raw)) return { ok: false, msg: 'Pick the country code from the list, then type the rest of the number.' };
      if (/[^\d\s\-().]/.test(raw)) return { ok: false, msg: 'Use digits only.' };
      var d = raw.replace(/\D/g, '');
      if (d.length === max + 1 && d.charAt(0) === '0') d = d.slice(1);       // trunk prefix, e.g. 07… in the UK
      var span = min === max ? min + ' digits' : min + '–' + max + ' digits';
      if (d.length < min) return { ok: false, msg: 'Too short — ' + c[1] + ' numbers have ' + span + ' after ' + c[2] + '.' };
      if (d.length > max) return { ok: false, msg: 'Too long — ' + c[1] + ' numbers have ' + span + ' after ' + c[2] + '.' };
      if (iso === 'in' && !/^[6-9]/.test(d)) return { ok: false, msg: 'Indian mobile numbers start with 6, 7, 8 or 9.' };
      if (/^(\d)\1+$/.test(d)) return { ok: false, msg: 'Please enter a real phone number.' };
      return { ok: true, value: d };
    }
  };

  /* The country-code select stays in the form (it carries the value and works
     without JS); a button + searchable flag list replaces it on screen. */
  function enhanceCountryPicker(form, onChange) {
    var select = $('select[name="country_code"]', form);
    if (!select || select.__picker) return null;
    select.__picker = true;
    var state = { iso: select.value === '+91' ? 'in' : (COUNTRIES.filter(function (c) { return c[2] === select.value; })[0] || COUNTRIES[0])[0] };

    var wrap = document.createElement('div');
    wrap.className = 'cc';
    wrap.innerHTML =
      '<button type="button" class="cc-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Country code">' +
        '<img class="cc-flag" alt="" width="22" height="16"><span class="cc-dial"></span>' +
        '<svg class="cc-chev" width="12" height="12" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2"/></svg>' +
      '</button>';
    var pop = document.createElement('div');
    pop.className = 'cc-pop';
    pop.hidden = true;
    pop.innerHTML =
      '<div class="cc-search"><svg width="16" height="16" aria-hidden="true"><use href="#i-search"/></svg><input type="text" placeholder="Search country or code" aria-label="Search countries" autocomplete="off"></div>' +
      '<ul class="cc-list" role="listbox" aria-label="Countries">' + COUNTRIES.map(function (c) {
        return '<li role="option" data-iso="' + c[0] + '" aria-selected="false"><img src="' + FLAG_DIR + c[0] + '.svg" alt="" width="22" height="16" loading="lazy"><span class="nm">' + esc(c[1]) + '</span><span class="dl">' + c[2] + '</span></li>';
      }).join('') + '</ul>';
    select.parentNode.insertBefore(wrap, select);
    select.classList.add('cc-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pop);   // fixed-position popover: never clipped by a card or modal

    var btn = $('.cc-btn', wrap), search = $('input', pop), items = $$('li', pop), active = -1;

    function paint() {
      var c = country(state.iso);
      $('.cc-flag', btn).src = FLAG_DIR + c[0] + '.svg';
      $('.cc-dial', btn).textContent = c[2];
      btn.setAttribute('title', c[1] + ' (' + c[2] + ')');
      select.value = c[2];
      items.forEach(function (li) { li.setAttribute('aria-selected', String(li.getAttribute('data-iso') === c[0])); });
    }
    function place() {
      var r = btn.getBoundingClientRect(), h = Math.min(330, window.innerHeight - 24);
      var below = window.innerHeight - r.bottom - 12;
      pop.style.left = clamp(r.left, 8, window.innerWidth - pop.offsetWidth - 8) + 'px';
      pop.style.maxHeight = h + 'px';
      if (below >= Math.min(h, 260) || below > r.top) { pop.style.top = (r.bottom + 6) + 'px'; pop.style.bottom = 'auto'; }
      else { pop.style.top = 'auto'; pop.style.bottom = (window.innerHeight - r.top + 6) + 'px'; }
    }
    function visible() { return items.filter(function (li) { return !li.hidden; }); }
    function highlight(i) {
      var v = visible(); if (!v.length) return;
      active = (i + v.length) % v.length;
      items.forEach(function (li) { li.classList.remove('active'); });
      v[active].classList.add('active');
      v[active].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      if (!pop.hidden) return;
      pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); wrap.classList.add('open');
      search.value = ''; items.forEach(function (li) { li.hidden = false; });
      place();
      var sel = items.filter(function (li) { return li.getAttribute('data-iso') === state.iso; })[0];
      highlight(items.indexOf(sel));
      if (FINE) search.focus();
    }
    function close(refocus) {
      if (pop.hidden) return;
      pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); wrap.classList.remove('open');
      if (refocus) btn.focus();
    }
    function choose(iso) { state.iso = iso; paint(); close(true); if (onChange) onChange(); }

    btn.addEventListener('click', function () { if (pop.hidden) open(); else close(); });
    btn.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    items.forEach(function (li) { li.addEventListener('click', function () { choose(li.getAttribute('data-iso')); }); });
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase().replace(/^\+/, '');
      items.forEach(function (li) {
        var c = country(li.getAttribute('data-iso'));
        li.hidden = !!q && c[1].toLowerCase().indexOf(q) < 0 && c[2].replace('+', '').indexOf(q) !== 0 && c[0] !== q;
      });
      highlight(0);
    });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); highlight(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); var v = visible()[active]; if (v) choose(v.getAttribute('data-iso')); }
      else if (e.key === 'Escape' || e.key === 'Tab') { close(e.key === 'Escape'); }
    });
    document.addEventListener('pointerdown', function (e) { if (!pop.hidden && !pop.contains(e.target) && !wrap.contains(e.target)) close(); });
    window.addEventListener('resize', function () { close(); });
    window.addEventListener('scroll', function () { if (!pop.hidden) place(); }, { passive: true });

    paint();
    return {
      iso: function () { return state.iso; },
      reset: function () { state.iso = 'in'; paint(); }
    };
  }

  function enhanceValidation(form) {
    var picker = enhanceCountryPicker(form, function () { if (fields.phone.touched || fields.phone.input.value) check('phone', true); });
    var fields = {};
    [['name', 'input[name="name"]'], ['email', 'input[name="email"]'], ['phone', 'input[name="phone_number"]'], ['state', 'select[name="state"]']].forEach(function (p) {
      var input = $(p[1], form);
      if (!input) return;
      var box = input.closest('.field');
      var msg = document.createElement('p');
      msg.className = 'field-msg';
      msg.id = (input.id || p[0] + Math.random().toString(36).slice(2, 7)) + '-msg';
      msg.setAttribute('aria-live', 'polite');
      box.appendChild(msg);
      if (input.tagName !== 'SELECT') {   // a dropdown keeps its own chevron in that corner
        var mark = document.createElement('span');
        mark.className = 'vmark';
        mark.setAttribute('aria-hidden', 'true');
        input.parentNode.appendChild(mark);
      }
      input.setAttribute('aria-describedby', msg.id);
      fields[p[0]] = { input: input, box: box, msg: msg, touched: false };
    });

    function check(key, show) {
      var f = fields[key];
      if (!f) return true;
      var res = RULES[key](f.input.value, picker ? picker.iso() : 'in');
      var showErr = show && !res.ok;
      f.box.classList.toggle('is-valid', res.ok && f.input.value.trim() !== '');
      f.box.classList.toggle('is-invalid', showErr);
      f.input.setAttribute('aria-invalid', String(showErr));
      f.msg.innerHTML = '';
      f.msg.className = 'field-msg';
      if (showErr) { f.msg.textContent = res.msg; f.msg.classList.add('err'); }
      else if (res.fix) {
        f.msg.classList.add('hint');
        f.msg.appendChild(document.createTextNode(res.hint));
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = res.fix;
        b.addEventListener('click', function () { f.input.value = res.fix; check(key, true); f.input.focus(); });
        f.msg.appendChild(b);
        f.msg.appendChild(document.createTextNode('?'));
      }
      return res.ok;
    }

    Object.keys(fields).forEach(function (key) {
      var f = fields[key];
      f.input.addEventListener('blur', function () { if (f.input.value.trim()) f.touched = true; check(key, f.touched); });
      f.input.addEventListener('change', function () { f.touched = true; check(key, true); });
      f.input.addEventListener('input', function () {
        if (key === 'phone') {   // keep only what a phone number can contain
          var clean = f.input.value.replace(/[^\d\s\-().+]/g, '');
          if (clean !== f.input.value) f.input.value = clean;
        }
        check(key, f.touched);
      });
    });

    form.__validate = function () {
      var first = null;
      Object.keys(fields).forEach(function (key) {
        fields[key].touched = true;
        if (!check(key, true) && !first) first = fields[key].input;
      });
      if (first) first.focus();
      return !first;
    };
    form.__phoneDigits = function () {
      var r = RULES.phone(fields.phone ? fields.phone.input.value : '', picker ? picker.iso() : 'in');
      return r.value || '';
    };
    form.__resetValidation = function () {
      Object.keys(fields).forEach(function (key) {
        var f = fields[key];
        f.touched = false;
        f.box.classList.remove('is-valid', 'is-invalid');
        f.input.removeAttribute('aria-invalid');
        f.msg.textContent = ''; f.msg.className = 'field-msg';
      });
      if (picker) picker.reset();
    };
  }

  /* A sent pass stays "completed" in this browser for 30 days, so the same
     person isn't asked to fill it in again. */
  var LEAD_DONE_KEY = 'tc_pl_lead_done';
  function leadDone() {
    try {
      var d = JSON.parse(localStorage.getItem(LEAD_DONE_KEY) || 'null');
      return d && Date.now() - d.at < 30 * 864e5 ? d : null;
    } catch (e) { return null; }
  }

  /* Campaign attribution: UTM tags from the landing URL, kept for the visit. */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  function utmTags() {
    var out = {};
    try {
      var p = new URLSearchParams(location.search), kept = JSON.parse(sessionStorage.getItem('tcUtm') || '{}');
      UTM_KEYS.forEach(function (k) { if (p.get(k)) kept[k] = p.get(k).slice(0, 100); });
      sessionStorage.setItem('tcUtm', JSON.stringify(kept));
      out = kept;
    } catch (e) { /* storage unavailable */ }
    return out;
  }

  // Boarding-pass style passenger name: SURNAME / GIVEN NAMES
  function paxName(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return (parts.length > 1 ? parts[parts.length - 1] + ' / ' + parts.slice(0, -1).join(' ') : parts[0]).toLocaleUpperCase();
  }

  function initForms() {
    var UTM = utmTags();
    // on phones and tablets the floating chat buttons would cover the pass's
    // own controls, so they step aside while it is on screen
    var pass = $('.ticket');
    if (pass && 'IntersectionObserver' in window) new IntersectionObserver(function (es) {
      document.body.classList.toggle('at-pass', es[0].isIntersecting);
    }, { rootMargin: '-15% 0px -15% 0px' }).observe(pass);
    $$('form[data-lead-form]').forEach(function (form) {
      enhanceValidation(form);

      var ticket = form.closest('.ticket'), pax = ticket && $('[data-pax]', ticket), nameIn = $('input[name="name"]', form);
      var done = ticket && $('[data-lead-done]', ticket);
      function paintPax(name) {
        if (!pax) return;
        var txt = paxName(name), was = pax.classList.contains('pax-empty');
        if (!txt) { pax.textContent = 'Your name appears here'; pax.classList.add('pax-empty'); return; }
        pax.textContent = txt;
        pax.classList.remove('pax-empty');
        if (was) { pax.classList.remove('pop'); void pax.offsetWidth; pax.classList.add('pop'); }
      }
      if (nameIn) nameIn.addEventListener('input', function () { paintPax(nameIn.value); });

      // dropdowns read muted until something is picked
      var selects = $$('.field.sel select', form);
      // the face over each dropdown shows its choice, stepping the type down
      // until the wording fits; a choice too long even then makes the row taller
      function fitFace(s) {
        var face = s.parentNode.querySelector('.sel-face');
        if (!face) return;
        var opt = s.options[s.selectedIndex];
        face.textContent = opt ? opt.textContent : '';
        face.classList.toggle('is-empty', !s.value);
        face.style.fontSize = '';
        var size = parseFloat(getComputedStyle(face).fontSize);
        // first try to keep the choice on one line by shrinking a step or two, then let it wrap
        face.style.whiteSpace = 'nowrap';
        while (face.scrollWidth > face.clientWidth + 1 && size > 13) { size -= 0.5; face.style.fontSize = size + 'px'; }
        face.style.whiteSpace = '';
        while (face.scrollHeight > face.clientHeight + 1 && size > 12.5) { size -= 0.5; face.style.fontSize = size + 'px'; }
        for (var g = 0; g < 6 && face.scrollHeight > face.clientHeight + 1; g++) s.style.height = (s.offsetHeight + face.scrollHeight - face.clientHeight + 8) + 'px';
      }
      function paintSelects() {
        selects.forEach(function (s) { s.style.height = ''; s.classList.toggle('is-empty', !s.value); });
        selects.forEach(fitFace);
        // dropdowns sharing a row stay the same height
        $$('.field-row', form).forEach(function (row) {
          var inRow = $$('.field.sel select', row), h = Math.max.apply(null, inRow.map(function (s) { return s.offsetHeight; }));
          if (inRow.some(function (s) { return s.style.height; })) inRow.forEach(function (s) { s.style.height = h + 'px'; });
        });
      }
      selects.forEach(function (s) { s.addEventListener('change', paintSelects); });
      paintSelects();
      window.addEventListener('resize', function () { clearTimeout(paintSelects.t); paintSelects.t = setTimeout(paintSelects, 150); });

      var btn = $('[data-submit-btn]', form);
      var errBox = $('[data-form-error]', form);
      function status(state, msg) {
        if (!errBox) return;
        errBox.classList.toggle('hidden', state !== 'error');
        if (state === 'error' && msg) ($('[data-form-error-text]', errBox) || errBox).textContent = msg;
      }

      function showDone(d, animate) {
        if (!done) return;
        var first = String(d.name || '').trim().split(/\s+/)[0];
        $('[data-done-name]', done).textContent = first ? ', ' + first : '';
        $('[data-done-time]', done).textContent = d.call_time && !/^any/i.test(d.call_time) ? ' in the ' + d.call_time.replace(/\s*\(.*\)/, '').toLowerCase() : '';
        form.hidden = true;
        ticket.classList.add('is-done');
        done.hidden = false;
        done.classList.remove('is-enter');
        if (animate && !REDUCED) { void done.offsetWidth; done.classList.add('is-enter'); }
        paintPax(d.name);
      }
      // "+ Submit another enquiry": forget the sent flag and bring back a fresh pass
      function reopen() {
        try { localStorage.removeItem(LEAD_DONE_KEY); } catch (e) { /* private mode */ }
        var keep = {};
        $$('[data-destination-input], [data-shortlist-input]', form).forEach(function (i) { keep[i.name] = i.value; });
        form.reset();
        $$('[data-destination-input], [data-shortlist-input]', form).forEach(function (i) { i.value = keep[i.name]; });
        if (form.__resetValidation) form.__resetValidation();
        paintSelects(); paintPax(''); status('idle');
        if (done) { done.hidden = true; done.classList.remove('is-enter'); }
        ticket.classList.remove('is-done');
        form.hidden = false;
        if (nameIn) nameIn.focus({ preventScroll: true });
      }
      if (done) $('[data-lead-again]', done).addEventListener('click', reopen);

      var sent = leadDone();
      if (sent) showDone(sent, false);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        status('idle');
        if (leadDone()) return;
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = typeof v === 'string' ? v.trim() : v; });

        // each field shows its own message; nothing is sent until they all pass
        if (form.__validate && !form.__validate()) return;
        data.phone = (data.country_code || '') + ' ' + (form.__phoneDigits ? form.__phoneDigits() : data.phone_number || '');
        delete data.country_code; delete data.phone_number;
        data.page = enquiryPage();
        Object.keys(UTM).forEach(function (k) { data[k] = UTM[k]; });

        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }

        fetch(ENQUIRY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (r) { return r.json().catch(function () { return { success: false }; }); })
          .then(function (res) {
            if (res && res.success) {
              var d = { name: data.name, call_time: data.call_time || '', at: Date.now() };
              try { localStorage.setItem(LEAD_DONE_KEY, JSON.stringify(d)); } catch (err) { /* private mode */ }
              showDone(d, true);
              if (done) done.focus({ preventScroll: true });
            } else {
              status('error', (res && res.message) || 'Something went wrong. Please try again.');
            }
          })
          .catch(function () { status('error', 'Network error. Please check your connection and try again.'); })
          .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
      });
    });

    // Universities picked on the directory page (or from a university's details) are in the
    // shortlist store already. Two older routes still arrive: the one-off storage key an
    // earlier directory page set, and ?apply= when storage is blocked (private windows,
    // strict settings).
    if (!$('[data-shortlist-input]')) return;
    var picked = '';
    try {
      picked = localStorage.getItem('selectedUniversity') || '';
      if (picked) localStorage.removeItem('selectedUniversity');
    } catch (err) { /* storage unavailable */ }
    try {
      var params = new URLSearchParams(location.search);
      if (!picked && params.get('apply')) picked = params.get('apply').slice(0, 1500);
      if (params.has('apply')) history.replaceState(null, '', location.pathname + location.hash);
    } catch (err) { /* old browser */ }
    if (picked) addToShortlist(picked);
    paintPassShortlist();
    shortlist.onChange(paintPassShortlist);

    // the chips' × removes a university everywhere; focus moves to its neighbour
    // (or to "+ Add universities") so a keyboard user isn't dropped at the top
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-sl-remove]');
      if (!b) return;
      var box = b.closest('[data-sl-chips]'), all = $$('[data-sl-remove]', box), at = all.indexOf(b);
      shortlist.remove(b.getAttribute('data-sl-remove'));
      var left = $$('[data-sl-remove]', box), next = left[Math.min(at, left.length - 1)] || $('[data-sl-add]', box);
      if (next) next.focus({ preventScroll: true });
    });
  }

  /* The hidden destination carries "Poland shortlist: …" to the enquiry; the pass shows
     just the names. */
  function setDestination(v, root, label) {
    var val = v || 'General Poland Inquiry';
    $$('[data-destination-input]', root).forEach(function (i) { i.value = val; });
    $$('[data-destination-label]', root).forEach(function (l) { l.textContent = label || val; });
  }

  /* ------------------------------------------------------------------ *
   * 9a. Shortlist: the universities a visitor picks, by Polish name, shared by the
   *     home page and the directory through localStorage (another tab's changes
   *     arrive through the storage event). The pass's hidden `shortlist` field and
   *     its chips, the Select buttons and the floating notice all follow it.
   * ------------------------------------------------------------------ */
  var shortlist = (function () {
    var KEY = 'tcPlShortlist', MAX = 20, mem = [], stored = true, fns = [];
    function clean(l) { return Array.isArray(l) ? l.filter(function (n) { return typeof n === 'string' && n; }).slice(0, MAX) : []; }
    function read() {
      if (!stored) return mem.slice();
      try { return clean(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { stored = false; return mem.slice(); }
    }
    function tell(info) {
      var list = mem.slice();
      fns.forEach(function (fn) { try { fn(list, info || {}); } catch (e) { setTimeout(function () { throw e; }); } });
    }
    function write(list, info) {
      mem = list.slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(mem)); stored = true; } catch (e) { stored = false; }
      tell(info);
    }
    mem = read();
    window.addEventListener('storage', function (e) {
      if (e.key !== KEY) return;
      var was = mem;
      mem = read();
      tell({ added: mem.filter(function (n) { return was.indexOf(n) < 0; }).pop() });
    });
    return {
      MAX: MAX,
      all: read,
      has: function (n) { return read().indexOf(n) > -1; },
      // false only when the list is full
      add: function (n) {
        var l = read();
        if (!n || l.indexOf(n) > -1) return true;
        if (l.length >= MAX) { tell({ full: n }); return false; }
        l.push(n); write(l, { added: n });
        return true;
      },
      remove: function (n) {
        var l = read(), i = l.indexOf(n);
        if (i < 0) return;
        l.splice(i, 1); write(l, { removed: n });
      },
      // true when the university is on the list afterwards
      toggle: function (n) { if (this.has(n)) { this.remove(n); return false; } return this.add(n); },
      kept: function () { return stored; },          // false: storage blocked, this page only
      onChange: function (fn) { fns.push(fn); }
    };
  })();

  var uniByName = null;
  function findUniByName(name) {
    if (!uniByName) { uniByName = {}; (window.PL_UNIVERSITIES || []).forEach(function (u) { uniByName[u.name] = u; }); }
    return uniByName[name] || null;
  }
  // the English name where the data has one ("University of Warsaw"), else the Polish one
  function uniLabel(name) { var u = findUniByName(name); return (u && englishName(u)) || name; }
  // A comma-joined list from ?apply= or older storage. Some names contain ", "
  // themselves, so neighbouring pieces are rejoined while they make a known name.
  function shortlistNames(list) {
    var parts = String(list || '').split(/\s*,\s*/), out = [];
    for (var i = 0; i < parts.length; i++) {
      var hit = '';
      for (var j = parts.length; j > i + 1 && !hit; j--) {
        if (findUniByName(parts.slice(i, j).join(', '))) { hit = parts.slice(i, j).join(', '); i = j - 1; }
      }
      if (!hit) hit = parts[i].trim();
      if (hit) out.push(hit);
    }
    return out;
  }
  function addToShortlist(list) { shortlistNames(list).forEach(function (n) { shortlist.add(n); }); }
  // a shortlist toggle button: a tick ring and a word, with the university in its name
  function paintSelBtn(b, on, name, words) {
    words = words || ['Shortlist', 'Shortlisted'];
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
    if (name) b.setAttribute('aria-label', words[0] + ' ' + name);
    b.innerHTML = '<span class="tick" aria-hidden="true">' + (on ? '✓' : '') + '</span>' + (on ? words[1] : words[0]);
  }

  /* The pass follows the shortlist: the hidden field always equals the chips, the
     destination carries "Poland shortlist: …" and the stub names the pick. */
  function paintPassShortlist() {
    var list = shortlist.all(), joined = list.join(', ');
    $$('[data-shortlist-input]').forEach(function (i) { i.value = joined; });
    setDestination(joined ? 'Poland shortlist: ' + joined : '', null,
      list.length > 1 ? list.length + ' shortlisted universities' : (list.length ? uniLabel(list[0]) : ''));
    $$('[data-sl-chips]').forEach(function (box) {
      box.classList.toggle('is-empty', !list.length);
      $('[data-sl-chip-list]', box).innerHTML = list.map(function (n) {
        var label = uniLabel(n);
        return '<li class="sl-chip"' + (label !== n ? ' title="' + esc(n) + '"' : '') + '><span>' + esc(label) + '</span>' +
          '<button type="button" data-sl-remove="' + esc(n) + '" aria-label="Remove ' + esc(label) + ' from your shortlist">' +
          '<svg width="12" height="12" aria-hidden="true"><use href="#i-x"/></svg></button></li>';
      }).join('');
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. Tutee AI: answers from this page's own content: live university data, a
   *     knowledge base written from the page, then a search of the page text; only
   *     what the page doesn't cover goes to an advisor. Asking for a callback starts
   *     the lead capture below, which sends name, phone and email to /api/enquiry.
   * ------------------------------------------------------------------ */
  var CHAT_WELCOME = "Hi! 👋 I'm **Tutee AI**.\n\nAsk me anything about studying in Poland: visas, universities and rankings, working while you study, scholarships and loans, settling after graduation or bringing your family.";

  /* ---- text helpers: fold diacritics, drop filler words, light stemming ---- */
  function foldText(s) {
    return ' ' + String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9+½ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }
  var STOP = {};
  ('a an the and or of to in on for at by with from is are am be been was were do does did can could would should will i me my we our you your it its this that these those ' +
   'what which who whom how when where why there here about any some tell please know want need get got have has had if as so than then just also more most very much many ' +
   'poland polish study studying student students')
    .split(' ').forEach(function (w) { STOP[w] = 1; });
  function stem(w) { return w.length > 4 ? w.replace(/ies$/, 'y').replace(/(ing|ed|es|s)$/, '') : w; }
  function toks(s) { return foldText(s).trim().split(' ').filter(function (w) { return w && !STOP[w]; }).map(stem); }
  function has(q, phrase) { return q.indexOf(' ' + foldText(phrase).trim() + ' ') > -1; }
  function hasAny(q, list) { for (var i = 0; i < list.length; i++) if (has(q, list[i])) return true; return false; }

  /* ---- knowledge base, written only from what this page states ---- */
  var ADVISOR = { label: 'Talk to an advisor', go: 'contact' };
  var KB = [
    { keys: ['visa', 'student visa', 'national visa', 'type d', 'visa process', 'get visa', 'apply visa', 'visa d', 'residence permit', 'karta pobytu', 'temporary residence', 'mos', 'voivodeship', 'consulate'],
      a: "Getting a Polish student visa takes three steps:\n• **Check the university**: it must be approved by the Ministry of the Interior (MSWiA) to admit foreigners, or exempt. Without that, no residence permit can be issued.\n• **National visa (type D)**: with your admission decision, apply at the Polish consulate showing your funds, travel medical insurance and accommodation.\n• **Residence permit**: after you arrive, file for the temporary residence permit for studies through the MOS system and attend the voivodeship office in person.\n\nWe guide you through every step, with a **99% Polish visa success rate**." },
    { keys: ['mswia', 'approved', 'approval', 'ministry of the interior', 'exempt', 'approved list', 'legal', 'legally admit', 'admit international'],
      a: "A university must be **approved by the Ministry of the Interior (MSWiA)** to admit foreigners, or be exempt from that requirement. Otherwise a residence permit for studies cannot be issued. Every one of the **227 institutions** in our directory is approved or exempt, and we verify this before you commit.", acts: [{ label: 'Browse the 227 institutions', go: 'directory' }] },
    { keys: ['work', 'part time', 'job', 'jobs', 'earn', 'working hours', 'hours', 'weekly cap', 'hour limit', 'work permit', 'work while', 'earn while you learn', 'salary', 'income'],
      a: "Yes. **Full-time students** at an MSWiA-approved or exempt university need **no work permit and face no weekly hour cap**. There is no Polish equivalent of a 20-hour limit. Part-time, postgraduate and MBA study don't qualify for this.\n\nOur **Earn While You Learn** support helps you find permitted part-time work (retail, warehouse, student ambassador roles and more) soon after you arrive. Our students typically secure roles within their first 30 days, and many start repaying their education loan before graduating." },
    { keys: ['after graduation', 'graduate permit', 'post study', 'stay after', 'nine month', '9 month', 'job search', 'stay back', 'psw', 'post-study', 'after my degree', 'after studies'],
      a: "Poland grants graduates a **nine-month temporary residence permit** to look for work or start a business. It's granted once, with **no sponsor** needed.\n• Apply **in person while still legally resident**, at the latest on the last day of your lawful stay, so don't leave Poland first.\n• The permit itself carries no work right, but graduates of full-time Polish degrees **need no work permit**, so you can take a job.\n\nIt's the ideal bridge into an **EU Blue Card**." },
    { keys: ['blue card', 'eu blue card', 'work visa', 'long term work', 'career', 'employment', 'work permit after', 'job after'],
      a: "After the graduate permit you can move to an **EU Blue Card** or a combined residence-and-work permit for long-term work. On a Blue Card, bringing your family is far simpler, and your **partner may work with no separate work permit**." },
    { keys: ['permanent residence', 'permanent residency', 'pr', 'long term resident', 'long-term resident', 'settle', 'settlement', 'stay permanently', 'five years', '5 years', 'citizenship'],
      a: "Settling in Poland is a staircase:\n• **Study**: Polish student visa\n• **Graduate**: nine-month graduate permit\n• **Work**: EU Blue Card\n• **Settle**: EU long-term resident status after **five continuous years** of residence, with **study time counted at one half**\n\nWe plan that clock with you from day one.", acts: [ADVISOR] },
    { keys: ['family', 'spouse', 'wife', 'husband', 'partner', 'children', 'child', 'kids', 'dependent', 'dependant', 'dependants', 'bring family', 'reunification', 'parents', 'wife work', 'husband work', 'spouse work', 'partner work', 'can my wife', 'can my husband', 'can my spouse', 'can my partner'],
      a: "Yes, but the timing matters:\n• **Year 1**: your first permit runs 15 months, so family reunification can't start from it.\n• **Year 2, as a student**: after two years on consecutive permits, with the current one issued for at least a year, your **partner and children under 18** can join you, and your partner's permit lets them work with no separate work permit.\n• **EU Blue Card**: the simplest route; your partner may work with no separate work permit.\n\nWe handle the applications, documents and voivodeship office appointments." },
    { keys: ['scholarship', 'scholarships', 'nawa', 'banach', 'grant', 'grants', 'bursary', 'bursaries', 'free tuition', 'tuition waiver', 'stipend', 'merit'],
      a: "Scholarship routes on offer:\n• **NAWA Banach programme**: India is an eligible country for full-time master's study. It pays a monthly stipend, waives tuition at a public university and adds a travel allowance.\n• **Merit-based scholarships** straight from Polish universities for strong academic profiles.\n• **Full and partial grants**: institutional bursaries and department-specific awards.\n• **Doctoral schools** charge no tuition and pay every full-time doctoral candidate a scholarship.\n\nWe also help with winning essays and the supporting documents.", acts: [ADVISOR] },
    { keys: ['loan', 'loans', 'education loan', 'bank', 'banks', 'collateral', 'non collateral', 'non-collateral', 'financing', 'financial aid', 'lender', 'lenders', 'lending', 'lending partners', 'loan partners'],
      a: "We arrange both **collateral and non-collateral education loans** through tie-ups with national banks and private lenders, covering **tuition, accommodation and living costs** at competitive interest rates.\n\nLending partners: ICICI Bank, HDFC Credila, IDFC First Bank, InCred, Auxilo, Avanse, Union Bank, Prodigy Finance, Axis Bank and MPOWER Financing." },
    { keys: ['scholarships and loans', 'funding', 'fund my', 'pay for', 'finance my', 'afford'],
      a: "Three ways to fund your Polish degree:\n• **Scholarships and grants**: NAWA Banach (India is eligible for full-time master's), university merit scholarships and bursaries.\n• **Education loans**: collateral and non-collateral, covering tuition, accommodation and living costs.\n• **Earn while you learn**: full-time students can work with no work permit and no weekly cap.\n\nAsk me about any one of them for details." },
    { keys: ['cost', 'costs', 'fee', 'fees', 'tuition', 'expensive', 'cheap', 'affordable', 'budget', 'price', 'how much', 'living cost', 'cost of living'],
      a: "Poland offers some of the **most affordable public-university study in the EU**, and doctoral schools charge no tuition at all. Exact fees depend on the university and programme, and they aren't listed on this page. For the residence permit you'll need to show you can cover **living costs, tuition and a return journey**.\n\nFor exact figures for your course, an advisor can help.", acts: [ADVISOR] },
    { keys: ['proof of funds', 'funds', 'bank balance', 'maintenance', 'financial requirement', 'show money', 'sponsor', 'bank statement'],
      a: "For the national visa and the residence permit you must show you can cover **your living costs, your tuition and a return journey**. Our processing team helps you build a compelling financial and sponsor file. The exact amount depends on your case, so an advisor can work it out with you.", acts: [ADVISOR] },
    { keys: ['ielts', 'toefl', 'pte', 'duolingo', 'english test', 'language test', 'english', 'gmat', 'language requirement', 'score', 'band', 'cambridge'],
      a: "Poland sets **no language requirement for the residence permit**. It's purely an admission matter, and each university publishes its own list.\n• **IELTS Academic, TOEFL iBT and PTE Academic** are accepted essentially everywhere.\n• The **Duolingo English Test** is accepted by some institutions but not the most selective (the University of Warsaw doesn't list it).\n• Some postgraduate courses, MBAs in particular, also ask for a **GMAT** score.\n\nWe run test preparation and mock tests and book your official test date. Required scores vary by university.", acts: [ADVISOR] },
    { keys: ['requirement', 'requirements', 'eligibility', 'eligible', 'documents needed', 'documents', 'what do i need', 'admission requirement', 'criteria', 'qualify', 'qualification', 'transcripts', 'motivation letter'],
      a: "To study in Poland you need:\n• a valid passport\n• strong academic transcripts\n• proof of English for an English-taught degree (IELTS Academic, TOEFL iBT or PTE Academic)\n• academic references\n• a compelling motivation letter\n\nThere's no national entrance exam. Some postgraduate courses, MBAs in particular, may also ask for a GMAT score or work experience." },
    { keys: ['intake', 'intakes', 'deadline', 'deadlines', 'when to apply', 'application process', 'how to apply', 'admission process', 'semester', 'start date', 'apply to university', 'entrance exam'],
      a: "Poland has **no central application system and no national entrance exam**. You apply to each university through its own recruitment system, to its own deadlines. Specific intake dates aren't listed on this page, so an advisor can confirm them for your chosen programme.", acts: [ADVISOR] },
    { keys: ['accommodation', 'housing', 'hostel', 'dorm', 'dormitory', 'rent', 'flat', 'apartment', 'pre departure', 'pre-departure', 'packing', 'briefing'],
      a: "Yes. We partner with student housing providers to secure **safe, comfortable living spaces near your campus**, and run **pre-departure briefings** on Polish culture, academic expectations, packing lists and immigration procedures." },
    { keys: ['post landing', 'post-landing', 'after arrival', 'arrive', 'arrival', 'pesel', 'gmina', 'bank account', 'health insurance', 'insurance', 'register'],
      a: "Once you land, your dedicated consultant helps with:\n• secure off-campus accommodation\n• registering your residence with the gmina\n• applying for your **PESEL** number\n• filing your temporary residence permit through the **MOS** system\n• putting **health insurance** in place\n• finding permitted part-time jobs\n• opening a Polish current account" },
    { keys: ['why poland', 'why study', 'benefits', 'advantages', 'is poland good', 'reasons', 'worth it', 'good option'],
      a: "Why Poland:\n• **World-ranked universities**: 20 Polish institutions are in the QS World University Rankings 2027.\n• **Affordable, EU-recognised degrees**.\n• **Nine-month graduate permit** with no sponsor needed.\n• **Work with no weekly cap** for full-time students.\n• **Practical, hands-on teaching**.\n• **Doctoral schools that fund you**: no tuition plus a scholarship." },
    { keys: ['excellence initiative', 'idub', 'research university', 'research universities'],
      a: "**Research University** marks the 10 members of the Ministry's **Excellence Initiative: Research University (IDUB)** programme. It's a separate list from the QS rankings: 20 Polish institutions are QS-ranked, 10 are IDUB members. You can filter by either in the university directory.", acts: [{ label: 'Browse the directory', go: 'directory' }] },
    { keys: ['processing time', 'visa processing', 'how long visa', 'how long does visa', 'how long does the visa', 'visa take', 'waiting time', 'visa timeline'],
      a: "This page doesn't list visa processing times, so I won't guess. What it does say: apply for the national visa (type D) once you hold your admission decision, then file for the residence permit after you arrive. An advisor can give you current timelines for your consulate.", acts: [ADVISOR] },
    { keys: ['phd', 'doctoral', 'doctorate', 'research degree'],
      a: "Polish **doctoral schools charge no tuition** and award a **scholarship to every full-time doctoral candidate**. Ten universities belong to the Excellence Initiative: Research University (IDUB) programme." },
    { keys: ['recognised', 'recognized', 'recognition', 'valid degree', 'eu degree', 'accepted', 'degree value'],
      a: "Polish degrees are **EU-recognised**: the qualifications are recognised right across the European Union. Twenty Polish institutions also feature in the QS World University Rankings 2027." },
    { keys: ['tutee', 'tutee connect', 'who are you', 'about you', 'success rate', 'visa success', 'visa success rate', '99', 'why tutee', 'experience', 'track record'],
      a: "Tutee Connect are Poland education experts with a **99% Polish visa success rate**, **200+** Polish university tie-ups and **5,000+** students guided. We scrutinise every profile from the view of Polish consular officers and choose the right pathway. Offices in Chennai and Dubai." },
    { keys: ['services', 'your services', 'what do you do', 'what do you offer'],
      a: '__SERVICES__' },
    { keys: ['evaluate', 'evaluation', 'evaluate my profile', 'profile', 'counselling', 'counseling', 'consultation', 'book', 'appointment', 'talk to', 'advisor', 'adviser', 'counsellor', 'counselor', 'speak to'],
      a: "The **free profile evaluation** is right on this page: fill in the Profile Pass form (name, phone and email) and an expert counsellor builds your specific route map to study in Poland, at no cost. Or I can take your details here and have a counsellor call you back.", acts: [{ label: 'Request a callback', go: 'callback' }, { label: 'Open the free evaluation form', go: 'contact' }, { label: 'WhatsApp us', go: 'whatsapp' }] },
    { keys: ['refusal', 'refused', 'rejected', 'rejection', 'previous refusal', 'visa refusal', 'visa refused', 'visa rejected', 'denied', 'visa reject'],
      a: "A Polish study visa is decided largely on the file, so a **complete and internally consistent application** is the most effective way to avoid an unnecessary refusal. We've turned around profiles with a previous refusal, and an advisor can review yours.", acts: [ADVISOR] },
    { keys: ['mba', 'gmat', 'masters', "master's", 'master', 'postgraduate', 'postgrad', 'bachelor', "bachelor's", 'undergraduate', 'degree'],
      a: "Polish universities offer bachelor's, master's and doctoral study, many taught in English. Two things to know:\n• Only **full-time** degrees give the no-work-permit, no-hour-cap work right; part-time, postgraduate and MBA study don't.\n• Some postgraduate courses, MBAs in particular, may ask for a GMAT score or work experience.\n\nAsk me about a field, such as engineering or business, to see which universities offer it.", acts: [{ label: 'Browse the directory', go: 'directory' }] }
  ];

  /* ---- live data: universities, cities, fields ---- */
  var GENERIC = {};
  ('university universytet uniwersytet uniwersytecki politechnika technology technical akademia academy szkola glowna wyzsza higher school college ' +
   'instytut institute of the in im w we i and medical medyczny medyczna medycznej sciences science applied state panstwowa faculty sztuk economics ' +
   'ekonomiczny business national krajowa international management life natural przyrodniczy rolniczy agriculture ' +
   'polish poland polski polska europe european student students degree visa work family force military army')
    .split(' ').forEach(function (w) { GENERIC[w] = 1; });
  var CITY_ALIASES = { 'Warsaw': ['warszawa', 'warsaw'], 'Kraków': ['krakow', 'cracow', 'krakowie'], 'Wrocław': ['wroclaw', 'breslau'], 'Łódź': ['lodz'],
    'Gdańsk': ['gdansk', 'danzig'], 'Poznań': ['poznan'], 'Toruń': ['torun'], 'Białystok': ['bialystok'], 'Rzeszów': ['rzeszow'], 'Częstochowa': ['czestochowa'] };
  var FIELD_SYNONYMS = [
    ['Health & Welfare', ['medicine', 'medical', 'mbbs', 'nursing', 'pharmacy', 'dentistry', 'health', 'doctor', 'physiotherapy']],
    ['ICT', ['computer', 'computing', 'it course', 'it degree', 'information technology', 'software', 'computer science', 'data science', 'informatics', 'ict', 'artificial intelligence', 'cyber']],
    ['Engineering', ['engineering', 'engineer', 'mechanical', 'civil', 'electrical', 'robotics', 'aerospace']],
    ['Business & Law', ['business', 'mba', 'management', 'finance', 'law', 'economics', 'accounting', 'marketing']],
    ['Arts & Humanities', ['arts', 'art', 'humanities', 'history', 'design', 'music', 'philosophy', 'languages', 'architecture']],
    ['Social Sciences', ['social', 'psychology', 'sociology', 'political', 'international relations', 'journalism']],
    ['Natural Sciences', ['physics', 'chemistry', 'biology', 'mathematics', 'maths', 'math', 'biotechnology', 'natural sciences', 'environmental']],
    ['Education', ['education', 'teaching', 'teacher', 'pedagogy']],
    ['Agriculture', ['agriculture', 'veterinary', 'forestry', 'food']],
    ['Services', ['tourism', 'hospitality', 'sport', 'logistics']]
  ];

  function unis() { return window.PL_UNIVERSITIES || []; }
  function displayName(u) {
    var en = englishName(u);
    return en && foldText(en).trim().split(' ').some(function (w) { return !GENERIC[w] && !STOP[w]; }) ? en : u.name;
  }
  function uniTitle(u) { var en = displayName(u); return en !== u.name ? '**' + en + '** (' + u.name + ')' : '**' + u.name + '**'; }
  function rankedFirst(list) {
    return list.slice().sort(function (a, b) {
      return (a.ranked ? a.rank : 1e4) - (b.ranked ? b.rank : 1e4) || (parseInt(b.programmes, 10) || 0) - (parseInt(a.programmes, 10) || 0);
    });
  }
  function uniLine(u, i) {
    var w = qsWorld(u);
    return (i + 1) + '. ' + displayName(u) + ' (' + cityOf(u.location) + ')' + (w ? ': #' + w + ' world' : '');
  }

  var uniIndex = null, cityWords = {};
  function buildUniIndex() {
    unis().forEach(function (u) { foldText(u.location).trim().split(' ').forEach(function (w) { cityWords[w] = 1; }); });
    Object.keys(CITY_ALIASES).forEach(function (c) { CITY_ALIASES[c].forEach(function (a) { cityWords[a] = 1; }); });
    var tokenCount = {}, entries = [];
    unis().forEach(function (u) {
      var en = englishName(u);
      // a name only counts if it has a word of its own (one school's English name is just "University")
      var phrases = [u.name, en].filter(Boolean).map(function (p) { return foldText(p).trim(); })
        .filter(function (p) { return p.split(' ').some(function (w) { return w.length > 3 && !GENERIC[w] && !STOP[w]; }); });
      var acr = ((u.name + ' ' + (u.alt || '')).match(/\b[A-ZŁŚŻ]{2,5}\b/g) || []).map(function (a) { return foldText(a).trim(); });
      var distinct = {};
      phrases.forEach(function (p) { p.split(' ').forEach(function (w) { if (w.length >= 5 && !GENERIC[w] && !cityWords[w]) distinct[w] = 1; }); });
      Object.keys(distinct).forEach(function (w) { tokenCount[w] = (tokenCount[w] || 0) + 1; });
      entries.push({ u: u, phrases: phrases, acr: acr, distinct: Object.keys(distinct) });
    });
    entries.forEach(function (e) { e.distinct = e.distinct.filter(function (w) { return tokenCount[w] <= 2; }); });
    return entries;
  }
  // every institution the question names, strongest match first
  function findUnis(q) {
    if (!uniIndex) uniIndex = buildUniIndex();
    var hits = [], qWords = q.trim().split(' ');
    uniIndex.forEach(function (e) {
      var s = 0, at = 1e9;
      function seen(t) { var i = q.indexOf(' ' + t + ' '); if (i > -1 && i < at) at = i; return i > -1; }
      e.phrases.forEach(function (p) { if (seen(p)) s = Math.max(s, 100 + p.length); });
      e.acr.forEach(function (a) { if (a.length >= 2 && !STOP[a] && seen(a)) s = Math.max(s, 60); });
      e.distinct.forEach(function (w) { if (seen(w)) s = Math.max(s, 20 + w.length); });
      if (!s) e.distinct.forEach(function (w) {
        qWords.forEach(function (x) {
          if (x.length < 6 || cityWords[x] || GENERIC[x] || STOP[x] || w.length <= x.length || w.indexOf(x) !== 0) return;
          s = Math.max(s, 18 + x.length); seen(x);
        });
      });
      if (s && e.u.ranked) s += (21 - e.u.rank) / 100;   // tie-break toward the better-known institution
      if (s) hits.push({ u: e.u, s: s, at: at });
    });
    hits.sort(function (a, b) { return b.s - a.s; });
    var list = hits.map(function (h) { return h.u; });
    list.at = hits.map(function (h) { return h.at; });
    return list;
  }
  function findUni(q) { return findUnis(q)[0] || null; }
  // every city the question names, in the order it names them
  function findCities(q) {
    var cities = {}, found = [];
    unis().forEach(function (u) { cities[cityOf(u.location)] = 1; });
    Object.keys(cities).forEach(function (c) {
      var at = -1;
      (CITY_ALIASES[c] || []).concat([foldText(c).trim()]).forEach(function (a) {
        var i = a ? q.indexOf(' ' + a + ' ') : -1;
        if (i > -1 && (at < 0 || i < at)) at = i;
      });
      if (at > -1) found.push({ c: c, at: at });
    });
    return found.sort(function (a, b) { return a.at - b.at; }).map(function (x) { return x.c; });
  }
  function findCity(q) { return findCities(q)[0] || null; }
  function findField(q) {
    for (var i = 0; i < FIELD_SYNONYMS.length; i++) if (hasAny(q, FIELD_SYNONYMS[i][1])) return FIELD_SYNONYMS[i][0];
    return null;
  }
  function offers(u, field) { return String(u.programs || '').split(',').some(function (f) { return f.trim() === field; }); }

  function uniAnswer(u) {
    var w = qsWorld(u), fields = String(u.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var lines = [uniTitle(u), '📍 ' + u.location + ' · ' + (u.type || 'Institution')];
    if (u.ranked) lines.push('🏆 ' + (w ? '#' + w + ' in the world, ' : '') + '#' + u.rank + ' in Poland (QS 2027)');
    else lines.push('🏆 Not in the QS World University Rankings 2027');
    lines.push('🎓 ' + (u.programmes || '?') + ' study programmes' + (fields.length ? ': ' + fields.join(', ') : ''));
    lines.push('✅ Can admit international students (MSWiA-approved or exempt)');
    return { text: lines.join('\n'), acts: [{ label: 'Open full details', go: 'uni', name: u.name }, { label: 'Evaluate my profile for it', go: 'enquire', name: u.name }] };
  }

  function servicesAnswer() {
    var s = window.PL_SERVICES || [];
    return "We offer nine services, one seamless journey:\n" + s.map(function (x, i) { return '• **' + x.title + '**: ' + x.tagline; }).join('\n') + "\n\nAsk me about any one of them.";
  }

  /* ---- page passages: anything else the page says, ranked with BM25 ----
     The knowledge base answers go in too, so a question that misses every key
     phrase can still land on the answer whose words it shares. */
  var passages = null;
  function buildPassages() {
    var out = [];
    function add(title, text, kb) {
      text = String(text || '').replace(/\s+/g, ' ').trim();
      if (text.length > 40) out.push({ title: String(title || '').replace(/\s+/g, ' ').trim(), text: text, kb: kb || null, t: toks(title + ' ' + title + ' ' + text) });
    }
    $$('.acc-item').forEach(function (i) { add(($('.acc-q', i) || i).textContent.replace(/^\s*\d+/, ''), ($('.acc-a', i) || i).textContent); });
    $$('.why-card').forEach(function (c) { add(($('h3', c) || c).textContent, ($('p', c) || c).textContent); });
    $$('.stack-card').forEach(function (c) { add(($('h3', c) || c).textContent, ($('.copy', c) || c).textContent); });
    $$('[data-bx-tile]').forEach(function (c) { add(($('.bnc-title', c) || c).textContent, c.textContent.replace(/\s+/g, ' ')); });
    FAM_STAGES.forEach(function (s) { add('Family migration: ' + s.name, s.status + '. ' + s.text); });
    (window.PL_SERVICES || []).forEach(function (s) { add(s.title, s.tagline + '. ' + s.desc); });
    $$('.lede, .dir-note').forEach(function (l) { add('', l.textContent); });
    KB.forEach(function (e) { if (e.a !== '__SERVICES__') add(e.keys.slice(0, 3).join(', '), e.keys.join(' ') + ' ' + e.a, e); });
    var df = {}, total = 0;
    out.forEach(function (p) {
      p.tf = {}; p.len = p.t.length; total += p.len;
      p.t.forEach(function (w) { p.tf[w] = (p.tf[w] || 0) + 1; });
      Object.keys(p.tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    });
    out.df = df; out.avg = total / Math.max(1, out.length);
    return out;
  }
  function bm25(p, words) {
    var k1 = 1.2, b = 0.75, N = passages.length, s = 0, hits = 0;
    words.forEach(function (w) {
      var f = p.tf[w];
      if (!f) return;
      hits++;
      var n = passages.df[w] || 0;
      s += Math.log(1 + (N - n + 0.5) / (n + 0.5)) * f * (k1 + 1) / (f + k1 * (1 - b + b * p.len / passages.avg));
    });
    return { s: s, hits: hits };
  }
  function searchPage(qt) {
    if (!passages) passages = buildPassages();
    var uniq = qt.filter(function (w, i) { return qt.indexOf(w) === i && w.length > 2; });
    if (!passages.length || !uniq.length) return null;
    var best = null, bestScore = 0, bestHits = 0;
    passages.forEach(function (p) {
      var r = bm25(p, uniq);
      if (r.s > bestScore) { bestScore = r.s; best = p; bestHits = r.hits; }
    });
    // need real overlap, not one common word
    if (!best || bestHits < Math.min(2, uniq.length) || bestScore < 3) return null;
    if (best.kb) return kbReply(best.kb);
    var sentences = best.text.match(/[^.!?]+[.!?]+/g) || [best.text];
    var scored = sentences.map(function (s, i) { var st = toks(s); return { i: i, s: s.trim(), k: uniq.filter(function (w) { return st.indexOf(w) > -1; }).length }; });
    var keep = scored.filter(function (x) { return x.k > 0; }).sort(function (a, b) { return b.k - a.k; }).slice(0, 3).sort(function (a, b) { return a.i - b.i; });
    if (!keep.length) keep = scored.slice(0, 2);
    return { text: (best.title ? '**' + best.title + '**\n' : '') + keep.map(function (x) { return x.s; }).join(' '), acts: [ADVISOR] };
  }

  /* ---- typo tolerance: a word the page doesn't know becomes the nearest one it does ---- */
  var vocab = null, vocabWords = null;
  function buildVocab() {
    var v = {};
    function addText(s) { foldText(s).trim().split(' ').forEach(function (w) { if (w.length > 2 && !/\d/.test(w)) v[w] = (v[w] || 0) + 1; }); }
    Object.keys(STOP).forEach(function (w) { v[w] = (v[w] || 0) + 5; });
    KB.forEach(function (e) { e.keys.forEach(function (k) { addText(k); addText(k); }); addText(e.a); });
    FIELD_SYNONYMS.forEach(function (f) { addText(f[0]); f[1].forEach(addText); });
    Object.keys(CITY_ALIASES).forEach(function (c) { addText(c); CITY_ALIASES[c].forEach(addText); });
    unis().forEach(function (u) { addText(u.name); addText(englishName(u) || ''); addText(u.location); });
    if (!passages) passages = buildPassages();
    passages.forEach(function (p) { addText(p.title + ' ' + p.text); });
    addText('studying working university universities scholarship scholarships ranking ranked compare versus course courses programme programmes fees living teach teaching located ' +
      'phone number contact details email whatsapp reach website office offices address where which options list offer offers top best highest leading famous ' +
      'public private research international foreigners admit legal location city cities directory many number hello thanks between difference better');
    FACETS.forEach(function (f) { f[1].forEach(addText); });
    return v;
  }
  // edit distance counting a swapped pair of letters as one edit; gives up past max
  function editDistance(a, b, max) {
    var prev2 = null, prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var rowMin = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        var d = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) d = Math.min(d, prev2[j - 2] + 1);
        cur[j] = d;
        if (d < rowMin) rowMin = d;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }
  function correct(text) {
    if (!vocab) { vocab = buildVocab(); vocabWords = Object.keys(vocab); }
    return foldText(text).trim().split(' ').map(function (w) {
      if (w.length < 4 || vocab[w] || /\d/.test(w)) return w;
      var max = w.length >= 7 ? 2 : 1, best = w, bd = max + 1, bk = -1;
      vocabWords.forEach(function (c) {
        if (Math.abs(c.length - w.length) > max) return;
        var d = editDistance(w, c, max);
        if (d > max) return;
        // closest first; on a tie, the same first letter, then the same length, then the commoner word
        var k = (c.charAt(0) === w.charAt(0) ? 1000 : 0) + (c.length === w.length ? 500 : 0) + Math.min(vocab[c], 499);
        if (d < bd || (d === bd && k > bk)) { bd = d; bk = k; best = c; }
      });
      return best;
    }).join(' ');
  }
  // shorthand people type in capitals, read before the case is folded away
  function expandRaw(text) {
    return String(text)
      .replace(/\bIT\b/g, ' ICT ')
      .replace(/\b(CS|CSE)\b/g, ' computer science ')
      .replace(/\bAI\b/g, ' artificial intelligence ')
      .replace(/\bPR\b/gi, ' permanent residence ')
      .replace(/\bvs\.?(?=\s)/gi, ' versus ');
  }

  /* ---- follow-ups: what the conversation is about ---- */
  var chatCtx = { uni: null, city: null, field: null };
  function resetChatCtx() { chatCtx = { uni: null, city: null, field: null }; }
  var FACETS = [
    ['fees', ['fee', 'fees', 'tuition', 'cost', 'costs', 'price', 'expensive', 'cheap', 'how much']],
    ['rank', ['ranked', 'ranking', 'rankings', 'rank', 'qs', 'position', 'how good', 'world rank']],
    ['courses', ['course', 'courses', 'programme', 'programmes', 'program', 'programs', 'teach', 'teaches', 'subjects', 'fields', 'offer', 'offers', 'degrees', 'study there']],
    ['where', ['where', 'location', 'located', 'which city', 'address']],
    ['approved', ['approved', 'mswia', 'international', 'foreigners', 'foreign', 'admit', 'legal', 'legally', 'accept international']],
    ['type', ['public', 'private', 'research university', 'type of', 'kind of']]
  ];
  function facetOf(q) { for (var i = 0; i < FACETS.length; i++) if (hasAny(q, FACETS[i][1])) return FACETS[i][0]; return null; }
  function refersBack(q) { return hasAny(q, ['it', 'its', 'this one', 'that one', 'there', 'this university', 'that university', 'the university', 'they', 'their', 'them']); }
  function shortName(u) { return displayName(u); }
  function dirLink(q, label) { return '[' + label + '](./universities.html?q=' + encodeURIComponent(q) + ')'; }

  function uniFacet(u, facet) {
    var name = '**' + shortName(u) + '**', w = qsWorld(u), city = cityOf(u.location);
    var fields = String(u.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var acts = [{ label: 'Open full details', go: 'uni', name: u.name }, { label: 'Evaluate my profile for it', go: 'enquire', name: u.name }];
    var r;
    if (facet === 'rank') r = { text: u.ranked ? name + ' is ' + (w ? '**#' + w + ' in the world** and ' : '') + '**#' + u.rank + ' in Poland** in the QS World University Rankings 2027.' : name + " isn't in the QS World University Rankings 2027. It can still admit international students: every institution in our directory is MSWiA-approved or exempt.", chips: ['What does it teach?', 'Top universities in Poland'] };
    else if (facet === 'fees') r = { text: "Fees at " + name + " aren't listed on this page, so I won't quote a figure. Polish public universities are among the **most affordable in the EU**, and an advisor can confirm the exact fee for your programme.", chips: ['Scholarships and loans', 'Can I work while studying?'], acts: [ADVISOR] };
    else if (facet === 'courses') r = { text: name + ' runs **' + (u.programmes || '?') + ' study programmes**' + (fields.length ? ' across ' + fields.join(', ') : '') + '.\n' + dirLink(u.name, 'See it in the university directory'), chips: ['Is it QS-ranked?', 'Universities in ' + city] };
    else if (facet === 'where') r = { text: name + ' is in **' + u.location + '**.', chips: ['Universities in ' + city, 'What does it teach?'] };
    else if (facet === 'approved') r = { text: 'Yes. ' + name + " can admit international students: it's MSWiA-approved or exempt, which is what a residence permit for studies depends on.", chips: ['How do I get a Polish student visa?', 'What does it teach?'] };
    else r = { text: name + ' is a **' + (u.type || 'higher education institution') + '** in ' + city + '.' + (/research/i.test(u.type || '') ? ' It belongs to the Excellence Initiative: Research University (IDUB) programme.' : ''), chips: ['Is it QS-ranked?', 'What does it teach?'] };
    r.acts = r.acts || acts;
    r.ctx = { uni: u, city: city };
    return r;
  }

  function compareUnis(a, b) {
    function line(u) {
      var w = qsWorld(u);
      return '• **' + shortName(u) + '**: ' + cityOf(u.location) + ', ' + (u.type || 'institution') + '; ' +
        (u.ranked ? (w ? '#' + w + ' in the world, ' : '') + '#' + u.rank + ' in Poland' : 'not QS-ranked') + '; ' + (u.programmes || '?') + ' programmes';
    }
    var fa = String(a.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var both = fa.filter(function (f) { return offers(b, f); });
    return {
      text: 'Side by side:\n' + line(a) + '\n' + line(b) + (both.length ? '\n\nBoth teach ' + both.join(', ') + '.' : '') +
        '\n\nWhich suits you depends on your subject and profile. An advisor can weigh them for you, free.',
      acts: [{ label: 'Open ' + shortName(a), go: 'uni', name: a.name }, { label: 'Open ' + shortName(b), go: 'uni', name: b.name }, ADVISOR],
      chips: ['Top universities in Poland', 'Request a callback'], ctx: { uni: null, city: null }
    };
  }
  function compareCities(list, field, q) {
    list = list.slice(0, 3);
    var rows = list.map(function (c) {
      var all = unis().filter(function (x) { return cityOf(x.location) === c; });
      var pool = field ? all.filter(function (x) { return offers(x, field); }) : all;
      var top = rankedFirst(pool)[0], qs = all.filter(function (x) { return x.ranked; }).length;
      return '• **' + c + '**: ' + pool.length + ' institution' + (pool.length === 1 ? '' : 's') + (field ? ' teaching ' + field : '') + ', ' + qs + ' QS-ranked' +
        (top ? '. Best known: ' + shortName(top) + (qsWorld(top) ? ' (#' + qsWorld(top) + ' world)' : '') : '');
    });
    var money = hasAny(q, ['cost', 'costs', 'rent', 'living', 'cheap', 'cheaper', 'expensive', 'budget']);
    return {
      text: list.join(' vs ') + (field ? ', for ' + field : '') + ':\n' + rows.join('\n') +
        (money ? "\n\nThis page doesn't compare living costs between cities, so I won't guess; an advisor can." : ''),
      acts: [{ label: 'Browse the directory', go: 'directory' }].concat(money ? [ADVISOR] : []),
      chips: list.map(function (c) { return 'Universities in ' + c; }).slice(0, 2).concat(['Request a callback']),
      ctx: { city: list[list.length - 1], field: field, uni: null }
    };
  }

  // what to ask next after a knowledge-base answer, keyed by its first key
  var KB_NEXT = {
    'visa': ['Can I work while studying?', 'What happens after graduation?', 'Do I need IELTS?'],
    'mswia': ['How do I get a Polish student visa?', 'Top universities in Poland'],
    'work': ['Can I stay after graduation?', 'Can my family join me?'],
    'after graduation': ['What is the EU Blue Card?', 'How do I get permanent residence?'],
    'blue card': ['How do I get permanent residence?', 'Can my family join me?'],
    'permanent residence': ['Can my family join me?', 'Top universities in Poland'],
    'family': ['Can my partner work?', 'How do I get permanent residence?'],
    'scholarship': ['Education loans', 'Can I work while studying?'],
    'loan': ['Scholarships', 'Proof of funds for the visa'],
    'scholarships and loans': ['Education loans', 'Can I work while studying?'],
    'cost': ['Scholarships and loans', 'Can I work while studying?'],
    'proof of funds': ['Education loans', 'How do I get a Polish student visa?'],
    'ielts': ['Admission requirements', 'Top universities in Poland'],
    'requirement': ['Do I need IELTS?', 'How do I get a Polish student visa?'],
    'intake': ['Admission requirements', 'Request a callback'],
    'accommodation': ['Help after I arrive', 'Can I work while studying?'],
    'post landing': ['Accommodation', 'Can I work while studying?'],
    'why poland': ['Top universities in Poland', 'Can I work while studying?'],
    'excellence initiative': ['Top universities in Poland', 'PhD in Poland'],
    'phd': ['Research universities', 'Scholarships'],
    'refusal': ['Request a callback', 'How do I get a Polish student visa?'],
    'mba': ['Can I work while studying?', 'Top universities in Poland'],
    'services': ['Request a callback', 'Help after I arrive'],
    'tutee': ['What services do you offer?', 'Request a callback']
  };
  function kbReply(e) {
    return { text: e.a === '__SERVICES__' ? servicesAnswer() : e.a, acts: e.acts, chips: KB_NEXT[e.keys[0]] || null, ctx: { uni: null } };
  }

  /* "universities near Wawel": places people name instead of a city, and the city they're in */
  var NEAR = / (near|nearby|nearest|close to|closest to|close by|next to|walking distance|distance from|around) /;
  var LANDMARKS = [
    ['Kraków', / (wawel\w*|rynek glowny|main market square|sukiennice|cloth hall|kazimierz|nowa huta|wieliczka|salt mine|auschwitz|oswiecim|zakopane|tatras?) /],
    ['Warsaw', / (palace of culture|pkin|lazienki|wilanow|royal castle|old town warsaw|warsaw old town|chopin airport|praga|vistula boulevards?|copernicus science centre|national stadium) /],
    ['Wrocław', / (ostrow tumski|centennial hall|hala stulecia|panorama raclawicka|wroclaw (old town|market square)) /],
    ['Gdańsk', / (long market|dlugi targ|neptune|westerplatte|oliwa|sopot|malbork|motlawa|european solidarity centre|shipyard) /],
    ['Poznań', / (poznan (old town|market square)|stary rynek poznan|malta lake|lake malta|poznan goats) /],
    ['Łódź', / (piotrkowska|manufaktura) /],
    ['Toruń', / (copernicus house|gingerbread museum) /],
    ['Lublin', / (lublin castle|majdanek) /],
    ['Katowice', / (spodek|silesian museum|nikiszowiec) /]
  ];
  /* a start month ("programmes in the January intake"): the page gives no dates, so say what's usual and hand over */
  var MONTH_RE = / (jan\w*|feb\w*|mar(?:ch)?|apr(?:il)?|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|(?:in|from|for|the) (may)) /;
  var MONTH_NAMES = { jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June', jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December' };
  function intakeReply(q) {
    if (/ (work\w*|jobs?|hours) /.test(q)) return null;
    var m = MONTH_RE.exec(q), mon = m && MONTH_NAMES[(m[2] || m[1]).slice(0, 3)], text;
    // "when is the intake?" with no month: the usual starts
    if (!m && / (intakes?|start dates?|which semester) /.test(q)) text = 'The Polish academic year starts in **October** (the winter semester), and that is the main intake for international students. Some universities also have a **February** start (the summer semester) for a smaller set of programmes, mostly master\'s. There\'s no central application system: each university runs its own recruitment to its own deadlines, often months earlier for non-EU students because of the visa.';
    else if (!m || !/ (intakes?|start\w*|begin\w*|commenc\w*|batch|session|semesters?|programmes?|programs?|courses?|admissions?|recruitment) /.test(q)) return null;
    else if (mon === 'September' || mon === 'October') text = 'The Polish academic year starts in **October** (the winter semester), and that is the main intake for international students. Each university runs its own recruitment to its own deadlines, and for non-EU students they are often months earlier, to leave time for the visa.';
    else if (mon === 'January' || mon === 'February' || mon === 'March') text = 'Some Polish universities also have a **February** start (the summer semester), for a smaller set of programmes, mostly master\'s. Most degrees start in **October**. Which programmes open in February changes every year, so I can\'t give you a reliable list here.';
    else text = 'Polish degrees start in **October**, with a smaller **February** intake at some universities. A **' + mon + '** start isn\'t usual, so check with an advisor before you plan around it.';
    return { text: text + '\n\nAn advisor can confirm the current intakes and deadlines for your programme, free.', acts: [ADVISOR], chips: ['Admission requirements', 'Request a callback'], ctx: { uni: null } };
  }

  // Questions this site can't answer reliably (distances and travel times, whether your marks are enough, what can
  // still start next month, the best area to live, a university's exact English score): say so, then hand over.
  var NEEDS_COUNSELLOR = [
    [/\b(how far|distance (from|to|between)|how long (does it|will it|would it|to) (take|get|reach|travel|commute)|commut\w*|by (train|bus|metro|tram|mrt|subway|tube|car)|travel time|minutes? (from|to|away)|km (from|to|away)|close to the city|far from)\b/, null,
      'I can\'t give reliable distances or travel times: they depend on the exact campus and where you\'d live.'],
    [/\b(next|this|coming) (month|week|few weeks)\b|\bstart\w* (soon|immediately|asap|right away)\b|\b(still|currently) (open|accepting)\b/, null,
      'Which courses can still take you that soon depends on each university\'s current deadlines and places, which change all the time.'],
    [/\b\d{2}(\.\d+)? ?(%|percent)|\b(percentage|marks|cgpa|gpa|backlogs?|gap year|study gap|year gap|education gap)\b/, /\b(admission|admit|get in|get into|eligib\w*|accept\w*|apply|qualify|enough|chances?|possible)\b/,
      'Whether your marks are enough depends on the university, the course and the rest of your profile, so I won\'t guess.'],
    [/\b(best|good|safe|safest|cheap\w*|nice) (area|areas|suburbs?|neighbou?rhoods?|localit(y|ies)|places?|part of (the )?(city|town)) (to (live|stay)|for students?)\b|\bwhere (should|can|do) (i|students) (live|stay)\b/, null,
      'The best area to live depends on your campus, budget and lifestyle, and this site doesn\'t compare neighbourhoods.'],
    [/\b(ielts|pte|toefl|duolingo)\b.*\b(scores?|bands?|minimum)\b|\b(scores?|bands?|minimum)\b.*\b(ielts|pte|toefl|duolingo)\b/, null,
      'Each university sets its own minimum English test score, and it varies by course, so I won\'t quote one.'],
    [/\b(distance learning|distance education|online (course|courses|degree|degrees|study|studies|classes|programmes?|programs?)|study online|studying online|remote study)\b/, null,
      'A student visa is for full-time study on campus, and this site does not cover online or distance courses.']
  ];
  // "How do I apply?" (to a university, not for a visa, loan or scholarship): how applying works here, then hand over
  var APPLY_Q = /\b(how (do|can|should|would|will) (i|we|one|students?) apply|how to apply|application process|admission process|applying (to|for) (a |an |the )?(universit\w*|unis?|college\w*|courses?|programm?e?s?|admissions?)|apply (to|for) (a |an |the )?(universit\w*|unis?|college\w*|courses?|programm?e?s?|admissions?))\b/;
  function asksHowToApply(q) { return APPLY_Q.test(q) && !/\b(visa|pass|permit|stamp|loans?|scholarships?|bursar\w*|grants?|jobs?|work)\b/.test(q); }
  function needsCounsellor(q) {
    for (var i = 0; i < NEEDS_COUNSELLOR.length; i++) { var n = NEEDS_COUNSELLOR[i]; if (n[0].test(q) && (!n[1] || n[1].test(q))) return n[2]; }
    return '';
  }
  // "universities near <a place we know>" is answered by its city instead
  function namesLandmark(q) { return /\b(near|nearby|nearest|close to|closest to|next to|around|walking distance)\b/.test(q) && LANDMARKS.some(function (l) { return l.some(function (x) { return x instanceof RegExp && x.test(q); }); }); }

  /* ---- the answer pipeline ---- */
  function route(q, qt, asked) {
    if (/^ (hi|hello|hey|hii|hiya|namaste|good (morning|afternoon|evening)) /.test(q) && qt.length <= 2)
      return { text: "Hello! What would you like to know about studying in Poland? Try asking about visas, top universities, working while you study or bringing your family.", chips: ['Top universities in Poland', 'How do I get a Polish student visa?', 'Can I work while studying?'] };
    if (/ (thanks|thank you|thx|ty) /.test(q) && qt.length <= 3) return { text: "You're welcome! Ask me anything else about studying in Poland." };

    var unsure = !namesLandmark(q) && !namesLandmark(asked) && (needsCounsellor(q) || needsCounsellor(asked));
    if (unsure) return { text: unsure + ' An advisor can check it for you, free: use the [free evaluation form](#contact) or ask me for a callback.', acts: [ADVISOR], chips: ['Request a callback'], ctx: { uni: null } };
    if (asksHowToApply(q)) { var ak = KB.filter(function (e) { return e.keys.indexOf('how to apply') > -1; })[0]; if (ak) return kbReply(ak); }

    var cities = findCities(q), field = findField(q), facet = facetOf(q);
    var compare = hasAny(q, ['versus', 'compare', 'comparison', 'difference', 'better', 'or', 'between']);
    var named = findUnis(q);
    if (named.length >= 2 && compare) return named.at[0] <= named.at[1] ? compareUnis(named[0], named[1]) : compareUnis(named[1], named[0]);
    var u = named[0] || null;
    // "is it ranked?", "what does it teach?": about the university just discussed
    if (!u && chatCtx.uni && facet && refersBack(q) && !cities.length && !field && !hasAny(q, ['living', 'live', 'life', 'rent']))
      u = chatCtx.uni;
    if (u) {
      // "can I study medicine at Jagiellonian?"
      if (field && (!facet || facet === 'courses')) {
        var yes = offers(u, field);
        return { text: yes ? 'Yes. **' + shortName(u) + '** teaches ' + field + ', among ' + (u.programmes || 'its') + ' programmes in all. Whether a specific course runs in English, and when, varies by intake.\n' + dirLink(u.name, 'See it in the university directory')
            : "**" + shortName(u) + "** doesn't list " + field + ' among its fields. ' + dirLink(field, 'Universities that teach ' + field),
          acts: [{ label: 'Open full details', go: 'uni', name: u.name }, ADVISOR], chips: [field + ' in ' + cityOf(u.location), 'Is it QS-ranked?'], ctx: { uni: u, city: cityOf(u.location), field: field } };
      }
      if (facet) return uniFacet(u, facet);
      var card = uniAnswer(u);
      card.chips = ['What does it teach?', 'Universities in ' + cityOf(u.location), 'Fees there?'];
      card.ctx = { uni: u, city: cityOf(u.location) };
      return card;
    }

    if (hasAny(q, ['phone', 'phone number', 'call you', 'contact number', 'email', 'e mail', 'contact', 'contact details', 'whatsapp', 'reach you', 'website', 'your office', 'your offices', 'office address', 'your address', 'where are you']) && !hasAny(q, ['visa', 'university', 'universities']))
      return { text: "You can reach Tutee Connect here:\n📞 +91 73583 64959\n📧 info@tuteeconnect.com\n🌐 www.tuteeconnect.com\n📍 Chennai: 1st Floor, ALA Corner Complex, Virugambakkam - 600092\n📍 Dubai: Tutee Connect LLC FZ, Meydan Grandstand, U.A.E.",
        acts: [{ label: 'WhatsApp us', go: 'whatsapp' }, { label: 'Free evaluation form', go: 'contact' }], chips: ['Request a callback'] };

    var byMonth = intakeReply(q);
    if (byMonth) return byMonth;
    // a landmark is read from the question as typed too: typo fixing may have changed its words
    var spot = NEAR.test(q) && LANDMARKS.filter(function (l) { return l[1].test(q) || l[1].test(asked); })[0];
    if (spot) cities = [spot[0]];
    else if (NEAR.test(q) && !cities.length && !/ (rent|cost|costs|price|fees?|accommodation|housing|living) /.test(q) && hasAny(q, ['university', 'universities', 'uni', 'unis', 'college', 'colleges', 'institution', 'institutions', 'campus', 'study']))
      return { text: 'I can match institutions to a Polish city, or to a well-known place in one (Wawel Castle, the Palace of Culture or Gdańsk\'s Long Market, say), but I didn\'t recognise the place in your question, and I can\'t work out distances. Tell me the city, e.g. *universities in Wrocław*, or ask an advisor.',
        acts: [ADVISOR], chips: ['Universities in Warsaw', 'Universities in Kraków', 'Request a callback'] };

    if (cities.length >= 2) return compareCities(cities, field, q);
    var city = cities[0] || null;
    // "what about Wrocław?" keeps the subject; "and ICT?" keeps the city
    var followUp = /^ (and|what about|how about|what of|in|ok and) /.test(q);
    var carried = false;
    if (city && !field && chatCtx.field && (followUp || qt.length === 1)) { field = chatCtx.field; carried = true; }
    if (field && !city && chatCtx.city && followUp) city = chatCtx.city;

    var aboutUnis = hasAny(q, ['university', 'universities', 'college', 'colleges', 'institution', 'institutions', 'where', 'which', 'study in', 'offer', 'offers', 'options', 'list']);
    var aboutRank = hasAny(q, ['top', 'best', 'ranked', 'ranking', 'rankings', 'rank', 'qs', 'highest', 'leading', 'good universities', 'famous']);

    // a strong knowledge-base hit beats a two-word guess at a subject ("GMAT for MBA")
    var kbBest = null, kbScore = 0;
    KB.forEach(function (e) {
      var s = 0;
      e.keys.forEach(function (k) { if (has(q, k)) s += 2 + foldText(k).trim().split(' ').length; });
      if (s > kbScore) { kbScore = s; kbBest = e; }
    });
    if (city && (spot || aboutUnis || aboutRank || field || qt.length === 1 || followUp)) {
      var inCity = unis().filter(function (x) { return cityOf(x.location) === city && (!field || offers(x, field)); });
      var note = spot ? 'That\'s in **' + city + '**, so here are the institutions there. This goes by city, not travel time; an advisor can help with commutes.\n' : '';
      // a subject carried over from the last question, with nothing here: show the whole city instead
      if (!inCity.length && carried) {
        note += 'None of ' + city + "'s institutions list " + field + '. Here are all of them.\n';
        field = null;
        inCity = unis().filter(function (x) { return cityOf(x.location) === city; });
      }
      if (!inCity.length) return { text: 'I couldn’t find ' + (field ? field + ' at ' : '') + 'institutions in ' + city + ' in our directory.', acts: [{ label: 'Browse the directory', go: 'directory' }, ADVISOR], ctx: { city: city, field: field } };
      var top = rankedFirst(inCity).slice(0, 6);
      var other = city === 'Warsaw' ? 'Kraków' : 'Warsaw';
      return { text: note + '**' + inCity.length + ' institution' + (inCity.length === 1 ? '' : 's') + ' in ' + city + (field ? ' teaching ' + field : '') + '**, best-known first:\n' + top.map(uniLine).join('\n') +
          '\n' + dirLink(field ? city + ' ' + field : city, inCity.length > top.length ? 'See all ' + inCity.length + ' in the directory' : 'Open them in the directory'),
        acts: [{ label: 'Browse the directory', go: 'directory' }],
        chips: (field ? [] : ['ICT in ' + city, 'Engineering in ' + city]).concat(['Compare ' + city + ' and ' + other]).slice(0, 3),
        ctx: { city: city, field: field, uni: null } };
    }
    if (field && (aboutUnis || aboutRank || hasAny(q, ['course', 'courses', 'programme', 'programmes', 'program', 'programs', 'study', 'degree']) || followUp || (qt.length <= 2 && kbScore < 3))) {
      var withField = rankedFirst(unis().filter(function (x) { return offers(x, field); }));
      if (withField.length) return { text: '**' + withField.length + ' institutions teach ' + field + '**. The highest ranked:\n' + withField.slice(0, 6).map(uniLine).join('\n') +
          '\n' + dirLink(field, 'Browse them all in the directory') + '\n\nAvailability of a specific course varies by university and intake.',
        acts: [{ label: 'Browse the directory', go: 'directory' }, ADVISOR],
        chips: field === 'Services' ? ['Scholarships and loans'] : [field + ' in Warsaw', field + ' in Kraków', 'Scholarships and loans'],
        ctx: { field: field, city: null, uni: null } };
    }
    if (aboutRank && (aboutUnis || has(q, 'qs'))) {
      var ranked = rankedFirst(unis().filter(function (x) { return x.ranked; })).slice(0, 10);
      return { text: '**Top Polish universities, QS World University Rankings 2027:**\n' + ranked.map(uniLine).join('\n') + '\n\nAll 20 QS-ranked Polish institutions are in ' + dirLink('', 'our directory').replace('?q=', '') + '.',
        acts: [{ label: 'Browse the directory', go: 'directory' }], chips: ['Which is best for ICT?', 'Compare Warsaw and Kraków', 'Tell me about Jagiellonian University'], ctx: { uni: null } };
    }
    if (hasAny(q, ['how many universities', 'how many institutions', 'number of universities', 'list of universities', 'all universities', 'directory', 'cities'])) {
      var cs = {}; unis().forEach(function (x) { var c = cityOf(x.location); cs[c] = (cs[c] || 0) + 1; });
      var hubs = Object.keys(cs).sort(function (a, b) { return cs[b] - cs[a]; }).slice(0, 6).map(function (c) { return c + ' (' + cs[c] + ')'; }).join(', ');
      return { text: 'Our directory lists **' + unis().length + ' institutions** across **' + Object.keys(cs).length + ' cities** that can legally admit international students: 20 are in the QS World University Rankings 2027 and 10 in the Excellence Initiative: Research University programme.\n\nBiggest hubs: ' + hubs + '.',
        acts: [{ label: 'Browse the directory', go: 'directory' }], chips: ['Top universities in Poland', 'Universities in Warsaw'] };
    }

    // services by name, e.g. "documentation", "post-landing"
    var svc = (window.PL_SERVICES || []).filter(function (s) { return has(q, s.title) || (toks(s.title).length && toks(s.title).every(function (w) { return qt.indexOf(w) > -1; })); })[0];
    if (svc) return { text: '**' + svc.title + '**: ' + svc.tagline + '\n\n' + String(svc.desc).split(/\n{2,}/)[0], acts: [{ label: 'Request this service', go: 'contact' }], chips: ['Request a callback', 'What services do you offer?'] };

    // knowledge base
    if (kbBest && kbScore >= 3) return kbReply(kbBest);

    // anything else the page itself says
    var found = searchPage(qt);
    if (found) return found;

    return { text: "I couldn't find that on this page, and I'd rather not guess. Our advisors can answer it directly, and it's free: use the [free evaluation form](#contact) or ask me for a callback.",
      acts: [{ label: 'Request a callback', go: 'callback' }, { label: 'WhatsApp us', go: 'whatsapp' }] };
  }

  function answer(text) {
    var asked = foldText(text);
    var q = ' ' + correct(expandRaw(text)) + ' ', qt = toks(q);
    var res = route(q, qt, asked);
    if (res.ctx) Object.keys(res.ctx).forEach(function (k) { chatCtx[k] = res.ctx[k]; });
    if (res.chips) res.chips = res.chips.filter(function (c) { return foldText(c) !== asked; }).slice(0, 3);
    return res;
  }

  function enquireAbout(name) {
    shortlist.add(name);
    if ($('#contact [data-destination-input]')) { goToSection('contact'); return; }
    window.location.href = './index.html' + (shortlist.kept() ? '' : '?apply=' + encodeURIComponent(name)) + '#contact';
  }

  function initChat() {
    var panel = $('[data-chat-panel]');
    if (!panel) return;
    var list = $('[data-chat-messages]');
    var form = $('[data-chat-form]');
    var input = $('[data-chat-input]');
    var typing = $('[data-chat-typing]');
    var chipRow = $('[data-chat-chips]');
    var sendBtn = $('[data-chat-send]');
    var waHref = ($('.fab.wa') || {}).href || 'https://wa.me/917358364959';

    var clockFmt = null;   // one formatter, made on first use (making one per message was slow)
    function clockNow() { return (clockFmt || (clockFmt = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }))).format(new Date()); }
    // The conversation is kept for this browser tab (sessionStorage), so a reload or a trip
    // to the directory and back doesn't lose it. The name, phone and email typed for a
    // callback are never kept.
    var STORE = 'tc_pl_chat', log = [], answered = 0;
    function save() {
      try { sessionStorage.setItem(STORE, JSON.stringify({ log: log.slice(-30), n: answered, ctx: { city: chatCtx.city, field: chatCtx.field, uni: chatCtx.uni && chatCtx.uni.name } })); }
      catch (e) { /* storage unavailable */ }
    }
    // answers may carry links: [text](#section) or [text](./universities.html?q=...)
    function chatHtml(s) {
      return mdToHtml(s).replace(/\[([^\]]+)\]\((#[\w-]+|\.\/universities\.html[^\s)]*)\)/g, '<a href="$2" data-chat-link>$1</a>');
    }
    function push(role, content, acts, atTop, keep) {
      var m = document.createElement('div');
      m.className = 'msg ' + (role === 'assistant' ? 'ai' : 'me');
      m.innerHTML = role === 'assistant' ? chatHtml(content) : mdToHtml(content);
      if (!atTop && keep !== false) { log.push({ r: role, c: content, a: acts || null }); save(); }
      if (acts && acts.length) {
        var row = document.createElement('div');
        row.className = 'msg-acts';
        acts.forEach(function (a) {
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = a.label;
          b.addEventListener('click', function () { act(a); });
          row.appendChild(b);
        });
        m.appendChild(row);
      }
      var t = document.createElement('time'); t.textContent = clockNow(); m.appendChild(t);
      if (atTop) list.insertBefore(m, list.firstChild); else list.insertBefore(m, typing);
      list.scrollTop = list.scrollHeight;
    }
    // questions to ask next, under the latest answer only
    function suggest(chips) {
      $$('.chat-next', list).forEach(function (n) { n.remove(); });
      if (!chips || !chips.length) return;
      var row = document.createElement('div');
      row.className = 'chips chat-next';
      chips.forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = c;
        b.addEventListener('click', function () { send(c); });
        row.appendChild(b);
      });
      list.insertBefore(row, typing);
      list.scrollTop = list.scrollHeight;
    }
    function act(a) {
      if (a.go === 'callback') { send(a.label); return; }
      if (a.go === 'whatsapp') { window.open(waHref, '_blank', 'noopener'); return; }
      if (a.go === 'contact') { close(); goToSection('contact'); return; }
      if (a.go === 'directory') { close(); if (!smoothTo('directory')) window.location.href = './universities.html'; return; }
      if (a.go === 'enquire') { close(); enquireAbout(a.name); return; }
      if (a.go === 'uni') {
        var u = unis().filter(function (x) { return x.name === a.name; })[0];
        if (u) openUniDetail(u, { ctaLabel: 'Evaluate my profile for this university', onCta: function () { closeUniDetail(); close(); enquireAbout(u.name); } });
      }
    }
    function setTyping(on) { typing.classList.toggle('hidden', !on); if (on) list.insertBefore(typing, null); list.scrollTop = list.scrollHeight; }
    function open() { document.body.classList.add('chat-open'); setTimeout(function () { if (input && FINE) input.focus(); }, 300); }
    function close() { document.body.classList.remove('chat-open'); }
    function reset() {
      $$('.msg, .chat-next', list).forEach(function (n) { n.remove(); });
      stage = 'idle'; lead = { name: '', phone: '', email: '' };
      log = []; answered = 0; resetChatCtx(); save();
      if (chipRow) chipRow.classList.remove('hidden');
      if (input) input.value = '';
      setTyping(false); syncSendBtn();
      push('assistant', CHAT_WELCOME, null, true);
    }

    /* Lead capture: "Request a callback", "talk to a counsellor" or "call me"
       asks for name, phone and email one at a time, then sends them to
       /api/enquiry like the form does. "cancel" (or a question) leaves it. */
    var stage = 'idle', lead = { name: '', phone: '', email: '' };
    var LEAD_RE = /^(request a call ?back|evaluate my profile|talk to a counsell?or|book a (free )?(consultation|call)|call me( back)?|i want to (talk|speak) to (a|someone|someone from your team|a counsell?or))\b/i;
    var CHAT_EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;
    function later(fn, ms) { setTyping(true); setTimeout(function () { setTyping(false); fn(); }, ms); }
    function submitLead() {
      return fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          subject: 'New Lead from Chatbot!', from_name: 'Tutee AI Counsellor',
          name: lead.name, phone: lead.phone, email: lead.email,
          destination: 'Chatbot General Inquiry', form_location: 'Tutee AI chat', page: enquiryPage()
        })
      }).then(function (r) { return r.json().catch(function () { return { success: false }; }); });
    }
    function startLead() {
      later(function () {
        stage = 'asking_name';
        push('assistant', "Happy to set that up. An expert counsellor reviews your profile personally and calls you within **one working day**.\n\nWhat's your **full name**? (Type **cancel** any time to stop.)", null, false, false);
      }, 500);
    }
    // returns true when the message belonged to the details flow
    function leadStep(text) {
      if (stage !== 'idle' && /^(cancel|stop|no thanks|never ?mind|skip)\b/i.test(text)) {
        stage = 'idle';
        later(function () { push('assistant', "No problem, I've stopped and nothing was sent. What else would you like to know?", null, false, false); }, 400);
        return true;
      }
      if (stage !== 'idle' && /\?$/.test(text)) stage = 'idle';   // a question leaves the flow and gets answered
      if (stage === 'asking_name') {
        if (text.replace(/[^A-Za-zÀ-ɏ]/g, '').length < 2) {
          later(function () { push('assistant', 'Please type your **full name**, or **cancel**.', null, false, false); }, 400);
          return true;
        }
        lead.name = text; stage = 'asking_phone';
        later(function () { push('assistant', 'Thanks ' + text.split(/\s+/)[0] + '! What is the best **phone number** (with country code) to reach you at?', null, false, false); }, 600);
        return true;
      }
      if (stage === 'asking_phone') {
        if (!/^[0-9]{7,15}$/.test(text.replace(/\D/g, ''))) {
          later(function () { push('assistant', "That doesn't look like a valid phone number. Please enter a valid number (e.g., +91 98765 43210), or type **cancel**.", null, false, false); }, 500);
          return true;
        }
        lead.phone = text; stage = 'asking_email';
        later(function () { push('assistant', 'Got it. Lastly, what is your **email address**?', null, false, false); }, 600);
        return true;
      }
      if (stage === 'asking_email') {
        if (!CHAT_EMAIL_RE.test(text)) {
          later(function () { push('assistant', "That doesn't look like a valid email address. Could you double-check it, or type **cancel**?", null, false, false); }, 500);
          return true;
        }
        lead.email = text; stage = 'idle';
        push('assistant', 'Perfect! Sending your details to our counsellors now…', null, false, false);
        setTyping(true);
        submitLead().then(function (res) {
          setTyping(false);
          if (res && res.success) push('assistant', '✅ **Done!** An expert counsellor will call you within one working day.\n\nAnything else I can help with in the meantime?');
          else push('assistant', "Sorry, that didn't go through. Please use the free evaluation form or WhatsApp us.", [{ label: 'Free evaluation form', go: 'contact' }, { label: 'WhatsApp us', go: 'whatsapp' }]);
        }).catch(function () {
          setTyping(false);
          push('assistant', 'Network error while sending. Please try the free evaluation form or WhatsApp us.', [{ label: 'Free evaluation form', go: 'contact' }, { label: 'WhatsApp us', go: 'whatsapp' }]);
        });
        return true;
      }
      if (LEAD_RE.test(text)) { startLead(); return true; }
      return false;
    }

    function send(text) {
      if (!text || !text.trim()) return;
      text = text.trim().slice(0, 400);
      // while the callback details are being asked for, what's typed is personal: shown, never kept
      push('user', text, null, false, stage === 'idle');
      if (input) input.value = '';
      syncSendBtn();
      if (chipRow) chipRow.classList.add('hidden');
      $$('.chat-next', list).forEach(function (n) { n.remove(); });
      if (leadStep(text)) return;
      var res = answer(text);
      answered++;
      var chips = (res.chips || []).slice();
      if (answered % 4 === 0 && chips.indexOf('Request a callback') < 0) chips.push('Request a callback');
      setTyping(true);
      setTimeout(function () { setTyping(false); push('assistant', res.text, res.acts); suggest(chips); save(); }, 450 + Math.min(700, res.text.length));
    }
    function syncSendBtn() { if (sendBtn && input) sendBtn.disabled = !input.value.trim(); }

    $$('[data-chat-open], [data-chat-open-alt]').forEach(function (b) { b.addEventListener('click', open); });
    $$('[data-chat-close]').forEach(function (b) { b.addEventListener('click', close); });
    $$('[data-chat-reset]').forEach(function (b) { b.addEventListener('click', reset); });
    $$('[data-chat-contact]').forEach(function (b) { b.addEventListener('click', function () { close(); goToSection('contact'); }); });
    $$('[data-chat-chip]').forEach(function (c) { c.addEventListener('click', function () { send(c.textContent); }); });
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
    if (input) {
      input.addEventListener('input', syncSendBtn);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
    }
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    // a link in an answer: a section of this page scrolls there; the directory opens normally
    list.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-chat-link]');
      if (!a) return;
      var h = a.getAttribute('href') || '';
      if (h.charAt(0) === '#' && document.getElementById(h.slice(1))) { e.preventDefault(); close(); goToSection(h.slice(1)); }
    });
    push('assistant', CHAT_WELCOME, null, true);
    // bring back this tab's conversation
    try {
      var kept = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (kept && kept.log && kept.log.length) {
        kept.log.forEach(function (m) { push(m.r, m.c, m.a, false, false); });
        log = kept.log; answered = kept.n || 0;
        var kc = kept.ctx || {};
        chatCtx.city = kc.city || null; chatCtx.field = kc.field || null;
        chatCtx.uni = kc.uni ? unis().filter(function (x) { return x.name === kc.uni; })[0] || null : null;
        if (chipRow) chipRow.classList.add('hidden');
      }
    } catch (e) { /* storage unavailable */ }
    window.TC_chatAnswer = answer;   // handy for checking answers from the console
  }

  /* ------------------------------------------------------------------ *
   * 11. University directory page
   * ------------------------------------------------------------------ */
  function initDirectory() {
    var grid = $('[data-uni-grid]');
    if (!grid || !window.PL_UNIVERSITIES) return;

    var all = window.PL_UNIVERSITIES;
    if (Array.isArray(window.TC_pendingUniversities) && window.TC_pendingUniversities.length) {
      all = window.TC_pendingUniversities;          // arrived before the page was ready
      window.TC_pendingUniversities = null;
    }
    /* supabase-data.js calls this when a fresher copy arrives; it re-renders
       through the normal filter path, so the current search survives. */
    window.TC_applyUniversities = function (rows) {
      if (!Array.isArray(rows) || !rows.length) return false;
      all = rows; buildFacets(); applyFilter();
      return true;
    };

    var search = $('[data-uni-search]');
    var clearBtn = $('[data-uni-clear]');
    var nEl = $('[data-uni-count-n]'), nounEl = $('[data-uni-count-noun]'), scopeEl = $('[data-uni-count-scope]');
    var moreWrap = $('[data-uni-more-wrap]'), moreBtn = $('[data-uni-more]');
    var emptyBox = $('[data-uni-empty]'), resultBox = $('[data-uni-results]');
    var modal = $('[data-uni-modal]'), modalBtn = $('[data-uni-modal-submit]'), picked = $('[data-uni-picked]');
    var regionSel = $('[data-region-filter]');
    var mapG = $('[data-umap-cities]');
    var tools = $('[data-u-tools]');
    var sortSel = $('[data-uni-sort]');
    var shownEl = $('[data-uni-shown]');

    var PAGE = 24, shown = PAGE, filtered = all, selected = shortlist.all();
    var typeF = '', regionF = '', cityF = '', sortF = 'rank';

    /* Diacritic-folded search. "ł" does not decompose under NFD (the stroke is
       part of the letter), so it is mapped explicitly: "Lodz" finds "Łódź".
       `alt` carries English names and inflected city forms; searched, never shown. */
    function fold(str) { return String(str).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function haystack(u) {
      if (u.__hay === undefined) u.__hay = fold(u.name + ' ' + u.location + ' ' + u.programs + ' ' + u.type + ' ' + (u.alt || ''));
      return u.__hay;
    }
    var rankLabel = function (u) { return u.ranked ? '#' + u.rank : '—'; };

    function find(name) { for (var k = 0; k < all.length; k++) if (all[k].name === name) return all[k]; return null; }
    function selBtnHtml(on) { return '<span class="tick">' + (on ? '✓' : '') + '</span>' + (on ? 'Selected' : 'Select'); }

    function card(u, i) {
      var on = selected.indexOf(u.name) > -1, en = englishName(u);
      var fields = String(u.programs || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      return '<article class="u-card' + (u.ranked ? ' ranked' : '') + (on ? ' sel' : '') + '" style="--i:' + i + '" data-name="' + esc(u.name) + '" tabindex="0" aria-haspopup="dialog">' +
        '<div class="top"><div class="rank">' + rankLabel(u) + '<small>' + (u.ranked ? 'in Poland' : 'Unranked') + '</small></div>' +
          '<span class="type' + (u.type === 'Research University' ? ' res' : '') + '">' + esc(u.type) + '</span></div>' +
        '<h3>' + esc(u.name) + '</h3>' +
        (en ? '<p class="en">' + esc(en) + '</p>' : '') +
        '<div class="loc"><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>' + esc(u.location) + '</div>' +
        '<div class="tags">' + fields.slice(0, 2).map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') +
          (fields.length > 2 ? '<span class="more">+' + (fields.length - 2) + '</span>' : '') + '</div>' +
        '<div class="foot"><div class="progs"><b>' + esc(u.programmes) + '</b>programmes</div>' +
          '<div class="acts">' +
          '<button type="button" class="sel-btn" data-uni-select aria-pressed="' + on + '" aria-label="Select ' + esc(en || u.name) + '">' + selBtnHtml(on) + '</button></div></div>' +
      '</article>';
    }

    function renderGrid(append) {
      var from = append ? grid.children.length : 0;
      var page = filtered.slice(from, shown);
      var html = page.map(function (u, i) { return card(u, i); }).join('');
      if (append) grid.insertAdjacentHTML('beforeend', html); else grid.innerHTML = html;

      var n = filtered.length;
      if (nEl) nEl.textContent = n;
      if (nounEl) nounEl.textContent = n === 1 ? 'institution' : 'institutions';
      if (scopeEl) scopeEl.textContent = cityF ? 'in ' + cityF : (regionF ? 'in ' + regionF : '');
      emptyBox.classList.toggle('hidden', n !== 0);
      resultBox.classList.toggle('hidden', n === 0);
      moreWrap.classList.toggle('hidden', shown >= n);
      if (shownEl) shownEl.textContent = 'Showing ' + Math.min(shown, n) + ' of ' + n;
      if (moreBtn) moreBtn.textContent = 'Show ' + Math.min(PAGE, Math.max(0, n - shown)) + ' more';
      if (clearBtn) clearBtn.classList.toggle('hidden', !(search && search.value) && !typeF && !regionF && !cityF);
    }

    // the floating tray follows the shortlist by itself (initShortlistTray)
    function paintSelection() {
      var k = selected.length;
      if (modalBtn) modalBtn.textContent = k ? 'Apply to ' + k + ' ' + (k === 1 ? 'institution' : 'institutions') : 'Submit profile';
      if (picked) picked.innerHTML = selected.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
      setDestination(selected.join(', '), modal);
    }

    // Select adds to (or takes off) the shared shortlist; the cards follow it, including
    // changes made in another tab or from the pass's chips on the home page
    function toggle(name) { shortlist.toggle(name); }
    function paintCards() {
      $$('.u-card', grid).forEach(function (c) {
        var on = selected.indexOf(c.getAttribute('data-name')) > -1;
        if (c.classList.contains('sel') === on) return;
        c.classList.toggle('sel', on);
        var b = $('[data-uni-select]', c);
        b.setAttribute('aria-pressed', String(on));
        b.innerHTML = selBtnHtml(on);
      });
    }
    shortlist.onChange(function (list) { selected = list; paintCards(); paintSelection(); });
    function showDetail(name) {
      var u = find(name);
      if (!u) return;
      openUniDetail(u, {
        altLabel: function () { return selected.indexOf(name) > -1 ? 'Remove from shortlist' : 'Add to shortlist'; },
        onAlt: function () { toggle(name); },
        ctaLabel: 'Apply to this university',
        onCta: function () { if (selected.indexOf(name) < 0) toggle(name); closeUniDetail(); goApply(); }
      });
    }
    // the Select button toggles the shortlist; anywhere else on a card opens its details
    grid.addEventListener('click', function (e) {
      var c = e.target.closest('.u-card');
      if (!c) return;
      if (e.target.closest('[data-uni-select]')) toggle(c.getAttribute('data-name'));
      else showDetail(c.getAttribute('data-name'));
    });

    /* Search matches every word, in any order ("engineering krakow" finds
       engineering schools in Kraków), and understands everyday subject names. */
    var SEARCH_SKIP = { in: 1, at: 1, of: 1, the: 1, and: 1, for: 1, w: 1, i: 1, a: 1, to: 1, near: 1, university: 1, universities: 1, study: 1 };
    var SEARCH_SYN = {
      medicine: ['health'], medical: ['health'], mbbs: ['health'], nursing: ['health'], pharmacy: ['health'], dentistry: ['health'],
      computer: ['ict'], computing: ['ict'], software: ['ict'], it: ['ict'], cs: ['ict'], data: ['ict'], informatics: ['ict'],
      mba: ['business'], management: ['business'], finance: ['business'], economics: ['business'], law: ['law'],
      arts: ['arts'], humanities: ['humanities'], psychology: ['social'], sociology: ['social'],
      biology: ['natural'], chemistry: ['natural'], physics: ['natural'], maths: ['natural'], mathematics: ['natural'],
      cracow: ['krakow'], warszawa: ['warsaw'], breslau: ['wroclaw']
    };
    function termsOf(str) {
      return fold(str).split(/\s+/).filter(function (w) { return w && !SEARCH_SKIP[w]; });
    }
    function matches(u, terms) {
      var hay = haystack(u);
      return terms.every(function (t) {
        if (hay.indexOf(t) > -1) return true;
        var alt = SEARCH_SYN[t] || SEARCH_SYN[t.replace(/s$/, '')];
        return !!alt && alt.some(function (a) { return hay.indexOf(a) > -1; });
      });
    }

    function applyFilter() {
      var q = (search ? search.value : '').trim(), terms = termsOf(q);
      filtered = all.filter(function (u) {
        if (typeF === 'ranked' && !u.ranked) return false;
        if (typeF && typeF !== 'ranked' && u.type !== typeF) return false;
        if (regionF && regionOf(u.location) !== regionF) return false;
        if (cityF && cityOf(u.location) !== cityF) return false;
        return !terms.length || matches(u, terms);
      });
      var byName = function (a, b) { return a.name.localeCompare(b.name, 'pl'); };
      if (sortF === 'name') filtered.sort(byName);
      else if (sortF === 'programmes') filtered.sort(function (a, b) { return (parseInt(b.programmes, 10) || 0) - (parseInt(a.programmes, 10) || 0) || byName(a, b); });
      else filtered.sort(function (a, b) { return (a.ranked ? a.rank : 1e4) - (b.ranked ? b.rank : 1e4); });   // stable: unranked keep data order
      shown = PAGE;
      renderGrid(false);
      $$('.city', mapG || document.createElement('g')).forEach(function (g) { g.classList.toggle('sel', g.getAttribute('data-city') === cityF); g.classList.toggle('on', g.getAttribute('data-city') === cityF); });
    }

    function buildFacets() {
      // type counts
      $$('[data-type-count]').forEach(function (el) {
        var t = el.getAttribute('data-type-count');
        el.textContent = all.filter(function (u) { return !t || (t === 'ranked' ? u.ranked : u.type === t); }).length;
      });
      // regions
      if (regionSel) {
        var regions = {};
        all.forEach(function (u) { var r = regionOf(u.location); if (r) regions[r] = (regions[r] || 0) + 1; });
        regionSel.innerHTML = '<option value="">All regions</option>' + Object.keys(regions).sort().map(function (r) {
          return '<option value="' + esc(r) + '"' + (r === regionF ? ' selected' : '') + '>' + esc(r) + ' (' + regions[r] + ')</option>';
        }).join('');
      }
      // map
      if (mapG) {
        var counts = {};
        all.forEach(function (u) { var c = cityOf(u.location); counts[c] = (counts[c] || 0) + 1; });
        mapG.innerHTML = Object.keys(CITY_XY).filter(function (c) { return counts[c]; })
          .sort(function (a, b) { return counts[a] - counts[b]; })
          .map(function (c) {
            var xy = CITY_XY[c], r = (4 + Math.sqrt(counts[c]) * 1.7).toFixed(1);
            var label = counts[c] >= 5 || c === 'Gdynia' ? '' : ' class="small"';
            return '<g class="city" data-city="' + esc(c) + '" tabindex="0" role="button" aria-label="' + esc(c) + ': ' + counts[c] + ' institutions">' +
              '<title>' + esc(c) + ' · ' + counts[c] + '</title>' +
              '<circle class="halo" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + r + '"/>' +
              '<circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + r + '" style="opacity:.85"/>' +
              (counts[c] >= 6 ? '<text ' + labelAt(c, xy, r) + label + '>' + esc(c) + ' · ' + counts[c] + '</text>' : '') +
            '</g>';
          }).join('');
      }
    }

    // scroll so the first result sits just under the sticky toolbar
    function toResults() {
      var top = resultBox.getBoundingClientRect().top + window.pageYOffset - (tools ? tools.offsetHeight : 0) - 150;
      window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
    }
    function setCity(c) {
      cityF = (cityF === c) ? '' : c;
      if (cityF) { regionF = ''; if (regionSel) regionSel.value = ''; }
      applyFilter();
      if (cityF) toResults();
    }
    if (mapG) {
      mapG.addEventListener('click', function (e) { var g = e.target.closest('.city'); if (g) setCity(g.getAttribute('data-city')); });
      mapG.addEventListener('keydown', function (e) { var g = e.target.closest('.city'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setCity(g.getAttribute('data-city')); } });
    }

    $$('[data-type-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        typeF = b.getAttribute('data-type-filter');
        $$('[data-type-filter]').forEach(function (x) { x.classList.toggle('on', x === b); });
        applyFilter();
      });
    });
    if (regionSel) regionSel.addEventListener('change', function () { regionF = regionSel.value; cityF = ''; applyFilter(); });
    if (sortSel) sortSel.addEventListener('change', function () { sortF = sortSel.value; applyFilter(); });
    $$('[data-jump-directory]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); smoothTo('directory'); }); });

    var debounce = null;
    if (search) search.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(applyFilter, 120); });
    var showBtn = $('[data-uni-show-results]');
    if (showBtn) showBtn.addEventListener('click', function () { applyFilter(); toResults(); });
    if (search) search.addEventListener('keydown', function (e) { if (e.key === 'Enter') { applyFilter(); toResults(); } });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (search) search.value = '';
      typeF = ''; regionF = ''; cityF = '';
      if (regionSel) regionSel.value = '';
      sortF = 'rank'; if (sortSel) sortSel.value = 'rank';
      $$('[data-type-filter]').forEach(function (x) { x.classList.toggle('on', !x.getAttribute('data-type-filter')); });
      applyFilter();
    });
    moreBtn.addEventListener('click', function () { shown += PAGE; renderGrid(true); });

    // Applying happens on the free counselling form on the home page, pre-filled with the shortlist.
    // The shortlist is in storage already; only when storage is blocked does it ride in ?apply=.
    function goApply() {
      var list = selected.join(', ');
      window.location.href = './index.html' + (shortlist.kept() || !list ? '' : '?apply=' + encodeURIComponent(list)) + '#contact';
    }
    var proceed = $('[data-uni-proceed]');
    if (proceed) proceed.addEventListener('click', goApply);
    // keyboard: a focused card opens its details on Enter / Space
    grid.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('u-card')) {
        e.preventDefault();
        showDetail(e.target.getAttribute('data-name'));
      }
    });

    if (tools) addScene(function () { tools.classList.toggle('stuck', tools.getBoundingClientRect().top <= (parseFloat(getComputedStyle(tools).top) || 0) + 1); });

    buildFacets();
    // arriving from the home page search: ?q=engineering
    var startQ = '';
    try { startQ = (new URLSearchParams(location.search).get('q') || '').slice(0, 80); } catch (e) { /* old browser */ }
    if (startQ && search) search.value = startQ;
    applyFilter();
    paintSelection();
    if (startQ) setTimeout(toResults, 350);
  }

  /* ------------------------------------------------------------------ *
   * 11a. Shortlist tray: the floating notice of what's shortlisted. The directory's
   *      reads "3 Institutions selected" beside its Continue button; the home page's
   *      reads "3 Shortlisted · Review & send" and leads to the pass (hidden while the
   *      pass is on screen). Every add pops it, flips the count, sends a ring out and
   *      reads "Added: <university>" for a moment; a remove only settles the count.
   *      Until the visitor first clicks it, it glows now and then.
   * ------------------------------------------------------------------ */
  function initShortlistTray() {
    var tray = $('[data-sl-tray]');
    if (!tray) return;
    var count = $('[data-sl-tray-count]', tray), label = $('[data-sl-tray-label]', tray);
    var one = tray.getAttribute('data-sl-one') || '', many = tray.getAttribute('data-sl-many') || one;
    // the count is drawn in its own circle; the label repeats it for screen readers
    var words = function (n) { return '<span class="sr-only">' + n + ' </span>' + esc(n === 1 ? one : many); };
    var replay = function (el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
    var last = -1, labelT = null;
    try { if (sessionStorage.getItem('tcPlTraySeen')) tray.classList.add('is-seen'); } catch (e) { /* storage blocked */ }
    tray.addEventListener('click', function () {
      tray.classList.add('is-seen');
      try { sessionStorage.setItem('tcPlTraySeen', '1'); } catch (e) { /* storage blocked */ }
    });
    function paint(list, info) {
      var n = list.length;
      tray.classList.toggle('show', n > 0);
      // lifts the chat buttons clear of it (the home page's tray is shorter on phones)
      document.body.classList.toggle(tray.classList.contains('sl-tray') ? 'sl-tray-open' : 'tray-open', n > 0);
      count.textContent = n;
      clearTimeout(labelT);
      // the label says what just happened, then goes back to the count's words
      var flash = info.added && last > -1 ? 'Added: ' + uniLabel(info.added) : info.full ? 'Shortlist full: remove one to add another' : '';
      label.innerHTML = flash ? esc(flash) : words(n);
      if (flash) labelT = setTimeout(function () { label.innerHTML = words(shortlist.all().length); }, 2500);
      if (!REDUCED && info.added && last > -1) { replay(tray, 'is-bump'); replay(count, 'is-flip'); }
      else if (!REDUCED && n < last && n > 0) replay(count, 'is-settle');
      last = n;
    }
    shortlist.onChange(paint);
    // painted a frame after load, so a shortlist kept from earlier slides in
    frame(function () { if (last < 0) paint(shortlist.all(), {}); });
  }

  /* ------------------------------------------------------------------ *
   * 11b. Live news bar between Universities and Funding: Polish headlines from
   *      /api/news (netlify/functions/news.mjs) as plain text, each with one of the
   *      page's own photos. The page's own facts stand in until they arrive, and
   *      stay when they can't (a local preview has no functions).
   * ------------------------------------------------------------------ */
  var NEWS_FALLBACK = [
    ['Twenty Polish institutions feature in the QS World University Rankings 2027', 'why-degrees'],
    ['Full-time students at approved or exempt universities need no work permit and face no hour limit', 'why-work'],
    ['Graduates can stay on for nine months to find work or start a business, with no sponsor required', 'poland-city'],
    ['227 approved institutions in 64 cities can admit international students', 'students-campus'],
    ['Polish doctoral schools charge no tuition and award a scholarship to every full-time doctoral candidate', 'why-research'],
    ['A national visa to arrive, then a residence permit for studies: your first permit runs 15 months', 'unis/uw'],
    ['Partners and children under 18 can join you after two years on consecutive permits', 'family'],
    ['EU long-term residence after five years, with each year of study counting as half', 'team-working']
  ];
  function initNewsTicker() {
    var root = $('[data-news]');
    if (!root) return;
    var track = $('[data-news-track]', root), label = $('[data-news-label]', root);
    function ago(iso) {
      var h = (Date.now() - Date.parse(iso)) / 36e5;
      if (!(h >= 0)) return '';
      if (h < 1) return 'just now';
      if (h < 24) return Math.round(h) + 'h ago';
      var d = Math.round(h / 24);
      return d === 1 ? 'yesterday' : d + ' days ago';
    }
    function item(n) {
      return '<span class="news-item"><img src="' + esc(n.img) + '" alt="" width="26" height="26" loading="lazy" decoding="async">' +
        '<b>' + esc(n.title) + '</b><small>' + esc([n.source, n.date ? ago(n.date) : ''].filter(Boolean).join(' · ')) + '</small></span>';
    }
    function paint(items, live) {
      if (!items.length) return;
      var row = items.map(item).join('');
      // two copies side by side; the track slides by one copy and loops seamlessly
      track.innerHTML = '<div class="news-set">' + row + '</div><div class="news-set" aria-hidden="true">' + row + '</div>';
      root.classList.toggle('is-live', !!live);
      label.textContent = live ? 'Live · Poland news' : 'Poland updates';
      frame(function () {
        var w = track.firstChild.getBoundingClientRect().width;
        track.style.setProperty('--news-dur', Math.max(30, w / 55).toFixed(1) + 's');   // ~55px a second
      });
    }
    paint(NEWS_FALLBACK.map(function (f) { return { title: f[0], source: 'Tutee Connect', img: './assets/img/photos/' + f[1] + '.webp' }; }), false);

    var ctrl = window.AbortController ? new AbortController() : null;
    var stop = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    fetch('/api/news', { signal: ctrl ? ctrl.signal : undefined, headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        clearTimeout(stop);
        // only plain headlines with one of this site's own photos are shown
        var items = j && Array.isArray(j.items) ? j.items.filter(function (n) {
          return n && typeof n.title === 'string' && n.title && /^\.\/assets\/img\/photos\/[\w-]+(\/[\w-]+)?\.webp$/.test(n.img || '');
        }) : [];
        if (items.length >= 3) paint(items, true);
      })
      .catch(function () { clearTimeout(stop); });

    // only rolls while it is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { root.classList.toggle('is-paused', !es[0].isIntersecting); }).observe($('.news-in', root));
    }
  }

  /* ------------------------------------------------------------------ *
   * 12. Footer sign-off: the letters near the cursor glow red
   * ------------------------------------------------------------------ */
  function initGlowWord() {
    $$('[data-glow-word]').forEach(function (el) {
      function at(e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', (e.clientX - r.left).toFixed(0) + 'px');
        el.style.setProperty('--gy', (e.clientY - r.top).toFixed(0) + 'px');
        el.style.setProperty('--gr', Math.max(110, r.height * 1.15).toFixed(0) + 'px');
      }
      el.addEventListener('pointerenter', function (e) { at(e); el.classList.add('glow'); });
      el.addEventListener('pointerdown', function (e) { at(e); el.classList.add('glow'); });
      el.addEventListener('pointermove', at);
      el.addEventListener('pointerleave', function () { el.classList.remove('glow'); });
    });
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  // The first screen sets up at once; everything below it sets up one piece at a time just
  // after, each in its own short task, so the first paint and the first tap never wait for
  // the whole page (and one failing piece can't stop the rest).
  initCurtain();
  initHeader();
  initMobileMenu();
  initScrollLinks();
  initHero();
  // the chat builds its answer index on start-up, which could land in the middle of someone's
  // scrolling: it sets up only when someone reaches for it (a press, hover or focus on a chat button)
  function startChatLater() {
    var started = false, start = function (e) {
      if (started || !(e.target.closest && e.target.closest('[data-chat-open], [data-chat-open-alt]'))) return;
      started = true; initChat();
    };
    ['pointerover', 'pointerdown', 'focusin', 'click'].forEach(function (t) { document.addEventListener(t, start, true); });
  }
  var queue = [
    initReveal, initHScroll, initRail, initMarquees, function () { initServices(window.PL_SERVICES || []); }, initSkyline, initDirectory, initNewsTicker,
    initStack, initSteps, initBento, initParallax, initClipGrow, initFaq, initForms, initShortlistTray, initGlowWord,
    initButtons, initFlagCursor, initIdleSections, initFabTuck, startChatLater, initSceneLoop
  ];
  (function next() {
    var fn = queue.shift();
    if (!fn) return;
    try { fn(); } catch (err) { setTimeout(function () { throw err; }); }
    if (queue.length) setTimeout(next, 0);
  })();

  // Deep links such as /index.html#contact
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    setTimeout(function () { smoothTo(id); }, 700);
  }
})();
