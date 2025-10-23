

(() => {
  const root = document.getElementById('heroCarousel');
  if (!root) return;

  // Scope-Selektoren (keine globalen Side-Effects)
  const track       = root.querySelector('#carouselTrack');
  const slides      = Array.from(root.querySelectorAll('.carousel-slide'));
  const indicators  = Array.from(root.querySelectorAll('.carousel-indicators .indicator'));

  // State
  let index = Math.max(0, slides.findIndex(s => s.classList.contains('active')));
  if (index === -1) index = 0;

  const AUTOPLAY_MS = 6500;
  const SWIPE_THRESHOLD = 48; // px
  let autoplayTimer = null;
  let userInteracted = false;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helpers
  const clampIndex = (i) => (i + slides.length) % slides.length;

  function setActive(i) {
    index = clampIndex(i);

    slides.forEach((s, idx) => {
      if (idx === index) {
        s.classList.add('active');
        s.removeAttribute('aria-hidden');
      } else {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
      }
    });

    indicators.forEach((btn, idx) => {
      const isActive = idx === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // Preload: aktuelles + nächstes Bild/Background
    preloadSlide(index);
    preloadSlide(index + 1);
  }

  function next() { setActive(index + 1); }
  function prev() { setActive(index - 1); }

  function startAutoplay() {
    if (prefersReduced) return; // respektiere Nutzerpräferenz
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      if (!userInteracted) next();
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function pauseTemporarily(ms = AUTOPLAY_MS * 1.2) {
    userInteracted = true;
    stopAutoplay();
    // nach kurzer Inaktivität wieder starten
    window.clearTimeout(pauseTemporarily._t);
    pauseTemporarily._t = window.setTimeout(() => {
      userInteracted = false;
      startAutoplay();
    }, ms);
  }

  // Preload-Funktion (img src oder CSS background-image url)
  function preloadSlide(iRaw) {
    const i = clampIndex(iRaw);
    const slide = slides[i];
    if (!slide) return;

    const bg = slide.querySelector('.slide-background');
    if (!bg) return;

    // <img> Variante
    const img = bg.querySelector('img');
    if (img && img.dataset.__preloaded !== '1') {
      const src = img.currentSrc || img.src;
      if (src) {
        const im = new Image();
        im.src = src;
        img.dataset.__preloaded = '1';
      }
      return; // img deckt ab
    }

    // CSS background-image Variante
    const style = bg.getAttribute('style') || '';
    const match = style.match(/url\(['"]?([^'")]+)['"]?\)/i);
    if (match && match[1] && !bg.dataset.__preloaded) {
      const im = new Image();
      im.src = match[1];
      bg.dataset.__preloaded = '1';
    }
  }

  // Indikatoren-Klick
  indicators.forEach((btn, idx) => {
    btn.setAttribute('role', 'button');
    btn.addEventListener('click', () => {
      pauseTemporarily();
      setActive(idx);
    });
  });

  // Hover pausiert Autoplay
  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', () => {
    if (!userInteracted) startAutoplay();
  });

  // Keyboard (nur wenn Fokus im Carousel-Bereich ist)
  document.addEventListener('keydown', (e) => {
    const isLeft = e.key === 'ArrowLeft';
    const isRight = e.key === 'ArrowRight';
    if (!isLeft && !isRight) return;

    // Fokusprüfung: nur reagieren, wenn der User im Hero interagiert
    const activeEl = document.activeElement;
    const inScope = root.contains(activeEl) || activeEl === document.body;
    if (!inScope) return;

    e.preventDefault();
    pauseTemporarily();
    if (isLeft) prev();
    if (isRight) next();
  });

  // Touch/Swipe
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;

  root.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchActive = true;
  }, { passive: true });

  root.addEventListener('touchmove', (e) => {
    if (!touchActive) return;
    // wenn vertikal stark gescrollt wird, nicht wischen
    const t = e.touches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dy) > Math.abs(dx)) return; // vertikal -> ignorieren
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      pauseTemporarily();
      touchActive = false;
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  root.addEventListener('touchend', () => {
    touchActive = false;
  });

  // Pause wenn Tab nicht sichtbar
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else if (!userInteracted) startAutoplay();
  });

  // Initialisierung
  slides.forEach((s, i) => {
    s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
  });
  setActive(index);
  startAutoplay();

  /* ============================
     Video-Modal (leichtgewichtig)
     – Buttons: .btn-secondary[data-video]
     – Falls value eine URL ist, wird sie eingebettet
     – Sonst Platzhaltertext
     ============================ */
  const videoButtons = Array.from(root.querySelectorAll('[data-video]'));
  if (videoButtons.length) {
    // Modal einmalig anlegen
    const modal = document.createElement('div');
    modal.id = 'alabVideoModal';
    modal.setAttribute('aria-hidden', 'true');
    Object.assign(modal.style, {
      position: 'fixed',
      inset: '0',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      zIndex: '9999',
      padding: '24px'
    });

    const inner = document.createElement('div');
    Object.assign(inner.style, {
      width: 'min(960px, 92vw)',
      aspectRatio: '16 / 9',
      background: '#000',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,.35)',
      position: 'relative'
    });

    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Schließen');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '8px',
      right: '12px',
      fontSize: '28px',
      color: '#fff',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      lineHeight: '1'
    });

    const frameWrap = document.createElement('div');
    Object.assign(frameWrap.style, {
      width: '100%',
      height: '100%'
    });

    inner.appendChild(closeBtn);
    inner.appendChild(frameWrap);
    modal.appendChild(inner);
    document.body.appendChild(modal);

    function openVideo(src) {
      stopAutoplay();
      userInteracted = true;

      // Content vorbereiten
      frameWrap.innerHTML = '';
      let contentEl;

      // Wenn URL -> iframe
      const isURL = /^https?:\/\//i.test(src || '');
      if (isURL) {
        contentEl = document.createElement('iframe');
        contentEl.src = src;
        contentEl.allow =
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        contentEl.allowFullscreen = true;
        Object.assign(contentEl.style, { width: '100%', height: '100%', border: '0' });
      } else {
        // Placeholder (kannst du gegen ein lokales MP4 ersetzen)
        contentEl = document.createElement('div');
        contentEl.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font:600 18px/1.2 Inter,system-ui,sans-serif;';
        contentEl.textContent = 'Video wird vorbereitet…';
      }
      frameWrap.appendChild(contentEl);

      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      frameWrap.innerHTML = '';
      document.body.style.overflow = '';
      // Autoplay erst nach kurzer Zeit wieder aufnehmen
      pauseTemporarily(4000);
    }

    closeBtn.addEventListener('click', closeVideo);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeVideo(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display !== 'none') closeVideo(); });

    videoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-video') || '';
        openVideo(src);
      });
    });
  }

  // Optional: Expose minimale API (falls du später kontrollieren willst)
  root.__alabCarousel = {
    next, prev, goTo: (i) => setActive(i), pause: stopAutoplay, play: startAutoplay, get index() { return index; }
  };
})();

