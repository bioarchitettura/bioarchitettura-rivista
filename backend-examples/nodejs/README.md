# Bioarchitettura Rivista API - Node.js Backend

Production-ready Node.js/Express backend for Bioarchitettura Rivista with AI-powered content discovery, summarization, and recommendation features.

## Features

- 🤖 **OpenAI Integration** - GPT-powered article summarization
- 📝 **Extractive Summarization** - Fallback algorithm using NLP
- 🔍 **Smart Recommendations** - Content-based article recommendations
- 🛡️ **Security First** - Rate limiting, input sanitization, CORS protection
- 📊 **Analytics Ready** - Request logging and performance monitoring
- 🚀 **Production Ready** - Error handling, graceful shutdown, health checks
- 🌐 **Multi-language** - Italian-focused with international support

## Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- OpenAI API key (optional, fallback available)

### Installation

```bash
# Clone the repository
git clone https://github.com/bioarchitettura/bioarchitettura-rivista.git
cd bioarchitettura-rivista/backend-examples/nodejs

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Configuration

Edit `.env` file with your configuration:

```env
# Required
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here

# Optional (development can work without these)
API_KEYS=your_api_key_1,your_api_key_2
ALLOWED_ORIGINS=http://localhost:4000
```

## API Endpoints

### Health Check
```http
GET /health
```

### OpenAI Summarization
```http
POST /api/openai/summarize
Content-Type: application/json
X-API-Key: your_api_key

{
  "content": "Long article content to summarize...",
  "title": "Article Title (optional)",
  "model": "gpt-3.5-turbo",
  "maxTokens": 150,
  "temperature": 0.7
}
```

### Extractive Summarization (Fallback)
```http
POST /api/summary/extractive
Content-Type: application/json
X-API-Key: your_api_key

{
  "content": "Article content to summarize...",
  "title": "Article Title (optional)",
  "sentences": 3
}
```

### Article Recommendations
```http
POST /api/recommendations
Content-Type: application/json
X-API-Key: your_api_key

{
  "currentPost": {
    "url": "/current-article",
    "title": "Current Article Title",
    "category": "Sostenibilità",
    "tags": ["bioarchitettura", "sostenibile"]
  },
  "allPosts": [
    {
      "url": "/article-1",
      "title": "Another Article",
      "category": "Materiali Naturali",
      "tags": ["legno", "naturale"],
      "excerpt": "Article description..."
    }
  ],
  "maxRecommendations": 3
}
```

### Content Analysis
```http
POST /api/content/analyze
Content-Type: application/json
X-API-Key: your_api_key

{
  "content": "Content to analyze...",
  "includeKeywords": true,
  "includeSentiment": true,
  "includeReadability": true
}
```

## Security Features

### Rate Limiting
- 10 requests per minute per IP for API endpoints
- Configurable through environment variables
- Separate strict limits for expensive operations

### Input Sanitization
- XSS prevention
- SQL injection protection
- Path traversal prevention
- Suspicious pattern detection

### API Key Authentication
- Required for all API endpoints (except health)
- Separate admin keys for administrative operations
- Development mode can run without keys

### CORS Protection
- Configurable allowed origins
- Credentials support
- Preflight handling

## Performance Features

### Caching
- In-memory caching with configurable TTL
- Cache invalidation for admin operations
- Smart cache keys based on content

### Compression
- Gzip compression for all responses
- Configurable compression levels

### Monitoring
- Request logging with Winston
- Performance metrics
- Health check endpoint
- Graceful shutdown handling

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "requestId": "uuid-for-tracking",
  "details": "Additional error information"
}
```

Common error codes:
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `VALIDATION_ERROR` - Invalid input data
- `OPENAI_SUMMARIZATION_ERROR` - OpenAI API error
- `API_KEY_REQUIRED` - Missing authentication
- `CONTENT_TOO_LARGE` - Request body too large

## Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Production start
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
nodejs/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── services/              # Business logic
│   ├── openaiService.js   # OpenAI integration
│   ├── summaryService.js  # Extractive summarization
│   └── recommendationService.js # Recommendations
├── middleware/            # Express middleware
│   ├── security.js        # Security middleware
│   └── validation.js      # Input validation
└── logs/                  # Application logs
```

### Adding New Features

1. **New Service**: Create in `services/` directory
2. **New Middleware**: Add to `middleware/` directory
3. **New Route**: Add to `server.js` with proper validation
4. **Environment Variables**: Update `.env.example`

## Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper API keys
- [ ] Set up HTTPS with reverse proxy
- [ ] Configure rate limiting for your traffic
- [ ] Set up log rotation
- [ ] Configure monitoring/alerting
- [ ] Set proper CORS origins
- [ ] Configure security headers

### Scaling Considerations

- Use Redis for shared caching across instances
- Implement queue system for heavy operations
- Add database for persistent data
- Consider CDN for static assets
- Monitor memory usage and garbage collection

## Monitoring and Logging

### Health Checks
```bash
curl http://localhost:3000/health
```

### Log Files
- `logs/combined.log` - All application logs
- `logs/error.log` - Error logs only

### Metrics (if enabled)
- Request count and response times
- Error rates by endpoint
- Cache hit/miss ratios
- Memory and CPU usage

## Support

For issues and questions:
- Create issue on GitHub repository
- Email: bioa@bioarchitettura.org
- Documentation: Check ADVANCED_FEATURES.md

## License

MIT License - see LICENSE file for details.