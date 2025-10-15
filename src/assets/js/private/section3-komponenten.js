// Component data storage
const componentData = {
    'solar-module': {
        title: 'Hochleistungs-Solarmodule',
        description: 'Premium monokristalline Module mit über 22% Wirkungsgrad. 25 Jahre Leistungsgarantie und optimale Performance auch bei Teilverschattung durch Half-Cut-Technologie.',
        image: 'https://static.wixstatic.com/media/cac2b9_e73caaca8f0840e49db2cbd113c61e47~mv2.png',
        specs: [
            '⚡ 410-450 Wp Leistung',
            '🛡️ Hagelschutz-zertifiziert',
            '📊 Bifaziale Option verfügbar'
        ]
    },
    'inverter': {
        title: 'Hybrid-Wechselrichter',
        description: 'Intelligente Energiezentrale mit integriertem Batteriemanagement. Höchste Effizienz von 98,6% und nahtlose Notstromversorgung bei Netzausfall.',
        image: 'https://static.wixstatic.com/media/cac2b9_b745872ea6bb43dba4e85115de67fd52~mv2.png',
        specs: [
            '🔄 3-phasig, 5-15 kW',
            '📱 App-Steuerung',
            '🔇 Flüsterleiser Betrieb'
        ]
    },
    'battery': {
        title: 'Lithium-Batteriespeicher',
        description: 'Modulares Speichersystem mit LiFePO4-Technologie für maximale Sicherheit und Langlebigkeit. Skalierbar von 5 bis 30 kWh je nach Bedarf.',
        image: 'https://static.wixstatic.com/media/cac2b9_b475e75047d94ddf8e3f29f7cddea9e2~mv2.jpg',
        specs: [
            '🔋 6000+ Ladezyklen',
            '⚙️ 95% Entladetiefe',
            '🏠 Notstromfähig'
        ]
    },
    'mounting': {
        title: 'Premium-Unterkonstruktion',
        description: 'Aerodynamisch optimiertes Montagesystem aus eloxiertem Aluminium. TÜV-geprüft für alle Dacharten und Windlasten bis 200 km/h.',
        image: 'https://static.wixstatic.com/media/cac2b9_e28984ed97cc4b81b2e4059cc1bc54a8~mv2.jpg',
        specs: [
            '🏗️ 20 Jahre Garantie',
            '🌧️ Korrosionsbeständig',
            '⚡ Kreuzschienensystem'
        ]
    },
    'monitoring': {
        title: 'Smart Energy Management',
        description: 'KI-gestützte Überwachung und Optimierung in Echtzeit. Predictive Maintenance erkennt Probleme bevor sie auftreten.',
        image: 'https://static.wixstatic.com/media/cac2b9_f549c91c62b64c19baf6d742c420d3a9~mv2.jpg',
        specs: [
            '📊 Live-Monitoring',
            '🤖 KI-Optimierung',
            '💰 Ertragsvorhersage'
        ]
    }
};

// DOM elements
let hotspots = [];
let infoCards = [];
let accordionItems = [];
let activeHotspot = null;
let activeCard = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeHotspots();
    initializeMobileAccordion();
    setupEventListeners();
    addConnectionLines();
});

// Initialize hotspots
function initializeHotspots() {
    hotspots = document.querySelectorAll('.hotspot');
    infoCards = document.querySelectorAll('.info-card');
    
    // Set up info cards with proper IDs
    hotspots.forEach(hotspot => {
        const componentId = hotspot.dataset.component;
        const card = document.getElementById(`${componentId}-card`);
        
        if (card) {
            // Position card based on hotspot position
            positionCard(hotspot, card);
        }
    });
}

// Initialize mobile accordion
function initializeMobileAccordion() {
    accordionItems = document.querySelectorAll('.accordion-item');
}

// Set up all event listeners
function setupEventListeners() {
    // Desktop hotspot interactions
    hotspots.forEach(hotspot => {
        hotspot.addEventListener('click', (e) => {
            e.stopPropagation();
            handleHotspotClick(hotspot);
        });
        
        hotspot.addEventListener('mouseenter', () => {
            if (!activeHotspot) {
                createHoverLine(hotspot);
            }
        });
        
        hotspot.addEventListener('mouseleave', () => {
            removeHoverLine();
        });
    });
    
    // Mobile accordion interactions
    accordionItems.forEach(item => {
        item.addEventListener('click', () => {
            handleAccordionClick(item);
        });
    });
    
    // Close card when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.hotspot') && !e.target.closest('.info-card')) {
            closeAllCards();
        }
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeHotspot && activeCard) {
                positionCard(activeHotspot, activeCard);
            }
        }, 100);
    });
}

// Handle hotspot click
function handleHotspotClick(hotspot) {
    const componentId = hotspot.dataset.component;
    const card = document.getElementById(`${componentId}-card`);
    
    if (!card) return;
    
    // If clicking the same hotspot, close it
    if (activeHotspot === hotspot) {
        closeAllCards();
        return;
    }
    
    // Close any open card
    closeAllCards();
    
    // Open new card
    setTimeout(() => {
        openCard(hotspot, card);
    }, 100);
}

// Open info card
function openCard(hotspot, card) {
    // Mark hotspot as active
    hotspot.classList.add('active');
    activeHotspot = hotspot;
    
    // Mark other hotspots as inactive
    hotspots.forEach(h => {
        if (h !== hotspot) {
            h.classList.add('inactive');
        }
    });
    
    // Position and show card
    positionCard(hotspot, card);
    card.classList.add('active');
    activeCard = card;
    
    // Create connection line
    createConnectionLine(hotspot, card);
}

// Close all cards
function closeAllCards() {
    // Remove active states
    hotspots.forEach(h => {
        h.classList.remove('active', 'inactive');
    });
    
    infoCards.forEach(card => {
        card.classList.remove('active');
    });
    
    // Remove connection lines
    removeConnectionLines();
    
    activeHotspot = null;
    activeCard = null;
}

// Position card relative to hotspot
function positionCard(hotspot, card) {
    const hotspotRect = hotspot.getBoundingClientRect();
    const containerRect = hotspot.closest('.hero-image-wrapper').getBoundingClientRect();
    const cardWidth = 360;
    const cardHeight = card.offsetHeight || 400;
    const padding = 20;
    
    // Calculate relative position
    const hotspotRelativeLeft = hotspotRect.left - containerRect.left;
    const hotspotRelativeTop = hotspotRect.top - containerRect.top;
    
    // Determine best position (right, left, or bottom)
    let cardLeft, cardTop;
    let positionClass = '';
    
    // Check if card fits on the right
    if (containerRect.right - hotspotRect.right > cardWidth + padding) {
        cardLeft = hotspotRelativeLeft + hotspotRect.width + padding;
        cardTop = hotspotRelativeTop - cardHeight / 2 + hotspotRect.height / 2;
        positionClass = 'position-right';
    }
    // Check if card fits on the left
    else if (hotspotRect.left - containerRect.left > cardWidth + padding) {
        cardLeft = hotspotRelativeLeft - cardWidth - padding;
        cardTop = hotspotRelativeTop - cardHeight / 2 + hotspotRect.height / 2;
        positionClass = 'position-left';
    }
    // Default to bottom
    else {
        cardLeft = hotspotRelativeLeft - cardWidth / 2 + hotspotRect.width / 2;
        cardTop = hotspotRelativeTop + hotspotRect.height + padding;
        positionClass = 'position-bottom';
    }
    
    // Ensure card stays within bounds
    cardLeft = Math.max(padding, Math.min(cardLeft, containerRect.width - cardWidth - padding));
    cardTop = Math.max(padding, Math.min(cardTop, containerRect.height - cardHeight - padding));
    
    // Apply position
    card.style.left = `${cardLeft}px`;
    card.style.top = `${cardTop}px`;
    
    // Apply position class
    card.className = card.className.replace(/position-\w+/g, '');
    card.classList.add(positionClass);
}

// Create connection line between hotspot and card
function createConnectionLine(hotspot, card) {
    removeConnectionLines();
    
    if (!card) return;
    
    const line = document.createElement('div');
    line.className = 'connection-line';
    line.style.cssText = `
        position: absolute;
        background: linear-gradient(135deg, #E5C44D, #F3D663);
        z-index: 15;
        pointer-events: none;
        transition: all 0.3s ease;
    `;
    
    const hotspotRect = hotspot.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const containerRect = hotspot.closest('.hero-image-wrapper').getBoundingClientRect();
    
    // Calculate line position and dimensions
    const hotspotCenterX = hotspotRect.left + hotspotRect.width / 2 - containerRect.left;
    const hotspotCenterY = hotspotRect.top + hotspotRect.height / 2 - containerRect.top;
    
    let cardConnectX, cardConnectY;
    
    if (card.classList.contains('position-right')) {
        cardConnectX = cardRect.left - containerRect.left;
        cardConnectY = cardRect.top + cardRect.height / 2 - containerRect.top;
        line.style.width = `${cardConnectX - hotspotCenterX}px`;
        line.style.height = '2px';
        line.style.left = `${hotspotCenterX}px`;
        line.style.top = `${hotspotCenterY}px`;
    } else if (card.classList.contains('position-left')) {
        cardConnectX = cardRect.right - containerRect.left;
        cardConnectY = cardRect.top + cardRect.height / 2 - containerRect.top;
        line.style.width = `${hotspotCenterX - cardConnectX}px`;
        line.style.height = '2px';
        line.style.left = `${cardConnectX}px`;
        line.style.top = `${hotspotCenterY}px`;
    } else {
        cardConnectX = cardRect.left + cardRect.width / 2 - containerRect.left;
        cardConnectY = cardRect.top - containerRect.top;
        line.style.width = '2px';
        line.style.height = `${cardConnectY - hotspotCenterY}px`;
        line.style.left = `${hotspotCenterX}px`;
        line.style.top = `${hotspotCenterY}px`;
    }
    
    hotspot.closest('.hero-image-wrapper').appendChild(line);
}

// Create hover line preview
function createHoverLine(hotspot) {
    const line = document.createElement('div');
    line.className = 'hover-line';
    line.style.cssText = `
        position: absolute;
        background: linear-gradient(135deg, #E5C44D, #F3D663);
        opacity: 0.3;
        z-index: 14;
        pointer-events: none;
        width: 30px;
        height: 2px;
        transition: all 0.2s ease;
    `;
    
    const hotspotRect = hotspot.getBoundingClientRect();
    const containerRect = hotspot.closest('.hero-image-wrapper').getBoundingClientRect();
    
    const hotspotCenterX = hotspotRect.left + hotspotRect.width / 2 - containerRect.left;
    const hotspotCenterY = hotspotRect.top + hotspotRect.height / 2 - containerRect.top;
    
    line.style.left = `${hotspotCenterX + hotspotRect.width / 2}px`;
    line.style.top = `${hotspotCenterY}px`;
    
    hotspot.closest('.hero-image-wrapper').appendChild(line);
}

// Remove hover line
function removeHoverLine() {
    const hoverLine = document.querySelector('.hover-line');
    if (hoverLine) {
        hoverLine.remove();
    }
}

// Remove connection lines
function removeConnectionLines() {
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach(line => line.remove());
}

// Add connection lines between hotspots and cards
function addConnectionLines() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '5';
    svg.style.opacity = '0';
    svg.style.transition = 'opacity 0.3s ease';
    
    const heroWrapper = document.querySelector('.hero-image-wrapper');
    if (heroWrapper) {
        heroWrapper.appendChild(svg);
        
        // Show connection lines when a hotspot is active
        setTimeout(() => {
            svg.style.opacity = '1';
        }, 100);
    }
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'lineGradient');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#E5C44D');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#F3D663');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
}

// Handle mobile accordion click
function handleAccordionClick(item) {
    const componentId = item.dataset.component;
    
    // Toggle active state
    const wasActive = item.classList.contains('active');
    
    // Remove active from all items
    accordionItems.forEach(i => i.classList.remove('active'));
    
    // Add active to clicked item if it wasn't active
    if (!wasActive) {
        item.classList.add('active');
        
        // Scroll to corresponding section in image (if visible)
        const hotspot = document.querySelector(`.hotspot[data-component="${componentId}"]`);
        if (hotspot && window.innerWidth > 768) {
            hotspot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Trigger hotspot animation
            hotspot.classList.add('active');
            setTimeout(() => {
                hotspot.classList.remove('active');
            }, 1000);
        }
    }
}

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScroll = (element, to, duration) => {
        const start = element.scrollTop;
        const change = to - start;
        let currentTime = 0;
        const increment = 20;
        
        const animateScroll = () => {
            currentTime += increment;
            const val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            
            if (currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        
        animateScroll();
    };
    
    Math.easeInOutQuad = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };
}

// Enhanced animations removed to prevent flickering
function addEnhancedAnimations() {
    // Disabled to prevent flickering issues
    return;
}

// Parallax effect removed to prevent flickering
function addParallaxEffect() {
    // Disabled to prevent flickering issues
    return;
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes connectionPulse {
        0%, 100% {
            opacity: 0.3;
            stroke-dashoffset: 0;
        }
        50% {
            opacity: 0.8;
            stroke-dashoffset: -10;
        }
    }
`;
document.head.appendChild(style);
