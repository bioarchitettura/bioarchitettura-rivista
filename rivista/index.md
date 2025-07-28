---
layout: default
title: "Rivista Bioarchitettura"
description: "La prima rivista italiana dedicata all'architettura ecologica, offrendo ispirazione e informazioni per un abitare consapevole."
permalink: /rivista/
---

# Rivista BIOARCHITETTURA® ABITARE LA TERRA

La prima rivista italiana dedicata all'architettura ecologica, offrendo ispirazione e informazioni per un abitare consapevole.

## Ultimi Articoli

{% for article in site.rivista %}
<article class="article-preview">
  <h3><a href="{{ article.url }}">{{ article.title }}</a></h3>
  <p class="article-meta">
    Pubblicato il {{ article.date | date: "%d %B %Y" }}
    {% if article.author %} da {{ article.author }}{% endif %}
  </p>
  <p>{{ article.description }}</p>
  <a href="{{ article.url }}" class="read-more">Leggi l'articolo completo →</a>
</article>
{% endfor %}

## Archivio Completo

Esplora tutti i nostri articoli nell'[archivio completo](/archivio/) della rivista.

## Contribuisci alla Rivista

Sei interessato a contribuire alla rivista con i tuoi articoli? Contattaci all'indirizzo [redazione@bioarchitettura.it](mailto:redazione@bioarchitettura.it) per maggiori informazioni.

---

*La rivista BIOARCHITETTURA® ABITARE LA TERRA è una pubblicazione della Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente.*