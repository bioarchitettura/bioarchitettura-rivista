/**
 * Bioarchitettura Post - Article-specific functionality
 * Enhanced reading experience, AI summaries, and related content
 */

// =============================================================================
// Post Configuration
// =============================================================================

const POST_CONFIG = {
    // Reading Progress
    READING_PROGRESS_SELECTOR: '.content-body',
    PROGRESS_BAR_HEIGHT: '3px',
    
    // AI Summary
    SUMMARY_MAX_LENGTH: 200,
    SUMMARY_TIMEOUT: 10000,
    
    // Related Articles
    MAX_RELATED: 3,
    SIMILARITY_THRESHOLD: 1,
    
    // Reading Time
    WORDS_PER_MINUTE: 200,
    
    // Image Processing
    LAZY_LOAD_OFFSET: '100px',
    IMAGE_QUALITY: 80,
    
    // Social Sharing
    SHARE_URLS: {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u={url}',
        twitter: 'https://twitter.com/intent/tweet?url={url}&text={title}',
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url={url}',
        whatsapp: 'https://wa.me/?text={title}%20{url}',
        telegram: 'https://t.me/share/url?url={url}&text={title}'
    }
};

// =============================================================================
// Reading Progress Tracker
// =============================================================================

class ReadingProgressTracker {
    constructor() {
        this.progressBar = null;
        this.contentElement = null;
        this.isReading = false;
        this.startTime = null;
        this.totalReadingTime = 0;
        
        this.init();
    }

    init() {
        this.createProgressBar();
        this.setupContentElement();
        this.setupScrollTracking();
        this.setupReadingTimeTracking();
    }

    createProgressBar() {
        // Create progress bar element
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress';
        this.progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .reading-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: ${POST_CONFIG.PROGRESS_BAR_HEIGHT};
                background-color: rgba(0, 0, 0, 0.1);
                z-index: 1000;
                transition: opacity 0.3s ease;
            }
            
            .reading-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
                width: 0%;
                transition: width 0.1s ease-out;
            }
            
            .reading-progress.hidden {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(this.progressBar);
    }

    setupContentElement() {
        this.contentElement = document.querySelector(POST_CONFIG.READING_PROGRESS_SELECTOR);
        if (!this.contentElement) {
            console.warn('Content element not found for reading progress');
        }
    }

    setupScrollTracking() {
        if (!this.contentElement) return;

        const updateProgress = throttle(() => {
            const rect = this.contentElement.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const contentHeight = this.contentElement.offsetHeight;
            
            // Calculate how much of the content has been read
            const contentTop = rect.top;
            const contentBottom = rect.bottom;
            
            let progress = 0;
            
            if (contentTop <= 0 && contentBottom >= windowHeight) {
                // Content is larger than viewport and user is scrolling through it
                const visibleContent = Math.min(windowHeight, contentBottom) - Math.max(0, contentTop);
                const scrolledContent = Math.max(0, -contentTop);
                progress = scrolledContent / (contentHeight - windowHeight);
            } else if (contentTop <= windowHeight && contentBottom >= 0) {
                // Content is partially visible
                const visibleContent = Math.min(contentBottom, windowHeight) - Math.max(contentTop, 0);
                progress = visibleContent / Math.min(contentHeight, windowHeight);
            }
            
            progress = Math.max(0, Math.min(1, progress));
            
            const progressFill = this.progressBar.querySelector('.reading-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress * 100}%`;
            }
            
            // Hide progress bar when at top of page
            this.progressBar.classList.toggle('hidden', window.pageYOffset < 100);
            
            // Track reading engagement
            this.trackReadingEngagement(progress);
            
        }, 50);

        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);
        
        // Initial update
        updateProgress();
    }

    setupReadingTimeTracking() {
        // Track when user starts reading
        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isReading) {
                    this.startReading();
                } else if (!entry.isIntersecting && this.isReading) {
                    this.pauseReading();
                }
            });
        }, {
            threshold: 0.1
        });

        if (this.contentElement) {
            intersectionObserver.observe(this.contentElement);
        }

        // Track reading time on page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseReading();
            } else if (this.contentElement && isInViewport(this.contentElement, 100)) {
                this.startReading();
            }
        });

        // Track reading time on page unload
        window.addEventListener('beforeunload', () => {
            this.recordReadingSession();
        });
    }

    startReading() {
        if (this.isReading) return;
        
        this.isReading = true;
        this.startTime = Date.now();
        
        console.log('Started reading session');
    }

    pauseReading() {
        if (!this.isReading || !this.startTime) return;
        
        const sessionTime = Date.now() - this.startTime;
        this.totalReadingTime += sessionTime;
        this.isReading = false;
        this.startTime = null;
        
        console.log(`Reading session: ${sessionTime}ms, Total: ${this.totalReadingTime}ms`);
    }

    recordReadingSession() {
        if (this.isReading) {
            this.pauseReading();
        }
        
        if (this.totalReadingTime > 5000) { // Only record if read for more than 5 seconds
            this.sendReadingAnalytics();
        }
    }

    trackReadingEngagement(progress) {
        // Track reading milestones
        const milestones = [0.25, 0.5, 0.75, 1.0];
        const progressPercent = Math.floor(progress * 100);
        
        milestones.forEach(milestone => {
            const milestonePercent = milestone * 100;
            if (progressPercent >= milestonePercent && !this[`milestone_${milestonePercent}`]) {
                this[`milestone_${milestonePercent}`] = true;
                this.recordMilestone(milestonePercent);
            }
        });
    }

    recordMilestone(percent) {
        console.log(`Reading milestone: ${percent}%`);
        
        // Send analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'reading_progress', {
                event_category: 'engagement',
                event_label: window.location.pathname,
                value: percent
            });
        }
    }

    sendReadingAnalytics() {
        const data = {
            url: window.location.pathname,
            title: document.title,
            readingTime: this.totalReadingTime,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        console.log('Reading analytics:', data);
        
        // In production, send to analytics service
        // fetch('/api/analytics/reading', { method: 'POST', body: JSON.stringify(data) });
    }
}

// =============================================================================
// Enhanced AI Summary Generator
// =============================================================================

class PostSummaryGenerator {
    constructor() {
        this.aiProcessor = null;
        this.summaryElement = null;
        this.toggleButton = null;
        this.isVisible = true;
        
        this.init();
    }

    init() {
        this.summaryElement = document.getElementById('post-summary');
        this.toggleButton = document.getElementById('summary-toggle');
        
        if (!this.summaryElement) return;
        
        this.setupToggleButton();
        this.generateSummary();
    }

    setupToggleButton() {
        if (!this.toggleButton) return;
        
        this.toggleButton.addEventListener('click', () => {
            this.toggleSummary();
        });
    }

    async generateSummary() {
        const summaryContent = document.getElementById('summary-content');
        const contentBody = document.querySelector('.content-body');
        const postTitle = document.querySelector('.post-title');
        
        if (!summaryContent || !contentBody) return;
        
        try {
            // Show loading state
            summaryContent.innerHTML = `
                <div class="summary-loading">
                    <div class="loading-spinner"></div>
                    <span>${window.t ? window.t('post.generating_summary') : 'Generando riassunto...'}</span>
                </div>
            `;
            
            // Get AI processor from main app
            if (window.bioarchitetturaApp?.postProcessor?.aiProcessor) {
                this.aiProcessor = window.bioarchitetturaApp.postProcessor.aiProcessor;
            } else {
                // Create new AI processor if not available
                this.aiProcessor = new AIContentProcessor();
            }
            
            const title = postTitle ? postTitle.textContent : '';
            const summary = await this.aiProcessor.generateSummary(contentBody.innerHTML, title);
            
            // Display summary
            summaryContent.innerHTML = `
                <div class="summary-text">${summary}</div>
                <div class="summary-meta">
                    <span class="summary-info">📝 Riassunto generato automaticamente</span>
                </div>
            `;
            
        } catch (error) {
            console.error('Failed to generate summary:', error);
            this.showFallbackSummary(contentBody);
        }
    }

    showFallbackSummary(contentBody) {
        const summaryContent = document.getElementById('summary-content');
        if (!summaryContent) return;
        
        // Generate extractive summary as fallback
        const text = getTextContent(contentBody.innerHTML);
        const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
        const fallbackSummary = sentences.slice(0, 3).join(' ');
        
        summaryContent.innerHTML = `
            <div class="summary-text">${fallbackSummary}</div>
            <div class="summary-meta">
                <span class="summary-info">📝 Riassunto estrattivo</span>
            </div>
        `;
    }

    toggleSummary() {
        if (!this.summaryElement || !this.toggleButton) return;
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.summaryElement.style.display = 'block';
            this.toggleButton.textContent = window.t ? window.t('post.hide_summary') : 'Nascondi riassunto';
        } else {
            this.summaryElement.style.display = 'none';
            this.toggleButton.textContent = window.t ? window.t('post.show_summary') : 'Mostra riassunto';
        }
        
        // Store preference
        localStorage.setItem('bioarch_summary_visible', this.isVisible);
    }

    loadSummaryPreference() {
        const preference = localStorage.getItem('bioarch_summary_visible');
        if (preference !== null) {
            this.isVisible = preference === 'true';
            if (!this.isVisible) {
                setTimeout(() => this.toggleSummary(), 100);
            }
        }
    }
}

// =============================================================================
// Enhanced Social Sharing
// =============================================================================

class SocialSharingManager {
    constructor() {
        this.shareButtons = [];
        this.shareData = {};
        this.init();
    }

    init() {
        this.collectShareData();
        this.setupShareButtons();
        this.setupNativeSharing();
        this.addCopyLinkFeature();
    }

    collectShareData() {
        this.shareData = {
            title: document.querySelector('.post-title')?.textContent || document.title,
            url: window.location.href,
            description: document.querySelector('.post-excerpt')?.textContent || 
                         document.querySelector('meta[name="description"]')?.content || '',
            image: document.querySelector('.post-featured-image img')?.src || 
                   document.querySelector('meta[property="og:image"]')?.content || ''
        };
    }

    setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(button => {
            const platform = this.detectPlatform(button);
            if (platform) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.shareToSocial(platform);
                });
            }
        });
    }

    detectPlatform(button) {
        if (button.classList.contains('facebook')) return 'facebook';
        if (button.classList.contains('twitter')) return 'twitter';
        if (button.classList.contains('linkedin')) return 'linkedin';
        if (button.classList.contains('whatsapp')) return 'whatsapp';
        if (button.classList.contains('telegram')) return 'telegram';
        if (button.classList.contains('email')) return 'email';
        return null;
    }

    shareToSocial(platform) {
        const urls = POST_CONFIG.SHARE_URLS;
        let shareUrl = '';
        
        switch (platform) {
            case 'facebook':
                shareUrl = urls.facebook.replace('{url}', encodeURIComponent(this.shareData.url));
                break;
            case 'twitter':
                shareUrl = urls.twitter
                    .replace('{url}', encodeURIComponent(this.shareData.url))
                    .replace('{title}', encodeURIComponent(this.shareData.title));
                break;
            case 'linkedin':
                shareUrl = urls.linkedin.replace('{url}', encodeURIComponent(this.shareData.url));
                break;
            case 'whatsapp':
                shareUrl = urls.whatsapp
                    .replace('{title}', encodeURIComponent(this.shareData.title))
                    .replace('{url}', encodeURIComponent(this.shareData.url));
                break;
            case 'telegram':
                shareUrl = urls.telegram
                    .replace('{url}', encodeURIComponent(this.shareData.url))
                    .replace('{title}', encodeURIComponent(this.shareData.title));
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent(this.shareData.title)}&body=${encodeURIComponent(this.shareData.description + '\n\n' + this.shareData.url)}`;
                break;
        }
        
        if (shareUrl) {
            if (platform === 'email') {
                window.location.href = shareUrl;
            } else {
                this.openShareWindow(shareUrl);
            }
            
            this.trackShare(platform);
        }
    }

    openShareWindow(url) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        
        window.open(url, 'share', `
            width=${width},
            height=${height},
            left=${left},
            top=${top},
            scrollbars=yes,
            resizable=yes
        `);
    }

    setupNativeSharing() {
        if (navigator.share) {
            // Add native share button
            const shareContainer = document.querySelector('.share-buttons');
            if (shareContainer) {
                const nativeShareBtn = document.createElement('button');
                nativeShareBtn.className = 'share-btn native';
                nativeShareBtn.innerHTML = '📱';
                nativeShareBtn.title = 'Condividi';
                nativeShareBtn.addEventListener('click', () => this.nativeShare());
                shareContainer.appendChild(nativeShareBtn);
            }
        }
    }

    async nativeShare() {
        if (!navigator.share) return;
        
        try {
            await navigator.share({
                title: this.shareData.title,
                text: this.shareData.description,
                url: this.shareData.url
            });
            
            this.trackShare('native');
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Native sharing failed:', error);
            }
        }
    }

    addCopyLinkFeature() {
        const shareContainer = document.querySelector('.share-buttons');
        if (shareContainer) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'share-btn copy-link';
            copyBtn.innerHTML = '🔗';
            copyBtn.title = 'Copia link';
            copyBtn.addEventListener('click', () => this.copyLink());
            shareContainer.appendChild(copyBtn);
        }
    }

    async copyLink() {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(this.shareData.url);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = this.shareData.url;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            if (window.bioarchitetturaApp?.notificationManager) {
                window.bioarchitetturaApp.notificationManager.show(
                    'Link copiato negli appunti',
                    'success',
                    null,
                    2000
                );
            }
            
            this.trackShare('copy_link');
        } catch (error) {
            console.error('Failed to copy link:', error);
            if (window.bioarchitetturaApp?.notificationManager) {
                window.bioarchitetturaApp.notificationManager.show(
                    'Impossibile copiare il link',
                    'error'
                );
            }
        }
    }

    trackShare(platform) {
        console.log(`Shared via ${platform}:`, this.shareData.url);
        
        // Send analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                method: platform,
                content_type: 'article',
                content_id: window.location.pathname
            });
        }
    }
}

// =============================================================================
// Enhanced Image Experience
// =============================================================================

class ImageEnhancer {
    constructor() {
        this.images = [];
        this.lightbox = null;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupLightbox();
        this.setupImageZoom();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"], img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: POST_CONFIG.LAZY_LOAD_OFFSET
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        
        img.classList.add('loaded');
        
        // Add load event listener for fade-in effect
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    }

    setupImageOptimization() {
        const images = document.querySelectorAll('.content-body img');
        
        images.forEach(img => {
            // Add responsive image attributes if not present
            if (!img.hasAttribute('sizes')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, 800px');
            }
            
            // Add alt text if missing
            if (!img.hasAttribute('alt') || !img.alt) {
                const caption = img.closest('figure')?.querySelector('figcaption')?.textContent;
                const title = img.getAttribute('title') || '';
                img.alt = caption || title || 'Immagine articolo bioarchitettura';
            }
        });
    }

    setupLightbox() {
        const contentImages = document.querySelectorAll('.content-body img, .post-featured-image img');
        
        contentImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => this.openLightbox(img));
        });
        
        this.createLightboxHTML();
    }

    createLightboxHTML() {
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'image-lightbox';
        this.lightbox.innerHTML = `
            <div class="lightbox-content">
                <img class="lightbox-image" src="" alt="">
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-caption"></div>
            </div>
            <div class="lightbox-overlay"></div>
        `;
        
        document.body.appendChild(this.lightbox);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .image-lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .image-lightbox.active {
                opacity: 1;
                visibility: visible;
            }
            
            .lightbox-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                cursor: pointer;
            }
            
            .lightbox-content {
                position: relative;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                padding: 2rem;
            }
            
            .lightbox-image {
                max-width: 90%;
                max-height: 80%;
                object-fit: contain;
                box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
            }
            
            .lightbox-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 2rem;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .lightbox-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .lightbox-caption {
                color: white;
                text-align: center;
                margin-top: 1rem;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
        
        // Setup event listeners
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        this.lightbox.querySelector('.lightbox-overlay').addEventListener('click', () => this.closeLightbox());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
        });
    }

    openLightbox(img) {
        const lightboxImg = this.lightbox.querySelector('.lightbox-image');
        const caption = this.lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        
        // Get caption from various sources
        const captionText = img.closest('figure')?.querySelector('figcaption')?.textContent ||
                           img.getAttribute('title') ||
                           img.alt;
        
        caption.textContent = captionText || '';
        caption.style.display = captionText ? 'block' : 'none';
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    setupImageZoom() {
        // Add zoom functionality to images on hover (desktop only)
        if (window.innerWidth > 768) {
            const images = document.querySelectorAll('.content-body img');
            
            images.forEach(img => {
                img.addEventListener('mouseenter', () => {
                    img.style.transform = 'scale(1.02)';
                    img.style.transition = 'transform 0.3s ease';
                });
                
                img.addEventListener('mouseleave', () => {
                    img.style.transform = 'scale(1)';
                });
            });
        }
    }
}

// =============================================================================
// Table of Contents Generator
// =============================================================================

class TableOfContentsGenerator {
    constructor() {
        this.toc = null;
        this.headings = [];
        this.init();
    }

    init() {
        this.findHeadings();
        if (this.headings.length > 2) {
            this.generateTOC();
            this.setupScrollSpy();
        }
    }

    findHeadings() {
        this.headings = Array.from(document.querySelectorAll('.content-body h2, .content-body h3, .content-body h4'));
        
        // Add IDs to headings if they don't have them
        this.headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = this.generateId(heading.textContent) || `heading-${index}`;
            }
        });
    }

    generateId(text) {
        return text.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    generateTOC() {
        this.toc = document.createElement('div');
        this.toc.className = 'table-of-contents';
        this.toc.innerHTML = `
            <h3>Contenuti dell'articolo</h3>
            <nav class="toc-nav">
                ${this.generateTOCList()}
            </nav>
        `;
        
        // Insert TOC after post header
        const postHeader = document.querySelector('.post-header');
        if (postHeader && postHeader.nextSibling) {
            postHeader.parentNode.insertBefore(this.toc, postHeader.nextSibling);
        }
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .table-of-contents {
                background-color: var(--gray-50);
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-lg);
                padding: var(--space-6);
                margin: var(--space-8) 0;
            }
            
            .table-of-contents h3 {
                margin-bottom: var(--space-4);
                color: var(--primary-color);
            }
            
            .toc-nav ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .toc-nav li {
                margin-bottom: var(--space-2);
            }
            
            .toc-nav a {
                color: var(--gray-700);
                text-decoration: none;
                transition: color 0.3s ease;
                display: block;
                padding: var(--space-1) 0;
            }
            
            .toc-nav a:hover,
            .toc-nav a.active {
                color: var(--primary-color);
                text-decoration: underline;
            }
            
            .toc-nav .h3 {
                padding-left: var(--space-4);
                font-size: var(--text-sm);
            }
            
            .toc-nav .h4 {
                padding-left: var(--space-8);
                font-size: var(--text-sm);
                color: var(--gray-600);
            }
        `;
        document.head.appendChild(style);
    }

    generateTOCList() {
        return `
            <ul>
                ${this.headings.map(heading => `
                    <li class="${heading.tagName.toLowerCase()}">
                        <a href="#${heading.id}" class="toc-link">${heading.textContent}</a>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    setupScrollSpy() {
        const tocLinks = this.toc.querySelectorAll('.toc-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const tocLink = this.toc.querySelector(`a[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    if (tocLink) {
                        tocLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-20% 0% -35% 0%'
        });

        this.headings.forEach(heading => observer.observe(heading));
    }
}

// =============================================================================
// Post Initialization
// =============================================================================

class PostManager {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Only initialize on post pages
        if (!document.body.classList.contains('post')) {
            return;
        }

        // Initialize all post components
        this.components.progressTracker = new ReadingProgressTracker();
        this.components.summaryGenerator = new PostSummaryGenerator();
        this.components.socialSharing = new SocialSharingManager();
        this.components.imageEnhancer = new ImageEnhancer();
        this.components.tocGenerator = new TableOfContentsGenerator();

        this.setupPostEnhancements();
    }

    setupPostEnhancements() {
        // Calculate and display reading time
        this.calculateReadingTime();
        
        // Setup print functionality
        this.setupPrintStyles();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup reading list functionality
        this.setupReadingList();
    }

    calculateReadingTime() {
        const contentElement = document.querySelector('.content-body');
        const readingTimeElement = document.querySelector('.post-reading-time');
        
        if (contentElement && readingTimeElement) {
            const text = getTextContent(contentElement.innerHTML);
            const wordCount = text.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / POST_CONFIG.WORDS_PER_MINUTE);
            
            readingTimeElement.textContent = `${readingTime} min di lettura`;
        }
    }

    setupPrintStyles() {
        // Add print button
        const postHeader = document.querySelector('.post-header');
        if (postHeader) {
            const printBtn = document.createElement('button');
            printBtn.className = 'btn btn-secondary print-btn';
            printBtn.innerHTML = '🖨️ Stampa';
            printBtn.addEventListener('click', () => window.print());
            
            postHeader.appendChild(printBtn);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch (e.key) {
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.saveForLater();
                    }
                    break;
                case 'p':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        window.print();
                    }
                    break;
            }
        });
    }

    setupReadingList() {
        // Add save for later button
        const shareButtons = document.querySelector('.share-buttons');
        if (shareButtons) {
            const saveBtn = document.createElement('button');
            saveBtn.className = 'share-btn save-later';
            saveBtn.innerHTML = '📚';
            saveBtn.title = 'Salva per dopo';
            saveBtn.addEventListener('click', () => this.saveForLater());
            shareButtons.appendChild(saveBtn);
        }
    }

    saveForLater() {
        const articleData = {
            title: document.querySelector('.post-title')?.textContent,
            url: window.location.href,
            excerpt: document.querySelector('.post-excerpt')?.textContent,
            image: document.querySelector('.post-featured-image img')?.src,
            savedAt: new Date().toISOString()
        };
        
        const savedArticles = JSON.parse(localStorage.getItem('bioarch_reading_list') || '[]');
        
        // Check if already saved
        const alreadySaved = savedArticles.some(article => article.url === articleData.url);
        
        if (!alreadySaved) {
            savedArticles.push(articleData);
            localStorage.setItem('bioarch_reading_list', JSON.stringify(savedArticles));
            
            if (window.bioarchitetturaApp?.notificationManager) {
                window.bioarchitetturaApp.notificationManager.show(
                    'Articolo salvato nella lista di lettura',
                    'success'
                );
            }
        } else {
            if (window.bioarchitetturaApp?.notificationManager) {
                window.bioarchitetturaApp.notificationManager.show(
                    'Articolo già salvato',
                    'info'
                );
            }
        }
    }

    getComponent(name) {
        return this.components[name];
    }
}

// =============================================================================
// Post System Startup
// =============================================================================

// Initialize post manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.postManager = new PostManager();
    });
} else {
    window.postManager = new PostManager();
}

// Export for global access
window.PostConfig = POST_CONFIG;