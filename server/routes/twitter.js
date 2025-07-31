const express = require('express');
const { TwitterApi } = require('twitter-api-v2');
const router = express.Router();

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const readOnlyClient = twitterClient.readOnly;

// Search tweets by keyword or hashtag
router.post('/search', async (req, res) => {
  try {
    const { query, maxResults = 100, includeReplies = false } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchParams = {
      query: includeReplies ? query : `${query} -is:reply`,
      max_results: Math.min(maxResults, 100), // Twitter API limit
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'text', 'context_annotations'],
      'user.fields': ['username', 'name', 'public_metrics', 'verified'],
      expansions: ['author_id']
    };

    const tweets = await readOnlyClient.v2.search(query, searchParams);
    
    // Process and format the response
    const processedTweets = tweets.data?.data?.map(tweet => {
      const author = tweets.includes?.users?.find(user => user.id === tweet.author_id);
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        author: {
          id: tweet.author_id,
          username: author?.username,
          name: author?.name,
          verified: author?.verified,
          followers_count: author?.public_metrics?.followers_count,
          following_count: author?.public_metrics?.following_count
        },
        metrics: {
          retweet_count: tweet.public_metrics?.retweet_count || 0,
          like_count: tweet.public_metrics?.like_count || 0,
          reply_count: tweet.public_metrics?.reply_count || 0,
          quote_count: tweet.public_metrics?.quote_count || 0
        },
        engagement_rate: calculateEngagementRate(tweet.public_metrics, author?.public_metrics?.followers_count)
      };
    }) || [];

    res.json({
      tweets: processedTweets,
      meta: tweets.data?.meta,
      total_results: processedTweets.length
    });

  } catch (error) {
    console.error('Twitter search error:', error);
    res.status(500).json({ 
      error: 'Failed to search tweets', 
      details: error.message 
    });
  }
});

// Get trending topics
router.get('/trends/:woeid?', async (req, res) => {
  try {
    const woeid = req.params.woeid || 1; // 1 = Worldwide
    const trends = await readOnlyClient.v1.trendsAvailable();
    
    res.json({
      trends: trends,
      location: woeid === '1' ? 'Worldwide' : `WOEID: ${woeid}`
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trends', 
      details: error.message 
    });
  }
});

// Get user timeline
router.get('/user/:username/timeline', async (req, res) => {
  try {
    const { username } = req.params;
    const { maxResults = 50 } = req.query;

    // First get user by username
    const user = await readOnlyClient.v2.userByUsername(username, {
      'user.fields': ['public_metrics', 'verified', 'description']
    });

    if (!user.data) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's timeline
    const timeline = await readOnlyClient.v2.userTimeline(user.data.id, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'public_metrics', 'text', 'context_annotations'],
      exclude: ['replies', 'retweets']
    });

    const processedTweets = timeline.data?.data?.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: {
        retweet_count: tweet.public_metrics?.retweet_count || 0,
        like_count: tweet.public_metrics?.like_count || 0,
        reply_count: tweet.public_metrics?.reply_count || 0,
        quote_count: tweet.public_metrics?.quote_count || 0
      },
      engagement_rate: calculateEngagementRate(tweet.public_metrics, user.data.public_metrics?.followers_count)
    })) || [];

    res.json({
      user: {
        id: user.data.id,
        username: user.data.username,
        name: user.data.name,
        verified: user.data.verified,
        description: user.data.description,
        metrics: user.data.public_metrics
      },
      tweets: processedTweets,
      total_results: processedTweets.length
    });

  } catch (error) {
    console.error('User timeline error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user timeline', 
      details: error.message 
    });
  }
});

// Get tweet replies/comments
router.get('/tweet/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    const { maxResults = 50 } = req.query;

    // Search for replies to the specific tweet
    const replies = await readOnlyClient.v2.search(`conversation_id:${id}`, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'text', 'in_reply_to_user_id'],
      'user.fields': ['username', 'name', 'public_metrics', 'verified'],
      expansions: ['author_id']
    });

    const processedReplies = replies.data?.data?.map(reply => {
      const author = replies.includes?.users?.find(user => user.id === reply.author_id);
      return {
        id: reply.id,
        text: reply.text,
        created_at: reply.created_at,
        author: {
          id: reply.author_id,
          username: author?.username,
          name: author?.name,
          verified: author?.verified,
          followers_count: author?.public_metrics?.followers_count
        },
        metrics: {
          retweet_count: reply.public_metrics?.retweet_count || 0,
          like_count: reply.public_metrics?.like_count || 0,
          reply_count: reply.public_metrics?.reply_count || 0,
          quote_count: reply.public_metrics?.quote_count || 0
        }
      };
    }) || [];

    res.json({
      replies: processedReplies,
      total_results: processedReplies.length
    });

  } catch (error) {
    console.error('Tweet replies error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tweet replies', 
      details: error.message 
    });
  }
});

// Helper function to calculate engagement rate
function calculateEngagementRate(tweetMetrics, followerCount) {
  if (!tweetMetrics || !followerCount || followerCount === 0) return 0;
  
  const totalEngagements = (tweetMetrics.like_count || 0) + 
                          (tweetMetrics.retweet_count || 0) + 
                          (tweetMetrics.reply_count || 0) + 
                          (tweetMetrics.quote_count || 0);
  
  return ((totalEngagements / followerCount) * 100).toFixed(2);
}

module.exports = router;