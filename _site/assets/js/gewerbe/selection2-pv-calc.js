// Läuft nur innerhalb der Section 2 (gewerbliche Lösungen – Calculator)
(() => {
  const root = document.getElementById('pv-calc');
  if (!root) return;

  // Hilfs-Selectoren, immer relativ zu #pv-calc
  const $  = (s) => root.querySelector(s);
  const $$ = (s) => root.querySelectorAll(s);

  // DOM Elemente (scoped)
  const elements = {
    // Modal
    modal: $('#calculatorModal'),
    openBtn: $('#startCalculation'),
    closeBtn: $('#closeCalculator'),
    backdrop: $('#calculatorModal .modal-backdrop'),

    // Form
    form: $('#calculatorForm'),
    steps: $$('.form-step'),
    progressFill: $('#progressFill'),

    // Metrics / Chart
    metricNumbers: $$('.number[data-target]'),
    chartCanvas: $('#savingsChart'),

    // Felder, die wir formatieren/validieren
    email: $('#email'),
    phone: $('#phone'),
    zip:   $('#zipCode')
  };

  // ============= Modal-Logik =============
  class CalculatorModal {
    constructor(){
      this.currentStep = 1;
      this.totalSteps  = 3;
      this.isOpen = false;
      this.init();
    }

    init(){
      elements.openBtn?.addEventListener('click', () => this.open());
      elements.closeBtn?.addEventListener('click', () => this.close());
      elements.backdrop?.addEventListener('click', () => this.close());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });
      elements.form?.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    open(){
      elements.modal?.classList.add('active');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      this.resetForm();
      this.showStep(1);
    }

    close(){
      elements.modal?.classList.remove('active');
      this.isOpen = false;
      document.body.style.overflow = '';
    }

    resetForm(){
      elements.form?.reset();
      this.currentStep = 1;
      this.updateProgress();
      // Fehlerklassen entfernen
      elements.steps.forEach(step => {
        step.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      });
    }

    showStep(stepNumber){
      elements.steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === stepNumber - 1);
      });
      this.currentStep = stepNumber;
      this.updateProgress();

      // erstes Feld im Step fokussieren
      const firstInput = $(`#step${stepNumber} input, #step${stepNumber} textarea`);
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    updateProgress(){
      const pct = (this.currentStep / this.totalSteps) * 100;
      if (elements.progressFill) elements.progressFill.style.width = `${pct}%`;
    }

    validateCurrentStep(){
      const stepEl = $(`#step${this.currentStep}`);
      if (!stepEl) return true;

      const required = stepEl.querySelectorAll('[required]');
      let ok = true;

      required.forEach(field => {
        const val = (field.value || '').trim();
        const type = (field.getAttribute('type') || '').toLowerCase();
        let valid = !!val;

        // E-Mail
        if (valid && type === 'email') {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        // PLZ (DE)
        if (valid && field.id === 'zipCode') {
          valid = /^\d{5}$/.test(val);
        }

        field.classList.toggle('error', !valid);
        if (!valid) ok = false;
      });

      return ok;
    }

    collectFormData(){
      const fd = new FormData(elements.form);
      const data = {};
      fd.forEach((v, k) => (data[k] = v));

      data.timestamp = new Date().toISOString();
      data.source    = 'PV-Wirtschaftlichkeits-Check';
      data.url       = window.location.href;
      data.referrer  = document.referrer || 'Direkt';
      return data;
    }

    async sendData(data){
      const url = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));
      return fetch(url, { method: 'POST', body: fd, mode: 'no-cors' });
    }

    trackConversion(data){
      const val = parseFloat(data.annualConsumption) * 0.35 || 50000;
      if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
          currency: 'EUR',
          value: val,
          lead_source: 'PV Calculator'
        });
      }
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          currency: 'EUR',
          value: val,
          content_name: 'PV Wirtschaftlichkeits-Check'
        });
      }
      try {
        window.parent.postMessage({ type: 'pvCalculatorSubmitted', data }, '*');
      } catch {}
    }

    async handleSubmit(e){
      e.preventDefault();
      if (!this.validateCurrentStep()) {
        showValidationMessage();
        return;
      }

      const btn = elements.form.querySelector('.btn-submit');
      const orig = btn?.innerHTML;
      if (btn){ btn.innerHTML = '<span>Wird gesendet…</span>'; btn.disabled = true; }

      const data = this.collectFormData();
      try {
        await this.sendData(data);
        this.trackConversion(data);
        this.showStep(4); // Success
        if (elements.progressFill) elements.progressFill.style.width = '100%';
      } catch (err) {
        console.error('Submission error:', err);
        this.showStep(4);
        if (elements.progressFill) elements.progressFill.style.width = '100%';
      } finally {
        if (btn){ btn.innerHTML = orig; btn.disabled = false; }
      }
    }
  }

  // ============= Step-Navigation (für inline onclick im HTML) =============
  const modalInstance = new CalculatorModal();
  window.calculatorInstance = modalInstance;

  window.nextStep = function(current){
    if (!modalInstance.validateCurrentStep()){
      showValidationMessage();
      return;
    }
    modalInstance.showStep(current + 1);
  };
  window.previousStep = function(current){
    modalInstance.showStep(current - 1);
  };
  window.closeModal = function(){
    modalInstance.close();
  };

  function showValidationMessage(){
    const old = document.querySelector('.validation-message');
    if (old) old.remove();
    const msg = document.createElement('div');
    msg.className = 'validation-message';
    msg.style.cssText = `
      position:fixed;top:20px;right:20px;z-index:10000;
      background:#fee;border:1px solid #fcc;color:#c00;
      padding:12px 20px;border-radius:8px;font-size:14px;
      animation:calcSlideIn .3s ease;
    `;
    msg.textContent = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  }

  // ============= Zahl-Animationen =============
  class NumberCounter {
    constructor(){
      this.done = false;
      this.observe();
    }
    observe(){
      const grid = $('.metrics-grid');
      if (!grid) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !this.done){
            this.run();
            this.done = true;
          }
        });
      }, { threshold: .5 });
      io.observe(grid);
    }
    run(){
      elements.metricNumbers.forEach(el => this.animate(el));
    }
    animate(el){
      const target = parseFloat(el.dataset.target);
      const duration = 2000, steps = 60;
      const stepMs = duration / steps;
      const isDecimal = target % 1 !== 0;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const cur = Math.min(target, (target / steps) * step);
        el.textContent = isDecimal ? cur.toFixed(1) : Math.round(cur).toLocaleString('de-DE');
        if (step >= steps) clearInterval(timer);
      }, stepMs);
    }
  }
  new NumberCounter();

  // ============= Chart (Chart.js) =============
  class SavingsChart {
    constructor(){
      this.chart = null;
      this.init();
    }
    async ensureChartJs(){
      if (window.Chart) return;
      // Fallback: nachladen, falls Chart.js nicht über base.njk kam
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    async init(){
      if (!elements.chartCanvas) return;
      await this.ensureChartJs();

      const ctx = elements.chartCanvas.getContext('2d');
      const grad = ctx.createLinearGradient(0,0,0,200);
      grad.addColorStop(0, '#E5C44D');
      grad.addColorStop(1, '#F3D663');

      this.chart = new Chart(ctx, {
        type:'bar',
        data:{
          labels:['Jahr 1','Jahr 5','Jahr 10','Jahr 15','Jahr 20','Jahr 25'],
          datasets:[{
            label:'Kumulierte Ersparnis',
            data:[45000,250000,550000,900000,1350000,1850000],
            backgroundColor: grad,
            borderColor:'#E6C23C',
            borderWidth:2,
            borderRadius:8,
            barThickness:30
          }]
        },
        options:{
          responsive:true,
          maintainAspectRatio:false,
          plugins:{ legend:{ display:false },
            tooltip:{
              backgroundColor:'rgba(26,29,36,.9)',
              padding:12, cornerRadius:8,
              titleFont:{ size:14, weight:'600' },
              bodyFont:{ size:13 },
              callbacks:{
                label(c){ return 'Ersparnis: € ' + c.parsed.y.toLocaleString('de-DE'); }
              }
            }
          },
          scales:{
            y:{
              beginAtZero:true,
              grid:{ color:'rgba(0,0,0,.05)' },
              ticks:{
                callback(v){
                  if (v >= 1_000_000) return '€ ' + (v/1_000_000).toFixed(1) + ' Mio';
                  if (v >= 1000)      return '€ ' + (v/1000) + 'k';
                  return '€ ' + v;
                },
                font:{ size:11 },
                color:'#718096'
              }
            },
            x:{
              grid:{ display:false },
              ticks:{ font:{ size:11, weight:'600' }, color:'#4a5568' }
            }
          }
        }
      });
    }
  }
  new SavingsChart();

  // ============= UI-Details (Ripple + Parallax) =============
  (function animations(){
    // Ripple auf Buttons in dieser Section
    $$('.btn-calculate, .btn-submit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top  - size/2;
        r.style.cssText = `
          position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
          border-radius:50%;background:rgba(255,255,255,.5);pointer-events:none;
          animation:calcRipple .6s ease-out;
        `;
        btn.appendChild(r);
        setTimeout(() => r.remove(), 600);
      });
    });

    // leichter Parallax-Effekt nur für Cards dieser Section
    const cards = $$('.metric-card');
    if (!cards.length) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      cards.forEach((el, i) => {
        const speed = 0.5 + i * 0.1;
        el.style.transform = `translateY(${-(scrolled * speed)}px)`;
      });
    });

    // Keyframes nur einmal einfügen
    if (!document.getElementById('pv-calc-keyframes')) {
      const style = document.createElement('style');
      style.id = 'pv-calc-keyframes';
      style.textContent = `
        @keyframes calcRipple { from { transform:scale(0); opacity:1 } to { transform:scale(4); opacity:0 } }
        @keyframes calcSlideIn { from { transform:translateX(100%); opacity:0 } to { transform:translateX(0); opacity:1 } }
      `;
      document.head.appendChild(style);
    }
  })();

  // ============= Eingabe-Verbesserungen (scoped) =============
  (function formEnhancements(){
    // Zahleneingaben hübsch formatieren (nur in diesem Modal)
    $$('#step2 input[type="number"]').forEach(input => {
      input.addEventListener('blur', function(){
        if (!this.value) return;
        const num = parseFloat(this.value.toString().replace(/\./g, '').replace(',', '.'));
        if (!isNaN(num)) this.value = num.toLocaleString('de-DE');
      });
      input.addEventListener('focus', function(){
        if (!this.value) return;
        this.value = this.value.toString().replace(/\./g, '').replace(',', '.');
      });
    });

    // Telefon grob formatieren
    elements.phone?.addEventListener('input', function(){
      let v = this.value.replace(/\D/g,'');
      if (!v) return this.value = '';
      if (v.length <= 4) this.value = v;
      else if (v.length <= 7) this.value = v.slice(0,4) + ' ' + v.slice(4);
      else this.value = v.slice(0,4) + ' ' + v.slice(4,7) + ' ' + v.slice(7,11);
    });

    // E-Mail Live-Check
    elements.email?.addEventListener('blur', function(){
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
      this.classList.toggle('error', !!this.value && !ok);
      const nxt = this.nextElementSibling;
      if (!ok && this.value && (!nxt || !nxt.classList || !nxt.classList.contains('error-message'))){
        this.insertAdjacentHTML('afterend',
          '<span class="error-message" style="color:#f56565;font-size:12px;">Bitte geben Sie eine gültige E-Mail-Adresse ein.</span>');
      } else if (ok && nxt && nxt.classList.contains('error-message')){
        nxt.remove();
      }
    });

    // PLZ nur Ziffern, max 5
    elements.zip?.addEventListener('input', function(){
      this.value = this.value.replace(/\D/g,'').slice(0,5);
    });
  })();

  // Deep-Link (#rechner | #calculator) => Modal öffnen
  if (['#rechner', '#calculator'].includes(window.location.hash)) {
    setTimeout(() => modalInstance.open(), 400);
  }
})();
