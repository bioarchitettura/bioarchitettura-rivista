/**
 * AI-Powered Article Recommendations Route
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const RecommendationService = require('../services/RecommendationService');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/recommendations
 * Generate AI-powered article recommendations
 */
router.post('/', [
  body('userPreferences').optional().isObject(),
  body('readingHistory').optional().isArray(),
  body('currentContext').optional().isObject(),
  body('maxResults').optional().isInt({ min: 1, max: 10 }).withMessage('maxResults must be between 1 and 10')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const {
    userPreferences = {},
    readingHistory = [],
    currentContext = {},
    maxResults = 3
  } = req.body;

  try {
    const recommendations = await RecommendationService.generateRecommendations({
      userPreferences,
      readingHistory,
      currentContext,
      maxResults
    });

    res.json({
      success: true,
      recommendations,
      metadata: {
        method: recommendations.method || 'ai',
        confidence: recommendations.confidence || 0.8,
        processingTime: recommendations.processingTime || 0,
        fallbackUsed: recommendations.fallbackUsed || false
      },
      timestamp: new Date().toISOString()
    });

    // Log recommendation request for analytics
    logger.info('Recommendation generated', {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      context: currentContext.pageType,
      method: recommendations.method,
      resultCount: recommendations.length
    });

  } catch (error) {
    logger.error('Recommendation generation failed', {
      error: error.message,
      stack: error.stack,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: 'An error occurred while processing your request',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * POST /api/recommendations/feedback
 * Submit feedback for recommendation quality
 */
router.post('/feedback', [
  body('rating').isInt({ min: 1, max: 4 }).withMessage('Rating must be between 1 and 4'),
  body('recommendations').isArray().withMessage('Recommendations must be an array'),
  body('userPreferences').optional().isObject(),
  body('comment').optional().isString().isLength({ max: 500 }).withMessage('Comment too long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { rating, recommendations, userPreferences, comment } = req.body;

  try {
    await RecommendationService.submitFeedback({
      rating,
      recommendations,
      userPreferences,
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

    logger.info('Recommendation feedback received', {
      rating,
      recommendationCount: recommendations.length,
      hasComment: !!comment,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

  } catch (error) {
    logger.error('Failed to submit recommendation feedback', {
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
 * GET /api/recommendations/stats
 * Get recommendation system statistics (admin only)
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const stats = await RecommendationService.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get recommendation stats', {
      error: error.message,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(500).json({
      error: 'Failed to get statistics',
      timestamp: new Date().toISOString()
    });
  }
}));

module.exports = router;