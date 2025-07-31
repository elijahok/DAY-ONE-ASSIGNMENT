# X Content Analyzer

An AI-powered Twitter/X content analysis platform that uses ChatGPT, Grok, and other LLMs to analyze social media content, track engagement metrics, and provide actionable insights.

## Features

- **Real-time Tweet Analysis**: Search and analyze tweets by keywords, hashtags, or user mentions
- **AI-Powered Insights**: Integration with ChatGPT and Grok APIs for sentiment analysis and content insights
- **Engagement Metrics**: Track likes, retweets, replies, and calculate engagement rates
- **Top Content Discovery**: Identify most shared content, top users, and trending hashtags
- **Data Visualization**: Interactive charts and graphs showing trends and patterns
- **Comparison Tools**: Compare different datasets side-by-side
- **User Analytics**: Analyze top influencers and their engagement patterns
- **Temporal Analysis**: Track posting patterns and peak engagement hours

## Technology Stack

### Backend
- Node.js with Express
- Twitter API v2 integration
- OpenAI GPT-4 API
- Grok (xAI) API integration
- Rate limiting and security middleware

### Frontend
- React 18 with Material-UI
- Chart.js for data visualization
- Responsive design with dark theme
- Real-time data updates

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Twitter Developer Account
- OpenAI API key
- Grok API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd x-content-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   
   Copy `server/.env.example` to `server/.env` and fill in your API credentials:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` with your API keys:
   ```env
   # Twitter/X API Credentials
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
   TWITTER_API_KEY=your_twitter_api_key_here
   TWITTER_API_SECRET=your_twitter_api_secret_here
   TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
   TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret_here
   
   # OpenAI API
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Grok API (xAI)
   GROK_API_KEY=your_grok_api_key_here
   GROK_API_URL=https://api.x.ai/v1
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

### API Keys Setup

#### Twitter API
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app and generate API keys
3. Make sure to enable OAuth 1.0a and get all required tokens

#### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an API key in your account settings
3. Add credits to your account for API usage

#### Grok API (Optional)
1. Sign up for xAI API access
2. Get your API key from the xAI platform
3. Configure the API URL (currently in beta)

## Usage Guide

### 1. Dashboard
- View overall analytics and trends
- See summary metrics and recent analysis
- Monitor engagement patterns

### 2. Search & Analyze
- Enter keywords, hashtags, or user mentions
- Configure search parameters (max results, include replies)
- Get AI-powered sentiment analysis and insights
- View detailed tweet data with engagement metrics

### 3. Advanced Analytics
- Time-series analysis of tweet volume and engagement
- Hashtag performance tracking
- Influencer identification and analysis
- Content type performance comparison

### 4. Dataset Comparison
- Compare multiple search queries side-by-side
- Analyze differences in engagement and sentiment
- Generate comparative insights with AI

## API Endpoints

### Twitter Integration
- `POST /api/twitter/search` - Search tweets
- `GET /api/twitter/trends/:woeid?` - Get trending topics
- `GET /api/twitter/user/:username/timeline` - Get user timeline
- `GET /api/twitter/tweet/:id/replies` - Get tweet replies

### AI Analysis
- `POST /api/analysis/sentiment` - Analyze sentiment with multiple AI models
- `POST /api/analysis/insights` - Generate content insights
- `POST /api/analysis/trending` - Analyze trending topics and patterns
- `POST /api/analysis/compare` - Compare multiple datasets

## Features in Detail

### AI Analysis Capabilities
- **Sentiment Analysis**: Overall sentiment, emotional tone, theme identification
- **Content Performance**: Engagement prediction and optimization suggestions
- **Trend Detection**: Emerging topics and viral content identification
- **User Behavior**: Posting patterns and audience analysis

### Visualization Features
- Interactive charts with Chart.js and Recharts
- Real-time data updates
- Responsive design for mobile and desktop
- Dark theme optimized for analytics

### Data Export
- CSV export for tweet data
- Chart image export
- Detailed analytics reports

## Performance Optimization

- Rate limiting to comply with API restrictions
- Efficient data processing and caching
- Optimized chart rendering for large datasets
- Progressive loading for better user experience

## Security Features

- API key protection with environment variables
- Rate limiting and request validation
- CORS configuration for secure cross-origin requests
- Input sanitization and validation

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure production API URLs
- Set appropriate rate limits for production traffic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review API rate limits and quotas

## Roadmap

- [ ] Real-time streaming analysis
- [ ] Advanced NLP features
- [ ] Machine learning predictions
- [ ] Custom dashboard creation
- [ ] Team collaboration features
- [ ] API rate optimization
- [ ] Multi-language support

## Acknowledgments

- Twitter API for social media data
- OpenAI for AI analysis capabilities
- xAI for Grok integration
- Chart.js and Material-UI for UI components
