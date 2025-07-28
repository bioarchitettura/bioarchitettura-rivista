---
layout: default
title: "Archivio"
description: "Archivio storico e documentale della Fondazione Italiana per la Bioarchitettura, con documenti, studi e materiali di ricerca."
permalink: /archivio/
---

# Archivio Documentale

Benvenuti nell'archivio storico e documentale della Fondazione Italiana per la Bioarchitettura. Qui troverete una collezione di documenti, studi, ricerche e materiali storici che testimoniano l'evoluzione della bioarchitettura in Italia e nel mondo.

## Sezioni dell'Archivio

### Documenti Storici
{% for document in site.archivio %}
  {% if document.type == "documento-storico" %}
<article class="archive-item">
  <h3><a href="{{ document.url }}">{{ document.title }}</a></h3>
  <p class="archive-meta">
    {{ document.date | date: "%d %B %Y" }}
    {% if document.author %} - {{ document.author }}{% endif %}
  </p>
  <p>{{ document.description }}</p>
  <a href="{{ document.url }}" class="read-more">Consulta il documento →</a>
</article>
  {% endif %}
{% endfor %}

### Studi e Ricerche
{% for document in site.archivio %}
  {% if document.type == "ricerca" %}
<article class="archive-item">
  <h3><a href="{{ document.url }}">{{ document.title }}</a></h3>
  <p class="archive-meta">
    {{ document.date | date: "%d %B %Y" }}
    {% if document.author %} - {{ document.author }}{% endif %}
  </p>
  <p>{{ document.description }}</p>
  <a href="{{ document.url }}" class="read-more">Leggi la ricerca →</a>
</article>
  {% endif %}
{% endfor %}

### Materiali Didattici
{% for document in site.archivio %}
  {% if document.type == "materiale-didattico" %}
<article class="archive-item">
  <h3><a href="{{ document.url }}">{{ document.title }}</a></h3>
  <p class="archive-meta">
    {{ document.date | date: "%d %B %Y" }}
    {% if document.author %} - {{ document.author }}{% endif %}
  </p>
  <p>{{ document.description }}</p>
  <a href="{{ document.url }}" class="read-more">Accedi al materiale →</a>
</article>
  {% endif %}
{% endfor %}

## Come Consultare l'Archivio

L'archivio è organizzato per:
- **Tipologia**: Documenti storici, ricerche, materiali didattici
- **Cronologia**: Dal più recente al più datato
- **Argomento**: Utilizzate i tag per trovare contenuti specifici

## Contribuisci all'Archivio

Se possedete documenti, ricerche o materiali di interesse per la comunità della bioarchitettura, vi invitiamo a contattarci per valutarne l'inclusione nell'archivio.

**Contatti:**
- Email: [archivio@bioarchitettura.it](mailto:archivio@bioarchitettura.it)
- Telefono: +39 xxx xxx xxxx

## Utilizzo dei Materiali

I materiali presenti nell'archivio sono disponibili per:
- Ricerca scientifica e accademica
- Formazione professionale
- Divulgazione culturale

Per usi commerciali o pubblicazioni, è necessario richiedere preventivamente l'autorizzazione alla Fondazione.

---

*L'archivio della Fondazione Italiana per la Bioarchitettura è in continua crescita. Ultimo aggiornamento: {{ site.time | date: "%d %B %Y" }}*