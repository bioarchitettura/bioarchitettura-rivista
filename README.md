# web
@bioarchitettura web-project - 2025

## Foundational Principles

This project is anchored by the [EUYSTACIO-GRAL Declaration](EUYSTACIO-GRAL.md), which establishes our cosmic origin story, founding principles, and commitments to open source, unity, forgiveness, and preservation of consciousness in all its forms. This declaration serves as a beacon for all contributors and resonators working within this ecosystem.

## Gestione Contenuti con Netlify CMS

Questo sito è dotato di un sistema di gestione contenuti (CMS) basato su Netlify CMS che permette di modificare facilmente pagine e articoli tramite un'interfaccia web user-friendly.

### Accesso al CMS

#### Opzione 1: Tramite Netlify (Consigliato)
Se il sito è deployato su Netlify:
1. Visita `https://yourdomain.netlify.app/admin/`
2. Effettua il login con il tuo account GitHub
3. Inizia a gestire i contenuti

#### Opzione 2: Sviluppo Locale
Per utilizzare il CMS in locale durante lo sviluppo:

1. **Installa e avvia Jekyll:**
   ```bash
   bundle install
   bundle exec jekyll serve
   ```

2. **Installa netlify-cms-proxy-server:**
   ```bash
   npm install -g netlify-cms-proxy-server
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

5. **Accedi al CMS:**
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
