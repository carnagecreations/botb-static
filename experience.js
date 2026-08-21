(function () {
  'use strict';

  function revealAllImmediately() {
    var els = document.querySelectorAll('.reveal-on-scroll');
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('is-revealed');
    }
  }

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    var targets = document.querySelectorAll('.reveal-on-scroll');
    if (!targets.length || reducedMotion || !('IntersectionObserver' in window)) {
      revealAllImmediately();
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );
      targets.forEach(function (el) { observer.observe(el); });
    }
  } catch (e) {
    revealAllImmediately();
  }

  try {
    var bar = document.getElementById('scroll-progress');
    var ticking = false;
    function updateProgress() {
      var doc = document.documentElement;
      var scrollTop = doc.scrollTop || document.body.scrollTop;
      var scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
      var pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      if (bar && !reducedMotion) bar.style.width = pct + '%';
      ticking = false;
    }
    // Fast flings can scroll an element fully past the viewport between the
    // browser's intersection checks, so the observer never fires for it.
    // Sweep on scroll and reveal anything already above the fold.
    function sweepPastElements() {
      var stragglers = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
      for (var i = 0; i < stragglers.length; i++) {
        if (stragglers[i].getBoundingClientRect().bottom < 0) {
          stragglers[i].classList.add('is-revealed');
        }
      }
    }
    if (bar || document.querySelector('.reveal-on-scroll')) {
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            updateProgress();
            sweepPastElements();
          });
          ticking = true;
        }
      }, { passive: true });
      updateProgress();
    }
  } catch (e2) {
    /* progress bar + straggler sweep are both safety/cosmetic only — safe to skip on failure */
  }
})();
