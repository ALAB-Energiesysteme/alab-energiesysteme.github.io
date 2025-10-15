// Läuft nur auf der Landing – alles auf #gewerbe-landing gescoped
(() => {
  const root = document.getElementById('gewerbe-landing');
  if (!root) return;

  // Shortcuts
  const $  = (sel) => root.querySelector(sel);
  const $$ = (sel) => root.querySelectorAll(sel);

  // DOM-Refs (nur innerhalb des Roots suchen)
  const elements = {
    // Modal
    modal: $('#contactModal'),
    modalBackdrop: $('.modal-backdrop'),
    openModalBtn: $('#openCalculator'),
    closeModalBtn: $('#closeModal'),
    closeSuccessBtn: $('#closeSuccess'),

    // Form
    contactForm: $('#contactForm'),
    formStep1: $('#step1'),
    successStep: $('#successStep'),

    // Sonstiges
    scrollBtn: $('#scrollToInfo'),
    savingsCounter: $('#savingsCounter'),

    // Felder
    fields: {
      firstName: $('#firstName'),
      lastName:  $('#lastName'),
      company:   $('#company'),
      email:     $('#email'),
      phone:     $('#phone'),
      consumption: $('#consumption'),
      roofArea:    $('#roofArea'),
      message:     $('#message'),
      privacy:     $('#privacy')
    }
  };

  /* ===========================
     Modal
  =========================== */
  class ModalManager {
    constructor() { this.isOpen = false; this.init(); }

    init() {
      elements.openModalBtn?.addEventListener('click', () => this.open());
      elements.closeModalBtn?.addEventListener('click', () => this.close());
      elements.modalBackdrop?.addEventListener('click', () => this.close());
      elements.closeSuccessBtn?.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
    }

    open() {
      elements.modal?.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      this.resetForm();
      setTimeout(() => elements.fields.firstName?.focus(), 280);
    }

    close() {
      elements.modal?.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    }

    resetForm() {
      elements.formStep1?.classList.add('active');
      elements.successStep?.classList.remove('active');
      elements.contactForm?.reset();
      Object.values(elements.fields).forEach(f => f?.classList.remove('error'));
      // evtl. Fehlermeldung entfernen
      root.querySelector('.error-message')?.remove();
    }
  }

  /* ===========================
     Formular
  =========================== */
  class FormHandler {
    constructor() {
      this.webhookUrl = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';
      this.init();
    }

    init() {
      elements.contactForm?.addEventListener('submit', (e) => this.handleSubmit(e));
      elements.fields.email?.addEventListener('blur', () => this.validateEmail());
      elements.fields.phone?.addEventListener('blur', () => this.validatePhone());
    }

    validateEmail() {
      const emailEl = elements.fields.email;
      if (!emailEl) return true;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
      emailEl.classList.toggle('error', !!emailEl.value && !ok);
      return ok;
    }

    validatePhone() {
      const phoneEl = elements.fields.phone;
      if (!phoneEl) return true;
      const ok = /^[\d\s\-+()]+$/.test(phoneEl.value.trim()) && phoneEl.value.replace(/\D/g,'').length >= 10;
      phoneEl.classList.toggle('error', !!phoneEl.value && !ok);
      return ok;
    }

    validateForm() {
      let ok = true;
      const req = ['firstName','lastName','company','email','phone'];

      req.forEach(name => {
        const el = elements.fields[name];
        const filled = !!el?.value.trim();
        el?.classList.toggle('error', !filled);
        ok = ok && filled;
      });

      ok = this.validateEmail() && ok;
      ok = this.validatePhone() && ok;

      if (!elements.fields.privacy?.checked) ok = false;

      return ok;
    }

    async handleSubmit(e) {
      e.preventDefault();
      if (!this.validateForm()) { this.showErrorMessage(); return; }

      const submitBtn = elements.contactForm.querySelector('.btn-submit');
      const oldHtml   = submitBtn?.innerHTML;
      if (submitBtn) { submitBtn.innerHTML = '<span>Wird gesendet…</span>'; submitBtn.disabled = true; }

      const data = this.prepareFormData();

      try {
        await this.sendToWebhook(data);
        this.trackConversion(data);
        this.showSuccess();
      } catch (err) {
        console.error('Webhook-Fehler', err);
        // Nutzerfreundlich: trotzdem Success anzeigen
        this.showSuccess();
      } finally {
        if (submitBtn) { submitBtn.innerHTML = oldHtml; submitBtn.disabled = false; }
      }
    }

    prepareFormData() {
      const f = elements.fields;
      return {
        vorname:        f.firstName?.value.trim() || '',
        nachname:       f.lastName?.value.trim()  || '',
        firma:          f.company?.value.trim()   || '',
        email:          f.email?.value.trim()     || '',
        telefon:        f.phone?.value.trim()     || '',
        stromverbrauch: f.consumption?.value.trim() || '',
        dachflaeche:    f.roofArea?.value.trim()    || '',
        nachricht:      f.message?.value.trim()     || '',
        zeitstempel:    new Date().toISOString(),
        seite:          window.location.href,
        referrer:       document.referrer || 'Direkt',
        herkunft:       'Gewerbliche Lösungen – Landing'
      };
    }

    sendToWebhook(data) {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      return fetch(this.webhookUrl, { method: 'POST', body: fd, mode: 'no-cors' });
    }

    trackConversion() {
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { currency: 'EUR', value: 45000, lead_source: 'PV Gewerbe Landing' });
      }
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', { value: 45000, currency: 'EUR', content_name: 'PV Gewerbe Anfrage' });
      }
      try {
        window.parent?.postMessage({ type: 'pvBusinessFormSubmitted' }, '*');
      } catch {}
    }

    showSuccess() {
      elements.formStep1?.classList.remove('active');
      elements.successStep?.classList.add('active');
    }

    showErrorMessage() {
      root.querySelector('.error-message')?.remove();
      const div = document.createElement('div');
      div.className = 'error-message';
      div.style.cssText = 'background:#fee;border:1px solid #fcc;color:#c00;padding:12px;border-radius:8px;margin-bottom:16px;font-size:14px;';
      div.textContent = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
      elements.contactForm?.insertBefore(div, elements.contactForm.firstChild);
      setTimeout(() => div.remove(), 5000);
    }
  }

  /* ===========================
     Smooth Scroll
  =========================== */
  class SmoothScroll {
    constructor(){ this.init(); }
    init() {
      elements.scrollBtn?.addEventListener('click', () => {
        const tgt = $('#benefits');
        tgt?.scrollIntoView({ behavior:'smooth', block:'start' });
      });
      // Nur Anker innerhalb des Roots
      $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id || id === '#') return;
          const t = $(id);
          if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
        });
      });
    }
  }

  /* ===========================
     Zahl-Animation (Ersparnis)
  =========================== */
  class NumberCounter {
    constructor(){ this.run(); this.observeCards(); }

    run() {
      const el = elements.savingsCounter;
      if (!el) return;
      const target = 45000;
      const duration = 1800;
      const steps = 60;
      const inc = target / steps;
      let i = 0;
      const t = setInterval(() => {
        i++;
        const val = Math.min(Math.round(i * inc), target);
        el.textContent = val.toLocaleString('de-DE');
        if (i >= steps) clearInterval(t);
      }, duration / steps);
    }

    observeCards() {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('animated');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });

      $$('.benefit-card').forEach((card, idx) => {
        card.style.animationDelay = `${idx * 100}ms`;
        io.observe(card);
      });
    }
  }

  /* ===========================
     App Bootstrap
  =========================== */
  class App {
    constructor(){
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }
    init(){
      this.modal  = new ModalManager();
      this.form   = new FormHandler();
      this.scroll = new SmoothScroll();
      this.counter= new NumberCounter();

      // kleine Perf-Optimierung: Lazyload für Bilder mit data-src
      const imgs = $$('img[data-src]');
      if ('IntersectionObserver' in window) {
        const imgIO = new IntersectionObserver((ents) => {
          ents.forEach(ent => {
            if (ent.isIntersecting) {
              const img = ent.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imgIO.unobserve(img);
            }
          });
        });
        imgs.forEach(img => imgIO.observe(img));
      } else {
        imgs.forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
      }
    }
  }

  // Start
  const app = new App();
  window.PV_Gewerbe = app; // optional für Debug
})();
