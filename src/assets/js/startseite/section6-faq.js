/**
 * ALAB Premium FAQ - Interactive JavaScript
 * Features: Search, Category Filter, Smooth Animations, Performance Optimized
 */

(function() {
  'use strict';

  // DOM Elements Cache
  const elements = {
    categoryBtns: null,
    faqItems: null,
    noResults: null,
    resetBtn: null,
    expandBtns: null,
    floatingContainer: null
  };

  // State Management
  const state = {
    currentCategory: 'all',
    searchTerm: '',
    expandedItems: new Set()
  };

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', init);

  /**
   * Initialize FAQ System
   */
  function init() {
    cacheElements();
    if (!validateElements()) return;
    
    setupEventListeners();
    setupFloatingIcons();
    setupIntersectionObserver();
    initializeAnimations();
  }

  /**
   * Cache DOM Elements
   */
  function cacheElements() {
    elements.categoryBtns = document.querySelectorAll('.tab-btn');
    elements.faqItems = document.querySelectorAll('.faq-item');
    elements.noResults = document.querySelector('.no-results');
    elements.resetBtn = document.querySelector('.reset-search');
    elements.expandBtns = document.querySelectorAll('.expand-btn');
    elements.floatingContainer = document.querySelector('.floating-icons-container');
  }

  /**
   * Validate Required Elements
   */
  function validateElements() {
    if (!elements.faqItems.length) {
      console.warn('No FAQ items found');
      return false;
    }
    return true;
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Category tabs
    elements.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        elements.categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update category and filter
        state.currentCategory = btn.dataset.category;
        filterFAQs();
        
        // Animate button
        animateButtonClick(btn);
      });
    });

    // FAQ expand/collapse
    elements.faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const expandBtn = item.querySelector('.expand-btn');
      
      const toggleExpand = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isExpanded = item.classList.contains('expanded');
        
        if (isExpanded) {
          collapseItem(item);
        } else {
          // Collapse other items (accordion behavior)
          elements.faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('expanded')) {
              collapseItem(otherItem);
            }
          });
          expandItem(item);
        }
      };
      
      question.addEventListener('click', toggleExpand);
      expandBtn.addEventListener('click', toggleExpand);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
    });
  }

  /**
   * Expand FAQ Item with Animation
   */
  function expandItem(item) {
    const answer = item.querySelector('.faq-answer');
    const content = item.querySelector('.answer-content');
    
    if (!answer || !content) return;
    
    // Add expanded class
    item.classList.add('expanded');
    state.expandedItems.add(item);
    
    // Animate height
    const targetHeight = content.scrollHeight;
    answer.style.maxHeight = targetHeight + 'px';
    
    // Animate progress bars if present
    const progressBars = item.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.width = bar.getAttribute('data-width') || bar.style.width;
      }, 100 * index);
    });
    
    // Trigger any chart animations
    animateCharts(item);
  }

  /**
   * Collapse FAQ Item with Animation
   */
  function collapseItem(item) {
    const answer = item.querySelector('.faq-answer');
    
    if (!answer) return;
    
    // Remove expanded class
    item.classList.remove('expanded');
    state.expandedItems.delete(item);
    
    // Animate height
    answer.style.maxHeight = '0';
  }

  /**
   * Filter FAQs based on category
   */
  function filterFAQs() {
    let visibleCount = 0;
    
    elements.faqItems.forEach(item => {
      const category = item.dataset.category;
      
      // Check category match
      const categoryMatch = state.currentCategory === 'all' || category === state.currentCategory;
      
      // Show/hide item
      if (categoryMatch) {
        showItem(item, visibleCount * 50);
        visibleCount++;
      } else {
        hideItem(item);
      }
    });
    
    // Update count badges
    updateCategoryCount(visibleCount);
  }

  /**
   * Show FAQ Item with Animation
   */
  function showItem(item, delay = 0) {
    setTimeout(() => {
      item.style.display = 'block';
      item.style.animation = 'fadeInUp 0.4s ease forwards';
    }, delay);
  }

  /**
   * Hide FAQ Item with Animation
   */
  function hideItem(item) {
    item.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
      item.style.display = 'none';
    }, 300);
  }

  /**
   * Update Category Count Badges
   */
  function updateCategoryCount(visibleCount) {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) {
      const countBadge = activeBtn.querySelector('.tab-count');
      if (countBadge) {
        countBadge.textContent = visibleCount;
      }
    }
  }

  /**
   * Setup Floating Background Icons
   */
  function setupFloatingIcons() {
    if (!elements.floatingContainer) return;
    
    const icons = [
      '⚡', '🌞', '🔋', '💡', '🏠', '⚙️', '📊', '🌍'
    ];
    
    // Create floating icons
    for (let i = 0; i < 8; i++) {
      const icon = document.createElement('div');
      icon.className = 'floating-icon';
      icon.innerHTML = `<span style="position: relative; z-index: 1; font-size: 24px; filter: none;">${icons[i % icons.length]}</span>`;
      
      // Random starting position
      icon.style.left = `${Math.random() * 100}%`;
      icon.style.top = `${Math.random() * 100}%`;
      
      // Random animation duration
      icon.style.animationDuration = `${15 + Math.random() * 15}s`;
      icon.style.animationDelay = `${Math.random() * 5}s`;
      
      elements.floatingContainer.appendChild(icon);
    }
  }

  /**
   * Setup Intersection Observer for Scroll Animations
   */
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
      observer.observe(card);
    });
    
    // Observe FAQ items
    elements.faqItems.forEach(item => {
      observer.observe(item);
    });
  }

  /**
   * Animate Button Click
   */
  function animateButtonClick(btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 200);
  }

  /**
   * Animate Charts and Progress Bars
   */
  function animateCharts(item) {
    // Animate progress bars
    const progressBars = item.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
      setTimeout(() => {
        const width = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          bar.style.width = width;
        });
      }, index * 100);
    });
    
    // Animate numbers
    const numbers = item.querySelectorAll('[data-count]');
    numbers.forEach(num => {
      const target = parseInt(num.dataset.count);
      animateNumber(num, 0, target, 1000);
    });
  }

  /**
   * Animate Number Counter
   */
  function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = end;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  /**
   * Initialize Page Animations
   */
  function initializeAnimations() {
    // Stagger animations for initial load
    document.querySelectorAll('[data-aos]').forEach((element, index) => {
      const delay = element.dataset.aosDelay || index * 50;
      element.style.animationDelay = `${delay}ms`;
    });
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Performance optimization - GPU acceleration
    elements.faqItems.forEach(item => {
      item.style.willChange = 'transform, opacity';
    });
  }

  /**
   * Add custom CSS animations dynamically
   */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .faq-item {
      opacity: 0;
    }
    
    .stat-card {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  /**
   * Performance Monitoring (Development Only)
   */
  if (window.location.hostname === 'localhost') {
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    perfObserver.observe({ entryTypes: ['measure'] });
  }

})();

/**
 * External API for controlling FAQ
 */
window.FAQController = {
  expandAll: function() {
    document.querySelectorAll('.faq-item').forEach(item => {
      if (!item.classList.contains('expanded')) {
        item.querySelector('.faq-question').click();
      }
    });
  },
  
  collapseAll: function() {
    document.querySelectorAll('.faq-item.expanded').forEach(item => {
      item.querySelector('.faq-question').click();
    });
  },
  
  openAIChat: function() {
    const aiBtn = document.getElementById('open-ai-chat');
    if (aiBtn) aiBtn.click();
  },
  
  setCategory: function(category) {
    const btn = document.querySelector(`[data-category="${category}"]`);
    if (btn) btn.click();
  }
};
