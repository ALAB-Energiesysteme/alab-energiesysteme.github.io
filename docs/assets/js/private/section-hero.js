// ===== Wizard Form Handler =====
(function() {
  const form = document.getElementById('solarForm');
  const steps = [...form.querySelectorAll('.form-step')];
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const progressBar = document.getElementById('progressFill');
  const stepNumbers = document.querySelectorAll('.step-number');
  let currentStep = 0;

  function clearErrors(scope) {
    scope.querySelectorAll('.error-text').forEach(n => n.remove());
    scope.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }
  function addError(field, message) {
    const group = field.closest('.form-group') || field.parentElement;
    if (field.type === 'radio') {
      const radioGrid = group.querySelector('.radio-grid');
      if (radioGrid) { radioGrid.style.borderColor = 'var(--error)'; }
    } else {
      field.classList.add('error');
    }
    let errorMsg = group.querySelector('.error-text');
    if (!errorMsg) {
      errorMsg = document.createElement('small');
      errorMsg.className = 'error-text';
      group.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
  }
  function showStep() {
    steps.forEach((step, index) => { step.classList.toggle('active', index === currentStep); });
    stepNumbers.forEach((num, index) => { num.classList.toggle('active', index <= currentStep); });
    prevBtn.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
      nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg> Kostenloses Angebot erhalten';
    } else {
      nextBtn.innerHTML = 'Weiter <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
    }
    progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  }
  function validateStep() {
    const currentStepEl = steps[currentStep];
    clearErrors(currentStepEl);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalidField = null;
    for (const field of requiredFields) {
      if (field.type === 'radio') {
        const radioName = field.name;
        const radioButtons = currentStepEl.querySelectorAll(`input[name="${radioName}"]`);
        const isChecked = [...radioButtons].some(r => r.checked);
        if (!isChecked) {
          addError(radioButtons[0], 'Bitte wählen Sie eine Option');
          if (!firstInvalidField) firstInvalidField = radioButtons[0];
          isValid = false;
        }
      } else {
        const value = field.value.trim();
        if (!value) {
          addError(field, 'Bitte füllen Sie dieses Feld aus');
          if (!firstInvalidField) firstInvalidField = field;
          isValid = false;
        } else if (field.type === 'email' && !validateEmail(value)) {
          addError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
          if (!firstInvalidField) firstInvalidField = field;
          isValid = false;
        } else if (field.type === 'tel' && !validatePhone(value)) {
          addError(field, 'Bitte geben Sie eine gültige Telefonnummer ein');
          if (!firstInvalidField) firstInvalidField = field;
          isValid = false;
        } else if ((field.name === 'vorname' || field.name === 'nachname') && !validateName(value)) {
          addError(field, 'Bitte geben Sie einen gültigen Namen ein');
          if (!firstInvalidField) firstInvalidField = field;
          isValid = false;
        }
      }
    }
    if (firstInvalidField) { firstInvalidField.focus(); }
    return isValid;
  }
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  function validatePhone(phone) {
    const cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
    return cleaned.length >= 7 && /^[\d\+]/.test(cleaned);
  }
  function validateName(name) {
    return name.length >= 2 && /^[a-zA-ZäöüßÄÖÜ\s\-']+$/.test(name);
  }
  async function submitForm() {
    const originalText = nextBtn.innerHTML;
    nextBtn.innerHTML = 'Sende...';
    nextBtn.disabled = true;
    try {
      const formData = new FormData();
      formData.append('source', 'privatseite-hero');
      formData.append('gebaeudeart', form.querySelector('input[name="gebaeudeart"]:checked')?.value || '');
      formData.append('dachform', form.querySelector('input[name="dachform"]:checked')?.value || '');
      formData.append('stromverbrauch', form.querySelector('input[name="stromverbrauch"]')?.value || '');
      formData.append('zusatzkomponenten', form.querySelector('input[name="zusatzkomponenten"]:checked')?.value || '');
      formData.append('vorname', form.querySelector('input[name="vorname"]')?.value || '');
      formData.append('nachname', form.querySelector('input[name="nachname"]')?.value || '');
      formData.append('email', form.querySelector('input[name="email"]')?.value || '');
      formData.append('telefon', form.querySelector('input[name="telefon"]')?.value || '');
      formData.append('adresse', form.querySelector('input[name="adresse"]')?.value || '');
      await fetch('https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      const formCard = document.querySelector('.form-card');
      formCard.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="font-size: 64px; margin-bottom: 1rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 64px; height: 64px; color: var(--primary); margin: 0 auto;">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l2 2 4-4"></path>
            </svg>
          </div>
          <h2 style="font-size: 28px; margin-bottom: 1rem; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Vielen Dank!</h2>
          <p style="color: var(--text-secondary); font-size: 18px;">Ihre Anfrage ist eingegangen. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
        </div>
      `;
    } catch (error) {
      nextBtn.innerHTML = originalText;
      nextBtn.disabled = false;
      alert('Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.');
    }
  }
  nextBtn.addEventListener('click', () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep();
      } else {
        submitForm();
      }
    }
  });
  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep();
    }
  });
  form.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          if (validateStep()) {
            currentStep++;
            showStep();
          }
        }
      }, 200);
    });
  });
  showStep();
})();

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== Add animation on scroll =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('animate-in');
  });
}, observerOptions);
document.querySelectorAll('.hero-badge, .hero-title, .hero-description, .hero-benefits, .hero-stats, .form-card')
  .forEach(el => observer.observe(el));
