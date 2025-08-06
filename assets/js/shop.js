/**
 * Bioarchitettura Shop - E-commerce Functionality
 * PayPal integration, cart management, and product handling
 */

// =============================================================================
// Shop Configuration and State
// =============================================================================

const SHOP_CONFIG = {
    // PayPal Configuration
    PAYPAL_CLIENT_ID: 'sb', // Sandbox mode - replace with live client ID
    PAYPAL_MERCHANT_EMAIL: 'hannes.mitterer@gmail.com',
    PAYPAL_CURRENCY: 'EUR',
    PAYPAL_ENVIRONMENT: 'sandbox', // 'sandbox' or 'production'
    
    // Product Categories
    CATEGORIES: {
        'ebooks': 'E-books',
        'magazines': 'Riviste',
        'courses': 'Corsi Online',
        'webinars': 'Webinar',
        'consultations': 'Consulenze',
        'subscriptions': 'Abbonamenti',
        'materials': 'Materiali Didattici',
        'certifications': 'Certificazioni'
    },
    
    // Cart Settings
    MAX_QUANTITY_PER_ITEM: 10,
    CART_EXPIRY_HOURS: 24,
    
    // Shipping Configuration
    FREE_SHIPPING_THRESHOLD: 50,
    SHIPPING_RATES: {
        'ebook': 0,
        'digital': 0,
        'physical': 5.99
    },
    
    // Tax Configuration
    VAT_RATE: 0.22, // 22% Italian VAT
    
    // UI Configuration
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 3000
};

// Shop State
const SHOP_STATE = {
    products: [],
    cart: JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY)) || [],
    currentCategory: 'all',
    isLoading: false,
    paypalLoaded: false
};

// =============================================================================
// Product Data Management
// =============================================================================

class ProductManager {
    constructor() {
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            // In production, this would load from a CMS or API
            this.products = this.getSampleProducts();
            SHOP_STATE.products = this.products;
        } catch (error) {
            console.error('Failed to load products:', error);
            this.products = [];
        }
    }

    getSampleProducts() {
        return [
            {
                id: 'ebook-bioarch-guide',
                title: 'Guida Completa alla Bioarchitettura',
                description: 'Un manuale completo per progettare edifici sostenibili e rispettosi dell\'ambiente.',
                price: 24.99,
                category: 'ebooks',
                type: 'digital',
                image: '/images/products/bioarch-guide.jpg',
                features: ['300+ pagine', 'Illustrazioni tecniche', 'Casi studio reali'],
                downloadable: true,
                inStock: true,
                rating: 4.8,
                reviews: 152
            },
            {
                id: 'magazine-subscription',
                title: 'Abbonamento Annuale Rivista Bioarchitettura',
                description: 'Ricevi 12 numeri della rivista più autorevole nel settore della bioarchitettura.',
                price: 89.99,
                originalPrice: 120.00,
                category: 'subscriptions',
                type: 'subscription',
                image: '/images/products/magazine-subscription.jpg',
                features: ['12 numeri annuali', 'Accesso digitale incluso', 'Spedizione gratuita'],
                subscription: true,
                duration: '12 mesi',
                inStock: true,
                bestseller: true
            },
            {
                id: 'course-sustainable-design',
                title: 'Corso Online: Progettazione Sostenibile',
                description: 'Impara i principi fondamentali della progettazione architettonica sostenibile.',
                price: 199.99,
                category: 'courses',
                type: 'digital',
                image: '/images/products/sustainable-design-course.jpg',
                features: ['20 ore di video', 'Certificato di completamento', 'Materiali scaricabili'],
                duration: '6 settimane',
                level: 'Intermedio',
                instructor: 'Arch. Maria Rossi',
                inStock: true,
                rating: 4.9,
                reviews: 87
            },
            {
                id: 'webinar-green-building',
                title: 'Webinar: Tecnologie Green Building 2024',
                description: 'Scopri le ultime innovazioni nelle tecnologie per l\'edilizia verde.',
                price: 49.99,
                category: 'webinars',
                type: 'digital',
                image: '/images/products/green-building-webinar.jpg',
                features: ['2 ore live', 'Q&A con esperti', 'Registrazione inclusa'],
                date: '2024-03-15',
                time: '14:00-16:00',
                speaker: 'Ing. Marco Bianchi',
                inStock: true,
                limited: true,
                spotsRemaining: 23
            },
            {
                id: 'consultation-energy',
                title: 'Consulenza Energetica Personalizzata',
                description: 'Analisi completa dell\'efficienza energetica del tuo progetto.',
                price: 299.99,
                category: 'consultations',
                type: 'service',
                image: '/images/products/energy-consultation.jpg',
                features: ['Analisi personalizzata', 'Report dettagliato', 'Follow-up incluso'],
                duration: '2-3 settimane',
                deliveryMethod: 'online',
                inStock: true
            },
            {
                id: 'materials-casaclima',
                title: 'Kit Materiali CasaClima',
                description: 'Raccolta completa di materiali didattici per la certificazione CasaClima.',
                price: 79.99,
                category: 'materials',
                type: 'physical',
                image: '/images/products/casaclima-kit.jpg',
                features: ['Manuale tecnico', 'Schede prodotto', 'Software di calcolo'],
                weight: 1.2,
                dimensions: '30x25x5 cm',
                inStock: true,
                shippingRequired: true
            },
            {
                id: 'certification-bioarch',
                title: 'Certificazione Bioarchitettura - Livello Base',
                description: 'Ottieni la certificazione ufficiale in bioarchitettura riconosciuta a livello europeo.',
                price: 599.99,
                category: 'certifications',
                type: 'certification',
                image: '/images/products/certification-base.jpg',
                features: ['Esame online', 'Certificato ufficiale', 'Valido 3 anni'],
                duration: 'Flessibile',
                prerequisite: 'Nessuno',
                inStock: true,
                popular: true
            },
            {
                id: 'ebook-passive-house',
                title: 'Casa Passiva: Progettazione e Realizzazione',
                description: 'Guida pratica per progettare e costruire una casa passiva efficiente.',
                price: 34.99,
                category: 'ebooks',
                type: 'digital',
                image: '/images/products/passive-house-ebook.jpg',
                features: ['450+ pagine', 'Progetti reali', 'Calcoli energetici'],
                format: 'PDF + EPUB',
                language: 'Italiano',
                inStock: true,
                newRelease: true
            }
        ];
    }

    getProduct(id) {
        return this.products.find(product => product.id === id);
    }

    getProductsByCategory(category) {
        if (category === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === category);
    }

    searchProducts(query) {
        const searchTerms = query.toLowerCase().split(' ');
        return this.products.filter(product => {
            const searchableText = `${product.title} ${product.description} ${product.features?.join(' ') || ''}`.toLowerCase();
            return searchTerms.every(term => searchableText.includes(term));
        });
    }
}

// =============================================================================
// Shopping Cart Management
// =============================================================================

class ShoppingCart {
    constructor() {
        this.items = SHOP_STATE.cart;
        this.updateCartUI();
        this.setupEventListeners();
    }

    addItem(productId, quantity = 1) {
        const product = window.productManager.getProduct(productId);
        if (!product || !product.inStock) {
            window.bioarchitetturaApp.notificationManager.show(
                'Prodotto non disponibile',
                'error'
            );
            return false;
        }

        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > SHOP_CONFIG.MAX_QUANTITY_PER_ITEM) {
                window.bioarchitetturaApp.notificationManager.show(
                    `Quantità massima per prodotto: ${SHOP_CONFIG.MAX_QUANTITY_PER_ITEM}`,
                    'warning'
                );
                return false;
            }
            existingItem.quantity = newQuantity;
        } else {
            this.items.push({
                id: productId,
                quantity: quantity,
                addedAt: Date.now()
            });
        }

        this.saveCart();
        this.updateCartUI();
        this.animateCartButton();
        
        window.bioarchitetturaApp.notificationManager.show(
            `${product.title} aggiunto al carrello`,
            'success'
        );
        
        return true;
    }

    removeItem(productId) {
        const index = this.items.findIndex(item => item.id === productId);
        if (index > -1) {
            const product = window.productManager.getProduct(productId);
            this.items.splice(index, 1);
            this.saveCart();
            this.updateCartUI();
            
            window.bioarchitetturaApp.notificationManager.show(
                `${product?.title || 'Prodotto'} rimosso dal carrello`,
                'info'
            );
        }
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else if (quantity <= SHOP_CONFIG.MAX_QUANTITY_PER_ITEM) {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
        
        window.bioarchitetturaApp.notificationManager.show(
            'Carrello svuotato',
            'info'
        );
    }

    getSubtotal() {
        return this.items.reduce((total, item) => {
            const product = window.productManager.getProduct(item.id);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    }

    getShipping() {
        const hasPhysicalItems = this.items.some(item => {
            const product = window.productManager.getProduct(item.id);
            return product && product.type === 'physical';
        });

        if (!hasPhysicalItems) return 0;
        
        const subtotal = this.getSubtotal();
        return subtotal >= SHOP_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : SHOP_CONFIG.SHIPPING_RATES.physical;
    }

    getTax() {
        return this.getSubtotal() * SHOP_CONFIG.VAT_RATE;
    }

    getTotal() {
        return this.getSubtotal() + this.getShipping() + this.getTax();
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        // Set expiry timestamp
        const cartData = {
            items: this.items,
            expiresAt: Date.now() + (SHOP_CONFIG.CART_EXPIRY_HOURS * 60 * 60 * 1000)
        };
        
        localStorage.setItem(CONFIG.CART_STORAGE_KEY, JSON.stringify(cartData));
        SHOP_STATE.cart = this.items;
    }

    loadCart() {
        try {
            const cartData = JSON.parse(localStorage.getItem(CONFIG.CART_STORAGE_KEY));
            if (cartData && cartData.expiresAt > Date.now()) {
                this.items = cartData.items || [];
            } else {
                this.clearCart();
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            this.items = [];
        }
    }

    updateCartUI() {
        this.updateCartCount();
        this.updateCartModal();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }
    }

    updateCartModal() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
            cartTotal.textContent = formatCurrency(0);
            return;
        }

        const itemsHTML = this.items.map(item => {
            const product = window.productManager.getProduct(item.id);
            if (!product) return '';

            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${product.title}</div>
                        <div class="cart-item-price">${formatCurrency(product.price)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})" ${item.quantity >= SHOP_CONFIG.MAX_QUANTITY_PER_ITEM ? 'disabled' : ''}>+</button>
                        <button class="remove-item" onclick="cart.removeItem('${item.id}')" title="Rimuovi">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');

        cartItems.innerHTML = itemsHTML;
        cartTotal.textContent = formatCurrency(this.getTotal());
    }

    animateCartButton() {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)';
            }, 200);
        }
    }

    setupEventListeners() {
        // Cart modal toggle
        const cartBtn = document.getElementById('cart-btn');
        const cartModal = document.getElementById('cart-modal');
        const cartClose = document.getElementById('cart-close');

        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', () => this.openCartModal());
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCartModal());
        }

        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.closeCartModal();
                }
            });
        }

        // Clear cart button
        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Sei sicuro di voler svuotare il carrello?')) {
                    this.clearCart();
                }
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.initiateCheckout());
        }
    }

    openCartModal() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCartModal() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    initiateCheckout() {
        if (this.items.length === 0) {
            window.bioarchitetturaApp.notificationManager.show(
                'Il carrello è vuoto',
                'warning'
            );
            return;
        }

        // Initialize PayPal checkout
        this.loadPayPalCheckout();
    }

    async loadPayPalCheckout() {
        if (!SHOP_STATE.paypalLoaded) {
            await this.loadPayPalSDK();
        }

        this.renderPayPalButtons();
    }

    async loadPayPalSDK() {
        return new Promise((resolve, reject) => {
            if (window.paypal) {
                SHOP_STATE.paypalLoaded = true;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${SHOP_CONFIG.PAYPAL_CLIENT_ID}&currency=${SHOP_CONFIG.PAYPAL_CURRENCY}&components=buttons`;
            script.onload = () => {
                SHOP_STATE.paypalLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    renderPayPalButtons() {
        // Create PayPal container if it doesn't exist
        let paypalContainer = document.getElementById('paypal-buttons-container');
        if (!paypalContainer) {
            paypalContainer = document.createElement('div');
            paypalContainer.id = 'paypal-buttons-container';
            
            const cartFooter = document.querySelector('.cart-footer');
            if (cartFooter) {
                cartFooter.appendChild(paypalContainer);
            }
        }

        // Clear existing buttons
        paypalContainer.innerHTML = '';

        if (window.paypal) {
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: this.getTotal().toFixed(2),
                                breakdown: {
                                    item_total: {
                                        currency_code: SHOP_CONFIG.PAYPAL_CURRENCY,
                                        value: this.getSubtotal().toFixed(2)
                                    },
                                    shipping: {
                                        currency_code: SHOP_CONFIG.PAYPAL_CURRENCY,
                                        value: this.getShipping().toFixed(2)
                                    },
                                    tax_total: {
                                        currency_code: SHOP_CONFIG.PAYPAL_CURRENCY,
                                        value: this.getTax().toFixed(2)
                                    }
                                }
                            },
                            items: this.items.map(item => {
                                const product = window.productManager.getProduct(item.id);
                                return {
                                    name: product.title,
                                    unit_amount: {
                                        currency_code: SHOP_CONFIG.PAYPAL_CURRENCY,
                                        value: product.price.toFixed(2)
                                    },
                                    quantity: item.quantity.toString(),
                                    category: product.type === 'digital' ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS'
                                };
                            }),
                            payee: {
                                email_address: SHOP_CONFIG.PAYPAL_MERCHANT_EMAIL
                            }
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        this.handlePaymentSuccess(details);
                    });
                },
                onError: (err) => {
                    this.handlePaymentError(err);
                },
                onCancel: (data) => {
                    this.handlePaymentCancel(data);
                }
            }).render('#paypal-buttons-container');
        }
    }

    handlePaymentSuccess(details) {
        // Clear cart
        this.clearCart();
        this.closeCartModal();
        
        // Show success message
        window.bioarchitetturaApp.notificationManager.show(
            `Pagamento completato con successo! Transazione: ${details.id}`,
            'success',
            'Ordine Confermato',
            10000
        );

        // Redirect to success page or show order details
        setTimeout(() => {
            window.location.href = `/shop/success?order=${details.id}`;
        }, 2000);

        // Send order confirmation (in production, this would be handled server-side)
        this.sendOrderConfirmation(details);
    }

    handlePaymentError(error) {
        console.error('PayPal payment error:', error);
        window.bioarchitetturaApp.notificationManager.show(
            'Errore durante il pagamento. Riprova.',
            'error',
            'Pagamento Fallito'
        );
    }

    handlePaymentCancel(data) {
        window.bioarchitetturaApp.notificationManager.show(
            'Pagamento annullato',
            'info'
        );
    }

    async sendOrderConfirmation(orderDetails) {
        // In production, this would send order details to the server
        const orderData = {
            orderId: orderDetails.id,
            items: this.items.map(item => {
                const product = window.productManager.getProduct(item.id);
                return {
                    id: item.id,
                    title: product.title,
                    price: product.price,
                    quantity: item.quantity
                };
            }),
            total: this.getTotal(),
            payerInfo: orderDetails.payer,
            timestamp: new Date().toISOString()
        };

        console.log('Order confirmation data:', orderData);
        // In production: await fetch('/api/orders/confirm', { method: 'POST', body: JSON.stringify(orderData) });
    }
}

// =============================================================================
// Product Display and Filtering
// =============================================================================

class ProductDisplay {
    constructor() {
        this.currentFilter = 'all';
        this.setupFilters();
        this.setupProductGrid();
        this.setupSearch();
    }

    setupFilters() {
        const filterContainer = document.querySelector('.filter-container');
        if (!filterContainer) return;

        // Create filter buttons
        const filters = [
            { key: 'all', label: 'Tutti i Prodotti' },
            ...Object.entries(SHOP_CONFIG.CATEGORIES).map(([key, label]) => ({ key, label }))
        ];

        const filtersHTML = filters.map(filter => `
            <button class="filter-btn ${filter.key === 'all' ? 'active' : ''}" 
                    data-category="${filter.key}">
                ${filter.label}
            </button>
        `).join('');

        filterContainer.innerHTML = filtersHTML;

        // Add event listeners
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.handleFilterClick(e.target);
            }
        });
    }

    handleFilterClick(button) {
        const category = button.getAttribute('data-category');
        
        // Update active filter
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.currentFilter = category;
        this.renderProducts();
    }

    setupProductGrid() {
        this.renderProducts();
    }

    renderProducts() {
        const productGrid = document.querySelector('.shop-grid');
        if (!productGrid) return;

        const products = window.productManager.getProductsByCategory(this.currentFilter);
        
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="text-center">Nessun prodotto trovato</p>';
            return;
        }

        const productsHTML = products.map(product => this.renderProductCard(product)).join('');
        productGrid.innerHTML = productsHTML;

        // Setup add to cart buttons
        productGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = e.target.getAttribute('data-id');
                window.cart.addItem(productId);
            }
        });
    }

    renderProductCard(product) {
        const badges = [];
        if (product.bestseller) badges.push('<span class="badge badge-bestseller">Bestseller</span>');
        if (product.newRelease) badges.push('<span class="badge badge-new">Nuovo</span>');
        if (product.limited) badges.push('<span class="badge badge-limited">Limitato</span>');
        if (product.popular) badges.push('<span class="badge badge-popular">Popolare</span>');

        const priceHTML = product.originalPrice 
            ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span> <span class="current-price">${formatCurrency(product.price)}</span>`
            : `<span class="current-price">${formatCurrency(product.price)}</span>`;

        const ratingHTML = product.rating 
            ? `<div class="product-rating">
                 <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                 <span class="rating-text">${product.rating} (${product.reviews} recensioni)</span>
               </div>`
            : '';

        return `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                    <div class="product-badges">${badges.join('')}</div>
                    ${product.limited && product.spotsRemaining ? 
                        `<div class="spots-remaining">${product.spotsRemaining} posti rimasti</div>` : ''}
                </div>
                <div class="product-content">
                    <span class="product-category">${SHOP_CONFIG.CATEGORIES[product.category]}</span>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    
                    ${product.features ? `
                        <ul class="product-features">
                            ${product.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${ratingHTML}
                    
                    <div class="product-footer">
                        <div class="product-price">${priceHTML}</div>
                        <button class="add-to-cart btn btn-primary" 
                                data-id="${product.id}" 
                                ${!product.inStock ? 'disabled' : ''}>
                            ${product.inStock ? 'Aggiungi al Carrello' : 'Non Disponibile'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupSearch() {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.handleSearch(query);
            }, CONFIG.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    handleSearch(query) {
        if (query.trim().length < 2) {
            this.renderProducts();
            return;
        }

        const searchResults = window.productManager.searchProducts(query);
        const productGrid = document.querySelector('.shop-grid');
        
        if (searchResults.length === 0) {
            productGrid.innerHTML = `<p class="text-center">Nessun risultato per "${query}"</p>`;
            return;
        }

        const resultsHTML = searchResults.map(product => this.renderProductCard(product)).join('');
        productGrid.innerHTML = resultsHTML;
    }
}

// =============================================================================
// Shop Initialization
// =============================================================================

class ShopManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize managers
        window.productManager = new ProductManager();
        window.cart = new ShoppingCart();
        
        // Only initialize product display if we're on a shop page
        if (document.querySelector('.shop-grid')) {
            window.productDisplay = new ProductDisplay();
        }

        this.setupGlobalShopFeatures();
    }

    setupGlobalShopFeatures() {
        // Setup newsletter subscription
        this.setupNewsletter();
        
        // Setup currency formatter for global use
        window.formatCurrency = formatCurrency;
        
        // Setup responsive behaviors
        this.setupResponsiveBehaviors();
    }

    setupNewsletter() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                
                if (this.validateEmail(email)) {
                    this.subscribeToNewsletter(email);
                } else {
                    window.bioarchitetturaApp.notificationManager.show(
                        'Inserisci un indirizzo email valido',
                        'error'
                    );
                }
            });
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async subscribeToNewsletter(email) {
        try {
            // In production, this would call an API
            // await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
            
            window.bioarchitetturaApp.notificationManager.show(
                'Iscrizione completata con successo!',
                'success',
                'Newsletter'
            );
            
            document.getElementById('newsletter-form').reset();
        } catch (error) {
            window.bioarchitetturaApp.notificationManager.show(
                'Errore durante l\'iscrizione. Riprova.',
                'error'
            );
        }
    }

    setupResponsiveBehaviors() {
        // Handle responsive cart modal
        const handleResize = () => {
            const cartModal = document.getElementById('cart-modal');
            if (cartModal && window.innerWidth <= 768) {
                cartModal.classList.add('mobile');
            } else if (cartModal) {
                cartModal.classList.remove('mobile');
            }
        };

        window.addEventListener('resize', debounce(handleResize, 300));
        handleResize(); // Initial check
    }
}

// =============================================================================
// Shop Startup
// =============================================================================

// Initialize shop when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.shopManager = new ShopManager();
    });
} else {
    window.shopManager = new ShopManager();
}

// Export shop configuration for global access
window.ShopConfig = SHOP_CONFIG;
window.ShopState = SHOP_STATE;