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
   * 1. Intro curtain
   * ------------------------------------------------------------------ */
  function initCurtain() {
    var done = false;
    function go() {
      if (done) return; done = true;
      document.documentElement.classList.add('is-loaded');
      document.body.classList.add('is-loaded');
      var c = $('.curtain');
      if (c) setTimeout(function () { c.remove(); }, 1300);
    }
    if (document.readyState === 'complete') setTimeout(go, 250);
    else window.addEventListener('load', function () { setTimeout(go, 150); });
    setTimeout(go, 1600);   // never hold the page hostage to a slow image
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
          var delay = el.closest('.hero, .u-hero') ? 900 : 0;
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
   * 4. Hero: slideshow, pointer parallax
   * ------------------------------------------------------------------ */
  function initHero() {
    var show = $('[data-slideshow]');
    if (show) {
      var slides = $$('.slide', show);
      var cityEl = $('[data-slide-city]', show);
      var noteEl = $('[data-slide-note]', show);
      var dotsEl = $('[data-slide-dots]', show);
      var idx = 0;
      dotsEl.innerHTML = slides.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('');
      var dots = $$('i', dotsEl);
      var go = function (n) {
        slides[idx].classList.remove('on'); dots[idx].classList.remove('on');
        idx = n % slides.length;
        slides[idx].classList.add('on');
        void dots[idx].offsetWidth; dots[idx].classList.add('on');
        cityEl.innerHTML = '<span>' + esc(slides[idx].getAttribute('data-city')) + '</span>';
        noteEl.textContent = slides[idx].getAttribute('data-note');
      };
      if (!REDUCED) setInterval(function () { if (!document.hidden) go(idx + 1); }, 6000);
    }

    var hero = $('.hero');
    if (hero && FINE && !REDUCED) {
      var floats = $$('[data-float]', hero);
      hero.addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        floats.forEach(function (f) {
          var k = parseFloat(f.getAttribute('data-float')) * 22;
          f.style.setProperty('--fx', (nx * k).toFixed(1));
          f.style.setProperty('--fy', (ny * k).toFixed(1));
        });
      });
    }
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

  /* Why Poland: vertical scroll drives a horizontal track. */
  function initHScroll() {
    var pin = $('[data-hscroll]');
    var track = $('[data-hscroll-track]');
    if (!pin || !track) return;
    var fill = $('.why-progress .fill');
    var idxEl = $('[data-hscroll-index]');
    var cards = $$('.why-card', track);
    var dist = 0, enabled = false;

    function measure() {
      enabled = !REDUCED && !isMobile();
      if (!enabled) { pin.style.height = ''; track.style.transform = ''; return; }
      track.style.transform = 'translate3d(0,0,0)';
      var last = track.lastElementChild.getBoundingClientRect();
      dist = Math.max(0, last.right - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
      pin.style.height = (window.innerHeight + dist) + 'px';
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    addScene(function () {
      if (!enabled) return;
      var r = pin.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, pin.offsetHeight - window.innerHeight), 0, 1);
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (fill) fill.style.setProperty('--wp', p.toFixed(4));
      if (idxEl) idxEl.textContent = ('0' + (Math.min(cards.length, Math.floor(p * cards.length) + 1))).slice(-2);
    });
  }

  /* Funding: sticky cards shrink as the next one slides over them. */
  function initStack() {
    var cards = $$('[data-stack] .stack-card');
    if (cards.length < 2 || REDUCED) return;
    addScene(function () {
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
   * 6. Services: numbered index + morphing detail (accordion on mobile)
   * ------------------------------------------------------------------ */
  function paragraphs(desc) {
    return String(desc || '').split(/\n{2,}/).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  }

  function initServices(services) {
    var list = $('[data-svc-list]');
    var detail = $('[data-svc-detail]');
    if (!list || !services.length) return;
    var pad = function (n) { return ('0' + n).slice(-2); };

    list.innerHTML = services.map(function (s, i) {
      return '<li data-reveal style="--d:' + (i * 0.05) + 's">' +
        '<button type="button" class="svc-item' + (i === 0 ? ' on' : '') + '" data-svc="' + i + '" aria-expanded="' + (i === 0) + '">' +
          '<span class="n">' + pad(i + 1) + '</span>' + esc(s.title) +
          '<span class="go"><svg width="16" height="16"><use href="#i-arrow"/></svg></span>' +
        '</button>' +
        '<div class="svc-panel acc-a"><div><p class="tagline" style="color:var(--gold);font-weight:700;font-size:13px;letter-spacing:.12em;text-transform:uppercase;margin:0 0 8px">' + esc(s.tagline) + '</p>' +
          '<div style="color:rgba(255,255,255,.75);font-size:15px">' + paragraphs(s.desc) + '</div>' +
          '<a class="btn sm light" href="#contact" data-scroll-to="contact">Request this service</a></div></div>' +
      '</li>';
    }).join('');

    var items = $$('.svc-item', list);
    var cur = 0, timer = null;

    function paint(i, instant) {
      cur = (i + services.length) % services.length;
      items.forEach(function (b, j) {
        b.classList.toggle('on', j === cur);
        b.setAttribute('aria-expanded', String(j === cur));
        b.parentNode.classList.toggle('open', j === cur);
      });
      if (!detail) return;
      var s = services[cur];
      var fill = function () {
        $('[data-svc-count]', detail).textContent = pad(cur + 1);
        $('[data-svc-icon]', detail).innerHTML = s.icon || '';
        $('[data-svc-tagline]', detail).textContent = s.tagline;
        $('[data-svc-title]', detail).textContent = s.title;
        $('[data-svc-body]', detail).innerHTML = paragraphs(s.desc);
        detail.classList.remove('out');
      };
      if (instant) { fill(); return; }
      detail.classList.add('out');
      clearTimeout(timer);
      timer = setTimeout(fill, 260);
    }

    items.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (isMobile() && cur === i && b.parentNode.classList.contains('open')) {
          b.parentNode.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); return;
        }
        paint(i);
      });
      if (FINE) b.addEventListener('mouseenter', function () { if (!isMobile() && cur !== i) paint(i); });
    });
    var prev = $('[data-svc-prev]'), next = $('[data-svc-next]');
    if (prev) prev.addEventListener('click', function () { paint(cur - 1); });
    if (next) next.addEventListener('click', function () { paint(cur + 1); });
    paint(0, true);
    // the panel CTAs were injected after initScrollLinks ran
    $$('[data-scroll-to]', list).forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); smoothTo('contact'); });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. Home universities: 3D coverflow linked to the map
   * ------------------------------------------------------------------ */
  function mapCity(name, xy, extra) {
    var lx = xy[0] + 13, anchor = 'start';
    if (xy[0] > 470) { lx = xy[0] - 13; anchor = 'end'; }
    return '<g class="city" data-city="' + esc(name) + '"' + (extra || '') + '>' +
      '<circle class="halo" cx="' + xy[0] + '" cy="' + xy[1] + '" r="7"/>' +
      '<circle class="dot" cx="' + xy[0] + '" cy="' + xy[1] + '" r="6"/>' +
      '<text x="' + lx + '" y="' + (xy[1] + 5) + '" text-anchor="' + anchor + '">' + esc(name) + '</text></g>';
  }

  function initFlow() {
    var stage = $('[data-flow]');
    if (!stage || !window.PL_UNIVERSITIES) return;
    var unis = window.PL_UNIVERSITIES.filter(function (u) { return u.ranked; })
      .sort(function (a, b) { return a.rank - b.rank; }).slice(0, 12);
    var cityG = $('[data-map-cities]');
    var idxEl = $('[data-flow-index]');

    stage.innerHTML = unis.map(function (u, i) {
      var fields = String(u.programs || '').split(',').slice(0, 2).map(function (f) { return '<span>' + esc(f.trim()) + '</span>'; }).join('');
      return '<article class="flow-card" data-i="' + i + '" tabindex="0" aria-label="' + esc(u.name) + ', rank ' + u.rank + '">' +
        '<svg class="crest" viewBox="0 0 200 200" aria-hidden="true"><use href="#rosette"/></svg>' +
        '<div class="rank"><small>QS 2027 · Poland</small><b>#' + u.rank + '</b></div>' +
        '<h4>' + esc(u.name) + '</h4>' +
        '<div class="loc"><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>' + esc(u.location) + '</div>' +
        '<div class="meta"><span class="red">' + esc(u.programmes) + ' programmes</span><span>' + esc(u.type) + '</span>' + fields + '</div>' +
      '</article>';
    }).join('');
    var cards = $$('.flow-card', stage);

    var cities = [];
    unis.forEach(function (u) { var c = cityOf(u.location); if (cities.indexOf(c) < 0 && CITY_XY[c]) cities.push(c); });
    if (cityG) cityG.innerHTML = cities.map(function (c) { return mapCity(c, CITY_XY[c]); }).join('');

    var active = 0, auto = null;
    function layout() {
      var n = cards.length, w = cards[0].offsetWidth;
      var step = isMobile() ? w * 0.42 : w * 0.56;
      cards.forEach(function (c, i) {
        var d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        var ad = Math.abs(d);
        c.classList.toggle('active', d === 0);
        c.style.zIndex = String(20 - ad);
        c.style.opacity = ad > 2 ? '0' : String(1 - ad * 0.18);
        c.style.pointerEvents = ad > 2 ? 'none' : '';
        c.style.filter = ad ? 'saturate(.7)' : '';
        c.style.transform = 'translateX(' + (d * step).toFixed(0) + 'px) translateZ(' + (-ad * 140) + 'px) rotateY(' + (-d * 24) + 'deg) scale(' + (1 - ad * 0.05).toFixed(2) + ')';
        c.setAttribute('aria-hidden', String(d !== 0));
      });
      if (idxEl) idxEl.textContent = ('0' + (active + 1)).slice(-2);
      var city = cityOf(unis[active].location);
      $$('.city', cityG || document.createElement('g')).forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-city') === city); });
    }
    function go(i) { active = (i + cards.length) % cards.length; layout(); }
    function startAuto() { stopAuto(); if (!REDUCED) auto = setInterval(function () { if (!document.hidden && inView) go(active + 1); }, 4200); }
    function stopAuto() { if (auto) clearInterval(auto); auto = null; }

    cards.forEach(function (c, i) {
      c.addEventListener('click', function () { go(i); startAuto(); });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(i); });
    });
    var prev = $('[data-flow-prev]'), next = $('[data-flow-next]');
    if (prev) prev.addEventListener('click', function () { go(active - 1); startAuto(); });
    if (next) next.addEventListener('click', function () { go(active + 1); startAuto(); });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(active - 1); startAuto(); }
      if (e.key === 'ArrowRight') { go(active + 1); startAuto(); }
    });
    if (cityG) cityG.addEventListener('click', function (e) {
      var g = e.target.closest('.city'); if (!g) return;
      var c = g.getAttribute('data-city');
      for (var k = 1; k <= unis.length; k++) {
        var j = (active + k) % unis.length;
        if (cityOf(unis[j].location) === c) { go(j); startAuto(); break; }
      }
    });

    // swipe / drag
    var sx = null;
    stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
    window.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(active + (dx < 0 ? 1 : -1)); startAuto(); }
    });
    stage.addEventListener('mouseenter', stopAuto);
    stage.addEventListener('mouseleave', startAuto);

    var inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.3 }).observe(stage);
    } else inView = true;

    window.addEventListener('resize', layout);
    layout();
    startAuto();
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

  function initForms() {
    $$('form[data-lead-form]').forEach(function (form) {
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

        if (!String(data.name || '').trim()) { status('error', 'Please enter your name.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) { status('error', 'Please enter a valid email address.'); return; }
        if (!/^[0-9]{7,15}$/.test(String(data.phone_number || '').replace(/\D/g, ''))) { status('error', 'Please enter a valid phone number (7-15 digits).'); return; }

        data.phone = (data.country_code || '') + ' ' + (data.phone_number || '');
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

    // A university picked on the directory page pre-fills the enquiry.
    try {
      var picked = localStorage.getItem('selectedUniversity');
      if (picked) {
        localStorage.removeItem('selectedUniversity');
        setDestination(picked);
      }
    } catch (err) { /* storage unavailable */ }
  }

  function setDestination(v, root) {
    var val = v || 'General Poland Inquiry';
    $$('[data-destination-input]', root).forEach(function (i) { i.value = val; });
    $$('[data-destination-label]', root).forEach(function (l) { l.textContent = val; });
  }

  /* ------------------------------------------------------------------ *
   * 10. Tutee AI counsellor
   * ------------------------------------------------------------------ */
  var CHAT_WELCOME = "Hi! 👋 I'm your **Tutee Connect AI Counsellor**.\n\nI can answer questions about Polish student visas, top Polish universities, and our 99% success rate programmes. How can I help you today?";

  function cannedReply(text) {
    var q = text.toLowerCase();
    if (/visa|residence permit|karta pobytu|mswia|approved|interview|refus/.test(q))
      return 'You need a Polish **national visa (type D)**, then a **temporary residence permit for studies** once you are in Poland. One check comes first and it is the one people miss: since July 2025 your institution must be **approved by the Ministry of the Interior** to admit foreigners, or exempt from that requirement — **106 of Poland’s 348 universities are neither**, and no permit can be issued for a course at one of those. We verify that before you commit to a university. Tutee Connect boasts a **99% Polish Student Visa Success Rate**!';
    if (/scholarship|fund|financial|aid|bursar|loan/.test(q))
      return 'The flagship is the **Banach NAWA programme**, and India is one of its eligible countries: for full-time master’s study it pays a **monthly stipend**, **waives tuition** at a public university and adds a **travel allowance**. Polish **doctoral schools** charge no tuition at all and pay every full-time candidate a scholarship. We also arrange **collateral and non-collateral education loans**, and help you apply where you have the highest chance of securing funding.';
    if (/cost|fee|tuition|money|expense|budget|afford/.test(q))
      return 'Poland is one of the **most affordable study destinations in the EU**, and **doctoral schools charge no tuition and pay a scholarship**. Fees depend on the university and programme, and for the residence permit you must show you can cover your living costs, your tuition and a return journey. Our counsellors work out the exact picture for your profile and course, and help with **non-collateral education loans** and part-time work.';
    if (/job|work|earn|part.?time|graduate permit|blue card/.test(q))
      return "Absolutely, and Poland is unusually generous here: a **full-time** student needs **no work permit and faces no weekly cap at all** — there is no Polish equivalent of a 20-hour limit. Two conditions: your institution must be MSWiA-approved or exempt, and part-time, postgraduate and MBA study do not qualify. After you graduate you get a **nine-month permit** to find work or start a business, and graduates of full-time Polish degrees stay exempt from the work permit. Our 'Earn While You Learn' support helps students find jobs soon after arrival.";
    if (/ielts|pte|duolingo|gmat|exam|english|toefl/.test(q))
      return 'Poland sets **no language requirement for the residence permit** — language is purely an admission matter, so there is no national list of accepted tests and each university publishes its own. **IELTS Academic, TOEFL iBT and PTE Academic** are accepted essentially everywhere. The **Duolingo English Test** is taken by some Polish institutions but **not by the most selective** — it is not on the University of Warsaw’s published list. Some postgraduate courses such as MBAs also ask for a GMAT score. We can shortlist universities that match your current scores.';
    if (/tutee|connect|service|help/.test(q))
      return 'Tutee Connect provides end-to-end support for Polish admissions! From university shortlisting and applications through each university’s own recruitment system — Poland has no central application system — to your national visa and residence permit file, education loans, and post-landing settlement. We are your one-stop solution.';
    return "That's a great question! Studying in Poland involves a lot of moving parts (admissions, the MSWiA approval check, the national visa, the residence permit, loans), and our experts at Tutee Connect are dedicated to navigating every single detail with you.";
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

    var stage = 'idle';
    var lead = { name: '', phone: '', email: '' };
    var askedForDetails = false;

    function clockNow() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    function push(role, content, atTop) {
      var m = document.createElement('div');
      m.className = 'msg ' + (role === 'assistant' ? 'ai' : 'me');
      m.innerHTML = mdToHtml(content) + '<time>' + clockNow() + '</time>';
      if (atTop) list.insertBefore(m, list.firstChild);
      else list.insertBefore(m, typing);
      list.scrollTop = list.scrollHeight;
    }
    function setTyping(on) { typing.classList.toggle('hidden', !on); if (on) list.insertBefore(typing, null); list.scrollTop = list.scrollHeight; }
    function hideChips() { if (chipRow) chipRow.classList.add('hidden'); }

    function open() {
      document.body.classList.add('chat-open');
      setTimeout(function () { if (input && FINE) input.focus(); }, 300);
    }
    function close() { document.body.classList.remove('chat-open'); }
    function reset() {
      $$('.msg', list).forEach(function (n) { n.remove(); });
      stage = 'idle'; lead = { name: '', phone: '', email: '' }; askedForDetails = false;
      if (chipRow) chipRow.classList.remove('hidden');
      if (input) input.value = '';
      setTyping(false); syncSendBtn();
      push('assistant', CHAT_WELCOME, true);
    }

    function submitLead() {
      return fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          subject: 'New Lead from Chatbot!', from_name: 'Tutee AI Counsellor',
          name: lead.name, phone: lead.phone, email: lead.email,
          destination: 'Chatbot General Inquiry', page: enquiryPage()
        })
      }).then(function (r) { return r.json().catch(function () { return { success: false }; }); });
    }

    function reply(text, delay, then) {
      setTyping(true);
      setTimeout(function () { setTyping(false); push('assistant', text); if (then) then(); }, delay || 650);
    }

    function send(text) {
      if (!text || !text.trim()) return;
      text = text.trim();
      push('user', text);
      if (input) input.value = '';
      syncSendBtn();
      hideChips();

      if (stage === 'asking_name') { lead.name = text; stage = 'asking_phone'; reply('Thanks ' + text.split(' ')[0] + '! What is the best **Phone Number** (with country code) to reach you at?'); return; }
      if (stage === 'asking_phone') {
        if (!/^[0-9]{7,15}$/.test(text.replace(/\D/g, ''))) { reply("That doesn't look like a valid phone number. Please enter a valid number (e.g., +91 98765 43210)."); return; }
        lead.phone = text; stage = 'asking_email'; reply('Got it. Lastly, what is your **Email Address**?'); return;
      }
      if (stage === 'asking_email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) { reply("That doesn't look like a valid email address. Could you double-check and try again?"); return; }
        lead.email = text; stage = 'idle';
        reply('Perfect! Submitting your profile to our experts now…', 500, function () {
          setTyping(true);
          submitLead().then(function (res) {
            setTyping(false);
            push('assistant', res && res.success
              ? '✅ **Success!** Your profile has been assigned to an expert counsellor. They will contact you shortly to help with your admission and visa process.\n\nIs there anything else I can help you with in the meantime?'
              : 'Oops, something went wrong submitting your profile. Please try using the main contact form on our website.');
          }).catch(function () { setTyping(false); push('assistant', 'Network error while submitting. Please try the main contact form or WhatsApp!'); });
        });
        return;
      }
      if (/^evaluate my profile$/i.test(text)) {
        stage = 'asking_name';
        reply("I'd be happy to help you evaluate your profile! Our expert human counsellors review these directly to ensure accuracy.\n\nCould I please get your **Full Name**?", 500);
        return;
      }
      reply(cannedReply(text), 750, function () {
        if (askedForDetails) return;
        askedForDetails = true;
        setTimeout(function () {
          reply('To give you the most accurate and personalised guidance for your unique profile, could I quickly grab your **Full Name**?', 900, function () { stage = 'asking_name'; });
        }, 400);
      });
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
    push('assistant', CHAT_WELCOME, true);
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

    var PAGE = 24, shown = PAGE, filtered = all, selected = [];
    var typeF = '', regionF = '', cityF = '';

    /* Diacritic-folded search. "ł" does not decompose under NFD (the stroke is
       part of the letter), so it is mapped explicitly: "Lodz" finds "Łódź".
       `alt` carries English names and inflected city forms; searched, never shown. */
    function fold(str) { return String(str).toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function haystack(u) {
      if (u.__hay === undefined) u.__hay = fold(u.name + ' ' + u.location + ' ' + u.programs + ' ' + u.type + ' ' + (u.alt || ''));
      return u.__hay;
    }
    var rankLabel = function (u) { return u.ranked ? '#' + u.rank : '—'; };

    function card(u, i) {
      var on = selected.indexOf(u.name) > -1;
      return '<article class="u-card' + (u.ranked ? ' ranked' : '') + (on ? ' sel' : '') + '" style="--i:' + i + '" data-name="' + esc(u.name) + '">' +
        '<div class="top"><div class="rank">' + rankLabel(u) + '<small>' + (u.ranked ? 'QS 2027' : 'Unranked') + '</small></div>' +
          '<span class="type' + (u.type === 'Research University' ? ' res' : '') + '">' + esc(u.type) + '</span></div>' +
        '<h3>' + esc(u.name) + '</h3>' +
        '<div class="loc"><svg viewBox="0 0 24 24"><use href="#i-pin"/></svg>' + esc(u.location) + '</div>' +
        '<p class="fields">' + esc(u.programs) + '</p>' +
        '<div class="foot"><div><div class="progs"><b>' + esc(u.programmes) + '</b>study programmes</div>' +
          '<span class="ok"><svg width="12" height="12" viewBox="0 0 24 24"><use href="#i-shield"/></svg>Intl. admits: Yes</span></div>' +
          '<button type="button" class="sel-btn" data-uni-select aria-pressed="' + on + '"><span class="tick">' + (on ? '✓' : '') + '</span>' + (on ? 'Selected' : 'Select') + '</button></div>' +
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

    grid.addEventListener('click', function (e) {
      var c = e.target.closest('.u-card');
      if (!c || (!e.target.closest('[data-uni-select]') && !isMobile())) return;
      var name = c.getAttribute('data-name');
      var i = selected.indexOf(name);
      if (i > -1) selected.splice(i, 1); else selected.push(name);
      var on = i < 0;
      c.classList.toggle('sel', on);
      var b = $('[data-uni-select]', c);
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = '<span class="tick">' + (on ? '✓' : '') + '</span>' + (on ? 'Selected' : 'Select');
      paintSelection();
    });

    function applyFilter() {
      var q = fold((search ? search.value : '').trim());
      filtered = all.filter(function (u) {
        if (typeF === 'ranked' && !u.ranked) return false;
        if (typeF && typeF !== 'ranked' && u.type !== typeF) return false;
        if (regionF && regionOf(u.location) !== regionF) return false;
        if (cityF && cityOf(u.location) !== cityF) return false;
        return !q || haystack(u).indexOf(q) > -1;
      });
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
              (counts[c] >= 6 ? '<text x="' + (xy[0] > 470 ? xy[0] - r - 6 : +xy[0] + +r + 6) + '" y="' + (xy[1] + 5) + '" text-anchor="' + (xy[0] > 470 ? 'end' : 'start') + '"' + label + '>' + esc(c) + ' · ' + counts[c] + '</text>' : '') +
            '</g>';
          }).join('');
      }
    }

    function setCity(c) {
      cityF = (cityF === c) ? '' : c;
      if (cityF) { regionF = ''; if (regionSel) regionSel.value = ''; }
      applyFilter();
      var top = resultBox.getBoundingClientRect().top + window.pageYOffset - 200;
      if (cityF) window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
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

    var debounce = null;
    if (search) search.addEventListener('input', function () { clearTimeout(debounce); debounce = setTimeout(applyFilter, 120); });
    var showBtn = $('[data-uni-show-results]');
    if (showBtn) showBtn.addEventListener('click', function () {
      applyFilter();
      window.scrollTo({ top: resultBox.getBoundingClientRect().top + window.pageYOffset - 200, behavior: REDUCED ? 'auto' : 'smooth' });
    });
    if (search) search.addEventListener('keydown', function (e) { if (e.key === 'Enter') showBtn.click(); });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (search) search.value = '';
      typeF = ''; regionF = ''; cityF = '';
      if (regionSel) regionSel.value = '';
      $$('[data-type-filter]').forEach(function (x) { x.classList.toggle('on', !x.getAttribute('data-type-filter')); });
      applyFilter();
    });
    moreBtn.addEventListener('click', function () { shown += PAGE; renderGrid(true); });

    function openModal() { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
    function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
    $('[data-uni-proceed]').addEventListener('click', openModal);
    $('[data-uni-modal-close]').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

    if (tools) addScene(function () { tools.classList.toggle('stuck', tools.getBoundingClientRect().top <= 80); });

    buildFacets();
    applyFilter();
    paintSelection();
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
  initFlow();
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
  initChat();
  initSceneLoop();

  // Deep links such as /index.html#contact
  if (location.hash.length > 1) {
    var id = decodeURIComponent(location.hash.slice(1));
    setTimeout(function () { smoothTo(id); }, 700);
  }
})();
