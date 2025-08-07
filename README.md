# Bioarchitettura Platform - Advanced Jekyll Site

@bioarchitettura web-project - 2025 con funzionalità avanzate di AI e automazione

## 🚀 Caratteristiche Avanzate Implementate

### ✅ Funzionalità Completate

#### 1. **Article Recommender Engine** 
- 🤖 Suggerimenti intelligenti basati su categorie e tag
- ⚡ Algoritmo con pesi configurabili (categorie: 2, tag: 1)
- 🔄 Fallback automatico agli articoli recenti
- 🌐 Preparato per Google Recommendations AI

#### 2. **Tidio Chatbot Integration**
- 💬 Chat di supporto con fallback quando la chiave non è configurata
- ⚙️ Configurabile tramite `tidio_public_key` in `_config.yml`
- 🎯 Messaggi di benvenuto personalizzati per pagina
- 🔮 Preparato per estensioni Dialogflow/OpenAI GPT

#### 3. **OpenAI Auto-Summarization**
- 🧠 Riassunto intelligente con backend OpenAI GPT
- 🔄 Algoritmo estrattivo JavaScript come fallback
- 🎛️ UI per generazione e rigenerazione riassunti
- ⚙️ Configurabile in `_config.yml` con documentazione completa

### 🏗️ Architettura Migliorata

- **Layout modulari**: `_layouts/default.html`, `_layouts/post.html`
- **Include riutilizzabili**: Ogni funzionalità in `_includes/`
- **Configurazione completa**: `_config.yml` esteso per tutte le impostazioni
- **Documentazione tecnica**: `ADVANCED_FEATURES.md` con setup API, esempi backend, troubleshooting

### 📝 Contenuti e Categorizzazione

- **Articoli di esempio** con categorizzazione appropriata:
  - 🌱 **Sostenibilità**: Strategie carbon neutral, LCA, economia circolare
  - 🏗️ **Materiali Naturali**: Biomateriali, micelio, canapa, alghe
  - ⚡ **Efficienza Energetica**: NZEB, pompe di calore, smart building

### 🔧 Testing e Best Practices

- ✅ **Funzionalità con fallback**: Graceful degradation per tutte le feature AI
- 📱 **Mobile responsive**: Design ottimizzato per tutti i dispositivi  
- 🔍 **SEO-friendly**: Meta tags, schema markup, sitemap
- 🚫 **Non-blocking**: Caricamento asincrono, performance ottimizzate
- 🔐 **Gestione sicura API key**: Variabili d'ambiente, rate limiting
- 🌐 **HTTPS-ready**: Configurazione sicura per produzione
- 📊 **Rate limiting documentato**: Protezione anti-abuse
- 🎯 **Progressive enhancement**: Funziona anche senza JavaScript

## 🏗️ Struttura del Progetto

```
bioarchitettura-rivista/
├── _includes/                    # Componenti avanzati
│   ├── article-recommender.html  # Engine raccomandazioni
│   ├── tidio-chat.html          # Integrazione chat
│   ├── auto-summary.html        # Riassunto automatico
│   └── openai-summarization.html # Backend OpenAI
├── _layouts/                     # Layout migliorati
│   ├── default.html             # Layout base con feature integrate
│   └── post.html                # Layout articoli con AI
├── _posts/                       # Articoli categorizzati
│   ├── sostenibilità/
│   ├── materiali-naturali/
│   └── efficienza-energetica/
├── rivista/                      # Sezione rivista
│   ├── index.html               # Homepage rivista
│   ├── archivio/                # Archivio numeri
│   └── abbonamenti/             # Abbonamenti
├── shop/                         # Sezione e-commerce
│   ├── ebooks/
│   ├── corsi/
│   └── webinar/
├── _config.yml                   # Configurazione completa
├── ADVANCED_FEATURES.md          # Documentazione tecnica
└── README.md                     # Guida migrazione
```

## ⚙️ Configurazione Veloce

### 1. Installazione Dipendenze

```bash
# Installa Ruby e Jekyll
gem install jekyll bundler

# Installa dipendenze progetto
bundle install

# Avvia server di sviluppo
bundle exec jekyll serve
```

### 2. Configurazione Funzionalità Avanzate

#### Tidio Chat
```yaml
# _config.yml
tidio_key: "YOUR_TIDIO_PUBLIC_KEY"
```

#### OpenAI Summarization
```yaml
# _config.yml
openai:
  api_key: ""  # Imposta via OPENAI_API_KEY env var
  model: "gpt-3.5-turbo"
  max_tokens: 150
  temperature: 0.7
```

#### Article Recommender
```yaml
# _config.yml
max_related_articles: 3
recommendation_fallback: true
```

### 3. Variabili d'Ambiente

```bash
# .env (per produzione)
export TIDIO_PUBLIC_KEY="your_tidio_key"
export OPENAI_API_KEY="your_openai_key"
export JEKYLL_ENV="production"
```

## 🚀 Migrazione da Siti Esistenti

### Step 1: Valutazione Contenuti Esistenti

```bash
# Audit contenuti attuali
- www.bioarchitettura.org (contenuti principali)
- www.bioarchitettura-fondazione.eu (info istituzionali)

# Categorizzazione automatica con AI
- Analisi contenuti per tag e categorie
- Migrazione immagini e media
- SEO redirect mapping
```

### Step 2: Configurazione Graduale

1. **Setup Base** (Settimana 1)
   - ✅ Jekyll con layout responsive
   - ✅ Struttura navigazione completa
   - ✅ Configurazione hosting

2. **Contenuti** (Settimana 2-3)
   - ✅ Migrazione articoli con categorizzazione
   - ✅ Ottimizzazione immagini
   - ✅ Setup SEO e meta tags

3. **Funzionalità Avanzate** (Settimana 4)
   - ✅ Integrazione AI features
   - ✅ Testing e-commerce base
   - ✅ Analytics e monitoraggio

### Step 3: Testing e Launch

- **Staging Environment**: Test completo funzionalità
- **Performance Audit**: PageSpeed, Core Web Vitals
- **SEO Check**: Sitemap, robots.txt, canonical URLs
- **Accessibility**: WCAG 2.1 compliance
- **Security Review**: HTTPS, CSP headers, rate limiting

## 🛠️ Gestione Contenuti con Netlify CMS

Il sito include un sistema di gestione contenuti (CMS) user-friendly:

### Accesso al CMS

#### Opzione 1: Netlify (Consigliato)
1. Visita `https://yourdomain.netlify.app/admin/`
2. Login con account GitHub
3. Gestisci contenuti tramite interfaccia grafica

#### Opzione 2: Sviluppo Locale
```bash
# Installa proxy server
npm install -g netlify-cms-proxy-server

# Configura sviluppo locale
# Aggiungi a admin/config.yml:
local_backend: true

# Avvia proxy
netlify-cms-proxy-server

# Accedi a http://localhost:4000/admin/
```

### Funzionalità CMS

- **📄 Pagine**: Crea e modifica pagine (`public/`)
- **📰 Articoli**: Gestisci blog e news (`_posts/`)
- **⚙️ Configurazione**: Modifica impostazioni sito (`_config.yml`)
- **🖼️ Media**: Carica e organizza immagini (`public/images/`)

## 🔧 API Backend per Funzionalità AI

### Setup Node.js (Consigliato)

```javascript
// server.js
const express = require('express');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting: 10 richieste/minuto per IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10
});

app.use('/api/openai', limiter);

app.post('/api/openai/summarize', async (req, res) => {
    try {
        const { content, title, language = 'it' } = req.body;
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Sei un esperto di bioarchitettura...'
                },
                {
                    role: 'user',
                    content: `Riassumi in italiano questo articolo: ${title}\n\n${content}`
                }
            ],
            max_tokens: 150
        });
        
        res.json({
            summary: completion.choices[0].message.content.trim(),
            confidence: 0.85
        });
    } catch (error) {
        res.status(500).json({ error: 'Errore generazione riassunto' });
    }
});

app.listen(3000);
```

### Deploy Opzioni

**Vercel (Serverless)**:
```bash
npm install -g vercel
vercel --prod
```

**Heroku**:
```bash
git push heroku main
heroku config:set OPENAI_API_KEY="your_key"
```

**Railway**:
```bash
railway login
railway deploy
```

## 📊 Performance e Monitoraggio

### Metriche Target

- **🚀 Core Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms  
  - CLS < 0.1

- **⚡ Performance**:
  - PageSpeed Score > 90
  - Time to Interactive < 3s
  - Totale JS < 300KB

### Analytics Integrazione

```yaml
# _config.yml
analytics:
  google_analytics_id: "GA_MEASUREMENT_ID"
  google_tag_manager_id: "GTM_ID"
  
# Custom events per AI features
ai_analytics:
  track_recommendations: true
  track_summaries: true
  track_chat_interactions: true
```

## 🔒 Sicurezza e Privacy

### Configurazioni Sicurezza

- **CSP Headers**: Content Security Policy restrittive
- **Rate Limiting**: Protezione API abuse
- **Input Validation**: Sanitizzazione contenuti utente
- **API Key Management**: Variabili d'ambiente sicure
- **HTTPS Enforcement**: Redirect automatico SSL

### GDPR Compliance

- **Cookie Banner**: Gestione consensi
- **Privacy Policy**: Template incluso
- **Data Minimization**: Raccolta dati essenziali
- **Right to Delete**: Procedure di cancellazione

## 🚀 Roadmap 2025

### Q1 2025: Launch & Ottimizzazione
- ✅ Migrazione contenuti completa
- ✅ Performance optimization
- ✅ SEO audit e improvements
- 🔄 User feedback integration

### Q2 2025: Enhanced AI
- 🔮 GPT-4 integration
- 🌍 Multilingual support  
- 📊 Advanced analytics
- 🎯 Personalized recommendations

### Q3 2025: E-commerce Evolution
- 🛒 Advanced shop features
- 💳 Multiple payment gateways
- 📱 Mobile app companion
- 🤝 Partner integrations

### Q4 2025: Community Platform
- 👥 User-generated content
- 🎓 Learning management system
- 📅 Events and webinars
- 🏆 Certification programs

## 📞 Supporto e Contatti

- **🔧 Supporto Tecnico**: tech@bioarchitettura.org
- **📝 Contenuti**: redazione@bioarchitettura.org  
- **💼 Partnership**: info@bioarchitettura.org
- **📱 Social**: @bioarchitettura su tutte le piattaforme

### Documentazione Tecnica

- 📖 **[ADVANCED_FEATURES.md](./ADVANCED_FEATURES.md)**: Setup completo funzionalità AI
- 🚀 **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Guide deployment produzione
- 🔧 **Admin CMS**: `yourdomain.com/admin/` per gestione contenuti

---

**🌱 La bioarchitettura è il futuro dell'edilizia sostenibile. Costruiamo insieme un mondo più verde! 🌱**
