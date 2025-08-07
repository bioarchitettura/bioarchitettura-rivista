# Fondazione Italiana per la Bioarchitettura - Website

A comprehensive Jekyll-based website for the Italian Foundation for Bioarchitecture featuring modern e-commerce capabilities, multilingual support, and responsive design.

## 🌟 Features

### 🌐 Multilingual Support
- **4-language support**: Italian (primary), English, German, French
- **Flag-based language selector** in top navigation
- **Real-time translation** of UI elements, navigation, and content
- **Language persistence** across sessions
- **Google Translate integration** ready for content translation

### 🛒 E-Commerce Platform
- **8 product categories**: E-books, Courses, Webinars, Consultations, Subscriptions, Materials, Certifications, Magazines
- **Advanced shopping cart** with quantity controls, item management, and local storage persistence
- **Product catalog** with detailed product pages, image galleries, ratings, and specifications
- **Category filtering** and search functionality
- **PayPal integration** configured for payments (hannes.mitterer@gmail.com)
- **Digital download support** for e-books and digital materials

### 📱 Responsive Design
- **Mobile-first approach** with CSS Grid and Flexbox
- **Touch-friendly interface** optimized for tablets and smartphones
- **Collapsible navigation** with hamburger menu for mobile
- **Responsive product grids** that adapt to screen size
- **Optimized images** with lazy loading

### 🏗️ Technical Architecture
- **Jekyll static site generator** for fast loading and easy deployment
- **Vanilla JavaScript** with no framework dependencies
- **Progressive enhancement** for accessibility
- **Semantic HTML5** structure
- **CSS custom properties** for consistent theming
- **Local storage** for cart persistence

### 📊 Analytics & Integration
- **Google Analytics** integration ready
- **Social media links** for Facebook and LinkedIn
- **Contact forms** and newsletter subscription
- **SEO optimization** with meta tags and structured data

## 🚀 Quick Start

### Prerequisites
- Ruby 3.0+
- Jekyll 4.0+
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bioarchitettura/bioarchitettura-rivista.git
   cd bioarchitettura-rivista
   ```

2. **Install Jekyll (if not already installed):**
   ```bash
   gem install jekyll bundler
   ```

3. **Start the development server:**
   ```bash
   jekyll serve --host 0.0.0.0 --port 4000
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4000`

### Build for Production

```bash
# Build the site
jekyll build

# Output will be in _site/ directory
```

## 📁 Project Structure

```
├── _config.yml                 # Jekyll configuration
├── _layouts/                   # Page layouts
│   ├── default.html           # Main layout with navigation/footer
│   └── product.html           # Product detail page layout
├── _products/                  # Product collection
│   ├── ebook-bioarchitettura-passiva.md
│   ├── master-bioarchitettura.md
│   ├── abbonamento-rivista.md
│   └── ...
├── _posts/                     # Blog posts and articles
├── assets/
│   ├── css/
│   │   └── main.css           # Main stylesheet with design system
│   └── js/
│       ├── main.js            # Core functionality
│       ├── shop.js            # E-commerce functionality
│       ├── translation.js     # Language switching
│       └── post.js            # Blog post features
├── shop/
│   └── index.html             # Shop main page
├── public/                     # Static pages
├── admin/                      # Netlify CMS (if enabled)
└── index.html                 # Homepage
```

## 🛍️ E-Commerce Setup

### Product Management

Products are managed as markdown files in the `_products/` directory. Each product should include:

```yaml
---
layout: product
title: "Product Title"
category: "ebooks" # or courses, webinars, etc.
price: 29.99
currency: "EUR"
featured: true
image: "product-image-url"
description: "Product description"
# ... additional product fields
---

Product content in Markdown format...
```

### PayPal Configuration

Update the PayPal settings in `_config.yml`:

```yaml
paypal:
  client_id: "your-paypal-client-id"
  environment: "production" # or "sandbox" for testing
  merchant_email: "hannes.mitterer@gmail.com"
  currency: "EUR"
```

### Cart Functionality

The shopping cart automatically:
- Saves items to local storage
- Calculates totals including VAT (22%)
- Handles quantity changes
- Processes PayPal checkout

## 🌍 Multilingual Configuration

### Language Setup

Languages are configured in `_config.yml`:

```yaml
translations:
  enabled: true
  default_language: "it"
  supported_languages:
    - it
    - en
    - de
    - fr
```

### Adding Translations

Translations are handled via JavaScript in `assets/js/translation.js`. To add new translatable content:

1. Add `data-translate="key"` attributes to HTML elements
2. Define translations in the translation.js file
3. The system will automatically switch content based on selected language

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Connect Repository:**
   - Link your GitHub repository to Netlify
   - Set build command: `jekyll build`
   - Set publish directory: `_site`

2. **Environment Variables:**
   ```
   JEKYLL_ENV=production
   ```

3. **Custom Domain:**
   - Configure your domain in Netlify settings
   - SSL certificates are automatically provided

### GitHub Pages Deployment

1. **Enable GitHub Pages:**
   - Go to repository Settings > Pages
   - Set source to GitHub Actions or main branch

2. **Workflow Configuration:**
   The repository includes GitHub Actions workflows for automatic deployment.

### Manual Deployment

```bash
# Build the site
JEKYLL_ENV=production jekyll build

# Upload _site/ directory to your web server
```

## 🔧 Configuration

### Site Settings

Key configuration options in `_config.yml`:

```yaml
title: "Fondazione Italiana per la Bioarchitettura"
description: "L'Ente italiano di riferimento nell'ambito del costruire sano ed ecologico"
url: "https://your-domain.com"

# Foundation information
foundation:
  full_name: "Fondazione Italiana per la Bioarchitettura® e l'Antropizzazione Sostenibile dell'Ambiente"
  legal_status: "Ente morale senza fini di lucro"
  established: 1999

# Contact information
contact:
  phone: "+39 0471 973097"
  email: "bioa@bioarchitettura.org"
  address: "Certosa di Firenze, Via della Certosa, 1, 50124 Firenze FI"
```

### Analytics Integration

Set up Google Analytics:

```yaml
analytics:
  google_analytics_id: "GA-XXXXXXXXX"
```

## 🎨 Customization

### Styling

The site uses a comprehensive CSS design system with custom properties:

```css
:root {
  --primary-color: #2c5530;
  --secondary-color: #8b4513;
  --accent-color: #f4a261;
  /* ... more variables */
}
```

### Adding New Product Categories

1. Update `SHOP_CONFIG.CATEGORIES` in `assets/js/shop.js`
2. Add category translations in `assets/js/translation.js`
3. Create products with the new category

### Custom Pages

Create new pages in the `public/` directory or as root-level HTML files.

## 🧪 Testing

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works on desktop and mobile
- [ ] Language switching functions properly
- [ ] Shopping cart add/remove operations
- [ ] Product detail pages display correctly
- [ ] Contact forms submit successfully
- [ ] Mobile responsive design
- [ ] PayPal integration (in sandbox mode)

### Browser Testing

Tested and compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

For technical support or questions:

- **Email**: bioa@bioarchitettura.org
- **Phone**: +39 0471 973097
- **GitHub Issues**: Use repository issues for bug reports

## 📄 License

© 2025 Fondazione Italiana per la Bioarchitettura. All rights reserved.

## 🏗️ Built With

- [Jekyll](https://jekyllrb.com/) - Static site generator
- [PayPal JavaScript SDK](https://developer.paypal.com/) - Payment processing
- [Google Fonts](https://fonts.google.com/) - Typography
- Vanilla JavaScript - No frameworks needed!

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Maintainer**: Fondazione Italiana per la Bioarchitettura
