<?php
/**
 * Configuration file for Bioarchitettura PHP API
 */

// Environment settings
define('DEBUG_MODE', $_ENV['DEBUG_MODE'] ?? false);
define('ENVIRONMENT', $_ENV['ENVIRONMENT'] ?? 'development');

// Database configuration
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'bioarchitettura');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// Redis configuration
define('REDIS_HOST', $_ENV['REDIS_HOST'] ?? 'localhost');
define('REDIS_PORT', $_ENV['REDIS_PORT'] ?? 6379);
define('REDIS_PASSWORD', $_ENV['REDIS_PASSWORD'] ?? null);

// OpenAI configuration
define('OPENAI_API_KEY', $_ENV['OPENAI_API_KEY'] ?? '');

// JWT configuration
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'your-jwt-secret-here');
define('JWT_EXPIRY', $_ENV['JWT_EXPIRY'] ?? 86400); // 24 hours

// API configuration
define('API_VERSION', '1.0.0');
define('MAX_REQUESTS_PER_MINUTE', $_ENV['MAX_REQUESTS_PER_MINUTE'] ?? 60);
define('CACHE_TTL', $_ENV['CACHE_TTL'] ?? 300); // 5 minutes

// Security settings
define('BCRYPT_COST', $_ENV['BCRYPT_COST'] ?? 12);
define('MAX_UPLOAD_SIZE', $_ENV['MAX_UPLOAD_SIZE'] ?? 10485760); // 10MB

// External API keys
define('GOOGLE_TRANSLATE_API_KEY', $_ENV['GOOGLE_TRANSLATE_API_KEY'] ?? '');
define('TIDIO_API_KEY', $_ENV['TIDIO_API_KEY'] ?? '');

// Timezone
date_default_timezone_set('Europe/Rome');

// Error handling
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(E_ERROR | E_WARNING | E_PARSE);
}

// Security headers function
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

// CORS configuration
$allowedOrigins = [
    'http://localhost:4000',
    'https://bioarchitettura.github.io',
    'https://bioarchitettura.org'
];

function setCorsHeaders($allowedOrigins) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

// Load environment variables from .env file if it exists
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}
?>