/* ====================================================================
   BEAUTIES OF THE BEASTS — PREMIUM UPGRADE SCRIPTS
   Menu is handled inline on elements - this file handles everything else
   ==================================================================== */
(function() {
  'use strict';

  /* 1. SCROLL PROGRESS BAR */
  var bar = document.getElementById('scroll-progress');
  if (bar) {
    window.addEventListener('scroll', function() {
      var scrolled = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? Math.min(100, (scrolled / total) * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* 2. HEADER SCROLL STATE */
  var header = document.querySelector('header');
  if (header) {
    var updateHeader = function() {
      if (window.scrollY > 40) { header.classList.add('scrolled'); }
      else { header.classList.remove('scrolled'); }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* 3. SCROLL REVEAL */
  var revealEls = document.querySelectorAll('.reveal-on-scroll');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el) { observer.observe(el); });
  } else {
    revealEls.forEach(function(el) { el.classList.add('is-revealed'); });
  }

  /* 4. AUTO-REVEAL SECTIONS */
  document.querySelectorAll('section').forEach(function(section, i) {
    if (!section.classList.contains('reveal-on-scroll')) {
      section.classList.add('reveal-on-scroll');
      section.classList.add(i > 0 ? 'reveal-delay-' + Math.min(i, 3) : 'is-revealed');
    }
  });

  /* 4a. STAGGERED CARD-BY-CARD REVEAL FOR GRIDS */
  var cardSelectors = [
    '.grid > .border.border-obsidian-700\\/60.bg-obsidian-900\\/70',
    '.grid > article.reptile-card-lift',
    '.grid > .border.border-obsidian-700.bg-obsidian-850'
  ];
  var cardGroups = {};
  cardSelectors.forEach(function(sel) {
    document.querySelectorAll(sel).forEach(function(card) {
      var parent = card.parentElement;
      if (!cardGroups[sel]) cardGroups[sel] = new Map();
      if (!cardGroups[sel].has(parent)) cardGroups[sel].set(parent, []);
      cardGroups[sel].get(parent).push(card);
    });
  });
  var staggeredCards = [];
  Object.keys(cardGroups).forEach(function(sel) {
    cardGroups[sel].forEach(function(cards) {
      cards.forEach(function(card, i) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        card.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1) ' + Math.min(i, 6) * 0.07 + 's, transform 0.55s cubic-bezier(0.16,1,0.3,1) ' + Math.min(i, 6) * 0.07 + 's';
        staggeredCards.push(card);
      });
    });
  });
  if (staggeredCards.length > 0 && 'IntersectionObserver' in window) {
    var cardObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    staggeredCards.forEach(function(el) { cardObserver.observe(el); });
  } else {
    staggeredCards.forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    staggeredCards.forEach(function(el) { el.style.transition = 'none'; el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  /* 4b. TIER CARD IMPACT BARS */
  var tierCards = document.querySelectorAll('.tier-card');
  if (tierCards.length > 0 && 'IntersectionObserver' in window) {
    var tierObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); tierObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.3 });
    tierCards.forEach(function(el) { tierObserver.observe(el); });
  } else {
    tierCards.forEach(function(el) { el.classList.add('revealed'); });
  }

  /* 5. ACTIVE NAV LINK */
  var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('nav a').forEach(function(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    if ((href.replace(/\/$/, '') || '/') === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* 6. COUNT-UP ANIMATION */
  function countUp(el, target, duration) {
    var start = 0, step = target / (duration / 16);
    var timer = setInterval(function() {
      start += step;
      if (start >= target) { el.textContent = target + '+'; clearInterval(timer); }
      else { el.textContent = Math.floor(start); }
    }, 16);
  }
  var countEls = document.querySelectorAll('[data-count]');
  if (countEls.length > 0 && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          countUp(entry.target, parseInt(entry.target.getAttribute('data-count'), 10), 1200);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function(el) { countObserver.observe(el); });
  }

  /* 7. LINK TRACKING */
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (!link || typeof gtag !== 'function') return;
    var href = link.href || '';
    if (href.includes('zeffy.com')) gtag('event', 'donate_click', { event_category: 'fundraising', event_label: href });
    if (href.includes('/adopt/apply')) gtag('event', 'adopt_application_start', { event_category: 'adoption' });
  });

  /* 8. LAZY LOAD IMAGES */
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img:not([loading])').forEach(function(img) {
      if (!img.closest('.skin-bg') && img.getBoundingClientRect().top > window.innerHeight) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  /* NOTE: Mobile menu is handled via inline onclick attributes on the elements.
     Do NOT add any menu event listeners here. */

})();
