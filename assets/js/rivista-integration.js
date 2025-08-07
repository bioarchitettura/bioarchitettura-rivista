/**
 * Rivista Products Integration
 * Loads and integrates products from the Bioarchitettura Rivista
 */

class RivistaProductsManager {
    constructor() {
        this.rivistaProducts = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            // In production, this would fetch from the rivista API or CMS
            // For now, we use the data file structure
            this.rivistaProducts = this.getRivistaProducts();
            
            // Notify the main shop that rivista products are available
            if (window.productManager) {
                window.productManager.addRivistaProducts(this.rivistaProducts);
            }
        } catch (error) {
            console.error('Failed to load rivista products:', error);
        }
    }

    getRivistaProducts() {
        // This data would typically come from Jekyll's data files or an external API
        return [
            {
                id: 'rivista-bioarchitettura-70',
                title: 'Bioarchitettura Rivista N. 70',
                description: 'Numero speciale dedicato alle tecnologie innovative per l\'edilizia sostenibile e la bioarchitettura del futuro.',
                price: 15.00,
                category: 'magazines',
                type: 'physical',
                source: 'rivista',
                image: '/Bioarchitettura_70_p.jpg',
                features: [
                    'Tecnologie innovative',
                    'Casi studio internazionali', 
                    'Interviste agli esperti',
                    'Schede tecniche dettagliate'
                ],
                specifications: {
                    pages: 128,
                    format: 'A4',
                    language: 'Italiano'
                },
                inStock: true,
                featured: true,
                tags: ['sostenibilità', 'innovazione', 'tecnologia'],
                publishDate: '2024',
                shippingRequired: true
            },
            {
                id: 'rivista-bioarchitettura-71',
                title: 'Bioarchitettura Rivista N. 71',
                description: 'Focus su materiali naturali e tecniche costruttive tradizionali rivisitate in chiave moderna.',
                price: 15.00,
                category: 'magazines',
                type: 'physical',
                source: 'rivista',
                image: '/Bioarchitettura_71_p.jpg',
                features: [
                    'Materiali naturali',
                    'Tecniche costruttive',
                    'Progetti realizzati',
                    'Guide pratiche'
                ],
                specifications: {
                    pages: 120,
                    format: 'A4',
                    language: 'Italiano'
                },
                inStock: true,
                featured: false,
                tags: ['materiali naturali', 'tradizione', 'innovazione'],
                publishDate: '2024',
                shippingRequired: true
            },
            {
                id: 'rivista-collection-48-49',
                title: 'Collezione Bioarchitettura N. 48-49',
                description: 'Doppio numero speciale sulla progettazione bioclimatica e l\'efficienza energetica negli edifici.',
                price: 25.00,
                originalPrice: 30.00,
                category: 'magazines',
                type: 'physical',
                source: 'rivista',
                image: '/48-49_n001.jpg',
                features: [
                    'Progettazione bioclimatica',
                    'Efficienza energetica',
                    'Case studies europei',
                    'Software di calcolo'
                ],
                specifications: {
                    pages: 240,
                    format: 'A4',
                    language: 'Italiano'
                },
                inStock: true,
                featured: true,
                bestseller: true,
                tags: ['bioclimatica', 'energia', 'progettazione'],
                publishDate: '2023',
                shippingRequired: true
            },
            {
                id: 'rivista-numero-53',
                title: 'Bioarchitettura Rivista N. 53',
                description: 'Numero dedicato alle certificazioni ambientali e agli standard di sostenibilità internazionali.',
                price: 15.00,
                category: 'magazines',
                type: 'physical',
                source: 'rivista',
                image: '/53n001.jpg',
                features: [
                    'Certificazioni ambientali',
                    'Standard internazionali',
                    'Protocolli di valutazione',
                    'Best practices'
                ],
                specifications: {
                    pages: 116,
                    format: 'A4',
                    language: 'Italiano'
                },
                inStock: true,
                featured: false,
                tags: ['certificazioni', 'standard', 'valutazione'],
                publishDate: '2023',
                shippingRequired: true
            },
            {
                id: 'rivista-numero-47',
                title: 'Bioarchitettura Rivista N. 47',
                description: 'Edizione speciale su architettura passiva e casa clima, con progetti innovativi e soluzioni tecniche avanzate.',
                price: 15.00,
                category: 'magazines',
                type: 'physical',
                source: 'rivista',
                image: '/bio_47_n002.jpg',
                features: [
                    'Architettura passiva',
                    'Casa clima',
                    'Soluzioni tecniche',
                    'Progetti innovativi'
                ],
                specifications: {
                    pages: 108,
                    format: 'A4',
                    language: 'Italiano'
                },
                inStock: true,
                featured: false,
                tags: ['passivo', 'clima', 'innovazione'],
                publishDate: '2022',
                shippingRequired: true
            },
            {
                id: 'rivista-digital-subscription',
                title: 'Abbonamento Digitale Rivista Bioarchitettura',
                description: 'Accesso completo all\'archivio digitale di tutti i numeri della rivista Bioarchitettura con contenuti esclusivi.',
                price: 49.99,
                originalPrice: 69.99,
                category: 'subscriptions',
                type: 'digital',
                source: 'rivista',
                image: '/images/products/digital-subscription.svg',
                features: [
                    'Accesso completo all\'archivio',
                    'Tutti i numeri dal 1999',
                    'Contenuti esclusivi online',
                    'Download PDF illimitati',
                    'Aggiornamenti mensili'
                ],
                duration: '12 mesi',
                downloadable: true,
                inStock: true,
                popular: true,
                tags: ['digitale', 'archivio', 'abbonamento']
            },
            {
                id: 'rivista-educational-kit',
                title: 'Kit Didattico Bioarchitettura - Selezione Rivista',
                description: 'Raccolta di materiali didattici selezionati dai migliori articoli della rivista Bioarchitettura per la formazione professionale.',
                price: 89.99,
                category: 'materials',
                type: 'digital',
                source: 'rivista',
                image: '/images/products/educational-kit.svg',
                features: [
                    'Articoli selezionati',
                    'Schede tecniche',
                    'Video tutorial',
                    'Esercitazioni pratiche',
                    'Certificato di partecipazione'
                ],
                format: 'PDF + Video + Software',
                language: 'Italiano',
                downloadable: true,
                inStock: true,
                tags: ['formazione', 'didattico', 'professionale']
            }
        ];
    }

    // Helper method to optimize images for different screen sizes
    optimizeImageForDevice(imagePath, size = 'medium') {
        const sizeMap = {
            thumbnail: { width: 300, quality: 80 },
            medium: { width: 600, quality: 85 },
            large: { width: 1200, quality: 90 }
        };

        const config = sizeMap[size] || sizeMap.medium;
        
        // In production, this would generate optimized image URLs
        // For now, return the original path with lazy loading attributes
        return {
            src: imagePath,
            srcset: this.generateSrcSet(imagePath),
            loading: 'lazy',
            alt: '',
            width: config.width,
            quality: config.quality
        };
    }

    generateSrcSet(imagePath) {
        // Generate responsive image srcset
        // In production, this would create different sized versions
        return `${imagePath} 1x, ${imagePath} 2x`;
    }

    // Method to filter rivista products by criteria
    filterProducts(criteria = {}) {
        let filteredProducts = [...this.rivistaProducts];

        if (criteria.category) {
            filteredProducts = filteredProducts.filter(p => p.category === criteria.category);
        }

        if (criteria.type) {
            filteredProducts = filteredProducts.filter(p => p.type === criteria.type);
        }

        if (criteria.featured) {
            filteredProducts = filteredProducts.filter(p => p.featured);
        }

        if (criteria.inStock !== undefined) {
            filteredProducts = filteredProducts.filter(p => p.inStock === criteria.inStock);
        }

        if (criteria.tags && criteria.tags.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
                p.tags && p.tags.some(tag => criteria.tags.includes(tag))
            );
        }

        if (criteria.priceRange) {
            filteredProducts = filteredProducts.filter(p => 
                p.price >= criteria.priceRange.min && p.price <= criteria.priceRange.max
            );
        }

        return filteredProducts;
    }

    // Method to get featured rivista products for homepage
    getFeaturedProducts(limit = 3) {
        return this.rivistaProducts
            .filter(p => p.featured || p.bestseller || p.popular)
            .sort((a, b) => {
                // Prioritize bestsellers, then featured, then popular
                if (a.bestseller && !b.bestseller) return -1;
                if (!a.bestseller && b.bestseller) return 1;
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            })
            .slice(0, limit);
    }

    // Method to get latest rivista products
    getLatestProducts(limit = 5) {
        return this.rivistaProducts
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, limit);
    }

    // Accessibility helper methods
    generateAccessibleProductCard(product) {
        const imageAlt = `Copertina di ${product.title}`;
        const priceAnnouncement = product.originalPrice 
            ? `Prezzo scontato: ${formatCurrency(product.price)}, era ${formatCurrency(product.originalPrice)}`
            : `Prezzo: ${formatCurrency(product.price)}`;
        
        return {
            ...product,
            imageAlt,
            priceAnnouncement,
            ariaLabel: `${product.title}, ${product.description}, ${priceAnnouncement}`
        };
    }
}

// Extend the existing ProductManager to include Rivista products
if (window.ProductManager) {
    const originalProductManager = window.ProductManager;
    
    window.ProductManager = class extends originalProductManager {
        constructor() {
            super();
            this.rivistaManager = new RivistaProductsManager();
        }

        addRivistaProducts(rivistaProducts) {
            // Merge rivista products with existing products
            this.products = [...this.products, ...rivistaProducts];
            SHOP_STATE.products = this.products;
            
            // Trigger product grid refresh if display exists
            if (window.productDisplay) {
                window.productDisplay.renderProducts();
            }
        }

        getProductsBySource(source) {
            return this.products.filter(product => product.source === source);
        }

        getRivistaProducts() {
            return this.getProductsBySource('rivista');
        }
    };
}

// Initialize Rivista integration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.rivistaManager = new RivistaProductsManager();
    });
} else {
    window.rivistaManager = new RivistaProductsManager();
}

// Export for global access
window.RivistaProductsManager = RivistaProductsManager;