/**
 * Articles Page JavaScript
 * Handles article filtering, loading, and WordPress API integration
 */

document.addEventListener('DOMContentLoaded', () => {
    ArticlesFilter.init();
    ArticlesLoader.init();
});

// ===== ARTICLES FILTER MODULE =====
const ArticlesFilter = {
    init() {
        this.setupFilterTabs();
        this.setupFilterLogic();
    },
    
    setupFilterTabs() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        const articles = document.querySelectorAll('.article-card, .featured-article-large');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                filterTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                const category = tab.getAttribute('data-category');
                this.filterArticles(category, articles);
            });
        });
    },
    
    setupFilterLogic() {
        // Initialize with all articles visible
        this.filterArticles('all', document.querySelectorAll('.article-card, .featured-article-large'));
    },
    
    filterArticles(category, articles) {
        articles.forEach(article => {
            const articleCategory = article.getAttribute('data-category');
            
            if (category === 'all' || articleCategory === category) {
                article.style.display = '';
                // Add fade-in animation
                article.style.opacity = '0';
                article.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    article.style.opacity = '1';
                    article.style.transform = 'translateY(0)';
                }, 100);
            } else {
                article.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                article.style.opacity = '0';
                article.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    article.style.display = 'none';
                }, 300);
            }
        });
        
        // Update results count
        this.updateResultsCount(category);
    },
    
    updateResultsCount(category) {
        const articles = document.querySelectorAll('.article-card, .featured-article-large');
        let visibleCount = 0;
        
        articles.forEach(article => {
            const articleCategory = article.getAttribute('data-category');
            if (category === 'all' || articleCategory === category) {
                visibleCount++;
            }
        });
        
        // You can add a results count display here if needed
        console.log(`Showing ${visibleCount} articles for category: ${category}`);
    }
};

// ===== ARTICLES LOADER MODULE =====
const ArticlesLoader = {
    currentPage: 1,
    articlesPerPage: 9,
    loading: false,
    
    init() {
        this.setupLoadMoreButton();
        this.setupInfiniteScroll();
    },
    
    setupLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }
    },
    
    setupInfiniteScroll() {
        // Optional: Add infinite scroll functionality
        window.addEventListener('scroll', () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const documentHeight = document.documentElement.offsetHeight;
            
            if (scrollPosition >= documentHeight - 1000 && !this.loading) {
                // Uncomment to enable infinite scroll
                // this.loadMoreArticles();
            }
        });
    },
    
    async loadMoreArticles() {
        if (this.loading) return;
        
        this.loading = true;
        const loadMoreBtn = document.getElementById('load-more-btn');
        const originalText = loadMoreBtn ? loadMoreBtn.textContent : '';
        
        if (loadMoreBtn) {
            loadMoreBtn.textContent = 'Caricamento...';
            loadMoreBtn.disabled = true;
        }
        
        try {
            // Simulate API call - replace with real WordPress REST API
            const newArticles = await this.fetchArticlesFromWordPress(this.currentPage + 1);
            
            if (newArticles && newArticles.length > 0) {
                this.renderNewArticles(newArticles);
                this.currentPage++;
            } else {
                // No more articles
                if (loadMoreBtn) {
                    loadMoreBtn.textContent = 'Non ci sono altri articoli';
                    loadMoreBtn.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error loading more articles:', error);
            if (loadMoreBtn) {
                loadMoreBtn.textContent = 'Errore nel caricamento';
            }
        } finally {
            this.loading = false;
            if (loadMoreBtn && loadMoreBtn.textContent !== 'Non ci sono altri articoli') {
                loadMoreBtn.textContent = originalText;
                loadMoreBtn.disabled = false;
            }
        }
    },
    
    async fetchArticlesFromWordPress(page) {
        // Mock WordPress API call - replace with real endpoint
        return new Promise((resolve) => {
            setTimeout(() => {
                if (page > 3) {
                    resolve([]); // No more articles after page 3
                    return;
                }
                
                const mockArticles = [
                    {
                        id: `article-${page}-1`,
                        title: 'Architettura Resiliente: Progettare per il Futuro',
                        excerpt: 'Come progettare edifici che resistano ai cambiamenti climatici...',
                        category: 'progettazione',
                        date: '2025-01-01',
                        author: 'Dr. Anna Verde',
                        image: 'images/article-resilient.jpg'
                    },
                    {
                        id: `article-${page}-2`,
                        title: 'Nuovi Materiali Bio-based per l\'Edilizia',
                        excerpt: 'Esplorazione dei materiali innovativi derivati da fonti biologiche...',
                        category: 'materiali',
                        date: '2025-01-02',
                        author: 'Ing. Marco Blu',
                        image: 'images/article-bio-materials.jpg'
                    },
                    {
                        id: `article-${page}-3`,
                        title: 'AI e Progettazione Sostenibile',
                        excerpt: 'Come l\'intelligenza artificiale sta rivoluzionando la progettazione...',
                        category: 'tecnologia',
                        date: '2025-01-03',
                        author: 'Prof. Silvia Neri',
                        image: 'images/article-ai-design.jpg'
                    }
                ];
                
                resolve(mockArticles);
            }, 1000);
        });
    },
    
    renderNewArticles(articles) {
        const articlesGrid = document.querySelector('.articles-grid');
        if (!articlesGrid) return;
        
        articles.forEach(article => {
            const articleElement = this.createArticleElement(article);
            articlesGrid.appendChild(articleElement);
            
            // Add fade-in animation
            setTimeout(() => {
                articleElement.style.opacity = '1';
                articleElement.style.transform = 'translateY(0)';
            }, 100);
        });
    },
    
    createArticleElement(article) {
        const articleDiv = document.createElement('article');
        articleDiv.className = 'article-card grid-col-4 grid-col-md-6 grid-col-sm-12';
        articleDiv.setAttribute('data-category', article.category);
        articleDiv.style.opacity = '0';
        articleDiv.style.transform = 'translateY(30px)';
        articleDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        articleDiv.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}">
                <div class="article-category">${this.formatCategory(article.category)}</div>
            </div>
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.date)}</span>
                    <span class="article-author">${article.author}</span>
                </div>
            </div>
        `;
        
        // Add click event for tracking
        articleDiv.addEventListener('click', () => {
            if (typeof Analytics !== 'undefined') {
                Analytics.trackEvent('Articles', 'Article Click', article.title);
            }
        });
        
        return articleDiv;
    },
    
    formatCategory(category) {
        const categoryMap = {
            'progettazione': 'Progettazione',
            'materiali': 'Materiali',
            'tecnologia': 'Tecnologia',
            'ricerca': 'Ricerca'
        };
        return categoryMap[category] || category;
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
};

// ===== ARTICLES SEARCH MODULE =====
const ArticlesSearch = {
    init() {
        this.setupSearchInput();
    },
    
    setupSearchInput() {
        const searchInput = document.getElementById('articles-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', this.debounce((e) => {
            const query = e.target.value.trim().toLowerCase();
            this.performSearch(query);
        }, 300));
    },
    
    performSearch(query) {
        const articles = document.querySelectorAll('.article-card, .featured-article-large');
        
        articles.forEach(article => {
            const title = article.querySelector('.article-title')?.textContent.toLowerCase();
            const excerpt = article.querySelector('.article-excerpt')?.textContent.toLowerCase();
            
            if (!query || 
                (title && title.includes(query)) || 
                (excerpt && excerpt.includes(query))) {
                article.style.display = '';
            } else {
                article.style.display = 'none';
            }
        });
    },
    
    debounce(func, wait) {
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
};

// ===== ARTICLE SHARING MODULE =====
const ArticleSharing = {
    init() {
        this.setupSocialSharing();
    },
    
    setupSocialSharing() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = button.getAttribute('data-platform');
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                this.shareOnPlatform(platform, url, title);
            });
        });
    },
    
    shareOnPlatform(platform, url, title) {
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${title} ${url}`;
                break;
            default:
                return;
        }
        
        window.open(shareUrl, '_blank', 'width=600,height=400');
        
        // Track sharing event
        if (typeof Analytics !== 'undefined') {
            Analytics.trackEvent('Social Sharing', platform, title);
        }
    }
};

// Initialize additional modules if needed
document.addEventListener('DOMContentLoaded', () => {
    ArticlesSearch.init();
    ArticleSharing.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ArticlesFilter,
        ArticlesLoader,
        ArticlesSearch,
        ArticleSharing
    };
}