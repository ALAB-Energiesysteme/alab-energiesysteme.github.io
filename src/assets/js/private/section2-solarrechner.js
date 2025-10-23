(() => {
  'use strict';

  // ===== Helpers =====
  const NF0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const NF1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const NF2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n) => NF0.format(Math.round(n));
  const fmt1  = (n) => NF1.format(n);
  const fmt2  = (n) => NF2.format(n);
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  // ===== Elements =====
  const elStromkosten = $('#stromkosten');
  const elStrompreis  = $('#strompreis');
  const elFlaeche     = $('#dachflaeche');
  const elModule      = $('#pvModule');
  const elBtnMinus    = $('#btnMinus');
  const elBtnPlus     = $('#btnPlus');
  const elSpeicher    = $('#speicher');

  const elErzeugung   = $('#erzeugung');
  const elCO2         = $('#co2ersparnis');
  const elNetzbezug   = $('#netzbezug');
  const elSpeicherN   = $('#speichernutzung');
  const elHausv       = $('#hausverbrauch');

  const elErsparnis   = $('#ersparnis');
  const elEinspeisung = $('#einspeisung');
  const elAmort       = $('#amort');
  const elGewinn30    = $('#gesamtgewinn');
  const elMonGewinn   = $('#monatlichGewinn');

  // ===== Lightbox (Kontakt) =====
  const lb = $('#contactLightbox');
  const lbOpen = $('#cta-open');
  const lbClose = $('#lightbox-close');

  function fitLightbox(){
    if (window.innerWidth > 640) { resetLightboxScale(); return; }
    const box = lb?.querySelector('.lightbox-container');
    if (!box) return;
    box.style.transformOrigin = 'top center';
    box.style.transform = '';
    const avail = (window.visualViewport ? window.visualViewport.height : window.innerHeight) - 20;
    const rectH = box.getBoundingClientRect().height;
    const scale = Math.min(1, avail / rectH);
    if (scale < 1){ box.style.transform = `scale(${scale})`; box.style.margin = '10px auto'; }
    else { box.style.margin = 'auto'; }
  }
  function resetLightboxScale(){
    const box = lb?.querySelector('.lightbox-container');
    if (!box) return;
    box.style.transform = '';
    box.style.margin = '';
  }
  const openLB = () => { lb.classList.add('active'); document.documentElement.style.overflow = 'hidden'; requestAnimationFrame(fitLightbox); };
  const closeLB = () => { lb.classList.remove('active'); document.documentElement.style.overflow = ''; resetLightboxScale(); };

  lbOpen?.addEventListener('click', openLB, { passive: true });
  lbClose?.addEventListener('click', closeLB);
  lb?.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  window.addEventListener('resize', () => { if (lb.classList.contains('active')) fitLightbox(); });
  if (window.visualViewport){ window.visualViewport.addEventListener('resize', () => { if (lb.classList.contains('active')) fitLightbox(); }); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });

  // ===== Danke-Banner =====
  function ensureThanks() {
    let el = document.getElementById('alab-thanks');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'alab-thanks';
    el.setAttribute('role','alertdialog');
    el.innerHTML = `
      <span class="check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <span class="msg">Vielen Dank! Wir melden uns in Kürze.</span>
      <button class="close" aria-label="Schließen">✕</button>
    `;
    document.body.appendChild(el);
    el.querySelector('.close')?.addEventListener('click', () => el.classList.remove('show'));
    return el;
  }
  function showThanks(){ const el = ensureThanks(); el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 4000); }

  // ===== Calculator (vereinfachte Annahmen) =====
  const moduleKWp = 0.455;
  const kWhPerKWp = 950;
  const co2KgPerKWh = 0.4;
  const feedInEUR = 0.08;
  const investPerKWp = 1200;

  function maxModuleByArea() {
    const fl = clamp(parseFloat(String(elFlaeche.value ?? '').replace(',', '.')) || 0, 0, 1000);
    const byArea = Math.floor(fl / 2);
    return clamp(byArea, 1, 200);
  }
  function updateModuleClamp(dir = 0) {
    const maxByArea = maxModuleByArea();
    let current = parseInt(elModule.value || '1', 10);
    if (Number.isFinite(dir) && dir !== 0) current += dir;
    current = clamp(current, 1, maxByArea);
    elModule.value = String(current);
  }

  let rafPending = false;
  const scheduleRecalc = () => { if (rafPending) return; rafPending = true; requestAnimationFrame(() => { rafPending = false; recalc(); }); };

  elBtnMinus?.addEventListener('click', () => { updateModuleClamp(-1); scheduleRecalc(); });
  elBtnPlus?.addEventListener('click',  () => { updateModuleClamp(+1); scheduleRecalc(); });
  elModule?.addEventListener('input',   () => { updateModuleClamp(0);  scheduleRecalc(); });
  elFlaeche?.addEventListener('input',  () => { updateModuleClamp(0);  scheduleRecalc(); });
  [elStromkosten, elStrompreis, elSpeicher].forEach((el) => el?.addEventListener('input', scheduleRecalc));

  function recalc() {
    const sv = (x) => String(x ?? '').replace(',', '.');
    const stromkosten = Math.max(0, parseFloat(sv(elStromkosten.value)) || 0);
    const strompreis  = clamp(parseFloat(sv(elStrompreis.value)) || 0.35, 0.15, 0.80);
    const module      = parseInt(sv(elModule.value) || '1', 10);
    const withBattery = !!elSpeicher.checked;

    const jahresverbrauch = (stromkosten * 12) / (strompreis || 0.35);
    const kWp = module * moduleKWp;
    const erzeugung = kWp * kWhPerKWp;

    const svQuote = withBattery ? 0.55 : 0.35;
    const selbstverbrauch = Math.min(erzeugung * svQuote, jahresverbrauch);
    const ueberschuss = Math.max(0, erzeugung - selbstverbrauch);
    const netzbezug = Math.max(0, jahresverbrauch - selbstverbrauch);
    const speichernutzung = withBattery ? Math.min(ueberschuss * 0.6, jahresverbrauch * 0.3) : 0;

    const ersparnisEUR = selbstverbrauch * strompreis;
    const einspeiseEUR = ueberschuss * feedInEUR;
    const cashflowJahr = ersparnisEUR + einspeiseEUR;

    const invest = kWp * investPerKWp;
    const amortJahre = cashflowJahr > 0 ? invest / cashflowJahr : Infinity;

    const gewinn30 = cashflowJahr * 30 - invest;
    const monatGew = gewinn30 / (30 * 12);
    const co2kg = erzeugung * co2KgPerKWh;

    elErzeugung.textContent = `${fmtInt(erzeugung)} kWh`;
    elCO2.textContent       = `${fmtInt(co2kg)} kg`;
    elNetzbezug.textContent = `${fmtInt(netzbezug)} kWh`;
    elSpeicherN.textContent = `${fmtInt(speichernutzung)} kWh`;
    elHausv.textContent     = `${fmtInt(jahresverbrauch)} kWh`;

    elErsparnis.textContent   = `${fmt2(ersparnisEUR)} € / Jahr`;
    elEinspeisung.textContent = `${fmt2(einspeiseEUR)} € / Jahr`;
    elAmort.textContent       = Number.isFinite(amortJahre) ? `${fmt1(amortJahre)} Jahre` : '–';
    elGewinn30.textContent    = `${fmtInt(gewinn30)} €`;
    elMonGewinn.textContent   = `${fmt2(monatGew)} €`;
  }

  // Init
  updateModuleClamp(0);
  scheduleRecalc();

  // ===== Lead-Form =====
  (() => {
    const formEl = document.querySelector('#leadForm');
    if (!formEl) return;

    // Honeypot
    const hp = document.createElement('input');
    hp.type = 'text'; hp.name = 'hp_website'; hp.autocomplete = 'off'; hp.tabIndex = -1; hp.setAttribute('aria-hidden','true');
    Object.assign(hp.style, { position:'absolute', left:'-10000px', width:'1px', height:'1px', overflow:'hidden' });
    formEl.appendChild(hp);

    // DSGVO (mit Link)
    const consentWrap = document.createElement('div');
    consentWrap.className = 'form-field';
    const consentId = 'consent_dsgvo';
    const PRIVACY_URL = 'https://www.alabenergiesysteme.de/datenschutz/';
    consentWrap.innerHTML = `
      <label for="${consentId}" class="consent-label" style="display:flex;gap:8px;align-items:flex-start">
        <input type="checkbox" id="${consentId}" name="consent" required />
        <span>Ich habe die <a href="${PRIVACY_URL}" class="privacy-link" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.</span>
      </label>`;
    consentWrap.addEventListener('click', (e) => { if (e.target.closest('a')) e.stopPropagation(); });
    const submitBtn = formEl.querySelector('button[type="submit"]');
    submitBtn?.parentNode?.insertBefore(consentWrap, submitBtn);

    // Transport
    const MAKE_URL = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';
    const QUEUE_KEY = 'alabLeadQueue';
    const toJSON = (form) => Object.fromEntries(new FormData(form));
    const getQueue = () => { try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; } };
    const setQueue = (arr) => { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(arr)); } catch {} };
    const enqueue  = (payload) => { const q = getQueue(); q.push(payload); setQueue(q); };

    async function postJSONWithTimeout(url, body, timeoutMs) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
      try {
        const res = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res;
      } finally { clearTimeout(t); }
    }
    async function sendWithRetry(payload, maxAttempts = 2, timeoutMs = 6000) {
      let lastErr = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try { await postJSONWithTimeout(MAKE_URL, payload, timeoutMs); return; }
        catch (err) { lastErr = err; }
      }
      throw lastErr || new Error('unknown');
    }
    async function flushQueue() {
      const q = getQueue();
      if (!q.length || !navigator.onLine) return;
      const remaining = [];
      for (const item of q) { try { await sendWithRetry(item); } catch { remaining.push(item); } }
      setQueue(remaining);
    }
    window.addEventListener('online', flushQueue);

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fields = toJSON(formEl);

      // SPAM?
      if (fields.hp_website) { closeLB(); showThanks(); return; }

      // Meta + Quelle (HIER setzen – vor dem Senden!)
      fields._ts    = new Date().toISOString();
      fields.quelle = 'solarrechner-privat';
      

      // ein paar Kalkulationswerte mitsenden (optional, hilfreich)
      try {
        fields.calc = {
          stromkosten: elStromkosten?.value ?? '',
          strompreis:  elStrompreis?.value ?? '',
          dachflaeche: elFlaeche?.value ?? '',
          module:      elModule?.value ?? '',
          speicher:    elSpeicher?.checked ? 'ja' : 'nein',
          erzeugung:   elErzeugung?.textContent ?? '',
          netzbezug:   elNetzbezug?.textContent ?? '',
          hausverbrauch: elHausv?.textContent ?? ''
        };
      } catch {}

      const gaEvent = { type: 'pvFormSubmitted', 'GL - form_location': 'pv-konfigurator', ...fields };

      // Offline → Queue
      if (!navigator.onLine) {
        enqueue(fields);
        try { window.parent.postMessage(gaEvent, '*'); } catch {}
        toast('Offline: Wir senden Ihre Anfrage automatisch, sobald eine Verbindung besteht.');
        closeLB(); showThanks();
        return;
      }

      try {
        await sendWithRetry(fields, 2, 6000);
        try { window.parent.postMessage(gaEvent, '*'); } catch {}
        toast('Vielen Dank! Wir melden uns in Kürze.');
        formEl.reset();
        closeLB(); showThanks();
        flushQueue();
      } catch (err) {
        enqueue(fields);
        try { window.parent.postMessage({ ...gaEvent, offlineFallback: true }, '*'); } catch {}
        toast('Verbindung instabil – wir senden im Hintergrund erneut.', true);
        closeLB(); showThanks();
      }
    });
  })();

  // ===== Toast =====
  let toastEl = null, hideT = null;
  function toast(msg, error = false) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      Object.assign(toastEl.style, { position:'fixed', right:'16px', bottom:'16px', padding:'10px 14px', borderRadius:'12px', boxShadow:'0 4px 10px rgba(0,0,0,.12)', zIndex:'10000' });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = error ? '#fca5a5' : '#E6C23C';
    toastEl.style.color = error ? '#111827' : '#1a1a1a';
    toastEl.style.opacity = '1';
    if (hideT) clearTimeout(hideT);
    hideT = setTimeout(() => { toastEl.style.opacity = '0'; }, 2600);
  }
})();
