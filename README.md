# Bioarchitettura Web

Sito web ufficiale della Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente.

## Descrizione

Questo sito è costruito con Jekyll e utilizza Decap CMS per la gestione dei contenuti. Include sezioni dedicate a:

- **Rivista - Articoli Acquistabili**: Contenuti premium della rivista BIOARCHITETTURA® disponibili per l'acquisto
- **Attività ed Eventi**: Workshop, corsi, seminari e conferenze organizzate dalla Fondazione

## Tecnologie Utilizzate

- **Jekyll**: Generatore di siti statici
- **GitHub Pages**: Hosting gratuito
- **Decap CMS**: Sistema di gestione contenuti per Jekyll
- **Minima Theme**: Tema base customizzato

## Struttura del Progetto

```
├── _config.yml                 # Configurazione Jekyll
├── _layouts/                   # Template delle pagine
│   ├── default.html
│   ├── rivista.html
│   └── attivita.html
├── _includes/                  # Componenti riutilizzabili
│   ├── header.html
│   └── footer.html
├── _rivista_acquistabili/      # Collezione articoli acquistabili
├── _attivita/                  # Collezione attività ed eventi
├── admin/                      # Interfaccia CMS
│   ├── config.yml
│   └── index.html
├── assets/                     # Risorse statiche
│   └── css/
├── rivista/acquistabili/       # Pagina indice articoli
└── attivita/                   # Pagina indice attività
```

## Gestione Contenuti

### Accesso al CMS

Il CMS è accessibile all'indirizzo `/admin/` del sito. Permette di:

- Creare e modificare articoli acquistabili della rivista
- Gestire eventi e attività
- Modificare le pagine principali del sito

### Articoli Acquistabili

Gli articoli della rivista sono gestiti come collezione Jekyll in `_rivista_acquistabili/`. Ogni articolo include:

- Metadati (titolo, autore, prezzo, categoria)
- Contenuto in Markdown
- Immagini e file PDF
- Sistema di tag e categorizzazione

### Attività ed Eventi

Le attività sono gestite nella collezione `_attivita/` e includono:

- Informazioni evento (data, luogo, durata)
- Dettagli iscrizione (prezzo, early bird, requisiti)
- Gestione galleria immagini
- Sistema di filtri per tipologia

## Sviluppo Locale

Per eseguire il sito localmente:

```bash
# Installa le dipendenze
bundle install

# Avvia il server di sviluppo
bundle exec jekyll serve

# Il sito sarà disponibile su http://localhost:4000
```

## Configurazione CMS

Il CMS è configurato in `admin/config.yml` e include:

- **Backend**: Git Gateway per l'autenticazione
- **Collezioni**: Rivista e Attività
- **Campi personalizzati**: Per ogni tipo di contenuto
- **Preview**: Anteprima in tempo reale delle modifiche

## Deployment

Il sito è automaticamente pubblicato su GitHub Pages ad ogni push sul branch principale. Le modifiche tramite CMS sono automaticamente committate nel repository.

## Funzionalità Principali

### Rivista - Articoli Acquistabili
- Visualizzazione griglia articoli con filtri
- Pagine dettaglio con sistema di acquisto
- Supporto per file PDF e gallery
- Integração pronta per sistemi di pagamento

### Attività ed Eventi
- Calendario eventi con filtri per tipologia
- Sistema di registrazione integrato
- Gestione early bird e promozioni
- Supporto per crediti formativi professionali

## Personalizzazione

Il design utilizza un tema personalizzato basato su Minima con:
- Colori corporate della Fondazione
- Layout responsive
- Componenti specifici per e-commerce e eventi
- Stili ottimizzati per contenuti didattici

## Supporto

Per assistenza tecnica o domande sul CMS, contattare il team di sviluppo.
