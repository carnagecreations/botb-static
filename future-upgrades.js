/* ====================================================================
   BEAUTIES OF THE BEASTS — FUTURE LAYER SCRIPTS
   Ambient particle field, spotlight cards, magnetic CTAs, 3D hero
   tilt, cinematic blur-reveals. Loads after visual-upgrades.js.
   All effects are additive, pointer-aware, and reduced-motion safe.
   ==================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------------- */
  /* 1. AMBIENT LAYERS — aurora, particle canvas, film grain           */
  /* ---------------------------------------------------------------- */
  var aurora = document.createElement('div');
  aurora.id = 'fx-aurora';
  aurora.setAttribute('aria-hidden', 'true');
  document.body.appendChild(aurora);

  var grain = document.createElement('div');
  grain.id = 'fx-grain';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  if (!reduceMotion) {
    var canvas = document.createElement('canvas');
    canvas.id = 'fx-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var motes = [];
    var running = true;
    var W = 0, H = 0;

    function sizeCanvas() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawnMotes() {
      var count = W < 768 ? 22 : 48;
      motes = [];
      for (var i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.05 - Math.random() * 0.18,
          tw: Math.random() * Math.PI * 2,          // twinkle phase
          ts: 0.004 + Math.random() * 0.01          // twinkle speed
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx;
        m.y += m.vy;
        m.tw += m.ts;
        if (m.y < -4) { m.y = H + 4; m.x = Math.random() * W; }
        if (m.x < -4) m.x = W + 4;
        if (m.x > W + 4) m.x = -4;
        var a = 0.25 + Math.sin(m.tw) * 0.2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140, 245, 192, ' + a.toFixed(3) + ')';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }

    sizeCanvas();
    spawnMotes();
    tick();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { sizeCanvas(); spawnMotes(); }, 150);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      var wasRunning = running;
      running = !document.hidden;
      if (running && !wasRunning) tick();
    });
  }

  /* ---------------------------------------------------------------- */
  /* 2. SPOTLIGHT CARDS — pointer-tracked light + igniting border      */
  /* ---------------------------------------------------------------- */
  if (finePointer) {
    var cardSelector = [
      'div[class*="border-obsidian-700/60"][class*="bg-obsidian-900"]',
      'article.group',
      '.border-l-2.border-jade-700\\/60'
    ].join(',');
    var cards = document.querySelectorAll(cardSelector);
    cards.forEach(function (card) {
      card.classList.add('fx-spot');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--fx-mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--fx-my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      }, { passive: true });
    });
  }

  /* ---------------------------------------------------------------- */
  /* 3. MAGNETIC CTAs — primary buttons lean toward the cursor         */
  /* ---------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('a.btn-sheen').forEach(function (btn) {
      btn.classList.add('fx-energy');
      var strength = 10;
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var mx = (e.clientX - rect.left) / rect.width - 0.5;
        var my = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.transform = 'translate(' + (mx * strength) + 'px, ' + (my * strength * 0.7) + 'px)';
      }, { passive: true });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* 4. HERO IMAGE — 3D tilt with glare                                */
  /* ---------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    var heroWrap = document.querySelector('main section .relative > img[fetchpriority="high"]');
    var wrapEl = heroWrap ? heroWrap.parentElement : null;
    if (wrapEl) {
      wrapEl.classList.add('fx-tilt');
      var glare = document.createElement('div');
      glare.className = 'fx-glare';
      glare.setAttribute('aria-hidden', 'true');
      wrapEl.appendChild(glare);

      wrapEl.addEventListener('mousemove', function (e) {
        var rect = wrapEl.getBoundingClientRect();
        var mx = (e.clientX - rect.left) / rect.width - 0.5;
        var my = (e.clientY - rect.top) / rect.height - 0.5;
        wrapEl.style.setProperty('--fx-mx', ((mx + 0.5) * 100) + '%');
        wrapEl.style.setProperty('--fx-my', ((my + 0.5) * 100) + '%');
        wrapEl.style.transform =
          'perspective(1100px) rotateX(' + (-my * 3.5) + 'deg) rotateY(' + (mx * 3.5) + 'deg)';
        wrapEl.style.transition = 'transform 0.12s ease';
      }, { passive: true });
      wrapEl.addEventListener('mouseleave', function () {
        wrapEl.style.transform = '';
        wrapEl.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* 5. CINEMATIC BLUR-REVEAL — headings & stats develop into focus    */
  /* ---------------------------------------------------------------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var devEls = document.querySelectorAll(
      'main h2, main blockquote, main dl dd.font-display, main .font-display.text-3xl'
    );
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fx-devd');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -30px 0px' });

    devEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      // Elements already on screen at load stay visible — no pop-in.
      if (rect.top < window.innerHeight) return;
      el.classList.add('fx-dev');
      io.observe(el);
    });
  }

  /* ================================================================ */
  /* V2 — 50x PASS                                                     */
  /* ================================================================ */

  /* V2.1 KINETIC HEADLINE — hero H1 words cascade in one by one       */
  if (!reduceMotion) {
    var heroH1 = document.querySelector('h1.h-display-xl');
    if (heroH1 && !heroH1.querySelector('.fx-word')) {
      var words = heroH1.textContent.split(/\s+/).filter(Boolean);
      heroH1.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'fx-word';
        span.textContent = w;
        span.style.transitionDelay = (0.25 + i * 0.07) + 's';
        heroH1.appendChild(span);
        if (i < words.length - 1) heroH1.appendChild(document.createTextNode(' '));
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          heroH1.querySelectorAll('.fx-word').forEach(function (s) {
            s.classList.add('fx-word-in');
          });
        });
      });
    }
  }

  /* V2.2 CTA COPY UPGRADE — sharper, benefit-driven action language   */
  var ctaMap = {
    'Donate': 'Donate — Save a Life',
    'Donate Now': 'Give Now — 100% to the Animals',
    'Meet the Reptiles': 'Meet Your Next Companion',
    'Contact the Rescue': 'Talk to a Real Human',
    'Start an Application': 'Start Your Adoption Story',
    'Submit an Application': 'Start Your Adoption Story'
  };
  document.querySelectorAll('main a.btn-sheen, main a.inline-flex').forEach(function (btn) {
    // Only the large hero-scale buttons — small header/nav CTAs keep short labels.
    if (!/px-8/.test(btn.className)) return;
    var textNode = null;
    for (var n = 0; n < btn.childNodes.length; n++) {
      if (btn.childNodes[n].nodeType === 3 && btn.childNodes[n].textContent.trim()) {
        textNode = btn.childNodes[n];
        break;
      }
    }
    if (!textNode) return;
    var label = textNode.textContent.trim().replace(/\s*→\s*$/, '');
    if (ctaMap[label]) textNode.textContent = ctaMap[label];
  });

  /* V2.3 CTA MICROCOPY — trust signals under the first donate CTA     */
  var firstDonate = document.querySelector('main a.btn-sheen[href*="zeffy"]');
  if (firstDonate && /px-8/.test(firstDonate.className)) {
    var ctaRow = firstDonate.parentElement;
    if (ctaRow && !ctaRow.querySelector('.fx-cta-note')) {
      var note = document.createElement('div');
      note.className = 'fx-cta-note';
      note.innerHTML =
        '<span>60-second checkout</span>' +
        '<span>100% tax-deductible</span>' +
        '<span>Zero platform fees</span>';
      ctaRow.appendChild(note);
    }
  }

  /* V2.4 CLICK RIPPLE — tactile feedback on every primary CTA         */
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('a.btn-sheen');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'fx-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  }

  /* V2.5 EYEBROW DECODE — mono section labels scramble into place     */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var GLYPHS = '▪▫◆◇/\\|<>_—·01';
    function decode(el) {
      var finalText = el.getAttribute('data-fx-text');
      var frame = 0;
      var total = Math.max(14, finalText.length * 1.5);
      el.classList.add('fx-decoding');
      var timer = setInterval(function () {
        frame++;
        var progress = frame / total;
        var out = '';
        for (var i = 0; i < finalText.length; i++) {
          var ch = finalText[i];
          if (ch === ' ' || i / finalText.length < progress) { out += ch; }
          else { out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
        }
        el.textContent = out;
        if (frame >= total) {
          clearInterval(timer);
          el.textContent = finalText;
          el.classList.remove('fx-decoding');
        }
      }, 32);
    }
    var eyebrows = document.querySelectorAll(
      'main span.font-mono.text-\\[11px\\].uppercase.tracking-widest-2.text-jade-300'
    );
    var eyeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          decode(entry.target);
          eyeIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    eyebrows.forEach(function (el) {
      if (el.children.length) return; // text-only labels
      el.setAttribute('data-fx-text', el.textContent);
      eyeIO.observe(el);
    });
  }

  /* ---------------------------------------------------------------- */
  /* 6. HERO PARALLAX — background drifts slower than content          */
  /* ---------------------------------------------------------------- */
  if (!reduceMotion) {
    var skin = document.querySelector('.skin-bg');
    if (skin) {
      var parallaxRaf = null;
      window.addEventListener('scroll', function () {
        if (parallaxRaf) return;
        parallaxRaf = requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight * 1.5) {
            skin.style.transform = 'translateY(' + (y * 0.18) + 'px)';
          }
          parallaxRaf = null;
        });
      }, { passive: true });
    }
  }

})();
