// Tabs + Collapsible (nur mobil klappbar; kein Auto-Scroll; ohne Experten-Modal)
(() => {
  const nav = document.getElementById('pv-steps');
  const content = document.getElementById('pv-content');
  const isMobile = () => window.innerWidth <= 640;

  const buttons = () => nav.querySelectorAll('.step-button');
  const tabs = () => content.querySelectorAll('.tab-content');

  function activateTab(id){
    tabs().forEach(t => t.classList.remove('active'));
    buttons().forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });

    const tab = document.getElementById(`tab-${id}`);
    const btn = nav.querySelector(`.step-button[data-tab="${id}"]`);
    if(!tab || !btn) return;

    tab.classList.add('active');
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');

    applyResponsiveCollapsible(tab.querySelector('.text-content'));
  }

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.step-button');
    if(!btn || !nav.contains(btn)) return;
    const id = btn.getAttribute('data-tab');
    if(id) activateTab(id);
  }, { passive: true });

  /* ----------- Collapsible Setup (wrappt alles außer Titel) ----------- */
  function prepareCollapsible(){
    document.querySelectorAll('#pv-content .tab-content .text-content').forEach((tc, i) => {
      if (tc.dataset.collapsibleReady === '1') return;

      const titleEl = tc.querySelector('.step-title');
      const restNodes = [...tc.children].filter(el => el !== titleEl);

      const wrap = document.createElement('div');
      wrap.className = 'collapsible';
      wrap.id = `collapsible-${i}`;
      restNodes.forEach(el => wrap.appendChild(el));
      tc.appendChild(wrap);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'collapsible-toggle';
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-controls', wrap.id);
      btn.innerHTML = `<span>Mehr anzeigen</span><span class="chev">▾</span>`;
      tc.appendChild(btn);

      btn.addEventListener('click', () => toggleCollapsible(tc, wrap, btn), { passive: true });

      tc.dataset.collapsibleReady = '1';
    });
  }

  function toggleCollapsible(tc, wrap, btn){
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    if (expanded){
      wrap.style.maxHeight = '0px';
      btn.setAttribute('aria-expanded','false');
      btn.querySelector('span').textContent = 'Mehr anzeigen';
      tc.classList.remove('is-expanded');
    } else {
      wrap.style.maxHeight = wrap.scrollHeight + 'px';
      btn.setAttribute('aria-expanded','true');
      btn.querySelector('span').textContent = 'Weniger anzeigen';
      tc.classList.add('is-expanded');
    }
  }

  function applyResponsiveCollapsible(tc){
    if (!tc) return;
    const wrap = tc.querySelector('.collapsible');
    const btn  = tc.querySelector('.collapsible-toggle');
    if (!wrap || !btn) return;

    if (isMobile()){
      wrap.style.maxHeight = '0px';
      btn.style.display = 'inline-flex';
      btn.setAttribute('aria-expanded','false');
      btn.querySelector('span').textContent = 'Mehr anzeigen';
      tc.classList.remove('is-expanded');
    } else {
      wrap.style.maxHeight = 'none';
      btn.style.display = 'none';
      btn.setAttribute('aria-expanded','true');
      tc.classList.add('is-expanded');
    }
  }

  function applyResponsiveCollapsibleAll(){
    document.querySelectorAll('#pv-content .tab-content.active .text-content')
      .forEach(applyResponsiveCollapsible);
  }

  // Resize neu anwenden (entprellt)
  let rAF = null;
  window.addEventListener('resize', () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => applyResponsiveCollapsibleAll());
  });

  // Init
  prepareCollapsible();
  applyResponsiveCollapsibleAll();
})();
