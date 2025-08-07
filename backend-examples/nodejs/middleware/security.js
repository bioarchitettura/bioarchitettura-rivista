/**
 * Security Middleware for Bioarchitettura Rivista API
 * Provides input sanitization, API key validation, and admin authentication
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

class SecurityMiddleware {
  constructor() {
    this.apiKeys = new Set(
      (process.env.API_KEYS || '').split(',').filter(key => key.length > 0)
    );
    
    this.adminKeys = new Set(
      (process.env.ADMIN_API_KEYS || '').split(',').filter(key => key.length > 0)
    );
  }

  /**
   * Sanitize input to prevent XSS and injection attacks
   */
  sanitizeInput(req, res, next) {
    try {
      // Recursively sanitize object
      const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
          return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        } else if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        } else if (obj && typeof obj === 'object') {
          const sanitized = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeObject(value);
          }
          return sanitized;
        }
        return obj;
      };

      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      if (req.params) {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      res.status(400).json({
        error: 'Errore durante la sanitizzazione input',
        code: 'INPUT_SANITIZATION_ERROR'
      });
    }
  }

  /**
   * Validate API key for protected endpoints
   */
  validateApiKey(req, res, next) {
    // Skip validation for health check and other public endpoints
    const publicPaths = ['/health', '/api/health'];
    if (publicPaths.includes(req.path)) {
      return next();
    }

    // Skip validation if no API keys are configured (development mode)
    if (this.apiKeys.size === 0 && process.env.NODE_ENV === 'development') {
      return next();
    }

    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key richiesta',
        code: 'API_KEY_REQUIRED'
      });
    }

    if (!this.apiKeys.has(apiKey)) {
      return res.status(401).json({
        error: 'API key non valida',
        code: 'INVALID_API_KEY'
      });
    }

    req.apiKey = apiKey;
    next();
  }

  /**
   * Require admin authentication for sensitive operations
   */
  requireAdminAuth(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'Autenticazione admin richiesta',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    if (!this.adminKeys.has(apiKey)) {
      return res.status(403).json({
        error: 'Permessi admin richiesti',
        code: 'ADMIN_PERMISSIONS_REQUIRED'
      });
    }

    req.isAdmin = true;
    next();
  }

  /**
   * Create strict rate limiter for expensive operations
   */
  createStrictRateLimit() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 3, // 3 requests per 5 minutes
      message: {
        error: 'Troppo molte richieste per operazione costosa, riprova tra 5 minuti.',
        code: 'STRICT_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Validate content length to prevent DoS
   */
  validateContentLength(maxSize = 10 * 1024 * 1024) { // 10MB default
    return (req, res, next) => {
      const contentLength = parseInt(req.headers['content-length'] || '0');
      
      if (contentLength > maxSize) {
        return res.status(413).json({
          error: `Contenuto troppo grande. Massimo ${maxSize / 1024 / 1024}MB consentiti.`,
          code: 'CONTENT_TOO_LARGE'
        });
      }

      next();
    };
  }

  /**
   * Generate secure API key
   */
  generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash API key for storage
   */
  hashApiKey(apiKey) {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Validate request origin
   */
  validateOrigin(req, res, next) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
    const origin = req.headers.origin;

    // Skip validation if no origins configured
    if (allowedOrigins.length === 0 || allowedOrigins[0] === '') {
      return next();
    }

    if (!origin || !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        error: 'Origine non autorizzata',
        code: 'UNAUTHORIZED_ORIGIN'
      });
    }

    next();
  }

  /**
   * Add security headers
   */
  addSecurityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (if HTTPS)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  }

  /**
   * Log security events
   */
  logSecurityEvent(event, req, additionalInfo = {}) {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      ...additionalInfo
    };

    // In production, this should go to a security monitoring system
    console.warn('SECURITY EVENT:', JSON.stringify(securityLog));
  }

  /**
   * Detect suspicious patterns
   */
  detectSuspiciousActivity(req, res, next) {
    const suspiciousPatterns = [
      /(\.\./|\.\.\\)/,  // Path traversal
      /(union|select|insert|update|delete|drop|exec|script)/i,  // SQL injection
      /<script|javascript:|on\w+=/i,  // XSS
      /\$\{.*\}/,  // Template injection
    ];

    const checkString = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        this.logSecurityEvent('SUSPICIOUS_PATTERN_DETECTED', req, {
          pattern: pattern.toString(),
          matchedContent: checkString.substring(0, 200)
        });
        
        return res.status(400).json({
          error: 'Richiesta non valida rilevata',
          code: 'SUSPICIOUS_REQUEST'
        });
      }
    }

    next();
  }
}

module.exports = new SecurityMiddleware();