/* BIOARCHITETTURA® - Main JavaScript
   Advanced Features: Navigation, Utilities, and Core Functionality
   Compatible with all features from PRs #18-#23 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeScrollEffects();
    initializeForms();
    initializeTooltips();
    initializeNewsletterSubscription();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu) return;

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger lines
        const lines = navToggle.querySelectorAll('.hamburger-line');
        lines.forEach((line, index) => {
            if (navMenu.classList.contains('active')) {
                if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) line.style.opacity = '0';
                if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                line.style.transform = 'none';
                line.style.opacity = '1';
            }
        });
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const lines = navToggle.querySelectorAll('.hamburger-line');
            lines.forEach(line => {
                line.style.transform = 'none';
                line.style.opacity = '1';
            });
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
            navMenu.classList.remove('active');
            const lines = navToggle.querySelectorAll('.hamburger-line');
            lines.forEach(line => {
                line.style.transform = 'none';
                line.style.opacity = '1';
            });
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service, .mission, .related-article, .product-card').forEach(el => {
        observer.observe(el);
    });
}

// Form utilities and validation
function initializeForms() {
    // Form validation utility
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Generic form validation
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                const value = field.value.trim();
                
                // Remove previous error styling
                field.classList.remove('error');
                
                // Validate field
                if (!value) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'Questo campo è obbligatorio');
                } else if (field.type === 'email' && !validateEmail(value)) {
                    isValid = false;
                    field.classList.add('error');
                    showFieldError(field, 'Inserisci un indirizzo email valido');
                }
            });

            if (!isValid) {
                e.preventDefault();
                showToast('Correggi gli errori nel modulo prima di continuare', 'error');
            }
        });
    });
}

// Newsletter subscription functionality
function initializeNewsletterSubscription() {
    const newsletterForm = document.getElementById('newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        
        if (!email) {
            showToast('Inserisci il tuo indirizzo email', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Inserisci un indirizzo email valido', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Iscrizione...';
        submitButton.disabled = true;
        
        // Simulate newsletter subscription (replace with real API call)
        setTimeout(() => {
            showToast('Iscrizione completata! Controlla la tua email per la conferma', 'success');
            emailInput.value = '';
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// Tooltip functionality
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = createTooltip(tooltipText);
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const existingTooltip = document.querySelector('.tooltip');
            if (existingTooltip) {
                existingTooltip.remove();
            }
        });
    });
}

// Utility Functions

// Toast notification system
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Create tooltip element
function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    // Add tooltip styles if not already in CSS
    if (!document.querySelector('.tooltip-styles')) {
        const style = document.createElement('style');
        style.className = 'tooltip-styles';
        style.textContent = `
            .tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.9rem;
                z-index: 1000;
                white-space: nowrap;
                pointer-events: none;
            }
            .tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 5px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.8);
            }
        `;
        document.head.appendChild(style);
    }
    
    return tooltip;
}

// Show field error
function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = 'color: #dc3545; font-size: 0.8rem; margin-top: 0.25rem;';
    
    // Insert after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
}

// Email validation utility
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Debounce utility for performance
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

// Throttle utility for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Local storage utilities
const LocalStorage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    },
    
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return null;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage not available:', e);
        }
    }
};

// API utility for making requests
const API = {
    get: async function(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API GET request failed:', error);
            throw error;
        }
    },
    
    post: async function(url, data, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API POST request failed:', error);
            throw error;
        }
    }
};

// Animation utilities
const Animations = {
    fadeIn: function(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    slideDown: function(element, duration = 300) {
        element.style.maxHeight = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `max-height ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.maxHeight = element.scrollHeight + 'px';
        }, 10);
        
        setTimeout(() => {
            element.style.maxHeight = '';
            element.style.overflow = '';
        }, duration);
    },
    
    slideUp: function(element, duration = 300) {
        element.style.maxHeight = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `max-height ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.maxHeight = '0';
        }, 10);
    }
};

// Performance monitoring
const Performance = {
    measurePageLoad: function() {
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log(`Page load time: ${Math.round(loadTime)}ms`);
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    'value': Math.round(loadTime)
                });
            }
        });
    },
    
    measureUserEngagement: function() {
        let startTime = Date.now();
        let isActive = true;
        
        // Track when user becomes inactive
        ['blur', 'visibilitychange'].forEach(event => {
            document.addEventListener(event, function() {
                if (document.hidden || document.visibilityState === 'hidden') {
                    isActive = false;
                } else {
                    startTime = Date.now();
                    isActive = true;
                }
            });
        });
        
        // Send engagement time before page unload
        window.addEventListener('beforeunload', function() {
            if (isActive) {
                const engagementTime = Date.now() - startTime;
                if (typeof gtag !== 'undefined' && engagementTime > 5000) {
                    gtag('event', 'engagement_time', {
                        'value': Math.round(engagementTime / 1000)
                    });
                }
            }
        });
    }
};

// Initialize performance monitoring
Performance.measurePageLoad();
Performance.measureUserEngagement();

// Export utilities for use in other scripts
window.BioArchUtils = {
    showToast,
    validateEmail,
    debounce,
    throttle,
    LocalStorage,
    API,
    Animations,
    Performance
};