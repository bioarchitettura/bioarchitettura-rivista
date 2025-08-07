/**
 * Bioarchitettura Slideshow Component
 * 
 * Features:
 * - Responsive design with touch/swipe support
 * - Keyboard navigation (Arrow keys, Space, Enter)
 * - Auto-play with pause on hover
 * - Lazy loading of images
 * - Accessibility features (ARIA roles, screen reader support)
 * - Performance optimizations
 * - Smooth transitions and animations
 */

class BioarchitetturaSlideshow {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        
        if (!this.container) {
            console.error('Slideshow container not found');
            return;
        }

        // Default options
        this.options = {
            autoPlay: true,
            interval: 5000,
            showControls: true,
            showIndicators: true,
            showPlayPause: true,
            loop: true,
            keyboard: true,
            touch: true,
            lazy: true,
            pauseOnHover: true,
            ...options
        };

        // State
        this.currentSlide = 0;
        this.slides = [];
        this.isPlaying = this.options.autoPlay;
        this.autoPlayTimer = null;
        this.progressTimer = null;
        this.touchStart = null;
        this.touchEnd = null;

        this.init();
    }

    init() {
        this.createSlideshow();
        this.setupEventListeners();
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
        this.updateAccessibility();
    }

    createSlideshow() {
        // Get slides data from container
        this.slides = this.getSlideData();
        
        if (this.slides.length === 0) {
            console.warn('No slides found');
            return;
        }

        // Create slideshow HTML structure
        this.container.innerHTML = this.generateSlideshowHTML();
        
        // Cache DOM elements
        this.slidesContainer = this.container.querySelector('.slideshow-slides');
        this.slideElements = this.container.querySelectorAll('.slideshow-slide');
        this.prevBtn = this.container.querySelector('.slideshow-nav.prev');
        this.nextBtn = this.container.querySelector('.slideshow-nav.next');
        this.indicators = this.container.querySelectorAll('.slideshow-indicator');
        this.playPauseBtn = this.container.querySelector('.slideshow-play-pause');
        this.progressBar = this.container.querySelector('.slideshow-progress');

        // Set initial state
        this.updateSlideshow();
        this.lazyLoadImages();
    }

    getSlideData() {
        // Try to get slides from data attributes or child elements
        const slidesData = this.container.dataset.slides;
        
        if (slidesData) {
            try {
                return JSON.parse(slidesData);
            } catch (e) {
                console.error('Invalid slides data:', e);
            }
        }

        // Fallback: create slides from existing images in container
        const existingImages = this.container.querySelectorAll('img');
        if (existingImages.length > 0) {
            return Array.from(existingImages).map((img, index) => ({
                src: img.src,
                alt: img.alt || `Slide ${index + 1}`,
                title: img.title || '',
                caption: img.dataset.caption || ''
            }));
        }

        // Default slides with bioarchitecture images
        return [
            {
                src: './33n002.jpg',
                alt: 'Sustainable Architecture Project 1',
                title: 'Architettura Sostenibile',
                caption: 'Progetti innovativi di bioarchitettura per un futuro sostenibile'
            },
            {
                src: './bio_47_n064.jpg',
                alt: 'Sustainable Architecture Project 2', 
                title: 'Casa Passiva',
                caption: 'Tecnologie avanzate per l\'efficienza energetica e il comfort abitativo'
            },
            {
                src: './Bioarchitettura_71_p.jpg',
                alt: 'Bioarchitettura Magazine Cover',
                title: 'Rivista Bioarchitettura',
                caption: 'La prima rivista italiana dedicata all\'architettura ecologica'
            },
            {
                src: './36p044f01.jpg',
                alt: 'Sustainable Building Materials',
                title: 'Materiali Naturali',
                caption: 'Soluzioni costruttive con materiali eco-compatibili e salubri'
            }
        ];
    }

    generateSlideshowHTML() {
        const slidesHTML = this.slides.map((slide, index) => `
            <div class="slideshow-slide" data-slide="${index}" role="tabpanel" aria-hidden="${index !== 0}" id="slide-${index}">
                <img 
                    ${index === 0 ? 'src' : 'data-src'}="${slide.src}" 
                    alt="${slide.alt}"
                    loading="${index === 0 ? 'eager' : 'lazy'}"
                />
                ${slide.title || slide.caption ? `
                    <div class="slideshow-caption">
                        ${slide.title ? `<h3>${slide.title}</h3>` : ''}
                        ${slide.caption ? `<p>${slide.caption}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');

        const indicatorsHTML = this.options.showIndicators ? `
            <div class="slideshow-indicators" role="tablist" aria-label="Slide indicators">
                ${this.slides.map((_, index) => `
                    <button 
                        class="slideshow-indicator ${index === 0 ? 'active' : ''}" 
                        data-slide="${index}"
                        role="tab"
                        aria-selected="${index === 0}"
                        aria-controls="slide-${index}"
                        aria-label="Go to slide ${index + 1}"
                    ></button>
                `).join('')}
            </div>
        ` : '';

        const controlsHTML = this.options.showControls ? `
            <button class="slideshow-nav prev" aria-label="Previous slide" title="Previous slide"></button>
            <button class="slideshow-nav next" aria-label="Next slide" title="Next slide"></button>
        ` : '';

        const playPauseHTML = this.options.showPlayPause ? `
            <button class="slideshow-play-pause" aria-label="Pause slideshow" title="Pause slideshow">
                <span class="play-icon" style="display: none;">▶</span>
                <span class="pause-icon">⏸</span>
            </button>
        ` : '';

        return `
            <div class="slideshow-container" role="region" aria-label="Image slideshow" aria-live="polite">
                <div class="slideshow-slides" style="transform: translateX(0%)">
                    ${slidesHTML}
                </div>
                ${controlsHTML}
                ${indicatorsHTML}
                ${playPauseHTML}
                <div class="slideshow-progress" style="width: 0%"></div>
                <div class="slideshow-loading" style="display: none;">Loading...</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Navigation controls
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Indicators
        if (this.indicators) {
            this.indicators.forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    const slideIndex = parseInt(e.target.dataset.slide);
                    this.goToSlide(slideIndex);
                });
            });
        }

        // Play/pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Keyboard navigation
        if (this.options.keyboard) {
            this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
            // Make container focusable
            this.container.setAttribute('tabindex', '0');
        }

        // Mouse events for auto-play
        if (this.options.pauseOnHover) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.startAutoPlay();
                }
            });
        }

        // Touch events for swipe
        if (this.options.touch) {
            this.setupTouchEvents();
        }

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    setupTouchEvents() {
        let startX = 0;
        let deltaX = 0;
        let isDragging = false;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            this.container.classList.add('swiping');
        }, { passive: true });

        this.container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            deltaX = e.touches[0].clientX - startX;
            
            // Provide visual feedback during swipe
            const translateX = -this.currentSlide * 100 + (deltaX / this.container.offsetWidth) * 100;
            this.slidesContainer.style.transform = `translateX(${Math.max(-100 * (this.slides.length - 1), Math.min(0, translateX))}%)`;
        }, { passive: true });

        this.container.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.container.classList.remove('swiping');
            
            const threshold = this.container.offsetWidth * 0.2;
            
            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            } else {
                // Snap back to current slide
                this.updateSlidePosition();
            }
            
            deltaX = 0;
        }, { passive: true });
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slides.length - 1);
                break;
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        } else if (this.options.loop) {
            this.goToSlide(this.slides.length - 1);
        }
    }

    nextSlide() {
        if (this.currentSlide < this.slides.length - 1) {
            this.goToSlide(this.currentSlide + 1);
        } else if (this.options.loop) {
            this.goToSlide(0);
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length || index === this.currentSlide) {
            return;
        }

        this.currentSlide = index;
        this.updateSlideshow();
        this.lazyLoadImages();
        
        if (this.isPlaying) {
            this.restartAutoPlay();
        }
    }

    updateSlideshow() {
        this.updateSlidePosition();
        this.updateIndicators();
        this.updateAccessibility();
    }

    updateSlidePosition() {
        const translateX = -this.currentSlide * 100;
        this.slidesContainer.style.transform = `translateX(${translateX}%)`;
    }

    updateIndicators() {
        if (!this.indicators) return;
        
        this.indicators.forEach((indicator, index) => {
            const isActive = index === this.currentSlide;
            indicator.classList.toggle('active', isActive);
            indicator.setAttribute('aria-selected', isActive);
        });
    }

    updateAccessibility() {
        if (!this.slideElements) return;
        
        this.slideElements.forEach((slide, index) => {
            const isActive = index === this.currentSlide;
            slide.setAttribute('aria-hidden', !isActive);
            
            // Update screen reader announcements
            if (isActive) {
                slide.setAttribute('aria-live', 'polite');
            } else {
                slide.removeAttribute('aria-live');
            }
        });
    }

    lazyLoadImages() {
        // Load current slide and adjacent slides
        const loadIndexes = [
            this.currentSlide - 1,
            this.currentSlide,
            this.currentSlide + 1
        ].filter(index => index >= 0 && index < this.slides.length);

        loadIndexes.forEach(index => {
            const slide = this.slideElements[index];
            const img = slide?.querySelector('img[data-src]');
            
            if (img) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                }, { once: true });
            }
        });
    }

    startAutoPlay() {
        if (!this.options.autoPlay || this.slides.length <= 1) return;
        
        this.isPlaying = true;
        this.updatePlayPauseButton();
        
        this.autoPlayTimer = setTimeout(() => {
            this.nextSlide();
            this.startAutoPlay();
        }, this.options.interval);

        // Update progress bar
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            this.progressBar.style.transition = `width ${this.options.interval}ms linear`;
            
            // Small delay to ensure transition starts
            requestAnimationFrame(() => {
                this.progressBar.style.width = '100%';
            });
        }
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }

        if (this.progressBar) {
            this.progressBar.style.transition = 'none';
            this.progressBar.style.width = '0%';
        }
    }

    restartAutoPlay() {
        this.pauseAutoPlay();
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    updatePlayPauseButton() {
        if (!this.playPauseBtn) return;
        
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
            this.playPauseBtn.setAttribute('aria-label', 'Pause slideshow');
            this.playPauseBtn.setAttribute('title', 'Pause slideshow');
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
            this.playPauseBtn.setAttribute('aria-label', 'Play slideshow');
            this.playPauseBtn.setAttribute('title', 'Play slideshow');
        }
    }

    handleResize() {
        // Recalculate positions on resize
        this.updateSlidePosition();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoPlay();
        } else if (this.isPlaying) {
            this.startAutoPlay();
        }
    }

    // Public API
    destroy() {
        this.pauseAutoPlay();
        
        if (this.autoPlayTimer) {
            clearTimeout(this.autoPlayTimer);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Clear container
        this.container.innerHTML = '';
    }

    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.slides.length;
    }

    updateSlides(newSlides) {
        this.slides = newSlides;
        this.currentSlide = 0;
        this.createSlideshow();
    }
}

// Auto-initialize slideshows
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all slideshows with class 'bioarchitettura-slideshow'
    const slideshows = document.querySelectorAll('.bioarchitettura-slideshow');
    
    slideshows.forEach(slideshow => {
        // Get options from data attributes
        const options = {
            autoPlay: slideshow.dataset.autoplay !== 'false',
            interval: parseInt(slideshow.dataset.interval) || 5000,
            showControls: slideshow.dataset.controls !== 'false',
            showIndicators: slideshow.dataset.indicators !== 'false',
            showPlayPause: slideshow.dataset.playpause !== 'false',
            loop: slideshow.dataset.loop !== 'false',
            keyboard: slideshow.dataset.keyboard !== 'false',
            touch: slideshow.dataset.touch !== 'false',
            lazy: slideshow.dataset.lazy !== 'false',
            pauseOnHover: slideshow.dataset.pauseonhover !== 'false'
        };
        
        new BioarchitetturaSlideshow(slideshow, options);
    });
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BioarchitetturaSlideshow;
}

// Global access
window.BioarchitetturaSlideshow = BioarchitetturaSlideshow;