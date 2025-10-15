// === ALAB Energiesysteme - Optimized Modern JavaScript ===

(function() {
    'use strict';
    
    // === Core Web Vitals Monitoring (Simplified) ===
    const initPerformanceMonitoring = () => {
        if ('PerformanceObserver' in window) {
            try {
                // Monitor LCP
                new PerformanceObserver(list => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', Math.round(lastEntry.renderTime || lastEntry.loadTime), 'ms');
                }).observe({type: 'largest-contentful-paint', buffered: true});
                
                // Monitor FID  
                new PerformanceObserver(list => {
                    const entry = list.getEntries()[0];
                    console.log('FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
                }).observe({type: 'first-input', buffered: true});
                
                // Monitor CLS
                let clsScore = 0;
                new PerformanceObserver(list => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) clsScore += entry.value;
                    });
                    console.log('CLS:', clsScore.toFixed(3));
                }).observe({type: 'layout-shift', buffered: true});
            } catch (e) {
                console.log('Performance monitoring not available');
            }
        }
    };
    
    // === Intersection Observer for Animations ===
    const setupIntersectionObserver = () => {
        if (!('IntersectionObserver' in window)) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger number animation for stats
                    if (entry.target.classList.contains('stats-row')) {
                        animateNumbers();
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe stats row
        const statsRow = document.querySelector('.stats-row');
        if (statsRow) observer.observe(statsRow);
        
        // Observe chips
        document.querySelectorAll('.chip').forEach(chip => {
            observer.observe(chip);
        });
    };
    
    // === Image Preloading (Simplified) ===
    const preloadImages = () => {
        const heroImage = document.getElementById('hero-image');
        if (!heroImage) return;
        
        const imagesToPreload = [
            heroImage.getAttribute('data-wartung'),
            heroImage.getAttribute('data-monitoring')
        ].filter(Boolean);
        
        // Preload after initial page load
        setTimeout(() => {
            imagesToPreload.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }, 2000);
    };
    
    // === Tab Functionality ===
    const setupTabs = () => {
        const heroImage = document.getElementById('hero-image');
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        if (!tabButtons.length) return;
        
        // Image transition function
        const changeImage = (imageType) => {
            if (!heroImage) return;
            
            const newImageSrc = heroImage.getAttribute(`data-${imageType}`);
            if (!newImageSrc || heroImage.src === newImageSrc) return;
            
            // Smooth transition
            heroImage.style.opacity = '0';
            
            setTimeout(() => {
                heroImage.src = newImageSrc;
                heroImage.alt = `${imageType.charAt(0).toUpperCase() + imageType.slice(1)} - ALAB Energiesysteme`;
                heroImage.style.opacity = '1';
            }, 200);
        };
    
        // Tab click handlers
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update button states
                tabButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                
                // Update panels
                tabPanels.forEach(p => p.classList.remove('show'));
                
                const panelId = this.getAttribute('data-panel');
                const panel = document.querySelector(panelId);
                if (panel) panel.classList.add('show');
                
                // Change image
                const imageType = this.getAttribute('data-image');
                if (imageType) changeImage(imageType);
                
                // Analytics
                if (window.dataLayer) {
                    window.dataLayer.push({
                        event: 'tab_click',
                        tab_name: this.getAttribute('data-gtm-label')
                    });
                }
            });
        });
    };
    
    // === Number Counter Animation ===
    const animateNumbers = () => {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            if (!target) return;
            
            const duration = 1500;
            const startTime = performance.now();
            
            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOutCubic * target);
                
                stat.textContent = current;
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    stat.textContent = target;
                }
            };
            
            requestAnimationFrame(updateNumber);
        });
    };
    
    // === Analytics Tracking ===
    const setupAnalytics = () => {
        // Track CTA clicks
        document.querySelectorAll('.hero-cta, .panel-cta').forEach(cta => {
            cta.addEventListener('click', function() {
                if (window.dataLayer) {
                    const label = this.textContent?.trim().toLowerCase().replace(/\s+/g, '_');
                    window.dataLayer.push({
                        event: 'cta_click',
                        cta_label: label
                    });
                }
            });
        });
    };
    
    // === Debounce Utility ===
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };
    
    // === Optimize for Mobile ===
    const handleResize = debounce(() => {
        const isMobile = window.innerWidth < 768;
        
        // Disable animations on mobile for better performance
        if (isMobile) {
            document.body.classList.add('reduce-motion');
        } else {
            document.body.classList.remove('reduce-motion');
        }
    }, 250);
    
    // === Initialize Everything ===
    const init = () => {
        // Performance monitoring
        initPerformanceMonitoring();
        
        // Setup components
        setupTabs();
        setupIntersectionObserver();
        setupAnalytics();
        
        // Preload images
        preloadImages();
        
        // Set up resize handler
        window.addEventListener('resize', handleResize);
        handleResize();
        
        // Mark page as ready
        document.body.classList.add('loaded');
        
        console.log('ALAB Energiesysteme - Page initialized');
    };
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();