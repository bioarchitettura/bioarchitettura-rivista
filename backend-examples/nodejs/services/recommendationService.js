/**
 * Recommendation Service for Bioarchitettura Rivista
 * Provides intelligent article recommendations based on content similarity
 */

class RecommendationService {
  constructor() {
    this.categoryWeight = 2;
    this.tagWeight = 1;
    this.titleWeight = 1.5;
    this.contentWeight = 0.5;
  }

  /**
   * Get article recommendations based on current post
   * @param {Object} options - Recommendation options
   * @param {Object} options.currentPost - Current post data
   * @param {Array} options.allPosts - All available posts
   * @param {number} options.maxRecommendations - Maximum recommendations
   * @param {number} options.categoryWeight - Weight for category matching
   * @param {number} options.tagWeight - Weight for tag matching
   * @returns {Promise<Array>} Recommended articles
   */
  async getRecommendations({ 
    currentPost, 
    allPosts, 
    maxRecommendations = 3, 
    categoryWeight = 2, 
    tagWeight = 1 
  }) {
    try {
      if (!currentPost || !allPosts || allPosts.length === 0) {
        return [];
      }

      this.categoryWeight = categoryWeight;
      this.tagWeight = tagWeight;

      const currentCategory = currentPost.category?.toLowerCase();
      const currentTags = (currentPost.tags || []).map(tag => tag.toLowerCase());
      const currentUrl = currentPost.url;

      // Score each post
      const scoredPosts = allPosts
        .filter(post => post.url !== currentUrl) // Exclude current post
        .map(post => {
          const score = this.calculateSimilarityScore(currentPost, post);
          return { ...post, score };
        })
        .filter(post => post.score > 0) // Only posts with some relevance
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, maxRecommendations);

      return scoredPosts;

    } catch (error) {
      throw new Error(`Recommendation error: ${error.message}`);
    }
  }

  /**
   * Calculate similarity score between two posts
   * @param {Object} currentPost - Current post
   * @param {Object} candidatePost - Candidate post to compare
   * @returns {number} Similarity score
   */
  calculateSimilarityScore(currentPost, candidatePost) {
    let score = 0;

    // Category matching (weight: configurable, default 2)
    if (this.categoriesMatch(currentPost.category, candidatePost.category)) {
      score += this.categoryWeight;
    }

    // Tag matching (weight: configurable, default 1 per matching tag)
    const tagScore = this.calculateTagSimilarity(currentPost.tags, candidatePost.tags);
    score += tagScore * this.tagWeight;

    // Title similarity (weight: 1.5)
    const titleScore = this.calculateTextSimilarity(currentPost.title, candidatePost.title);
    score += titleScore * this.titleWeight;

    // Content similarity (weight: 0.5)
    if (currentPost.excerpt && candidatePost.excerpt) {
      const contentScore = this.calculateTextSimilarity(currentPost.excerpt, candidatePost.excerpt);
      score += contentScore * this.contentWeight;
    }

    // Recency boost (newer articles get slight preference)
    const recencyBoost = this.calculateRecencyBoost(candidatePost.date);
    score += recencyBoost;

    return score;
  }

  /**
   * Check if categories match
   * @param {string} category1 - First category
   * @param {string} category2 - Second category
   * @returns {boolean} Whether categories match
   */
  categoriesMatch(category1, category2) {
    if (!category1 || !category2) return false;
    return category1.toLowerCase() === category2.toLowerCase();
  }

  /**
   * Calculate tag similarity between two posts
   * @param {Array} tags1 - First set of tags
   * @param {Array} tags2 - Second set of tags
   * @returns {number} Tag similarity score
   */
  calculateTagSimilarity(tags1, tags2) {
    if (!tags1 || !tags2 || tags1.length === 0 || tags2.length === 0) {
      return 0;
    }

    const normalizedTags1 = tags1.map(tag => tag.toLowerCase());
    const normalizedTags2 = tags2.map(tag => tag.toLowerCase());

    const matchingTags = normalizedTags1.filter(tag => normalizedTags2.includes(tag));
    
    // Return number of matching tags
    return matchingTags.length;
  }

  /**
   * Calculate text similarity using simple word overlap
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Text similarity score (0-1)
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const words1 = this.extractWords(text1);
    const words2 = this.extractWords(text2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Extract meaningful words from text
   * @param {string} text - Text to process
   * @returns {Array} Array of words
   */
  extractWords(text) {
    const stopWords = new Set([
      'a', 'e', 'i', 'o', 'u', 'il', 'la', 'lo', 'le', 'gli', 'un', 'una', 'uno',
      'di', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'come', 'anche',
      'che', 'chi', 'cui', 'dove', 'quando', 'quanto', 'quale', 'come',
      'se', 'ma', 'però', 'quindi', 'allora', 'così', 'mentre', 'prima',
      'dopo', 'durante', 'senza', 'sopra', 'sotto', 'dentro', 'fuori',
      'essere', 'avere', 'fare', 'dire', 'andare', 'venire', 'sapere',
      'dare', 'stare', 'vedere', 'dovere', 'potere', 'volere',
      'questo', 'quello', 'stesso', 'altro', 'tutto', 'molto', 'poco',
      'più', 'meno', 'tanto', 'sempre', 'mai', 'già', 'ancora', 'poi',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.has(word));
  }

  /**
   * Calculate recency boost for newer articles
   * @param {string} dateString - Article date
   * @returns {number} Recency boost score
   */
  calculateRecencyBoost(dateString) {
    if (!dateString) return 0;

    try {
      const articleDate = new Date(dateString);
      const now = new Date();
      const daysDiff = (now - articleDate) / (1000 * 60 * 60 * 24);

      // Give small boost to articles from last 30 days
      if (daysDiff <= 30) {
        return 0.1 * (30 - daysDiff) / 30;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get recommendations by category
   * @param {string} category - Category to filter by
   * @param {Array} allPosts - All available posts
   * @param {number} maxRecommendations - Maximum recommendations
   * @returns {Array} Posts from the same category
   */
  getRecommendationsByCategory(category, allPosts, maxRecommendations = 5) {
    if (!category || !allPosts) return [];

    return allPosts
      .filter(post => this.categoriesMatch(post.category, category))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, maxRecommendations);
  }

  /**
   * Get recommendations by tags
   * @param {Array} tags - Tags to match
   * @param {Array} allPosts - All available posts
   * @param {number} maxRecommendations - Maximum recommendations
   * @returns {Array} Posts with matching tags
   */
  getRecommendationsByTags(tags, allPosts, maxRecommendations = 5) {
    if (!tags || tags.length === 0 || !allPosts) return [];

    const normalizedTags = tags.map(tag => tag.toLowerCase());

    return allPosts
      .map(post => {
        const tagScore = this.calculateTagSimilarity(tags, post.tags);
        return { ...post, tagScore };
      })
      .filter(post => post.tagScore > 0)
      .sort((a, b) => {
        if (a.tagScore !== b.tagScore) {
          return b.tagScore - a.tagScore;
        }
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, maxRecommendations);
  }

  /**
   * Get trending articles based on simple heuristics
   * @param {Array} allPosts - All available posts
   * @param {number} maxRecommendations - Maximum recommendations
   * @returns {Array} Trending posts
   */
  getTrendingArticles(allPosts, maxRecommendations = 5) {
    if (!allPosts) return [];

    // Simple trending algorithm: recent posts with many tags (indicating comprehensive content)
    return allPosts
      .map(post => {
        const recencyScore = this.calculateRecencyBoost(post.date) * 10;
        const tagScore = (post.tags || []).length * 0.1;
        const readingTimeScore = (post.reading_time || 5) > 10 ? 0.2 : 0;
        
        return {
          ...post,
          trendingScore: recencyScore + tagScore + readingTimeScore
        };
      })
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, maxRecommendations);
  }

  /**
   * Get diverse recommendations to avoid echo chamber effect
   * @param {Object} currentPost - Current post
   * @param {Array} allPosts - All available posts
   * @param {number} maxRecommendations - Maximum recommendations
   * @returns {Array} Diverse recommendations
   */
  getDiverseRecommendations(currentPost, allPosts, maxRecommendations = 5) {
    if (!currentPost || !allPosts) return [];

    const recommendations = [];
    const usedCategories = new Set();
    const currentCategory = currentPost.category?.toLowerCase();

    // Add current category to used set
    if (currentCategory) {
      usedCategories.add(currentCategory);
    }

    // Get one article from each different category
    for (const post of allPosts) {
      if (post.url === currentPost.url) continue;
      
      const postCategory = post.category?.toLowerCase();
      
      if (postCategory && !usedCategories.has(postCategory)) {
        recommendations.push(post);
        usedCategories.add(postCategory);
        
        if (recommendations.length >= maxRecommendations) break;
      }
    }

    // Fill remaining slots with regular recommendations if needed
    if (recommendations.length < maxRecommendations) {
      const regularRecs = this.getRecommendations({
        currentPost,
        allPosts,
        maxRecommendations: maxRecommendations - recommendations.length
      });

      for (const rec of regularRecs) {
        if (!recommendations.find(r => r.url === rec.url)) {
          recommendations.push(rec);
        }
      }
    }

    return recommendations.slice(0, maxRecommendations);
  }
}

module.exports = new RecommendationService();