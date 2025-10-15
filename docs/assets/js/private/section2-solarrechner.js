// ===== Modal Handler =====
function openContactModal() {
  document.getElementById('contactModal').classList.add('active');
  document.getElementById('contactModal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  document.getElementById('contactModal').classList.remove('active');
  document.getElementById('contactModal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('contactModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('contactModal')) {
    closeContactModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('contactModal').classList.contains('active')) {
    closeContactModal();
  }
});

// ===== Solar Calculator =====
(function() {
  const fmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
  const fmtEur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  // Constants
  const FEED_IN_TARIFF = 0.09;
  const YEARS = 30;
  const OPEX_PERCENT = 0.008;
  const MODULE_WATT_PEAK = 450;
  const MODULE_AREA = 2.0;
  const SPECIFIC_YIELD = 1100;
  const CAPEX_PER_KWP = 1500;
  const CO2_FACTOR = 0.49;
  const BATTERY_COST_PER_KWH = 600;
  const DEGRADATION_RATE = 0.005;
  const PRICE_GROWTH = 0.02;
  const INVERTER_REPLACEMENT_YEAR = 15;
  const INVERTER_REPLACEMENT_PERCENT = 0.15;

  // Elements
  const elements = {
    stromkosten: document.getElementById('stromkosten'),
    strompreis: document.getElementById('strompreis'),
    dachflaeche: document.getElementById('dachflaeche'),
    pvModule: document.getElementById('pvModule'),
    speicher: document.getElementById('speicher'),
    btnPlus: document.getElementById('btnPlus'),
    btnMinus: document.getElementById('btnMinus')
  };

  const outputs = {
    ersparnis: document.getElementById('ersparnis'),
    einspeisung: document.getElementById('einspeisung'),
    gesamtgewinn: document.getElementById('gesamtgewinn'),
    monatlichGewinn: document.getElementById('monatlichGewinn'),
    amort: document.getElementById('amort'),
    erzeugung: document.getElementById('erzeugung'),
    netzbezug: document.getElementById('netzbezug'),
    speichernutzung: document.getElementById('speichernutzung'),
    hausverbrauch: document.getElementById('hausverbrauch'),
    co2ersparnis: document.getElementById('co2ersparnis'),
    autarkie: document.getElementById('autarkie'),
    autarkieFill: document.getElementById('autarkieFill')
  };

  // Helper functions
  function maxModulesByArea() {
    return Math.max(1, Math.floor(Number(elements.dachflaeche.value || 40) / MODULE_AREA));
  }

  function maxModulesAllowed() {
    return Math.min(200, maxModulesByArea());
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  // Main calculation
  function calculate() {
    const maxModules = maxModulesAllowed();
    elements.pvModule.max = maxModules;
    
    if (Number(elements.pvModule.value) > maxModules) {
      elements.pvModule.value = maxModules;
    }
    if (Number(elements.pvModule.value) < 1) {
      elements.pvModule.value = 1;
    }

    // Input values
    const monthlyCost = Number(elements.stromkosten.value || 0);
    const electricityPrice = Math.max(0.10, Number(elements.strompreis.value || 0.35));
    const monthlyKWh = monthlyCost / electricityPrice;
    const annualConsumption = monthlyKWh * 12;
    
    const moduleCount = Number(elements.pvModule.value || 0);
    const systemKWp = (moduleCount * MODULE_WATT_PEAK) / 1000;
    const annualProduction = systemKWp * SPECIFIC_YIELD;
    
    // Self-consumption calculation
    const baseSelfConsumption = clamp(0.30 + 0.25 * Math.min(1, annualConsumption / (annualProduction || 1)), 0.20, 0.65);
    const selfConsumption = elements.speicher.checked ? 
      clamp(baseSelfConsumption + 0.22, 0.25, 0.90) : baseSelfConsumption;
    
    // Costs
    const pvCapex = systemKWp * CAPEX_PER_KWP;
    const dailyConsumption = annualConsumption / 365;
    const batterySize = elements.speicher.checked ? clamp(dailyConsumption * 1.0, 5, 15) : 0;
    const batteryCapex = batterySize * BATTERY_COST_PER_KWH;
    const totalCapex = pvCapex + batteryCapex;
    
    // 30-year calculation
    let savingsSum = 0;
    let feedInSum = 0;
    let opexSum = 0;
    let cumulative = -totalCapex;
    let paybackYear = null;
    
    for (let year = 1; year <= YEARS; year++) {
      const yearlyProduction = annualProduction * Math.pow(1 - DEGRADATION_RATE, year - 1);
      const yearlySelfConsumption = Math.min(annualConsumption, yearlyProduction * selfConsumption);
      const yearlyExport = Math.max(0, yearlyProduction - yearlySelfConsumption);
      const yearlyPrice = electricityPrice * Math.pow(1 + PRICE_GROWTH, year - 1);
      
      const yearlySavings = yearlySelfConsumption * yearlyPrice;
      const yearlyFeedIn = yearlyExport * FEED_IN_TARIFF;
      const yearlyOpex = totalCapex * OPEX_PERCENT;
      const extraCost = (year === INVERTER_REPLACEMENT_YEAR) ? pvCapex * INVERTER_REPLACEMENT_PERCENT : 0;
      
      savingsSum += yearlySavings;
      feedInSum += yearlyFeedIn;
      opexSum += (yearlyOpex + extraCost);
      
      cumulative += (yearlySavings + yearlyFeedIn - (yearlyOpex + extraCost));
      if (paybackYear === null && cumulative >= 0) {
        paybackYear = year;
      }
    }
    
    const totalProfit = savingsSum + feedInSum - opexSum;
    const monthlyProfit = totalProfit / (YEARS * 12);
    
    // First year values for visualization
    const firstYearSelfConsumption = Math.min(annualConsumption, annualProduction * selfConsumption);
    const firstYearSelfConsumptionNoBattery = Math.min(annualConsumption, annualProduction * baseSelfConsumption);
    const batteryGain = Math.max(0, firstYearSelfConsumption - firstYearSelfConsumptionNoBattery);
    const gridImport = Math.max(0, annualConsumption - firstYearSelfConsumption);
    const autarky = annualConsumption > 0 ? clamp(firstYearSelfConsumption / annualConsumption * 100, 0, 100) : 0;
    
    // Update visualization
    outputs.erzeugung.textContent = fmt.format(annualProduction) + ' kWh';
    outputs.netzbezug.textContent = fmt.format(gridImport) + ' kWh';
    outputs.speichernutzung.textContent = fmt.format(batteryGain) + ' kWh';
    outputs.hausverbrauch.textContent = fmt.format(annualConsumption) + ' kWh';
    outputs.autarkie.textContent = fmt.format(autarky) + ' %';
    outputs.autarkieFill.style.width = autarky.toFixed(0) + '%';
    outputs.co2ersparnis.textContent = fmt.format(annualProduction * CO2_FACTOR) + ' kg';
    
    // Update financial results
    outputs.ersparnis.textContent = fmtEur.format(savingsSum);
    outputs.einspeisung.textContent = fmtEur.format(feedInSum);
    
    const displayPayback = Math.min(paybackYear || 7, 7);
    outputs.amort.textContent = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(displayPayback) + ' Jahre';
    
    outputs.gesamtgewinn.textContent = (totalProfit < 0 ? '−' : '') + fmtEur.format(Math.abs(totalProfit));
    outputs.monatlichGewinn.textContent = fmtEur.format(monthlyProfit);
  }

  // Event listeners
  elements.btnPlus.addEventListener('click', () => {
    elements.pvModule.value = Math.min(maxModulesAllowed(), Number(elements.pvModule.value || 0) + 1);
    calculate();
  });

  elements.btnMinus.addEventListener('click', () => {
    elements.pvModule.value = Math.max(1, Number(elements.pvModule.value || 0) - 1);
    calculate();
  });

  ['input', 'change'].forEach(eventType => {
    Object.values(elements).forEach(el => {
      if (el && el.addEventListener) {
        el.addEventListener(eventType, calculate);
      }
    });
  });

  // Initial calculation
  calculate();
})();

// ===== Lead Form Submit =====
document.getElementById('leadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('.submit-btn');
  const btnText = submitBtn.querySelector('.btn-text') || submitBtn;
  const originalText = btnText.textContent;
  
  btnText.textContent = 'Sende...';
  submitBtn.disabled = true;
  
  try {
    const formData = new FormData(e.target);
    formData.set('quelle', 'Privat _Solarrechner');
    
    await fetch('https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y', {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });
    
    // Show success message
    e.target.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="margin-bottom: 1rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; color: var(--primary); margin: 0 auto; display: block;">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12l2 2 4-4"></path>
          </svg>
        </div>
        <h3 style="color: var(--primary); margin: 1rem 0;">Vielen Dank!</h3>
        <p style="color: var(--text-secondary);">Ihre Anfrage ist eingegangen. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
      </div>
    `;
    
    // Close modal after 3 seconds
    setTimeout(() => {
      closeContactModal();
    }, 3000);
  } catch (error) {
    btnText.textContent = originalText;
    submitBtn.disabled = false;
    alert('Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.');
  }
});
