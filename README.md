# web
@bioarchitettura web-project - 2025

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

## Deployment su GitHub Pages

Questo repository è configurato per il deployment automatico su GitHub Pages da due branch diversi:

### Branch Main
Il branch `main` viene deployato automaticamente utilizzando il sistema GitHub Pages integrato.

### Branch Rivista  
Il branch `rivista` viene deployato automaticamente alla branch `gh-pages` tramite GitHub Actions ogni volta che viene effettuato un push.

#### Abilitazione GitHub Pages nel Repository

Per abilitare GitHub Pages nel repository:

1. **Vai alle impostazioni del repository:**
   - Naviga su GitHub al repository `bioarchitettura/web`
   - Clicca su "Settings" nella barra superiore

2. **Configura GitHub Pages:**
   - Nella barra laterale sinistra, clicca su "Pages" sotto la sezione "Code and automation"
   - Nella sezione "Source", seleziona "Deploy from a branch"
   - Nel menu dropdown "Branch", seleziona `gh-pages`
   - Lascia la cartella su `/ (root)`
   - Clicca "Save"

3. **Verifica il deployment:**
   - Dopo alcuni minuti, il sito sarà disponibile all'indirizzo mostrato nella sezione Pages
   - Il badge di stato GitHub Actions mostrerà lo stato del deployment

#### Flusso di Lavoro Automatico

1. **Push al branch rivista:** Ogni modifica pushata al branch `rivista` attiva automaticamente il workflow
2. **Build:** Il sito Jekyll viene compilato nella cartella `_site`
3. **Deploy:** Il contenuto viene pubblicato nella branch `gh-pages`
4. **Pubblicazione:** GitHub Pages serve automaticamente il sito dalla branch `gh-pages`

#### Prerequisiti per il Deployment

Per il corretto funzionamento del workflow di deployment, il branch `rivista` deve contenere:
- Un file `Gemfile` con le dipendenze Jekyll (vedi esempio nel repository)
- La configurazione Jekyll (`_config.yml`)
- I file del sito nella struttura Jekyll appropriata

**Nota:** Se il Gemfile non è presente nel branch rivista, copiarlo da questo branch usando:
```bash
git checkout rivista
git checkout main -- Gemfile
git commit -m "Add Gemfile for Jekyll dependencies"
git push origin rivista
```

Il sito risultante sarà accessibile all'indirizzo configurato nelle impostazioni del repository.
