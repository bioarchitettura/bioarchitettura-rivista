# Header Rules and Security Configuration

This document describes the comprehensive header rules and security configuration implemented for the bioarchitettura-rivista website.

## Overview

The site now implements a multi-layered approach to security and performance through:

1. **HTTP Headers** via `_headers` file
2. **Meta tag headers** via Jekyll layouts
3. **Redirect rules** via `_redirects` file
4. **Security configurations** in Jekyll `_config.yml`

## Implementation Details

### 1. _headers File

The `_headers` file provides HTTP-level security and performance headers for different types of content:

#### Global Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection for older browsers
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts access to browser features
- `Content-Security-Policy` - Comprehensive CSP for script/style sources

#### Performance Headers
- Static assets (CSS, JS, images): `max-age=31536000` (1 year cache)
- HTML pages: `max-age=3600` (1 hour cache) with revalidation
- Admin pages: `no-cache` for security

#### Content-Type Headers
- Proper MIME types for all static assets
- UTF-8 charset specification where applicable

### 2. Jekyll Layouts with Meta Headers

#### Base Layout (`_layouts/base.html`)
Provides comprehensive security headers via meta tags:
- All standard security headers as HTTP-equiv meta tags
- Content Security Policy optimized for the site's needs
- Open Graph and Twitter meta tags for social sharing
- Structured data (JSON-LD) for SEO
- Performance optimizations (DNS prefetch, preload)

#### Admin Layout (`_layouts/admin.html`)
Relaxed security headers for Netlify CMS functionality:
- `X-Frame-Options: SAMEORIGIN` (allows iframe embedding for CMS)
- Extended CSP to allow Netlify CMS scripts and APIs
- No-index meta tag for admin pages

### 3. Redirect Rules

The `_redirects` file handles URL redirections:

#### Main Redirect
- Root `/` redirects to `/public/` (302 temporary redirect)
- Maintains the current site structure while allowing future changes

#### Legacy URL Handling
- `/home`, `/index`, `/index.htm` redirect to `/public/`
- Ensures consistency with trailing slashes

#### Asset Redirections
- Images, CSS, JS requested from root redirect to `/public/`
- Maintains backward compatibility

#### Admin Protection
- Admin routes (`/admin/*`) are preserved
- API routes (`/api/*`) are preserved

### 4. Security Configuration

Enhanced Jekyll configuration includes:

#### Security Settings
```yaml
security:
  enable_csp: true
  enable_hsts: true
  frame_options: "DENY"
  content_type_options: "nosniff"
  xss_protection: "1; mode=block"
  referrer_policy: "strict-origin-when-cross-origin"
```

#### Performance Settings
```yaml
performance:
  preload_fonts: true
  dns_prefetch: true
  enable_compression: true
  cache_static_assets: true
```

## Integration with Existing Systems

### Netlify CMS Compatibility
- Admin layout allows necessary iframe embedding
- CSP permits Netlify identity and API access
- Form submission to external services (Formspree) is allowed

### GitHub Pages Deployment
- All files are properly included in Jekyll build
- Headers work with GitHub Pages hosting
- No server-side configuration required

### Redirect Resolution
The new header rules work seamlessly with existing redirects:

1. **No Conflicts**: Header rules apply to final destinations after redirects
2. **Admin Exception**: Admin pages have relaxed headers for CMS functionality
3. **Performance**: Static assets get long cache times after redirect resolution
4. **Security**: Root redirect page has no-cache headers to ensure fresh redirects

## Testing and Validation

### Security Headers Test
To test security headers:
```bash
curl -I https://yourdomain.github.io/
```

### Redirect Test
To test redirects:
```bash
curl -I https://yourdomain.github.io/
# Should return 302 redirect to /public/
```

### CSP Validation
- Use browser developer tools to check CSP violations
- Admin pages should allow Netlify CMS scripts
- Regular pages should block unauthorized scripts

## Benefits

### Security Improvements
- Protection against XSS, clickjacking, and MIME sniffing attacks
- Comprehensive Content Security Policy
- Controlled referrer information leakage
- Restricted browser feature access

### Performance Improvements
- Optimized caching strategies for different content types
- DNS prefetch for external resources
- Preload hints for critical resources
- Compressed asset delivery

### SEO and Accessibility
- Proper structured data markup
- Social media meta tags
- Canonical URLs
- Skip-to-content links

## Maintenance

### Updating Headers
- Modify `_headers` file for HTTP-level changes
- Update `_layouts/base.html` for meta tag changes
- Rebuild site with `bundle exec jekyll build`

### Adding New Redirects
- Add patterns to `_redirects` file
- Follow existing format: `from to status`
- Test redirects after deployment

### Security Policy Updates
- Review and update CSP as needed for new external resources
- Monitor browser console for CSP violations
- Update security headers based on security best practices

## Troubleshooting

### Common Issues

1. **CMS Not Loading**: Check admin layout CSP allows necessary domains
2. **Redirect Loops**: Verify `_redirects` patterns don't conflict
3. **Cache Issues**: Admin pages use no-cache, static assets use long cache
4. **Mobile Issues**: Viewport meta tag is included in base layout

### Browser Compatibility
- Modern browsers: Full header support
- Older browsers: Graceful degradation with meta tag fallbacks
- Internet Explorer: Basic security via meta tags

This implementation provides a robust, secure, and performant foundation for the bioarchitettura-rivista website while maintaining compatibility with existing systems and deployment processes.