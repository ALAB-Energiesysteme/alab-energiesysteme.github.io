"use strict";

// sorgt dafür, dass DOM fertig ist, auch wenn Script im <head> liegt
document.addEventListener('DOMContentLoaded', initPage, { once: true });

function initPage() {
  const root = document.getElementById('alab-commercial');
  if (!root) return;

  /* ===== Reveal on scroll (für alle .reveal) =========================== */
  (() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    root.querySelectorAll('.reveal').forEach(el => io.observe(el));
  })();

  /* ===== Modul: Hero (Beispiel) ======================================== */
  (() => {
    const sec = root.querySelector('.sec-hero');
    if (!sec) return;
    // hier später: animierte Zahlen, Scroll zu Kontakt, etc.
  })();

  /* ===== Modul: Benefits =============================================== */
  (() => {
    const sec = root.querySelector('.sec-benefits');
    if (!sec) return;
    // Logik / Slider / Filter etc.
  })();

  /* ===== Modul: Industries ============================================= */
  (() => {
    const sec = root.querySelector('.sec-industries');
    if (!sec) return;
  })();

  /* ===== Modul: Process ================================================= */
  (() => {
    const sec = root.querySelector('.sec-process');
    if (!sec) return;
  })();

  /* ===== Modul: Cases =================================================== */
  (() => {
    const sec = root.querySelector('.sec-cases');
    if (!sec) return;
  })();

  /* ===== Modul: CTA ===================================================== */
  (() => {
    const sec = root.querySelector('.sec-cta');
    if (!sec) return;
    // Beispiel: Button -> Kontakt
    sec.querySelectorAll('[data-open-contact]')?.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // falls dein globales Modal existiert:
        if (window.openContactModal) window.openContactModal('Gewerbliche Lösungen');
        else location.href = '/kontakt/';
      });
    });
  })();
}
