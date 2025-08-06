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

## Deployment Automatico con GitHub Actions

Questo repository utilizza GitHub Actions per il deployment automatico su GitHub Pages con due flussi di lavoro separati:

### Workflow Principal (Branch `main`)
- **File**: `.github/workflows/jekyll-gh-pages.yml`
- **Trigger**: Push al branch `main`
- **Destinazione**: GitHub Pages (usando l'ambiente github-pages standard)
- **Tipo**: Sito Jekyll completo

### Workflow Rivista (Branch `rivista`)
- **File**: `.github/workflows/deploy-rivista.yml`
- **Trigger**: Push al branch `rivista`
- **Destinazione**: Branch `gh-pages` 
- **Tipo**: Sito statico HTML/JS (con supporto Jekyll opzionale)

### Configurazione dei Workflow

#### Requisiti Generali
Per entrambi i workflow è necessario:

1. **Permessi del Repository**: Il repository deve avere i GitHub Actions abilitati
2. **Permessi GitHub Pages**: Nelle impostazioni del repository (`Settings > Pages`), configurare:
   - Source: "Deploy from a branch" 
   - Branch: `gh-pages` per il workflow rivista
3. **Permessi del Token**: I workflow utilizzano `GITHUB_TOKEN` con i seguenti permessi:
   - `contents: read` - per leggere il codice del repository
   - `pages: write` - per scrivere su GitHub Pages
   - `id-token: write` - per l'autenticazione
   - `actions: read` - per accedere agli artifacts

#### Configurazione Specifica del Workflow Rivista

Il workflow `deploy-rivista.yml` è progettato per essere robusto e adattivo:

1. **Rilevamento Automatico del Tipo di Sito**:
   - Se esiste la cartella `public/`: utilizza il contenuto come sito statico
   - Se esiste la cartella `dist/`: utilizza il contenuto come sito compilato
   - Se esiste `_config.yml`: tenta di compilare come sito Jekyll
   - Altrimenti: usa la directory root come sito statico

2. **Gestione degli Errori**:
   - Se la compilazione Jekyll fallisce, esegue il fallback al deployment statico
   - Crea automaticamente il branch `gh-pages` se non esiste
   - Gestisce repository senza dipendenze Ruby/Jekyll

3. **Sicurezza e Isolamento**:
   - Usa un gruppo di concorrenza separato (`pages-rivista`) per evitare conflitti con il workflow main
   - Non interferisce con il deployment del branch main

### Setup e Risoluzione Problemi

#### Setup Iniziale

1. **Verificare i Permessi**:
   ```bash
   # Verificare che GitHub Actions sia abilitato nel repository
   # Andare su: Settings > Actions > General > Actions permissions
   ```

2. **Configurare GitHub Pages**:
   ```bash
   # Andare su: Settings > Pages
   # Source: Deploy from a branch
   # Branch: gh-pages / (root) per il workflow rivista
   ```

3. **Testare il Deployment**:
   ```bash
   git checkout rivista
   git push origin rivista
   # Controllare la tab "Actions" per vedere l'esecuzione del workflow
   ```

#### Troubleshooting Comune

##### Errore: "Permission denied" durante il deployment
**Causa**: Permessi insufficienti del GITHUB_TOKEN
**Soluzione**: 
1. Verificare che il repository abbia i GitHub Actions abilitati
2. Controllare Settings > Actions > General > Workflow permissions
3. Assicurarsi che sia selezionato "Read and write permissions"

##### Errore: "Branch gh-pages not found"
**Causa**: Il branch gh-pages non esiste ancora
**Soluzione**: Il workflow crea automaticamente il branch, ma se ci sono problemi:
```bash
git checkout --orphan gh-pages
git rm -rf .
echo "<h1>GitHub Pages</h1>" > index.html
git add index.html
git commit -m "Initial gh-pages branch"
git push -u origin gh-pages
```

##### Errore: "Jekyll build failed"
**Causa**: Dipendenze Ruby mancanti o configurazione Jekyll errata
**Soluzione**: Il workflow ha un fallback automatico al deployment statico, ma per debugging:
1. Controllare che `_config.yml` sia valido
2. Verificare la presenza di `Gemfile` se necessario
3. Il workflow continuerà comunque con il deployment statico

##### Sito non aggiornato dopo il deployment
**Causa**: Cache del browser o problemi di propagazione GitHub Pages
**Soluzione**:
1. Attendere 5-10 minuti per la propagazione
2. Pulire la cache del browser (Ctrl+F5)
3. Verificare che il commit sia presente nel branch gh-pages

##### Conflitti tra workflow main e rivista
**Causa**: Entrambi i workflow tentano di usare lo stesso ambiente GitHub Pages
**Soluzione**: I workflow sono configurati con gruppi di concorrenza separati (`pages` vs `pages-rivista`), ma se ci sono problemi:
1. Verificare che il workflow main usi l'ambiente "github-pages" standard
2. Verificare che il workflow rivista usi l'ambiente "github-pages-rivista"

#### Monitoraggio e Debug

1. **Controllare i Log del Workflow**:
   - Andare nella tab "Actions" del repository
   - Selezionare l'esecuzione del workflow
   - Espandere i passaggi per vedere i log dettagliati

2. **Verificare il Contenuto Deployato**:
   ```bash
   git checkout gh-pages
   ls -la  # Verificare che i file siano presenti
   ```

3. **Testare Localmente** (per debugging):
   ```bash
   # Per siti statici
   cd public && python -m http.server 8000
   
   # Per siti Jekyll
   bundle exec jekyll serve
   ```

#### File e Directory Importanti

- `.github/workflows/deploy-rivista.yml`: Configurazione del workflow rivista
- `.github/workflows/jekyll-gh-pages.yml`: Configurazione del workflow main
- `public/`: Directory contenente il sito statico (rivista branch)
- `_config.yml`: Configurazione Jekyll (se presente)
- `gh-pages` branch: Branch di destinazione per il deployment rivista
