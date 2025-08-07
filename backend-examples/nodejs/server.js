/**
 * Bioarchitettura Rivista API Server
 * Node.js/Express backend with AI-powered content discovery and summarization
 * Features: OpenAI integration, rate limiting, security, CORS, validation
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { body, param, validationResult } = require('express-validator');
const NodeCache = require('node-cache');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import custom modules
const openaiService = require('./services/openaiService');
const summaryService = require('./services/summaryService');
const recommendationService = require('./services/recommendationService');
const securityMiddleware = require('./middleware/security');
const validationMiddleware = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize cache (30 minutes default TTL)
const cache = new NodeCache({ stdTTL: 1800 });

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bioarchitettura-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Troppo molte richieste, riprova tra un minuto.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Troppo molte richieste, riprova tra un minuto.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "*.openai.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*"],
      connectSrc: ["'self'", "api.openai.com", "translate.googleapis.com"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4000', 'https://bioarchitettura.github.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security middleware
app.use(securityMiddleware.sanitizeInput);
app.use(securityMiddleware.validateApiKey);

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes

/**
 * OpenAI Summarization Endpoint
 * POST /api/openai/summarize
 */
app.post('/api/openai/summarize',
  [
    body('content')
      .isLength({ min: 100, max: 50000 })
      .withMessage('Il contenuto deve essere tra 100 e 50,000 caratteri'),
    body('title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Il titolo non può superare 200 caratteri'),
    body('model')
      .optional()
      .isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'])
      .withMessage('Modello non supportato'),
    body('maxTokens')
      .optional()
      .isInt({ min: 50, max: 500 })
      .withMessage('maxTokens deve essere tra 50 e 500'),
    body('temperature')
      .optional()
      .isFloat({ min: 0, max: 1 })
      .withMessage('temperature deve essere tra 0 e 1')
  ],
  validationMiddleware.handleValidationErrors,
  async (req, res) => {
    const requestId = req.id;
    
    try {
      const { content, title, model, maxTokens, temperature } = req.body;
      
      // Check cache first
      const cacheKey = `summary:${Buffer.from(content).toString('base64').slice(0, 32)}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        logger.info(`Cache hit for summary request ${requestId}`);
        return res.json({
          ...cached,
          cached: true,
          requestId
        });
      }
      
      logger.info(`Processing OpenAI summarization request ${requestId}`);
      
      const result = await openaiService.summarize({
        content,
        title,
        model: model || 'gpt-3.5-turbo',
        maxTokens: maxTokens || 150,
        temperature: temperature || 0.7
      });
      
      // Cache the result
      cache.set(cacheKey, result, 3600); // Cache for 1 hour
      
      logger.info(`OpenAI summarization completed for request ${requestId}`);
      
      res.json({
        ...result,
        cached: false,
        requestId
      });
      
    } catch (error) {
      logger.error(`OpenAI summarization error for request ${requestId}:`, error);
      
      res.status(500).json({
        error: 'Errore durante la generazione del riassunto AI',
        code: 'OPENAI_SUMMARIZATION_ERROR',
        requestId,
        message: error.message
      });
    }
  }
);

/**
 * Extractive Summarization Endpoint (Fallback)
 * POST /api/summary/extractive
 */
app.post('/api/summary/extractive',
  [
    body('content')
      .isLength({ min: 100, max: 50000 })
      .withMessage('Il contenuto deve essere tra 100 e 50,000 caratteri'),
    body('title')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Il titolo non può superare 200 caratteri'),
    body('sentences')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Il numero di frasi deve essere tra 1 e 10')
  ],
  validationMiddleware.handleValidationErrors,
  async (req, res) => {
    const requestId = req.id;
    
    try {
      const { content, title, sentences } = req.body;
      
      // Check cache first
      const cacheKey = `extractive:${Buffer.from(content).toString('base64').slice(0, 32)}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        logger.info(`Cache hit for extractive summary request ${requestId}`);
        return res.json({
          ...cached,
          cached: true,
          requestId
        });
      }
      
      logger.info(`Processing extractive summarization request ${requestId}`);
      
      const result = await summaryService.extractiveSummary({
        content,
        title,
        maxSentences: sentences || 3
      });
      
      // Cache the result
      cache.set(cacheKey, result, 3600); // Cache for 1 hour
      
      logger.info(`Extractive summarization completed for request ${requestId}`);
      
      res.json({
        ...result,
        cached: false,
        requestId
      });
      
    } catch (error) {
      logger.error(`Extractive summarization error for request ${requestId}:`, error);
      
      res.status(500).json({
        error: 'Errore durante la generazione del riassunto estrattivo',
        code: 'EXTRACTIVE_SUMMARIZATION_ERROR',
        requestId,
        message: error.message
      });
    }
  }
);

/**
 * Article Recommendations Endpoint
 * POST /api/recommendations
 */
app.post('/api/recommendations',
  [
    body('currentPost')
      .isObject()
      .withMessage('currentPost deve essere un oggetto'),
    body('currentPost.category')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('La categoria non può superare 100 caratteri'),
    body('currentPost.tags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Tags deve essere un array di massimo 20 elementi'),
    body('allPosts')
      .isArray({ min: 1, max: 1000 })
      .withMessage('allPosts deve essere un array di 1-1000 elementi'),
    body('maxRecommendations')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('maxRecommendations deve essere tra 1 e 10')
  ],
  validationMiddleware.handleValidationErrors,
  async (req, res) => {
    const requestId = req.id;
    
    try {
      const { currentPost, allPosts, maxRecommendations } = req.body;
      
      // Create cache key based on current post and posts hash
      const postsHash = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(allPosts))
        .digest('hex')
        .slice(0, 16);
      
      const cacheKey = `recommendations:${currentPost.url}:${postsHash}`;
      const cached = cache.get(cacheKey);
      
      if (cached) {
        logger.info(`Cache hit for recommendations request ${requestId}`);
        return res.json({
          ...cached,
          cached: true,
          requestId
        });
      }
      
      logger.info(`Processing recommendations request ${requestId}`);
      
      const recommendations = await recommendationService.getRecommendations({
        currentPost,
        allPosts,
        maxRecommendations: maxRecommendations || 3,
        categoryWeight: 2,
        tagWeight: 1
      });
      
      // Cache the result
      cache.set(cacheKey, { recommendations }, 1800); // Cache for 30 minutes
      
      logger.info(`Recommendations completed for request ${requestId}, found ${recommendations.length} articles`);
      
      res.json({
        recommendations,
        cached: false,
        requestId
      });
      
    } catch (error) {
      logger.error(`Recommendations error for request ${requestId}:`, error);
      
      res.status(500).json({
        error: 'Errore durante la generazione delle raccomandazioni',
        code: 'RECOMMENDATIONS_ERROR',
        requestId,
        message: error.message
      });
    }
  }
);

/**
 * Content Analysis Endpoint
 * POST /api/content/analyze
 */
app.post('/api/content/analyze',
  [
    body('content')
      .isLength({ min: 10, max: 50000 })
      .withMessage('Il contenuto deve essere tra 10 e 50,000 caratteri'),
    body('includeKeywords')
      .optional()
      .isBoolean()
      .withMessage('includeKeywords deve essere un boolean'),
    body('includeSentiment')
      .optional()
      .isBoolean()
      .withMessage('includeSentiment deve essere un boolean'),
    body('includeReadability')
      .optional()
      .isBoolean()
      .withMessage('includeReadability deve essere un boolean')
  ],
  validationMiddleware.handleValidationErrors,
  async (req, res) => {
    const requestId = req.id;
    
    try {
      const { 
        content, 
        includeKeywords = true, 
        includeSentiment = true, 
        includeReadability = true 
      } = req.body;
      
      logger.info(`Processing content analysis request ${requestId}`);
      
      const analysis = await summaryService.analyzeContent({
        content,
        includeKeywords,
        includeSentiment,
        includeReadability
      });
      
      logger.info(`Content analysis completed for request ${requestId}`);
      
      res.json({
        ...analysis,
        requestId
      });
      
    } catch (error) {
      logger.error(`Content analysis error for request ${requestId}:`, error);
      
      res.status(500).json({
        error: 'Errore durante l\'analisi del contenuto',
        code: 'CONTENT_ANALYSIS_ERROR',
        requestId,
        message: error.message
      });
    }
  }
);

/**
 * Cache Management Endpoints
 */
app.delete('/api/cache/clear',
  securityMiddleware.requireAdminAuth,
  (req, res) => {
    const keysDeleted = cache.keys().length;
    cache.flushAll();
    
    logger.info(`Cache cleared by admin, ${keysDeleted} keys deleted`);
    
    res.json({
      message: 'Cache svuotata con successo',
      keysDeleted,
      requestId: req.id
    });
  }
);

app.get('/api/cache/stats',
  securityMiddleware.requireAdminAuth,
  (req, res) => {
    const stats = cache.getStats();
    
    res.json({
      ...stats,
      keys: cache.keys().length,
      requestId: req.id
    });
  }
);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato',
    code: 'NOT_FOUND',
    path: req.originalUrl,
    requestId: req.id
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error(`Unhandled error for request ${req.id}:`, error);
  
  res.status(500).json({
    error: 'Errore interno del server',
    code: 'INTERNAL_SERVER_ERROR',
    requestId: req.id,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('Server shut down successfully');
    process.exit(0);
  });
};

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Bioarchitettura Rivista API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;