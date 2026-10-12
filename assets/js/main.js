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
    // Phones get one testimonial row instead of two: same stories, half the height.
    var rows = $$('.voice-row');
    if (isMobile() && rows.length > 1) {
      var first = $('.marquee-group', rows[0]);
      rows.slice(1).forEach(function (r) {
        $$('.voice', r).forEach(function (v) { first.appendChild(v); });
        r.parentNode.removeChild(r);
      });
    }
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
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        g.addColorStop(0, 'rgba(255, 220, 150,' + Math.min(1, glow) + ')');
        g.addColorStop(.4, 'rgba(244, 161, 58,' + (glow * .45) + ')');
        g.addColorStop(1, 'rgba(244, 161, 58, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.fill();
      }
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

  /* Why Poland: vertical scroll drives a horizontal track. A scrubber and a skip
     button let the reader jump through or past it instead of being held in it. */
  var HSCROLL_SPEED = 1.6;   // horizontal px travelled per px of vertical scroll
  function initHScroll() {
    var pin = $('[data-hscroll]');
    var track = $('[data-hscroll-track]');
    if (!pin || !track) return;
    var nav = $('[data-hscroll-nav]');
    var scrub = $('[data-hscroll-scrub]');
    var idxEl = $('[data-hscroll-index]');
    var cards = $$('.why-card', track);
    var dist = 0, enabled = false, p = 0;
    snapDots(track, Array.prototype.slice.call(track.children));

    function measure() {
      enabled = !REDUCED && !isMobile();
      if (!enabled) { pin.style.height = ''; track.style.transform = ''; return; }
      track.style.transform = 'translate3d(0,0,0)';
      var last = track.lastElementChild.getBoundingClientRect();
      dist = Math.max(0, last.right - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
      pin.style.height = (window.innerHeight + dist / HSCROLL_SPEED) + 'px';
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // where on the page a given progress (0..1) sits
    function yFor(q) { return pin.getBoundingClientRect().top + window.pageYOffset + clamp(q, 0, 1) * (pin.offsetHeight - window.innerHeight); }
    function goTo(q, smooth) { window.scrollTo({ top: yFor(q), behavior: smooth && !REDUCED ? 'smooth' : 'auto' }); }
    var cardQ = function (i) { return cards.length > 1 ? i / (cards.length - 1) : 0; };

    if (scrub) {
      // one tick per card, each a jump target
      cards.forEach(function (c, i) {
        var t = document.createElement('button');
        t.type = 'button'; t.className = 'tick'; t.style.left = (cardQ(i) * 100) + '%';
        t.setAttribute('aria-label', 'Card ' + (i + 1) + ': ' + ($('h3', c) || c).textContent);
        t.addEventListener('click', function (e) { e.stopPropagation(); goTo(cardQ(i), true); });
        scrub.appendChild(t);
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
      var stop = function () { dragging = false; scrub.classList.remove('drag'); };
      scrub.addEventListener('pointerup', stop);
      scrub.addEventListener('pointercancel', stop);
      scrub.addEventListener('keydown', function (e) {
        var n = Math.round(p * (cards.length - 1));
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

    addScene(function () {
      if (!enabled) return;
      var r = pin.getBoundingClientRect();
      p = clamp(-r.top / Math.max(1, pin.offsetHeight - window.innerHeight), 0, 1);
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (nav) nav.style.setProperty('--wp', p.toFixed(4));
      var n = Math.min(cards.length, Math.round(p * (cards.length - 1)) + 1);
      if (idxEl) idxEl.textContent = ('0' + n).slice(-2);
      if (scrub) scrub.setAttribute('aria-valuenow', String(n));
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

  /* Contact: the dark panel grows to full width as it arrives. */
  function initClipGrow() {
    var el = $('[data-clip-grow]');
    if (!el || REDUCED) return;
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
        moreBtn.hidden = String(s.desc || '').split(/\n{2,}/).length < 2;
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
   * 7. Home universities: league table linked to the map
   * ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ *
   * 7a. University details pop-up (home league table + directory cards)
   * ------------------------------------------------------------------ */
  /* QS World University Rankings 2027 (published 18 June 2026): each ranked Polish
     institution's WORLD position, by its Polish name. The ank field in the data is
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
    var land = $('.pl-map .land');
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

  function mapCity(name, xy, extra) {
    return '<g class="city" data-city="' + esc(name) + '"' + (extra || '') + '>' +
      '<circle class="halo" cx="' + xy[0] + '" cy="' + xy[1] + '" r="7"/>' +
      '<circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="6"/>' +
      '<text ' + labelAt(name, xy, 6) + '>' + esc(name) + '</text></g>';
  }

  function initLeague() {
    var list = $('[data-league]');
    if (!list || !window.PL_UNIVERSITIES) return;
    var unis = window.PL_UNIVERSITIES.filter(function (u) { return u.ranked; })
      .sort(function (a, b) { return a.rank - b.rank; }).slice(0, 12);
    var cityG = $('[data-map-cities]');
    var count = function (u) { return parseInt(u.programmes, 10) || 0; };
    var max = Math.max.apply(null, unis.map(count).concat(1));
    var english = function (u) { var e = String(u.alt || '').split(',')[0].trim(); return e && e !== u.name ? e : ''; };

    list.innerHTML = unis.map(function (u, i) {
      var en = english(u);
      return '<li data-i="' + i + '"><button type="button" class="l-row" aria-label="' + esc(u.name) + ', ' + esc(u.location) + ', rank ' + u.rank + ' in Poland, ' + esc(u.programmes) + ' programmes">' +
        '<span class="l-rank"><small>#</small>' + u.rank + '</span>' +
        '<span class="l-name"><b>' + esc(u.name) + '</b><span><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>' + esc(cityOf(u.location)) + (en ? '<em class="l-en"> · ' + esc(en) + '</em>' : '') + '</span></span>' +
        '<span class="l-prog"><b>' + esc(u.programmes) + '</b><span class="l-bar"><i style="--w:' + (count(u) / max * 100).toFixed(1) + '%"></i></span></span>' +
      '</button></li>';
    }).join('');
    var rows = $$('li', list);

    var cities = [];
    unis.forEach(function (u) { var c = cityOf(u.location); if (cities.indexOf(c) < 0 && CITY_XY[c]) cities.push(c); });
    if (cityG) cityG.innerHTML = cities.map(function (c) { return mapCity(c, CITY_XY[c]); }).join('');

    var active = -1, hovering = false, inView = false;
    function set(i) {
      active = (i + unis.length) % unis.length;
      rows.forEach(function (r, j) { r.classList.toggle('on', j === active); });
      var city = cityOf(unis[active].location);
      $$('.city', cityG || document.createElement('g')).forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-city') === city); });
    }
    rows.forEach(function (r, i) {
      var b = $('.l-row', r);
      r.addEventListener('mouseenter', function () { hovering = true; set(i); });
      r.addEventListener('mouseleave', function () { hovering = false; });
      b.addEventListener('focus', function () { set(i); });
      b.addEventListener('click', function () {
        set(i);
        openUniDetail(unis[i], {
          ctaLabel: 'Evaluate my profile for this university',
          onCta: function () { closeUniDetail(); setDestination(unis[i].name); setTimeout(function () { smoothTo('contact'); }, 60); }
        });
      });
    });
    if (cityG) cityG.addEventListener('click', function (e) {
      var g = e.target.closest('.city'); if (!g) return;
      var c = g.getAttribute('data-city');
      for (var k = 1; k <= unis.length; k++) {
        var j = (active + k) % unis.length;
        if (cityOf(unis[j].location) === c) { set(j); break; }
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.3 }).observe(list);
    } else inView = true;
    if (!REDUCED) setInterval(function () { if (inView && !hovering && !document.hidden) set(active + 1); }, 3200);
    set(0);
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
    [['name', 'input[name="name"]'], ['email', 'input[name="email"]'], ['phone', 'input[name="phone_number"]']].forEach(function (p) {
      var input = $(p[1], form);
      if (!input) return;
      var box = input.closest('.field');
      var msg = document.createElement('p');
      msg.className = 'field-msg';
      msg.id = (input.id || p[0] + Math.random().toString(36).slice(2, 7)) + '-msg';
      msg.setAttribute('aria-live', 'polite');
      box.appendChild(msg);
      var mark = document.createElement('span');
      mark.className = 'vmark';
      mark.setAttribute('aria-hidden', 'true');
      (input.parentNode).appendChild(mark);
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

  function initForms() {
    $$('form[data-lead-form]').forEach(function (form) {
      enhanceValidation(form);

      // Boarding-pass style passenger name on the profile pass: SURNAME / GIVEN NAMES
      var ticket = form.closest('.ticket'), pax = ticket && $('[data-pax]', ticket), nameIn = $('input[name="name"]', form);
      if (pax && nameIn) {
        var paintPax = function () {
          var parts = nameIn.value.trim().split(/\s+/).filter(Boolean);
          var was = pax.classList.contains('pax-empty');
          if (!parts.length) { pax.textContent = 'Your name appears here'; pax.classList.add('pax-empty'); return; }
          var txt = parts.length > 1 ? parts[parts.length - 1] + ' / ' + parts.slice(0, -1).join(' ') : parts[0];
          pax.textContent = txt.toLocaleUpperCase();
          pax.classList.remove('pax-empty');
          if (was) { pax.classList.remove('pop'); void pax.offsetWidth; pax.classList.add('pop'); }
        };
        nameIn.addEventListener('input', paintPax);
        form.addEventListener('reset', function () { setTimeout(paintPax, 0); });
      }
      var btn = $('[data-submit-btn]', form);
      var okBox = $('[data-form-success]', form);
      var errBox = $('[data-form-error]', form);

      function status(state, msg) {
        if (okBox) okBox.classList.toggle('hidden', state !== 'success');
        if (errBox) {
          errBox.classList.toggle('hidden', state !== 'error');
          if (state === 'error' && msg) ($('[data-form-error-text]', errBox) || errBox).textContent = msg;
        }
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        status('idle');
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });

        // each field shows its own message; nothing is sent until all three pass
        if (form.__validate && !form.__validate()) return;
        data.name = String(data.name || '').trim();
        data.email = String(data.email || '').trim();
        data.phone = (data.country_code || '') + ' ' + (form.__phoneDigits ? form.__phoneDigits() : data.phone_number || '');

        delete data.country_code; delete data.phone_number; delete data.access_key;
        data.page = enquiryPage();

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
              status('success');
              var dest = $('[data-destination-input]', form), keep = dest ? dest.value : '';
              form.reset();
              if (form.__resetValidation) form.__resetValidation();
              if (dest) dest.value = keep;
              setTimeout(function () { status('idle'); }, 6000);
            } else {
              status('error', (res && res.message) || 'Something went wrong. Please try again.');
            }
          })
          .catch(function () { status('error', 'Network error. Please check your connection and try again.'); })
          .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
      });
    });

    // Universities picked on the directory page pre-fill the enquiry. They arrive in
    // storage, or in ?apply= when storage is blocked (private windows, strict settings).
    var picked = '';
    try {
      picked = localStorage.getItem('selectedUniversity') || '';
      if (picked) localStorage.removeItem('selectedUniversity');
    } catch (err) { /* storage unavailable */ }
    try {
      var params = new URLSearchParams(location.search);
      if (!picked && params.get('apply')) picked = params.get('apply').slice(0, 600);
      if (params.has('apply')) history.replaceState(null, '', location.pathname + location.hash);
    } catch (err) { /* old browser */ }
    if (picked) setDestination(picked);
  }

  function setDestination(v, root) {
    var val = v || 'General Poland Inquiry';
    $$('[data-destination-input]', root).forEach(function (i) { i.value = val; });
    $$('[data-destination-label]', root).forEach(function (l) { l.textContent = val; });
  }

  /* ------------------------------------------------------------------ *
   * 10. Tutee AI: answers from this page's own content. No server, no personal
   *     data: live university data, a knowledge base written from the page, then a
   *     search of the page text; only what the page doesn't cover goes to an advisor.
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
    { keys: ['tutee', 'tutee connect', 'who are you', 'about you', 'success rate', 'why tutee', 'experience', 'track record'],
      a: "Tutee Connect are Poland education experts with a **99% Polish visa success rate**, **200+** Polish university tie-ups and **5,000+** students guided. We scrutinise every profile from the view of Polish consular officers and choose the right pathway. Offices in Chennai and Dubai." },
    { keys: ['services', 'your services', 'what do you do', 'what do you offer'],
      a: '__SERVICES__' },
    { keys: ['evaluate', 'evaluation', 'evaluate my profile', 'profile', 'counselling', 'counseling', 'consultation', 'book', 'appointment', 'talk to', 'advisor', 'adviser', 'counsellor', 'counselor', 'speak to'],
      a: "The **free profile evaluation** is right on this page: fill in the Profile Pass form (name, phone and email) and an expert counsellor builds your specific route map to study in Poland, at no cost.", acts: [{ label: 'Open the free evaluation form', go: 'contact' }, { label: 'WhatsApp us', go: 'whatsapp' }] },
    { keys: ['refusal', 'refused', 'rejected', 'rejection', 'previous refusal', 'visa refusal', 'visa refused', 'visa rejected', 'denied', 'visa reject'],
      a: "A Polish study visa is decided largely on the file, so a **complete and internally consistent application** is the most effective way to avoid an unnecessary refusal. We've turned around profiles with a previous refusal, and an advisor can review yours.", acts: [ADVISOR] },
    { keys: ['mba', 'masters', "master's", 'master', 'postgraduate', 'postgrad', 'bachelor', "bachelor's", 'undergraduate', 'degree'],
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
  function uniTitle(u) { var en = englishName(u); return en ? '**' + en + '** (' + u.name + ')' : '**' + u.name + '**'; }
  function rankedFirst(list) {
    return list.slice().sort(function (a, b) {
      return (a.ranked ? a.rank : 1e4) - (b.ranked ? b.rank : 1e4) || (parseInt(b.programmes, 10) || 0) - (parseInt(a.programmes, 10) || 0);
    });
  }
  function uniLine(u, i) {
    var w = qsWorld(u);
    return (i + 1) + '. ' + (englishName(u) || u.name) + ' (' + cityOf(u.location) + ')' + (w ? ': #' + w + ' world' : '');
  }

  var uniIndex = null;
  function buildUniIndex() {
    var cityWords = {};
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
  function findUni(q) {
    if (!uniIndex) uniIndex = buildUniIndex();
    var best = null, bestScore = 0;
    uniIndex.forEach(function (e) {
      var s = 0;
      e.phrases.forEach(function (p) { if (q.indexOf(' ' + p + ' ') > -1) s = Math.max(s, 100 + p.length); });
      e.acr.forEach(function (a) { if (a.length >= 2 && q.indexOf(' ' + a + ' ') > -1 && !STOP[a]) s = Math.max(s, 60); });
      e.distinct.forEach(function (w) { if (q.indexOf(' ' + w + ' ') > -1) s = Math.max(s, 20 + w.length); });
      if (s && e.u.ranked) s += (21 - e.u.rank) / 100;   // tie-break toward the better-known institution
      if (s > bestScore) { bestScore = s; best = e.u; }
    });
    return best;
  }
  function findCity(q) {
    var cities = {};
    unis().forEach(function (u) { cities[cityOf(u.location)] = 1; });
    var found = null;
    Object.keys(cities).forEach(function (c) {
      var al = (CITY_ALIASES[c] || []).concat([foldText(c).trim()]);
      if (al.some(function (a) { return a && q.indexOf(' ' + a + ' ') > -1; })) found = c;
    });
    return found;
  }
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

  /* ---- page passages: anything else the page says ---- */
  var passages = null;
  function buildPassages() {
    var out = [];
    function add(title, text) {
      text = String(text || '').replace(/\s+/g, ' ').trim();
      if (text.length > 40) out.push({ title: String(title || '').replace(/\s+/g, ' ').trim(), text: text, t: toks(title + ' ' + title + ' ' + text) });
    }
    $$('.acc-item').forEach(function (i) { add(($('.acc-q', i) || i).textContent.replace(/^\s*\d+/, ''), ($('.acc-a', i) || i).textContent); });
    $$('.why-card').forEach(function (c) { add(($('h3', c) || c).textContent, ($('p', c) || c).textContent); });
    $$('.stack-card').forEach(function (c) { add(($('h3', c) || c).textContent, ($('.copy', c) || c).textContent); });
    $$('.stair').forEach(function (c) { add(($('h3', c) || c).textContent, ($('p', c) || c).textContent); });
    $$('.fam-line li').forEach(function (c) { add('Family migration: ' + ($('b', c) || c).textContent, c.textContent); });
    (window.PL_SERVICES || []).forEach(function (s) { add(s.title, s.tagline + '. ' + s.desc); });
    $$('.lede, .dir-note').forEach(function (l) { add('', l.textContent); });
    var df = {};
    out.forEach(function (p) { var seen = {}; p.t.forEach(function (w) { if (!seen[w]) { seen[w] = 1; df[w] = (df[w] || 0) + 1; } }); });
    out.forEach(function (p) { p.df = df; p.n = out.length; });
    return out;
  }
  function searchPage(qt) {
    if (!passages) passages = buildPassages();
    if (!passages.length || !qt.length) return null;
    var uniq = qt.filter(function (w, i) { return qt.indexOf(w) === i && w.length > 2; });
    var best = null, bestScore = 0, bestHits = 0;
    passages.forEach(function (p) {
      var s = 0, hits = 0;
      uniq.forEach(function (w) {
        var tf = p.t.filter(function (x) { return x === w; }).length;
        if (tf) { hits++; s += Math.log(1 + p.n / (p.df[w] || 1)) * (1 + Math.min(tf, 3) * .2); }
      });
      if (s > bestScore) { bestScore = s; best = p; bestHits = hits; }
    });
    // need real overlap, not one common word
    if (!best || bestHits < Math.min(2, uniq.length) || bestScore < 2.2) return null;
    var sentences = best.text.match(/[^.!?]+[.!?]+/g) || [best.text];
    var scored = sentences.map(function (s, i) { var st = toks(s); return { i: i, s: s.trim(), k: uniq.filter(function (w) { return st.indexOf(w) > -1; }).length }; });
    var keep = scored.filter(function (x) { return x.k > 0; }).sort(function (a, b) { return b.k - a.k; }).slice(0, 3).sort(function (a, b) { return a.i - b.i; });
    if (!keep.length) keep = scored.slice(0, 2);
    return { text: (best.title ? '**' + best.title + '**\n' : '') + keep.map(function (x) { return x.s; }).join(' '), acts: [ADVISOR] };
  }

  /* ---- the answer pipeline ---- */
  function answer(text) {
    var q = foldText(text), qt = toks(text);

    if (/^ (hi|hello|hey|hii|hiya|namaste|good (morning|afternoon|evening)) /.test(q) && qt.length <= 2)
      return { text: "Hello! What would you like to know about studying in Poland? Try asking about visas, top universities, working while you study or bringing your family." };
    if (/ (thanks|thank you|thx|ty) /.test(q) && qt.length <= 3) return { text: "You're welcome! Ask me anything else about studying in Poland." };

    var u = findUni(q);
    if (u) return uniAnswer(u);

    if (hasAny(q, ['phone', 'phone number', 'call you', 'contact number', 'email', 'e mail', 'contact', 'contact details', 'whatsapp', 'reach you', 'website', 'your office', 'your offices', 'office address', 'your address', 'where are you']) && !hasAny(q, ['visa', 'university', 'universities']))
      return { text: "You can reach Tutee Connect here:\n📞 +91 73583 64959\n📧 info@tuteeconnect.com\n🌐 www.tuteeconnect.com\n📍 Chennai: 1st Floor, ALA Corner Complex, Virugambakkam - 600092\n📍 Dubai: Tutee Connect LLC FZ, Meydan Grandstand, U.A.E.",
        acts: [{ label: 'WhatsApp us', go: 'whatsapp' }, { label: 'Free evaluation form', go: 'contact' }] };

    var city = findCity(q), field = findField(q);
    var aboutUnis = hasAny(q, ['university', 'universities', 'college', 'colleges', 'institution', 'institutions', 'where', 'which', 'study in', 'offer', 'offers', 'options', 'list']);
    var aboutRank = hasAny(q, ['top', 'best', 'ranked', 'ranking', 'rankings', 'rank', 'qs', 'highest', 'leading', 'good universities', 'famous']);

    if (city && (aboutUnis || aboutRank || field || qt.length <= 2)) {
      var inCity = unis().filter(function (x) { return cityOf(x.location) === city && (!field || offers(x, field)); });
      if (!inCity.length) return { text: 'I couldn’t find ' + (field ? field + ' at ' : '') + 'institutions in ' + city + ' in our directory.', acts: [{ label: 'Browse the directory', go: 'directory' }, ADVISOR] };
      var top = rankedFirst(inCity).slice(0, 6);
      return { text: '**' + inCity.length + ' institution' + (inCity.length === 1 ? '' : 's') + ' in ' + city + (field ? ' offering ' + field : '') + '**, best-known first:\n' + top.map(uniLine).join('\n') + (inCity.length > top.length ? '\n…and ' + (inCity.length - top.length) + ' more in the directory.' : ''),
        acts: [{ label: 'Browse the directory', go: 'directory' }] };
    }
    if (field && (aboutUnis || aboutRank || hasAny(q, ['course', 'courses', 'programme', 'programmes', 'program', 'programs', 'study', 'degree']) || qt.length <= 2)) {
      var withField = rankedFirst(unis().filter(function (x) { return offers(x, field); }));
      if (withField.length) return { text: '**' + withField.length + ' institutions offer ' + field + '**. The highest ranked:\n' + withField.slice(0, 6).map(uniLine).join('\n') + '\n\nAvailability of a specific course varies by university and intake.',
        acts: [{ label: 'Browse the directory', go: 'directory' }, ADVISOR] };
    }
    if (aboutRank && (aboutUnis || has(q, 'qs'))) {
      var ranked = rankedFirst(unis().filter(function (x) { return x.ranked; })).slice(0, 10);
      return { text: '**Top Polish universities, QS World University Rankings 2027:**\n' + ranked.map(uniLine).join('\n') + '\n\nAll 20 QS-ranked Polish institutions are in our directory.', acts: [{ label: 'Browse the directory', go: 'directory' }] };
    }
    if (hasAny(q, ['how many universities', 'how many institutions', 'number of universities', 'list of universities', 'all universities', 'directory', 'cities'])) {
      var cs = {}; unis().forEach(function (x) { var c = cityOf(x.location); cs[c] = (cs[c] || 0) + 1; });
      var hubs = Object.keys(cs).sort(function (a, b) { return cs[b] - cs[a]; }).slice(0, 6).map(function (c) { return c + ' (' + cs[c] + ')'; }).join(', ');
      return { text: 'Our directory lists **' + unis().length + ' institutions** across **' + Object.keys(cs).length + ' cities** that can legally admit international students: 20 are in the QS World University Rankings 2027 and 10 in the Excellence Initiative: Research University programme.\n\nBiggest hubs: ' + hubs + '.', acts: [{ label: 'Browse the directory', go: 'directory' }] };
    }

    // services by name, e.g. "documentation", "post-landing"
    var svc = (window.PL_SERVICES || []).filter(function (s) { return has(q, s.title) || (toks(s.title).length && toks(s.title).every(function (w) { return qt.indexOf(w) > -1; })); })[0];
    if (svc) return { text: '**' + svc.title + '**: ' + svc.tagline + '\n\n' + String(svc.desc).split(/\n{2,}/)[0], acts: [{ label: 'Request this service', go: 'contact' }] };

    // knowledge base
    var best = null, bestScore = 0;
    KB.forEach(function (e) {
      var s = 0;
      e.keys.forEach(function (k) { if (has(q, k)) s += 2 + foldText(k).trim().split(' ').length; });
      if (s > bestScore) { bestScore = s; best = e; }
    });
    if (best && bestScore >= 3) return { text: best.a === '__SERVICES__' ? servicesAnswer() : best.a, acts: best.acts };

    // anything else the page itself says
    var found = searchPage(qt);
    if (found) return found;

    return { text: "I couldn't find that on this page, and I'd rather not guess. Our advisors can answer it directly, and it's free.",
      acts: [{ label: 'Talk to an advisor', go: 'contact' }, { label: 'WhatsApp us', go: 'whatsapp' }] };
  }

  function enquireAbout(name) {
    if ($('#contact [data-destination-input]')) { setDestination(name); goToSection('contact'); return; }
    try { localStorage.setItem('selectedUniversity', name); window.location.href = './index.html#contact'; }
    catch (e) { window.location.href = './index.html?apply=' + encodeURIComponent(name) + '#contact'; }
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

    function clockNow() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    function push(role, content, acts, atTop) {
      var m = document.createElement('div');
      m.className = 'msg ' + (role === 'assistant' ? 'ai' : 'me');
      m.innerHTML = mdToHtml(content);
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
    function act(a) {
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
      $$('.msg', list).forEach(function (n) { n.remove(); });
      if (chipRow) chipRow.classList.remove('hidden');
      if (input) input.value = '';
      setTyping(false); syncSendBtn();
      push('assistant', CHAT_WELCOME, null, true);
    }
    function send(text) {
      if (!text || !text.trim()) return;
      text = text.trim().slice(0, 400);
      push('user', text);
      if (input) input.value = '';
      syncSendBtn();
      if (chipRow) chipRow.classList.add('hidden');
      var res = answer(text);
      setTyping(true);
      setTimeout(function () { setTyping(false); push('assistant', res.text, res.acts); }, 450 + Math.min(700, res.text.length));
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
    push('assistant', CHAT_WELCOME, null, true);
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
    var bar = $('[data-uni-bar]'), barCount = $('[data-uni-bar-count]'), barNoun = $('[data-uni-bar-noun]');
    var modal = $('[data-uni-modal]'), modalBtn = $('[data-uni-modal-submit]'), picked = $('[data-uni-picked]');
    var regionSel = $('[data-region-filter]');
    var mapG = $('[data-umap-cities]');
    var tools = $('[data-u-tools]');
    var sortSel = $('[data-uni-sort]');
    var shownEl = $('[data-uni-shown]');

    var PAGE = 24, shown = PAGE, filtered = all, selected = [];
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
          '<button type="button" class="sel-btn" data-uni-select aria-pressed="' + on + '">' + selBtnHtml(on) + '</button></div></div>' +
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

    function paintSelection() {
      var k = selected.length;
      bar.classList.toggle('show', k > 0);
      document.body.classList.toggle('tray-open', k > 0);
      barCount.textContent = k;
      barNoun.textContent = (k === 1 ? 'Institution' : 'Institutions') + ' selected';
      if (modalBtn) modalBtn.textContent = k ? 'Apply to ' + k + ' ' + (k === 1 ? 'institution' : 'institutions') : 'Submit profile';
      if (picked) picked.innerHTML = selected.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
      setDestination(selected.join(', '), modal);
    }

    function toggle(name) {
      var i = selected.indexOf(name);
      if (i > -1) selected.splice(i, 1); else selected.push(name);
      var on = i < 0;
      $$('.u-card', grid).forEach(function (c) {
        if (c.getAttribute('data-name') !== name) return;
        c.classList.toggle('sel', on);
        var b = $('[data-uni-select]', c);
        b.setAttribute('aria-pressed', String(on));
        b.innerHTML = selBtnHtml(on);
      });
      paintSelection();
    }
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
    function goApply() {
      var list = selected.join(', ');
      var stored = false;
      try { localStorage.setItem('selectedUniversity', list); stored = true; } catch (e) { /* storage blocked */ }
      window.location.href = './index.html' + (stored || !list ? '' : '?apply=' + encodeURIComponent(list)) + '#contact';
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
  initCurtain();
  initHeader();
  initMobileMenu();
  initScrollLinks();
  initMarquees();
  initServices(window.PL_SERVICES || []);
  initLeague();
  initDirectory();
  initReveal();
  initButtons();
  initHero();
  initRail();
  initHScroll();
  initStack();
  initSteps();
  initParallax();
  initClipGrow();
  initFaq();
  initForms();
  initGlowWord();
  initChat();
  initSceneLoop();

  // Deep links such as /index.html#contact
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    setTimeout(function () { smoothTo(id); }, 700);
  }
})();
