// Referenzen-Carousel – Multi-Instance (Gewerbe + Privat)
(() => {
  const hosts = document.querySelectorAll("#ref-gallery, #ref-gallery-private");
  if (!hosts.length) return;

  hosts.forEach((host) => {
    const wrap   = host.querySelector(".rg");
    const vp     = host.querySelector(".rg__viewport");
    const slides = Array.from(host.querySelectorAll(".rg__slide"));
    const prev   = host.querySelector(".rg__nav--prev");
    const next   = host.querySelector(".rg__nav--next");
    const dotsC  = host.querySelector(".rg__dots");
    if (!wrap || !vp || !slides.length || !dotsC) return;

    // Dots
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Slide ${i+1}`);
      b.addEventListener("click", () => { goToLoop(i); resetAuto(); });
      dotsC.appendChild(b);
    });

    let active = 0;

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
    }
    function goToLoop(i){
      if (i < 0) i = slides.length - 1;
      if (i > slides.length - 1) i = 0;
      centerTo(i);
      markActive(i);
    }

    // Pfeile & Keyboard
    prev?.addEventListener("click", () => { goToLoop(active - 1); resetAuto(); });
    next?.addEventListener("click", () => { goToLoop(active + 1); resetAuto(); });
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); goToLoop(active - 1); resetAuto(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goToLoop(active + 1); resetAuto(); }
    });

    // Active beim Scrollen
    let ticking = false;
    vp.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { markActive(nearestIndex()); ticking = false; });
    });

    // Drag
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
    function startAuto(){ stopAuto(); timer = setInterval(() => goToLoop(active + 1), 3500); }
    function stopAuto(){ if (timer){ clearInterval(timer); timer = null; } }
    function resetAuto(){ stopAuto(); startAuto(); }
    wrap.addEventListener("pointerenter", stopAuto);
    wrap.addEventListener("pointerleave", startAuto);

    // Init
    Array.from(dotsC.children).forEach((d, k) => d.setAttribute("aria-selected", String(k === active)));
    slides.forEach((s, k) => s.setAttribute("aria-selected", String(k === active)));
    markActive(active);
    centerTo(active, false);
    window.addEventListener("load", () => setTimeout(() => { centerTo(active, false); startAuto(); }, 80));
  });
})();
