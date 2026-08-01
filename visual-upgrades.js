/* ====================================================================
   BEAUTIES OF THE BEASTS — VISUAL UPGRADE SCRIPTS
   Wires up the CSS visual improvements with DOM transforms
   ==================================================================== */
(function() {
  'use strict';

  /* ---------------------------------------------------------------- */
  /* 1. HERO LOGO — Wrap in portrait container for ring effect        */
  /* ---------------------------------------------------------------- */
  var heroImg = document.querySelector('section .flex.items-center.justify-center img');
  if (heroImg) {
    var wrap = document.createElement('div');
    wrap.className = 'hero-portrait-wrap';
    var glow = document.createElement('span');
    glow.className = 'portrait-glow';
    glow.setAttribute('aria-hidden', 'true');
    heroImg.parentNode.insertBefore(wrap, heroImg);
    wrap.appendChild(heroImg);
    wrap.appendChild(glow);
  }

  /* ---------------------------------------------------------------- */
  /* 2. HERO H1 — Accent the animal count number                     */
  /* ---------------------------------------------------------------- */
  var h1 = document.querySelector('h1.h-display-xl');
  if (h1) {
    h1.innerHTML = h1.innerHTML.replace(
      /(\d+)\s+Animals/g,
      '<span class="count-accent">$1 Animals</span>'
    );
  }

  /* ---------------------------------------------------------------- */
  /* 3. EYEBROW LINES — Upgrade all h-px jade lines to animated ones */
  /* ---------------------------------------------------------------- */
  document.querySelectorAll('section').forEach(function(section) {
    var eyebrowLines = section.querySelectorAll('.h-px.bg-jade-400');
    var eyebrowTexts = section.querySelectorAll('.font-mono.text-\\[11px\\].uppercase.tracking-widest-2.text-jade-300');
    eyebrowLines.forEach(function(line, i) {
      var parent = line.parentElement;
      if (parent && !parent.classList.contains('section-eyebrow')) {
        parent.classList.add('section-eyebrow');
        line.classList.add('eyebrow-line');
        line.removeAttribute('style'); // remove inline width
      }
    });
  });

  /* Trigger eyebrow on scroll reveal */
  var revealedSections = new Set();
  function checkEyebrows() {
    document.querySelectorAll('section').forEach(function(section) {
      if (revealedSections.has(section)) return;
      var rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        section.classList.add('eyebrow-revealed');
        revealedSections.add(section);
      }
    });
  }
  window.addEventListener('scroll', checkEyebrows, { passive: true });
  checkEyebrows();

  /* ---------------------------------------------------------------- */
  /* 4. MARQUEE — Wrap in container for edge fade masks              */
  /* ---------------------------------------------------------------- */
  var marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack && marqueeTrack.parentElement) {
    var parent = marqueeTrack.parentElement;
    if (!parent.classList.contains('marquee-container')) {
      parent.classList.add('marquee-container');
    }
  }

  /* ---------------------------------------------------------------- */
  /* 5. CURSOR GLOW — Smoother tracking with lerp                    */
  /* ---------------------------------------------------------------- */
  var cursorGlow = document.getElementById('cursor-glow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy;
    var raf;

    document.addEventListener('mousemove', function(e) {
      tx = e.clientX;
      ty = e.clientY;
    }, { passive: true });

    function lerpGlow() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      cursorGlow.style.transform = 'translate(' + (cx - 250) + 'px, ' + (cy - 250) + 'px)';
      raf = requestAnimationFrame(lerpGlow);
    }
    lerpGlow();

    // Hide on mobile/touch
    document.addEventListener('touchstart', function() {
      cancelAnimationFrame(raf);
      cursorGlow.style.opacity = '0';
    }, { once: true });
  }

  /* ---------------------------------------------------------------- */
  /* 6. CARE CARDS — Magnetic mouse-follow tilt on hover             */
  /* ---------------------------------------------------------------- */
  var cards = document.querySelectorAll('div[class*="border-obsidian-700/60"][class*="bg-obsidian-900"]');
  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var mx = (e.clientX - rect.left) / rect.width - 0.5;
      var my = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'translateY(-4px) rotateX(' + (-my * 4) + 'deg) rotateY(' + (mx * 4) + 'deg)';
      card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    });
  });

  /* ---------------------------------------------------------------- */
  /* 7. SECTION NUMBERS — Stagger-reveal the section number labels   */
  /* ---------------------------------------------------------------- */
  var sectionNums = document.querySelectorAll('span.font-mono.text-\\[10px\\].text-jade-300');
  sectionNums.forEach(function(el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-8px)';
    el.style.transition = 'opacity 0.5s ease ' + (i * 0.05) + 's, transform 0.5s ease ' + (i * 0.05) + 's';
  });

  if ('IntersectionObserver' in window) {
    var numObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '0.7';
          entry.target.style.transform = '';
          numObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    sectionNums.forEach(function(el) { numObserver.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* 8. STATS COUNT-UP — Already wired in premium-upgrades.js        */
  /*    Enhance: format as "75+" with + sign animating separately    */
  /* ---------------------------------------------------------------- */
  // (handled by existing premium-upgrades.js countUp function)

  /* ---------------------------------------------------------------- */
  /* 9. FOOTER — Animate the concentric circles watermark on scroll  */
  /* ---------------------------------------------------------------- */
  var footer = document.querySelector('footer');
  if (footer) {
    var footerObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          footer.classList.add('footer-visible');
        }
      });
    }, { threshold: 0.1 });
    footerObserver.observe(footer);
  }

  /* ---------------------------------------------------------------- */
  /* 10. HERO ENTRANCE — Stagger children of the hero content block  */
  /* ---------------------------------------------------------------- */
  var heroContent = document.querySelector('section .max-w-2xl');
  if (heroContent) {
    var children = heroContent.children;
    Array.from(children).forEach(function(child, i) {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      child.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1) ' + (0.1 + i * 0.12) + 's, transform 0.7s cubic-bezier(0.16,1,0.3,1) ' + (0.1 + i * 0.12) + 's';
      setTimeout(function() {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, 80 + i * 120);
    });
  }

  /* Reduced motion: cancel all JS animations */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[style*="transition"]').forEach(function(el) {
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

})();
