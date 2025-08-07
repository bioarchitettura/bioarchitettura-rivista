# Deployment Guide - Fondazione Bioarchitettura Website

## 🚀 Production Deployment

### Netlify Deployment (Recommended)

#### Quick Setup
1. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select `bioarchitettura/bioarchitettura-rivista` repository

2. **Build Settings:**
   - **Build command**: `jekyll build`
   - **Publish directory**: `_site`
   - **Environment**: `JEKYLL_ENV=production`

3. **Domain Setup:**
   - Configure custom domain: `bioarchitettura.org`
   - SSL certificate will be automatically provisioned
   - Set up redirects if needed

#### Environment Variables
Set these in Netlify dashboard:

```bash
JEKYLL_ENV=production
PAYPAL_CLIENT_ID=your_production_paypal_client_id
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### GitHub Pages Alternative

If using GitHub Pages instead of Netlify:

1. **Enable GitHub Pages:**
   - Repository Settings > Pages
   - Source: GitHub Actions

2. **Workflow:**
   The repository includes `.github/workflows/jekyll-gh-pages.yml` for automatic deployment

### Manual Server Deployment

For traditional web hosting:

```bash
# Build locally
JEKYLL_ENV=production jekyll build

# Upload _site/ directory to your web server
rsync -avz _site/ user@server:/var/www/html/
```

## ⚙️ Configuration for Production

### 1. Update _config.yml

```yaml
# Production URL
url: "https://bioarchitettura.org"
baseurl: ""

# Enable plugins for production
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
  - jekyll-paginate

# PayPal Production Settings
paypal:
  client_id: "your-production-paypal-client-id"
  environment: "production"
  merchant_email: "hannes.mitterer@gmail.com"

# Analytics
analytics:
  google_analytics_id: "GA-XXXXXXXXX"
```

### 2. PayPal Integration Setup

#### Get PayPal Client ID:
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a new app
3. Copy the Client ID for production
4. Add it to your environment variables

#### Test PayPal Integration:
1. Use sandbox mode first: `environment: "sandbox"`
2. Test with PayPal sandbox accounts
3. Switch to production when ready

### 3. Analytics Setup

#### Google Analytics:
1. Create Google Analytics account
2. Set up property for bioarchitettura.org
3. Get tracking ID (GA-XXXXXXXXX)
4. Add to _config.yml

## 🔒 Security Considerations

### 1. Environment Variables
Never commit sensitive data to the repository:
- PayPal Client IDs
- Google Analytics IDs
- API keys

### 2. Content Security Policy
The site includes CSP headers for security:

```yaml
security:
  content_security_policy: "default-src 'self'; script-src 'self' 'unsafe-inline' *.paypal.com *.paypalobjects.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: *; connect-src 'self' api.openai.com translate.googleapis.com;"
```

### 3. SSL Certificate
- Netlify provides automatic SSL
- For manual hosting, ensure SSL is configured

## 📊 Performance Optimization

### 1. Image Optimization
- Use WebP format when possible
- Implement lazy loading (already included)
- Optimize image sizes for different screen sizes

### 2. Caching Strategy
- Static assets cached for 1 year
- HTML cached for 1 hour
- API responses cached appropriately

### 3. CDN Setup
- Netlify includes global CDN
- For manual hosting, consider CloudFlare

## 🧪 Pre-deployment Testing

### Local Testing Checklist:
```bash
# 1. Build the site
JEKYLL_ENV=production jekyll build

# 2. Serve locally to test
jekyll serve --host 0.0.0.0

# 3. Test key functionality:
# - Homepage loads correctly
# - Shop functionality works
# - Language switching works
# - Cart operations function
# - Contact forms work
# - Mobile responsive design
# - PayPal integration (sandbox)
```

### Browser Testing:
- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔄 Continuous Deployment

### Netlify Auto-deploy:
- Automatic deployment on git push to main branch
- Preview deployments for pull requests
- Build notifications via email/Slack

### Manual Deployment Process:
1. Test locally with production build
2. Commit changes to repository
3. Push to main branch
4. Verify deployment in staging
5. Test all critical functionality
6. Announce maintenance window if needed
7. Deploy to production

## 📈 Post-deployment Monitoring

### 1. Analytics Setup:
- Monitor page views and user behavior
- Track e-commerce conversions
- Monitor site performance

### 2. Error Monitoring:
- Set up uptime monitoring
- Monitor JavaScript errors
- Track 404 errors

### 3. Regular Maintenance:
- Update Jekyll and dependencies monthly
- Review and update product catalog
- Check and update contact information
- Monitor SSL certificate expiration

## 🆘 Troubleshooting

### Common Issues:

#### Build Fails:
```bash
# Check Jekyll version
jekyll --version

# Rebuild with verbose output
jekyll build --verbose

# Clear cache and rebuild
jekyll clean && jekyll build
```

#### PayPal Not Working:
- Verify Client ID is correct
- Check environment setting (sandbox vs production)
- Ensure merchant email is correct
- Test with PayPal sandbox first

#### Language Switching Issues:
- Check translation.js is loaded
- Verify language files are present
- Check browser console for JavaScript errors

#### Mobile Issues:
- Test viewport meta tag is present
- Verify CSS media queries
- Check touch events work properly

## 📞 Support Contacts

- **Technical Issues**: bioa@bioarchitettura.org
- **PayPal Support**: merchant.technical.support@paypal.com
- **Domain Issues**: Contact domain registrar
- **Hosting Issues**: Contact Netlify support

---

**Last Updated**: January 2025  
**Deployment Version**: 2.0.0
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