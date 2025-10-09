(() => {
  const drawer = document.getElementById('alabMhDrawer');
  const openBtn = document.getElementById('alabMhOpen');
  const closeBtn = document.getElementById('alabMhClose');
  const backdrop = document.getElementById('alabMhBackdrop');
  const panel = drawer?.querySelector('.alab-mh__panel');

  if (!drawer || !openBtn || !closeBtn || !panel) return;

  let scrollY = 0;

  function trapTab(container, e){
    if(e.key !== 'Tab') return;
    const f = container.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  function openDrawer(){
    scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.add('alab-no-scroll');
    document.body.style.top = `-${scrollY}px`;

    drawer.classList.add('alab--open');
    drawer.setAttribute('aria-hidden','false');
    openBtn.setAttribute('aria-expanded','true');

    panel.focus();
  }

  function closeDrawer(){
    drawer.classList.remove('alab--open');
    drawer.setAttribute('aria-hidden','true');
    openBtn.setAttribute('aria-expanded','false');

    document.body.classList.remove('alab-no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);

    openBtn.focus();
  }

  // Events
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  drawer.addEventListener('keydown', e => {
    if(e.key === 'Escape') closeDrawer();
    trapTab(drawer, e);
  });
  panel.setAttribute('tabindex','-1');

  // Accordion
  drawer.querySelectorAll('.alab-mh__acc').forEach(acc=>{
    const trigger = acc.querySelector('.alab-mh__acc-trigger');
    const p = acc.querySelector('.alab-mh__acc-panel');
    trigger.addEventListener('click', ()=>{
      const isOpen = acc.classList.toggle('alab--open');
      trigger.setAttribute('aria-expanded', String(isOpen));
      p.style.maxHeight = isOpen ? p.scrollHeight + 'px' : '0px';
    });
  });

  // Close on any link click
  drawer.querySelectorAll('a').forEach(a=> a.addEventListener('click', closeDrawer));

  // iFrame-spezifisches Link-Handling NUR wenn wir wirklich im iFrame sind
  if (window.top !== window.self) {
    const INTERNAL_DOMAINS = ['alabenergiesysteme.de'];

    const isInternal = (urlStr) => {
      try{
        const u = new URL(urlStr, location.href);
        if (u.protocol === 'mailto:' || u.protocol === 'tel:') return false;
        const host = u.hostname;
        return host === location.hostname || INTERNAL_DOMAINS.some(d => host === d || host.endsWith('.'+d));
      }catch{ return false; }
    };

    const retarget = (a) => {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || a.hasAttribute('download')) return;
      if (isInternal(href)){
        a.setAttribute('target','_top');
        a.removeAttribute('rel');
      }else{
        if (!a.hasAttribute('target')) a.setAttribute('target','_blank');
        if (!a.hasAttribute('rel'))    a.setAttribute('rel','noopener');
      }
    };

    document.querySelectorAll('a[href]').forEach(retarget);
    new MutationObserver(muts=>{
      muts.forEach(m=>{
        m.addedNodes.forEach(node=>{
          if (node.nodeType!==1) return;
          if (node.matches?.('a[href]')) retarget(node);
          node.querySelectorAll?.('a[href]').forEach(retarget);
        });
      });
    }).observe(document.documentElement,{childList:true,subtree:true});
    document.addEventListener('click', e=>{
      const a = e.target.closest?.('a[href]');
      if(!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (isInternal(href)) a.target = '_top';
    }, true);
  }
})();
