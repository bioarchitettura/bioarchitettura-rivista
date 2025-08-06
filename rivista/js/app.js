/**
 * BIOARCHITETTURA® Rivista - JavaScript Application
 * Modern vanilla JavaScript with modular architecture
 * WordPress REST API integration ready
 */

// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Navigation.init();
    NewsletterForm.init();
    SmoothScrolling.init();
    LazyLoading.init();
    ResponsiveImages.init();
    WordPressAPI.init();
    Analytics.init();
    
    // Add fade-in animation to sections
    const sections = $$('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
});

// ===== NAVIGATION MODULE =====
const Navigation = {
    init() {
        this.setupMobileMenu();
        this.setupActiveLinks();
        this.setupScrollSpy();
    },
    
    setupMobileMenu() {
        const navToggle = $('#nav-toggle');
        const navMenu = $('.nav-menu');
        const navLinks = $$('.nav-link');
        
        if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close menu when clicking on links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    },
    
    setupActiveLinks() {
        const navLinks = $$('.nav-link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || 
                (currentPath.includes('rivista') && href === 'index.html') ||
                (currentPath.endsWith('/') && href === '#')) {
                link.classList.add('active');
            }
        });
    },
    
    setupScrollSpy() {
        const sections = $$('section[id]');
        const navLinks = $$('.nav-link[href^="#"]');
        
        if (sections.length === 0 || navLinks.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const navLink = $(`.nav-link[href="#${id}"]`);
                
                if (entry.isIntersecting && navLink) {
                    $$('.nav-link').forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            });
        }, { threshold: 0.3 });
        
        sections.forEach(section => observer.observe(section));
    }
};

// ===== SMOOTH SCROLLING MODULE =====
const SmoothScrolling = {
    init() {
        const anchorLinks = $$('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const target = $(href);
                
                if (target) {
                    e.preventDefault();
                    const headerHeight = $('.header')?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
};

// ===== NEWSLETTER FORM MODULE =====
const NewsletterForm = {
    init() {
        const form = $('#newsletter-form');
        if (!form) return;
        
        form.addEventListener('submit', this.handleSubmit.bind(this));
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Validate email
        if (!this.validateEmail(email)) {
            this.showMessage('Inserisci un indirizzo email valido', 'error');
            return;
        }
        
        // Update button state
        submitButton.textContent = 'Iscrizione...';
        submitButton.disabled = true;
        
        try {
            // In a real implementation, this would connect to WordPress REST API
            const success = await this.submitToWordPress(email);
            
            if (success) {
                this.showMessage('Grazie! Ti abbiamo iscritto alla newsletter.', 'success');
                e.target.reset();
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showMessage('Si è verificato un errore. Riprova più tardi.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    },
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    async submitToWordPress(email) {
        // Mock WordPress API call - replace with real endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Newsletter subscription for: ${email}`);
                // Simulate success
                resolve(true);
            }, 1000);
        });
    },
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = $('.newsletter-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `newsletter-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
            ${type === 'success' 
                ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
                : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        
        const form = $('#newsletter-form');
        form.appendChild(messageEl);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
};

// ===== LAZY LOADING MODULE =====
const LazyLoading = {
    init() {
        const images = $$('img[src*="placeholder"], img[data-src]');
        
        if (images.length === 0) return;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src') || this.getPlaceholderImage();
                    
                    if (src) {
                        img.src = src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    },
    
    getPlaceholderImage() {
        // Return placeholder image URL or generate one
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f1f3f4"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
                      fill="#666" text-anchor="middle" dy=".3em">
                    Immagine Bioarchitettura
                </text>
            </svg>
        `);
    }
};

// ===== RESPONSIVE IMAGES MODULE =====
const ResponsiveImages = {
    init() {
        this.updateImages();
        window.addEventListener('resize', debounce(this.updateImages.bind(this), 250));
    },
    
    updateImages() {
        const images = $$('img[data-sizes]');
        
        images.forEach(img => {
            const sizes = JSON.parse(img.getAttribute('data-sizes') || '{}');
            const viewportWidth = window.innerWidth;
            
            let selectedSrc = img.src;
            
            if (viewportWidth <= 768 && sizes.mobile) {
                selectedSrc = sizes.mobile;
            } else if (viewportWidth <= 1024 && sizes.tablet) {
                selectedSrc = sizes.tablet;
            } else if (sizes.desktop) {
                selectedSrc = sizes.desktop;
            }
            
            if (img.src !== selectedSrc) {
                img.src = selectedSrc;
            }
        });
    }
};

// ===== WORDPRESS API MODULE =====
const WordPressAPI = {
    baseURL: '/wp-json/wp/v2/', // WordPress REST API base URL
    
    init() {
        // Initialize WordPress API connection
        // In a real implementation, this would set up authentication and base configuration
        console.log('WordPress API integration initialized');
        
        // Example: Load latest articles if on articles page
        if (window.location.pathname.includes('articoli')) {
            this.loadLatestArticles();
        }
        
        // Example: Load latest news if on news page
        if (window.location.pathname.includes('news')) {
            this.loadLatestNews();
        }
    },
    
    async loadLatestArticles() {
        try {
            // Mock API call - replace with real WordPress endpoint
            const articles = await this.mockAPICall('articles');
            this.renderArticles(articles);
        } catch (error) {
            console.error('Error loading articles:', error);
        }
    },
    
    async loadLatestNews() {
        try {
            // Mock API call - replace with real WordPress endpoint
            const news = await this.mockAPICall('news');
            this.renderNews(news);
        } catch (error) {
            console.error('Error loading news:', error);
        }
    },
    
    async mockAPICall(type) {
        // Mock data for demonstration
        return new Promise((resolve) => {
            setTimeout(() => {
                if (type === 'articles') {
                    resolve([
                        {
                            id: 1,
                            title: 'L\'Architettura Sostenibile del Futuro',
                            excerpt: 'Scopri come i nuovi materiali eco-compatibili...',
                            date: '2025-01-15',
                            author: 'Dr. Maria Rossi',
                            category: 'Progettazione',
                            image: 'images/article-featured.jpg'
                        }
                    ]);
                } else {
                    resolve([
                        {
                            id: 1,
                            title: 'Conferenza Internazionale sulla Bioarchitettura 2025',
                            excerpt: 'Si terrà a Milano il prossimo convegno...',
                            date: '2025-01-29',
                            category: 'Eventi',
                            image: 'images/news-1.jpg'
                        }
                    ]);
                }
            }, 500);
        });
    },
    
    renderArticles(articles) {
        // Implementation would render articles to the page
        console.log('Rendering articles:', articles);
    },
    
    renderNews(news) {
        // Implementation would render news to the page
        console.log('Rendering news:', news);
    }
};

// ===== ANALYTICS MODULE =====
const Analytics = {
    init() {
        this.trackPageView();
        this.setupEventTracking();
    },
    
    trackPageView() {
        // Track page views for analytics
        console.log('Page view tracked:', window.location.pathname);
    },
    
    setupEventTracking() {
        // Track newsletter subscriptions
        const newsletterForm = $('#newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', () => {
                this.trackEvent('Newsletter', 'Subscribe', 'Footer Form');
            });
        }
        
        // Track article clicks
        $$('.article-title, .news-title').forEach(title => {
            title.addEventListener('click', (e) => {
                this.trackEvent('Content', 'Article Click', e.target.textContent);
            });
        });
        
        // Track navigation clicks
        $$('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackEvent('Navigation', 'Menu Click', e.target.textContent);
            });
        });
    },
    
    trackEvent(category, action, label) {
        // Integration with Google Analytics or other analytics service
        console.log('Event tracked:', { category, action, label });
        
        // Example Google Analytics 4 event tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    }
};

// ===== SEARCH MODULE =====
const Search = {
    init() {
        this.setupSearchFunctionality();
    },
    
    setupSearchFunctionality() {
        const searchInput = $('#search-input');
        const searchResults = $('#search-results');
        
        if (!searchInput) return;
        
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            if (query.length >= 3) {
                this.performSearch(query);
            } else {
                this.clearResults();
            }
        }, 300));
    },
    
    async performSearch(query) {
        try {
            // Mock search - replace with WordPress search API
            const results = await this.mockSearch(query);
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    },
    
    async mockSearch(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        title: `Risultato per "${query}"`,
                        excerpt: 'Risultato di esempio...',
                        url: '#'
                    }
                ]);
            }, 300);
        });
    },
    
    displayResults(results) {
        const searchResults = $('#search-results');
        if (!searchResults) return;
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p>Nessun risultato trovato.</p>';
            return;
        }
        
        const resultsHTML = results.map(result => `
            <div class="search-result">
                <h4><a href="${result.url}">${result.title}</a></h4>
                <p>${result.excerpt}</p>
            </div>
        `).join('');
        
        searchResults.innerHTML = resultsHTML;
    },
    
    clearResults() {
        const searchResults = $('#search-results');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }
};

// ===== PERFORMANCE MONITORING =====
const Performance = {
    init() {
        this.measurePerformance();
        this.setupErrorReporting();
    },
    
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    console.log(`Page load time: ${loadTime}ms`);
                }, 0);
            });
        }
    },
    
    setupErrorReporting() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            // In production, send to error reporting service
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            // In production, send to error reporting service
        });
    }
};

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Navigation,
        NewsletterForm,
        SmoothScrolling,
        LazyLoading,
        WordPressAPI,
        Analytics,
        Search,
        Performance
    };
}