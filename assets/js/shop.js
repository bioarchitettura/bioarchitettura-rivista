/* BIOARCHITETTURA® - Shop JavaScript
   E-commerce functionality with PayPal integration
   Features from PR #22: Shop, Cart, PayPal payments */

class BioArchShop {
    constructor() {
        this.cart = this.loadCart();
        this.products = [];
        this.currentCategory = 'all';
        this.paypalEmail = 'hannes.mitterer@gmail.com'; // PayPal merchant email
        
        this.init();
    }
    
    init() {
        this.initializeProducts();
        this.bindEvents();
        this.updateCartDisplay();
        this.renderProducts();
    }
    
    initializeProducts() {
        this.products = [
            // Ebooks
            {
                id: 'ebook-bioarch-guide',
                title: 'Guida alla Bioarchitettura',
                description: 'Manuale completo per la progettazione sostenibile e l\'architettura ecologica.',
                price: 29.90,
                category: 'ebooks',
                image: '/assets/images/products/ebook-guide.jpg',
                digital: true,
                preview: 'Anteprima disponibile'
            },
            {
                id: 'ebook-materials',
                title: 'Materiali Naturali in Edilizia',
                description: 'Guida pratica all\'utilizzo di materiali naturali e sostenibili.',
                price: 24.90,
                category: 'ebooks',
                image: '/assets/images/products/ebook-materials.jpg',
                digital: true,
                preview: 'Anteprima disponibile'
            },
            
            // Magazine articles and collections
            {
                id: 'magazine-annual-2024',
                title: 'Rivista Bioarchitettura - Annata 2024',
                description: 'Collezione completa delle riviste BIOARCHITETTURA® del 2024.',
                price: 89.90,
                category: 'magazine',
                image: '/assets/images/products/magazine-2024.jpg',
                digital: false
            },
            {
                id: 'magazine-single-latest',
                title: 'Ultima Rivista BIOARCHITETTURA®',
                description: 'L\'ultimo numero della rivista con i più recenti sviluppi in bioarchitettura.',
                price: 12.90,
                category: 'magazine',
                image: '/assets/images/products/magazine-latest.jpg',
                digital: false
            },
            
            // Subscriptions
            {
                id: 'subscription-annual',
                title: 'Abbonamento Annuale',
                description: 'Abbonamento annuale alla rivista BIOARCHITETTURA® (6 numeri).',
                price: 59.90,
                category: 'subscriptions',
                image: '/assets/images/products/subscription-annual.jpg',
                digital: false,
                recurring: true
            },
            {
                id: 'subscription-digital',
                title: 'Abbonamento Digitale',
                description: 'Accesso digitale completo all\'archivio e ai nuovi numeri.',
                price: 39.90,
                category: 'subscriptions',
                image: '/assets/images/products/subscription-digital.jpg',
                digital: true,
                recurring: true
            },
            
            // Online courses
            {
                id: 'course-basics',
                title: 'Corso Base Bioarchitettura',
                description: 'Corso online introduttivo ai principi della bioarchitettura.',
                price: 149.90,
                category: 'courses',
                image: '/assets/images/products/course-basics.jpg',
                digital: true
            },
            {
                id: 'course-advanced',
                title: 'Master Online CasaClima',
                description: 'Corso avanzato per la certificazione energetico-ambientale.',
                price: 599.90,
                category: 'courses',
                image: '/assets/images/products/course-advanced.jpg',
                digital: true
            },
            
            // Webinars
            {
                id: 'webinar-package',
                title: 'Pacchetto Webinar 2024',
                description: 'Accesso a tutti i webinar del 2024 su bioarchitettura e sostenibilità.',
                price: 79.90,
                category: 'webinars',
                image: '/assets/images/products/webinar-package.jpg',
                digital: true
            },
            
            // Printed materials
            {
                id: 'book-sustainable-design',
                title: 'Progettazione Sostenibile',
                description: 'Libro stampato sui principi della progettazione eco-sostenibile.',
                price: 45.90,
                category: 'books',
                image: '/assets/images/products/book-sustainable.jpg',
                digital: false
            },
            {
                id: 'manual-casaclima',
                title: 'Manuale CasaClima',
                description: 'Manuale tecnico per la certificazione CasaClima.',
                price: 69.90,
                category: 'books',
                image: '/assets/images/products/manual-casaclima.jpg',
                digital: false
            }
        ];
    }
    
    bindEvents() {
        // Category filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(btn.dataset.category);
                
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.showCart());
        }
        
        // Cart modal events
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            const cartClose = cartModal.querySelector('.cart-close');
            if (cartClose) {
                cartClose.addEventListener('click', () => this.hideCart());
            }
            
            // Clear cart button
            const clearCartBtn = document.getElementById('clear-cart');
            if (clearCartBtn) {
                clearCartBtn.addEventListener('click', () => this.clearCart());
            }
            
            // Checkout button
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.addEventListener('click', () => this.checkout());
            }
        }
        
        // Close cart when clicking outside
        window.addEventListener('click', (e) => {
            const cartModal = document.getElementById('cart-modal');
            if (e.target === cartModal) {
                this.hideCart();
            }
        });
    }
    
    filterByCategory(category) {
        this.currentCategory = category;
        this.renderProducts();
    }
    
    renderProducts() {
        const productsContainer = document.querySelector('.products-grid');
        if (!productsContainer) return;
        
        const filteredProducts = this.currentCategory === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === this.currentCategory);
        
        productsContainer.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy" 
                         onerror="this.src='/assets/images/placeholder-product.jpg'">
                    ${product.digital ? '<span class="digital-badge">Digitale</span>' : ''}
                    ${product.preview ? '<span class="preview-badge">Anteprima</span>' : ''}
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">€${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" onclick="shop.addToCart('${product.id}')">
                        Aggiungi al Carrello
                    </button>
                    ${product.preview ? '<button class="btn btn-outline btn-sm preview-btn" onclick="shop.showPreview(\'' + product.id + '\')">Anteprima</button>' : ''}
                </div>
            </div>
        `).join('');
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                quantity: 1,
                digital: product.digital
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showToast(`${product.title} aggiunto al carrello!`);
    }
    
    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index > -1) {
            this.cart.splice(index, 1);
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        }
    }
    
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
        } else if (item && newQuantity === 0) {
            this.removeFromCart(productId);
        }
    }
    
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Sei sicuro di voler svuotare il carrello?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartDisplay();
            this.renderCartItems();
            this.showToast('Carrello svuotato');
        }
    }
    
    showCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'block';
            this.renderCartItems();
        }
    }
    
    hideCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = 'none';
        }
    }
    
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Il carrello è vuoto</p>';
            return;
        }
        
        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-price">€${item.price.toFixed(2)}</p>
                    ${item.digital ? '<span class="digital-indicator">Prodotto digitale</span>' : ''}
                </div>
                <div class="quantity-controls">
                    <button onclick="shop.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="shop.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item" onclick="shop.removeFromCart('${item.id}')">×</button>
            </div>
        `).join('');
    }
    
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
        
        if (cartTotal) {
            cartTotal.textContent = totalPrice.toFixed(2);
        }
    }
    
    checkout() {
        if (this.cart.length === 0) {
            this.showToast('Il carrello è vuoto!', 'error');
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Create PayPal form
        this.createPayPalForm(total);
    }
    
    createPayPalForm(total) {
        // Create dynamic PayPal form
        const form = document.createElement('form');
        form.action = 'https://www.paypal.com/cgi-bin/webscr';
        form.method = 'POST';
        form.target = '_blank';
        
        const fields = [
            { name: 'cmd', value: '_cart' },
            { name: 'upload', value: '1' },
            { name: 'business', value: this.paypalEmail },
            { name: 'currency_code', value: 'EUR' },
            { name: 'return', value: window.location.origin + '/payment-success.html' },
            { name: 'cancel_return', value: window.location.origin + '/payment-cancel.html' },
            { name: 'notify_url', value: window.location.origin + '/payment-notify' },
            { name: 'custom', value: JSON.stringify({ timestamp: Date.now(), cart_id: this.generateCartId() }) }
        ];
        
        // Add cart items
        this.cart.forEach((item, index) => {
            const itemNum = index + 1;
            fields.push(
                { name: `item_name_${itemNum}`, value: item.title },
                { name: `amount_${itemNum}`, value: item.price.toFixed(2) },
                { name: `quantity_${itemNum}`, value: item.quantity.toString() }
            );
        });
        
        // Create hidden input fields
        fields.forEach(field => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = field.name;
            input.value = field.value;
            form.appendChild(input);
        });
        
        // Add form to page and submit
        document.body.appendChild(form);
        
        // Show loading message
        this.showToast('Reindirizzamento a PayPal...', 'info');
        
        // Submit form after brief delay
        setTimeout(() => {
            form.submit();
            document.body.removeChild(form);
            
            // Store cart for post-payment cleanup
            localStorage.setItem('bioarch_pending_cart', JSON.stringify(this.cart));
        }, 1000);
    }
    
    generateCartId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    showPreview(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.preview) return;
        
        // Create preview modal (simplified version)
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-modal-content">
                <span class="preview-close">&times;</span>
                <h3>${product.title} - Anteprima</h3>
                <div class="preview-content">
                    <p>Questa è un'anteprima del prodotto "${product.title}".</p>
                    <p>Il contenuto completo sarà disponibile dopo l'acquisto.</p>
                    <iframe src="/assets/previews/${product.id}.pdf" width="100%" height="400px" style="border: none;"></iframe>
                </div>
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="shop.addToCart('${product.id}'); document.body.removeChild(this.closest('.preview-modal'))">
                        Acquista Ora
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 2000; display: flex;
            align-items: center; justify-content: center;
        `;
        
        const content = modal.querySelector('.preview-modal-content');
        content.style.cssText = `
            background: white; padding: 2rem; border-radius: 8px;
            width: 90%; max-width: 800px; max-height: 80vh;
            overflow-y: auto; position: relative;
        `;
        
        // Close functionality
        const closeBtn = modal.querySelector('.preview-close');
        closeBtn.style.cssText = `
            position: absolute; top: 1rem; right: 1rem;
            font-size: 2rem; cursor: pointer; color: #666;
        `;
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        // Close on outside click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
        
        document.body.appendChild(modal);
    }
    
    // Storage methods
    saveCart() {
        try {
            localStorage.setItem('bioarch_cart', JSON.stringify(this.cart));
        } catch (e) {
            console.warn('Unable to save cart to localStorage:', e);
        }
    }
    
    loadCart() {
        try {
            const saved = localStorage.getItem('bioarch_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Unable to load cart from localStorage:', e);
            return [];
        }
    }
    
    // Utility methods
    showToast(message, type = 'success') {
        // Use main.js toast function if available, otherwise create simple one
        if (window.BioArchUtils && window.BioArchUtils.showToast) {
            window.BioArchUtils.showToast(message, type);
        } else {
            alert(message); // Fallback
        }
    }
    
    // Payment success handler
    handlePaymentSuccess() {
        // Clear the cart after successful payment
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        
        // Remove pending cart
        localStorage.removeItem('bioarch_pending_cart');
        
        this.showToast('Pagamento completato con successo!', 'success');
    }
    
    // Payment cancellation handler
    handlePaymentCancel() {
        // Restore cart if payment was cancelled
        const pendingCart = localStorage.getItem('bioarch_pending_cart');
        if (pendingCart) {
            try {
                this.cart = JSON.parse(pendingCart);
                this.saveCart();
                this.updateCartDisplay();
                localStorage.removeItem('bioarch_pending_cart');
            } catch (e) {
                console.warn('Unable to restore cart:', e);
            }
        }
        
        this.showToast('Pagamento annullato. I prodotti sono ancora nel tuo carrello.', 'info');
    }
}

// Initialize shop when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize shop on pages with shop functionality
    if (document.querySelector('.shop-container') || document.getElementById('cart-icon')) {
        window.shop = new BioArchShop();
    }
    
    // Handle payment success/cancel pages
    if (window.location.pathname.includes('payment-success')) {
        if (window.shop) {
            window.shop.handlePaymentSuccess();
        }
    } else if (window.location.pathname.includes('payment-cancel')) {
        if (window.shop) {
            window.shop.handlePaymentCancel();
        }
    }
});

// Export for global access
window.BioArchShop = BioArchShop;