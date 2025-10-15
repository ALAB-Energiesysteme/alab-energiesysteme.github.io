/* AOS */
document.addEventListener('DOMContentLoaded', () => {
  if (window.AOS) {
    AOS.init({ duration: 1000, once: false, offset: 100, easing: 'ease-out-cubic' });
  }
});

/* Side nav active state */
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.side-nav .nav-item');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= (sectionTop - 200)) current = section.id;
  });
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === '#' + current);
  });
});

/* Smooth scroll for in-page links */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-question');
  if (!q) return;
  q.addEventListener('click', () => {
    document.querySelectorAll('.faq-item').forEach(other => {
      if (other !== item) other.classList.remove('active');
    });
    item.classList.toggle('active');
  });
});

/* Hero particles */
(function createParticles(){
  const wrap = document.getElementById('particles');
  if (!wrap) return;
  for (let i = 0; i < 30; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      position:absolute;border-radius:50%;
      width:${Math.random()*4+2}px;height:${Math.random()*4+2}px;
      background:rgba(255,255,255,${Math.random()*0.5+0.2});
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation: ff-float ${Math.random()*10+10}s linear infinite;
    `;
    wrap.appendChild(el);
  }
  const style = document.createElement('style');
  style.textContent = `
   @keyframes ff-float{
     0%{transform:translateY(0) translateX(0);opacity:0}
     10%{opacity:1} 90%{opacity:1}
     100%{transform:translateY(-100vh) translateX(50px);opacity:0}
   }`;
  document.head.appendChild(style);
})();

/* Helpers for buttons */
window.scrollToSection = function(id){
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
};

/* Contact modal */
window.openContactModal = function(){
  const m = document.getElementById('contactModal');
  if (!m) return;
  m.classList.add('show');
  document.body.style.overflow = 'hidden';
};
window.closeContactModal = function(){
  const m = document.getElementById('contactModal');
  if (!m) return;
  m.classList.remove('show');
  document.body.style.overflow = '';
};
document.addEventListener('click', e => {
  const m = document.getElementById('contactModal');
  if (e.target === m) window.closeContactModal();
});

/* Tech services carousel */
let currentSlide = 0;
const carousel = document.getElementById('techCarousel');
const slides = carousel ? Array.from(carousel.querySelectorAll('.tech-carousel-item')) : [];
const totalSlides = slides.length;

function updateDots(){
  const dotsWrap = document.getElementById('carouselDots');
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  for (let i=0;i<totalSlides;i++){
    const d = document.createElement('span');
    d.className = 'carousel-dot' + (i===currentSlide ? ' active' : '');
    d.onclick = () => showSlide(i);
    dotsWrap.appendChild(d);
  }
}
function showSlide(i){
  if (!carousel || !totalSlides) return;
  currentSlide = (i + totalSlides) % totalSlides;
  carousel.style.transform = `translateX(${-currentSlide * 100}%)`;
  updateDots();
}
window.nextSlide = () => showSlide(currentSlide + 1);
window.prevSlide = () => showSlide(currentSlide - 1);

if (carousel){
  let id = setInterval(() => window.nextSlide(), 5000);
  carousel.addEventListener('mouseenter', () => clearInterval(id));
  carousel.addEventListener('mouseleave', () => id = setInterval(() => window.nextSlide(), 5000));
  showSlide(0);
}

/* Form submission -> Make.com + Erfolgsmeldung */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const sink = document.querySelector('iframe[name="formSink"]');
  const submit = form.querySelector('.form-submit');
  const success = document.getElementById('formSuccess');

  form.addEventListener('submit', () => {
    if (submit){ submit.disabled = true; submit.textContent = 'Wird gesendet…'; }
    if (sink){
      sink.addEventListener('load', () => {
        if (submit){ submit.disabled = false; submit.textContent = 'Anfrage senden'; }
        form.querySelectorAll('.form-group, .form-submit').forEach(el => el.style.display = 'none');
        success?.classList.add('show');
      }, { once:true });
    }
  });
  document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  const consent = document.getElementById('ff-consent');
  const submitBtn = form?.querySelector('.form-submit');

  if (form && consent && submitBtn) {
    // Initial deaktivieren, bis Haken gesetzt
    submitBtn.disabled = !consent.checked;

    consent.addEventListener('change', () => {
      submitBtn.disabled = !consent.checked;
    });

    // Native Browser-Validierung anzeigen, falls etwas fehlt
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
      }
    }, { capture: true });
  }
});
});


