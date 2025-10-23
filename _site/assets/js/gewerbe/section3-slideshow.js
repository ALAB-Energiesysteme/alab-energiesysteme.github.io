// /assets/js/gewerbe/section3-slideshow.js
// Performance-optimierte, gescopte Fullscreen-Slideshow (nur innerhalb #slideshow)

(() => {
  const root = document.getElementById('slideshow');
  if (!root) return;

  // ------- DOM (nur innerhalb der Section) -------
  const container     = root.querySelector('#slidesContainer');
  const slides        = Array.from(root.querySelectorAll('.slide'));
  const progressDots  = Array.from(root.querySelectorAll('.progress-dot'));
  const prevBtn       = root.querySelector('#prevSlide');
  const nextBtn       = root.querySelector('#nextSlide');

  
  // State
  let currentIndex = 0;
  const total      = slides.length;
  let isBusy       = false;
  let autoplayTO   = null;

  // Settings
  const AUTOPLAY_MS   = 7000;  // 7s
  const TRANSITION_MS = 800;   // mit CSS abgestimmt
  const MIN_SWIPE_PX  = 50;

  // Touch
  let tStartX = 0, tStartY = 0, tEndX = 0, tEndY = 0;

  // ------- Lazy Loading nur für Bilder in dieser Section -------
  const lazyImgs = root.querySelectorAll('img.lazy[data-src]');
  const loadImg = (img) => {
    const src = img.getAttribute('data-src');
    if (!src) return;
    img.classList.add('loading');
    const pre = new Image();
    pre.onload = () => {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.remove('lazy', 'loading');
      img.classList.add('loaded');
    };
    pre.onerror = () => img.classList.remove('loading');
    pre.src = src;
  };

  if ('IntersectionObserver' in window && lazyImgs.length) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          loadImg(e.target);
          io.unobserve(e.target);
        }
      }
    }, { root: null, rootMargin: '80px' });
    lazyImgs.forEach(img => io.observe(img));
  } else {
    lazyImgs.forEach(loadImg);
  }

  const preloadAround = (idx) => {
    const next = slides[(idx + 1) % total]?.querySelector('img.lazy[data-src]');
    const prev = slides[(idx - 1 + total) % total]?.querySelector('img.lazy[data-src]');
    if (next) loadImg(next);
    if (prev) loadImg(prev);
  };

  // ------- UI Updates -------
  const setDots = () => {
    progressDots.forEach((dot, i) => {
      const active = i === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
      // Progress-Füllstand im Autoplay setzen/animieren übernehmen wir per CSS-Active
    });
  };

  const setSlides = (prevIdx, newIdx) => {
    // Klassen sauber setzen, damit CSS-Transition greift
    slides.forEach(s => s.classList.remove('active', 'prev', 'next'));
    slides[newIdx].classList.add('active');
    if (prevIdx !== newIdx) {
      slides[prevIdx]?.classList.add(newIdx > prevIdx ? 'prev' : 'next');
    }
  };

  // ------- Navigation -------
  const goTo = (idx, user = true) => {
    if (isBusy || !total) return;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    if (idx === currentIndex) return;

    isBusy = true;
    const prev = currentIndex;
    currentIndex = idx;

    // Update
    setSlides(prev, currentIndex);
    setDots();
    preloadAround(currentIndex);

    // Autoplay-Reset bei Benutzeraktion
    if (user) {
      stopAutoplay();
      setTimeout(startAutoplay, 1000);
    }

    setTimeout(() => { isBusy = false; }, TRANSITION_MS);
  };

  const next = () => goTo(currentIndex + 1);
  const prev = () => goTo(currentIndex - 1);

  // ------- Autoplay (nur wenn Section im Viewport) -------
  let visible = true;
  const startAutoplay = () => {
    if (!visible) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoplay();
    autoplayTO = setTimeout(next, AUTOPLAY_MS);
  };
  const stopAutoplay = () => {
    if (autoplayTO) { clearTimeout(autoplayTO); autoplayTO = null; }
  };

  if ('IntersectionObserver' in window) {
    const viv = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? startAutoplay() : stopAutoplay();
    }, { threshold: 0.4 });
    viv.observe(root);
  }

  // ------- Events -------
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  progressDots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  // Keyboard nur, wenn Fokus in der Section ist oder Section sichtbar ist
  document.addEventListener('keydown', (e) => {
    if (!visible) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  });

  // Touch/Swipe
  container.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    tStartX = t.screenX; tStartY = t.screenY;
    stopAutoplay();
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    const t = e.changedTouches[0];
    tEndX = t.screenX; tEndY = t.screenY;
  }, { passive: true });

  container.addEventListener('touchend', () => {
    const dx = tStartX - tEndX;
    const dy = Math.abs(tStartY - tEndY);
    if (Math.abs(dx) > MIN_SWIPE_PX && dy < 100) dx > 0 ? next() : prev();
    startAutoplay();
  }, { passive: true });

  // Mouse Drag (simple)
  let dragging = false, startX = 0;
  container.addEventListener('mousedown', (e) => {
    dragging = true; startX = e.clientX; container.style.cursor = 'grabbing'; stopAutoplay();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > MIN_SWIPE_PX) {
      dragging = false; container.style.cursor = 'grab';
      diff > 0 ? prev() : next();
      startAutoplay();
    }
  });
  document.addEventListener('mouseup', () => {
    if (dragging) { dragging = false; container.style.cursor = 'grab'; startAutoplay(); }
  });

  // Pause bei Hover (Desktop)
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  // ------- Initial -------
  // Preload aktive + Nachbarn
  const firstLazy = slides[0]?.querySelector('img.lazy[data-src]');
  if (firstLazy) loadImg(firstLazy);
  preloadAround(0);
  setDots();
  startAutoplay();

  // Debug für dich
  window._slideshow = { next, prev, goTo, stopAutoplay, startAutoplay };
})();

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.gewerbe-page #slideshow');
  if (!root) return;
  root.querySelectorAll(
    '.swiper-button-next,.swiper-button-prev,.splide__arrow,.glide__arrow,' +
    '.tns-controls,[data-glide-el="controls"],[aria-label="Next"],[aria-label="Previous"],' +
    '[class*="arrow"],[class*="Arrow"],[class*="prev"],[class*="next"]'
  ).forEach(el => el.remove());
});
