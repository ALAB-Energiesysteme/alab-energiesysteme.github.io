// ==========================================
// SECTION 6: WHY ALAB - Robust, scoped, no-native-validation
// ==========================================
class WhyAlabSection {
  constructor() {
    // Webhook
    this.webhookUrl = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';

    // Root & Modal
    this.modal = document.getElementById('whyContactModal');
    this.openBtn = document.getElementById('openWhyContact');

    // WICHTIG: ab hier ALLES im Modal scopen -> keine Kollisionen mit anderen Sections
    this.closeBtn = this.modal?.querySelector('#closeWhyModal');
    this.closeSuccessBtn = this.modal?.querySelector('#closeWhySuccess');
    this.contactForm = this.modal?.querySelector('#whyContactForm');
    this.formStep = this.modal?.querySelector('#formStep');
    this.successStep = this.modal?.querySelector('#successStep');

    // Felder (nur im Modal suchen)
    this.fields = {
      firma: this.modal?.querySelector('#firma'),
      strasse: this.modal?.querySelector('#strasse'),
      hausnr: this.modal?.querySelector('#hausnr'),
      plz: this.modal?.querySelector('#plz'),
      ort: this.modal?.querySelector('#ort'),
      tel: this.modal?.querySelector('#tel'),
      email: this.modal?.querySelector('#email'),
      privacy: this.modal?.querySelector('#privacyWhy'),
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initAnimations();
    this.initStatsCounter();

    // Native HTML5-Validation deaktivieren, damit unser Submit-Handler IMMER läuft
    this.contactForm?.setAttribute('novalidate', 'novalidate');

    // PLZ live auf 5 Ziffern begrenzen
    this.fields.plz?.addEventListener('input', () => {
      this.fields.plz.value = this.fields.plz.value.replace(/\D/g, '').slice(0, 5);
    });

    console.log('✅ Why ALAB Section ready');
  }

  // ---------------- Event Listeners ----------------
  setupEventListeners() {
    // Modal öffnen
    this.openBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openModal();
    });

    // Schließen (X & Erfolg-Button)
    this.closeBtn?.addEventListener('click', () => this.closeModal());
    this.closeSuccessBtn?.addEventListener('click', () => this.closeModal());

    // Backdrop-Klick schließt (wirklich auf die dunkle Fläche reagieren)
    this.modal?.addEventListener('click', (e) => {
      if (e.target.classList?.contains('modal-backdrop')) {
        this.closeModal();
      }
    });

    // ESC schließt
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Submit
    this.contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Live-Validierung
    Object.values(this.fields).forEach((field) => {
      if (!field) return;
      const evt = field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(evt, () => this.validateField(field));
      field.addEventListener('blur', () => this.validateField(field));
    });
  }

  // ---------------- Modal ----------------
  openModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.resetForm();
    this.formStep.classList.add('active');
    this.successStep.classList.remove('active');
    setTimeout(() => this.fields.firma?.focus(), 200);
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => this.resetForm(), 300);
  }

  resetForm() {
    this.contactForm?.reset();
    Object.values(this.fields).forEach((f) => f?.classList.remove('error'));
    // Checkbox-Fehlerrahmen entfernen
    this.fields.privacy?.closest('.checkbox-group')?.classList.remove('error');
  }

  // ---------------- Validation ----------------
  validateField(field) {
    if (!field) return true;

    let ok = true;

    // Pflicht
    if (field.hasAttribute('required')) {
      ok = field.type === 'checkbox' ? field.checked : field.value.trim() !== '';
    }

    // Email
    if (ok && field.type === 'email' && field.value.trim()) {
      ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    }

    // PLZ
    if (ok && field.id === 'plz' && field.value.trim()) {
      ok = /^\d{5}$/.test(field.value.trim());
    }

    // Visuelles Feedback
    if (field.type === 'checkbox') {
      const group = field.closest('.checkbox-group');
      group?.classList.toggle('error', !ok);
    } else {
      field.classList.toggle('error', !ok);
    }

    return ok;
  }

  validateForm() {
    let ok = true;
    Object.values(this.fields).forEach((f) => {
      if (!this.validateField(f)) ok = false;
    });
    // Fokus auf erstes fehlerhaftes Feld
    const firstError =
      this.modal.querySelector('.form-group input.error') ||
      this.modal.querySelector('.checkbox-group.error input[type="checkbox"]');
    if (!ok && firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  // ---------------- Submit ----------------
  async handleSubmit() {
    if (!this.validateForm()) return;

    const btn = this.contactForm.querySelector('.submit-button');
    btn.classList.add('loading');
    btn.disabled = true;

    const payload = this.collectFormData();

    try {
      await this.sendToWebhook(payload);
      this.trackConversion(payload);
      this.showSuccess();
    } catch (err) {
      console.warn('Webhook (no-cors) – weiter mit Success:', err);
      this.showSuccess();
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

collectFormData() {
  const data = {
    kontakt: {
      firma: this.fields.firma?.value.trim() || '',
      strasse: this.fields.strasse?.value.trim() || '',
      hausnr: this.fields.hausnr?.value.trim() || '',
      plz: this.fields.plz?.value.trim() || '',
      ort: this.fields.ort?.value.trim() || '',
      tel: this.fields.tel?.value.trim() || '',
      email: this.fields.email?.value.trim() || ''
    },
    dsAccepted: this.fields.privacy?.checked || false,
    // <- EINDEUTIGE QUELLE BEHALTEN:
    origin: 'Abschnitt 6 – Warum – Alab',
    // Optional weiter behalten:
    referrer: document.referrer || '',
    submittedAt: new Date().toISOString()
  };
  return data;
}


async sendToWebhook(data) {
  const formData = new FormData();

  // Einzelne Kontaktfelder
  const k = data.kontakt || {};
  ['firma','strasse','hausnr','plz','ort','tel','email'].forEach(key => {
    formData.append(key, k[key] || '');
  });

  // Pflichtangaben & Meta
  formData.append('dsAccepted', data.dsAccepted ? 'WAHR' : 'FALSCH');
  formData.append('origin', data.origin);     // <- "Quelle"
  if (data.referrer) formData.append('referrer', data.referrer);
  formData.append('submittedAt', data.submittedAt);

  // KEIN json, KEIN page_url, KEIN user_agent
  try {
    await fetch(this.webhookUrl, { method: 'POST', body: formData, keepalive: true, mode: 'no-cors' });
    return true;
  } catch (e) {
    console.error('Fetch error:', e);
  }

  // Fallback (optional)
  try {
    if (navigator.sendBeacon) {
      const plain = {
        ...k,
        dsAccepted: data.dsAccepted ? 'WAHR' : 'FALSCH',
        origin: data.origin,
        referrer: data.referrer,
        submittedAt: data.submittedAt
      };
      const ok = navigator.sendBeacon(this.webhookUrl, new Blob([new URLSearchParams(plain)], { type: 'application/x-www-form-urlencoded' }));
      if (ok) return true;
    }
  } catch (e) {
    console.error('Beacon error:', e);
  }

  return false;
}


  showSuccess() {
    this.formStep.classList.remove('active');
    this.successStep.classList.add('active');
    this.modal.querySelector('.modal-content').scrollTop = 0;
  }

  // ---------------- Tracking ----------------
  trackConversion() {
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', { currency: 'EUR', value: 1, lead_source: 'Why ALAB Section' });
      }
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { value: 1, currency: 'EUR', content_name: 'Why ALAB Lead' });
      }
    } catch {}
  }

  // ---------------- Stats Counter ----------------
  initStatsCounter() {
    const grid = document.querySelector('.stats-grid');
    if (!grid) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            this.animateStats();
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(grid);
  }

  animateStats() {
    document.querySelectorAll('.stat-number').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      if (!Number.isFinite(target)) return;
      const duration = 1600;
      const steps = Math.ceil(duration / 16);
      const inc = target / steps;
      let cur = 0, i = 0;
      const tick = () => {
        i++;
        cur = Math.min(target, cur + inc);
        el.textContent = Math.floor(cur);
        if (i < steps) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ---------------- Simple scroll-in animations ----------------
  initAnimations() {
    const cards = document.querySelectorAll('.feature-card');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.style.opacity = '1';
            en.target.style.transform = 'translateY(0)';
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    cards.forEach((c, idx) => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(40px)';
      c.style.transition = `opacity .8s ease ${idx * 0.1}s, transform .8s ease ${idx * 0.1}s`;
      io.observe(c);
    });
  }
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => (window.whyAlabSection = new WhyAlabSection()));
} else {
  window.whyAlabSection = new WhyAlabSection();
}
