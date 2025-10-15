// ==========================================
// SECTION 7: FAQ – Logic (clean + robust)
// ==========================================
(() => {
  'use strict';

  const WEBHOOK = 'https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y';

  const $  = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  const accordion   = $('#faqAccordion');
  if (!accordion) return;

  const items       = $$('.faq-item', accordion);
  const catButtons  = $$('.category-btn');
  const form        = $('#compactContactForm');
  const successBox  = $('#successMessage');

  let currentCategory = 'all';

  // ---------- helpers ----------
  const slugify = (t) =>
    (t || '').toLowerCase().trim()
      .replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '') || 'faq';

  // add stable ids/slugs for deep linking
  items.forEach((it, i) => {
    if (!it.dataset.id) {
      const txt  = it.querySelector('.question-text')?.textContent || `faq-${i+1}`;
      const slug = slugify(txt);
      it.dataset.id = slug;
      it.id = slug; // optional anchor
    }
  });

  // update category counters dynamically
  function updateCounts() {
    const counts = { all: items.length };
    items.forEach(it => {
      const c = it.dataset.category || 'misc';
      counts[c] = (counts[c] || 0) + 1;
    });
    catButtons.forEach(btn => {
      const c  = btn.dataset.category;
      const el = btn.querySelector('.category-count');
      if (el && c in counts) el.textContent = counts[c];
    });
  }
  updateCounts();

  // ---------- accordion ----------
  function openItem(it) {
    const q = it.querySelector('.faq-question');
    const a = it.querySelector('.faq-answer');
    it.classList.add('active');
    q?.setAttribute('aria-expanded', 'true');
    if (a) a.style.maxHeight = a.scrollHeight + 'px';
    // close others
    items.forEach(o => { if (o !== it) closeItem(o); });
  }

  function closeItem(it) {
    const q = it.querySelector('.faq-question');
    const a = it.querySelector('.faq-answer');
    it.classList.remove('active');
    q?.setAttribute('aria-expanded', 'false');
    if (a) a.style.maxHeight = '0';
  }

  function toggleItem(it) {
    it.classList.contains('active') ? closeItem(it) : openItem(it);
  }

  items.forEach(it => it.querySelector('.faq-question')?.addEventListener('click', () => toggleItem(it)));

  // ---------- categories ----------
  function setCategory(cat) {
    currentCategory = cat;
    catButtons.forEach(b => b.classList.toggle('active', b.dataset.category === cat));
    items.forEach(it => {
      const show = (cat === 'all') || (it.dataset.category === cat);
      it.classList.toggle('hidden', !show);
      if (!show) closeItem(it);
    });
  }
  catButtons.forEach(b => b.addEventListener('click', () => setCategory(b.dataset.category)));

  // ---------- deep linking (#frage-slug) ----------
  function deepLink() {
    const hash = decodeURIComponent(location.hash.replace('#', ''));
    if (!hash) return;
    const target = items.find(it => it.dataset.id === hash || it.id === hash);
    if (target) {
      setTimeout(() => {
        setCategory('all');            // sicher sichtbar
        openItem(target);
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }
  deepLink();

  // Recalc heights on resize
  let rto;
  window.addEventListener('resize', () => {
    clearTimeout(rto);
    rto = setTimeout(() => {
      items.forEach(it => {
        if (it.classList.contains('active')) {
          const a = it.querySelector('.faq-answer');
          if (a) a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    }, 150);
  });

  // ---------- contact form ----------
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firma   = $('#compactFirma')?.value.trim();
    const email   = $('#compactEmail')?.value.trim();
    const tel     = $('#compactTel')?.value.trim();
    const msg     = $('#compactMessage')?.value.trim();
    const privacy = $('#compactPrivacy')?.checked;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!firma || !email || !privacy || !emailRe.test(email)) {
      alert('Bitte Firmenname, gültige E-Mail und Datenschutzerklärung bestätigen.');
      return;
    }

    // nur notwendige Felder an Make senden (ohne json, page_url, user_agent)
    const payload = {
      firma,
      email,
      tel: tel || '',
      nachricht: msg || '',
      dsAccepted: privacy ? 'WAHR' : 'FALSCH',
      origin: 'FAQ-Kontakt (Section 7)',
      submittedAt: new Date().toISOString()
    };

    const btn = form.querySelector('.submit-btn');
    const old = btn?.innerHTML;
    if (btn) { btn.disabled = true; btn.innerHTML = '<span>Wird gesendet…</span>'; }

    try {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      await fetch(WEBHOOK, { method: 'POST', body: fd, mode: 'no-cors', keepalive: true });
    } catch (err) {
      console.warn('Webhook-Request (no-cors) – weiter mit Success-UI.', err);
    } finally {
      // Success-UX
      form.style.display = 'none';
      successBox?.classList.add('visible');
      setTimeout(() => {
        form.reset();
        form.style.display = 'flex';
        successBox?.classList.remove('visible');
        if (btn) { btn.disabled = false; btn.innerHTML = old; }
      }, 5000);
    }

    // optional tracking
    if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { currency: 'EUR', value: 0, lead_source: 'FAQ Section' });
    if (typeof fbq  !== 'undefined') fbq('track', 'Lead', { value: 0, currency: 'EUR', content_name: 'FAQ Contact' });
  });

  // log init time (optional)
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('faq-init-start');
    window.addEventListener('load', () => {
      performance.mark('faq-init-end');
      performance.measure('faq-init', 'faq-init-start', 'faq-init-end');
      const m = performance.getEntriesByName('faq-init')[0];
      console.log(`✅ FAQ bereit in ${m.duration.toFixed(2)}ms`);
    });
  }
})();
