/**
 * AI-Powered Chat Assistant for Bioarchitettura
 * Intelligent chatbot for customer support and information
 */

class AIChat {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.knowledgeBase = this.buildKnowledgeBase();
        this.init();
    }

    init() {
        this.createChatInterface();
        this.setupEventListeners();
        this.loadChatHistory();
    }

    createChatInterface() {
        // Remove existing fallback chat if present
        const existingFallback = document.getElementById('chat-fallback');
        if (existingFallback) {
            existingFallback.remove();
        }

        // Create enhanced chat widget
        const chatWidget = document.createElement('div');
        chatWidget.id = 'ai-chat-widget';
        chatWidget.className = 'ai-chat-widget';
        chatWidget.innerHTML = `
            <!-- Chat Button -->
            <button class="chat-toggle" id="chat-toggle" title="Assistente AI">
                <div class="chat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="chat-close-icon" style="display: none;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div class="chat-notification" id="chat-notification" style="display: none;">
                    <span>1</span>
                </div>
            </button>

            <!-- Chat Window -->
            <div class="chat-window" id="chat-window">
                <div class="chat-header">
                    <div class="chat-avatar">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0YTdjNTkiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj4KPHA+dGggZD0iTTIxIDE1YTIgMiAwIDAgMS0yIDJIN2wtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyeiI+PC9wYXRoPgo8L3N2Zz4KPC9zdmc+" alt="Assistente">
                    </div>
                    <div class="chat-info">
                        <h4>Assistente Bioarchitettura</h4>
                        <p class="chat-status">
                            <span class="status-dot online"></span>
                            Online - Sempre disponibile
                        </p>
                    </div>
                    <button class="chat-minimize" id="chat-minimize">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>

                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <div class="message bot-message">
                            <div class="message-avatar">
                                <span>🤖</span>
                            </div>
                            <div class="message-content">
                                <p>Ciao! Sono l'assistente virtuale della Bioarchitettura. Posso aiutarti con:</p>
                                <ul>
                                    <li>Informazioni sui corsi e webinar</li>
                                    <li>Dettagli sui prodotti e abbonamenti</li>
                                    <li>Principi di bioarchitettura</li>
                                    <li>Supporto tecnico</li>
                                </ul>
                                <p>Come posso aiutarti oggi?</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chat-input-area">
                    <div class="quick-actions" id="quick-actions">
                        <button class="quick-action" data-message="Voglio informazioni sui corsi">
                            📚 Corsi
                        </button>
                        <button class="quick-action" data-message="Come posso abbonarmi alla rivista?">
                            📖 Abbonamenti
                        </button>
                        <button class="quick-action" data-message="Quali sono i principi della bioarchitettura?">
                            🏗️ Bioarchitettura
                        </button>
                    </div>
                    <div class="typing-indicator" id="typing-indicator" style="display: none;">
                        <div class="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <span>L'assistente sta scrivendo...</span>
                    </div>
                    <div class="chat-input-wrapper">
                        <input type="text" id="chat-input" placeholder="Scrivi il tuo messaggio..." autocomplete="off">
                        <button class="send-button" id="send-button">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22,2 15,22 11,13 2,9"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(chatWidget);
    }

    setupEventListeners() {
        const chatToggle = document.getElementById('chat-toggle');
        const chatMinimize = document.getElementById('chat-minimize');
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const quickActions = document.querySelectorAll('.quick-action');

        chatToggle.addEventListener('click', () => this.toggleChat());
        chatMinimize.addEventListener('click', () => this.closeChat());
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        sendButton.addEventListener('click', () => this.sendMessage());
        
        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const message = action.dataset.message;
                this.sendMessage(message);
            });
        });

        // Show initial notification after a delay
        setTimeout(() => {
            this.showNotification();
        }, 10000);
    }

    buildKnowledgeBase() {
        return {
            bioarchitettura: {
                keywords: ['bioarchitettura', 'architettura sostenibile', 'costruzione ecologica', 'principi'],
                responses: [
                    "La bioarchitettura è un approccio alla progettazione che mira a creare edifici in armonia con l'ambiente. I principi fondamentali includono:",
                    "• Uso di materiali naturali e locali",
                    "• Efficienza energetica e riduzione dei consumi",
                    "• Integrazione con il paesaggio circostante",
                    "• Comfort e benessere degli abitanti",
                    "• Riduzione dell'impatto ambientale",
                    "",
                    "Vuoi saperne di più su un aspetto specifico?"
                ]
            },
            materiali: {
                keywords: ['materiali', 'naturali', 'legno', 'terra cruda', 'pietra', 'isolamento'],
                responses: [
                    "I materiali naturali sono alla base della bioarchitettura. Ecco i principali:",
                    "",
                    "🌳 **Legno**: Rinnovabile, buon isolante, regola l'umidità",
                    "🏔️ **Pietra naturale**: Duratura, termoregolante, locale",
                    "🧱 **Terra cruda**: Economica, regolatrice dell'umidità",
                    "🌾 **Fibre vegetali**: Isolanti naturali come canapa, lino",
                    "🐑 **Lana di pecora**: Ottimo isolante termico e acustico",
                    "",
                    "Abbiamo e-books dettagliati su ogni materiale. Vuoi informazioni specifiche?"
                ]
            },
            corsi: {
                keywords: ['corsi', 'formazione', 'corso', 'imparare', 'studiare'],
                responses: [
                    "Offriamo diversi corsi di formazione:",
                    "",
                    "📚 **Fondamenti di Bioarchitettura** (€149)",
                    "• 8 ore di contenuti",
                    "• Certificato incluso",
                    "• Per principianti",
                    "",
                    "🏗️ **Materiali Naturali** (€249)",
                    "• 12 ore, livello intermedio",
                    "",
                    "⚡ **Efficienza Energetica** (€399)",
                    "• 16 ore, livello avanzato",
                    "",
                    "Vuoi maggiori dettagli su un corso specifico?"
                ]
            },
            abbonamenti: {
                keywords: ['abbonamento', 'rivista', 'abbonare', 'sottoscrizione'],
                responses: [
                    "Abbiamo 3 piani di abbonamento alla rivista:",
                    "",
                    "💻 **Digitale** - €24/anno",
                    "• Accesso completo online",
                    "• Archivio storico",
                    "",
                    "📖 **Cartaceo + Digitale** - €48/anno",
                    "• Rivista a casa + digitale",
                    "• Spedizione gratuita",
                    "• Sconti 10%",
                    "",
                    "⭐ **Premium** - €96/anno",
                    "• Tutto incluso + webinar esclusivi",
                    "• Sconti 20%",
                    "",
                    "Quale ti interessa di più?"
                ]
            },
            webinar: {
                keywords: ['webinar', 'eventi', 'live', 'online'],
                responses: [
                    "I nostri webinar coprono vari temi:",
                    "",
                    "🔴 **Live in programma:**",
                    "• Isolamento Termico Naturale - 15 Feb, €29",
                    "• Ventilazione Naturale - 22 Feb, €29",
                    "",
                    "📹 **On-demand disponibili:**",
                    "• Terra Cruda (2h 15m) - €39",
                    "• Fonti Rinnovabili (1h 45m) - €35",
                    "• Progettazione Bioclimatica (2h 30m) - €45",
                    "",
                    "Offriamo anche pacchetti scontati. Ti interessa qualcosa in particolare?"
                ]
            },
            contatti: {
                keywords: ['contatto', 'email', 'telefono', 'supporto', 'aiuto'],
                responses: [
                    "Ecco come puoi contattarci:",
                    "",
                    "📧 **Email**: bioa@bioarchitettura.org",
                    "📞 **Telefono**: +39 0471 973097",
                    "🏢 **Sede**: Certosa di Firenze, Via della Certosa, 1",
                    "",
                    "**Orari di supporto:**",
                    "Lunedì-Venerdì: 9:00-18:00",
                    "Sabato: 9:00-13:00",
                    "",
                    "Per urgenze tecniche, usa il nostro sistema di ticket online."
                ]
            },
            prezzi: {
                keywords: ['prezzo', 'costo', 'quanto costa', 'pagamento'],
                responses: [
                    "Ecco i nostri prezzi principali:",
                    "",
                    "📚 **E-books**: €19.99 - €39.99",
                    "🎓 **Corsi**: €149 - €599",
                    "🎥 **Webinar**: €25 - €45",
                    "📖 **Abbonamenti**: €24 - €96/anno",
                    "",
                    "**Metodi di pagamento:**",
                    "• PayPal",
                    "• Carta di credito",
                    "• Bonifico bancario",
                    "",
                    "Offriamo sconti per studenti e pacchetti multipli!"
                ]
            }
        };
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatIcon = document.querySelector('.chat-icon');
        const chatCloseIcon = document.querySelector('.chat-close-icon');
        const notification = document.getElementById('chat-notification');
        
        chatWindow.style.display = 'flex';
        chatIcon.style.display = 'none';
        chatCloseIcon.style.display = 'block';
        notification.style.display = 'none';
        
        this.isOpen = true;
        this.scrollToBottom();
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 300);
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatIcon = document.querySelector('.chat-icon');
        const chatCloseIcon = document.querySelector('.chat-close-icon');
        
        chatWindow.style.display = 'none';
        chatIcon.style.display = 'block';
        chatCloseIcon.style.display = 'none';
        
        this.isOpen = false;
    }

    async sendMessage(text = null) {
        const input = document.getElementById('chat-input');
        const message = text || input.value.trim();
        
        if (!message) return;
        
        // Clear input
        if (!text) input.value = '';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTyping();
        
        // Generate response
        setTimeout(async () => {
            const response = await this.generateResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
            this.hideQuickActions();
        }, 1000 + Math.random() * 2000); // Realistic typing delay
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        const timestamp = new Date().toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (type === 'user') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                    <span class="message-time">${timestamp}</span>
                </div>
                <div class="message-avatar">
                    <span>👤</span>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <span>🤖</span>
                </div>
                <div class="message-content">
                    ${this.formatBotMessage(content)}
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Save to history
        this.messages.push({ content, type, timestamp });
        this.saveChatHistory();
    }

    formatBotMessage(content) {
        if (Array.isArray(content)) {
            return content.map(line => {
                if (line.startsWith('**') && line.endsWith('**')) {
                    return `<strong>${line.slice(2, -2)}</strong>`;
                }
                if (line.startsWith('• ')) {
                    return `<li>${line.slice(2)}</li>`;
                }
                if (line === '') {
                    return '<br>';
                }
                return `<p>${this.escapeHtml(line)}</p>`;
            }).join('');
        }
        return `<p>${this.escapeHtml(content)}</p>`;
    }

    async generateResponse(message) {
        const normalizedMessage = message.toLowerCase();
        
        // Check knowledge base
        for (const [topic, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(keyword => normalizedMessage.includes(keyword))) {
                return data.responses;
            }
        }
        
        // Handle greetings
        if (this.isGreeting(normalizedMessage)) {
            return [
                "Ciao! Benvenuto nel mondo della bioarchitettura! 👋",
                "",
                "Sono qui per aiutarti con informazioni su:",
                "• Corsi e formazione",
                "• Materiali naturali",
                "• Abbonamenti alla rivista",
                "• Principi di bioarchitettura",
                "",
                "Cosa ti interessa di più?"
            ];
        }
        
        // Handle thanks
        if (this.isThanking(normalizedMessage)) {
            return [
                "Prego! È stato un piacere aiutarti! 😊",
                "",
                "Se hai altre domande, sono sempre qui.",
                "Buona giornata e buona bioarchitettura!"
            ];
        }
        
        // Default response with suggestions
        return [
            "Mi dispiace, non ho capito bene la tua domanda. 🤔",
            "",
            "Prova a chiedermi informazioni su:",
            "• **Corsi di formazione** - per imparare la bioarchitettura",
            "• **Materiali naturali** - legno, terra cruda, pietra...",
            "• **Abbonamenti** - per ricevere la nostra rivista",
            "• **Webinar** - eventi formativi online",
            "",
            "Oppure scrivi semplicemente quello che ti interessa!"
        ];
    }

    isGreeting(message) {
        const greetings = ['ciao', 'salve', 'buongiorno', 'buonasera', 'hello', 'hi'];
        return greetings.some(greeting => message.includes(greeting));
    }

    isThanking(message) {
        const thanks = ['grazie', 'thanks', 'perfetto', 'ottimo', 'bene'];
        return thanks.some(thank => message.includes(thank));
    }

    showTyping() {
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'flex';
        this.isTyping = true;
        this.scrollToBottom();
    }

    hideTyping() {
        const indicator = document.getElementById('typing-indicator');
        indicator.style.display = 'none';
        this.isTyping = false;
    }

    hideQuickActions() {
        const quickActions = document.getElementById('quick-actions');
        if (this.messages.length > 0) {
            quickActions.style.display = 'none';
        }
    }

    showNotification() {
        if (!this.isOpen) {
            const notification = document.getElementById('chat-notification');
            notification.style.display = 'block';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    saveChatHistory() {
        localStorage.setItem('bioarchitettura_chat_history', JSON.stringify(this.messages.slice(-20)));
    }

    loadChatHistory() {
        const history = JSON.parse(localStorage.getItem('bioarchitettura_chat_history') || '[]');
        this.messages = history;
        
        // Restore messages (keep only recent ones)
        if (history.length > 0) {
            const messagesContainer = document.getElementById('chat-messages');
            history.forEach(msg => {
                if (msg.type !== 'welcome') { // Don't restore welcome message
                    this.addMessage(msg.content, msg.type);
                }
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AI Chat when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.aiChat = new AIChat();
});

// Add CSS styles
const chatStyles = `
<style>
.ai-chat-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-family: system-ui, -apple-system, sans-serif;
}

.chat-toggle {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(74, 124, 89, 0.4);
    transition: all 0.3s ease;
    color: white;
}

.chat-toggle:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 124, 89, 0.6);
}

.chat-notification {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    animation: pulse 2s infinite;
}

.chat-window {
    position: absolute;
    bottom: 70px;
    right: 0;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: none;
    flex-direction: column;
    overflow: hidden;
}

.chat-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, #4a7c59 0%, #2c5530 100%);
    color: white;
}

.chat-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 0.75rem;
}

.chat-info h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

.chat-status {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.9;
    display: flex;
    align-items: center;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.5rem;
}

.status-dot.online {
    background: #27ae60;
    box-shadow: 0 0 8px rgba(39, 174, 96, 0.6);
}

.chat-minimize {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.chat-minimize:hover {
    background: rgba(255, 255, 255, 0.3);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #f8f9fa;
}

.message {
    display: flex;
    margin-bottom: 1rem;
    align-items: flex-start;
}

.message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #4a7c59;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.user-message {
    flex-direction: row-reverse;
}

.user-message .message-avatar {
    background: #007bff;
    margin-left: 0.5rem;
}

.bot-message .message-avatar {
    margin-right: 0.5rem;
}

.message-content {
    max-width: 80%;
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
}

.user-message .message-content {
    background: #4a7c59;
    color: white;
}

.message-content p {
    margin: 0 0 0.5rem 0;
}

.message-content p:last-of-type {
    margin-bottom: 0;
}

.message-content ul {
    margin: 0.5rem 0;
    padding-left: 1rem;
}

.message-content li {
    margin-bottom: 0.25rem;
}

.message-time {
    font-size: 0.7rem;
    opacity: 0.6;
    margin-top: 0.5rem;
    display: block;
}

.welcome-message {
    margin-bottom: 1rem;
}

.welcome-message .message-content {
    background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
    border: 1px solid #c3e6cb;
}

.chat-input-area {
    padding: 1rem;
    background: white;
    border-top: 1px solid #eee;
}

.quick-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.quick-action {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.quick-action:hover {
    background: #4a7c59;
    color: white;
    border-color: #4a7c59;
}

.typing-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;
}

.typing-dots {
    display: flex;
    margin-right: 0.5rem;
}

.typing-dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4a7c59;
    margin: 0 1px;
    animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

.chat-input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 25px;
    padding: 0.5rem;
}

#chat-input {
    flex: 1;
    border: none;
    background: none;
    padding: 0.5rem 1rem;
    outline: none;
    font-size: 0.9rem;
}

.send-button {
    background: #4a7c59;
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.send-button:hover {
    background: #2c5530;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

@keyframes typing {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

@media (max-width: 768px) {
    .chat-window {
        position: fixed;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        border-radius: 0;
    }
    
    .ai-chat-widget {
        bottom: 10px;
        right: 10px;
    }
}
</style>
`;

// Inject CSS styles
document.head.insertAdjacentHTML('beforeend', chatStyles);