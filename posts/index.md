---
layout: default
title: "Articoli e News"
description: "Ultime notizie, eventi e aggiornamenti dal mondo della bioarchitettura."
permalink: /posts/
---

# Articoli e News

Resta aggiornato su eventi, corsi, novità normative e tutte le attività della Fondazione Italiana per la Bioarchitettura.

## Ultimi Articoli

{% for post in site.posts %}
<article class="article-preview">
  <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
  <p class="article-meta">
    Pubblicato il {{ post.date | date: "%d %B %Y" }}
    {% if post.author %} da {{ post.author }}{% endif %}
  </p>
  {% if post.excerpt %}
    <p>{{ post.excerpt }}</p>
  {% endif %}
  <a href="{{ post.url }}" class="read-more">Leggi tutto →</a>
</article>
{% endfor %}

{% if site.posts.size == 0 %}
<p>Non ci sono ancora articoli pubblicati. Controlla presto per aggiornamenti!</p>
{% endif %}

---

*Per rimanere sempre aggiornato, iscriviti alla nostra newsletter o seguici sui social media.*