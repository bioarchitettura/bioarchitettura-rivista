/**
 * Validation Middleware for Bioarchitettura Rivista API
 * Handles request validation and error formatting
 */

const { validationResult } = require('express-validator');

class ValidationMiddleware {
  /**
   * Handle validation errors from express-validator
   */
  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.param || error.path,
        message: error.msg,
        value: error.value,
        location: error.location
      }));

      return res.status(400).json({
        error: 'Errori di validazione',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
        requestId: req.id
      });
    }

    next();
  }

  /**
   * Validate content type for specific endpoints
   */
  validateContentType(expectedType = 'application/json') {
    return (req, res, next) => {
      if (req.method === 'GET' || req.method === 'DELETE') {
        return next();
      }

      const contentType = req.headers['content-type'];
      
      if (!contentType || !contentType.includes(expectedType)) {
        return res.status(400).json({
          error: `Content-Type deve essere ${expectedType}`,
          code: 'INVALID_CONTENT_TYPE',
          received: contentType
        });
      }

      next();
    };
  }

  /**
   * Validate file uploads
   */
  validateFileUpload(options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      required = false
    } = options;

    return (req, res, next) => {
      if (!req.files && required) {
        return res.status(400).json({
          error: 'File upload richiesto',
          code: 'FILE_REQUIRED'
        });
      }

      if (!req.files) {
        return next();
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];

      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(400).json({
            error: `File troppo grande. Massimo ${maxSize / 1024 / 1024}MB consentiti.`,
            code: 'FILE_TOO_LARGE',
            fileSize: file.size,
            maxSize
          });
        }

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: 'Tipo file non supportato',
            code: 'INVALID_FILE_TYPE',
            fileType: file.mimetype,
            allowedTypes
          });
        }
      }

      next();
    };
  }

  /**
   * Validate language parameter
   */
  validateLanguage(req, res, next) {
    const supportedLanguages = ['it', 'en', 'de', 'fr'];
    const language = req.query.lang || req.body.lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'it';

    if (!supportedLanguages.includes(language)) {
      req.language = 'it'; // Default to Italian
    } else {
      req.language = language;
    }

    next();
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1) {
      return res.status(400).json({
        error: 'Numero pagina deve essere >= 1',
        code: 'INVALID_PAGE_NUMBER'
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Limite deve essere tra 1 e 100',
        code: 'INVALID_LIMIT'
      });
    }

    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };

    next();
  }

  /**
   * Validate sorting parameters
   */
  validateSorting(allowedFields = []) {
    return (req, res, next) => {
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder || 'desc';

      if (sortBy && !allowedFields.includes(sortBy)) {
        return res.status(400).json({
          error: 'Campo ordinamento non valido',
          code: 'INVALID_SORT_FIELD',
          allowedFields
        });
      }

      if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
        return res.status(400).json({
          error: 'Ordine deve essere "asc" o "desc"',
          code: 'INVALID_SORT_ORDER'
        });
      }

      req.sorting = {
        field: sortBy,
        order: sortOrder.toLowerCase()
      };

      next();
    };
  }

  /**
   * Validate search parameters
   */
  validateSearch(req, res, next) {
    const query = req.query.q || req.body.query;
    
    if (query) {
      if (typeof query !== 'string') {
        return res.status(400).json({
          error: 'Query di ricerca deve essere una stringa',
          code: 'INVALID_SEARCH_QUERY'
        });
      }

      if (query.length < 2) {
        return res.status(400).json({
          error: 'Query di ricerca deve essere almeno 2 caratteri',
          code: 'SEARCH_QUERY_TOO_SHORT'
        });
      }

      if (query.length > 100) {
        return res.status(400).json({
          error: 'Query di ricerca troppo lunga (max 100 caratteri)',
          code: 'SEARCH_QUERY_TOO_LONG'
        });
      }

      req.searchQuery = query.trim();
    }

    next();
  }

  /**
   * Validate date range parameters
   */
  validateDateRange(req, res, next) {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          error: 'Data inizio non valida',
          code: 'INVALID_START_DATE'
        });
      }
      req.dateRange = { start };
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Data fine non valida',
          code: 'INVALID_END_DATE'
        });
      }
      
      if (!req.dateRange) req.dateRange = {};
      req.dateRange.end = end;
    }

    if (req.dateRange?.start && req.dateRange?.end) {
      if (req.dateRange.start > req.dateRange.end) {
        return res.status(400).json({
          error: 'Data inizio deve essere anteriore alla data fine',
          code: 'INVALID_DATE_RANGE'
        });
      }
    }

    next();
  }

  /**
   * Validate filter parameters
   */
  validateFilters(allowedFilters = {}) {
    return (req, res, next) => {
      const filters = {};

      for (const [key, value] of Object.entries(req.query)) {
        if (allowedFilters[key]) {
          const config = allowedFilters[key];
          
          // Validate filter type
          if (config.type === 'array') {
            filters[key] = Array.isArray(value) ? value : [value];
          } else if (config.type === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) {
              return res.status(400).json({
                error: `Filtro ${key} deve essere un numero`,
                code: 'INVALID_FILTER_TYPE'
              });
            }
            filters[key] = num;
          } else if (config.type === 'boolean') {
            filters[key] = value === 'true' || value === '1';
          } else {
            filters[key] = value;
          }

          // Validate allowed values
          if (config.allowedValues && !config.allowedValues.includes(filters[key])) {
            return res.status(400).json({
              error: `Valore non valido per filtro ${key}`,
              code: 'INVALID_FILTER_VALUE',
              allowedValues: config.allowedValues
            });
          }
        }
      }

      req.filters = filters;
      next();
    };
  }

  /**
   * Sanitize and validate markdown content
   */
  validateMarkdown(req, res, next) {
    if (req.body.content && typeof req.body.content === 'string') {
      // Basic markdown validation
      const content = req.body.content;
      
      // Check for potentially dangerous patterns
      const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          return res.status(400).json({
            error: 'Contenuto markdown contiene elementi non sicuri',
            code: 'UNSAFE_MARKDOWN_CONTENT'
          });
        }
      }
    }

    next();
  }

  /**
   * Validate API version compatibility
   */
  validateApiVersion(supportedVersions = ['v1']) {
    return (req, res, next) => {
      const version = req.headers['api-version'] || req.query.version || 'v1';
      
      if (!supportedVersions.includes(version)) {
        return res.status(400).json({
          error: 'Versione API non supportata',
          code: 'UNSUPPORTED_API_VERSION',
          supportedVersions
        });
      }

      req.apiVersion = version;
      next();
    };
  }
}

module.exports = new ValidationMiddleware();