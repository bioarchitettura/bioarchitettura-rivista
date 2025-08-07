/**
 * AI-Powered Search Functionality for Bioarchitettura
 * Advanced search with intelligent content matching and suggestions
 */

class AISearch {
    constructor() {
        this.searchIndex = [];
        this.isInitialized = false;
        this.searchResults = [];
        this.searchHistory = JSON.parse(localStorage.getItem('bioarchitettura_search_history') || '[]');
        this.init();
    }

    async init() {
        this.createSearchInterface();
        await this.buildSearchIndex();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    createSearchInterface() {
        // Add search modal to the page
        const searchModal = document.createElement('div');
        searchModal.id = 'ai-search-modal';
        searchModal.className = 'ai-search-modal';
        searchModal.innerHTML = `
            <div class="search-overlay" id="search-overlay"></div>
            <div class="search-container">
                <div class="search-header">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" id="ai-search-input" placeholder="Cerca articoli, prodotti, corsi..." autocomplete="off">
                        <button class="search-close" id="search-close-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="search-content">
                    <div class="search-suggestions" id="search-suggestions"></div>
                    <div class="search-results" id="search-results"></div>
                    <div class="search-history" id="search-history"></div>
                </div>
            </div>
        `;
        document.body.appendChild(searchModal);

        // Add search button to navigation
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            const searchBtn = document.createElement('li');
            searchBtn.className = 'nav-item';
            searchBtn.innerHTML = `
                <button class="search-trigger" id="search-trigger" title="Cerca">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
            `;
            navMenu.insertBefore(searchBtn, navMenu.querySelector('.cart-btn').parentElement);
        }
    }

    async buildSearchIndex() {
        try {
            // Build comprehensive search index from various content sources
            this.searchIndex = [
                // Articles from posts
                ...(await this.indexPosts()),
                // Products from shop
                ...(await this.indexProducts()),
                // Pages
                ...(await this.indexPages()),
                // Courses and webinars
                ...(await this.indexEducationalContent())
            ];
            
            console.log(`Search index built with ${this.searchIndex.length} items`);
        } catch (error) {
            console.error('Failed to build search index:', error);
        }
    }

    async indexPosts() {
        // In a real Jekyll site, this would fetch from the generated JSON or API
        return [
            {
                type: 'article',
                title: 'Casa Passiva: Il Futuro dell\'Abitare Sostenibile',
                content: 'Scopri i principi della casa passiva e come ridurre i consumi energetici...',
                url: '/posts/casa-passiva-futuro-abitare-sostenibile/',
                image: '/images/casa-passiva.jpg',
                category: 'Efficienza Energetica',
                tags: ['casa passiva', 'efficienza energetica', 'sostenibilità'],
                date: '2024-01-15'
            },
            {
                type: 'article',
                title: 'Materiali Naturali: Guida Completa alla Bioarchitettura',
                content: 'Una guida completa sui materiali naturali utilizzati nella bioarchitettura...',
                url: '/posts/materiali-naturali-bioarchitettura-guida-completa/',
                image: '/images/materiali-naturali.jpg',
                category: 'Materiali',
                tags: ['materiali naturali', 'legno', 'terra cruda', 'pietra'],
                date: '2024-01-10'
            },
            {
                type: 'article',
                title: 'Efficienza Energetica negli Edifici: Strategie e Tecnologie',
                content: 'Le migliori strategie per ottimizzare l\'efficienza energetica negli edifici...',
                url: '/posts/efficienza-energetica-edifici-strategie-tecnologie/',
                image: '/images/efficienza-energetica.jpg',
                category: 'Energia',
                tags: ['efficienza energetica', 'isolamento', 'tecnologie'],
                date: '2024-01-05'
            }
        ];
    }

    async indexProducts() {
        return [
            {
                type: 'ebook',
                title: 'Guida Completa ai Materiali Naturali',
                content: 'Manuale completo sui materiali naturali per la bioarchitettura',
                url: '/shop/ebooks/',
                image: '/37p04f01.jpg',
                category: 'E-books',
                price: '€29.99',
                tags: ['materiali naturali', 'manuale', 'bioarchitettura']
            },
            {
                type: 'course',
                title: 'Fondamenti di Bioarchitettura',
                content: 'Corso introduttivo ai principi della bioarchitettura',
                url: '/shop/corsi/',
                image: '/37p04f03.jpg',
                category: 'Corsi',
                price: '€149',
                tags: ['corso', 'fondamenti', 'principiante']
            },
            {
                type: 'webinar',
                title: 'Isolamento Termico con Materiali Naturali',
                content: 'Webinar sulle tecniche di isolamento termico naturale',
                url: '/shop/webinar/',
                image: '/53n160.jpg',
                category: 'Webinar',
                price: '€29',
                tags: ['isolamento', 'materiali naturali', 'termico']
            }
        ];
    }

    async indexPages() {
        return [
            {
                type: 'page',
                title: 'Rivista di Bioarchitettura',
                content: 'La pubblicazione ufficiale della Fondazione',
                url: '/rivista/',
                category: 'Rivista',
                tags: ['rivista', 'pubblicazione', 'bioarchitettura']
            },
            {
                type: 'page',
                title: 'Chi Siamo',
                content: 'Fondazione Italiana per la Bioarchitettura',
                url: '/chi-siamo/',
                category: 'Informazioni',
                tags: ['fondazione', 'chi siamo', 'bioarchitettura']
            }
        ];
    }

    async indexEducationalContent() {
        return [
            {
                type: 'educational',
                title: 'Certificazioni Ambientali',
                content: 'Guida alle certificazioni LEED, BREEAM, Passivhaus',
                url: '/shop/corsi/',
                category: 'Formazione',
                tags: ['certificazioni', 'LEED', 'BREEAM', 'Passivhaus']
            }
        ];
    }

    setupEventListeners() {
        // Search trigger
        const searchTrigger = document.getElementById('search-trigger');
        if (searchTrigger) {
            searchTrigger.addEventListener('click', () => this.openSearch());
        }

        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }
        });

        // Close search
        const closeBtn = document.getElementById('search-close-btn');
        const overlay = document.getElementById('search-overlay');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeSearch());
        if (overlay) overlay.addEventListener('click', () => this.closeSearch());

        // Search input
        const searchInput = document.getElementById('ai-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        }

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    openSearch() {
        const modal = document.getElementById('ai-search-modal');
        const input = document.getElementById('ai-search-input');
        
        if (modal && input) {
            modal.classList.add('active');
            input.focus();
            this.showSearchHistory();
            document.body.style.overflow = 'hidden';
        }
    }

    closeSearch() {
        const modal = document.getElementById('ai-search-modal');
        const input = document.getElementById('ai-search-input');
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        if (input) {
            input.value = '';
            this.clearResults();
        }
    }

    async handleSearch(query) {
        if (!query.trim()) {
            this.showSearchHistory();
            return;
        }

        if (query.length < 2) {
            this.clearResults();
            return;
        }

        // Add AI-powered search logic
        const results = await this.performIntelligentSearch(query);
        this.displayResults(results, query);
        this.updateSuggestions(query);
    }

    async performIntelligentSearch(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const words = normalizedQuery.split(/\s+/);
        
        // Score each item in the index
        const scoredResults = this.searchIndex.map(item => {
            let score = 0;
            
            // Title matching (highest weight)
            if (item.title.toLowerCase().includes(normalizedQuery)) {
                score += 100;
            }
            
            // Exact word matches in title
            words.forEach(word => {
                if (item.title.toLowerCase().includes(word)) {
                    score += 50;
                }
            });
            
            // Content matching
            if (item.content.toLowerCase().includes(normalizedQuery)) {
                score += 30;
            }
            
            words.forEach(word => {
                if (item.content.toLowerCase().includes(word)) {
                    score += 15;
                }
            });
            
            // Tag matching
            if (item.tags) {
                item.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(normalizedQuery)) {
                        score += 40;
                    }
                    words.forEach(word => {
                        if (tag.toLowerCase().includes(word)) {
                            score += 20;
                        }
                    });
                });
            }
            
            // Category matching
            if (item.category && item.category.toLowerCase().includes(normalizedQuery)) {
                score += 25;
            }
            
            // Type boosting
            if (item.type === 'article') score *= 1.2;
            if (item.type === 'ebook') score *= 1.1;
            
            return { ...item, score };
        });
        
        // Filter and sort results
        return scoredResults
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 results
    }

    displayResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        const suggestionsContainer = document.getElementById('search-suggestions');
        const historyContainer = document.getElementById('search-history');
        
        // Hide other containers
        suggestionsContainer.style.display = 'none';
        historyContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>Nessun risultato trovato</h3>
                    <p>Prova con termini diversi o più generali</p>
                    <div class="search-tips">
                        <h4>Suggerimenti:</h4>
                        <ul>
                            <li>Verifica l'ortografia</li>
                            <li>Usa termini più generali</li>
                            <li>Prova sinonimi</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }
        
        const resultsHTML = results.map(result => {
            const icon = this.getTypeIcon(result.type);
            const highlightedTitle = this.highlightText(result.title, query);
            const highlightedContent = this.highlightText(
                this.truncateText(result.content, 120), 
                query
            );
            
            return `
                <div class="search-result-item" onclick="this.navigateToResult('${result.url}', '${query}')">
                    <div class="result-icon">${icon}</div>
                    <div class="result-content">
                        <h4 class="result-title">${highlightedTitle}</h4>
                        <p class="result-description">${highlightedContent}</p>
                        <div class="result-meta">
                            <span class="result-type">${result.category || result.type}</span>
                            ${result.price ? `<span class="result-price">${result.price}</span>` : ''}
                            ${result.date ? `<span class="result-date">${this.formatDate(result.date)}</span>` : ''}
                        </div>
                    </div>
                    ${result.image ? `<div class="result-image"><img src="${result.image}" alt="${result.title}" loading="lazy"></div>` : ''}
                </div>
            `;
        }).join('');
        
        resultsContainer.innerHTML = `
            <div class="search-results-header">
                <h3>Risultati per "${query}" (${results.length})</h3>
            </div>
            <div class="search-results-list">
                ${resultsHTML}
            </div>
        `;
    }

    updateSuggestions(query) {
        // Generate intelligent suggestions based on the query
        const suggestions = this.generateSuggestions(query);
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (suggestions.length > 0) {
            const suggestionsHTML = suggestions.map(suggestion => `
                <button class="suggestion-item" onclick="this.applySuggestion('${suggestion}')">
                    ${suggestion}
                </button>
            `).join('');
            
            suggestionsContainer.innerHTML = `
                <div class="suggestions-header">
                    <h4>Suggerimenti:</h4>
                </div>
                <div class="suggestions-list">
                    ${suggestionsHTML}
                </div>
            `;
        }
    }

    generateSuggestions(query) {
        const commonTerms = [
            'casa passiva',
            'materiali naturali',
            'efficienza energetica',
            'bioarchitettura',
            'isolamento termico',
            'certificazioni',
            'sostenibilità',
            'terra cruda',
            'legno',
            'pietra',
            'energie rinnovabili'
        ];
        
        return commonTerms
            .filter(term => term.includes(query.toLowerCase()) && term !== query.toLowerCase())
            .slice(0, 5);
    }

    showSearchHistory() {
        const historyContainer = document.getElementById('search-history');
        const resultsContainer = document.getElementById('search-results');
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        resultsContainer.style.display = 'none';
        suggestionsContainer.style.display = 'none';
        historyContainer.style.display = 'block';
        
        if (this.searchHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-history">
                    <h4>Cronologia ricerche vuota</h4>
                    <p>Le tue ricerche recenti appariranno qui</p>
                </div>
            `;
            return;
        }
        
        const historyHTML = this.searchHistory.slice(0, 5).map(item => `
            <button class="history-item" onclick="this.applyHistoryItem('${item.query}')">
                <svg class="history-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6l4-4-4-4z"></path>
                    <path d="M21 12h-6l4-4-4-4z"></path>
                </svg>
                <span>${item.query}</span>
                <span class="history-date">${this.formatDate(item.date)}</span>
            </button>
        `).join('');
        
        historyContainer.innerHTML = `
            <div class="history-header">
                <h4>Ricerche recenti</h4>
                <button class="clear-history" onclick="this.clearSearchHistory()">Cancella</button>
            </div>
            <div class="history-list">
                ${historyHTML}
            </div>
        `;
    }

    clearResults() {
        const containers = ['search-results', 'search-suggestions', 'search-history'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.style.display = 'none';
                container.innerHTML = '';
            }
        });
    }

    navigateToResult(url, query) {
        // Add to search history
        this.addToSearchHistory(query);
        
        // Navigate to result
        window.location.href = url;
        
        // Close search
        this.closeSearch();
        
        // Track analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search_result_click', {
                search_term: query,
                result_url: url
            });
        }
    }

    addToSearchHistory(query) {
        if (!query.trim()) return;
        
        // Remove existing entry
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Add new entry at the beginning
        this.searchHistory.unshift({
            query: query,
            date: new Date().toISOString()
        });
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('bioarchitettura_search_history', JSON.stringify(this.searchHistory));
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('bioarchitettura_search_history');
        this.showSearchHistory();
    }

    applySuggestion(suggestion) {
        const input = document.getElementById('ai-search-input');
        if (input) {
            input.value = suggestion;
            this.handleSearch(suggestion);
        }
    }

    applyHistoryItem(query) {
        const input = document.getElementById('ai-search-input');
        if (input) {
            input.value = query;
            this.handleSearch(query);
        }
    }

    handleKeyNavigation(e) {
        // Implement keyboard navigation for results
        const results = document.querySelectorAll('.search-result-item, .suggestion-item, .history-item');
        // Navigation logic would go here
    }

    // Utility methods
    getTypeIcon(type) {
        const icons = {
            'article': '📄',
            'ebook': '📚',
            'course': '🎓',
            'webinar': '🎥',
            'page': '🏠',
            'educational': '📖'
        };
        return icons[type] || '📄';
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short'
        });
    }
}

// Initialize AI Search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.aiSearch = new AISearch();
});

// Add CSS styles
const searchStyles = `
<style>
.ai-search-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    display: none;
}

.ai-search-modal.active {
    display: block;
}

.search-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.search-container {
    position: relative;
    max-width: 600px;
    margin: 5% auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-height: 80vh;
}

.search-header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 1rem;
    color: #666;
    z-index: 1;
}

#ai-search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: none;
    font-size: 1.1rem;
    outline: none;
    background: #f8f9fa;
    border-radius: 8px;
}

.search-close {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
}

.search-close:hover {
    background: #eee;
}

.search-content {
    max-height: 60vh;
    overflow-y: auto;
}

.search-result-item {
    display: flex;
    align-items: flex-start;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background 0.2s;
}

.search-result-item:hover {
    background: #f8f9fa;
}

.result-icon {
    font-size: 1.5rem;
    margin-right: 1rem;
    flex-shrink: 0;
}

.result-content {
    flex: 1;
}

.result-title {
    margin: 0 0 0.5rem 0;
    color: #2c5530;
    font-size: 1rem;
}

.result-title mark {
    background: #fff3cd;
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
}

.result-description {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.result-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #888;
}

.result-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    margin-left: 1rem;
    flex-shrink: 0;
}

.result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.search-trigger {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.search-trigger:hover {
    background: #f0f0f0;
    color: #4a7c59;
}

.suggestion-item,
.history-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover,
.history-item:hover {
    background: #f8f9fa;
}

.history-icon {
    margin-right: 0.75rem;
    color: #888;
}

.history-date {
    margin-left: auto;
    font-size: 0.8rem;
    color: #888;
}

.no-results,
.empty-history {
    text-align: center;
    padding: 3rem 2rem;
    color: #666;
}

.search-tips ul {
    text-align: left;
    max-width: 200px;
    margin: 1rem auto;
}

.suggestions-header,
.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.clear-history {
    background: none;
    border: none;
    color: #4a7c59;
    cursor: pointer;
    font-size: 0.9rem;
}

.clear-history:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .search-container {
        margin: 2% 1rem;
        max-height: 90vh;
    }
    
    .result-image {
        display: none;
    }
    
    .result-meta {
        flex-direction: column;
        gap: 0.25rem;
    }
}
</style>
`;

// Inject CSS styles
document.head.insertAdjacentHTML('beforeend', searchStyles);