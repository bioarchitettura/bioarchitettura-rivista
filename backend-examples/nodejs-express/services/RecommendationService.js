/**
 * AI-Powered Recommendation Service
 * Handles article recommendations with AI and fallback strategies
 */

const { Configuration, OpenAIApi } = require('openai');
const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');
const logger = require('../utils/logger');

class RecommendationService {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.openai = new OpenAIApi(configuration);
    }

    this.articles = this.loadArticles();
    this.categoryWeights = {
      'materiali-naturali': 1.0,
      'efficienza-energetica': 1.0,
      'casa-passiva': 1.0,
      'certificazioni': 1.0,
      'innovazione': 1.0,
      'ricerca': 1.0,
      'architettura-sostenibile': 1.0
    };

    this.sentimentAnalyzer = new sentiment();
    this.stemmer = natural.PorterStemmerIt; // Italian stemmer
  }

  /**
   * Load articles (in production, this would come from database)
   */
  loadArticles() {
    return [
      {
        title: "Materiali Naturali in Bioarchitettura: Guida Completa 2024",
        url: "/2024/01/10/materiali-naturali-bioarchitettura-guida-completa.html",
        excerpt: "Alla scoperta dei materiali naturali per la bioarchitettura: proprietà, vantaggi e applicazioni pratiche per costruire in armonia con l'ambiente.",
        category: "Materiali Naturali",
        tags: ["materiali naturali", "legno", "paglia", "terra cruda", "canapa", "sughero", "sostenibilità"],
        reading_time: 12,
        featured: true,
        date: "2024-01-10"
      },
      {
        title: "Efficienza Energetica negli Edifici: Strategie e Tecnologie Innovative",
        url: "/2024/01/05/efficienza-energetica-edifici-strategie-tecnologie.html",
        excerpt: "Strategie avanzate e tecnologie innovative per massimizzare l'efficienza energetica degli edifici: dalla progettazione bioclimatica agli impianti intelligenti.",
        category: "Efficienza Energetica",
        tags: ["efficienza energetica", "impianti", "isolamento", "smart building", "automazione"],
        reading_time: 10,
        featured: true,
        date: "2024-01-05"
      },
      {
        title: "Casa Passiva: Il Futuro dell'Abitare Sostenibile",
        url: "/2024/01/15/casa-passiva-futuro-abitare-sostenibile.html",
        excerpt: "Standard Passivhaus e tecnologie per case ad altissima efficienza energetica: comfort ottimale con consumi minimi.",
        category: "Casa Passiva",
        tags: ["casa passiva", "passivhaus", "comfort", "ventilazione", "isolamento"],
        reading_time: 14,
        featured: true,
        date: "2024-01-15"
      },
      {
        title: "Certificazioni Green Building: LEED, BREEAM e CasaClima a Confronto",
        url: "/2024/02/20/certificazioni-green-building-leed-breeam-casaclima.html",
        excerpt: "Analisi completa delle principali certificazioni per l'edilizia sostenibile: criteri, vantaggi e come scegliere la certificazione più adatta al tuo progetto.",
        category: "Certificazioni",
        tags: ["certificazioni", "LEED", "BREEAM", "CasaClima", "green building", "sostenibilità", "valutazione"],
        reading_time: 15,
        featured: true,
        date: "2024-02-20"
      },
      {
        title: "Innovazioni Tecnologiche in Bioarchitettura: Dalle Stampanti 3D ai Materiali Intelligenti",
        url: "/2024/03/15/innovazioni-tecnologiche-bioarchitettura-stampa-3d-materiali-intelligenti.html",
        excerpt: "Esplora le tecnologie rivoluzionarie che stanno trasformando la bioarchitettura: dalla stampa 3D con materiali naturali all'intelligenza artificiale per l'ottimizzazione energetica.",
        category: "Innovazione",
        tags: ["innovazione", "tecnologia", "stampa 3D", "materiali intelligenti", "IoT", "AI", "robotica", "futuro"],
        reading_time: 18,
        featured: true,
        date: "2024-03-15"
      },
      {
        title: "Ricerca e Sviluppo in Bioarchitettura: I Progetti Pionieristici che Cambieranno il Settore",
        url: "/2024/04/10/ricerca-sviluppo-bioarchitettura-progetti-pionieristici.html",
        excerpt: "Uno sguardo esclusivo sui progetti di ricerca più avanzati in bioarchitettura: dalle università europee ai laboratori corporate, le scoperte che definiranno il futuro del costruire sostenibile.",
        category: "Ricerca",
        tags: ["ricerca", "sviluppo", "università", "progetti pilota", "laboratori", "futuro", "sostenibilità", "innovazione"],
        reading_time: 20,
        featured: true,
        date: "2024-04-10"
      }
    ];
  }

  /**
   * Generate AI-powered recommendations
   */
  async generateRecommendations(params) {
    const { userPreferences, readingHistory, currentContext, maxResults } = params;

    try {
      // Try AI-powered recommendations first
      if (this.openai) {
        const aiRecommendations = await this.generateAIRecommendations(params);
        if (aiRecommendations && aiRecommendations.length > 0) {
          return {
            ...aiRecommendations,
            method: 'ai',
            fallbackUsed: false
          };
        }
      }

      // Fallback to rule-based recommendations
      const fallbackRecommendations = await this.generateFallbackRecommendations(params);
      return {
        ...fallbackRecommendations,
        method: 'fallback',
        fallbackUsed: true
      };

    } catch (error) {
      logger.error('Recommendation generation failed', { error: error.message });
      
      // Emergency fallback
      const emergencyRecommendations = this.getPopularArticles(maxResults);
      return {
        recommendations: emergencyRecommendations,
        method: 'emergency',
        fallbackUsed: true,
        confidence: 0.3
      };
    }
  }

  /**
   * Generate AI-powered recommendations using OpenAI
   */
  async generateAIRecommendations(params) {
    const { userPreferences, readingHistory, currentContext, maxResults } = params;

    const prompt = this.buildAIPrompt(userPreferences, readingHistory, currentContext);

    try {
      const completion = await this.openai.createChatCompletion({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in sustainable architecture and bioarchitettura. Recommend articles based on user preferences and context. Respond with JSON containing recommended article URLs in order of relevance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const response = completion.data.choices[0].message.content;
      const recommendations = this.parseAIResponse(response, maxResults);

      return {
        recommendations,
        confidence: 0.9,
        processingTime: Date.now()
      };

    } catch (error) {
      logger.error('OpenAI recommendation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Build prompt for AI recommendations
   */
  buildAIPrompt(userPreferences, readingHistory, currentContext) {
    let prompt = 'Recommend bioarchitettura articles based on:\n\n';

    if (currentContext.pageType) {
      prompt += `Current page type: ${currentContext.pageType}\n`;
    }

    if (currentContext.category) {
      prompt += `Current category: ${currentContext.category}\n`;
    }

    if (currentContext.tags && currentContext.tags.length > 0) {
      prompt += `Current tags: ${currentContext.tags.join(', ')}\n`;
    }

    if (userPreferences.categories && Object.keys(userPreferences.categories).length > 0) {
      prompt += `User category preferences: ${JSON.stringify(userPreferences.categories)}\n`;
    }

    if (readingHistory.length > 0) {
      const recentArticles = readingHistory.slice(0, 3).map(h => h.title || h.url);
      prompt += `Recent reading history: ${recentArticles.join(', ')}\n`;
    }

    prompt += '\nAvailable articles:\n';
    this.articles.forEach((article, index) => {
      prompt += `${index + 1}. "${article.title}" - ${article.category} - ${article.url}\n`;
    });

    prompt += `\nRecommend the ${Math.min(3, this.articles.length)} most relevant articles. Consider topic relevance, user interests, and content diversity.`;

    return prompt;
  }

  /**
   * Parse AI response and match to articles
   */
  parseAIResponse(response, maxResults) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      if (parsed.recommendations) {
        return this.matchRecommendations(parsed.recommendations, maxResults);
      }
    } catch (e) {
      // Fallback: extract URLs from text
      const urlPattern = /\/\d{4}\/\d{2}\/\d{2}\/[^\s"]+/g;
      const urls = response.match(urlPattern) || [];
      return this.matchRecommendations(urls, maxResults);
    }

    return [];
  }

  /**
   * Match recommended URLs to article objects
   */
  matchRecommendations(recommendations, maxResults) {
    const matched = [];
    
    for (const rec of recommendations.slice(0, maxResults)) {
      const url = typeof rec === 'string' ? rec : rec.url;
      const article = this.articles.find(a => a.url === url || a.url.includes(url));
      
      if (article) {
        matched.push({
          ...article,
          score: typeof rec === 'object' ? rec.score : 0.8,
          confidence: typeof rec === 'object' ? rec.confidence : 0.8
        });
      }
    }

    return matched;
  }

  /**
   * Generate fallback recommendations using rule-based approach
   */
  async generateFallbackRecommendations(params) {
    const { userPreferences, readingHistory, currentContext, maxResults } = params;

    const scoredArticles = this.articles.map(article => ({
      ...article,
      score: this.calculateRecommendationScore(article, userPreferences, readingHistory, currentContext)
    }));

    // Sort by score and return top results
    const recommendations = scoredArticles
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(article => ({
        ...article,
        confidence: Math.min(0.9, article.score / 10) // Normalize confidence
      }));

    return {
      recommendations,
      confidence: 0.7,
      processingTime: 50 // Simulated processing time
    };
  }

  /**
   * Calculate recommendation score for fallback system
   */
  calculateRecommendationScore(article, userPreferences, readingHistory, currentContext) {
    let score = 0;

    // Category preference scoring
    const categoryWeight = this.categoryWeights[article.category.toLowerCase().replace(/\s+/g, '-')] || 1.0;
    const userCategoryWeight = userPreferences.categories?.[article.category] || 0;
    score += (categoryWeight + userCategoryWeight) * 2;

    // Tag relevance scoring
    if (article.tags && userPreferences.tags) {
      article.tags.forEach(tag => {
        const userTagWeight = userPreferences.tags[tag] || 0;
        score += userTagWeight * 1.5;
      });
    }

    // Current context relevance
    if (currentContext.category === article.category) {
      score += 3;
    }

    if (currentContext.tags) {
      const commonTags = article.tags.filter(tag => 
        currentContext.tags.some(ctag => ctag.toLowerCase().includes(tag.toLowerCase()))
      );
      score += commonTags.length * 1;
    }

    // Reading time preference
    const preferredReadingTime = userPreferences.averageReadingTime || 12;
    const readingTimeDiff = Math.abs(article.reading_time - preferredReadingTime);
    score += Math.max(0, 5 - readingTimeDiff * 0.5);

    // Featured articles get boost
    if (article.featured) {
      score += 2;
    }

    // Recency boost
    const daysSincePublished = (Date.now() - new Date(article.date)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSincePublished) * 0.1;

    // Avoid recently read articles
    const wasRecentlyRead = readingHistory.some(h => 
      h.url === article.url || h.title === article.title
    );
    if (wasRecentlyRead) {
      score *= 0.3; // Significantly reduce score for recently read articles
    }

    return score;
  }

  /**
   * Get popular articles as emergency fallback
   */
  getPopularArticles(maxResults) {
    return this.articles
      .filter(article => article.featured)
      .slice(0, maxResults)
      .map(article => ({
        ...article,
        score: 0.5,
        confidence: 0.3
      }));
  }

  /**
   * Submit feedback for recommendation quality
   */
  async submitFeedback(feedbackData) {
    // In production, this would save to database
    logger.info('Recommendation feedback received', feedbackData);
    
    // Could implement ML model retraining based on feedback
    return true;
  }

  /**
   * Get recommendation system statistics
   */
  async getStats() {
    // In production, this would query actual database
    return {
      totalRecommendations: 1250,
      averageRating: 3.2,
      aiSuccessRate: 0.85,
      fallbackUsageRate: 0.15,
      topCategories: [
        { category: 'Materiali Naturali', count: 320 },
        { category: 'Efficienza Energetica', count: 280 },
        { category: 'Casa Passiva', count: 250 }
      ]
    };
  }
}

module.exports = new RecommendationService();