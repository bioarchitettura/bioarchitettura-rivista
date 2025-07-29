#!/bin/bash

# Deployment verification script
# This script checks that all deployment configurations are properly set up

echo "🔍 Verifying deployment configurations..."

# Check if build directory exists and has content
if [ -d "_site" ]; then
    echo "✅ Build directory (_site) exists"
else
    echo "❌ Build directory (_site) missing - run 'jekyll build' first"
    exit 1
fi

# Check critical CMS files
if [ -f "_site/admin/index.html" ] && [ -f "_site/admin/config.yml" ]; then
    echo "✅ CMS files are present in build"
else
    echo "❌ CMS files missing in build output"
    exit 1
fi

# Check deployment configuration files
configs_found=0

if [ -f "netlify.toml" ]; then
    echo "✅ Netlify configuration found"
    configs_found=$((configs_found + 1))
fi

if [ -f "vercel.json" ]; then
    echo "✅ Vercel configuration found"
    configs_found=$((configs_found + 1))
fi

if [ -f ".github/workflows/jekyll-gh-pages.yml" ]; then
    echo "✅ GitHub Pages workflow found"
    configs_found=$((configs_found + 1))
fi

if [ $configs_found -eq 0 ]; then
    echo "❌ No deployment configurations found"
    exit 1
fi

# Check essential project files
if [ -f "Gemfile" ]; then
    echo "✅ Gemfile found"
else
    echo "❌ Gemfile missing"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f "_config.yml" ]; then
    echo "✅ Jekyll configuration found"
else
    echo "❌ Jekyll configuration missing"
    exit 1
fi

echo ""
echo "🎉 All deployment configurations verified successfully!"
echo "📋 Available deployment options:"
echo "   - GitHub Pages (automatic via GitHub Actions)"
echo "   - Netlify (using netlify.toml)"
echo "   - Vercel (using vercel.json)"
echo ""
echo "🔗 CMS will be accessible at:"
echo "   - GitHub Pages: https://bioarchitettura.github.io/web/admin/"
echo "   - Netlify: https://yourdomain.netlify.app/admin/"
echo "   - Vercel: https://yourdomain.vercel.app/admin/"