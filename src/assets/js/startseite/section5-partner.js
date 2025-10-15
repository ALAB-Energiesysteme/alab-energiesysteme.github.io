
(() => {
  const marquee = document.querySelector('.alab-marquee');
  if(!marquee) return;

  const track = marquee.querySelector('.alab-track');
  if(!track) return;

  const pxPerSecond = Number(marquee.dataset.speed) || 70;

  const cloneUntil = (minWidth) => {
    const originals = Array.from(track.children);
    while (track.scrollWidth < minWidth) {
      originals.forEach(node => track.appendChild(node.cloneNode(true)));
    }
  };

  const ensureClones = () => {
    const targetWidth = marquee.offsetWidth * 2.1;
    cloneUntil(targetWidth);
    const duration = track.scrollWidth / pxPerSecond;
    track.style.setProperty('--alab-duration', `${duration}s`);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    });
  }, { threshold: 0 });
  io.observe(marquee);

  ensureClones();

  let rAF, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth;
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      const duration = track.scrollWidth / pxPerSecond;
      track.style.setProperty('--alab-duration', `${duration}s`);
    });
  });
})();

