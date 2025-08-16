# 🚀 Moloco CRM Frontend - Deployment Guide

## 📋 Overview

This is a production-ready React/Vite frontend application for Moloco CRM, featuring CSV campaign data processing and analysis.

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query + Context API
- **CSV Processing**: Custom parser with validation
- **Data Storage**: localStorage with persistence

## 🚀 Deployment Options

### 1. Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
npm run deploy:vercel

# Or manual deployment
vercel --prod
```

**Configuration**: `vercel.json` is already configured

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
npm run deploy:netlify

# Or drag & drop dist folder to Netlify dashboard
```

**Configuration**: `netlify.toml` is already configured

### 3. Render (Static Site)

1. Connect your GitHub repository to Render
2. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment**: `VITE_API_BASE_URL=https://tech-staked-crm-backend.onrender.com`

**Configuration**: `render.yaml` is provided

### 4. Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose
docker-compose up
```

### 5. AWS S3 + CloudFront

```bash
# Build the app
npm run build

# Upload dist/ folder to S3 bucket
# Configure CloudFront distribution
# Set up custom domain (optional)
```

## 🔧 Environment Variables

Create these environment variables in your deployment platform:

```env
VITE_API_BASE_URL=https://tech-staked-crm-backend.onrender.com
VITE_APP_NAME=Moloco CRM
VITE_APP_VERSION=1.0.0
VITE_ENABLE_CSV_PROCESSING=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_AUTH=true
VITE_MAX_FILE_SIZE=52428800
VITE_MAX_FILES=10
```

## 📦 Build Process

```bash
# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔍 Pre-Deployment Checklist

- [ ] All environment variables are set
- [ ] API backend is deployed and accessible
- [ ] Build process completes without errors
- [ ] TypeScript compilation passes
- [ ] Linting passes
- [ ] CSV upload functionality works
- [ ] Data persistence works (localStorage)
- [ ] All pages load correctly
- [ ] Responsive design works on mobile
- [ ] Error boundaries catch errors properly

## 🌐 Recommended Deployment: Vercel

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Perfect for React/Vite apps
- Free tier available
- Excellent performance

**Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

## 🐳 Docker Production Setup

```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Performance Optimizations

- **Code Splitting**: Automatic with Vite
- **Asset Optimization**: Images, fonts, CSS minified
- **Caching**: Static assets cached for 1 year
- **Compression**: Gzip enabled in nginx
- **Bundle Analysis**: Use `npm run build` to see bundle size

## 🔒 Security Features

- Content Security Policy (CSP) headers
- XSS Protection
- CSRF Protection
- Secure headers (X-Frame-Options, etc.)
- Input validation for CSV uploads
- File size limits
- Type checking for uploads

## 🐛 Troubleshooting

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

**Runtime Errors:**
- Check browser console for errors
- Verify API endpoint is accessible
- Check environment variables are set
- Ensure localStorage is enabled

**CSV Upload Issues:**
- Check file size limits (50MB default)
- Verify CSV format matches expected columns
- Check network connectivity to backend

## 📈 Monitoring

**Recommended monitoring tools:**
- Vercel Analytics (built-in)
- Google Analytics
- Sentry for error tracking
- LogRocket for user sessions

## 🚀 Quick Deploy Commands

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Docker
docker build -t moloco-crm . && docker run -p 3000:80 moloco-crm

# Manual build + upload
npm run build && scp -r dist/* user@server:/var/www/html/
```

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review build logs
3. Check environment variables
4. Test locally with `npm run preview`
5. Contact the development team

---

**🎉 Your Moloco CRM Frontend is ready for production!**
