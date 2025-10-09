// ALAB Monitoring Professional - Full Interactive JavaScript with Make.com Integration

(function initWhenReady() {
  const init = () => {
    // nur auf der Monitoring-Seite laufen
    const scope = document.getElementById('alab-monitor');
    if (!scope) return;

    console.log('🚀 ALAB Professional Monitoring loaded');

    // ---------------- Swiper: Funktionen ----------------
    if (window.Swiper && scope.querySelector('.functions-swiper')) {
      new Swiper('.functions-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: { rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: false },
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: {
          // wichtig: auf diesen Swiper scopen
          el: '.functions-swiper .swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.functions-swiper .swiper-button-next',
          prevEl: '.functions-swiper .swiper-button-prev'
        },
        breakpoints: {
          320: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024:{ slidesPerView: 3, spaceBetween: 40 }
        }
      });
    }

    // ---------------- Swiper: Cases ----------------
    if (window.Swiper && scope.querySelector('.cases-swiper')) {
      new Swiper('.cases-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 1,
        coverflowEffect: { rotate: 30, stretch: 0, depth: 150, modifier: 1, slideShadows: false },
        loop: false,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.cases-swiper .swiper-pagination', clickable: true },
        navigation: {
          nextEl: '.cases-swiper .swiper-button-next',
          prevEl: '.cases-swiper .swiper-button-prev'
        },
        breakpoints: {
          320: { slidesPerView: 1,   spaceBetween: 20 },
          768: { slidesPerView: 1,   spaceBetween: 30 },
          1024:{ slidesPerView: 1.5, spaceBetween: 40 }
        }
      });
    }

    // ---------------- KPI Counter ----------------
    const animateValue = (element, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const hasDecimal = (element.getAttribute('data-value') || '').includes('.');
        element.textContent = hasDecimal
          ? (progress * (end - start) + start).toFixed(1)
          : Math.floor(progress * (end - start) + start);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const kpiObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const target = entry.target;
            const endValue = parseFloat(target.getAttribute('data-value') || '0') || 0;
            animateValue(target, 0, endValue, 2000);
            target.classList.add('animated');
          }
        });
      });
      scope.querySelectorAll('.kpi-number').forEach(kpi => kpiObserver.observe(kpi));
    }

    // ---------------- FAQ Accordion ----------------
    const faqItems = scope.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(faq => {
          faq.classList.remove('active');
          const icon = faq.querySelector('.faq-question i');
          if (icon) icon.style.transform = 'rotate(0)';
        });
        if (!isActive) {
          item.classList.add('active');
          const icon = question.querySelector('i');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    });

    // ---------------- Navigation Active State ----------------
    const sections = scope.querySelectorAll('section');
    const navLinks = scope.querySelectorAll('.nav-link');

    function updateActiveNav() {
      let currentSection = '';
      sections.forEach(section => {
        const top = section.offsetTop;
        if (window.scrollY >= top - 200) currentSection = section.id || '';
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
      });
    }

    window.addEventListener('scroll', updateActiveNav);
    document.addEventListener('updateNav', updateActiveNav); // Debounce-Event (siehe unten)
    updateActiveNav();

    // Smooth Scroll
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = (link.getAttribute('href') || '').slice(1);
        const target = targetId && document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // ---------------- CTA-Handler (Modal) ----------------
    const navCta = scope.querySelector('.nav-cta');
    if (navCta) {
      navCta.addEventListener('click', (e) => { e.preventDefault(); showContactModal(); });
    }
    scope.querySelectorAll('.btn-primary').forEach(btn =>
      btn.addEventListener('click', (e) => { e.preventDefault(); showContactModal(); })
    );
    scope.querySelectorAll('.package-btn').forEach(btn =>
      btn.addEventListener('click', (e) => { e.preventDefault(); showContactModal(); })
    );

    // ---------------- Modal + Make.com Webhook ----------------
       function showContactModal() {
  // Modal-Overlay erzeugen
  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Modal schließen">&times;</button>
      <h2>Monitoring anfragen</h2>

      <form class="contact-form" id="contactForm" novalidate>
        <div class="field">
          <input type="text" name="name" placeholder="Name *" required>
          <div class="err">Bitte Namen angeben.</div>
        </div>

        <div class="field">
          <input type="email" name="email" placeholder="E-Mail *" required>
          <div class="err">Bitte gültige E-Mail angeben.</div>
        </div>

        <div class="field">
          <input type="tel" name="phone" placeholder="Telefon *" required>
          <div class="err">Bitte Telefonnummer angeben.</div>
        </div>

        <div class="field">
          <input type="text" name="power" placeholder="Anlagenleistung (kWp) *" required>
          <div class="err">Bitte Anlagenleistung angeben.</div>
        </div>

        <div class="field">
          <textarea name="message" placeholder="Ihre Nachricht (optional)" rows="4"></textarea>
        </div>

        <div class="field" style="margin-top:6px">
          <label class="consent">
            <input type="checkbox" name="consent" required>
            <span>Ich stimme der Kontaktaufnahme zur Angebotserstellung zu und habe die
              <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a> gelesen.*</span>
          </label>
          <div class="err">Bitte zustimmen.</div>
        </div>

        <!-- Honeypot -->
        <div style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
          <label>Ihre Website</label>
          <input type="text" name="website" tabindex="-1" autocomplete="off">
        </div>

        <button type="submit" class="btn-submit">Anfrage senden</button>
      </form>

      <div class="success-animation" id="successAnimation" style="display:none;">
        <div class="success-checkmark">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#d4af37" stroke-width="2"/>
            <path fill="none" stroke="#d4af37" stroke-width="3" d="M14 27l8 8 16-16"/>
          </svg>
        </div>
        <h3>Erfolgreich gesendet!</h3>
        <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Zusatz-Styles (Fehlerzustände etc.)
  const style = document.createElement('style');
  style.textContent = `
  .contact-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;animation:fadeIn .3s}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  .modal-overlay{position:absolute;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(5px)}
  .modal-content{position:relative;background:#fff;padding:32px;border-radius:20px;max-width:560px;width:92%;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:slideIn .3s}
  @keyframes slideIn{from{transform:translateY(-50px);opacity:0}to{transform:translateY(0);opacity:1}}
  .modal-close{position:absolute;top:18px;right:18px;background:none;border:0;font-size:30px;cursor:pointer;color:#999}
  .modal-content h2{margin-bottom:18px;color:#0f2533;font-size:28px;font-weight:800}

  /* Form-Layout: „kürzere“ Blöcke via gleichen Rand links/rechts */
  .contact-form{display:grid;gap:14px;margin:0}
  .contact-form .field{margin:0 10px}                       /* links/rechts Rand */
  .field input,.field textarea{
    width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:10px;
    font-family:Montserrat,system-ui,sans-serif;font-size:14px
  }
  .field input:focus,.field textarea:focus{
    outline:none;border-color:#d4af37;box-shadow:0 0 0 2px rgba(212,175,55,.15)
  }
  .field.has-error input,.field.has-error textarea{border-color:#ef4444;background:#fef2f2}
  .err{display:none;color:#dc2626;font-size:12px;margin:6px 2px 0}
  .field.has-error .err{display:block}

  /* DSGVO-Zeile hübsch neben dem Kästchen */
  .contact-form .field .consent{display:flex;gap:12px;align-items:flex-start;margin:2px 10px 0}
  .contact-form .field .consent input{width:18px;height:18px;flex:0 0 auto;margin-top:2px}
  .contact-form .field .consent span{
    font-size:16px;line-height:1.5;color:#0f2533
  }
  .contact-form .field .consent a{
    color:#0f2533;text-decoration:underline
  }

  /* Button mit gleichem Rand links/rechts wie Felder */
  .btn-submit{
    width:calc(100% - 20px);        /* 2×10px wie .field */
    margin:6px 10px 0;
    background:linear-gradient(135deg,#d4af37 0%,#c49d2f 100%);
    color:#fff;border:0;padding:14px 32px;border-radius:10px;font-weight:600;cursor:pointer;transition:transform .2s
  }
  .btn-submit:hover{transform:translateY(-2px)}
  .btn-submit:disabled{opacity:.6;cursor:not-allowed}

  /* Success-Animation (unverändert) */
  .success-animation{text-align:center;padding:40px}
  .success-checkmark{width:80px;height:80px;margin:0 auto 20px}
  .success-checkmark circle{stroke-dasharray:166;stroke-dashoffset:166;animation:strokeA .6s .3s ease forwards}
  .success-checkmark path{stroke-dasharray:48;stroke-dashoffset:48;animation:strokeA .4s .9s ease forwards}
  @keyframes strokeA{to{stroke-dashoffset:0}}
  .success-animation h3{color:#d4af37;font-size:24px;margin-bottom:10px}
  .success-animation p{color:#666;font-size:16px}
`;

  document.head.appendChild(style);

  // schließen
  modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
  modal.querySelector('.modal-overlay').addEventListener('click', () => modal.remove());

  // === Validierung wie auf den anderen Seiten ===
  const form = modal.querySelector('#contactForm');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const mark = (el, bad) => {
    const wrap = el.closest('.field');
    if (wrap) wrap.classList.toggle('has-error', bad);
  };

  const validateField = (el) => {
    if (el.name === 'website') return true; // Honeypot
    let ok = true;
    const v = (el.value || '').trim();

    if (el.type === 'checkbox') {
      ok = el.checked;
    } else if (el.hasAttribute('required')) {
      ok = v !== '';
      if (ok && el.type === 'email') ok = emailRe.test(v);
      if (ok && el.name === 'phone') ok = v.replace(/\D/g,'').length >= 6; // einfache Tel-Prüfung
    }

    mark(el, !ok);
    return ok;
  };

  // live-Feedback
  form.addEventListener('input', (e) => {
    if (e.target.matches('input,textarea')) validateField(e.target);
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot?
    if ((form.website?.value || '').trim() !== '') return;

    const fields = [...form.querySelectorAll('input,textarea')];
    let allOk = true;
    fields.forEach(el => { if (!validateField(el)) allOk = false; });
    if (!allOk) return;

    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet…';

    const data = Object.fromEntries(new FormData(form));

    try {
      await fetch('https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, timestamp: new Date().toISOString(), source: 'ALAB Monitoring Website' })
      });

      form.style.display = 'none';
      modal.querySelector('#successAnimation').style.display = 'block';
      setTimeout(() => modal.remove(), 3000);
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Anfrage senden';
      alert('Senden fehlgeschlagen – bitte erneut versuchen.');
    }
  });
}

    // ---------------- Parallax ----------------
    window.addEventListener('scroll', () => {
      const parallax = scope.querySelector('.hero-bg');
      if (!parallax) return;
      const scrolled = window.pageYOffset || document.documentElement.scrollTop || 0;
      parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    });

    // ---------------- 3D Tilt für Karten ----------------
    scope.querySelectorAll('.kpi-card-3d, .package-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const cx = rect.width / 2, cy = rect.height / 2;
        const rx = (y - cy) / 10, ry = (cx - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });

    // ---------------- Partikel ----------------
    scope.querySelectorAll('.particle').forEach((particle, i) => {
      particle.style.animationDuration = `${20 + i * 5}s`;
      particle.style.left = `${Math.random() * 100}%`;
    });

    console.log('✅ All features initialized successfully!');
  };

function scrollToId(id, offset = 80) { // offset ~ Höhe des Headers
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  document.querySelectorAll('.btn-secondary').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToId('faq', 80); // ggf. Offset anpassen, falls Header höher/tiefer ist
  });
});
})();

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Debounce-getriggerte Aktualisierung der Nav
window.addEventListener('scroll', debounce(() => {
  document.dispatchEvent(new Event('updateNav'));
}, 100));
