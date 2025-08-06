/* BIOARCHITETTURA® - Translation System
   Multilingual support with Google Translate integration
   Features from PR #22: Language selector and translation */

class BioArchTranslator {
    constructor() {
        this.currentLanguage = 'it'; // Default Italian
        this.supportedLanguages = ['it', 'en', 'de', 'fr'];
        this.translations = {};
        this.googleTranslateLoaded = false;
        
        this.init();
    }
    
    init() {
        this.loadTranslations();
        this.initializeGoogleTranslate();
        this.bindLanguageSelector();
        this.detectBrowserLanguage();
    }
    
    loadTranslations() {
        // Static translations for key interface elements
        this.translations = {
            it: {
                // Navigation
                'Fondazione': 'Fondazione',
                'Chi Siamo': 'Chi Siamo',
                'Quota Iscrizione': 'Quota Iscrizione',
                'Libri & Pubblicazioni': 'Libri & Pubblicazioni',
                'Rivista': 'Rivista',
                'Master': 'Master',
                'Shop': 'Shop',
                
                // Common elements
                'Scopri di più': 'Scopri di più',
                'Leggi di più': 'Leggi di più',
                'Contatti': 'Contatti',
                'Seguici': 'Seguici',
                'Collegamenti Rapidi': 'Collegamenti Rapidi',
                
                // Shop
                'Aggiungi al Carrello': 'Aggiungi al Carrello',
                'Carrello della Spesa': 'Carrello della Spesa',
                'Totale': 'Totale',
                'Procedi al Pagamento': 'Procedi al Pagamento',
                'Svuota Carrello': 'Svuota Carrello',
                
                // Newsletter
                'Rimani Aggiornato': 'Rimani Aggiornato',
                'Iscriviti': 'Iscriviti',
                'La tua email': 'La tua email',
                
                // Articles
                'Articoli Correlati': 'Articoli Correlati',
                'Riassunto Articolo': 'Riassunto Articolo',
                'Genera Riassunto': 'Genera Riassunto'
            },
            
            en: {
                // Navigation
                'Fondazione': 'Foundation',
                'Chi Siamo': 'About Us',
                'Quota Iscrizione': 'Membership',
                'Libri & Pubblicazioni': 'Books & Publications',
                'Rivista': 'Magazine',
                'Master': 'Master',
                'Shop': 'Shop',
                
                // Common elements
                'Scopri di più': 'Learn More',
                'Leggi di più': 'Read More',
                'Contatti': 'Contact',
                'Seguici': 'Follow Us',
                'Collegamenti Rapidi': 'Quick Links',
                
                // Shop
                'Aggiungi al Carrello': 'Add to Cart',
                'Carrello della Spesa': 'Shopping Cart',
                'Totale': 'Total',
                'Procedi al Pagamento': 'Proceed to Checkout',
                'Svuota Carrello': 'Clear Cart',
                
                // Newsletter
                'Rimani Aggiornato': 'Stay Updated',
                'Iscriviti': 'Subscribe',
                'La tua email': 'Your email',
                
                // Articles
                'Articoli Correlati': 'Related Articles',
                'Riassunto Articolo': 'Article Summary',
                'Genera Riassunto': 'Generate Summary'
            },
            
            de: {
                // Navigation
                'Fondazione': 'Stiftung',
                'Chi Siamo': 'Über Uns',
                'Quota Iscrizione': 'Mitgliedschaft',
                'Libri & Pubblicazioni': 'Bücher & Publikationen',
                'Rivista': 'Zeitschrift',
                'Master': 'Master',
                'Shop': 'Shop',
                
                // Common elements
                'Scopri di più': 'Mehr erfahren',
                'Leggi di più': 'Mehr lesen',
                'Contatti': 'Kontakt',
                'Seguici': 'Folgen Sie uns',
                'Collegamenti Rapidi': 'Schnelle Links',
                
                // Shop
                'Aggiungi al Carrello': 'In den Warenkorb',
                'Carrello della Spesa': 'Einkaufswagen',
                'Totale': 'Gesamt',
                'Procedi al Pagamento': 'Zur Kasse',
                'Svuota Carrello': 'Warenkorb leeren',
                
                // Newsletter
                'Rimani Aggiornato': 'Bleiben Sie auf dem Laufenden',
                'Iscriviti': 'Abonnieren',
                'La tua email': 'Ihre E-Mail',
                
                // Articles
                'Articoli Correlati': 'Verwandte Artikel',
                'Riassunto Articolo': 'Artikel Zusammenfassung',
                'Genera Riassunto': 'Zusammenfassung erstellen'
            },
            
            fr: {
                // Navigation
                'Fondazione': 'Fondation',
                'Chi Siamo': 'À Propos',
                'Quota Iscrizione': 'Adhésion',
                'Libri & Pubblicazioni': 'Livres & Publications',
                'Rivista': 'Magazine',
                'Master': 'Master',
                'Shop': 'Boutique',
                
                // Common elements
                'Scopri di più': 'En savoir plus',
                'Leggi di più': 'Lire plus',
                'Contatti': 'Contact',
                'Seguici': 'Nous suivre',
                'Collegamenti Rapidi': 'Liens rapides',
                
                // Shop
                'Aggiungi al Carrello': 'Ajouter au panier',
                'Carrello della Spesa': 'Panier',
                'Totale': 'Total',
                'Procedi al Pagamento': 'Procéder au paiement',
                'Svuota Carrello': 'Vider le panier',
                
                // Newsletter
                'Rimani Aggiornato': 'Restez informé',
                'Iscriviti': "S'abonner",
                'La tua email': 'Votre email',
                
                // Articles
                'Articoli Correlati': 'Articles connexes',
                'Riassunto Articolo': 'Résumé de l\'article',
                'Genera Riassunto': 'Générer un résumé'
            }
        };
    }
    
    initializeGoogleTranslate() {
        // Load Google Translate API
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
        
        // Global callback function for Google Translate
        window.googleTranslateElementInit = () => {
            new google.translate.TranslateElement({
                pageLanguage: 'it',
                includedLanguages: 'en,de,fr,it',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google-translate-element');
            
            this.googleTranslateLoaded = true;
        };
        
        // Create hidden Google Translate element
        const translateDiv = document.createElement('div');
        translateDiv.id = 'google-translate-element';
        translateDiv.style.display = 'none';
        document.body.appendChild(translateDiv);
    }
    
    bindLanguageSelector() {
        const languageSelect = document.getElementById('language-select');
        if (!languageSelect) return;
        
        // Set initial value
        languageSelect.value = this.currentLanguage;
        
        languageSelect.addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;
            this.translatePage(selectedLanguage);
        });
    }
    
    translatePage(targetLanguage) {
        if (!this.supportedLanguages.includes(targetLanguage)) {
            console.warn('Unsupported language:', targetLanguage);
            return;
        }
        
        this.currentLanguage = targetLanguage;
        
        // Save language preference
        try {
            localStorage.setItem('bioarch_language', targetLanguage);
        } catch (e) {
            console.warn('Unable to save language preference:', e);
        }
        
        // Apply static translations first
        this.applyStaticTranslations(targetLanguage);
        
        // Then use Google Translate for dynamic content
        if (targetLanguage !== 'it') {
            this.triggerGoogleTranslate(targetLanguage);
        } else {
            // Reset to Italian (original)
            this.resetToOriginal();
        }
        
        // Show translation notice
        this.showTranslationNotice(targetLanguage);
    }
    
    applyStaticTranslations(language) {
        const translations = this.translations[language];
        if (!translations) return;
        
        // Translate navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            const originalText = link.textContent.trim();
            if (translations[originalText]) {
                link.textContent = translations[originalText];
            }
        });
        
        // Translate buttons
        document.querySelectorAll('button, .btn').forEach(button => {
            const originalText = button.textContent.trim();
            if (translations[originalText]) {
                button.textContent = translations[originalText];
            }
        });
        
        // Translate headings with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        // Translate placeholder texts
        document.querySelectorAll('input[placeholder]').forEach(input => {
            const originalPlaceholder = input.getAttribute('placeholder');
            if (translations[originalPlaceholder]) {
                input.setAttribute('placeholder', translations[originalPlaceholder]);
            }
        });
        
        // Update document language attribute
        document.documentElement.lang = language;
    }
    
    triggerGoogleTranslate(targetLanguage) {
        if (!this.googleTranslateLoaded) {
            // Retry after a delay if Google Translate isn't loaded yet
            setTimeout(() => this.triggerGoogleTranslate(targetLanguage), 1000);
            return;
        }
        
        try {
            // Find Google Translate select element
            const translateSelect = document.querySelector('.goog-te-combo');
            if (translateSelect) {
                // Set the target language
                translateSelect.value = targetLanguage;
                
                // Trigger the change event
                const event = new Event('change', { bubbles: true });
                translateSelect.dispatchEvent(event);
            }
        } catch (error) {
            console.warn('Google Translate error:', error);
            this.showFallbackTranslation(targetLanguage);
        }
    }
    
    resetToOriginal() {
        // Reset Google Translate to Italian
        try {
            const translateSelect = document.querySelector('.goog-te-combo');
            if (translateSelect) {
                translateSelect.value = 'it';
                const event = new Event('change', { bubbles: true });
                translateSelect.dispatchEvent(event);
            }
        } catch (error) {
            console.warn('Error resetting translation:', error);
        }
        
        // Also refresh the page to ensure clean state
        if (window.location.hash.includes('googtrans')) {
            window.location.reload();
        }
    }
    
    detectBrowserLanguage() {
        // Check for saved language preference first
        try {
            const savedLanguage = localStorage.getItem('bioarch_language');
            if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
                this.translatePage(savedLanguage);
                return;
            }
        } catch (e) {
            console.warn('Unable to load language preference:', e);
        }
        
        // Detect browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        const languageCode = browserLanguage.split('-')[0];
        
        if (this.supportedLanguages.includes(languageCode) && languageCode !== 'it') {
            // Auto-translate if browser language is supported and not Italian
            setTimeout(() => {
                this.translatePage(languageCode);
                
                // Update language selector
                const languageSelect = document.getElementById('language-select');
                if (languageSelect) {
                    languageSelect.value = languageCode;
                }
            }, 2000); // Delay to allow Google Translate to load
        }
    }
    
    showTranslationNotice(language) {
        if (language === 'it') return; // No notice for Italian (original)
        
        // Remove existing notice
        const existingNotice = document.querySelector('.translation-notice');
        if (existingNotice) {
            existingNotice.remove();
        }
        
        // Create translation notice
        const notice = document.createElement('div');
        notice.className = 'translation-notice';
        notice.innerHTML = `
            <div class="translation-notice-content">
                <span class="translation-icon">🌐</span>
                <span class="translation-text">
                    Questo sito è stato tradotto automaticamente. 
                    La <a href="#" onclick="translator.translatePage('it')">versione italiana</a> è quella originale.
                </span>
                <button class="translation-close" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        // Style the notice
        notice.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 1500;
            background: #ffc107; color: #000; padding: 10px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        
        const content = notice.querySelector('.translation-notice-content');
        content.style.cssText = `
            max-width: 1200px; margin: 0 auto; display: flex;
            align-items: center; justify-content: center; padding: 0 20px;
            gap: 10px; font-size: 0.9rem;
        `;
        
        const closeBtn = notice.querySelector('.translation-close');
        closeBtn.style.cssText = `
            background: none; border: none; font-size: 1.2rem;
            cursor: pointer; margin-left: auto;
        `;
        
        // Insert at top of body
        document.body.insertBefore(notice, document.body.firstChild);
        
        // Adjust main content padding to account for notice
        document.body.style.paddingTop = '50px';
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
                document.body.style.paddingTop = '';
            }
        }, 10000);
    }
    
    showFallbackTranslation(language) {
        // Fallback when Google Translate fails
        const message = {
            'en': 'Translation to English is temporarily unavailable. Please try again later.',
            'de': 'Die Übersetzung ins Deutsche ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.',
            'fr': 'La traduction en français est temporairement indisponible. Veuillez réessayer plus tard.'
        };
        
        if (window.BioArchUtils && window.BioArchUtils.showToast) {
            window.BioArchUtils.showToast(message[language] || 'Translation unavailable', 'warning');
        } else {
            alert(message[language] || 'Translation unavailable');
        }
        
        // Reset language selector to Italian
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = 'it';
        }
        this.currentLanguage = 'it';
    }
    
    // Method to get translated text for dynamic content
    getText(key, language = null) {
        const lang = language || this.currentLanguage;
        return this.translations[lang] && this.translations[lang][key] ? this.translations[lang][key] : key;
    }
    
    // Method to translate dynamic content
    translateElement(element, key) {
        const translatedText = this.getText(key);
        if (element && translatedText !== key) {
            element.textContent = translatedText;
        }
    }
    
    // Language utility methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    isRTL(language) {
        // Add RTL languages if needed in the future
        const rtlLanguages = ['ar', 'he', 'fa'];
        return rtlLanguages.includes(language);
    }
}

// Global translation function (called from HTML)
function translatePage(language) {
    if (window.translator) {
        window.translator.translatePage(language);
    }
}

// Initialize translator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.translator = new BioArchTranslator();
});

// Export for global access
window.BioArchTranslator = BioArchTranslator;