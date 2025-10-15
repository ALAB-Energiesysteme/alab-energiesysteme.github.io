// ==========================================
// PV-CALC (Section 2) – Scoped, with success + Make.com mapping
// ==========================================
(() => {
  // ---- Root scoping: arbeitet NUR innerhalb der Calculator-Section/Modal
  const section = document.querySelector('.calculator-section');
  const modal = document.getElementById('calculatorModal');
  if (!section || !modal) return;

  const $m = (sel) => modal.querySelector(sel);
  const $$m = (sel) => modal.querySelectorAll(sel);

// ---- SCOPED ELEMENTS (nur für Section 2 / PV-Calc) ----
const calcRoot = document.getElementById('calculatorModal');

const elements = {
  // Modal
  modal: calcRoot,
  openBtn: document.getElementById('startCalculation'),
  closeBtn: calcRoot?.querySelector('#closeCalculator'),
  backdrop: calcRoot?.querySelector('.modal-backdrop'),

  // Form
  form: calcRoot?.querySelector('#calculatorForm'),
  steps: calcRoot ? calcRoot.querySelectorAll('.form-step') : [],
  progressFill: calcRoot?.querySelector('#progressFill'),

  // Felder, die in beiden Sections gleich heißen -> IMMER scoped suchen!
  get privacy() { return calcRoot?.querySelector('#privacy'); },
  get successStep() { return calcRoot?.querySelector('#successStep'); },

  // Rest außerhalb des Modals darf global bleiben
  metricNumbers: document.querySelectorAll('.number[data-target]'),
  chartCanvas: document.getElementById('savingsChart')
};

  // ---------- Utils ----------
  const stripNumber = (val) => {
    if (typeof val !== 'string') return val;
    // wandelt "1.234,5" -> "1234.5"
    const clean = val.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    return clean;
  };

  const toInt = (v) => {
    const n = parseFloat(stripNumber(v));
    return Number.isFinite(n) ? Math.round(n) : '';
    };
  const toFloat = (v) => {
    const n = parseFloat(stripNumber(v));
    return Number.isFinite(n) ? n : '';
  };

  // ---------- Modal / Wizard ----------
  class CalculatorModal {
    constructor() {
      this.currentStep = 1;
      this.totalSteps = 3; // 3 Eingabeschritte, Success ist #4
      this.isOpen = false;
      this.init();
    }

    init() {
     elements.openBtn?.addEventListener('click', () => this.open());
  elements.closeBtn?.addEventListener('click', () => this.close());
  elements.backdrop?.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

 // Form: native Validierung aus, damit Submit-Handler IMMER feuert
  elements.form?.setAttribute('novalidate', 'novalidate');
      // Form submit
      elements.form?.addEventListener('submit', (e) => this.handleSubmit(e));

      // Step-Navigation Buttons (delegiert)
      elements.form.addEventListener('click', (e) => {
        const nextBtn = e.target.closest('.btn-next');
        const backBtn = e.target.closest('.btn-back');
        if (nextBtn) this.goNext();
        if (backBtn) this.goBack();
      });

      // Externe Close-Aktion auf Success
      modal.addEventListener('click', (e) => {
        if (e.target.closest('.btn-close-modal')) this.close();
      });
    }

    open() {
      modal.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      this.reset();
      this.show(1);
    }

    close() {
      modal.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    }

    reset() {
      elements.form.reset();
      // Fehlerzustände entfernen
      elements.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      this.currentStep = 1;
      this.updateProgress();
    }

    show(stepNumber) {
      elements.steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === stepNumber - 1);
      });
      this.currentStep = stepNumber;
      this.updateProgress();
      // Fokus auf erstes Feld im aktuellen Step
      const currentEl = elements.form.querySelector(`#step${stepNumber}`) || elements.form.querySelector('#successStep');
      const firstInput = currentEl?.querySelector('input, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 60);
    }

    updateProgress() {
      const p = (this.currentStep / this.totalSteps) * 100;
      if (elements.progressFill) elements.progressFill.style.width = `${p}%`;
    }

    goNext() {
      if (!this.validateCurrentStep()) {
        this.flashValidation();
        return;
      }
      if (this.currentStep < this.totalSteps) this.show(this.currentStep + 1);
    }

    goBack() {
      if (this.currentStep > 1) this.show(this.currentStep - 1);
    }

    flashValidation() {
      // kleiner Toast oben rechts
      const old = document.querySelector('.validation-message');
      if (old) old.remove();
      const msg = document.createElement('div');
      msg.className = 'validation-message';
      msg.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background:#fee; border:1px solid #fcc; color:#b00020;
        padding:12px 16px; border-radius:10px; font-size:14px;
        box-shadow:0 6px 18px rgba(0,0,0,.12);
      `;
      msg.textContent = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 3000);
    }

    validateCurrentStep() {
      const stepEl = elements.form.querySelector(`#step${this.currentStep}`);
      const required = stepEl?.querySelectorAll('[required]') || [];
      let ok = true;

      required.forEach((field) => {
        const v = (field.type === 'checkbox') ? field.checked : field.value.trim();
        const valid = (field.type === 'checkbox') ? !!v : !!v;
        if (!valid) { field.classList.add('error'); ok = false; }
        else field.classList.remove('error');

        // spezielle Checks
        if (field.type === 'email' && v) {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(field.value)) { field.classList.add('error'); ok = false; }
        }
        if (field.id === 'zipCode' && v) {
          if (!/^\d{5}$/.test(field.value.replace(/\D/g, ''))) { field.classList.add('error'); ok = false; }
        }
      });

      return ok;
    }

    collectFormData() {
      const fd = new FormData(elements.form);
      // in ein Objekt
      const data = {};
      fd.forEach((val, key) => { data[key] = String(val); });

      // Metadaten
      data.timestamp = new Date().toISOString();
      data.source = 'PV-Wirtschaftlichkeits-Check';
      data.url = window.location.href;
      data.referrer = document.referrer || 'Direkt';

      // Zahlen normalisieren
      data.annualConsumption = toInt(data.annualConsumption);
      data.roofArea = toInt(data.roofArea);
      data.currentPrice = toFloat(data.currentPrice);

      // Checkbox normalisieren
      data.privacy = elements.form.querySelector('#privacy')?.checked ? 'ja' : 'nein';

      return data;
    }

    // Mapping auf Make.com Keys (an dein Szenario angepasst)
    mapToMake(data) {
      return {
        firma: data.companyName || '',
        strasse: data.street || '',
        hausnummer: data.houseNumber || '',
        plz: data.zipCode || '',
        stadt: data.city || '',
        jahresverbrauch_kwh: data.annualConsumption || '',
        dachflaeche_m2: data.roofArea || '',
        strompreis_ct_kwh: data.currentPrice || '',
        ansprechpartner: data.contactPerson || '',
        position: data.position || '',
        email: data.email || '',
        telefon: data.phone || '',
        nachricht: data.message || '',
        privacy: data.privacy || 'nein',
        quelle: data.source,
        url: data.url,
        referrer: data.referrer,
        zeitstempel: data.timestamp
      };
    }

    async sendData(data) {
  const url = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';

  // 1) fetch (no-cors) – Standardweg
  try {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    await fetch(url, { method: 'POST', body: fd, mode: 'no-cors', keepalive: true });
    return true;
  } catch (e) {
    console.warn('fetch no-cors fehlgeschlagen, versuche Fallbacks…', e);
  }

  // 2) sendBeacon – funktioniert auch beim Schließen/Navigieren
  try {
    if (navigator.sendBeacon) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([k, v]) => params.append(k, String(v)));
      const blob = new Blob([params.toString()], { type: 'application/x-www-form-urlencoded' });
      if (navigator.sendBeacon(url, blob)) return true;
    }
  } catch (e) {
    console.warn('sendBeacon fehlgeschlagen', e);
  }

  // 3) 1×1-Pixel-Bild – letzter Notnagel
  try {
    const q = new URLSearchParams(data).toString();
    const img = new Image(1, 1);
    img.src = `${url}?${q}`;
    return true;
  } catch (e) {
    console.warn('Image-Fallback fehlgeschlagen', e);
  }

  return false;
}

async handleSubmit(e) {
  e.preventDefault();

  // aktuelle Step-Validierung
  if (!this.validateCurrentStep()) {
    showValidationMessage();
    return;
  }

  // WICHTIG: privacy IMMER im eigenen Modal prüfen (keine Section-1-Kollision)
  const privacy = elements.privacy;
  if (privacy && !privacy.checked) {
    showValidationMessage();
    privacy.focus();
    return;
  }

  const submitBtn = elements.form.querySelector('.btn-submit');
  const originalHTML = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Wird gesendet…</span>';
  submitBtn.disabled = true;

  // Formdaten einsammeln
  const fd = new FormData(elements.form);
  const data = {};
  fd.forEach((v, k) => (data[k] = v));
  data.timestamp = new Date().toISOString();
  data.source = 'PV-Wirtschaftlichkeits-Check';
  data.url = window.location.href;
  data.referrer = document.referrer || 'Direkt';

  try {
    await this.sendData(data); // Webhook feuern (siehe Patch 4)
  } catch (err) {
    console.warn('Webhook-Fehler:', err);
    // wir zeigen trotzdem den Erfolgsschritt (gute UX)
  } finally {
    this.showSuccess(); // IMMER im eigenen Modal
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;
  }
    }

    showSuccess() {
      // Success-Step ist das 4. .form-step
      this.show(4);
      if (elements.progressFill) elements.progressFill.style.width = '100%';
    }
  }

  // ---------- Number Counters ----------
  class NumberCounter {
    constructor() {
      this.animated = false;
      this.observe();
    }
    observe() {
      const grid = section.querySelector('.metrics-grid');
      if (!grid) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !this.animated) {
            this.animateAll();
            this.animated = true;
          }
        });
      }, { threshold: 0.5 });
      io.observe(grid);
    }
    animateAll() {
      elements.metricNumbers.forEach((el) => this.animate(el));
    }
    animate(el) {
      const target = parseFloat(el.dataset.target);
      if (!Number.isFinite(target)) return;
      const duration = 1800, steps = 60;
      const inc = target / steps;
      let cur = 0, step = 0;
      const dec = (target % 1 !== 0);
      const t = setInterval(() => {
        step++;
        cur = Math.min(inc * step, target);
        el.textContent = dec ? cur.toFixed(1) : Math.round(cur).toLocaleString('de-DE');
        if (step >= steps) clearInterval(t);
      }, duration / steps);
    }
  }

  // ---------- Chart (optional; unverändert falls vorhanden) ----------
  class SavingsChart {
    constructor() {
      if (!elements.chartCanvas || typeof Chart === 'undefined') return;
      const ctx = elements.chartCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, '#E5C44D');
      gradient.addColorStop(1, '#F3D663');

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jahr 1','Jahr 5','Jahr 10','Jahr 15','Jahr 20','Jahr 25'],
          datasets: [{
            label: 'Kumulierte Ersparnis',
            data: [45000, 250000, 550000, 900000, 1350000, 1850000],
            backgroundColor: gradient,
            borderColor: '#E6C23C',
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 30
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,.06)' },
              ticks: {
                callback: (v) => {
                  if (v >= 1_000_000) return '€ ' + (v/1_000_000).toFixed(1) + ' Mio';
                  if (v >= 1000) return '€ ' + (v/1000) + 'k';
                  return '€ ' + v;
                },
                font: { size: 11 }, color: '#718096'
              }
            },
            x: { grid: { display: false }, ticks: { font: { size: 11, weight:'600' }, color:'#4a5568' } }
          }
        }
      });
    }
  }

  // ---------- Form Enhancements (scoped) ----------
  class FormEnhancements {
    constructor() {
      this.init();
    }
    init() {
      // Nur Inputs IM Formular
      elements.form.querySelectorAll('input[type="number"]').forEach((input) => {
        input.addEventListener('blur', function () {
          if (!this.value) return;
          const n = toFloat(this.value);
          if (Number.isFinite(n)) this.value = n.toLocaleString('de-DE');
        });
        input.addEventListener('focus', function () {
          if (!this.value) return;
          this.value = stripNumber(this.value);
        });
      });

      const email = elements.form.querySelector('#email');
      if (email) {
        email.addEventListener('blur', function () {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const msg = this.nextElementSibling?.classList.contains('error-message') ? this.nextElementSibling : null;
          if (this.value && !re.test(this.value)) {
            this.classList.add('error');
            if (!msg) this.insertAdjacentHTML('afterend','<span class="error-message" style="color:#f56565;font-size:12px;">Bitte geben Sie eine gültige E-Mail-Adresse ein.</span>');
          } else {
            this.classList.remove('error');
            if (msg) msg.remove();
          }
        });
      }

      const zip = elements.form.querySelector('#zipCode');
      if (zip) {
        zip.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g,'').slice(0,5);
        });
      }
    }
  }

  // ---------- Boot ----------
  const app = {
    modal: new CalculatorModal(),
    counter: new NumberCounter(),
    chart: new SavingsChart(),
    enh: new FormEnhancements()
  };

  // Deep Link (#rechner | #calculator)
  if (['#rechner', '#calculator'].includes(window.location.hash)) {
    setTimeout(() => app.modal.open(), 300);
  }

  // für Debug
  window.PVCalculatorApp = app;
})();
