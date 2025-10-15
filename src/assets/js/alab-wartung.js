// ========================================
// Modern PV Maintenance Website JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // Loading Animation
    // ========================================
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        requestAnimationFrame(() => {
            loaderWrapper.style.display = 'none';
        });
    }

    // ========================================
    // Progress Indicator
    // ========================================
    const progressIndicator = document.querySelector('.progress-indicator');
    
    function updateProgressIndicator() {
        if (!progressIndicator) return;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const progress = (scrolled / documentHeight) * 100;
        progressIndicator.style.width = progress + '%';
    }

    // ========================================
    // Smooth Scroll for Navigation Links
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========================================
    // FAQ Accordion
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle current item
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                answer.style.maxHeight = null;
            }
        });
    });

    // ========================================
    // Process Timeline Animation (FIXED)
    // ========================================
    const processSteps = document.querySelectorAll('.process-step');
    const timelineProgress = document.querySelector('.timeline-progress');
    const processTimeline = document.querySelector('.process-timeline');
    
    if (processSteps.length > 0 && timelineProgress && processTimeline) {
        // Observer for making steps visible
        const processObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        processSteps.forEach(step => {
            processObserver.observe(step);
        });
        
        // Update timeline progress on scroll
        function updateTimelineProgress() {
            const timelineRect = processTimeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const timelineTop = timelineRect.top;
            const timelineHeight = timelineRect.height;
            
            // Only update if timeline is in viewport
            if (timelineTop < windowHeight && timelineRect.bottom > 0) {
                // Calculate scroll progress
                const scrolled = windowHeight - timelineTop;
                const totalScrollable = timelineHeight + windowHeight;
                let progress = (scrolled / totalScrollable) * 100;
                
                // Clamp between 0 and 100
                progress = Math.max(0, Math.min(100, progress));
                
                // Apply to timeline
                timelineProgress.style.height = `${progress}%`;
            } else if (timelineTop >= windowHeight) {
                // Before timeline is visible
                timelineProgress.style.height = '0%';
            } else {
                // After timeline has passed
                timelineProgress.style.height = '100%';
            }
        }
        
        // Throttled scroll handler for better performance
        let timelineScrollTimeout;
        function throttledTimelineUpdate() {
            if (!timelineScrollTimeout) {
                timelineScrollTimeout = setTimeout(() => {
                    updateTimelineProgress();
                    timelineScrollTimeout = null;
                }, 10);
            }
        }
        
        // Call on scroll
        window.addEventListener('scroll', throttledTimelineUpdate, { passive: true });
        window.addEventListener('resize', updateTimelineProgress, { passive: true });
        
        // Initial call
        updateTimelineProgress();
    }

    // ========================================
    // Form Handling
    // ========================================
    const FT_MAKE_URL = "https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y";
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const button = this.querySelector('button[type="submit"]');
            const originalButtonContent = button.innerHTML;
            const formData = new FormData(this);
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wird gesendet...';
            
            try {
                formData.append('source', 'pv_maintenance_form');
                
                const response = await fetch(FT_MAKE_URL, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    button.innerHTML = '<i class="fas fa-check"></i> Erfolgreich gesendet!';
                    button.classList.add('btn-success'); // Optional: Add a success class for styling
                    this.reset();
                    showNotification('Vielen Dank! Wir melden uns schnellstmöglich bei Ihnen.', 'success');
                } else {
                    throw new Error('Form submission failed with status: ' + response.status);
                }
            } catch (error) {
                console.error('Form Submission Error:', error);
                button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler aufgetreten';
                button.classList.add('btn-danger'); // Optional: Add an error class for styling
                showNotification('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'error');
            } finally {
                 setTimeout(() => {
                    button.innerHTML = originalButtonContent;
                    button.disabled = false;
                    button.classList.remove('btn-success', 'btn-danger');
                }, 4000);
            }
        });
    }

    // ========================================
    // Notification System
    // ========================================
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 5000);
    }

    // ========================================
    // Optimized Scroll & Resize Handlers
    // ========================================
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateProgressIndicator();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
});
