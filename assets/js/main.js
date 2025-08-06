/**
 * Bioarchitettura Magazine - Main JavaScript
 * Comprehensive functionality for editorial, AI integrations, and user interaction
 */

// =============================================================================
// Global Configuration and State
// =============================================================================

const CONFIG = {
    // API Configuration
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
    OPENAI_API_KEY: null, // Should be set via environment variable
    
    // AI Settings
    AI_SUMMARY_ENABLED: true,
    MAX_SUMMARY_LENGTH: 200,
    MAX_RELATED_ARTICLES: 3,
    FALLBACK_ENABLED: true,
    
    // Translation Settings
    SUPPORTED_LANGUAGES: ['it', 'en', 'de', 'fr'],
    DEFAULT_LANGUAGE: 'it',
    GOOGLE_TRANSLATE_API_KEY: null,
    
    // Cart Settings
    CART_STORAGE_KEY: 'bioarchitettura_cart',
    CART_EXPIRY_DAYS: 7,
    
    // Notification Settings
    NOTIFICATION_DURATION: 5000,
    MAX_NOTIFICATIONS: 5,
    
    // Performance Settings
    DEBOUNCE_DELAY: 300,
    SCROLL_THROTTLE: 100,
    LAZY_LOADING_OFFSET: 100
};

// Global State
const STATE = {
    currentLanguage: localStorage.getItem('bioarchitettura_language') || CONFIG.DEFAULT_LANGUAGE,
    cart: [],
    notifications: [],
    isMenuOpen: false,
    isCartOpen: false,
    relatedArticles: [],
    translations: {}
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Debounce function to limit function calls
 */
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

/**
 * Throttle function to limit function calls
 */
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

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize HTML content
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Format currency
 */
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Get text content without HTML tags
 */
function getTextContent(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// =============================================================================
// Notification System
// =============================================================================

class NotificationManager {
    constructor() {
        this.container = document.getElementById('notification-container');
        this.notifications = [];
    }

    show(message, type = 'info', title = null, duration = CONFIG.NOTIFICATION_DURATION) {
        if (this.notifications.length >= CONFIG.MAX_NOTIFICATIONS) {
            this.notifications[0].remove();
        }

        const notification = this.create(message, type, title, duration);
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    create(message, type, title, duration) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');

        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${sanitizeHTML(title)}</div>` : ''}
                <p class="notification-message">${sanitizeHTML(message)}</p>
            </div>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;

        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.remove(notification);
        });

        // Click to dismiss
        notification.addEventListener('click', (e) => {
            if (e.target !== notification.querySelector('.notification-close')) {
                this.remove(notification);
            }
        });

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    remove(notification) {
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }

        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    clear() {
        this.notifications.forEach(notification => this.remove(notification));
    }
}

// =============================================================================
// AI Content Processing
// =============================================================================

class AIContentProcessor {
    constructor() {
        this.cache = new Map();
        this.isProcessing = false;
    }

    /**
     * Generate AI summary for article content
     */
    async generateSummary(content, title = '') {
        if (!CONFIG.AI_SUMMARY_ENABLED) {
            return this.generateFallbackSummary(content);
        }

        const cacheKey = this.getCacheKey(content);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.isProcessing) {
            await this.waitForProcessing();
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
        }

        this.isProcessing = true;

        try {
            const summary = await this.callOpenAI(content, title);
            this.cache.set(cacheKey, summary);
            this.isProcessing = false;
            return summary;
        } catch (error) {
            console.warn('AI summary failed, using fallback:', error);
            this.isProcessing = false;
            const fallback = this.generateFallbackSummary(content);
            this.cache.set(cacheKey, fallback);
            return fallback;
        }
    }

    async callOpenAI(content, title) {
        if (!CONFIG.OPENAI_API_KEY) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `
            Please create a concise summary of the following article about bioarchitecture and sustainable building.
            Title: ${title}
            Content: ${getTextContent(content).substring(0, 2000)}
            
            Provide a summary in Italian of maximum ${CONFIG.MAX_SUMMARY_LENGTH} words that highlights the key points about sustainable architecture, ecological building practices, or environmental considerations.
        `;

        const response = await fetch(CONFIG.OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || this.generateFallbackSummary(content);
    }

    generateFallbackSummary(content) {
        const text = getTextContent(content);
        const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
        
        // Extract key sentences (first 3 sentences or sentences with keywords)
        const keywords = ['bioarchitettura', 'sostenibile', 'ecologico', 'ambiente', 'energia', 'costruzione'];
        const importantSentences = sentences.filter(sentence => 
            keywords.some(keyword => sentence.toLowerCase().includes(keyword))
        ).slice(0, 2);

        if (importantSentences.length === 0) {
            return sentences.slice(0, 2).join(' ').trim();
        }

        return importantSentences.join(' ').trim();
    }

    getCacheKey(content) {
        const text = getTextContent(content).substring(0, 500);
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    async waitForProcessing() {
        while (this.isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// =============================================================================
// Article Recommendation Engine
// =============================================================================

class ArticleRecommender {
    constructor() {
        this.articles = [];
        this.loadArticles();
    }

    async loadArticles() {
        try {
            // In a real Jekyll site, this would load from the site's data
            // For now, we'll simulate with sample data
            this.articles = await this.fetchArticlesData();
        } catch (error) {
            console.error('Failed to load articles:', error);
            this.articles = this.getSampleArticles();
        }
    }

    async fetchArticlesData() {
        // This would typically fetch from Jekyll's generated JSON or API
        // For now, return sample data
        return this.getSampleArticles();
    }

    getSampleArticles() {
        return [
            {
                title: "Costruzioni in Legno: Il Futuro dell'Edilizia Sostenibile",
                url: "/posts/costruzioni-legno-futuro",
                excerpt: "Scopri come il legno sta rivoluzionando l'architettura moderna con soluzioni sostenibili e innovative.",
                tags: ["legno", "sostenibilità", "innovazione"],
                category: "Materiali",
                date: "2024-01-15",
                image: "/images/wooden-construction.jpg"
            },
            {
                title: "Efficienza Energetica: Tecnologie per la Casa del Futuro",
                url: "/posts/efficienza-energetica-casa-futuro",
                excerpt: "Le ultime innovazioni tecnologiche per ridurre i consumi energetici negli edifici residenziali.",
                tags: ["energia", "tecnologia", "efficienza"],
                category: "Energia",
                date: "2024-01-10",
                image: "/images/energy-efficient-home.jpg"
            },
            {
                title: "Giardini Verticali: Verde Urbano per Città Sostenibili",
                url: "/posts/giardini-verticali-citta-sostenibili",
                excerpt: "Come i giardini verticali stanno trasformando gli spazi urbani e migliorando la qualità dell'aria.",
                tags: ["verde", "urbano", "sostenibilità"],
                category: "Verde",
                date: "2024-01-08",
                image: "/images/vertical-gardens.jpg"
            }
        ];
    }

    findRelated(currentTags = [], currentCategory = '', currentUrl = '') {
        if (this.articles.length === 0) {
            return [];
        }

        // Score articles based on similarity
        const scored = this.articles
            .filter(article => article.url !== currentUrl)
            .map(article => ({
                ...article,
                score: this.calculateRelevanceScore(article, currentTags, currentCategory)
            }))
            .filter(article => article.score > 0)
            .sort((a, b) => b.score - a.score);

        return scored.slice(0, CONFIG.MAX_RELATED_ARTICLES);
    }

    calculateRelevanceScore(article, currentTags, currentCategory) {
        let score = 0;

        // Category match (highest weight)
        if (article.category === currentCategory) {
            score += 10;
        }

        // Tag matches
        const commonTags = article.tags.filter(tag => 
            currentTags.some(currentTag => 
                currentTag.toLowerCase() === tag.toLowerCase()
            )
        );
        score += commonTags.length * 5;

        // Recency bonus (more recent articles get slight boost)
        const daysSincePublished = (Date.now() - new Date(article.date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePublished < 30) {
            score += 2;
        }

        return score;
    }

    renderRelatedArticles(container, relatedArticles) {
        if (!container || relatedArticles.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Nessun articolo correlato trovato.</p>';
            return;
        }

        const articlesHTML = relatedArticles.map(article => `
            <article class="related-article">
                <a href="${article.url}" class="related-article-link">
                    ${article.image ? `<img src="${article.image}" alt="${article.title}" loading="lazy">` : ''}
                    <div class="related-article-content">
                        <div class="article-meta">
                            <span class="article-category">${article.category}</span>
                            <time datetime="${article.date}">${this.formatDate(article.date)}</time>
                        </div>
                        <h4>${article.title}</h4>
                        <p>${article.excerpt}</p>
                    </div>
                </a>
            </article>
        `).join('');

        container.innerHTML = articlesHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

// =============================================================================
// Navigation Management
// =============================================================================

class NavigationManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.isScrolled = false;
        
        this.init();
    }

    init() {
        this.setupMobileToggle();
        this.setupScrollEffect();
        this.setupActiveLinks();
        this.setupSmoothScrolling();
        this.setupDropdownMenus();
    }

    setupMobileToggle() {
        if (this.navToggle && this.navMenu) {
            this.navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.navbar.contains(e.target) && STATE.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });

            // Close menu when pressing Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && STATE.isMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        STATE.isMenuOpen = !STATE.isMenuOpen;
        this.navToggle.classList.toggle('active');
        this.navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = STATE.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        STATE.isMenuOpen = false;
        this.navToggle.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupScrollEffect() {
        const throttledScroll = throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const shouldAddScrolled = scrollTop > 50;

            if (shouldAddScrolled !== this.isScrolled) {
                this.isScrolled = shouldAddScrolled;
                this.navbar.classList.toggle('scrolled', this.isScrolled);
            }
        }, CONFIG.SCROLL_THROTTLE);

        window.addEventListener('scroll', throttledScroll);
    }

    setupActiveLinks() {
        const currentPath = window.location.pathname;
        const navLinks = this.navMenu.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (currentPath === href || currentPath.startsWith(href + '/'))) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const navHeight = this.navbar.offsetHeight;
                const targetOffset = targetElement.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetOffset,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (STATE.isMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    setupDropdownMenus() {
        const dropdowns = this.navMenu.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (toggle && menu) {
                // Desktop hover behavior is handled by CSS
                // Mobile click behavior
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    }
                });
            }
        });
    }
}

// =============================================================================
// Post Processing (for article pages)
// =============================================================================

class PostProcessor {
    constructor() {
        this.aiProcessor = new AIContentProcessor();
        this.recommender = new ArticleRecommender();
        
        if (document.body.classList.contains('post')) {
            this.init();
        }
    }

    async init() {
        await this.processPostContent();
        this.setupSummaryToggle();
        this.loadRelatedArticles();
        this.setupReadingProgress();
        this.setupImageLazyLoading();
        this.setupShareButtons();
    }

    async processPostContent() {
        const summaryContainer = document.getElementById('post-summary');
        const summaryContent = document.getElementById('summary-content');
        
        if (!summaryContainer || !summaryContent) return;

        try {
            const contentBody = document.querySelector('.content-body');
            const title = document.querySelector('.post-title')?.textContent || '';
            
            if (contentBody) {
                const summary = await this.aiProcessor.generateSummary(
                    contentBody.innerHTML, 
                    title
                );
                
                summaryContent.innerHTML = `<p>${summary}</p>`;
            }
        } catch (error) {
            console.error('Failed to generate summary:', error);
            summaryContent.innerHTML = '<p class="text-muted">Riassunto non disponibile.</p>';
        }
    }

    setupSummaryToggle() {
        const summaryToggle = document.getElementById('summary-toggle');
        const summaryContainer = document.getElementById('post-summary');
        
        if (summaryToggle && summaryContainer) {
            summaryToggle.addEventListener('click', () => {
                const isHidden = summaryContainer.style.display === 'none';
                summaryContainer.style.display = isHidden ? 'block' : 'none';
                summaryToggle.textContent = isHidden ? 'Nascondi riassunto' : 'Mostra riassunto';
            });
        }
    }

    loadRelatedArticles() {
        const relatedContainer = document.getElementById('related-articles');
        if (!relatedContainer) return;

        // Get current article data
        const tags = Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent);
        const category = document.querySelector('.post-category a')?.textContent || '';
        const currentUrl = window.location.pathname;

        // Find and render related articles
        const relatedArticles = this.recommender.findRelated(tags, category, currentUrl);
        this.recommender.renderRelatedArticles(relatedContainer, relatedArticles);
    }

    setupReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);

        const progressFill = progressBar.querySelector('.reading-progress-fill');
        const contentBody = document.querySelector('.content-body');

        if (!contentBody) return;

        const throttledProgress = throttle(() => {
            const contentTop = contentBody.offsetTop;
            const contentHeight = contentBody.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            const progress = Math.min(
                Math.max((scrollTop - contentTop + windowHeight) / contentHeight, 0),
                1
            );

            progressFill.style.width = `${progress * 100}%`;
        }, CONFIG.SCROLL_THROTTLE);

        window.addEventListener('scroll', throttledProgress);
    }

    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${CONFIG.LAZY_LOADING_OFFSET}px`
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Track sharing analytics if needed
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: button.classList.contains('facebook') ? 'Facebook' :
                               button.classList.contains('twitter') ? 'Twitter' :
                               button.classList.contains('linkedin') ? 'LinkedIn' : 'Email',
                        content_type: 'article',
                        content_id: window.location.pathname
                    });
                }
            });
        });
    }
}

// =============================================================================
// Initialization and Event Management
// =============================================================================

class App {
    constructor() {
        this.notificationManager = new NotificationManager();
        this.navigationManager = new NavigationManager();
        this.postProcessor = new PostProcessor();
        
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.setupPerformanceOptimizations();
        this.setupErrorHandling();
        this.checkBrowserSupport();
    }

    setupGlobalEventListeners() {
        // Page load complete
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            this.optimizeImages();
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            } else {
                this.handlePageHidden();
            }
        });

        // Window resize
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, CONFIG.DEBOUNCE_DELAY));

        // Before page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    setupPerformanceOptimizations() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup service worker if supported
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.notificationManager.show(
                'Si è verificato un errore. La pagina potrebbe non funzionare correttamente.',
                'error',
                'Errore'
            );
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    checkBrowserSupport() {
        const requiredFeatures = [
            'querySelector',
            'addEventListener',
            'localStorage',
            'fetch'
        ];

        const unsupported = requiredFeatures.filter(feature => !(feature in window));
        
        if (unsupported.length > 0) {
            this.notificationManager.show(
                'Il tuo browser non supporta tutte le funzionalità. Ti consigliamo di aggiornarlo.',
                'warning',
                'Browser non supportato'
            );
        }
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    preloadCriticalResources() {
        // Preload critical fonts
        const fontPreloads = [
            'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDTbtXK-F2qC0s.woff2',
            'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeAmM.woff2'
        ];

        fontPreloads.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = font;
            document.head.appendChild(link);
        });
    }

    handlePageVisible() {
        // Resume any paused activities
        console.log('Page became visible');
    }

    handlePageHidden() {
        // Pause non-critical activities
        console.log('Page became hidden');
    }

    handleResize() {
        // Handle responsive adjustments
        if (STATE.isMenuOpen && window.innerWidth > 768) {
            this.navigationManager.closeMobileMenu();
        }
    }

    cleanup() {
        // Clean up before page unload
        this.notificationManager.clear();
    }
}

// =============================================================================
// Application Startup
// =============================================================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bioarchitetturaApp = new App();
    });
} else {
    window.bioarchitetturaApp = new App();
}

// Export for global access
window.BioarchitetturaConfig = CONFIG;
window.BioarchitetturaState = STATE;