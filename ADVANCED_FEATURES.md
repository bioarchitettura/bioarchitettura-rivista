# Advanced Features Documentation

This document provides comprehensive information about the advanced features implemented for the bioarchitettura/web repository on the 'rivista' branch.

## Features Overview

### 1. Article Recommender Engine
- **Purpose**: Display related articles using tag and category matching
- **Location**: `_includes/article-recommender.html`
- **Future upgrade path**: Ready for Google Recommendations AI integration

### 2. Tidio Chatbot Integration  
- **Purpose**: Provide customer support through live chat
- **Location**: `_includes/tidio-chat.html`
- **Future upgrade path**: Prepared for Dialogflow/OpenAI GPT integration

### 3. OpenAI Auto-Summarization
- **Purpose**: Generate automatic article summaries with AI
- **Location**: `_includes/auto-summary.html`, `_includes/openai-summarization.html`
- **Fallback**: JavaScript-based extractive summarization

## Configuration Guide

### _config.yml Settings

Add the following configuration options to your `_config.yml` file:

```yaml
# Advanced Features Configuration

# Tidio Chat Integration
# tidio_public_key: "your-tidio-public-key-here"  # Uncomment and add your Tidio public key

# OpenAI Summarization
# openai_api_key: "your-openai-api-key-here"      # Uncomment and add your OpenAI API key (backend only!)
# auto_generate_summaries: false                  # Set to true to auto-generate summaries on page load
# summarization_api_endpoint: "/api/summarize"    # Custom API endpoint for summarization
# max_summary_length: 200                         # Maximum tokens for OpenAI summaries

# Article Recommender Settings
max_related_articles: 3                          # Maximum number of related articles to show
recommendation_fallback: true                    # Show recent articles if no related articles found
```

## Feature Details

### Article Recommender Engine

#### How it Works
1. Analyzes tags and categories of the current article
2. Scores other articles based on matching tags (weight: 1) and categories (weight: 2)
3. Displays top-scored related articles
4. Falls back to recent articles if no matches found

#### Customization Options
- `max_related_articles`: Control number of recommendations (default: 3)
- `recommendation_fallback`: Enable/disable fallback to recent articles

#### Future Enhancement - Google Recommendations AI
The system is designed for easy upgrade to Google Recommendations AI:

```javascript
// TODO: Replace Liquid logic with Google Recommendations AI
async function loadGoogleRecommendations() {
  const response = await fetch('/api/recommendations?articleId={{ page.id }}');
  const recommendations = await response.json();
  updateRecommendationUI(recommendations);
}
```

### Tidio Chatbot Integration

#### Setup Instructions
1. Sign up for Tidio account at https://www.tidio.com/
2. Get your public key from Tidio dashboard
3. Add to `_config.yml`: `tidio_public_key: "your-key-here"`
4. The chatbot will automatically appear on all pages

#### Fallback Behavior
- If no key is configured, shows a placeholder chat button in development mode
- Non-blocking: site works perfectly without Tidio configuration

#### Future Enhancements
The integration is prepared for advanced AI chatbot features:

```html
<!-- Future integration points for Dialogflow/OpenAI GPT -->
<!-- Can be added alongside or replace Tidio based on configuration -->
```

**Dialogflow Integration Example:**
```html
<script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
<df-messenger
  intent="WELCOME"
  chat-title="Assistente Bioarchitettura"
  agent-id="your-agent-id"
  language-code="it">
</df-messenger>
```

### OpenAI Auto-Summarization

#### Architecture
- **Frontend**: JavaScript interface for summary generation
- **Backend**: Secure API endpoint for OpenAI integration
- **Fallback**: Client-side extractive summarization

#### Setup for OpenAI Integration

##### 1. Configure _config.yml
```yaml
openai_api_key: "your-api-key"  # For backend use only!
auto_generate_summaries: false  # Optional auto-generation
summarization_api_endpoint: "/api/summarize"
```

##### 2. Create Backend API Endpoint

**Node.js/Express Example:**
```javascript
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/summarize', async (req, res) => {
  try {
    const { content, language = 'Italian' } = req.body;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Please provide a concise summary of this ${language} article in ${language}: ${content}`
      }],
      max_tokens: 200,
      temperature: 0.5
    });
    
    res.json({ 
      success: true, 
      summary: response.choices[0].message.content.trim(),
      method: 'OpenAI GPT-3.5'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate summary' });
  }
});
```

**Netlify Functions Example:**
```javascript
// netlify/functions/summarize.js
const { Configuration, OpenAIApi } = require('openai');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { content, language = 'Italian' } = JSON.parse(event.body);
    
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Summarize this ${language} article in ${language}: ${content}`
      }],
      max_tokens: 200,
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        summary: response.data.choices[0].message.content.trim()
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Failed to generate summary' }),
    };
  }
};
```

#### Fallback Summarization
When OpenAI is not available, the system uses JavaScript extractive summarization:
- Analyzes word frequency in the article
- Scores sentences based on keyword density and position
- Selects top-scoring sentences for the summary
- Completely client-side, no API calls required

#### Security Considerations
- **Never expose OpenAI API keys in frontend code**
- Always use backend endpoints for API calls
- Implement rate limiting to prevent abuse
- Validate and sanitize input content

## File Structure

```
_includes/
├── article-recommender.html    # Related articles recommendation engine
├── auto-summary.html          # Article summarization UI and logic
├── navigation.html            # Site navigation component
├── openai-summarization.html  # OpenAI configuration and backend integration
└── tidio-chat.html           # Tidio chatbot integration

_layouts/
├── default.html              # Main site layout
└── post.html                # Blog post layout with all features

_posts/
├── 2025-01-29-benvenuti-nuovo-cms.md
├── 2025-01-28-sostenibilita-bioarchitettura.md
├── 2025-01-27-materiali-naturali-edilizia.md
└── 2025-01-26-efficienza-energetica-edifici.md
```

## Testing the Features

### 1. Article Recommender
- Create blog posts with overlapping tags/categories
- Navigate to any post to see related articles
- Verify fallback to recent posts when no matches exist

### 2. Tidio Chat
- Add `tidio_public_key` to `_config.yml`
- Reload any page to see the chat widget
- Test fallback behavior with key removed

### 3. Auto-Summarization
- Visit any blog post page
- Click "Genera Riassunto" button
- Verify JavaScript fallback works without backend
- Test OpenAI integration when backend is available

## Maintenance and Updates

### Regular Tasks
1. **Monitor chat conversations** through Tidio dashboard
2. **Review recommendation accuracy** and adjust tag/category strategies  
3. **Monitor OpenAI usage** and costs if enabled
4. **Update fallback summaries** for key articles if needed

### Upgrade Paths
1. **Google Recommendations AI**: Replace Jekyll logic with ML-powered recommendations
2. **Advanced Chatbots**: Integrate Dialogflow or custom OpenAI GPT solutions
3. **Enhanced Summarization**: Add custom prompts, multiple languages, or specialized models

## Troubleshooting

### Common Issues

**Article Recommender Not Showing:**
- Check if posts have tags/categories defined
- Verify `max_related_articles` is set in `_config.yml`
- Ensure posts are using `layout: post`

**Tidio Chat Not Appearing:**
- Verify `tidio_public_key` is correctly set in `_config.yml`
- Check browser console for JavaScript errors
- Ensure key is valid and active

**Summarization Not Working:**
- Check if JavaScript is enabled in browser
- Verify article content is present in `.post-body` element
- For OpenAI: check backend API endpoint and logs

### Debug Mode
Add this to any page to debug configurations:

```javascript
<script>
console.log('Site config:', {
  tidio: '{{ site.tidio_public_key }}',
  openai: {% if site.openai_api_key %}true{% else %}false{% endif %},
  maxRelated: {{ site.max_related_articles | default: 3 }}
});
</script>
```

## Performance Considerations

### Loading Optimization
- All features are non-blocking and load asynchronously
- Fallbacks ensure site works without external dependencies
- JavaScript is loaded only when needed

### SEO Impact
- Article recommendations improve internal linking
- Summaries can enhance content discoverability
- Chat widgets don't affect search engine crawling

### Mobile Optimization
- All features are responsive and mobile-friendly
- Touch-optimized interfaces for mobile users
- Lightweight fallbacks for slower connections

---

For additional support or feature requests, please refer to the repository issues or contact the development team.