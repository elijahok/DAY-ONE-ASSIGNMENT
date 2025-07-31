import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ChatIcon from '@mui/icons-material/Chat';
import api from '../utils/api';
import moment from 'moment';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [includeReplies, setIncludeReplies] = useState(false);
  const [maxResults, setMaxResults] = useState(100);
  const [tweets, setTweets] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setTweets([]);
    setAnalysis(null);

    try {
      const response = await api.post('/api/twitter/search', {
        query: searchQuery,
        maxResults,
        includeReplies
      });

      setTweets(response.data.tweets);
      
      if (response.data.tweets.length === 0) {
        setError('No tweets found for this search query');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search tweets');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (tweets.length === 0) {
      setError('No tweets to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const [sentimentResponse, insightsResponse, trendingResponse] = await Promise.all([
        api.post('/api/analysis/sentiment', { tweets }),
        api.post('/api/analysis/insights', { tweets }),
        api.post('/api/analysis/trending', { tweets })
      ]);

      setAnalysis({
        sentiment: sentimentResponse.data.analysis,
        insights: insightsResponse.data.insights,
        trending: trendingResponse.data.trending
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze tweets');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'mixed': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Search & Analyze Tweets
      </Typography>

      {/* Search Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Query"
                placeholder="Enter keywords, hashtags, or @mentions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Max Results"
                value={maxResults}
                onChange={(e) => setMaxResults(Math.min(100, Math.max(1, parseInt(e.target.value) || 100)))}
                inputProps={{ min: 1, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeReplies}
                    onChange={(e) => setIncludeReplies(e.target.checked)}
                  />
                }
                label="Include Replies"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                size="large"
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Results Summary */}
      {tweets.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Found {tweets.length} tweets
              </Typography>
              <Button
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={handleAnalyze}
                disabled={analyzing}
                color="secondary"
              >
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </Box>
            
            {analyzing && <LinearProgress sx={{ mb: 2 }} />}

            {/* Quick Stats */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Likes</Typography>
                <Typography variant="h6">
                  {formatNumber(tweets.reduce((sum, tweet) => sum + (tweet.metrics?.like_count || 0), 0))}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Retweets</Typography>
                <Typography variant="h6">
                  {formatNumber(tweets.reduce((sum, tweet) => sum + (tweet.metrics?.retweet_count || 0), 0))}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Total Replies</Typography>
                <Typography variant="h6">
                  {formatNumber(tweets.reduce((sum, tweet) => sum + (tweet.metrics?.reply_count || 0), 0))}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Unique Users</Typography>
                <Typography variant="h6">
                  {new Set(tweets.map(t => t.author?.username)).size}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Results */}
      {analysis && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Sentiment Analysis */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Sentiment Analysis</Typography>
                {analysis.sentiment?.sentiment && (
                  <Box>
                    <Chip 
                      label={analysis.sentiment.sentiment.overall_sentiment || 'Mixed'}
                      color={getSentimentColor(analysis.sentiment.sentiment.overall_sentiment)}
                      sx={{ mb: 2 }}
                    />
                    {analysis.sentiment.sentiment.main_themes && (
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>Main Themes:</Typography>
                        {analysis.sentiment.sentiment.main_themes.map((theme, index) => (
                          <Chip key={index} label={theme} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Content */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Users</Typography>
                {analysis.insights?.top_content?.top_users?.slice(0, 5).map((user, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {index + 1}.
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      @{user.username} ({formatNumber(user.total_engagement)} eng.)
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Trending Hashtags */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Hashtags</Typography>
                {analysis.trending?.hashtags?.most_used?.slice(0, 5).map((hashtag, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{hashtag.hashtag}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {hashtag.count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* AI Insights */}
      {analysis?.insights?.ai_analysis && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>AI Insights</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {analysis.insights.ai_analysis}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Tweets Table */}
      {tweets.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Tweets</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Author</TableCell>
                    <TableCell>Tweet</TableCell>
                    <TableCell align="center">Engagement</TableCell>
                    <TableCell align="center">Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tweets.map((tweet) => (
                    <TableRow key={tweet.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {tweet.author?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {tweet.author?.name}
                              {tweet.author?.verified && (
                                <VerifiedIcon sx={{ fontSize: 16, ml: 0.5, color: 'primary.main' }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              @{tweet.author?.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 400 }}>
                          {tweet.text}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FavoriteIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatNumber(tweet.metrics?.like_count || 0)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ShareIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatNumber(tweet.metrics?.retweet_count || 0)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ChatIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {formatNumber(tweet.metrics?.reply_count || 0)}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {tweet.engagement_rate}% rate
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {moment(tweet.created_at).format('MMM DD, HH:mm')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Search;