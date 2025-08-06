/**
 * Bioarchitettura Translation System
 * Multilingual support with Google Translate integration and static translations
 */

// =============================================================================
// Translation Configuration and State
// =============================================================================

const TRANSLATION_CONFIG = {
    // Supported Languages
    LANGUAGES: {
        'it': { name: 'Italiano', code: 'it', flag: '🇮🇹' },
        'en': { name: 'English', code: 'en', flag: '🇬🇧' },
        'de': { name: 'Deutsch', code: 'de', flag: '🇩🇪' },
        'fr': { name: 'Français', code: 'fr', flag: '🇫🇷' }
    },
    
    DEFAULT_LANGUAGE: 'it',
    STORAGE_KEY: 'bioarchitettura_language',
    GOOGLE_TRANSLATE_AVAILABLE: false,
    
    // Translation Services
    GOOGLE_TRANSLATE_API_URL: 'https://translate.googleapis.com/translate_a/single',
    GOOGLE_TRANSLATE_KEY: null, // Set via environment or config
    
    // UI Configuration
    TRANSLATION_DELAY: 500,
    NOTIFICATION_DURATION: 3000
};

// Translation State
const TRANSLATION_STATE = {
    currentLanguage: localStorage.getItem(TRANSLATION_CONFIG.STORAGE_KEY) || TRANSLATION_CONFIG.DEFAULT_LANGUAGE,
    isTranslating: false,
    translationCache: new Map(),
    staticTranslations: {},
    pendingTranslations: new Set()
};

// =============================================================================
// Static Translations Database
// =============================================================================

const STATIC_TRANSLATIONS = {
    // Navigation
    'nav.home': {
        it: 'Home',
        en: 'Home',
        de: 'Startseite',
        fr: 'Accueil'
    },
    'nav.magazine': {
        it: 'Rivista',
        en: 'Magazine',
        de: 'Zeitschrift',
        fr: 'Magazine'
    },
    'nav.shop': {
        it: 'Shop',
        en: 'Shop',
        de: 'Shop',
        fr: 'Boutique'
    },
    'nav.about': {
        it: 'Chi Siamo',
        en: 'About Us',
        de: 'Über Uns',
        fr: 'À Propos'
    },
    'nav.contact': {
        it: 'Contatti',
        en: 'Contact',
        de: 'Kontakt',
        fr: 'Contact'
    },
    'nav.archive': {
        it: 'Archivio',
        en: 'Archive',
        de: 'Archiv',
        fr: 'Archives'
    },
    'nav.subscription': {
        it: 'Abbonamenti',
        en: 'Subscriptions',
        de: 'Abonnements',
        fr: 'Abonnements'
    },
    'nav.ebooks': {
        it: 'E-books',
        en: 'E-books',
        de: 'E-Books',
        fr: 'Livres Électroniques'
    },
    'nav.courses': {
        it: 'Corsi',
        en: 'Courses',
        de: 'Kurse',
        fr: 'Cours'
    },
    'nav.webinars': {
        it: 'Webinar',
        en: 'Webinars',
        de: 'Webinare',
        fr: 'Webinaires'
    },
    
    // Post/Article
    'post.by': {
        it: 'di',
        en: 'by',
        de: 'von',
        fr: 'par'
    },
    'post.summary': {
        it: 'Riassunto',
        en: 'Summary',
        de: 'Zusammenfassung',
        fr: 'Résumé'
    },
    'post.generating_summary': {
        it: 'Generando riassunto...',
        en: 'Generating summary...',
        de: 'Zusammenfassung wird erstellt...',
        fr: 'Génération du résumé...'
    },
    'post.hide_summary': {
        it: 'Nascondi riassunto',
        en: 'Hide summary',
        de: 'Zusammenfassung ausblenden',
        fr: 'Masquer le résumé'
    },
    'post.show_summary': {
        it: 'Mostra riassunto',
        en: 'Show summary',
        de: 'Zusammenfassung anzeigen',
        fr: 'Afficher le résumé'
    },
    'post.previous': {
        it: 'Articolo Precedente',
        en: 'Previous Article',
        de: 'Vorheriger Artikel',
        fr: 'Article Précédent'
    },
    'post.next': {
        it: 'Articolo Successivo',
        en: 'Next Article',
        de: 'Nächster Artikel',
        fr: 'Article Suivant'
    },
    'post.share': {
        it: 'Condividi questo articolo',
        en: 'Share this article',
        de: 'Diesen Artikel teilen',
        fr: 'Partager cet article'
    },
    'post.related': {
        it: 'Articoli Correlati',
        en: 'Related Articles',
        de: 'Verwandte Artikel',
        fr: 'Articles Connexes'
    },
    'post.loading_related': {
        it: 'Caricamento articoli correlati...',
        en: 'Loading related articles...',
        de: 'Verwandte Artikel werden geladen...',
        fr: 'Chargement des articles connexes...'
    },
    
    // Shopping Cart
    'cart.title': {
        it: 'Carrello',
        en: 'Shopping Cart',
        de: 'Warenkorb',
        fr: 'Panier'
    },
    'cart.empty': {
        it: 'Il carrello è vuoto',
        en: 'Cart is empty',
        de: 'Der Warenkorb ist leer',
        fr: 'Le panier est vide'
    },
    'cart.total': {
        it: 'Totale: ',
        en: 'Total: ',
        de: 'Gesamt: ',
        fr: 'Total: '
    },
    'cart.clear': {
        it: 'Svuota',
        en: 'Clear',
        de: 'Leeren',
        fr: 'Vider'
    },
    'cart.checkout': {
        it: 'Checkout',
        en: 'Checkout',
        de: 'Zur Kasse',
        fr: 'Commander'
    },
    'cart.add_to_cart': {
        it: 'Aggiungi al Carrello',
        en: 'Add to Cart',
        de: 'In den Warenkorb',
        fr: 'Ajouter au Panier'
    },
    'cart.remove': {
        it: 'Rimuovi',
        en: 'Remove',
        de: 'Entfernen',
        fr: 'Supprimer'
    },
    
    // Footer
    'footer.foundation': {
        it: 'Fondazione',
        en: 'Foundation',
        de: 'Stiftung',
        fr: 'Fondation'
    },
    'footer.status': {
        it: 'Ente morale senza fini di lucro',
        en: 'Non-profit moral entity',
        de: 'Gemeinnützige Einrichtung',
        fr: 'Organisme moral à but non lucratif'
    },
    'footer.contact': {
        it: 'Contatti',
        en: 'Contact',
        de: 'Kontakt',
        fr: 'Contact'
    },
    'footer.phone': {
        it: 'Telefono',
        en: 'Phone',
        de: 'Telefon',
        fr: 'Téléphone'
    },
    'footer.address': {
        it: 'Indirizzo',
        en: 'Address',
        de: 'Adresse',
        fr: 'Adresse'
    },
    'footer.quick_links': {
        it: 'Link Rapidi',
        en: 'Quick Links',
        de: 'Schnelllinks',
        fr: 'Liens Rapides'
    },
    'footer.magazine': {
        it: 'Rivista',
        en: 'Magazine',
        de: 'Zeitschrift',
        fr: 'Magazine'
    },
    'footer.shop': {
        it: 'Shop',
        en: 'Shop',
        de: 'Shop',
        fr: 'Boutique'
    },
    'footer.privacy': {
        it: 'Privacy',
        en: 'Privacy',
        de: 'Datenschutz',
        fr: 'Confidentialité'
    },
    'footer.terms': {
        it: 'Termini',
        en: 'Terms',
        de: 'Bedingungen',
        fr: 'Conditions'
    },
    'footer.newsletter': {
        it: 'Newsletter',
        en: 'Newsletter',
        de: 'Newsletter',
        fr: 'Newsletter'
    },
    'footer.email_placeholder': {
        it: 'La tua email',
        en: 'Your email',
        de: 'Ihre E-Mail',
        fr: 'Votre email'
    },
    'footer.subscribe': {
        it: 'Iscriviti',
        en: 'Subscribe',
        de: 'Abonnieren',
        fr: 'S\'abonner'
    },
    'footer.rights': {
        it: 'Tutti i diritti riservati.',
        en: 'All rights reserved.',
        de: 'Alle Rechte vorbehalten.',
        fr: 'Tous droits réservés.'
    },
    
    // Shop Categories
    'category.ebooks': {
        it: 'E-books',
        en: 'E-books',
        de: 'E-Books',
        fr: 'Livres Électroniques'
    },
    'category.magazines': {
        it: 'Riviste',
        en: 'Magazines',
        de: 'Zeitschriften',
        fr: 'Magazines'
    },
    'category.courses': {
        it: 'Corsi Online',
        en: 'Online Courses',
        de: 'Online-Kurse',
        fr: 'Cours en Ligne'
    },
    'category.webinars': {
        it: 'Webinar',
        en: 'Webinars',
        de: 'Webinare',
        fr: 'Webinaires'
    },
    'category.consultations': {
        it: 'Consulenze',
        en: 'Consultations',
        de: 'Beratungen',
        fr: 'Consultations'
    },
    'category.subscriptions': {
        it: 'Abbonamenti',
        en: 'Subscriptions',
        de: 'Abonnements',
        fr: 'Abonnements'
    },
    
    // Common UI
    'ui.loading': {
        it: 'Caricamento...',
        en: 'Loading...',
        de: 'Wird geladen...',
        fr: 'Chargement...'
    },
    'ui.error': {
        it: 'Errore',
        en: 'Error',
        de: 'Fehler',
        fr: 'Erreur'
    },
    'ui.success': {
        it: 'Successo',
        en: 'Success',
        de: 'Erfolg',
        fr: 'Succès'
    },
    'ui.warning': {
        it: 'Attenzione',
        en: 'Warning',
        de: 'Warnung',
        fr: 'Attention'
    },
    'ui.close': {
        it: 'Chiudi',
        en: 'Close',
        de: 'Schließen',
        fr: 'Fermer'
    },
    'ui.cancel': {
        it: 'Annulla',
        en: 'Cancel',
        de: 'Abbrechen',
        fr: 'Annuler'
    },
    'ui.confirm': {
        it: 'Conferma',
        en: 'Confirm',
        de: 'Bestätigen',
        fr: 'Confirmer'
    },
    'ui.search': {
        it: 'Cerca',
        en: 'Search',
        de: 'Suchen',
        fr: 'Rechercher'
    },
    
    // Notifications
    'notification.translation_enabled': {
        it: 'Traduzione attivata',
        en: 'Translation enabled',
        de: 'Übersetzung aktiviert',
        fr: 'Traduction activée'
    },
    'notification.translation_disabled': {
        it: 'Traduzione disattivata',
        en: 'Translation disabled',
        de: 'Übersetzung deaktiviert',
        fr: 'Traduction désactivée'
    },
    'notification.translation_error': {
        it: 'Errore di traduzione',
        en: 'Translation error',
        de: 'Übersetzungsfehler',
        fr: 'Erreur de traduction'
    },
    'notification.language_changed': {
        it: 'Lingua cambiata',
        en: 'Language changed',
        de: 'Sprache geändert',
        fr: 'Langue modifiée'
    }
};

// =============================================================================
// Translation Manager
// =============================================================================

class TranslationManager {
    constructor() {
        this.currentLanguage = TRANSLATION_STATE.currentLanguage;
        this.staticTranslations = STATIC_TRANSLATIONS;
        this.translationCache = TRANSLATION_STATE.translationCache;
        
        this.init();
    }

    init() {
        this.setupLanguageSelector();
        this.loadTranslations();
        this.detectGoogleTranslate();
        this.translatePage();
        this.setupAutoTranslation();
    }

    setupLanguageSelector() {
        const languageSelector = document.querySelector('.language-selector');
        if (!languageSelector) return;

        // Create language buttons
        const buttonsHTML = Object.entries(TRANSLATION_CONFIG.LANGUAGES).map(([code, lang]) => `
            <button class="lang-btn ${code === this.currentLanguage ? 'active' : ''}" 
                    data-lang="${code}"
                    title="${lang.name}">
                <img src="data:image/svg+xml;base64,${this.getFlagSVG(code)}" alt="${code.toUpperCase()}">
                ${code.toUpperCase()}
            </button>
        `).join('');

        languageSelector.innerHTML = buttonsHTML;

        // Add event listeners
        languageSelector.addEventListener('click', (e) => {
            const langBtn = e.target.closest('.lang-btn');
            if (langBtn) {
                const newLanguage = langBtn.getAttribute('data-lang');
                this.changeLanguage(newLanguage);
            }
        });
    }

    getFlagSVG(code) {
        // Base64 encoded SVG flags - in production, these would be actual image files
        const flags = {
            it: 'PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjMDA5MjQ2Ii8+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIxMiIgZmlsbD0iI0ZGRkZGRiIvPgo8cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iNiIgZmlsbD0iI0NFMUEyNiIvPgo8L3N2Zz4K',
            en: 'PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjMDEyMTY5Ii8+CjxwYXRoIGQ9Ik0wIDBoMjR2MkgweiIgZmlsbD0iI0ZGRiIvPgo8cGF0aCBkPSJNMCA0aDI0djJIMHoiIGZpbGw9IiNDRTFBMjYiLz4KPHA+dGggZD0iTTAgOGgyNHYySDB6IiBmaWxsPSIjRkZGIi8+CjxwYXRoIGQ9Ik0wIDEyaDI0djJIMHoiIGZpbGw9IiNDRTFBMjYiLz4KPHA+dGggZD0iTTAgMTZoMjR2MkgweiIgZmlsbD0iI0ZGRiIvPgo8L3N2Zz4K',
            de: 'PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjYiIGZpbGw9IiMwMDAiLz4KPHJlY3QgeT0iNiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjYiIGZpbGw9IiNEQzE0M0MiLz4KPHJlY3QgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSI2IiBmaWxsPSIjRkZDRTAwIi8+Cjwvc3ZnPgo=',
            fr: 'PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iMTgiIGZpbGw9IiMwMDJBOEYiLz4KPHJlY3QgeD0iOCIgd2lkdGg9IjgiIGhlaWdodD0iMTgiIGZpbGw9IiNGRkYiLz4KPHJlY3QgeD0iMTYiIHdpZHRoPSI4IiBoZWlnaHQ9IjE4IiBmaWxsPSIjRUQyOTM5Ii8+Cjwvc3ZnPgo='
        };
        return flags[code] || flags.it;
    }

    async changeLanguage(newLanguage) {
        if (newLanguage === this.currentLanguage) return;

        const oldLanguage = this.currentLanguage;
        this.currentLanguage = newLanguage;

        // Update UI
        this.updateLanguageSelector();
        
        // Save preference
        localStorage.setItem(TRANSLATION_CONFIG.STORAGE_KEY, newLanguage);
        TRANSLATION_STATE.currentLanguage = newLanguage;

        // Translate page
        await this.translatePage();

        // Show notification
        if (window.bioarchitetturaApp?.notificationManager) {
            const langName = TRANSLATION_CONFIG.LANGUAGES[newLanguage]?.name || newLanguage;
            window.bioarchitetturaApp.notificationManager.show(
                this.getTranslation('notification.language_changed') + `: ${langName}`,
                'info',
                null,
                TRANSLATION_CONFIG.NOTIFICATION_DURATION
            );
        }

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { oldLanguage, newLanguage }
        }));
    }

    updateLanguageSelector() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-lang') === this.currentLanguage;
            btn.classList.toggle('active', isActive);
        });
    }

    async loadTranslations() {
        // Static translations are already loaded
        TRANSLATION_STATE.staticTranslations = this.staticTranslations;
    }

    detectGoogleTranslate() {
        // Check if Google Translate is available
        if (window.google && window.google.translate) {
            TRANSLATION_CONFIG.GOOGLE_TRANSLATE_AVAILABLE = true;
        }

        // Try to detect Google Translate widget
        const googleTranslateElements = document.querySelectorAll('.goog-te-combo, #google_translate_element');
        if (googleTranslateElements.length > 0) {
            TRANSLATION_CONFIG.GOOGLE_TRANSLATE_AVAILABLE = true;
        }
    }

    async translatePage() {
        if (this.currentLanguage === TRANSLATION_CONFIG.DEFAULT_LANGUAGE) {
            this.restoreOriginalContent();
            return;
        }

        TRANSLATION_STATE.isTranslating = true;

        try {
            // Translate static content first
            await this.translateStaticContent();
            
            // Translate dynamic content
            await this.translateDynamicContent();
            
            // Update document language
            document.documentElement.setAttribute('lang', this.currentLanguage);
            
        } catch (error) {
            console.error('Translation failed:', error);
            this.showTranslationError();
        } finally {
            TRANSLATION_STATE.isTranslating = false;
        }
    }

    async translateStaticContent() {
        const elements = document.querySelectorAll('[data-translate]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            
            if (translation && translation !== key) {
                // Store original content if not already stored
                if (!element.hasAttribute('data-original')) {
                    element.setAttribute('data-original', element.textContent);
                }
                element.textContent = translation;
            }
        });

        // Translate placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.getTranslation(key);
            
            if (translation && translation !== key) {
                if (!element.hasAttribute('data-original-placeholder')) {
                    element.setAttribute('data-original-placeholder', element.getAttribute('placeholder'));
                }
                element.setAttribute('placeholder', translation);
            }
        });
    }

    async translateDynamicContent() {
        // Translate main content areas that don't have static translations
        const contentSelectors = [
            '.post-content p',
            '.product-description',
            '.hero-section p',
            '.about-section p'
        ];

        for (const selector of contentSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (!element.hasAttribute('data-translate') && this.shouldTranslateElement(element)) {
                    await this.translateElement(element);
                }
            }
        }
    }

    shouldTranslateElement(element) {
        // Skip elements that are already translated or shouldn't be translated
        const skipSelectors = [
            '.notranslate',
            '[data-notranslate]',
            'code',
            'pre',
            '.lang-btn',
            '.product-price',
            '.date'
        ];

        return !skipSelectors.some(selector => 
            element.matches(selector) || element.closest(selector)
        );
    }

    async translateElement(element) {
        const text = element.textContent.trim();
        if (!text || text.length < 3) return;

        const cacheKey = `${text}_${this.currentLanguage}`;
        
        // Check cache first
        if (this.translationCache.has(cacheKey)) {
            const translation = this.translationCache.get(cacheKey);
            if (!element.hasAttribute('data-original')) {
                element.setAttribute('data-original', text);
            }
            element.textContent = translation;
            return;
        }

        try {
            const translation = await this.translateText(text, this.currentLanguage);
            if (translation && translation !== text) {
                // Store in cache
                this.translationCache.set(cacheKey, translation);
                
                // Store original content
                if (!element.hasAttribute('data-original')) {
                    element.setAttribute('data-original', text);
                }
                
                element.textContent = translation;
            }
        } catch (error) {
            console.warn('Failed to translate text:', text, error);
        }
    }

    async translateText(text, targetLanguage) {
        if (!text || targetLanguage === TRANSLATION_CONFIG.DEFAULT_LANGUAGE) {
            return text;
        }

        // Try Google Translate API if available
        if (TRANSLATION_CONFIG.GOOGLE_TRANSLATE_KEY) {
            return await this.translateWithGoogleAPI(text, targetLanguage);
        }

        // Fallback to browser-based translation or manual mapping
        return await this.translateWithFallback(text, targetLanguage);
    }

    async translateWithGoogleAPI(text, targetLanguage) {
        const url = `${TRANSLATION_CONFIG.GOOGLE_TRANSLATE_API_URL}?client=gtx&sl=it&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data[0] && data[0][0] && data[0][0][0]) {
                return data[0][0][0];
            }
        } catch (error) {
            console.warn('Google Translate API error:', error);
        }
        
        return text;
    }

    async translateWithFallback(text, targetLanguage) {
        // Simple fallback translations for common phrases
        const fallbackTranslations = {
            en: {
                'Bioarchitettura': 'Bioarchitecture',
                'Costruzione sostenibile': 'Sustainable construction',
                'Architettura ecologica': 'Ecological architecture',
                'Efficienza energetica': 'Energy efficiency',
                'Casa passiva': 'Passive house',
                'Materiali naturali': 'Natural materials'
            },
            de: {
                'Bioarchitettura': 'Bioarchitektur',
                'Costruzione sostenibile': 'Nachhaltiges Bauen',
                'Architettura ecologica': 'Ökologische Architektur',
                'Efficienza energetica': 'Energieeffizienz',
                'Casa passiva': 'Passivhaus',
                'Materiali naturali': 'Natürliche Materialien'
            },
            fr: {
                'Bioarchitettura': 'Bioarchitecture',
                'Costruzione sostenibile': 'Construction durable',
                'Architettura ecologica': 'Architecture écologique',
                'Efficienza energetica': 'Efficacité énergétique',
                'Casa passiva': 'Maison passive',
                'Materiali naturali': 'Matériaux naturels'
            }
        };

        const translations = fallbackTranslations[targetLanguage];
        return translations && translations[text] ? translations[text] : text;
    }

    getTranslation(key) {
        const translations = this.staticTranslations[key];
        if (translations && translations[this.currentLanguage]) {
            return translations[this.currentLanguage];
        }
        
        // Fallback to default language or key itself
        if (translations && translations[TRANSLATION_CONFIG.DEFAULT_LANGUAGE]) {
            return translations[TRANSLATION_CONFIG.DEFAULT_LANGUAGE];
        }
        
        return key;
    }

    restoreOriginalContent() {
        // Restore text content
        const translatedElements = document.querySelectorAll('[data-original]');
        translatedElements.forEach(element => {
            const original = element.getAttribute('data-original');
            if (original) {
                element.textContent = original;
                element.removeAttribute('data-original');
            }
        });

        // Restore placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-original-placeholder]');
        placeholderElements.forEach(element => {
            const original = element.getAttribute('data-original-placeholder');
            if (original) {
                element.setAttribute('placeholder', original);
                element.removeAttribute('data-original-placeholder');
            }
        });

        // Reset document language
        document.documentElement.setAttribute('lang', TRANSLATION_CONFIG.DEFAULT_LANGUAGE);
    }

    setupAutoTranslation() {
        // Observe DOM changes and translate new content
        if (window.MutationObserver) {
            const observer = new MutationObserver((mutations) => {
                if (this.currentLanguage === TRANSLATION_CONFIG.DEFAULT_LANGUAGE) return;
                
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.translateNewContent(node);
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    async translateNewContent(element) {
        // Translate static content in new element
        const translateElements = element.querySelectorAll('[data-translate]');
        translateElements.forEach(el => {
            const key = el.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.textContent = translation;
            }
        });

        // Translate dynamic content
        if (this.shouldTranslateElement(element)) {
            await this.translateElement(element);
        }
    }

    showTranslationError() {
        if (window.bioarchitetturaApp?.notificationManager) {
            window.bioarchitetturaApp.notificationManager.show(
                this.getTranslation('notification.translation_error'),
                'error',
                null,
                TRANSLATION_CONFIG.NOTIFICATION_DURATION
            );
        }
    }

    // Public API methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.keys(TRANSLATION_CONFIG.LANGUAGES);
    }

    isTranslating() {
        return TRANSLATION_STATE.isTranslating;
    }

    addTranslation(key, translations) {
        this.staticTranslations[key] = translations;
        STATIC_TRANSLATIONS[key] = translations;
    }

    removeTranslation(key) {
        delete this.staticTranslations[key];
        delete STATIC_TRANSLATIONS[key];
    }

    clearCache() {
        this.translationCache.clear();
        TRANSLATION_STATE.translationCache.clear();
    }
}

// =============================================================================
// Translation Utilities
// =============================================================================

class TranslationUtils {
    static formatTranslation(translation, params = {}) {
        let formatted = translation;
        
        Object.entries(params).forEach(([key, value]) => {
            formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        
        return formatted;
    }

    static detectLanguage(text) {
        // Simple language detection based on common words
        const patterns = {
            it: /\b(il|la|di|da|in|per|con|su|come|anche|essere|avere|che|questo|quello)\b/gi,
            en: /\b(the|of|to|and|a|in|is|it|you|that|he|was|for|on|are|as|with|his|they)\b/gi,
            de: /\b(der|die|das|und|zu|den|ist|im|von|mit|sich|auf|für|als|bei|ein|eine)\b/gi,
            fr: /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec)\b/gi
        };

        let scores = {};
        
        Object.entries(patterns).forEach(([lang, pattern]) => {
            const matches = text.match(pattern);
            scores[lang] = matches ? matches.length : 0;
        });

        return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    }

    static isRTLLanguage(languageCode) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(languageCode);
    }

    static getLanguageDirection(languageCode) {
        return this.isRTLLanguage(languageCode) ? 'rtl' : 'ltr';
    }
}

// =============================================================================
// Translation Initialization
// =============================================================================

class TranslationSystem {
    constructor() {
        this.manager = new TranslationManager();
        this.utils = TranslationUtils;
        this.init();
    }

    init() {
        this.setupGlobalMethods();
        this.setupEventListeners();
    }

    setupGlobalMethods() {
        // Make translation methods globally available
        window.t = (key, params = {}) => {
            const translation = this.manager.getTranslation(key);
            return TranslationUtils.formatTranslation(translation, params);
        };

        window.changeLanguage = (language) => {
            return this.manager.changeLanguage(language);
        };

        window.getCurrentLanguage = () => {
            return this.manager.getCurrentLanguage();
        };
    }

    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.manager.currentLanguage !== TRANSLATION_CONFIG.DEFAULT_LANGUAGE) {
                // Re-translate any content that might have been added while page was hidden
                setTimeout(() => {
                    this.manager.translatePage();
                }, 500);
            }
        });

        // Handle language changes from other sources (e.g., browser settings)
        window.addEventListener('languagechange', () => {
            const browserLanguage = navigator.language.substring(0, 2);
            if (TRANSLATION_CONFIG.LANGUAGES[browserLanguage]) {
                this.manager.changeLanguage(browserLanguage);
            }
        });
    }

    // Public API
    getManager() {
        return this.manager;
    }

    getUtils() {
        return this.utils;
    }
}

// =============================================================================
// Translation System Startup
// =============================================================================

// Initialize translation system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.translationSystem = new TranslationSystem();
    });
} else {
    window.translationSystem = new TranslationSystem();
}

// Export for global access
window.TranslationConfig = TRANSLATION_CONFIG;
window.TranslationState = TRANSLATION_STATE;