/**
 * ALAB Energiesysteme - Über Uns Section JavaScript
 * Lazy Loading, Scroll-Animationen und Performance-Optimierungen
 * Optimiert für SEO und maximale Performance
 */

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
  initLazyLoading();
  initScrollAnimations();
  initImageHoverEffect();
  initSmoothScroll();
  initPerformanceOptimizations();
});

// ===================================================================
// Lazy Loading für Bilder - Optimiert
// ===================================================================
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.lazy-image[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            // Fade-in Animation während Bild lädt
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease-in-out';
            
            // Lade das Bild
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = src;
              img.removeAttribute('data-src');
              img.style.opacity = '1';
              img.classList.add('loaded');
            };
            tempImg.onerror = () => {
              console.warn('Fehler beim Laden des Bildes:', src);
              // Fallback: Zeige Platzhalter
              img.style.opacity = '0.5';
            };
            tempImg.src = src;
            
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback für ältere Browser
    lazyImages.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }
}

// ===================================================================
// Scroll-Animationen - Erweitert
// ===================================================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-aos]');
  
  if (animatedElements.length === 0) return;
  
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Verzögerung aus data-aos-delay Attribut
        const delay = entry.target.getAttribute('data-aos-delay');
        
        if (delay) {
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, parseInt(delay));
        } else {
          entry.target.classList.add('aos-animate');
        }
        
        // Optional: Element nur einmal animieren
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(element => observer.observe(element));
}

// ===================================================================
// Bild Hover-Effekt mit Mouse-Tracking
// ===================================================================
function initImageHoverEffect() {
  const imageWrapper = document.querySelector('.circular-image-wrapper');
  const image = document.querySelector('.circular-image');
  
  if (!imageWrapper || !image) return;
  
  imageWrapper.addEventListener('mousemove', (e) => {
    const rect = imageWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (x - centerX) / 20;
    const moveY = (y - centerY) / 20;
    
    image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`;
  });
  
  imageWrapper.addEventListener('mouseleave', () => {
    image.style.transform = 'translate(0, 0) scale(1)';
  });
}

// ===================================================================
// Smooth Scroll für interne Links
// ===================================================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || !href) return;
      
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        if (history.pushState) {
          history.pushState(null, null, href);
        }
      }
    });
  });
}

// ===================================================================
// Performance-Optimierungen
// ===================================================================
function initPerformanceOptimizations() {
  // 1. Reduziere Animationen bei schwacher Performance
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-aos]').forEach(el => {
      el.removeAttribute('data-aos');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
  
  // 2. Pausiere Animationen wenn Tab nicht aktiv
  document.addEventListener('visibilitychange', () => {
    const decorations = document.querySelectorAll('.image-decorations, .decoration-ring, .dot');
    decorations.forEach(el => {
      el.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
  });
  
  // 3. Debounce für Scroll-Events
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
      handleScrollEffects();
    });
  }, { passive: true });
  
  // 4. Preload kritische Ressourcen
  if ('connection' in navigator && navigator.connection.effectiveType === '4g') {
    const img = new Image();
    img.src = document.querySelector('.lazy-image')?.getAttribute('data-src') || '';
  }
}

// ===================================================================
// Scroll-Effekte (z.B. Parallax, Fade)
// ===================================================================
function handleScrollEffects() {
  const scrollPosition = window.pageYOffset;
  const section = document.querySelector('.about-section');
  
  if (!section) return;
  
  const sectionTop = section.offsetTop;
  const sectionHeight = section.offsetHeight;
  const windowHeight = window.innerHeight;
  
  // Nur wenn Section im Viewport
  if (scrollPosition + windowHeight > sectionTop && scrollPosition < sectionTop + sectionHeight) {
    const progress = (scrollPosition + windowHeight - sectionTop) / (sectionHeight + windowHeight);
    
    // Subtile Parallax-Effekte
    const decorations = document.querySelector('.image-decorations');
    if (decorations) {
      const moveY = progress * 20;
      decorations.style.transform = `translateY(${moveY}px)`;
    }
  }
}

// ===================================================================
// Resource Hints - Prefetch für bessere Performance
// ===================================================================
(function() {
  // Prefetch wichtige Links
  const importantLinks = [
    'https://www.alabenergiesysteme.de/kontakt',
    'https://www.alabenergiesysteme.de/leistungen'
  ];
  
  importantLinks.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
})();

// ===================================================================
// Performance Monitoring (optional - nur Development)
// ===================================================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      console.log('%c ALAB Energiesysteme ', 'background: #E6C23C; color: #0e2a3b; font-weight: bold; padding: 5px 10px;');
      console.log('✓ Über uns Section geladen');
      console.log(`⏱️ Ladezeit: ${pageLoadTime}ms`);
      console.log(`📊 Bilder: ${document.querySelectorAll('img').length}`);
    }
  });
}

// ===================================================================
// Web Vitals Tracking (optional)
// ===================================================================
function reportWebVitals() {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
    });
    
    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser unterstützt LCP nicht
    }
  }
}
