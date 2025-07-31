const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const moment = require('moment');
const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Grok API client
const grokClient = axios.create({
  baseURL: process.env.GROK_API_URL || 'https://api.x.ai/v1',
  headers: {
    'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Analyze content sentiment and themes
router.post('/sentiment', async (req, res) => {
  try {
    const { tweets, analysisType = 'comprehensive' } = req.body;
    
    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'Tweets array is required' });
    }

    const tweetTexts = tweets.map(tweet => tweet.text).slice(0, 50); // Limit for API cost
    
    // Analyze with ChatGPT
    const chatgptAnalysis = await analyzeSentimentWithChatGPT(tweetTexts, analysisType);
    
    // Analyze with Grok (if available)
    let grokAnalysis = null;
    try {
      grokAnalysis = await analyzeSentimentWithGrok(tweetTexts, analysisType);
    } catch (error) {
      console.warn('Grok analysis failed:', error.message);
    }

    // Combine and process results
    const combinedAnalysis = combineAnalysisResults(chatgptAnalysis, grokAnalysis, tweets);

    res.json({
      analysis: combinedAnalysis,
      metadata: {
        tweets_analyzed: tweetTexts.length,
        analysis_timestamp: new Date().toISOString(),
        providers: grokAnalysis ? ['chatgpt', 'grok'] : ['chatgpt']
      }
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze sentiment', 
      details: error.message 
    });
  }
});

// Generate insights and summaries
router.post('/insights', async (req, res) => {
  try {
    const { tweets, analysisType = 'trending' } = req.body;
    
    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'Tweets array is required' });
    }

    // Calculate engagement metrics
    const engagementStats = calculateEngagementStats(tweets);
    
    // Find top content and users
    const topContent = analyzeTopContent(tweets);
    
    // Generate AI insights
    const aiInsights = await generateAIInsights(tweets, analysisType);

    res.json({
      insights: {
        engagement_stats: engagementStats,
        top_content: topContent,
        ai_analysis: aiInsights,
        analysis_timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insights', 
      details: error.message 
    });
  }
});

// Analyze trending topics and hashtags
router.post('/trending', async (req, res) => {
  try {
    const { tweets } = req.body;
    
    if (!tweets || !Array.isArray(tweets)) {
      return res.status(400).json({ error: 'Tweets array is required' });
    }

    // Extract hashtags, mentions, and keywords
    const hashtags = extractHashtags(tweets);
    const mentions = extractMentions(tweets);
    const keywords = await extractKeywords(tweets);

    // Analyze trending patterns
    const trendingAnalysis = {
      hashtags: {
        most_used: hashtags.slice(0, 10),
        total_unique: hashtags.length,
        distribution: calculateHashtagDistribution(hashtags)
      },
      mentions: {
        top_mentioned: mentions.slice(0, 10),
        total_unique: mentions.length
      },
      keywords: {
        trending_topics: keywords.slice(0, 20),
        semantic_clusters: await clusterKeywords(keywords)
      },
      temporal_analysis: analyzeTemporalPatterns(tweets)
    };

    res.json({
      trending: trendingAnalysis,
      analysis_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trending analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze trending topics', 
      details: error.message 
    });
  }
});

// Compare content across different time periods or topics
router.post('/compare', async (req, res) => {
  try {
    const { datasets } = req.body; // Array of tweet datasets to compare
    
    if (!datasets || !Array.isArray(datasets) || datasets.length < 2) {
      return res.status(400).json({ error: 'At least 2 datasets are required for comparison' });
    }

    const comparisons = [];
    
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      const analysis = {
        label: dataset.label || `Dataset ${i + 1}`,
        tweet_count: dataset.tweets.length,
        engagement_stats: calculateEngagementStats(dataset.tweets),
        sentiment: await getDatasetSentiment(dataset.tweets),
        top_hashtags: extractHashtags(dataset.tweets).slice(0, 5),
        temporal_pattern: analyzeTemporalPatterns(dataset.tweets)
      };
      comparisons.push(analysis);
    }

    // Generate comparative insights
    const comparativeInsights = await generateComparativeInsights(comparisons);

    res.json({
      comparison: {
        datasets: comparisons,
        insights: comparativeInsights,
        analysis_timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Comparison analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to perform comparison analysis', 
      details: error.message 
    });
  }
});

// Helper Functions

async function analyzeSentimentWithChatGPT(texts, analysisType) {
  const prompt = `Analyze the sentiment and themes of these tweets. Provide a JSON response with:
  - overall_sentiment: (positive/negative/neutral/mixed)
  - sentiment_distribution: {positive: %, negative: %, neutral: %}
  - main_themes: [array of main themes]
  - emotional_tone: detailed emotional analysis
  - key_insights: [array of key insights]
  
  Tweets to analyze:
  ${texts.map((text, i) => `${i + 1}. ${text}`).join('\n')}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are an expert social media analyst. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1500
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    return { error: 'Failed to parse ChatGPT response', raw: response.choices[0].message.content };
  }
}

async function analyzeSentimentWithGrok(texts, analysisType) {
  const prompt = `Analyze these tweets for sentiment, engagement patterns, and viral potential. Return JSON with sentiment analysis and trending insights.

  Tweets:
  ${texts.join('\n')}`;

  const response = await grokClient.post('/chat/completions', {
    model: 'grok-beta',
    messages: [
      { role: 'system', content: 'You are Grok, an AI with a rebellious streak and a dry wit. Analyze social media content with sharp insights.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8
  });

  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    return { error: 'Failed to parse Grok response', raw: response.data.choices[0].message.content };
  }
}

function combineAnalysisResults(chatgptAnalysis, grokAnalysis, tweets) {
  const combined = {
    sentiment: chatgptAnalysis,
    engagement_metrics: calculateEngagementStats(tweets),
    content_analysis: {
      total_tweets: tweets.length,
      unique_authors: [...new Set(tweets.map(t => t.author?.username))].length,
      avg_engagement_rate: tweets.reduce((sum, t) => sum + parseFloat(t.engagement_rate || 0), 0) / tweets.length
    }
  };

  if (grokAnalysis && !grokAnalysis.error) {
    combined.alternative_perspective = grokAnalysis;
  }

  return combined;
}

function calculateEngagementStats(tweets) {
  const stats = {
    total_likes: 0,
    total_retweets: 0,
    total_replies: 0,
    total_quotes: 0,
    avg_likes: 0,
    avg_retweets: 0,
    avg_replies: 0,
    most_engaged_tweet: null,
    engagement_distribution: []
  };

  tweets.forEach(tweet => {
    const metrics = tweet.metrics || {};
    stats.total_likes += metrics.like_count || 0;
    stats.total_retweets += metrics.retweet_count || 0;
    stats.total_replies += metrics.reply_count || 0;
    stats.total_quotes += metrics.quote_count || 0;
  });

  const tweetCount = tweets.length;
  if (tweetCount > 0) {
    stats.avg_likes = (stats.total_likes / tweetCount).toFixed(2);
    stats.avg_retweets = (stats.total_retweets / tweetCount).toFixed(2);
    stats.avg_replies = (stats.total_replies / tweetCount).toFixed(2);
  }

  // Find most engaged tweet
  stats.most_engaged_tweet = tweets.reduce((max, tweet) => {
    const currentEngagement = (tweet.metrics?.like_count || 0) + 
                             (tweet.metrics?.retweet_count || 0) + 
                             (tweet.metrics?.reply_count || 0);
    const maxEngagement = (max?.metrics?.like_count || 0) + 
                         (max?.metrics?.retweet_count || 0) + 
                         (max?.metrics?.reply_count || 0);
    return currentEngagement > maxEngagement ? tweet : max;
  }, tweets[0]);

  return stats;
}

function analyzeTopContent(tweets) {
  // Sort by different engagement metrics
  const byLikes = [...tweets].sort((a, b) => (b.metrics?.like_count || 0) - (a.metrics?.like_count || 0));
  const byRetweets = [...tweets].sort((a, b) => (b.metrics?.retweet_count || 0) - (a.metrics?.retweet_count || 0));
  const byReplies = [...tweets].sort((a, b) => (b.metrics?.reply_count || 0) - (a.metrics?.reply_count || 0));

  // Top users by follower count and engagement
  const userStats = {};
  tweets.forEach(tweet => {
    const username = tweet.author?.username;
    if (username) {
      if (!userStats[username]) {
        userStats[username] = {
          username,
          name: tweet.author.name,
          followers_count: tweet.author.followers_count || 0,
          verified: tweet.author.verified,
          tweet_count: 0,
          total_engagement: 0
        };
      }
      userStats[username].tweet_count++;
      userStats[username].total_engagement += (tweet.metrics?.like_count || 0) + 
                                            (tweet.metrics?.retweet_count || 0) + 
                                            (tweet.metrics?.reply_count || 0);
    }
  });

  const topUsers = Object.values(userStats)
    .sort((a, b) => b.total_engagement - a.total_engagement)
    .slice(0, 10);

  return {
    most_liked: byLikes.slice(0, 5),
    most_retweeted: byRetweets.slice(0, 5),
    most_replied: byReplies.slice(0, 5),
    top_users: topUsers
  };
}

async function generateAIInsights(tweets, analysisType) {
  const tweetSample = tweets.slice(0, 20).map(t => t.text).join('\n');
  
  const prompt = `Analyze these tweets and provide key insights about:
  1. Trending themes and topics
  2. User behavior patterns
  3. Content performance factors
  4. Potential viral indicators
  5. Audience sentiment trends
  
  Tweets sample:
  ${tweetSample}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a social media analytics expert. Provide actionable insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    return 'AI insights generation failed: ' + error.message;
  }
}

function extractHashtags(tweets) {
  const hashtags = {};
  tweets.forEach(tweet => {
    const matches = tweet.text.match(/#\w+/g);
    if (matches) {
      matches.forEach(hashtag => {
        const normalized = hashtag.toLowerCase();
        hashtags[normalized] = (hashtags[normalized] || 0) + 1;
      });
    }
  });
  
  return Object.entries(hashtags)
    .sort(([,a], [,b]) => b - a)
    .map(([hashtag, count]) => ({ hashtag, count }));
}

function extractMentions(tweets) {
  const mentions = {};
  tweets.forEach(tweet => {
    const matches = tweet.text.match(/@\w+/g);
    if (matches) {
      matches.forEach(mention => {
        const normalized = mention.toLowerCase();
        mentions[normalized] = (mentions[normalized] || 0) + 1;
      });
    }
  });
  
  return Object.entries(mentions)
    .sort(([,a], [,b]) => b - a)
    .map(([mention, count]) => ({ mention, count }));
}

async function extractKeywords(tweets) {
  // Simple keyword extraction - in production, use more sophisticated NLP
  const words = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  tweets.forEach(tweet => {
    const text = tweet.text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    text.forEach(word => {
      words[word] = (words[word] || 0) + 1;
    });
  });
  
  return Object.entries(words)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));
}

function calculateHashtagDistribution(hashtags) {
  const total = hashtags.reduce((sum, h) => sum + h.count, 0);
  return hashtags.slice(0, 10).map(h => ({
    hashtag: h.hashtag,
    percentage: ((h.count / total) * 100).toFixed(2)
  }));
}

function analyzeTemporalPatterns(tweets) {
  const hourCounts = {};
  const dayCounts = {};
  
  tweets.forEach(tweet => {
    if (tweet.created_at) {
      const date = moment(tweet.created_at);
      const hour = date.hour();
      const day = date.format('YYYY-MM-DD');
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
  });
  
  return {
    peak_hours: Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count })),
    daily_distribution: Object.entries(dayCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
  };
}

async function clusterKeywords(keywords) {
  // Simple clustering based on co-occurrence - in production, use more sophisticated clustering
  const clusters = [];
  const used = new Set();
  
  keywords.forEach(keyword => {
    if (!used.has(keyword.word)) {
      const cluster = [keyword.word];
      used.add(keyword.word);
      
      // Find related keywords (simple approach)
      keywords.forEach(other => {
        if (!used.has(other.word) && areRelated(keyword.word, other.word)) {
          cluster.push(other.word);
          used.add(other.word);
        }
      });
      
      if (cluster.length > 1) {
        clusters.push({ keywords: cluster, size: cluster.length });
      }
    }
  });
  
  return clusters.sort((a, b) => b.size - a.size).slice(0, 5);
}

function areRelated(word1, word2) {
  // Simple relatedness check - in production, use semantic similarity
  const commonPrefixes = ['crypto', 'block', 'tech', 'ai', 'data'];
  return commonPrefixes.some(prefix => 
    word1.startsWith(prefix) && word2.startsWith(prefix)
  );
}

async function getDatasetSentiment(tweets) {
  const sample = tweets.slice(0, 10).map(t => t.text);
  try {
    return await analyzeSentimentWithChatGPT(sample, 'quick');
  } catch (error) {
    return { error: 'Sentiment analysis failed' };
  }
}

async function generateComparativeInsights(comparisons) {
  const prompt = `Compare these datasets and provide insights:
  ${JSON.stringify(comparisons, null, 2)}
  
  Focus on differences in engagement, sentiment, and trending topics.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a data analyst comparing social media trends." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    return response.choices[0].message.content;
  } catch (error) {
    return 'Comparative analysis failed: ' + error.message;
  }
}

module.exports = router;