// ==========================================
// PV-KONFIGURATOR (Section 4/5) – Scoped, dynamic steps + Make.com
// ==========================================
(() => {
  const root = document.querySelector('.configurator-container');
  if (!root) return;

  // ---- DOM (scoped)
  const form = root.querySelector('#configuratorForm');
  const progressFill = root.querySelector('#progressFill');
  const progressPct = root.querySelector('.progress-percentage');
  const currentStepEl = root.querySelector('#currentStep');
  const totalStepsEl = root.querySelector('#totalSteps');

  // Vorhandene Steps aus HTML
  const step1 = root.querySelector('#step1');
  const step2pv = root.querySelector('#step2pv');
  const step2bf = root.querySelector('#step2bf');

  // Hidden Felder
  const hid = {
    interesse: form.querySelector('#interesse'),
    installationsart: form.querySelector('#installationsart'),
    anlagenart: form.querySelector('#anlagenart'),
    dachform: form.querySelector('#dachform'),
    nutzung: form.querySelector('#nutzung'),
    leistung: form.querySelector('#leistung'),
    timestamp: form.querySelector('#timestamp')
  };
  hid.timestamp.value = new Date().toISOString();

  // ---- State
  const state = {
    interesse: '',
    installationsart: '',
    anlagenart: '',
    dachform: '',
    nutzung: '',
    leistung: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    message: '',
    privacy: false
  };

  // ---- Steps Flow (wird nach Step 1 festgelegt)
  let stepsOrder = []; // Array aus Step-Elementen in Reihenfolge
  const dynamicSteps = {}; // step3, step4, step5 (Success)

  const TOTAL_STEPS = 5;
  totalStepsEl.textContent = String(TOTAL_STEPS);

  // Utilities
  const $ = (s, scope = root) => scope.querySelector(s);
  const $$ = (s, scope = root) => scope.querySelectorAll(s);

  const stripNumber = (val) => {
    if (typeof val !== 'string') return val;
    return val.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  };

  // ---------------------------
  // Rendering dynamischer Steps
  // ---------------------------
  function buildStep3() {
    const el = document.createElement('div');
    el.className = 'step';
    el.id = 'step3';
    el.dataset.step = '3';
    el.innerHTML = `
      <div class="step-card">
        <div class="step-header">
          <span class="step-number">03</span>
          <h2 class="step-title">Ihre Rahmenbedingungen</h2>
          <p class="step-description">Bitte wählen Sie Dachform, Nutzung und eine grobe Leistungsgröße.</p>
        </div>

        <div class="options-grid options-grid-3" data-group="dachform">
          ${optionCard('Flachdach', 'dachform')}
          ${optionCard('Satteldach', 'dachform')}
          ${optionCard('Sheddach', 'dachform')}
        </div>

        <div class="options-grid options-grid-3" data-group="nutzung">
          ${optionCard('Eigenverbrauch', 'nutzung')}
          ${optionCard('Volleinspeisung', 'nutzung')}
          ${optionCard('Mischform', 'nutzung')}
        </div>

        <div class="options-grid options-grid-3" data-group="leistung">
          ${optionCard('bis 100 kWp', 'leistung')}
          ${optionCard('100–500 kWp', 'leistung')}
          ${optionCard('> 500 kWp', 'leistung')}
        </div>

        <div class="step-navigation">
          <button type="button" class="btn-back">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M12 5l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Zurück</span>
          </button>
          <div class="nav-spacer"></div>
          <button type="button" class="btn-submit btn-next-step">
            <span>Weiter</span>
          </button>
        </div>
      </div>
    `;
    return el;
  }

  function buildStep4() {
    const el = document.createElement('div');
    el.className = 'step';
    el.id = 'step4';
    el.dataset.step = '4';
    el.innerHTML = `
      <div class="step-card">
        <div class="step-header">
          <span class="step-number">04</span>
          <h2 class="step-title">Kontaktdaten für Ihre Auswertung</h2>
          <p class="step-description">Wir schicken Ihnen die Erstbewertung und melden uns bei Rückfragen.</p>
        </div>

        <div class="form-grid">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Unternehmen <span class="required">*</span></label>
              <input type="text" class="form-input" name="companyName" id="companyName" required />
            </div>
            <div class="form-group">
              <label class="form-label">Ansprechpartner <span class="required">*</span></label>
              <input type="text" class="form-input" name="contactPerson" id="contactPerson" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">E-Mail <span class="required">*</span></label>
              <input type="email" class="form-input" name="email" id="email" required />
            </div>
            <div class="form-group">
              <label class="form-label">Telefon (optional)</label>
              <input type="tel" class="form-input" name="phone" id="phone" placeholder="z. B. 0821 123456" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Zusätzliche Informationen (optional)</label>
            <textarea class="form-textarea" name="message" id="message" rows="4" placeholder="Besondere Anforderungen oder Fragen?"></textarea>
          </div>

          <div class="checkbox-group" id="privacyGroup">
            <input type="checkbox" id="privacy" />
            <label for="privacy">
              Ich akzeptiere die <a href="/datenschutz" target="_blank" rel="noopener">Datenschutzerklärung</a> und stimme der Kontaktaufnahme zu. <span class="required">*</span>
            </label>
          </div>
          <div class="form-hint">Mit * gekennzeichnete Felder sind Pflichtfelder.</div>
        </div>

        <div class="step-navigation">
          <button type="button" class="btn-back">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M12 5l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Zurück</span>
          </button>
          <div class="nav-spacer"></div>
          <button type="button" class="btn-submit btn-send">
            <span>Analyse anfordern</span>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    return el;
  }

  function buildStep5Success() {
    const el = document.createElement('div');
    el.className = 'step';
    el.id = 'step5';
    el.dataset.step = '5';
    el.innerHTML = `
      <div class="step-card">
        <div class="success-container">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="success-title">Vielen Dank für Ihre Konfiguration!</h2>
          <p class="success-message">
            Wir haben Ihre Angaben erhalten und erstellen Ihre individuelle Ersteinschätzung.
            Sie erhalten diese in Kürze per E-Mail.
          </p>

          <div class="success-features">
            <h3>Das erhalten Sie:</h3>
            <ul>
              <li>Wirtschaftlichkeits-Kurzbewertung</li>
              <li>Empfohlene Anlagengröße & Montageart</li>
              <li>Hinweise zu Förderung & Finanzierung</li>
              <li>Unverbindliche Erstberatung</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    return el;
  }

  function optionCard(label, field) {
    return `
      <button type="button" class="option-card" data-value="${label}" data-field="${field}">
        <div class="option-icon">
          <svg viewBox="0 0 48 48" fill="none">
            <rect x="8" y="14" width="32" height="20" rx="4" stroke="currentColor" stroke-width="2"/>
            <path d="M8 22h32" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="option-content">
          <h3 class="option-title">${label}</h3>
          <p class="option-subtitle">Auswählen</p>
        </div>
        <div class="option-check">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </button>
    `;
  }

  // ---------------------------
  // Step Flow & Navigation
  // ---------------------------
  function initFlow() {
    stepsOrder = [step1]; // Start
    hideAllSteps();
    showStep(step1, 1);
  }

  function decideStep2() {
    // Nach Interesse auswählen, welches Step2 sichtbar wird
    if (state.interesse === 'Photovoltaik') {
      stepsOrder = [step1, step2pv];
    } else {
      stepsOrder = [step1, step2bf];
    }
    // Step3..5 anhängen (einmalig aufbauen)
    if (!dynamicSteps.step3) {
      dynamicSteps.step3 = buildStep3();
      form.appendChild(dynamicSteps.step3);
    }
    if (!dynamicSteps.step4) {
      dynamicSteps.step4 = buildStep4();
      form.appendChild(dynamicSteps.step4);
    }
    if (!dynamicSteps.step5) {
      dynamicSteps.step5 = buildStep5Success();
      form.appendChild(dynamicSteps.step5);
    }
    stepsOrder.push(dynamicSteps.step3, dynamicSteps.step4, dynamicSteps.step5);
  }

  function hideAllSteps() {
    $$('.step', form).forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
      s.style.opacity = '0';
      s.style.transform = 'translateY(20px)';
    });
  }

  function showStep(stepEl, stepIndex) {
    hideAllSteps();
    stepEl.style.display = 'block';
    // kleines Frame für Transition
    requestAnimationFrame(() => {
      stepEl.classList.add('active');
      stepEl.style.opacity = '1';
      stepEl.style.transform = 'translateY(0)';
    });

    currentStepEl.textContent = String(stepIndex);
    const pct = Math.round(((stepIndex - 1) / (TOTAL_STEPS - 1)) * 100);
    progressFill.style.width = pct + '%';
    progressPct.textContent = pct + '%';

    // Back-Button enable/disable
    const backBtn = stepEl.querySelector('.btn-back');
    if (backBtn) {
      backBtn.disabled = (stepIndex === 1);
    }
  }

  function goToIndex(idx) {
    const clamped = Math.max(0, Math.min(idx, stepsOrder.length - 1));
    showStep(stepsOrder[clamped], clamped + 1);
  }

  function currentIndex() {
    const active = $('.step.active', form);
    return stepsOrder.findIndex(s => s === active);
  }

  function goNext() {
    const i = currentIndex();
    if (i < stepsOrder.length - 1) goToIndex(i + 1);
  }

  function goBack() {
    const i = currentIndex();
    if (i > 0) goToIndex(i - 1);
  }

  // ---------------------------
  // Auswahl / Option-Cards
  // ---------------------------
  function handleOptionClick(card) {
    const value = card.getAttribute('data-value');
    const field = card.getAttribute('data-field');
    if (!field || !value) return;

    // Gruppe (siblings im gleichen Container) visuell exklusiv machen
    const group = card.closest('.options-grid');
    if (group) {
      group.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    }

    // State + Hidden
    switch (field) {
      case 'interesse':
        state.interesse = value;
        hid.interesse.value = value;
        // Flow aufbauen & zu Step2 weiter
        decideStep2();
        setTimeout(goNext, 150);
        break;

      case 'installationsart':
        state.installationsart = value;
        hid.installationsart.value = value;
        setTimeout(goNext, 150);
        break;

      case 'anlagenart':
        state.anlagenart = value;
        hid.anlagenart.value = value;
        setTimeout(goNext, 150);
        break;

      case 'dachform':
        state.dachform = value;
        hid.dachform.value = value;
        break;

      case 'nutzung':
        state.nutzung = value;
        hid.nutzung.value = value;
        break;

      case 'leistung':
        state.leistung = value;
        hid.leistung.value = value;
        break;
    }
  }

  // ---------------------------
  // Validierung
  // ---------------------------
  function validateStep3() {
    let ok = true;
    ['dachform', 'nutzung', 'leistung'].forEach(key => {
      const group = form.querySelector(`.options-grid[data-group="${key}"]`);
      const selected = group?.querySelector('.option-card.selected');
      if (!selected) {
        ok = false;
        pulse(group);
      }
    });
    return ok;
  }

  function validateStep4() {
    let ok = true;
    const company = form.querySelector('#companyName');
    const person = form.querySelector('#contactPerson');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const message = form.querySelector('#message');
    const privacy = form.querySelector('#privacy');
    const privacyGroup = form.querySelector('#privacyGroup');

    // Reset
    [company, person, email, phone, message].forEach(i => i && i.classList.remove('error'));
    privacyGroup?.classList.remove('error');

    // Required
    if (!company.value.trim()) { company.classList.add('error'); ok = false; }
    if (!person.value.trim()) { person.classList.add('error'); ok = false; }
    if (!email.value.trim()) { email.classList.add('error'); ok = false; }

    // Email-Check
    if (email.value) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(email.value)) { email.classList.add('error'); ok = false; }
    }

    // Privacy
    if (!privacy.checked) {
      privacyGroup?.classList.add('error');
      ok = false;
    }

    if (!ok) toast('Bitte füllen Sie alle Pflichtfelder korrekt aus.');

    // State übernehmen
    if (ok) {
      state.companyName = company.value.trim();
      state.contactPerson = person.value.trim();
      state.email = email.value.trim();
      state.phone = phone.value.trim();
      state.message = message.value.trim();
      state.privacy = privacy.checked;
    }

    return ok;
  }

  function pulse(el) {
    if (!el) return;
    el.style.transition = 'transform 150ms ease';
    el.style.transform = 'scale(0.98)';
    setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
  }

  function toast(txt) {
    const old = root.querySelector('.validation-message');
    if (old) old.remove();
    const msg = document.createElement('div');
    msg.className = 'validation-message';
    msg.style.cssText = `
      position: fixed; top: 16px; right: 16px; z-index: 10000;
      background:#fee; border:1px solid #fcc; color:#b00020;
      padding:12px 16px; border-radius:10px; font-size:14px;
      box-shadow:0 6px 18px rgba(0,0,0,.12);
    `;
    msg.textContent = txt;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2800);
  }

  // ---------------------------
  // Submit -> Make.com
  // ---------------------------
  async function submitConfigurator(btn) {
    if (!validateStep4()) return;

    const payload = {
      interesse: state.interesse,
      installationsart: state.installationsart,
      anlagenart: state.anlagenart,
      dachform: state.dachform,
      nutzung: state.nutzung,
      leistung: state.leistung,
      companyName: state.companyName,
      contactPerson: state.contactPerson,
      email: state.email,
      phone: state.phone,
      message: state.message,
      privacy: state.privacy ? 'ja' : 'nein',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer || 'Direkt',
      source: 'PV-Konfigurator'
    };

    // UI loading
    btn.classList.add('loading');
    btn.disabled = true;

    const webhook = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';

    // 1) fetch no-cors
    let sent = false;
    try {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      await fetch(webhook, { method: 'POST', body: fd, mode: 'no-cors', keepalive: true });
      sent = true;
    } catch {}

    // 2) Beacon Fallback
    if (!sent && navigator.sendBeacon) {
      try {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => params.append(k, v));
        const blob = new Blob([params.toString()], { type: 'application/x-www-form-urlencoded' });
        sent = navigator.sendBeacon(webhook, blob);
      } catch {}
    }

    // 3) Pixel Fallback
    if (!sent) {
      try {
        const q = new URLSearchParams(payload).toString();
        const img = new Image(1,1);
        img.src = `${webhook}?${q}`;
        sent = true;
      } catch {}
    }

    // Tracking (optional)
    try {
      if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', { value: 1, currency: 'EUR', lead_source: 'PV Configurator' });
      }
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', { value: 1, currency: 'EUR', content_name: 'PV Configurator' });
      }
    } catch {}

    // Success Step
    btn.classList.remove('loading');
    btn.disabled = false;
    goToIndex(stepsOrder.length - 1);
    progressFill.style.width = '100%';
    progressPct.textContent = '100%';
  }

  // ---------------------------
  // Events (delegiert)
  // ---------------------------
  form.setAttribute('novalidate', 'novalidate');

  // Klicks auf Option-Cards
  form.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (card) {
      e.preventDefault();
      handleOptionClick(card);
      return;
    }

    // Back
    const back = e.target.closest('.btn-back');
    if (back) {
      e.preventDefault();
      goBack();
      return;
    }

    // Weiter in Step3
    const next3 = e.target.closest('.btn-next-step');
    if (next3) {
      e.preventDefault();
      if (validateStep3()) goNext();
      else toast('Bitte wählen Sie in allen drei Bereichen eine Option aus.');
      return;
    }

    // Absenden in Step4
    const send = e.target.closest('.btn-send');
    if (send) {
      e.preventDefault();
      submitConfigurator(send);
      return;
    }
  });

  // Keyboard Navigation (links/rechts)
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    // nicht in Inputs/Textareas stören
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;

    if (e.key === 'ArrowLeft') { e.preventDefault(); goBack(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  });

  // ---------------------------
  // Init
  // ---------------------------
  initFlow();

  // Auto-advance zu Step1 sichtbar (ist schon)
  showStep(step1, 1);

  // Falls der User sofort in Step1 klickt, wird Flow festgelegt
  // (passiert in handleOptionClick -> decideStep2)
})();
