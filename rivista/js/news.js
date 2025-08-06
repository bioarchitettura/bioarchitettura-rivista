/**
 * News Page JavaScript
 * Handles news timeline, live updates, and WordPress API integration
 */

document.addEventListener('DOMContentLoaded', () => {
    NewsTimeline.init();
    LiveNewsUpdater.init();
    NewsNotifications.init();
});

// ===== NEWS TIMELINE MODULE =====
const NewsTimeline = {
    init() {
        this.setupTimelineAnimation();
        this.setupNewsInteractions();
        this.loadInitialNews();
    },
    
    setupTimelineAnimation() {
        const timelineItems = document.querySelectorAll('.news-timeline-item');
        
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100); // Staggered animation
                }
            });
        }, { threshold: 0.1 });
        
        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    },
    
    setupNewsInteractions() {
        const newsItems = document.querySelectorAll('.news-timeline-item, .breaking-news');
        
        newsItems.forEach(item => {
            // Add click tracking
            item.addEventListener('click', () => {
                const title = item.querySelector('.news-title, .breaking-title')?.textContent;
                if (title && typeof Analytics !== 'undefined') {
                    Analytics.trackEvent('News', 'News Click', title);
                }
            });
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-6px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });
    },
    
    async loadInitialNews() {
        try {
            // Load latest news from WordPress API (mocked)
            const latestNews = await this.fetchLatestNews();
            this.updateBreakingNews(latestNews);
        } catch (error) {
            console.error('Error loading initial news:', error);
        }
    },
    
    async fetchLatestNews() {
        // Mock WordPress API call - replace with real endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 'breaking-1',
                        title: 'Nuovo Bando UE per l\'Edilizia Sostenibile: 500 Milioni di Euro Disponibili',
                        excerpt: 'La Commissione Europea annuncia un nuovo programma di finanziamenti...',
                        category: 'Finanziamenti',
                        timestamp: new Date(),
                        isBreaking: true
                    }
                ]);
            }, 500);
        });
    },
    
    updateBreakingNews(news) {
        if (news.length === 0) return;
        
        const breakingNews = news.find(item => item.isBreaking);
        if (!breakingNews) return;
        
        const breakingSection = document.querySelector('.breaking-news');
        if (breakingSection) {
            const titleElement = breakingSection.querySelector('.breaking-title');
            const excerptElement = breakingSection.querySelector('.breaking-excerpt');
            const timeElement = breakingSection.querySelector('.breaking-time');
            
            if (titleElement) titleElement.textContent = breakingNews.title;
            if (excerptElement) excerptElement.textContent = breakingNews.excerpt;
            if (timeElement) timeElement.textContent = this.formatTimeAgo(breakingNews.timestamp);
        }
    },
    
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `Pubblicato ${minutes} minuti fa`;
        } else if (hours < 24) {
            return `Pubblicato ${hours} ore fa`;
        } else {
            const days = Math.floor(hours / 24);
            return `Pubblicato ${days} giorni fa`;
        }
    }
};

// ===== LIVE NEWS UPDATER MODULE =====
const LiveNewsUpdater = {
    updateInterval: 5 * 60 * 1000, // 5 minutes
    intervalId: null,
    
    init() {
        this.startLiveUpdates();
        this.setupVisibilityChange();
    },
    
    startLiveUpdates() {
        // Initial update
        this.checkForUpdates();
        
        // Set up periodic updates
        this.intervalId = setInterval(() => {
            this.checkForUpdates();
        }, this.updateInterval);
    },
    
    setupVisibilityChange() {
        // Pause updates when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
            } else {
                if (!this.intervalId) {
                    this.startLiveUpdates();
                }
            }
        });
    },
    
    async checkForUpdates() {
        try {
            const newNews = await this.fetchRecentNews();
            if (newNews && newNews.length > 0) {
                this.addNewNewsToTimeline(newNews);
                NewsNotifications.showUpdateNotification(newNews.length);
            }
        } catch (error) {
            console.error('Error checking for news updates:', error);
        }
    },
    
    async fetchRecentNews() {
        // Mock API call for recent news
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate occasional new news
                const random = Math.random();
                if (random > 0.8) { // 20% chance of new news
                    resolve([
                        {
                            id: `news-${Date.now()}`,
                            title: 'Breaking: Nuove Normative Europee per l\'Edilizia Sostenibile',
                            excerpt: 'La UE introduce nuove direttive per migliorare l\'efficienza energetica...',
                            category: 'Normativa',
                            timestamp: new Date(),
                            image: 'images/news-eu-directive.jpg'
                        }
                    ]);
                } else {
                    resolve([]);
                }
            }, 1000);
        });
    },
    
    addNewNewsToTimeline(newsItems) {
        const todaySection = document.querySelector('.timeline-day');
        if (!todaySection) return;
        
        newsItems.forEach(newsItem => {
            const newsElement = this.createNewsElement(newsItem);
            
            // Insert at the beginning of today's news
            const firstNewsItem = todaySection.querySelector('.news-timeline-item');
            if (firstNewsItem) {
                todaySection.insertBefore(newsElement, firstNewsItem);
            } else {
                todaySection.appendChild(newsElement);
            }
            
            // Add new item animation
            setTimeout(() => {
                newsElement.classList.add('news-new-item');
            }, 100);
        });
    },
    
    createNewsElement(newsItem) {
        const article = document.createElement('article');
        article.className = 'news-timeline-item grid-col-6 grid-col-md-12 news-new';
        
        article.innerHTML = `
            <div class="news-time">${this.formatTime(newsItem.timestamp)}</div>
            <div class="news-image">
                <img src="${newsItem.image}" alt="${newsItem.title}">
                <div class="news-category">${newsItem.category}</div>
            </div>
            <div class="news-content">
                <h3 class="news-title">${newsItem.title}</h3>
                <p class="news-excerpt">${newsItem.excerpt}</p>
            </div>
        `;
        
        return article;
    },
    
    formatTime(timestamp) {
        return timestamp.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
};

// ===== NEWS NOTIFICATIONS MODULE =====
const NewsNotifications = {
    init() {
        this.setupNotificationPermission();
    },
    
    setupNotificationPermission() {
        // Request notification permission if supported
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                this.requestNotificationPermission();
            }, 5000); // Wait 5 seconds before asking
        }
    },
    
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    },
    
    showUpdateNotification(count) {
        // Show in-page notification
        this.showInPageNotification(`${count} nuove notizie disponibili`);
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
            this.showBrowserNotification(`${count} nuove notizie`, 'Bioarchitettura News');
        }
    },
    
    showInPageNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.news-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'news-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🔔</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Set up close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            this.hideInPageNotification(notification);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideInPageNotification(notification);
        }, 5000);
    },
    
    hideInPageNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    },
    
    showBrowserNotification(title, body) {
        try {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'bioarchitettura-news'
            });
        } catch (error) {
            console.error('Error showing browser notification:', error);
        }
    }
};

// ===== NEWS CATEGORIES MODULE =====
const NewsCategories = {
    init() {
        this.setupCategoryFilters();
    },
    
    setupCategoryFilters() {
        const categoryButtons = document.querySelectorAll('.news-category-filter');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.filterNewsByCategory(category);
                
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    },
    
    filterNewsByCategory(category) {
        const newsItems = document.querySelectorAll('.news-timeline-item');
        
        newsItems.forEach(item => {
            const itemCategory = item.querySelector('.news-category')?.textContent.toLowerCase();
            
            if (category === 'all' || itemCategory === category.toLowerCase()) {
                item.style.display = '';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            } else {
                item.style.opacity = '0';
                item.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }
};

// ===== NEWS SHARING MODULE =====
const NewsSharing = {
    init() {
        this.setupSocialSharing();
        this.setupCopyLink();
    },
    
    setupSocialSharing() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-news-btn')) {
                e.preventDefault();
                const newsItem = e.target.closest('.news-timeline-item');
                const title = newsItem?.querySelector('.news-title')?.textContent;
                
                if (title) {
                    this.shareNews(title);
                }
            }
        });
    },
    
    setupCopyLink() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-link-btn')) {
                e.preventDefault();
                this.copyCurrentLink();
            }
        });
    },
    
    shareNews(title) {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: `Leggi questa notizia su BIOARCHITETTURA®: ${title}`,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback to copying link
            this.copyCurrentLink();
        }
    },
    
    async copyCurrentLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            this.showCopyFeedback();
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    },
    
    showCopyFeedback() {
        const feedback = document.createElement('div');
        feedback.textContent = 'Link copiato!';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            z-index: 10000;
            font-size: 0.9rem;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }
};

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    LiveNewsUpdater.destroy();
});

// Initialize additional modules
document.addEventListener('DOMContentLoaded', () => {
    NewsCategories.init();
    NewsSharing.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NewsTimeline,
        LiveNewsUpdater,
        NewsNotifications,
        NewsCategories,
        NewsSharing
    };
}