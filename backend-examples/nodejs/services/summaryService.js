/**
 * Summary Service for Bioarchitettura Rivista
 * Provides extractive summarization and content analysis as fallback to OpenAI
 */

const natural = require('natural');
const compromise = require('compromise');
const sentiment = require('sentiment');
const MarkdownIt = require('markdown-it');
const { JSDOM } = require('jsdom');

const md = new MarkdownIt();

class SummaryService {
  constructor() {
    this.stopWords = new Set([
      'a', 'e', 'i', 'o', 'u', 'il', 'la', 'lo', 'le', 'gli', 'un', 'una', 'uno',
      'di', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'come', 'anche',
      'che', 'chi', 'cui', 'dove', 'quando', 'quanto', 'quale', 'come',
      'se', 'ma', 'però', 'quindi', 'allora', 'così', 'mentre', 'prima',
      'dopo', 'durante', 'senza', 'sopra', 'sotto', 'dentro', 'fuori',
      'essere', 'avere', 'fare', 'dire', 'andare', 'venire', 'sapere',
      'dare', 'stare', 'vedere', 'dovere', 'potere', 'volere',
      'questo', 'quello', 'stesso', 'altro', 'tutto', 'molto', 'poco',
      'più', 'meno', 'tanto', 'sempre', 'mai', 'già', 'ancora', 'poi'
    ]);

    this.bioarchKeywords = new Set([
      'bioarchitettura', 'sostenibile', 'sostenibilità', 'ecologico', 'ecologia',
      'naturale', 'biologico', 'bio', 'verde', 'ambiente', 'ambientale',
      'efficienza', 'energetica', 'energia', 'rinnovabile', 'passiva', 'passivo',
      'materiali', 'legno', 'paglia', 'terra', 'canapa', 'sughero',
      'isolamento', 'isolante', 'termico', 'acustico', 'traspirante',
      'costruzione', 'edificio', 'casa', 'abitazione', 'architettura',
      'progettazione', 'progetto', 'design', 'innovativo', 'tecnologia',
      'benessere', 'salute', 'comfort', 'qualità', 'aria', 'indoor',
      'climatizzazione', 'ventilazione', 'illuminazione', 'naturale',
      'riscaldamento', 'raffrescamento', 'solare', 'fotovoltaico',
      'geotermico', 'biomassa', 'certificazione', 'leed', 'breeam',
      'casaclima', 'minergie', 'passivhaus', 'nzeb', 'lca'
    ]);
  }

  /**
   * Generate extractive summary using natural language processing
   * @param {Object} options - Summarization options
   * @param {string} options.content - Content to summarize
   * @param {string} options.title - Optional title
   * @param {number} options.maxSentences - Maximum sentences in summary
   * @returns {Promise<Object>} Summary result
   */
  async extractiveSummary({ content, title = '', maxSentences = 3 }) {
    try {
      // Clean and preprocess content
      const cleanContent = this.cleanContent(content);
      
      if (cleanContent.length < 100) {
        throw new Error('Content too short for summarization');
      }

      // Split into sentences
      const sentences = this.splitIntoSentences(cleanContent);
      
      if (sentences.length <= maxSentences) {
        return {
          summary: sentences.join(' '),
          method: 'Extractive (All Sentences)',
          originalSentences: sentences.length,
          selectedSentences: sentences.length,
          keywords: this.extractKeywords(cleanContent, title),
          stats: this.calculateStats(cleanContent, sentences.join(' '))
        };
      }

      // Extract keywords for scoring
      const keywords = this.extractKeywords(cleanContent, title);
      
      // Score sentences
      const scoredSentences = this.scoreSentences(sentences, keywords, title);
      
      // Select best sentences
      const selectedSentences = this.selectBestSentences(scoredSentences, maxSentences);
      
      const summary = selectedSentences.map(s => s.text).join(' ');
      
      return {
        summary,
        method: 'Extractive Algorithm',
        originalSentences: sentences.length,
        selectedSentences: selectedSentences.length,
        keywords: keywords.slice(0, 10), // Top 10 keywords
        stats: this.calculateStats(cleanContent, summary),
        sentenceScores: selectedSentences.map(s => ({
          text: s.text.substring(0, 100) + '...',
          score: s.score.toFixed(3)
        }))
      };

    } catch (error) {
      throw new Error(`Extractive summarization error: ${error.message}`);
    }
  }

  /**
   * Analyze content for various metrics
   * @param {Object} options - Analysis options
   * @param {string} options.content - Content to analyze
   * @param {boolean} options.includeKeywords - Include keyword analysis
   * @param {boolean} options.includeSentiment - Include sentiment analysis
   * @param {boolean} options.includeReadability - Include readability metrics
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeContent({ content, includeKeywords = true, includeSentiment = true, includeReadability = true }) {
    try {
      const cleanContent = this.cleanContent(content);
      const analysis = {
        wordCount: this.countWords(cleanContent),
        sentenceCount: this.splitIntoSentences(cleanContent).length,
        averageWordsPerSentence: 0,
        timestamp: new Date().toISOString()
      };

      analysis.averageWordsPerSentence = Math.round(analysis.wordCount / analysis.sentenceCount);

      if (includeKeywords) {
        analysis.keywords = this.extractKeywords(cleanContent);
        analysis.bioarchKeywords = analysis.keywords.filter(kw => this.bioarchKeywords.has(kw.word.toLowerCase()));
      }

      if (includeSentiment) {
        analysis.sentiment = this.analyzeSentiment(cleanContent);
      }

      if (includeReadability) {
        analysis.readability = this.calculateReadability(cleanContent);
      }

      return analysis;

    } catch (error) {
      throw new Error(`Content analysis error: ${error.message}`);
    }
  }

  /**
   * Clean and preprocess content
   * @param {string} content - Raw content
   * @returns {string} Cleaned content
   */
  cleanContent(content) {
    // Handle markdown
    if (content.includes('```') || content.includes('##')) {
      content = md.render(content);
    }

    // Remove HTML tags
    const dom = new JSDOM(content);
    const textContent = dom.window.document.body?.textContent || content;

    // Clean up text
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:-]/g, '')
      .trim();
  }

  /**
   * Split text into sentences
   * @param {string} text - Text to split
   * @returns {Array} Array of sentences
   */
  splitIntoSentences(text) {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length >= 20 && s.length <= 300)
      .map(s => s.endsWith('.') || s.endsWith('!') || s.endsWith('?') ? s : s + '.');
  }

  /**
   * Extract keywords from text
   * @param {string} content - Text content
   * @param {string} title - Optional title
   * @returns {Array} Keywords with scores
   */
  extractKeywords(content, title = '') {
    const allText = (title + ' ' + content).toLowerCase();
    
    // Tokenize
    const words = allText
      .split(/\W+/)
      .filter(word => word.length >= 3)
      .filter(word => !this.stopWords.has(word));

    // Count frequencies
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Score words
    const scoredWords = Object.entries(wordFreq).map(([word, freq]) => {
      let score = freq;

      // Boost bioarchitecture-related terms
      if (this.bioarchKeywords.has(word)) {
        score *= 2;
      }

      // Boost title words
      if (title.toLowerCase().includes(word)) {
        score *= 1.5;
      }

      return { word, score, frequency: freq };
    });

    // Return top keywords
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }

  /**
   * Score sentences for importance
   * @param {Array} sentences - Array of sentences
   * @param {Array} keywords - Keywords with scores
   * @param {string} title - Article title
   * @returns {Array} Scored sentences
   */
  scoreSentences(sentences, keywords, title = '') {
    const keywordMap = new Map(keywords.map(k => [k.word.toLowerCase(), k.score]));
    
    return sentences.map((sentence, index) => {
      let score = 0;
      const sentenceLower = sentence.toLowerCase();
      const words = sentenceLower.split(/\W+/).filter(w => w.length >= 3);

      // Position scoring (first and last sentences get higher scores)
      if (index === 0) score += 0.8;
      else if (index === sentences.length - 1) score += 0.3;
      else if (index <= 2) score += 0.5;

      // Length scoring (prefer medium-length sentences)
      const idealLength = 120;
      const lengthScore = 1 - Math.abs(sentence.length - idealLength) / idealLength;
      score += Math.max(0, lengthScore) * 0.3;

      // Keyword density scoring
      let keywordScore = 0;
      words.forEach(word => {
        if (keywordMap.has(word)) {
          keywordScore += keywordMap.get(word);
        }
      });
      score += (keywordScore / words.length) * 1.5;

      // Bioarchitecture relevance scoring
      let bioarchMatches = 0;
      this.bioarchKeywords.forEach(keyword => {
        if (sentenceLower.includes(keyword)) {
          bioarchMatches++;
        }
      });
      score += (bioarchMatches / words.length) * 2;

      // Title similarity scoring
      if (title) {
        const titleWords = title.toLowerCase().split(/\W+/);
        const titleMatches = titleWords.filter(word => 
          word.length >= 3 && sentenceLower.includes(word)
        ).length;
        score += (titleMatches / titleWords.length) * 0.7;
      }

      // Penalize sentences with too many numbers or very short/long sentences
      const numberCount = (sentence.match(/\d+/g) || []).length;
      const shortWordCount = words.filter(w => w.length <= 3).length;

      score -= (numberCount / words.length) * 0.2;
      score -= (shortWordCount / words.length) * 0.1;

      return {
        text: sentence,
        score: Math.max(0, score),
        index,
        length: sentence.length
      };
    });
  }

  /**
   * Select best sentences for summary
   * @param {Array} scoredSentences - Sentences with scores
   * @param {number} maxSentences - Maximum sentences to select
   * @returns {Array} Selected sentences
   */
  selectBestSentences(scoredSentences, maxSentences) {
    // Sort by score and select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSentences);

    // Re-sort by original order to maintain flow
    return topSentences.sort((a, b) => a.index - b.index);
  }

  /**
   * Calculate statistics for content and summary
   * @param {string} original - Original content
   * @param {string} summary - Summary content
   * @returns {Object} Statistics
   */
  calculateStats(original, summary) {
    const originalLength = original.length;
    const summaryLength = summary.length;
    const compressionRatio = ((1 - summaryLength / originalLength) * 100);
    
    return {
      originalLength,
      summaryLength,
      compressionRatio: Math.round(compressionRatio * 10) / 10,
      originalWords: this.countWords(original),
      summaryWords: this.countWords(summary)
    };
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  countWords(text) {
    return text.split(/\W+/).filter(word => word.length > 0).length;
  }

  /**
   * Analyze sentiment of text
   * @param {string} text - Text to analyze
   * @returns {Object} Sentiment analysis
   */
  analyzeSentiment(text) {
    const result = sentiment(text);
    
    let classification = 'neutral';
    if (result.score > 2) classification = 'positive';
    else if (result.score < -2) classification = 'negative';
    
    return {
      score: result.score,
      comparative: result.comparative,
      classification,
      positive: result.positive,
      negative: result.negative
    };
  }

  /**
   * Calculate readability metrics
   * @param {string} text - Text to analyze
   * @returns {Object} Readability metrics
   */
  calculateReadability(text) {
    const sentences = this.splitIntoSentences(text);
    const words = text.split(/\W+/).filter(w => w.length > 0);
    const complexWords = words.filter(w => w.length > 6);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const complexWordRatio = complexWords.length / words.length;
    
    // Simple readability score (0-100, higher is easier)
    const readabilityScore = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 2) - (complexWordRatio * 100)
    ));
    
    let level = 'difficile';
    if (readabilityScore > 70) level = 'facile';
    else if (readabilityScore > 50) level = 'medio';
    
    return {
      score: Math.round(readabilityScore),
      level,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      complexWordRatio: Math.round(complexWordRatio * 100),
      totalWords: words.length,
      totalSentences: sentences.length
    };
  }
}

module.exports = new SummaryService();