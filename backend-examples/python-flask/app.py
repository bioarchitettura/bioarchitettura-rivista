"""
Bioarchitettura Magazine Flask API
Advanced Python backend with AI features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
import os
import logging
from datetime import datetime, timedelta
import openai
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.stem import SnowballStemmer
import spacy
from transformers import pipeline
import redis
import json
import hashlib
from functools import wraps
import time

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['OPENAI_API_KEY'] = os.environ.get('OPENAI_API_KEY')
app.config['REDIS_URL'] = os.environ.get('REDIS_URL', 'redis://localhost:6379')

# Initialize extensions
cors = CORS(app, origins=[
    'http://localhost:4000',
    'https://bioarchitettura.github.io',
    'https://bioarchitettura.org'
])

# Rate limiting
limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

# Caching
cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_URL': app.config['REDIS_URL']})

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize AI models
try:
    nlp = spacy.load("it_core_news_sm")  # Italian language model
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    openai.api_key = app.config['OPENAI_API_KEY']
except Exception as e:
    logger.warning(f"AI models initialization failed: {e}")
    nlp = None
    summarizer = None

# Download NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    italian_stopwords = set(stopwords.words('italian'))
    stemmer = SnowballStemmer('italian')
except Exception as e:
    logger.warning(f"NLTK initialization failed: {e}")
    italian_stopwords = set()
    stemmer = None

# Sample articles data (in production, this would come from database)
ARTICLES = [
    {
        "title": "Materiali Naturali in Bioarchitettura: Guida Completa 2024",
        "url": "/2024/01/10/materiali-naturali-bioarchitettura-guida-completa.html",
        "excerpt": "Alla scoperta dei materiali naturali per la bioarchitettura: proprietà, vantaggi e applicazioni pratiche per costruire in armonia con l'ambiente.",
        "category": "Materiali Naturali",
        "tags": ["materiali naturali", "legno", "paglia", "terra cruda", "canapa", "sughero", "sostenibilità"],
        "reading_time": 12,
        "featured": True,
        "date": "2024-01-10"
    },
    {
        "title": "Efficienza Energetica negli Edifici: Strategie e Tecnologie Innovative",
        "url": "/2024/01/05/efficienza-energetica-edifici-strategie-tecnologie.html",
        "excerpt": "Strategie avanzate e tecnologie innovative per massimizzare l'efficienza energetica degli edifici: dalla progettazione bioclimatica agli impianti intelligenti.",
        "category": "Efficienza Energetica",
        "tags": ["efficienza energetica", "impianti", "isolamento", "smart building", "automazione"],
        "reading_time": 10,
        "featured": True,
        "date": "2024-01-05"
    },
    {
        "title": "Casa Passiva: Il Futuro dell'Abitare Sostenibile",
        "url": "/2024/01/15/casa-passiva-futuro-abitare-sostenibile.html",
        "excerpt": "Standard Passivhaus e tecnologie per case ad altissima efficienza energetica: comfort ottimale con consumi minimi.",
        "category": "Casa Passiva",
        "tags": ["casa passiva", "passivhaus", "comfort", "ventilazione", "isolamento"],
        "reading_time": 14,
        "featured": True,
        "date": "2024-01-15"
    }
]

class RecommendationEngine:
    """AI-powered article recommendation engine"""
    
    def __init__(self):
        self.articles = ARTICLES
        self.category_weights = {
            'materiali-naturali': 1.0,
            'efficienza-energetica': 1.0,
            'casa-passiva': 1.0,
            'certificazioni': 1.0,
            'innovazione': 1.0,
            'ricerca': 1.0
        }
    
    @cache.memoize(timeout=300)  # Cache for 5 minutes
    def generate_recommendations(self, user_preferences, reading_history, current_context, max_results=3):
        """Generate AI-powered recommendations with fallback"""
        try:
            # Try OpenAI recommendations first
            if openai.api_key:
                recommendations = self._generate_ai_recommendations(
                    user_preferences, reading_history, current_context, max_results
                )
                if recommendations:
                    return {
                        'recommendations': recommendations,
                        'method': 'ai',
                        'confidence': 0.9,
                        'fallback_used': False
                    }
            
            # Fallback to rule-based recommendations
            recommendations = self._generate_fallback_recommendations(
                user_preferences, reading_history, current_context, max_results
            )
            
            return {
                'recommendations': recommendations,
                'method': 'fallback',
                'confidence': 0.7,
                'fallback_used': True
            }
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            # Emergency fallback
            return {
                'recommendations': self._get_popular_articles(max_results),
                'method': 'emergency',
                'confidence': 0.3,
                'fallback_used': True
            }
    
    def _generate_ai_recommendations(self, user_preferences, reading_history, current_context, max_results):
        """Generate recommendations using OpenAI"""
        prompt = self._build_ai_prompt(user_preferences, reading_history, current_context)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert in sustainable architecture. Recommend articles based on user context. Respond with JSON containing article URLs in order of relevance."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            return self._parse_ai_response(content, max_results)
            
        except Exception as e:
            logger.error(f"OpenAI recommendation failed: {e}")
            return None
    
    def _build_ai_prompt(self, user_preferences, reading_history, current_context):
        """Build prompt for AI recommendations"""
        prompt = "Recommend bioarchitettura articles based on:\n\n"
        
        if current_context.get('pageType'):
            prompt += f"Current page type: {current_context['pageType']}\n"
        
        if current_context.get('category'):
            prompt += f"Current category: {current_context['category']}\n"
        
        if current_context.get('tags'):
            prompt += f"Current tags: {', '.join(current_context['tags'])}\n"
        
        if user_preferences.get('categories'):
            prompt += f"User preferences: {user_preferences['categories']}\n"
        
        prompt += "\nAvailable articles:\n"
        for i, article in enumerate(self.articles, 1):
            prompt += f"{i}. \"{article['title']}\" - {article['category']} - {article['url']}\n"
        
        prompt += f"\nRecommend the {max_results} most relevant articles."
        return prompt
    
    def _parse_ai_response(self, response, max_results):
        """Parse AI response and match to articles"""
        try:
            # Extract URLs from response
            import re
            urls = re.findall(r'/\d{4}/\d{2}/\d{2}/[^\s"]+', response)
            
            recommendations = []
            for url in urls[:max_results]:
                article = next((a for a in self.articles if url in a['url']), None)
                if article:
                    recommendations.append({
                        **article,
                        'score': 0.9,
                        'confidence': 0.9
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            return []
    
    def _generate_fallback_recommendations(self, user_preferences, reading_history, current_context, max_results):
        """Generate rule-based recommendations"""
        scored_articles = []
        
        for article in self.articles:
            score = self._calculate_score(article, user_preferences, reading_history, current_context)
            scored_articles.append({
                **article,
                'score': score,
                'confidence': min(0.9, score / 10)
            })
        
        # Sort by score and return top results
        scored_articles.sort(key=lambda x: x['score'], reverse=True)
        return scored_articles[:max_results]
    
    def _calculate_score(self, article, user_preferences, reading_history, current_context):
        """Calculate recommendation score"""
        score = 0
        
        # Category preference
        category_key = article['category'].lower().replace(' ', '-')
        category_weight = self.category_weights.get(category_key, 1.0)
        user_category_weight = user_preferences.get('categories', {}).get(article['category'], 0)
        score += (category_weight + user_category_weight) * 2
        
        # Tag relevance
        if article['tags'] and user_preferences.get('tags'):
            for tag in article['tags']:
                user_tag_weight = user_preferences['tags'].get(tag, 0)
                score += user_tag_weight * 1.5
        
        # Current context relevance
        if current_context.get('category') == article['category']:
            score += 3
        
        # Featured articles boost
        if article.get('featured'):
            score += 2
        
        # Reading time preference
        preferred_time = user_preferences.get('averageReadingTime', 12)
        time_diff = abs(article['reading_time'] - preferred_time)
        score += max(0, 5 - time_diff * 0.5)
        
        return score
    
    def _get_popular_articles(self, max_results):
        """Get popular articles as emergency fallback"""
        return [
            {**article, 'score': 0.5, 'confidence': 0.3}
            for article in self.articles[:max_results]
            if article.get('featured')
        ]

class SummaryEngine:
    """AI-powered summarization engine with extractive fallback"""
    
    def __init__(self):
        self.max_length = 200
        self.min_length = 50
    
    def generate_summary(self, content, title=None, language='it', max_length=200, style='professional', use_ai=True):
        """Generate summary with AI and extractive fallback"""
        start_time = time.time()
        
        try:
            # Try AI summarization first
            if use_ai and (openai.api_key or summarizer):
                summary = self._generate_ai_summary(content, title, language, max_length, style)
                if summary:
                    return {
                        'summary': summary,
                        'method': 'ai',
                        'confidence': 0.9,
                        'processing_time': time.time() - start_time,
                        'quality_metrics': self._analyze_quality(summary, content)
                    }
            
            # Fallback to extractive summarization
            summary = self._generate_extractive_summary(content, max_length)
            return {
                'summary': summary,
                'method': 'extractive',
                'confidence': 0.7,
                'processing_time': time.time() - start_time,
                'quality_metrics': self._analyze_quality(summary, content)
            }
            
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            raise
    
    def _generate_ai_summary(self, content, title, language, max_length, style):
        """Generate summary using AI"""
        # Try OpenAI first
        if openai.api_key:
            try:
                prompt = self._build_summary_prompt(content, title, language, max_length, style)
                
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert copywriter for sustainable architecture. Create clear, engaging summaries."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=max_length * 2,
                    temperature=0.7
                )
                
                return response.choices[0].message.content.strip()
                
            except Exception as e:
                logger.error(f"OpenAI summarization failed: {e}")
        
        # Try Hugging Face summarizer as fallback
        if summarizer:
            try:
                # Truncate content if too long
                max_input = 1024
                if len(content) > max_input:
                    content = content[:max_input]
                
                result = summarizer(content, max_length=max_length, min_length=self.min_length, do_sample=False)
                return result[0]['summary_text']
                
            except Exception as e:
                logger.error(f"Hugging Face summarization failed: {e}")
        
        return None
    
    def _build_summary_prompt(self, content, title, language, max_length, style):
        """Build prompt for AI summarization"""
        style_instructions = {
            'professional': 'Use a professional and formal tone.',
            'conversational': 'Use a conversational and accessible tone.',
            'academic': 'Use an academic tone with technical terminology.',
            'simplified': 'Use simple and easy-to-understand language.'
        }
        
        prompt = f"Summarize this bioarchitettura article in {language} language, approximately {max_length} words. "
        prompt += style_instructions.get(style, '')
        prompt += f"\n\nTitle: {title}\n\nContent: {content}"
        
        return prompt
    
    def _generate_extractive_summary(self, content, max_length):
        """Generate extractive summary using NLP"""
        if not nlp:
            # Simple sentence extraction fallback
            sentences = sent_tokenize(content)
            # Take first few sentences up to max_length words
            summary_sentences = []
            word_count = 0
            
            for sentence in sentences:
                sentence_words = len(word_tokenize(sentence))
                if word_count + sentence_words <= max_length:
                    summary_sentences.append(sentence)
                    word_count += sentence_words
                else:
                    break
            
            return ' '.join(summary_sentences)
        
        # Advanced extractive summarization with spaCy
        doc = nlp(content)
        sentences = [sent.text for sent in doc.sents]
        
        # Score sentences based on various factors
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            score = self._score_sentence(sentence, i, len(sentences), content)
            scored_sentences.append((sentence, score))
        
        # Sort by score and select top sentences
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        
        # Build summary respecting word limit
        summary_sentences = []
        word_count = 0
        
        for sentence, score in scored_sentences:
            sentence_words = len(word_tokenize(sentence))
            if word_count + sentence_words <= max_length:
                summary_sentences.append(sentence)
                word_count += sentence_words
        
        # Sort selected sentences by original order
        original_order = []
        for summary_sent in summary_sentences:
            original_index = next(i for i, sent in enumerate(sentences) if sent == summary_sent)
            original_order.append((original_index, summary_sent))
        
        original_order.sort(key=lambda x: x[0])
        return ' '.join([sent for _, sent in original_order])
    
    def _score_sentence(self, sentence, position, total_sentences, full_content):
        """Score sentence for extractive summarization"""
        score = 0
        
        # Position scoring (beginning and end are important)
        if position < total_sentences * 0.2 or position > total_sentences * 0.8:
            score += 2
        
        # Length scoring (prefer medium-length sentences)
        words = word_tokenize(sentence)
        if 10 <= len(words) <= 30:
            score += 1
        
        # Technical terms scoring
        technical_terms = [
            'bioarchitettura', 'sostenibile', 'ecologico', 'efficienza energetica',
            'materiali naturali', 'casa passiva', 'isolamento', 'certificazione'
        ]
        
        for term in technical_terms:
            if term.lower() in sentence.lower():
                score += 1.5
        
        # Keyword frequency in full content
        sentence_words = set(word.lower() for word in words if word.isalpha())
        content_words = word_tokenize(full_content.lower())
        content_freq = {}
        
        for word in content_words:
            if word.isalpha() and word not in italian_stopwords:
                content_freq[word] = content_freq.get(word, 0) + 1
        
        # Score based on word frequency
        for word in sentence_words:
            if word in content_freq:
                score += content_freq[word] * 0.1
        
        return score
    
    def _analyze_quality(self, summary, original_content):
        """Analyze summary quality metrics"""
        summary_words = len(word_tokenize(summary))
        original_words = len(word_tokenize(original_content))
        
        return {
            'coherence': 0.8,  # Simplified metric
            'completeness': min(1.0, summary_words / (original_words * 0.1)),
            'readability': 0.85,  # Simplified metric
            'compression_ratio': round((1 - summary_words / original_words) * 100, 2)
        }

# Initialize engines
recommendation_engine = RecommendationEngine()
summary_engine = SummaryEngine()

# Utility functions
def log_request(endpoint, success=True, **kwargs):
    """Log API request for analytics"""
    logger.info(f"API {endpoint} - Success: {success}", extra=kwargs)

def validate_json(required_fields):
    """Decorator to validate JSON request"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
            
            data = request.get_json()
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                return jsonify({
                    'error': 'Missing required fields',
                    'missing_fields': missing_fields
                }), 400
            
            return f(data, *args, **kwargs)
        return decorated_function
    return decorator

# Routes
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'environment': os.environ.get('FLASK_ENV', 'development'),
        'ai_models': {
            'openai': bool(openai.api_key),
            'spacy': bool(nlp),
            'huggingface': bool(summarizer)
        }
    })

@app.route('/api/recommendations', methods=['POST'])
@limiter.limit("10 per minute")
@validate_json([])
def get_recommendations(data):
    """Generate AI-powered article recommendations"""
    try:
        user_preferences = data.get('userPreferences', {})
        reading_history = data.get('readingHistory', [])
        current_context = data.get('currentContext', {})
        max_results = min(data.get('maxResults', 3), 10)
        
        result = recommendation_engine.generate_recommendations(
            user_preferences, reading_history, current_context, max_results
        )
        
        log_request('recommendations', True, method=result['method'])
        
        return jsonify({
            'success': True,
            'recommendations': result['recommendations'],
            'metadata': {
                'method': result['method'],
                'confidence': result['confidence'],
                'fallback_used': result['fallback_used']
            },
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        log_request('recommendations', False, error=str(e))
        return jsonify({
            'error': 'Failed to generate recommendations',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/summary', methods=['POST'])
@limiter.limit("5 per minute")
@validate_json(['content'])
def generate_summary(data):
    """Generate AI-powered article summary"""
    try:
        content = data['content']
        title = data.get('title')
        language = data.get('language', 'it')
        max_length = min(data.get('maxLength', 200), 500)
        style = data.get('style', 'professional')
        use_ai = data.get('useAI', True)
        
        if len(content) < 100:
            return jsonify({
                'error': 'Content too short',
                'message': 'Content must be at least 100 characters'
            }), 400
        
        result = summary_engine.generate_summary(
            content, title, language, max_length, style, use_ai
        )
        
        log_request('summary', True, method=result['method'])
        
        return jsonify({
            'success': True,
            'summary': result['summary'],
            'metadata': {
                'method': result['method'],
                'confidence': result['confidence'],
                'processing_time': result['processing_time'],
                'quality_metrics': result['quality_metrics']
            },
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        log_request('summary', False, error=str(e))
        return jsonify({
            'error': 'Failed to generate summary',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/feedback', methods=['POST'])
@validate_json(['rating', 'type'])
def submit_feedback(data):
    """Submit user feedback"""
    try:
        feedback_type = data['type']  # 'recommendation' or 'summary'
        rating = data['rating']
        comment = data.get('comment', '')
        
        if not 1 <= rating <= 4:
            return jsonify({
                'error': 'Invalid rating',
                'message': 'Rating must be between 1 and 4'
            }), 400
        
        # Store feedback (in production, save to database)
        feedback_data = {
            'type': feedback_type,
            'rating': rating,
            'comment': comment,
            'timestamp': datetime.utcnow().isoformat(),
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        }
        
        log_request('feedback', True, feedback_type=feedback_type, rating=rating)
        
        return jsonify({
            'success': True,
            'message': 'Feedback received successfully',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        log_request('feedback', False, error=str(e))
        return jsonify({
            'error': 'Failed to submit feedback',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/articles', methods=['GET'])
@cache.cached(timeout=300)  # Cache for 5 minutes
def get_articles():
    """Get articles with filtering and search"""
    try:
        category = request.args.get('category')
        tag = request.args.get('tag')
        search = request.args.get('search')
        limit = min(int(request.args.get('limit', 10)), 50)
        
        articles = ARTICLES.copy()
        
        # Apply filters
        if category:
            articles = [a for a in articles if a['category'].lower() == category.lower()]
        
        if tag:
            articles = [a for a in articles if tag.lower() in [t.lower() for t in a['tags']]]
        
        if search:
            search_lower = search.lower()
            articles = [a for a in articles if 
                       search_lower in a['title'].lower() or 
                       search_lower in a['excerpt'].lower()]
        
        # Limit results
        articles = articles[:limit]
        
        return jsonify({
            'success': True,
            'articles': articles,
            'total': len(articles),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get articles',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    """Handle rate limit exceeded"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': 'Too many requests. Please try again later.',
        'retry_after': str(e.retry_after),
        'timestamp': datetime.utcnow().isoformat()
    }), 429

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'path': request.path,
        'method': request.method,
        'timestamp': datetime.utcnow().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {e}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.utcnow().isoformat()
    }), 500

if __name__ == '__main__':
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    # Start the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Bioarchitettura Flask API on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)