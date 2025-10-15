// Section 4 – Vorteile nur im Wrapper initialisieren
(function(){
  const root = document.getElementById('privat-vorteile');
  if(!root) return;

  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

  const animateOnScroll = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        if(entry.target.classList.contains('benefit-visual')){
          const paths = entry.target.querySelectorAll('path, rect, line, polyline, circle');
          paths.forEach((p,i)=> setTimeout(()=>{ p.style.animation = 'drawPath 2s ease forwards'; }, i*100));
        }
      }
    });
  }, observerOptions);

  // Nur innerhalb von #privat-vorteile beobachten
  root.querySelectorAll('.benefit-content, .benefit-visual, .cta-badge, .cta-title, .cta-subtitle, .btn, .cta-trust')
      .forEach(el => animateOnScroll.observe(el));

  // Mouse-Parallax nur dort
  root.querySelectorAll('.icon-wrapper').forEach(wrapper=>{
    wrapper.addEventListener('mousemove', (e)=>{
      const r = wrapper.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width/2)/(r.width/2);
      const dy = (e.clientY - r.top  - r.height/2)/(r.height/2);
      const icon = wrapper.querySelector('.benefit-icon');
      if(icon) icon.style.transform = `translate(-50%, -50%) rotateY(${dx*10}deg) rotateX(${-dy*10}deg)`;
      wrapper.querySelectorAll('.particle').forEach((p,i)=> p.style.transform = `translate(${dx*(i+1)*5}px, ${dy*(i+1)*5}px)`);
    });
    wrapper.addEventListener('mouseleave', ()=>{
      const icon = wrapper.querySelector('.benefit-icon');
      if(icon) icon.style.transform = 'translate(-50%, -50%) rotateY(0) rotateX(0)';
      wrapper.querySelectorAll('.particle').forEach(p=> p.style.transform = 'translate(0,0)');
    });
  });

  // Smooth transitions nur für Links innerhalb der Section
  root.querySelectorAll('a[href^="http"]').forEach(link=>{
    link.addEventListener('click', (e)=>{
      if(link.getAttribute('target') !== '_blank'){
        e.preventDefault();
        const href = link.getAttribute('href');
        root.style.opacity = '0';
        setTimeout(()=> window.location.href = href, 300);
      }
    });
  });

  // CTA-Klicktracking nur lokal
  root.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const label = btn.textContent || 'CTA';
      if(typeof gtag !== 'undefined') gtag('event','click',{event_category:'CTA', event_label:label});
    });
  });
})();
