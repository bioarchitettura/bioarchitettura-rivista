/**
 * AI-Powered Summarization Route
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const SummaryService = require('../services/SummaryService');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/summary
 * Generate AI-powered article summary with extractive fallback
 */
router.post('/', [
  body('content').isString().isLength({ min: 100, max: 50000 }).withMessage('Content must be between 100 and 50000 characters'),
  body('title').optional().isString().isLength({ max: 200 }).withMessage('Title too long'),
  body('language').optional().isIn(['it', 'en', 'de', 'fr']).withMessage('Unsupported language'),
  body('maxLength').optional().isInt({ min: 50, max: 500 }).withMessage('maxLength must be between 50 and 500'),
  body('style').optional().isIn(['professional', 'conversational', 'academic', 'simplified']).withMessage('Invalid style'),
  body('useAI').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const {
    content,
    title,
    language = 'it',
    maxLength = 200,
    style = 'professional',
    useAI = true
  } = req.body;

  const startTime = Date.now();

  try {
    const result = await SummaryService.generateSummary({
      content,
      title,
      language,
      maxLength,
      style,
      useAI
    });

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      summary: result.summary,
      metadata: {
        method: result.method,
        confidence: result.confidence,
        processingTime,
        wordCount: {
          original: content.split(/\s+/).length,
          summary: result.summary.split(/\s+/).length
        },
        compressionRatio: Math.round((1 - result.summary.split(/\s+/).length / content.split(/\s+/).length) * 100),
        qualityMetrics: result.qualityMetrics || null
      },
      timestamp: new Date().toISOString()
    });

    // Log summary generation for analytics
    logger.info('Summary generated', {
      method: result.method,
      language,
      style,
      processingTime,
      originalLength: content.length,
      summaryLength: result.summary.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

  } catch (error) {
    logger.error('Summary generation failed', {
      error: error.message,
      stack: error.stack,
      contentLength: content.length,
      language,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to generate summary',
      message: 'An error occurred while processing your request',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * POST /api/summary/feedback
 * Submit feedback for summary quality
 */
router.post('/feedback', [
  body('rating').isInt({ min: 1, max: 4 }).withMessage('Rating must be between 1 and 4'),
  body('summary').isString().withMessage('Summary is required'),
  body('method').isIn(['ai', 'extractive']).withMessage('Invalid method'),
  body('articleUrl').optional().isURL().withMessage('Invalid URL'),
  body('comment').optional().isString().isLength({ max: 500 }).withMessage('Comment too long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { rating, summary, method, articleUrl, comment } = req.body;

  try {
    await SummaryService.submitFeedback({
      rating,
      summary,
      method,
      articleUrl,
      comment,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Feedback received successfully',
      timestamp: new Date().toISOString()
    });

    logger.info('Summary feedback received', {
      rating,
      method,
      hasComment: !!comment,
      articleUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

  } catch (error) {
    logger.error('Failed to submit summary feedback', {
      error: error.message,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to submit feedback',
      message: 'An error occurred while processing your feedback',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * POST /api/summary/batch
 * Generate summaries for multiple articles (admin/bulk processing)
 */
router.post('/batch', [
  body('articles').isArray().withMessage('Articles must be an array'),
  body('articles.*.content').isString().isLength({ min: 100 }).withMessage('Each article content must be at least 100 characters'),
  body('articles.*.title').optional().isString(),
  body('options.language').optional().isIn(['it', 'en', 'de', 'fr']),
  body('options.maxLength').optional().isInt({ min: 50, max: 500 }),
  body('options.useAI').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { articles, options = {} } = req.body;

  if (articles.length > 20) {
    return res.status(400).json({
      error: 'Batch size too large',
      message: 'Maximum 20 articles per batch'
    });
  }

  try {
    const results = await SummaryService.generateBatchSummaries(articles, options);

    res.json({
      success: true,
      results,
      metadata: {
        totalArticles: articles.length,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      },
      timestamp: new Date().toISOString()
    });

    logger.info('Batch summary generated', {
      articleCount: articles.length,
      successCount: results.filter(r => r.success).length,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

  } catch (error) {
    logger.error('Batch summary generation failed', {
      error: error.message,
      articleCount: articles.length,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to generate batch summaries',
      message: 'An error occurred while processing your batch request',
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = router;