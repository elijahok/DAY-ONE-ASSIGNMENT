import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadarElement, PointElement, LineElement } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import CompareIcon from '@mui/icons-material/Compare';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadarElement, PointElement, LineElement);

const Comparison = () => {
  const [datasets, setDatasets] = useState([
    { id: 1, label: 'Dataset 1', query: '', tweets: [] },
    { id: 2, label: 'Dataset 2', query: '', tweets: [] }
  ]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDataset = () => {
    const newId = Math.max(...datasets.map(d => d.id)) + 1;
    setDatasets([...datasets, { id: newId, label: `Dataset ${newId}`, query: '', tweets: [] }]);
  };

  const removeDataset = (id) => {
    if (datasets.length > 2) {
      setDatasets(datasets.filter(d => d.id !== id));
    }
  };

  const updateDataset = (id, field, value) => {
    setDatasets(datasets.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const searchDataset = async (id) => {
    const dataset = datasets.find(d => d.id === id);
    if (!dataset.query.trim()) return;

    try {
      const response = await axios.post('/api/twitter/search', {
        query: dataset.query,
        maxResults: 50
      });
      
      updateDataset(id, 'tweets', response.data.tweets);
    } catch (err) {
      setError(`Failed to search for ${dataset.label}: ${err.response?.data?.error}`);
    }
  };

  const runComparison = async () => {
    const datasetsWithTweets = datasets.filter(d => d.tweets.length > 0);
    
    if (datasetsWithTweets.length < 2) {
      setError('At least 2 datasets with tweets are required for comparison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/analysis/compare', {
        datasets: datasetsWithTweets
      });

      setComparison(response.data.comparison);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run comparison');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getSentimentColor = (sentiment) => {
    if (typeof sentiment === 'string') {
      switch (sentiment.toLowerCase()) {
        case 'positive': return 'success';
        case 'negative': return 'error';
        case 'mixed': return 'warning';
        default: return 'default';
      }
    }
    return 'default';
  };

  // Chart data for comparison
  const getComparisonChartData = () => {
    if (!comparison) return null;

    const labels = comparison.datasets.map(d => d.label);
    const tweetCounts = comparison.datasets.map(d => d.tweet_count);
    const avgEngagement = comparison.datasets.map(d => d.engagement_stats?.avg_likes || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Tweet Count',
          data: tweetCounts,
          backgroundColor: '#1DA1F2',
          yAxisID: 'y',
        },
        {
          label: 'Avg Engagement',
          data: avgEngagement,
          backgroundColor: '#17BF63',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const getRadarChartData = () => {
    if (!comparison) return null;

    const labels = ['Tweet Volume', 'Avg Likes', 'Avg Retweets', 'Avg Replies', 'Unique Users'];
    
    return {
      labels,
      datasets: comparison.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: [
          Math.min(dataset.tweet_count / 10, 100), // Normalize to 0-100
          Math.min(parseFloat(dataset.engagement_stats?.avg_likes || 0), 100),
          Math.min(parseFloat(dataset.engagement_stats?.avg_retweets || 0) * 5, 100),
          Math.min(parseFloat(dataset.engagement_stats?.avg_replies || 0) * 10, 100),
          Math.min(dataset.tweet_count / 5, 100) // Estimate unique users
        ],
        backgroundColor: [`rgba(29, 161, 242, ${0.2 + index * 0.2})`, `rgba(23, 191, 99, ${0.2 + index * 0.2})`][index] || `rgba(255, 107, 53, ${0.2 + index * 0.2})`,
        borderColor: ['#1DA1F2', '#17BF63', '#FF6B35'][index] || '#8B5CF6',
        borderWidth: 2
      }))
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#ffffff' }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#ffffff' },
        grid: { color: '#38444d' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#ffffff' },
        grid: { drawOnChartArea: false }
      },
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: '#38444d' }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#ffffff' }
      }
    },
    scales: {
      r: {
        angleLines: { color: '#38444d' },
        grid: { color: '#38444d' },
        pointLabels: { color: '#ffffff' },
        ticks: { color: '#ffffff', backdropColor: 'transparent' }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dataset Comparison
      </Typography>

      {/* Dataset Configuration */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Configure Datasets</Typography>
          
          {datasets.map((dataset, index) => (
            <Grid container spacing={2} key={dataset.id} sx={{ mb: 2 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Dataset Label"
                  value={dataset.label}
                  onChange={(e) => updateDataset(dataset.id, 'label', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Query"
                  placeholder="Enter keywords, hashtags, or @mentions"
                  value={dataset.query}
                  onChange={(e) => updateDataset(dataset.id, 'query', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => searchDataset(dataset.id)}
                  disabled={!dataset.query.trim()}
                >
                  Search ({dataset.tweets.length})
                </Button>
              </Grid>
              <Grid item xs={12} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => removeDataset(dataset.id)}
                  disabled={datasets.length <= 2}
                >
                  ×
                </Button>
              </Grid>
            </Grid>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDataset}
              disabled={datasets.length >= 5}
            >
              Add Dataset
            </Button>
            <Button
              variant="contained"
              startIcon={<CompareIcon />}
              onClick={runComparison}
              disabled={datasets.filter(d => d.tweets.length > 0).length < 2 || loading}
            >
              {loading ? 'Analyzing...' : 'Run Comparison'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Comparison Results */}
      {comparison && (
        <>
          {/* Summary Table */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Comparison Summary</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dataset</TableCell>
                      <TableCell align="right">Tweets</TableCell>
                      <TableCell align="right">Avg Likes</TableCell>
                      <TableCell align="right">Avg Retweets</TableCell>
                      <TableCell align="right">Avg Replies</TableCell>
                      <TableCell align="center">Sentiment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparison.datasets.map((dataset, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {dataset.label}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {dataset.tweet_count.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {dataset.engagement_stats?.avg_likes || 0}
                        </TableCell>
                        <TableCell align="right">
                          {dataset.engagement_stats?.avg_retweets || 0}
                        </TableCell>
                        <TableCell align="right">
                          {dataset.engagement_stats?.avg_replies || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dataset.sentiment?.overall_sentiment || 'Unknown'}
                            color={getSentimentColor(dataset.sentiment?.overall_sentiment)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Comparison Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Volume & Engagement Comparison</Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={getComparisonChartData()} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Performance Radar</Typography>
                  <Box sx={{ height: 300 }}>
                    <Radar data={getRadarChartData()} options={radarOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Top Hashtags Comparison */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {comparison.datasets.map((dataset, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {dataset.label} - Top Hashtags
                    </Typography>
                    {dataset.top_hashtags?.slice(0, 5).map((hashtag, hashIndex) => (
                      <Box key={hashIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{hashtag.hashtag}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {hashtag.count}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* AI Insights */}
          {comparison.insights && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">AI Comparative Insights</Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {comparison.insights}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Temporal Patterns */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Temporal Patterns</Typography>
              <Grid container spacing={3}>
                {comparison.datasets.map((dataset, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{dataset.label} - Peak Hours</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {dataset.temporal_pattern?.peak_hours?.slice(0, 5).map((hour, hourIndex) => (
                          <Box key={hourIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">{hour.hour}:00</Typography>
                            <Typography variant="body2">{hour.count} tweets</Typography>
                          </Box>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Comparison;