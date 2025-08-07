<?php
/**
 * Bioarchitettura Magazine PHP API
 * Advanced PHP backend with AI features and security
 */

require_once 'config/config.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Predis\Client as RedisClient;
use OpenAI\Client as OpenAIClient;

// Initialize error reporting for development
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set JSON header
header('Content-Type: application/json');
header('X-Powered-By: Bioarchitettura-API/1.0');

// CORS headers
$allowed_origins = [
    'http://localhost:4000',
    'https://bioarchitettura.github.io',
    'https://bioarchitettura.org'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: null");
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CSP header
$csp = "default-src 'self'; " .
       "script-src 'self' 'unsafe-inline' *.openai.com *.tidio.co; " .
       "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " .
       "font-src 'self' fonts.gstatic.com; " .
       "img-src 'self' data: *; " .
       "connect-src 'self' api.openai.com translate.googleapis.com";
header("Content-Security-Policy: $csp");

class BioarchitetturaAPI
{
    private $redis;
    private $openai;
    private $articles;
    private $pdo;
    
    public function __construct()
    {
        // Initialize Redis for caching and rate limiting
        try {
            $this->redis = new RedisClient([
                'scheme' => 'tcp',
                'host' => REDIS_HOST,
                'port' => REDIS_PORT,
                'password' => REDIS_PASSWORD
            ]);
        } catch (Exception $e) {
            $this->logError('Redis connection failed: ' . $e->getMessage());
            $this->redis = null;
        }
        
        // Initialize OpenAI client
        if (OPENAI_API_KEY) {
            try {
                $this->openai = OpenAI::client(OPENAI_API_KEY);
            } catch (Exception $e) {
                $this->logError('OpenAI initialization failed: ' . $e->getMessage());
                $this->openai = null;
            }
        }
        
        // Initialize database connection
        try {
            $this->pdo = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            $this->logError('Database connection failed: ' . $e->getMessage());
            $this->pdo = null;
        }
        
        // Load articles (in production, this would come from database)
        $this->articles = $this->loadArticles();
    }
    
    /**
     * Main API router
     */
    public function handleRequest()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = rtrim($path, '/');
        
        // Remove base path if present
        if (strpos($path, '/api') === 0) {
            $path = substr($path, 4);
        }
        
        try {
            // Rate limiting
            if (!$this->checkRateLimit()) {
                $this->respondError('Rate limit exceeded', 429, [
                    'retry_after' => '60 seconds'
                ]);
                return;
            }
            
            // Route requests
            switch ($path) {
                case '/health':
                    $this->healthCheck();
                    break;
                    
                case '/recommendations':
                    if ($method === 'POST') {
                        $this->generateRecommendations();
                    } else {
                        $this->respondError('Method not allowed', 405);
                    }
                    break;
                    
                case '/summary':
                    if ($method === 'POST') {
                        $this->generateSummary();
                    } else {
                        $this->respondError('Method not allowed', 405);
                    }
                    break;
                    
                case '/feedback':
                    if ($method === 'POST') {
                        $this->submitFeedback();
                    } else {
                        $this->respondError('Method not allowed', 405);
                    }
                    break;
                    
                case '/articles':
                    if ($method === 'GET') {
                        $this->getArticles();
                    } else {
                        $this->respondError('Method not allowed', 405);
                    }
                    break;
                    
                default:
                    $this->respondError('Endpoint not found', 404);
            }
            
        } catch (Exception $e) {
            $this->logError('API Error: ' . $e->getMessage());
            $this->respondError('Internal server error', 500);
        }
    }
    
    /**
     * Health check endpoint
     */
    private function healthCheck()
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '1.0.0',
            'environment' => DEBUG_MODE ? 'development' : 'production',
            'services' => [
                'redis' => $this->redis ? 'connected' : 'disconnected',
                'openai' => $this->openai ? 'configured' : 'not configured',
                'database' => $this->pdo ? 'connected' : 'disconnected'
            ]
        ];
        
        $this->respondSuccess($health);
    }
    
    /**
     * Generate AI-powered recommendations
     */
    private function generateRecommendations()
    {
        $input = $this->getJsonInput();
        
        if (!$input) {
            $this->respondError('Invalid JSON input', 400);
            return;
        }
        
        $userPreferences = $input['userPreferences'] ?? [];
        $readingHistory = $input['readingHistory'] ?? [];
        $currentContext = $input['currentContext'] ?? [];
        $maxResults = min($input['maxResults'] ?? 3, 10);
        
        // Check cache first
        $cacheKey = 'recommendations:' . md5(serialize($input));
        $cached = $this->getFromCache($cacheKey);
        
        if ($cached) {
            $this->respondSuccess([
                'recommendations' => $cached,
                'metadata' => [
                    'method' => 'cached',
                    'cache_hit' => true
                ],
                'timestamp' => date('c')
            ]);
            return;
        }
        
        try {
            // Try AI recommendations first
            if ($this->openai) {
                $recommendations = $this->generateAIRecommendations(
                    $userPreferences, $readingHistory, $currentContext, $maxResults
                );
                
                if ($recommendations) {
                    $this->setCache($cacheKey, $recommendations, 300); // Cache for 5 minutes
                    
                    $this->respondSuccess([
                        'recommendations' => $recommendations,
                        'metadata' => [
                            'method' => 'ai',
                            'confidence' => 0.9,
                            'fallback_used' => false
                        ],
                        'timestamp' => date('c')
                    ]);
                    return;
                }
            }
            
            // Fallback to rule-based recommendations
            $recommendations = $this->generateFallbackRecommendations(
                $userPreferences, $readingHistory, $currentContext, $maxResults
            );
            
            $this->setCache($cacheKey, $recommendations, 300);
            
            $this->respondSuccess([
                'recommendations' => $recommendations,
                'metadata' => [
                    'method' => 'fallback',
                    'confidence' => 0.7,
                    'fallback_used' => true
                ],
                'timestamp' => date('c')
            ]);
            
        } catch (Exception $e) {
            $this->logError('Recommendation generation failed: ' . $e->getMessage());
            $this->respondError('Failed to generate recommendations', 500);
        }
    }
    
    /**
     * Generate AI recommendations using OpenAI
     */
    private function generateAIRecommendations($userPreferences, $readingHistory, $currentContext, $maxResults)
    {
        if (!$this->openai) {
            return null;
        }
        
        $prompt = $this->buildAIPrompt($userPreferences, $readingHistory, $currentContext);
        
        try {
            $response = $this->openai->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert in sustainable architecture. Recommend articles based on user context. Respond with JSON containing article URLs in order of relevance.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => 300,
                'temperature' => 0.3
            ]);
            
            $content = $response->choices[0]->message->content;
            return $this->parseAIResponse($content, $maxResults);
            
        } catch (Exception $e) {
            $this->logError('OpenAI API error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Build AI prompt for recommendations
     */
    private function buildAIPrompt($userPreferences, $readingHistory, $currentContext)
    {
        $prompt = "Recommend bioarchitettura articles based on:\n\n";
        
        if (!empty($currentContext['pageType'])) {
            $prompt .= "Current page type: {$currentContext['pageType']}\n";
        }
        
        if (!empty($currentContext['category'])) {
            $prompt .= "Current category: {$currentContext['category']}\n";
        }
        
        if (!empty($currentContext['tags'])) {
            $prompt .= "Current tags: " . implode(', ', $currentContext['tags']) . "\n";
        }
        
        if (!empty($userPreferences['categories'])) {
            $prompt .= "User preferences: " . json_encode($userPreferences['categories']) . "\n";
        }
        
        $prompt .= "\nAvailable articles:\n";
        foreach ($this->articles as $i => $article) {
            $num = $i + 1;
            $prompt .= "{$num}. \"{$article['title']}\" - {$article['category']} - {$article['url']}\n";
        }
        
        $prompt .= "\nRecommend the most relevant articles.";
        
        return $prompt;
    }
    
    /**
     * Parse AI response and match to articles
     */
    private function parseAIResponse($response, $maxResults)
    {
        // Extract URLs from response
        preg_match_all('/\/\d{4}\/\d{2}\/\d{2}\/[^\s"]+/', $response, $matches);
        $urls = $matches[0] ?? [];
        
        $recommendations = [];
        foreach (array_slice($urls, 0, $maxResults) as $url) {
            foreach ($this->articles as $article) {
                if (strpos($article['url'], $url) !== false) {
                    $recommendations[] = array_merge($article, [
                        'score' => 0.9,
                        'confidence' => 0.9
                    ]);
                    break;
                }
            }
        }
        
        return $recommendations;
    }
    
    /**
     * Generate fallback recommendations using rule-based approach
     */
    private function generateFallbackRecommendations($userPreferences, $readingHistory, $currentContext, $maxResults)
    {
        $scoredArticles = [];
        
        foreach ($this->articles as $article) {
            $score = $this->calculateRecommendationScore($article, $userPreferences, $readingHistory, $currentContext);
            $scoredArticles[] = array_merge($article, [
                'score' => $score,
                'confidence' => min(0.9, $score / 10)
            ]);
        }
        
        // Sort by score and return top results
        usort($scoredArticles, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        return array_slice($scoredArticles, 0, $maxResults);
    }
    
    /**
     * Calculate recommendation score for fallback system
     */
    private function calculateRecommendationScore($article, $userPreferences, $readingHistory, $currentContext)
    {
        $score = 0;
        
        // Category scoring
        if (!empty($currentContext['category']) && $currentContext['category'] === $article['category']) {
            $score += 3;
        }
        
        // Tag relevance
        if (!empty($currentContext['tags']) && !empty($article['tags'])) {
            $commonTags = array_intersect(
                array_map('strtolower', $currentContext['tags']),
                array_map('strtolower', $article['tags'])
            );
            $score += count($commonTags) * 1.5;
        }
        
        // User preferences
        if (!empty($userPreferences['categories'][$article['category']])) {
            $score += $userPreferences['categories'][$article['category']] * 2;
        }
        
        // Featured boost
        if ($article['featured']) {
            $score += 2;
        }
        
        // Reading time preference
        $preferredTime = $userPreferences['averageReadingTime'] ?? 12;
        $timeDiff = abs($article['reading_time'] - $preferredTime);
        $score += max(0, 5 - $timeDiff * 0.5);
        
        // Avoid recently read
        foreach ($readingHistory as $read) {
            if ($read['url'] === $article['url']) {
                $score *= 0.3;
                break;
            }
        }
        
        return $score;
    }
    
    /**
     * Generate summary with AI and extractive fallback
     */
    private function generateSummary()
    {
        $input = $this->getJsonInput();
        
        if (!$input || empty($input['content'])) {
            $this->respondError('Content is required', 400);
            return;
        }
        
        $content = $input['content'];
        $title = $input['title'] ?? '';
        $language = $input['language'] ?? 'it';
        $maxLength = min($input['maxLength'] ?? 200, 500);
        $style = $input['style'] ?? 'professional';
        $useAI = $input['useAI'] ?? true;
        
        if (strlen($content) < 100) {
            $this->respondError('Content too short (minimum 100 characters)', 400);
            return;
        }
        
        $startTime = microtime(true);
        
        try {
            // Try AI summarization first
            if ($useAI && $this->openai) {
                $summary = $this->generateAISummary($content, $title, $language, $maxLength, $style);
                
                if ($summary) {
                    $processingTime = microtime(true) - $startTime;
                    
                    $this->respondSuccess([
                        'summary' => $summary,
                        'metadata' => [
                            'method' => 'ai',
                            'confidence' => 0.9,
                            'processing_time' => round($processingTime, 3),
                            'word_count' => [
                                'original' => str_word_count($content),
                                'summary' => str_word_count($summary)
                            ]
                        ],
                        'timestamp' => date('c')
                    ]);
                    return;
                }
            }
            
            // Fallback to extractive summarization
            $summary = $this->generateExtractiveSummary($content, $maxLength);
            $processingTime = microtime(true) - $startTime;
            
            $this->respondSuccess([
                'summary' => $summary,
                'metadata' => [
                    'method' => 'extractive',
                    'confidence' => 0.7,
                    'processing_time' => round($processingTime, 3),
                    'word_count' => [
                        'original' => str_word_count($content),
                        'summary' => str_word_count($summary)
                    ]
                ],
                'timestamp' => date('c')
            ]);
            
        } catch (Exception $e) {
            $this->logError('Summary generation failed: ' . $e->getMessage());
            $this->respondError('Failed to generate summary', 500);
        }
    }
    
    /**
     * Generate AI summary using OpenAI
     */
    private function generateAISummary($content, $title, $language, $maxLength, $style)
    {
        if (!$this->openai) {
            return null;
        }
        
        $styleInstructions = [
            'professional' => 'Use a professional and formal tone.',
            'conversational' => 'Use a conversational and accessible tone.',
            'academic' => 'Use an academic tone with technical terminology.',
            'simplified' => 'Use simple and easy-to-understand language.'
        ];
        
        $prompt = "Summarize this bioarchitettura article in {$language} language, approximately {$maxLength} words. ";
        $prompt .= $styleInstructions[$style] ?? '';
        $prompt .= "\n\nTitle: {$title}\n\nContent: " . substr($content, 0, 4000); // Limit content length
        
        try {
            $response = $this->openai->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert copywriter for sustainable architecture. Create clear, engaging summaries.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'max_tokens' => $maxLength * 2,
                'temperature' => 0.7
            ]);
            
            return trim($response->choices[0]->message->content);
            
        } catch (Exception $e) {
            $this->logError('OpenAI summarization failed: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Generate extractive summary
     */
    private function generateExtractiveSummary($content, $maxLength)
    {
        // Simple extractive summarization
        $sentences = preg_split('/[.!?]+/', $content);
        $sentences = array_filter(array_map('trim', $sentences));
        
        // Score sentences
        $scoredSentences = [];
        $totalSentences = count($sentences);
        
        foreach ($sentences as $i => $sentence) {
            if (strlen($sentence) < 20) continue; // Skip very short sentences
            
            $score = 0;
            
            // Position scoring (beginning and end are important)
            if ($i < $totalSentences * 0.2 || $i > $totalSentences * 0.8) {
                $score += 2;
            }
            
            // Length scoring (prefer medium-length sentences)
            $wordCount = str_word_count($sentence);
            if ($wordCount >= 10 && $wordCount <= 30) {
                $score += 1;
            }
            
            // Technical terms scoring
            $technicalTerms = [
                'bioarchitettura', 'sostenibile', 'ecologico', 'efficienza energetica',
                'materiali naturali', 'casa passiva', 'isolamento', 'certificazione'
            ];
            
            foreach ($technicalTerms as $term) {
                if (stripos($sentence, $term) !== false) {
                    $score += 1.5;
                }
            }
            
            $scoredSentences[] = ['sentence' => $sentence, 'score' => $score, 'index' => $i];
        }
        
        // Sort by score
        usort($scoredSentences, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        // Select sentences up to word limit
        $selectedSentences = [];
        $currentWords = 0;
        
        foreach ($scoredSentences as $item) {
            $sentenceWords = str_word_count($item['sentence']);
            if ($currentWords + $sentenceWords <= $maxLength) {
                $selectedSentences[] = $item;
                $currentWords += $sentenceWords;
            }
        }
        
        // Sort by original order
        usort($selectedSentences, function($a, $b) {
            return $a['index'] <=> $b['index'];
        });
        
        return implode('. ', array_column($selectedSentences, 'sentence')) . '.';
    }
    
    /**
     * Submit user feedback
     */
    private function submitFeedback()
    {
        $input = $this->getJsonInput();
        
        if (!$input || !isset($input['rating']) || !isset($input['type'])) {
            $this->respondError('Rating and type are required', 400);
            return;
        }
        
        $rating = (int)$input['rating'];
        $type = $input['type'];
        $comment = $input['comment'] ?? '';
        
        if ($rating < 1 || $rating > 4) {
            $this->respondError('Rating must be between 1 and 4', 400);
            return;
        }
        
        if (!in_array($type, ['recommendation', 'summary'])) {
            $this->respondError('Invalid feedback type', 400);
            return;
        }
        
        try {
            // Store feedback (in production, save to database)
            $feedbackData = [
                'type' => $type,
                'rating' => $rating,
                'comment' => $comment,
                'timestamp' => date('c'),
                'ip' => $this->getClientIP(),
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
            ];
            
            // Log feedback
            $this->logInfo('Feedback received', $feedbackData);
            
            $this->respondSuccess([
                'message' => 'Feedback received successfully',
                'timestamp' => date('c')
            ]);
            
        } catch (Exception $e) {
            $this->logError('Failed to submit feedback: ' . $e->getMessage());
            $this->respondError('Failed to submit feedback', 500);
        }
    }
    
    /**
     * Get articles with filtering
     */
    private function getArticles()
    {
        $category = $_GET['category'] ?? null;
        $tag = $_GET['tag'] ?? null;
        $search = $_GET['search'] ?? null;
        $limit = min((int)($_GET['limit'] ?? 10), 50);
        
        $articles = $this->articles;
        
        // Apply filters
        if ($category) {
            $articles = array_filter($articles, function($article) use ($category) {
                return strcasecmp($article['category'], $category) === 0;
            });
        }
        
        if ($tag) {
            $articles = array_filter($articles, function($article) use ($tag) {
                return in_array(strtolower($tag), array_map('strtolower', $article['tags']));
            });
        }
        
        if ($search) {
            $searchLower = strtolower($search);
            $articles = array_filter($articles, function($article) use ($searchLower) {
                return strpos(strtolower($article['title']), $searchLower) !== false ||
                       strpos(strtolower($article['excerpt']), $searchLower) !== false;
            });
        }
        
        // Limit results
        $articles = array_slice(array_values($articles), 0, $limit);
        
        $this->respondSuccess([
            'articles' => $articles,
            'total' => count($articles),
            'timestamp' => date('c')
        ]);
    }
    
    /**
     * Load articles data
     */
    private function loadArticles()
    {
        return [
            [
                'title' => 'Materiali Naturali in Bioarchitettura: Guida Completa 2024',
                'url' => '/2024/01/10/materiali-naturali-bioarchitettura-guida-completa.html',
                'excerpt' => 'Alla scoperta dei materiali naturali per la bioarchitettura: proprietà, vantaggi e applicazioni pratiche per costruire in armonia con l\'ambiente.',
                'category' => 'Materiali Naturali',
                'tags' => ['materiali naturali', 'legno', 'paglia', 'terra cruda', 'canapa', 'sughero', 'sostenibilità'],
                'reading_time' => 12,
                'featured' => true,
                'date' => '2024-01-10'
            ],
            [
                'title' => 'Efficienza Energetica negli Edifici: Strategie e Tecnologie Innovative',
                'url' => '/2024/01/05/efficienza-energetica-edifici-strategie-tecnologie.html',
                'excerpt' => 'Strategie avanzate e tecnologie innovative per massimizzare l\'efficienza energetica degli edifici: dalla progettazione bioclimatica agli impianti intelligenti.',
                'category' => 'Efficienza Energetica',
                'tags' => ['efficienza energetica', 'impianti', 'isolamento', 'smart building', 'automazione'],
                'reading_time' => 10,
                'featured' => true,
                'date' => '2024-01-05'
            ],
            [
                'title' => 'Casa Passiva: Il Futuro dell\'Abitare Sostenibile',
                'url' => '/2024/01/15/casa-passiva-futuro-abitare-sostenibile.html',
                'excerpt' => 'Standard Passivhaus e tecnologie per case ad altissima efficienza energetica: comfort ottimale con consumi minimi.',
                'category' => 'Casa Passiva',
                'tags' => ['casa passiva', 'passivhaus', 'comfort', 'ventilazione', 'isolamento'],
                'reading_time' => 14,
                'featured' => true,
                'date' => '2024-01-15'
            ]
        ];
    }
    
    /**
     * Rate limiting check
     */
    private function checkRateLimit()
    {
        if (!$this->redis) {
            return true; // Skip rate limiting if Redis is not available
        }
        
        $clientIP = $this->getClientIP();
        $key = "rate_limit:{$clientIP}";
        
        try {
            $current = $this->redis->incr($key);
            if ($current === 1) {
                $this->redis->expire($key, 60); // 1 minute window
            }
            
            return $current <= 60; // 60 requests per minute
            
        } catch (Exception $e) {
            $this->logError('Rate limiting error: ' . $e->getMessage());
            return true; // Allow request if rate limiting fails
        }
    }
    
    /**
     * Get data from cache
     */
    private function getFromCache($key)
    {
        if (!$this->redis) {
            return null;
        }
        
        try {
            $data = $this->redis->get($key);
            return $data ? json_decode($data, true) : null;
        } catch (Exception $e) {
            $this->logError('Cache get error: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Set data in cache
     */
    private function setCache($key, $data, $ttl = 300)
    {
        if (!$this->redis) {
            return false;
        }
        
        try {
            return $this->redis->setex($key, $ttl, json_encode($data));
        } catch (Exception $e) {
            $this->logError('Cache set error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get JSON input
     */
    private function getJsonInput()
    {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
    
    /**
     * Get client IP address
     */
    private function getClientIP()
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];
        
        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                return trim($ips[0]);
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    /**
     * Respond with success
     */
    private function respondSuccess($data, $code = 200)
    {
        http_response_code($code);
        echo json_encode(array_merge(['success' => true], $data));
        exit();
    }
    
    /**
     * Respond with error
     */
    private function respondError($message, $code = 400, $extra = [])
    {
        http_response_code($code);
        echo json_encode(array_merge([
            'success' => false,
            'error' => $message,
            'timestamp' => date('c')
        ], $extra));
        exit();
    }
    
    /**
     * Log error message
     */
    private function logError($message)
    {
        error_log("[ERROR] " . date('Y-m-d H:i:s') . " - " . $message, 3, 'logs/error.log');
    }
    
    /**
     * Log info message
     */
    private function logInfo($message, $context = [])
    {
        $log = "[INFO] " . date('Y-m-d H:i:s') . " - " . $message;
        if (!empty($context)) {
            $log .= " - " . json_encode($context);
        }
        error_log($log, 3, 'logs/app.log');
    }
}

// Create logs directory
if (!is_dir('logs')) {
    mkdir('logs', 0755, true);
}

// Initialize and run the API
$api = new BioarchitetturaAPI();
$api->handleRequest();
?>