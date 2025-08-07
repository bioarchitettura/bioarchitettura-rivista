# Bioarchitettura Magazine - Deployment Guide

## 🚀 Overview

This deployment guide covers the complete setup and deployment process for the Bioarchitettura Magazine website, a comprehensive Jekyll-based platform featuring editorial content, e-commerce functionality, AI integrations, and multilingual support.

## 📋 Quick Deployment Status

**⚡ For immediate Netlify deployment status and checklist, see: [NETLIFY_DEPLOYMENT_STATUS.md](./NETLIFY_DEPLOYMENT_STATUS.md)**

**Current Status**: ✅ READY FOR DEPLOYMENT

## 📋 System Requirements

### Development Environment
- **Ruby**: >= 3.0
- **Node.js**: >= 16.x
- **Bundler**: >= 2.0
- **Jekyll**: >= 4.0
- **Git**: >= 2.20

### Production Environment
- **GitHub Pages** (recommended) or any Jekyll-compatible hosting
- **PayPal Account** for e-commerce functionality
- **OpenAI API Key** (optional, for AI features)
- **Google Translate API Key** (optional, for enhanced translations)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/bioarchitettura/bioarchitettura-rivista.git
cd bioarchitettura-rivista
```

### 2. Install Dependencies
```bash
# Install Ruby dependencies
bundle install

# Install Node.js dependencies (if package.json exists)
npm install
```

### 3. Configuration Setup
Copy and configure the environment variables:

```bash
# Create environment file
cp .env.example .env
```

Edit `.env` with your configuration:
```bash
# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_ENVIRONMENT=sandbox  # or 'production'

# Google Translate (optional)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key

# Analytics (optional)
GOOGLE_ANALYTICS_ID=GA-XXXXXXX
```

### 4. Local Development
```bash
# Start development server
bundle exec jekyll serve --livereload

# With drafts and future posts
bundle exec jekyll serve --livereload --drafts --future
```

The site will be available at `http://localhost:4000`

## 🌐 Production Deployment

### GitHub Pages Deployment (Recommended)

#### 1. Repository Setup
1. Fork or use the main repository
2. Ensure the `main` or `deployment-ready` branch contains all changes
3. Go to repository **Settings** > **Pages**
4. Select **GitHub Actions** as source
5. The deployment workflow will trigger automatically on push

#### 2. Environment Variables
Set the following secrets in **Settings** > **Secrets and Variables** > **Actions**:

```
OPENAI_API_KEY (optional)
PAYPAL_CLIENT_ID
GOOGLE_TRANSLATE_API_KEY (optional)
```

#### 3. Custom Domain (Optional)
1. Add `CNAME` file to repository root with your domain
2. Configure DNS settings:
   ```
   CNAME: yourdomain.com -> username.github.io
   ```

### Manual Deployment

#### 1. Build the Site
```bash
# Production build
JEKYLL_ENV=production bundle exec jekyll build

# The built site will be in _site/
```

#### 2. Deploy to Hosting Provider
Upload the contents of `_site/` to your web server:

```bash
# Example: Deploy via rsync
rsync -avz --delete _site/ user@server:/path/to/webroot/

# Example: Deploy via FTP (using lftp)
lftp -c "mirror -R _site/ /public_html/ -x .git"
```

### Advanced Deployment Options

#### Docker Deployment
```bash
# Build Docker image
docker build -t bioarchitettura-magazine .

# Run container
docker run -d -p 80:4000 --name bioarch-site bioarchitettura-magazine
```

#### Netlify Deployment
1. Connect GitHub repository to Netlify
2. Set build command: `bundle exec jekyll build`
3. Set publish directory: `_site`
4. Add environment variables in Netlify dashboard
5. **Status**: ✅ Repository verified and ready for Netlify deployment
6. **See detailed checklist**: [NETLIFY_DEPLOYMENT_STATUS.md](./NETLIFY_DEPLOYMENT_STATUS.md)

## ⚙️ Configuration

### Core Settings (_config.yml)

#### Basic Configuration
```yaml
title: "Fondazione Italiana per la Bioarchitettura"
description: "L'Ente italiano di riferimento nell'ambito del costruire sano ed ecologico"
url: "https://yourdomain.com"
baseurl: ""
```

#### Advanced Features
```yaml
# PayPal Integration
paypal_merchant_email: "your-paypal@email.com"

# AI Features
max_related_articles: 3
recommendation_fallback: true

# Contact Information
contact:
  phone: "+39 0471 973097"
  email: "contact@yourdomain.com"
  address: "Your Address"
```

### E-commerce Setup

#### PayPal Configuration
1. Create PayPal Business Account
2. Get Client ID from PayPal Developer Console
3. Configure webhook endpoints for payment confirmation
4. Test in sandbox environment before going live

#### Product Management
Products are defined in `assets/js/shop.js`. To add new products:

```javascript
{
  id: 'unique-product-id',
  title: 'Product Name',
  description: 'Product description',
  price: 99.99,
  category: 'ebooks',
  type: 'digital', // 'digital', 'physical', 'service', 'subscription'
  image: '/images/products/product-image.jpg',
  features: ['Feature 1', 'Feature 2'],
  inStock: true
}
```

### Multilingual Setup

#### Static Translations
Add translations to `assets/js/translation.js`:

```javascript
'your.translation.key': {
  it: 'Testo in italiano',
  en: 'English text',
  de: 'Deutscher Text',
  fr: 'Texte français'
}
```

#### Dynamic Content Translation
- Automatic translation for content areas
- Google Translate API integration for enhanced accuracy
- Fallback to extractive translation for offline functionality

## 🎨 Customization

### Theme Customization
Modify CSS custom properties in `assets/css/main.css`:

```css
:root {
  --primary-color: #2c5530;
  --primary-light: #4a7c59;
  --secondary-color: #8b4513;
  /* Add your custom colors */
}
```

### Layout Customization
- Edit `_layouts/default.html` for global layout changes
- Modify `_layouts/post.html` for article layout
- Customize navigation in the default layout header

### Content Management
- Add blog posts to `_posts/` directory
- Use frontmatter for post metadata:
  ```yaml
  ---
  layout: post
  title: "Your Post Title"
  date: 2024-01-15
  category: "Category Name"
  tags: ["tag1", "tag2"]
  author: "Author Name"
  excerpt: "Short description"
  image: "/images/post-image.jpg"
  ---
  ```

## 🔍 SEO and Analytics

### Search Engine Optimization
- Automatic sitemap generation via jekyll-sitemap
- SEO tags via jekyll-seo-tag
- Open Graph and Twitter Card meta tags
- Structured data markup for articles

### Analytics Setup
1. Add Google Analytics ID to `_config.yml`
2. Configure Google Tag Manager (optional)
3. Set up Google Search Console
4. Monitor Core Web Vitals with Lighthouse CI

## 🚦 Performance Optimization

### Build Optimization
- CSS minification via Jekyll
- JavaScript minification in production workflow
- Image optimization (PNG, JPEG)
- Asset compression

### Runtime Performance
- Lazy loading for images
- Service Worker for caching (optional)
- CDN integration for static assets
- Database-free architecture for speed

## 🔐 Security

### Security Headers
Configured automatically via GitHub Actions:
- Content Security Policy (CSP)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection

### PayPal Security
- HTTPS required for production
- Client-side only integration (no server secrets exposed)
- Payment processing handled by PayPal (PCI compliant)

## 📊 Monitoring and Maintenance

### Health Checks
- Automatic deployment health checks
- Lighthouse performance audits
- Broken link monitoring
- Form submission testing

### Backup Strategy
- Git repository serves as primary backup
- Regular exports of form submissions
- Image and asset backups via Git LFS (if needed)

### Updates
- Monitor Jekyll and dependency updates
- Test changes in staging environment
- Use semantic versioning for releases

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Jekyll cache
bundle exec jekyll clean

# Rebuild dependencies
bundle install
bundle update

# Check for Ruby version conflicts
bundle exec ruby --version
```

#### PayPal Integration Issues
- Verify Client ID is correct for environment (sandbox/production)
- Check browser console for JavaScript errors
- Ensure HTTPS is enabled for production
- Test with PayPal sandbox accounts

#### Translation Problems
- Verify translation keys exist in translation.js
- Check browser console for JavaScript errors
- Ensure Google Translate API key is valid
- Test fallback translation functionality

#### Performance Issues
- Run Lighthouse audit to identify bottlenecks
- Optimize large images
- Enable compression at server level
- Use CDN for static assets

### Debug Mode
Enable debug mode for troubleshooting:

```bash
# Development with debug output
JEKYLL_LOG_LEVEL=debug bundle exec jekyll serve --verbose --trace
```

### Log Analysis
Check logs for common issues:
- Jekyll build errors
- JavaScript console errors
- Network request failures
- PayPal integration problems

## 📞 Support

### Community Support
- GitHub Issues for bug reports and feature requests
- Documentation wiki for detailed guides
- Community forum for discussions

### Professional Support
- Technical consulting available
- Custom development services
- Training and workshops

### Emergency Contacts
- System Administrator: admin@bioarchitettura.org
- Technical Support: tech@bioarchitettura.org
- Business Inquiries: info@bioarchitettura.org

---

## 📚 Additional Resources

### Documentation Links
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PayPal Developer Documentation](https://developer.paypal.com/)

### Development Tools
- [Jekyll Theme Inspector](https://github.com/jekyll/jekyll-theme-inspector)
- [HTML Validator](https://validator.w3.org/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

### Design Resources
- [Font Awesome Icons](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [Unsplash Images](https://unsplash.com/)

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Maintained by**: Bioarchitettura Development Team