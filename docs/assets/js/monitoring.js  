// ALAB Monitoring Professional - Full Interactive JavaScript with Make.com Integration

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ALAB Professional Monitoring loaded');
    
    // Initialize Swiper for Functions
    const functionsSwiper = new Swiper('.functions-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.functions-swiper .swiper-button-next',
            prevEl: '.functions-swiper .swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 40
            }
        }
    });

    // Initialize Swiper for Cases
    const casesSwiper = new Swiper('.cases-swiper', {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        coverflowEffect: {
            rotate: 30,
            stretch: 0,
            depth: 150,
            modifier: 1,
            slideShadows: true,
        },
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.cases-swiper .swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.cases-swiper .swiper-button-next',
            prevEl: '.cases-swiper .swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            768: {
                slidesPerView: 1,
                spaceBetween: 30
            },
            1024: {
                slidesPerView: 1.5,
                spaceBetween: 40
            }
        }
    });

    // KPI Counter Animation
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            
            // Handle decimal values
            if (element.getAttribute('data-value').includes('.')) {
                element.textContent = (progress * (end - start) + start).toFixed(1);
            } else {
                element.textContent = value;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Observe KPI cards
    const kpiObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const target = entry.target;
                const endValue = parseFloat(target.getAttribute('data-value'));
                animateValue(target, 0, endValue, 2000);
                target.classList.add('animated');
            }
        });
    });

    document.querySelectorAll('.kpi-number').forEach(kpi => {
        kpiObserver.observe(kpi);
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const icon = faq.querySelector('.faq-question i');
                if (icon) {
                    icon.style.transform = 'rotate(0)';
                }
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                const icon = question.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });
    });

    // Navigation Active State
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // Smooth Scroll for Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // CTA Button handlers
    document.querySelector('.nav-cta').addEventListener('click', () => {
        showContactModal();
    });

    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            showContactModal();
        });
    });

    document.querySelectorAll('.package-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showContactModal();
        });
    });

    // Contact Modal with Make.com Integration
    function showContactModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'contact-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>Monitoring anfragen</h2>
                <form class="contact-form" id="contactForm">
                    <input type="text" name="name" placeholder="Name" required>
                    <input type="email" name="email" placeholder="E-Mail" required>
                    <input type="tel" name="phone" placeholder="Telefon">
                    <input type="text" name="power" placeholder="Anlagenleistung (kWp)">
                    <textarea name="message" placeholder="Ihre Nachricht" rows="4"></textarea>
                    <button type="submit" class="btn-submit">Anfrage senden</button>
                </form>
                <div class="success-animation" id="successAnimation" style="display: none;">
                    <div class="success-checkmark">
                        <svg viewBox="0 0 52 52">
                            <circle cx="26" cy="26" r="25" fill="none" stroke="#d4af37" stroke-width="2"/>
                            <path fill="none" stroke="#d4af37" stroke-width="3" d="M14 27l8 8 16-16"/>
                        </svg>
                    </div>
                    <h3>Erfolgreich gesendet!</h3>
                    <p>Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add styles for modal
        const style = document.createElement('style');
        style.textContent = `
            .contact-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 30px;
                cursor: pointer;
                color: #999;
            }
            
            .modal-content h2 {
                margin-bottom: 30px;
                color: #0f2533;
                font-size: 28px;
            }
            
            .contact-form {
                display: grid;
                gap: 15px;
            }
            
            .contact-form input,
            .contact-form textarea {
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 10px;
                font-family: 'Montserrat', sans-serif;
                font-size: 14px;
            }
            
            .contact-form input:focus,
            .contact-form textarea:focus {
                outline: none;
                border-color: #d4af37;
            }
            
            .btn-submit {
                background: linear-gradient(135deg, #d4af37 0%, #c49d2f 100%);
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .btn-submit:hover {
                transform: translateY(-2px);
            }
            
            .btn-submit:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .success-animation {
                text-align: center;
                padding: 40px;
            }
            
            .success-checkmark {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }
            
            .success-checkmark svg {
                animation: scaleIn 0.5s ease;
            }
            
            .success-checkmark circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                animation: strokeAnimation 0.6s 0.3s ease forwards;
            }
            
            .success-checkmark path {
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: strokeAnimation 0.4s 0.9s ease forwards;
            }
            
            @keyframes strokeAnimation {
                to {
                    stroke-dashoffset: 0;
                }
            }
            
            @keyframes scaleIn {
                from {
                    transform: scale(0);
                }
                to {
                    transform: scale(1);
                }
            }
            
            .success-animation h3 {
                color: #d4af37;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .success-animation p {
                color: #666;
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
        
        // Handle form submission with Make.com webhook
        const form = modal.querySelector('#contactForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wird gesendet...';
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('https://hook.eu2.make.com/yloo9gmjoxtsua7r2g5z6af9lqs0ei3y', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...data,
                        timestamp: new Date().toISOString(),
                        source: 'ALAB Monitoring Website'
                    })
                });
                
                // Show success animation
                form.style.display = 'none';
                const successAnim = modal.querySelector('#successAnimation');
                successAnim.style.display = 'block';
                
                // Close modal after 3 seconds
                setTimeout(() => {
                    modal.remove();
                }, 3000);
                
            } catch (error) {
                console.error('Error submitting form:', error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Anfrage senden';
                alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            }
        });
    }

    // Parallax scrolling effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-bg');
        if (parallax) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add 3D tilt effect to cards on mousemove
    const cards3D = document.querySelectorAll('.kpi-card-3d, .package-card');
    
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Floating particles animation enhancement
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        particle.style.animationDuration = `${20 + index * 5}s`;
        particle.style.left = `${Math.random() * 100}%`;
    });

    console.log('✅ All features initialized successfully!');
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll handlers
window.addEventListener('scroll', debounce(() => {
    // Update navigation on scroll
    document.dispatchEvent(new Event('updateNav'));
}, 100));
