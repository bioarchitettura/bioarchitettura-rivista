# Advanced Features Documentation

This documentation covers the advanced features implemented in the bioarchitettura platform, including setup instructions, API configuration, and troubleshooting guides.

## Table of Contents

1. [Article Recommender Engine](#article-recommender-engine)
2. [Tidio Chatbot Integration](#tidio-chatbot-integration)
3. [OpenAI Auto-Summarization](#openai-auto-summarization)
4. [Backend API Setup](#backend-api-setup)
5. [Security and Rate Limiting](#security-and-rate-limiting)
6. [Troubleshooting](#troubleshooting)
7. [Performance Optimization](#performance-optimization)
8. [Upgrade Paths](#upgrade-paths)

## Article Recommender Engine

### Overview

The Article Recommender Engine suggests related articles based on tag and category relevance, with intelligent fallback mechanisms.

### Configuration

Edit `_config.yml`:

```yaml
# Article Recommender Settings
max_related_articles: 3
recommendation_fallback: true
```

### Algorithm Details

**Scoring System:**
- Category match: Weight 2
- Tag match: Weight 1 per tag
- Fallback: Recent articles if no matches

**Future Enhancement:**
The system is prepared for Google Recommendations AI integration through the `useGoogleAI` flag.

### Customization

To modify the recommendation algorithm, edit `_includes/article-recommender.html`:

```javascript
// Customize scoring weights
config: {
    categoryWeight: 2,    // Category match weight
    tagWeight: 1,         // Tag match weight
    maxRelatedArticles: 3 // Maximum articles to show
}
```

### Performance

- **Client-side processing**: No external API calls
- **Caching**: Recommendations cached in browser session
- **Mobile optimized**: Responsive grid layout

## Tidio Chatbot Integration

### Setup

1. **Get Tidio Key:**
   - Sign up at [tidio.com](https://tidio.com)
   - Get your public key from the dashboard

2. **Configure in Jekyll:**
   ```yaml
   # _config.yml
   tidio_key: "YOUR_TIDIO_PUBLIC_KEY"
   ```

3. **Environment Variable (Recommended):**
   ```bash
   export TIDIO_PUBLIC_KEY="your_key_here"
   ```

### Features

**Automatic Greetings:**
- Page-specific welcome messages
- Customizable greeting delay (default: 3 seconds)

**Fallback Chat:**
- Activates when Tidio fails to load
- Quick action buttons for common queries
- Contact information display

### Customization

Edit greeting messages in `_includes/tidio-chat.html`:

```javascript
const greetings = {
    '/': 'Welcome to Bioarchitecture Foundation!',
    '/rivista/': 'Interested in our magazine?',
    // Add more page-specific greetings
};
```

### Extensions (Future)

The integration is prepared for:
- **Dialogflow**: Natural language processing
- **OpenAI GPT**: AI-powered responses

## OpenAI Auto-Summarization

### API Setup

1. **Get OpenAI API Key:**
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Generate an API key

2. **Configure Settings:**
   ```yaml
   # _config.yml
   openai:
     api_key: ""  # Set via environment variable
     model: "gpt-3.5-turbo"
     max_tokens: 150
     temperature: 0.7
   ```

3. **Environment Variables:**
   ```bash
   export OPENAI_API_KEY="your_api_key_here"
   ```

### Backend Implementation

Choose your preferred backend implementation:

#### Node.js Express

```javascript
// Install dependencies
npm install express openai express-rate-limit

// Basic endpoint
app.post('/api/openai/summarize', async (req, res) => {
    const { content, title, language = 'it' } = req.body;
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are an expert in bioarchitecture...'
            },
            {
                role: 'user',
                content: createPrompt(content, title, language)
            }
        ],
        max_tokens: 150
    });
    
    res.json({
        summary: completion.choices[0].message.content.trim(),
        confidence: 0.85
    });
});
```

#### Python Flask

```python
from flask import Flask, request, jsonify
import openai

app = Flask(__name__)
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/openai/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an expert in bioarchitecture..."},
            {"role": "user", "content": create_prompt(data)}
        ],
        max_tokens=150
    )
    
    return jsonify({
        'summary': response.choices[0].message.content.strip(),
        'confidence': 0.85
    })
```

#### PHP Implementation

```php
<?php
require_once 'vendor/autoload.php';

$client = OpenAI::client($_ENV['OPENAI_API_KEY']);

$response = $client->chat()->create([
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        ['role' => 'system', 'content' => 'You are an expert in bioarchitecture...'],
        ['role' => 'user', 'content' => createPrompt($content, $title)]
    ],
    'max_tokens' => 150
]);

echo json_encode([
    'summary' => $response->choices[0]->message->content,
    'confidence' => 0.85
]);
?>
```

### Fallback Algorithm

If OpenAI is unavailable, the system uses an extractive summarization algorithm:

**Features:**
- Sentence scoring based on word frequency
- Title word matching bonus
- Position-based scoring
- Automatic sentence selection

**Performance:**
- Confidence: ~60-70%
- Processing time: <100ms
- No external dependencies

### Cost Management

**Estimation:**
- Average article: ~800 words = ~1000 tokens
- Cost per summary: ~$0.002-0.003
- Monthly cost (100 summaries): ~$0.20-0.30

**Rate Limiting:**
- 10 requests per minute per IP
- Daily limits configurable
- Error handling for quota exceeded

## Backend API Setup

### Infrastructure Requirements

**Minimum Specifications:**
- 1 vCPU, 1GB RAM
- 10GB storage
- HTTPS support

**Recommended Hosting:**
- **Vercel**: Serverless functions (Node.js)
- **Heroku**: Full application hosting
- **AWS Lambda**: Serverless with API Gateway
- **DigitalOcean**: VPS for full control

### Environment Variables

Create `.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150

# Security
API_SECRET_KEY=your_secret_key_here
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX=10        # 10 requests per window

# Database (optional)
DATABASE_URL=your_database_url_here
```

### CORS Configuration

```javascript
// Express.js CORS setup
const cors = require('cors');

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Health Check Endpoint

```javascript
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
            database: 'connected' // if using database
        }
    });
});
```

## Security and Rate Limiting

### Rate Limiting Implementation

**Express.js with express-rate-limit:**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);
```

**Flask with flask-limiter:**

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["10 per minute"]
)

@app.route('/api/summarize', methods=['POST'])
@limiter.limit("5 per minute")
def summarize():
    # Implementation
```

### Input Validation

```javascript
const validator = require('validator');

function validateSummarizeRequest(req, res, next) {
    const { content, title } = req.body;
    
    // Validate content
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Invalid content' });
    }
    
    // Length checks
    if (content.length < 100) {
        return res.status(400).json({ error: 'Content too short' });
    }
    
    if (content.length > 10000) {
        return res.status(400).json({ error: 'Content too long' });
    }
    
    // Sanitize HTML
    req.body.content = validator.escape(content);
    
    next();
}
```

### API Key Security

**Best Practices:**
- Store API keys in environment variables
- Use different keys for development/production
- Implement key rotation
- Monitor usage and costs

**Key Validation:**

```javascript
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    
    next();
}
```

## Troubleshooting

### Common Issues

#### 1. Articles Not Loading in Recommender

**Symptoms:**
- Empty recommendation section
- Loading spinner never disappears

**Solutions:**
```javascript
// Check browser console for errors
console.log('Articles data:', ArticleRecommender.allPosts);

// Verify Jekyll liquid syntax
{% for post in site.posts %}
// Ensure proper escaping of quotes and special characters
{% endfor %}
```

#### 2. Tidio Chat Not Loading

**Symptoms:**
- Chat widget doesn't appear
- Fallback chat shows instead

**Solutions:**
1. Verify Tidio key in `_config.yml`
2. Check browser's ad blocker settings
3. Test network connectivity to tidio.co

```javascript
// Debug Tidio loading
console.log('Tidio key:', TidioChat.config.tidioKey);
console.log('Tidio API available:', !!window.tidioChatApi);
```

#### 3. OpenAI Summarization Failing

**Symptoms:**
- "Error generating summary" message
- Fallback algorithm always used

**Solutions:**
1. Verify API endpoint is accessible
2. Check OpenAI API key and quota
3. Validate request format

```javascript
// Test API endpoint
fetch('/api/openai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        content: 'test content',
        title: 'test title'
    })
}).then(response => console.log(response.status));
```

#### 4. Performance Issues

**Symptoms:**
- Slow page load times
- High server costs
- Timeout errors

**Solutions:**
1. Implement caching for summaries
2. Optimize images and assets
3. Use CDN for static content

### Debug Mode

Enable debug mode in development:

```yaml
# _config.yml
environment: development
debug: true
```

This enables:
- Debug panels for OpenAI integration
- Detailed error logging
- Performance metrics

### Logging

**Server-side Logging:**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Log API requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
```

## Performance Optimization

### Frontend Optimization

**Lazy Loading:**
```javascript
// Load article recommender only when needed
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            ArticleRecommender.init();
            observer.unobserve(entry.target);
        }
    });
});

observer.observe(document.getElementById('article-recommender'));
```

**Caching Strategies:**
```javascript
// Cache recommendations in sessionStorage
const cacheKey = `recommendations_${page.url}`;
const cached = sessionStorage.getItem(cacheKey);

if (cached) {
    return JSON.parse(cached);
} else {
    const recommendations = generateRecommendations();
    sessionStorage.setItem(cacheKey, JSON.stringify(recommendations));
    return recommendations;
}
```

### Backend Optimization

**Response Caching:**
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour

app.post('/api/summarize', (req, res) => {
    const cacheKey = crypto.createHash('md5')
        .update(req.body.content)
        .digest('hex');
    
    const cached = cache.get(cacheKey);
    if (cached) {
        return res.json(cached);
    }
    
    // Generate summary and cache result
    generateSummary(req.body).then(result => {
        cache.set(cacheKey, result);
        res.json(result);
    });
});
```

**Database Optimization:**
```sql
-- Index for faster lookups
CREATE INDEX idx_content_hash ON summaries(content_hash);
CREATE INDEX idx_created_at ON summaries(created_at);

-- Cleanup old summaries
DELETE FROM summaries WHERE created_at < NOW() - INTERVAL '30 days';
```

### CDN Configuration

**Cloudflare Settings:**
- Cache static assets: 1 month
- Cache API responses: 5 minutes
- Enable compression
- Use Polish for image optimization

## Upgrade Paths

### Version 2.0 Roadmap

**Enhanced AI Features:**
- GPT-4 integration for better summaries
- Multilingual content support
- Sentiment analysis for articles
- Automatic tag suggestion

**Advanced Personalization:**
- User behavior tracking
- Machine learning recommendations
- A/B testing framework
- Dynamic content optimization

**Analytics Integration:**
- Google Analytics 4 events
- Custom dashboard for content performance
- User engagement metrics
- Conversion tracking

### Migration Guide

**From Basic to AI-Enhanced:**

1. **Update Configuration:**
   ```yaml
   # Add new settings to _config.yml
   ai:
     provider: "openai"  # or "anthropic", "cohere"
     features:
       - summarization
       - recommendations
       - translation
   ```

2. **Database Schema:**
   ```sql
   -- Add tables for enhanced features
   CREATE TABLE user_preferences (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255),
       preferences JSONB,
       created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **API Endpoints:**
   ```javascript
   // Add new endpoints
   app.post('/api/v2/recommendations', personalizedRecommendations);
   app.post('/api/v2/translate', translateContent);
   app.post('/api/v2/analyze', analyzeContent);
   ```

### Backward Compatibility

All features are designed with graceful degradation:
- Features work without AI backends
- Progressive enhancement approach
- No breaking changes to existing content
- Fallback mechanisms for all advanced features

---

## Support and Resources

**Documentation:**
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Tidio Integration Guide](https://docs.tidio.com/)

**Community:**
- [GitHub Issues](https://github.com/bioarchitettura/bioarchitettura-rivista/issues)
- [Discussion Forum](https://github.com/bioarchitettura/bioarchitettura-rivista/discussions)

**Contact:**
- Technical Support: tech@bioarchitettura.org
- Content Questions: redazione@bioarchitettura.org

---

*Last updated: January 2024*