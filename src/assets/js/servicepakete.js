"use strict";

/* ===== Reveal on scroll =============================================== */
(() => {
  const root = document.getElementById('alab-services');
  if (!root) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  root.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ===== Modal & Formular-Logik ========================================= */
(() => {
  const root = document.getElementById('alab-services');
  if (!root) return;

  const modal        = root.querySelector('#contactModal');
  const closeBtn     = root.querySelector('#closeModal');
  const cancelBtn    = root.querySelector('#cancelModal');
  const leadForm     = root.querySelector('#leadForm');
  const submitBtn    = root.querySelector('#submitBtn');
  const fields       = root.querySelector('#leadFormFields');
  const formFooter   = root.querySelector('#leadFormFooter');
  const successEl    = root.querySelector('#formSuccess');
  const accept       = root.querySelector('#accept');
  const serviceInput = root.querySelector('#service');

  // Sichtbarkeit im Danke-Zustand hart durchsetzen (gegen fremde Handler)
  const enforce = () => {
    if (!leadForm?.classList.contains('is-sent')) return;
    fields?.style.setProperty('display', 'none', 'important');
    formFooter?.style.setProperty('display', 'none', 'important');
    successEl?.style.setProperty('display', 'block', 'important');
  };
  const mo = leadForm ? new MutationObserver(enforce) : null;
  mo?.observe(leadForm, { attributes: true, childList: true, subtree: true });

  function resetModalToForm() {
    if (!leadForm) return;
    leadForm.classList.remove('is-sent');
    fields?.style.removeProperty('display');
    formFooter?.style.removeProperty('display');
    if (successEl) {
      successEl.style.removeProperty('display');
      successEl.setAttribute('aria-hidden', 'true');
      successEl.classList.remove('show');
    }
  }

  function openModal(service) {
    resetModalToForm();
    if (service && serviceInput) serviceInput.value = service;
    modal?.classList.add('modal--open');
    modal?.setAttribute('aria-hidden','false');
    setTimeout(() => root.querySelector('#name')?.focus(), 40);
  }
  function closeModal() {
    modal?.classList.remove('modal--open');
    modal?.setAttribute('aria-hidden','true');
  }
  window.openContactModal = openModal;

  root.querySelectorAll('.open-contact').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(btn.dataset.service || 'Allgemeine Anfrage'); });
  });
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  root.querySelector('#successAgain')?.addEventListener('click', resetModalToForm);
  root.querySelector('#successClose')?.addEventListener('click', () => { resetModalToForm(); closeModal(); });

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

      if (accept && !accept.checked) {
        accept.focus();
        let warn = root.querySelector('#acceptWarn');
        if (!warn) {
          warn = document.createElement('p');
          warn.id = 'acceptWarn';
          warn.style.cssText = 'color:#b00020;margin:.25rem 0 0;';
          warn.textContent = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
          accept.closest('.input')?.appendChild(warn);
        }
        return;
      } else {
        root.querySelector('#acceptWarn')?.remove();
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Wird gesendet…'; }

      const data = new FormData(leadForm);
      fetch('https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y', {
        method: 'POST',
        body: data,
        mode: 'no-cors' // opaque Response -> then() läuft trotzdem
      })
      .catch(err => { console.error('Webhook-Fehler:', err); })
      .then(() => {
        // Sichtbarkeit sofort UND per Klasse umschalten
        leadForm.classList.add('is-sent');
        if (fields)     fields.style.display    = 'none';
        if (formFooter) formFooter.style.display= 'none';
        if (successEl) {
          successEl.style.display = 'block';
          successEl.classList.add('show');
          successEl.setAttribute('aria-hidden','false');
        }
        leadForm.reset();
      })
      .finally(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Anfrage senden'; }
      });

      return false;
    }, { capture: true, passive: false });
  }
})();

