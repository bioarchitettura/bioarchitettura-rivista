# Netlify Deployment Configuration

## Admin Panel Setup

The admin panel at `/admin/` uses Netlify CMS for content management. Here are the key configuration files:

### Files Required for Admin Panel:
- `admin/index.html` - The admin interface
- `admin/config.yml` - CMS configuration
- `_redirects` - SPA routing for admin panel
- `netlify.toml` - Build configuration

### Netlify Site Settings

Make sure your Netlify site has these settings:

1. **Build Command**: `jekyll build`
2. **Publish Directory**: `_site`
3. **Node Version**: Latest LTS (if needed for any plugins)

### Identity & Git Gateway

For the admin panel to work, enable:

1. **Netlify Identity**: Enable in Netlify dashboard under Identity tab
2. **Git Gateway**: Enable in Identity settings
3. **Registration**: Set to "Invite only" for security

### Admin Panel Access

Once deployed:
1. Visit `https://your-site.netlify.app/admin/`
2. Click "Login with Netlify Identity"
3. Use GitHub account or invite users via Netlify dashboard

### Troubleshooting

- If admin shows blank screen, check browser console for JavaScript errors
- Verify `_redirects` file is in published `_site` directory
- Check Identity and Git Gateway are enabled in Netlify dashboard
- Ensure GitHub permissions are set for the repository

## Build Process

The site uses Jekyll with the following structure:
- Source files in repository root
- Built files output to `_site/`
- Admin files copied as-is to `_site/admin/`
- Redirects handled by `_redirects` file