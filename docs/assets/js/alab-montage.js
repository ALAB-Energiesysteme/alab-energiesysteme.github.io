"use strict";

/* Reveal on scroll */
(() => {
  const root = document.getElementById("alab-montage");
  if (!root) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  root.querySelectorAll(".reveal").forEach(el => io.observe(el));
})();

/* Steps: progressive progress */
(() => {
  const root = document.getElementById("alab-montage");
  if (!root) return;
  const steps = Array.from(root.querySelectorAll(".step"));
  if (!steps.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const el = e.target;
      const r = e.intersectionRatio;
      if (r >= 0.8 && !el.classList.contains("done")) {
        el.classList.add("done");
      } else if (r >= 0.3 && !el.classList.contains("part")) {
        el.classList.add("part");
      }
    });
  }, { root: null, rootMargin: "0px 0px -10% 0px", threshold: [0, 0.3, 0.8, 1] });

  steps.forEach(s => io.observe(s));
})();

/* CTA -> globales Kontakt-Modal, falls vorhanden */
(() => {
  const root = document.getElementById("alab-montage");
  if (!root) return;

  root.querySelectorAll(".open-contact").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const svc = btn.dataset.service || "Montage";
      if (typeof window.openContactModal === "function") {
        window.openContactModal(svc);
      } else {
        window.location.href = btn.getAttribute("href") || "/kontakt/";
      }
    });
  });
})();

/* Link-Targeting (SEO/UX) */
(() => {
  document.querySelectorAll('#alab-montage a[href]').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (/^(#|tel:|mailto:)/i.test(href)) return;

    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href, location.href);
        if (u.origin !== location.origin) {
          a.setAttribute('target','_blank');
          const rel = new Set((a.getAttribute('rel') || '').split(' ').filter(Boolean));
          rel.add('noopener'); rel.add('noreferrer');
          a.setAttribute('rel', Array.from(rel).join(' '));
          return;
        }
      } catch {}
      a.setAttribute('target','_top');
      a.removeAttribute('rel');
      return;
    }

    // in deinem Link-Targeting-IIFE:
if (href.startsWith('/assets/img/')) {
  // Bildlinks: im gleichen Kontext lassen
  a.removeAttribute('target');
  a.removeAttribute('rel');
  return;
}

  });
})();

/* ===== Referenzen – Carousel (ALAB) ===== */
(() => {
  const host  = document.getElementById("ref-gallery");
  if (!host) return;

  const wrap   = host.querySelector(".rg");
  const vp     = host.querySelector(".rg__viewport");
  const slides = Array.from(host.querySelectorAll(".rg__slide"));
  const prev   = host.querySelector(".rg__nav--prev");
  const next   = host.querySelector(".rg__nav--next");
  const dotsC  = host.querySelector(".rg__dots");
  if (!wrap || !vp || slides.length === 0 || !dotsC) return;

  // === Konfig ===
  const LOOP    = true;
  const AUTO_MS = 3500;

  // Dots
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Slide ${i+1}`);
    b.addEventListener("click", () => { goToLoop(i); resetAuto(); });
    dotsC.appendChild(b);
  });

  let active = Math.min(parseInt(host.dataset.start || "0", 10), slides.length-1);

  // Helpers
  function centerTo(i, smooth = true){
    i = Math.max(0, Math.min(i, slides.length-1));
    const s = slides[i];
    const vpRect = vp.getBoundingClientRect();
    const sRect  = s.getBoundingClientRect();
    const delta  = (sRect.left + sRect.width/2) - (vpRect.left + vpRect.width/2);
    vp.scrollBy({ left: delta, behavior: smooth ? "smooth" : "auto" });
  }
  function nearestIndex(){
    const vpRect = vp.getBoundingClientRect();
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs((r.left + r.width/2) - (vpRect.left + vpRect.width/2));
      if (d < bestDist){ bestDist = d; best = i; }
    });
    return best;
  }
  function markActive(i){
    active = i;
    slides.forEach((s, k) => s.setAttribute("aria-selected", String(k === i)));
    Array.from(dotsC.children).forEach((d, k) => d.setAttribute("aria-selected", String(k === i)));
    // Optional: GA4 Event
    try{
      const title = slides[i].querySelector(".rg__cap")?.textContent?.trim() || `Slide ${i+1}`;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "refGallery_slide_change", index: i+1, title });
    } catch {}
  }
  function goToLoop(i){
    if (i < 0) i = slides.length - 1;
    if (i > slides.length - 1) i = 0;
    centerTo(i);
    markActive(i);
  }

  // Arrows & Keyboard
  prev?.addEventListener("click", () => { goToLoop(active - 1); resetAuto(); });
  next?.addEventListener("click", () => { goToLoop(active + 1); resetAuto(); });
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); goToLoop(active - 1); resetAuto(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goToLoop(active + 1); resetAuto(); }
  });

  // Active nachführen beim Scroll
  let ticking = false;
  vp.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { markActive(nearestIndex()); ticking = false; });
  });

  // Desktop-Drag (Touch ist nativ)
  let drag = { on:false, id:null, startX:0, startLeft:0, moved:false };
  vp.addEventListener("pointerdown", (e) => {
    drag.on = true; drag.id = e.pointerId; drag.startX = e.clientX; drag.startLeft = vp.scrollLeft; drag.moved = false;
    vp.setPointerCapture(drag.id); stopAuto();
  });
  vp.addEventListener("pointermove", (e) => {
    if (!drag.on) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 3) drag.moved = true;
    vp.scrollLeft = drag.startLeft - dx;
  });
  vp.addEventListener("pointerup", () => {
    if (!drag.on) return;
    vp.releasePointerCapture(drag.id);
    drag.on = false;
    centerTo(nearestIndex());
    setTimeout(startAuto, 200);
  });
  vp.addEventListener("click", (e) => {
    if (drag.moved) { e.preventDefault(); drag.moved = false; }
  }, true);

  // Autoplay
  let timer = null;
  function startAuto(){ stopAuto(); timer = setInterval(() => goToLoop(active + 1), AUTO_MS); }
  function stopAuto(){ if (timer){ clearInterval(timer); timer = null; } }
  function resetAuto(){ stopAuto(); startAuto(); }
  wrap.addEventListener("pointerenter", stopAuto);
  wrap.addEventListener("pointerleave", startAuto);
  wrap.addEventListener("focusin", stopAuto);
  wrap.addEventListener("focusout", () => { if (!wrap.contains(document.activeElement)) startAuto(); });
  document.addEventListener("visibilitychange", () => { document.hidden ? stopAuto() : startAuto(); });

  // Resize
  let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => centerTo(active, false), 80); });

  // Init
  Array.from(dotsC.children).forEach((d, k) => d.setAttribute("aria-selected", String(k === active)));
  slides.forEach((s, k) => s.setAttribute("aria-selected", String(k === active)));
  markActive(active);
  centerTo(active, false);
  window.addEventListener("load", () => setTimeout(() => { centerTo(active, false); startAuto(); }, 80));
})();



