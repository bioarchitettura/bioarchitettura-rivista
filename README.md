# Sito Web Bioarchitettura

Sito web ufficiale della Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente, costruito con Jekyll e pronto per GitHub Pages con CMS integrato (Decap CMS).

## 🏗️ Struttura del Progetto

```
web/
├── _config.yml              # Configurazione Jekyll
├── index.md                 # Homepage
├── Gemfile                  # Dipendenze Ruby/Jekyll
├── _posts/                  # Articoli e news (blog)
├── _rivista/                # Articoli della rivista
├── _archivio/               # Contenuti storici e documentali
├── rivista/                 # Pagina indice rivista
├── archivio/                # Pagina indice archivio
├── assets/                  # Risorse statiche
│   ├── images/              # Immagini
│   ├── css/                 # Fogli di stile
│   └── js/                  # File JavaScript
└── admin/                   # Interfaccia CMS (Decap CMS)
    ├── index.html           # Interfaccia web del CMS
    └── config.yml           # Configurazione CMS
```

## 🚀 Pubblicazione su GitHub Pages

### 1. Attivazione GitHub Pages
1. Vai su **Settings** del repository
2. Scorri fino alla sezione **Pages**
3. Seleziona **Source**: `Deploy from a branch`
4. Scegli **Branch**: `main` e **Folder**: `/ (root)`
5. Clicca **Save**

Il sito sarà disponibile all'indirizzo: `https://bioarchitettura.github.io/web`

### 2. Configurazione Automatica
GitHub Pages compilerà automaticamente il sito Jekyll ad ogni push sul branch `main`.

## ✏️ Gestione Contenuti

### Modalità 1: Tramite CMS Web (Raccomandato)

1. **Accesso al CMS**: Visita `https://bioarchitettura.github.io/web/admin`
2. **Autenticazione**: Usa il tuo account GitHub
3. **Gestione contenuti**:
   - **Homepage**: Modifica contenuti della pagina principale
   - **Rivista**: Crea/modifica articoli della rivista
   - **Archivio**: Gestisci documenti storici e materiali
   - **Articoli e News**: Pubblica notizie e aggiornamenti
   - **Pagine**: Modifica pagine statiche
   - **Configurazioni**: Aggiorna impostazioni del sito

### Modalità 2: Modifica Diretta dei File

#### Articoli Rivista (`_rivista/`)
Crea un nuovo file `.md` con questa struttura:
```yaml
---
title: "Titolo dell'articolo"
date: 2024-01-15
author: "Nome Autore"
description: "Breve descrizione"
image: "/assets/images/immagine.jpg"
categories: [categoria1, categoria2]
tags: [tag1, tag2]
featured: true  # Se articolo in evidenza
---

Contenuto dell'articolo in Markdown...
```

#### Documenti Archivio (`_archivio/`)
```yaml
---
title: "Titolo documento"
date: 2024-01-15
author: "Nome Autore"
description: "Descrizione documento"
type: "documento-storico"  # o "ricerca", "materiale-didattico"
categories: [storia, ricerca]
tags: [tag1, tag2]
---

Contenuto del documento...
```

#### News e Articoli (`_posts/`)
Nome file: `YYYY-MM-DD-titolo-articolo.md`
```yaml
---
layout: post
title: "Titolo dell'articolo"
date: 2024-01-15
author: "Nome Autore"
categories: [news, formazione]
tags: [tag1, tag2]
excerpt: "Breve estratto"
---

Contenuto dell'articolo...
```

## 🛠️ Sviluppo Locale

### Requisiti
- Ruby 2.7+
- Bundler

### Installazione
```bash
# Clona il repository
git clone https://github.com/bioarchitettura/web.git
cd web

# Installa le dipendenze
bundle install

# Avvia il server di sviluppo
bundle exec jekyll serve

# Il sito sarà disponibile su http://localhost:4000
```

### Sviluppo con CMS Locale
Per testare il CMS in locale:
```bash
# Installa Decap CMS Proxy
npm install -g decap-server

# In un terminale, avvia il proxy
decap-server

# In un altro terminale, avvia Jekyll
bundle exec jekyll serve

# Il CMS sarà disponibile su http://localhost:4000/admin
```

## 🎨 Personalizzazione

### Tema e Stili
- Modifica `/assets/css/style.css` per personalizzare l'aspetto
- Il sito usa il tema `minima` di default, personalizzabile tramite CSS

### Configurazione Sito
Modifica `_config.yml` per:
- Titolo e descrizione del sito
- Informazioni di contatto
- Social media links
- Configurazioni Jekyll

### Layout Personalizzati
Crea file in `_layouts/` per layout personalizzati:
- `default.html` - Layout base
- `post.html` - Layout per articoli
- `page.html` - Layout per pagine statiche

## 📱 Sezioni del Sito

### Homepage (`index.md`)
Pagina principale con:
- Presentazione della Fondazione
- Statistiche in evidenza
- Link alle sezioni principali

### Rivista (`/rivista/`)
- Archivio completo degli articoli
- Articoli in evidenza
- Sistema di categorizzazione

### Archivio (`/archivio/`)
- Documenti storici
- Materiali di ricerca
- Contenuti didattici
- Organizzazione per tipologia

### Blog (`/posts/`)
- Notizie e aggiornamenti
- Eventi e annunci
- Informazioni sui corsi

## 🔧 Configurazione CMS

### Backend GitHub
Il CMS è configurato per GitHub Pages. Per usarlo:

1. **Abilita GitHub API**: Il CMS usa l'API di GitHub per salvare i contenuti
2. **OAuth App** (opzionale): Per maggiore sicurezza, crea un'OAuth App GitHub
3. **Accesso**: Gli utenti devono avere permessi di scrittura sul repository

### Configurazioni Avanzate
Modifica `/admin/config.yml` per:
- Aggiungere nuovi tipi di contenuto
- Personalizzare l'interfaccia
- Configurare workflow di pubblicazione

## 📋 Manutenzione

### Backup
- I contenuti sono automaticamente salvati nel repository Git
- GitHub mantiene lo storico completo delle modifiche

### Aggiornamenti
- Jekyll e i plugin si aggiornano automaticamente con GitHub Pages
- Per aggiornamenti manuali, modifica il `Gemfile`

### Monitoraggio
- Controlla regolarmente la sezione **Actions** per eventuali errori di build
- I log di GitHub Pages mostrano eventuali problemi di compilazione

## 📞 Supporto

Per supporto tecnico o domande:
- **Email**: [web@bioarchitettura.it](mailto:web@bioarchitettura.it)
- **Issues**: Usa la sezione Issues di GitHub per segnalare problemi
- **Documentazione**: [Jekyll Docs](https://jekyllrb.com/docs/) | [Decap CMS Docs](https://decapcms.org/docs/)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza della Fondazione Italiana per la Bioarchitettura®.

---

*Ultimo aggiornamento: Gennaio 2024*
