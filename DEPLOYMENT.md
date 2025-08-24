# Deployment Guide

This guide will help you deploy the ODABA Gemini Chat application.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API key
- Git (for version control)

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd odaba-gemini
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:5173`

## Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the build:**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder:**
   The built application will be in the `dist` directory, ready for deployment.

## Deployment Options

### Static Hosting (Recommended)

#### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_GEMINI_API_KEY`

#### Vercel
1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_GEMINI_API_KEY`

#### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Set source to GitHub Actions
3. Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -t odaba-gemini .
   docker run -p 80:80 odaba-gemini
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Security Considerations

- **API Key Security:** Never commit your API key to version control
- **Environment Variables:** Use environment variables for sensitive data
- **HTTPS:** Always use HTTPS in production
- **CORS:** Configure CORS if needed for your deployment

## Troubleshooting

### Common Issues

1. **Build fails:**
   - Ensure Node.js version is 18+
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

2. **API key not working:**
   - Verify the key is correct
   - Check if the key has proper permissions
   - Ensure the key is not expired

3. **Charts not rendering:**
   - Verify Chart.js is included in index.html
   - Check browser console for errors

### Performance Optimization

1. **Bundle size:** Use `npm run build --analyze` to analyze bundle size
2. **Lazy loading:** Consider implementing code splitting for large components
3. **Caching:** Implement proper caching headers for static assets

## Monitoring

- **Error tracking:** Consider adding error tracking (e.g., Sentry)
- **Analytics:** Add analytics if needed (e.g., Google Analytics)
- **Performance:** Monitor Core Web Vitals

## Support

For deployment issues, check:
1. Build logs in your hosting platform
2. Browser console for client-side errors
3. Network tab for API request issues
4. Environment variable configuration
