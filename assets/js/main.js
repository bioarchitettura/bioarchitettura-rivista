// Main JavaScript for Bioarchitettura Website
// Handles navigation, mobile menu, smooth scrolling, and general functionality

document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    initializeNavigation();
    
    // Mobile menu handling
    initializeMobileMenu();
    
    // Smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Initialize forms
    initializeForms();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize lazy loading
    initializeLazyLoading();
    
    // Initialize intersection observers for animations
    initializeAnimations();
    
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize analytics tracking
    initializeAnalytics();
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], main[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// Mobile menu handling
function initializeMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            if (navOverlay) {
                navOverlay.classList.toggle('active');
            }
        });
        
        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
                
                if (navOverlay) {
                    navOverlay.classList.remove('active');
                }
            });
        });
        
        // Close mobile menu when clicking overlay
        if (navOverlay) {
            navOverlay.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navOverlay.classList.remove('active');
            });
        }
    }
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL
                history.pushState(null, null, href);
            }
        });
    });
}

// Form handling
function initializeForms() {
    // Newsletter forms
    const newsletterForms = document.querySelectorAll('.newsletter-form, .footer-newsletter');
    
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const button = this.querySelector('button[type="submit"]');
            
            if (!isValidEmail(email)) {
                showNotification('Inserisci un indirizzo email valido', 'error');
                return;
            }
            
            // Disable button during submission
            const originalText = button.textContent;
            button.textContent = 'Invio...';
            button.disabled = true;
            
            // Simulate API call (replace with actual implementation)
            setTimeout(() => {
                // Simulate successful subscription
                showNotification('Iscrizione completata con successo!', 'success');
                this.reset();
                
                button.textContent = originalText;
                button.disabled = false;
                
                // Track subscription
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'newsletter_signup', {
                        'event_category': 'engagement',
                        'event_label': 'newsletter'
                    });
                }
            }, 1000);
        });
    });
    
    // Contact forms
    const contactForms = document.querySelectorAll('.contact-form, .quick-contact-form');
    
    contactForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const button = this.querySelector('button[type="submit"]');
            
            // Basic validation
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                showNotification('Compila tutti i campi obbligatori', 'error');
                return;
            }
            
            // Email validation
            const emailField = this.querySelector('input[type="email"]');
            if (emailField && !isValidEmail(emailField.value)) {
                emailField.classList.add('error');
                showNotification('Inserisci un indirizzo email valido', 'error');
                return;
            }
            
            // Disable button during submission
            const originalText = button.textContent;
            button.textContent = 'Invio...';
            button.disabled = true;
            
            // Simulate form submission (replace with actual implementation)
            setTimeout(() => {
                showNotification('Messaggio inviato con successo!', 'success');
                this.reset();
                
                button.textContent = originalText;
                button.disabled = false;
                
                // Track form submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': 'contact_form'
                    });
                }
            }, 1000);
        });
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        clearTimeout(searchTimeout);
        
        if (query.length < 3) {
            if (searchResults) {
                searchResults.style.display = 'none';
            }
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (searchResults && !searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Search function (simplified client-side search)
function performSearch(query) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    // This is a simplified search. In production, you'd use a proper search service
    const searchableElements = document.querySelectorAll('article, .product-card, .post');
    const results = [];
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        const title = element.querySelector('h1, h2, h3, h4, .product-title, .post-title');
        
        if (text.includes(query.toLowerCase())) {
            results.push({
                title: title ? title.textContent : 'Risultato',
                text: text.substring(0, 150) + '...',
                url: element.querySelector('a') ? element.querySelector('a').href : '#'
            });
        }
    });
    
    displaySearchResults(results.slice(0, 5));
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>Nessun risultato trovato</p>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result">
                <h4><a href="${result.url}">${result.title}</a></h4>
                <p>${result.text}</p>
            </div>
        `).join('');
    }
    
    searchResults.style.display = 'block';
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"], img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    }
}

// Animation on scroll
function initializeAnimations() {
    const animatedElements = document.querySelectorAll('.card, .stat, .product-card, .recommended-article');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });
    }
}

// Accessibility features
function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }
    
    // Escape key to close modals/menus
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close mobile menu
            const navMenu = document.querySelector('.nav-menu.active');
            if (navMenu) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
            }
            
            // Close cart
            const cartSidebar = document.querySelector('.cart-sidebar.active');
            if (cartSidebar) {
                cartSidebar.classList.remove('active');
                document.querySelector('.cart-overlay').classList.remove('active');
                document.body.classList.remove('cart-open');
            }
            
            // Close language dropdown
            const langDropdown = document.querySelector('.language-dropdown.active');
            if (langDropdown) {
                langDropdown.classList.remove('active');
            }
        }
    });
    
    // Focus management
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    // Trap focus in modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const modal = document.querySelector('.cart-sidebar.active');
            if (modal) {
                const focusable = modal.querySelectorAll(focusableElements);
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });
}

// Analytics tracking
function initializeAnalytics() {
    // Track page views
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    // Track external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'outbound',
                    'event_label': this.href,
                    'transport_type': 'beacon'
                });
            }
        });
    });
    
    // Track downloads
    document.querySelectorAll('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".zip"]').forEach(link => {
        link.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'file_download', {
                    'event_category': 'engagement',
                    'event_label': this.href,
                    'transport_type': 'beacon'
                });
            }
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            // Track at 25%, 50%, 75%, and 100%
            if ([25, 50, 75, 100].includes(scrollPercent)) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        'event_category': 'engagement',
                        'event_label': scrollPercent + '%',
                        'value': scrollPercent
                    });
                }
            }
        }
    });
    
    // Track time on page
    let startTime = Date.now();
    let timeOnPage = 0;
    
    setInterval(function() {
        timeOnPage = Math.round((Date.now() - startTime) / 1000);
        
        // Track at 30 seconds, 1 minute, 3 minutes, 5 minutes
        if ([30, 60, 180, 300].includes(timeOnPage)) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    'name': 'time_on_page',
                    'value': timeOnPage
                });
            }
        }
    }, 1000);
}

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" aria-label="Chiudi notifica">×</button>
    `;
    
    // Create container if it doesn't exist
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Utility functions
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(context, args);
    };
}

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

// Export functions for use in other scripts
window.BioarchitetturaApp = {
    showNotification,
    debounce,
    throttle,
    isValidEmail
};

// CSS for notifications (injected dynamically)
const notificationCSS = `
.notifications-container {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10000;
    max-width: 350px;
}

.notification {
    background: white;
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
    border-left: 4px solid #007bff;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-success {
    border-left-color: #28a745;
    background: #f8fff8;
}

.notification-error {
    border-left-color: #dc3545;
    background: #fff8f8;
}

.notification-warning {
    border-left-color: #ffc107;
    background: #fffdf8;
}

.notification button {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    margin-left: 15px;
    padding: 0;
}

.notification button:hover {
    color: #666;
}

@media (max-width: 768px) {
    .notifications-container {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

// Inject notification CSS
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = notificationCSS;
    document.head.appendChild(style);
}

// Additional CSS for animations
const animationCSS = `
.card, .stat, .product-card, .recommended-article {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.card.animate-in, .stat.animate-in, .product-card.animate-in, .recommended-article.animate-in {
    opacity: 1;
    transform: translateY(0);
}

img[loading="lazy"] {
    opacity: 0;
    transition: opacity 0.3s ease;
}

img[loading="lazy"].loaded {
    opacity: 1;
}

.navbar {
    transition: transform 0.3s ease;
}

.navbar.scrolled {
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

input.error, textarea.error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2) !important;
}
`;

// Inject animation CSS
if (!document.querySelector('#animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = animationCSS;
    document.head.appendChild(style);
}