# Vercel Deployment Guide

This guide will help you deploy the X Content Analyzer to Vercel with both frontend and backend functionality.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **API Keys**: Have all your API credentials ready

## Step-by-Step Deployment

### 1. Push to GitHub

First, initialize a git repository and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - X Content Analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/x-content-analyzer.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a React app

### 3. Configure Build Settings

Vercel should automatically configure the build settings, but verify:

- **Framework Preset**: React
- **Root Directory**: `./` (leave empty)
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install && cd ../server && npm install`

### 4. Set Environment Variables

In the Vercel dashboard, go to your project settings → Environment Variables and add:

```
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
OPENAI_API_KEY=your_openai_api_key_here
GROK_API_KEY=your_grok_api_key_here
GROK_API_URL=https://api.x.ai/v1
NODE_ENV=production
```

### 5. Deploy

Click "Deploy" and Vercel will:
1. Build your React frontend
2. Set up serverless functions for your backend API
3. Deploy everything to a global CDN

### 6. Verify Deployment

Once deployed, test:
1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Try searching for tweets
3. Check that AI analysis works
4. Verify all charts and analytics load

## Architecture on Vercel

```
Frontend (React)     →    CDN (Global)
├── Dashboard
├── Search
├── Analytics
└── Comparison

Backend (Node.js)    →    Serverless Functions
├── /api/twitter/*   →    Twitter API integration
└── /api/analysis/*  →    AI analysis endpoints
```

## Custom Domain (Optional)

1. In Vercel dashboard, go to Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatically configured

## Environment-Specific Notes

### Development
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Run: `npm run dev`

### Production (Vercel)
- Frontend: Served from CDN
- Backend: Serverless functions at `/api/*`
- Automatic HTTPS and global distribution

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check environment variables are set

### API Issues
- Verify environment variables in Vercel dashboard
- Check API rate limits and quotas
- Monitor function logs in Vercel

### Performance
- Serverless functions have cold start delays
- Consider upgrading to Vercel Pro for better performance
- Optimize API calls and implement caching

## Monitoring

Use Vercel's built-in analytics:
1. Function performance metrics
2. Error tracking and logs
3. Usage statistics
4. Real-time monitoring

## Cost Considerations

**Vercel Free Tier Includes:**
- 100GB bandwidth
- 100 serverless function invocations per day
- 10 deployments per day

**Potential Costs:**
- Twitter API usage
- OpenAI API usage
- Grok API usage
- Vercel overages (if any)

## Security Best Practices

1. **Environment Variables**: Never commit API keys
2. **CORS**: Configured for Vercel domains
3. **Rate Limiting**: Implemented to prevent abuse
4. **Input Validation**: All user inputs are sanitized

## Backup and Recovery

1. **Code**: Stored in GitHub
2. **Environment Variables**: Document separately
3. **Database**: No persistent database (stateless)
4. **Logs**: Available in Vercel dashboard

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify API credentials
3. Test endpoints individually
4. Check API rate limits

Your X Content Analyzer should now be live and accessible worldwide! 🚀