# web
@bioarchitettura web-project - 2025

Sito web ufficiale della **Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente**, costruito con Jekyll e integrato con Netlify CMS per una gestione contenuti semplice e intuitiva.

## 🚀 Deployment

Questo sito è configurato per il deployment su tre piattaforme principali:

### GitHub Pages (Consigliato)
Il deployment è automatico tramite GitHub Actions:
- **URL**: `https://bioarchitettura.github.io/web`
- **Configurazione**: `.github/workflows/jekyll-gh-pages.yml`
- **Deploy automatico**: Ad ogni push su `main`
- **CMS accessibile**: `https://bioarchitettura.github.io/web/admin/`

### Netlify
Deployment alternativo con configurazione avanzata:
- **Configurazione**: `netlify.toml`
- **Build Command**: `jekyll build`
- **Publish Directory**: `_site`
- **CMS accessibile**: `https://yourdomain.netlify.app/admin/`

#### Setup Netlify:
1. Connetti il repository a Netlify
2. Configura variabili d'ambiente (se necessarie)
3. Il build inizierà automaticamente

### Vercel
Deployment alternativo per performance ottimizzate:
- **Configurazione**: `vercel.json` e `package.json`
- **Build Command**: `jekyll build`
- **Output Directory**: `_site`
- **CMS accessibile**: `https://yourdomain.vercel.app/admin/`

#### Setup Vercel:
1. Connetti il repository a Vercel
2. Vercel rileverà automaticamente le configurazioni
3. Il deployment inizierà automaticamente

## 🎨 Gestione Contenuti con Netlify CMS

Questo sito è dotato di un sistema di gestione contenuti (CMS) basato su Netlify CMS che permette di modificare facilmente pagine e articoli tramite un'interfaccia web user-friendly.

### Accesso al CMS

#### Per siti deployati (Raccomandato)
1. Visita `https://yourdomain.com/admin/` (sostituisci con il tuo dominio)
2. Effettua il login con il tuo account GitHub
3. Inizia a gestire i contenuti

**URLs CMS per deployment:**
- GitHub Pages: `https://bioarchitettura.github.io/web/admin/`
- Netlify: `https://yourdomain.netlify.app/admin/`
- Vercel: `https://yourdomain.vercel.app/admin/`

#### Sviluppo Locale
Per utilizzare il CMS in locale durante lo sviluppo:

1. **Installa dependencies:**
   ```bash
   # Ruby dependencies
   bundle install
   
   # Node.js dependencies (per proxy CMS)
   npm install -g netlify-cms-proxy-server
   ```

2. **Avvia Jekyll:**
   ```bash
   bundle exec jekyll serve
   ```

3. **Configura il proxy per lo sviluppo locale:**
   Modifica temporaneamente `admin/config.yml` aggiungendo:
   ```yaml
   local_backend: true
   ```

4. **Avvia il proxy server:**
   ```bash
   netlify-cms-proxy-server
   ```

5. **Accedi al CMS locale:**
   Apri `http://localhost:4000/admin/` nel browser

### Funzionalità del CMS

Il CMS permette di gestire:

- **Pagine**: Crea e modifica pagine del sito (cartella `public/`)
- **Articoli**: Gestisci il blog e le news (cartella `_posts/`)
- **Configurazione**: Modifica impostazioni generali del sito (`_config.yml`)
- **Media**: Carica e organizza immagini (cartella `public/images/`)

### Flusso di Lavoro Editoriale

Il CMS è configurato con un flusso di lavoro editoriale che richiede:
1. **Bozza**: Crea contenuti in modalità bozza
2. **Revisione**: I contenuti vengono sottoposti a revisione
3. **Pubblicazione**: Dopo l'approvazione, i contenuti vengono pubblicati automaticamente

### Autorizzazioni

Per accedere al CMS è necessario:
- Avere un account GitHub
- Essere collaboratori del repository `bioarchitettura/web`
- Avere i permessi di scrittura sul repository

## 🛠️ Sviluppo Locale

### Prerequisiti
- Ruby 3.1+ (raccomandato)
- Bundler
- Node.js (opzionale, per il proxy CMS)

### Setup
```bash
# Clona il repository
git clone https://github.com/bioarchitettura/web.git
cd web

# Installa dependencies
bundle install

# Avvia il server di sviluppo
bundle exec jekyll serve
```

Il sito sarà disponibile su `http://localhost:4000`

### Build di produzione
```bash
# Build del sito
bundle exec jekyll build

# Il sito buildato sarà nella cartella _site/
```

## 📁 Struttura del Progetto

```
.
├── _config.yml          # Configurazione Jekyll
├── _posts/              # Articoli del blog
├── admin/               # Configurazione Netlify CMS
│   ├── config.yml       # Configurazione CMS
│   └── index.html       # Interfaccia CMS
├── public/              # Pagine statiche
│   └── images/          # Media/immagini
├── .github/workflows/   # GitHub Actions
├── netlify.toml         # Configurazione Netlify
├── vercel.json          # Configurazione Vercel
├── package.json         # Dependencies Node.js
└── Gemfile              # Dependencies Ruby
```

## 🔒 Sicurezza

- Tutte le piattaforme sono configurate con headers di sicurezza
- HTTPS forzato su tutti i deployment
- CMS protetto con autenticazione GitHub
- Headers CSP per prevenire XSS

## 🆘 Supporto

Per problemi tecnici o richieste di funzionalità:
- Apri un [Issue](https://github.com/bioarchitettura/web/issues)
- Contatta il team di sviluppo

## 📄 Licenza

Copyright © 2025 Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente
