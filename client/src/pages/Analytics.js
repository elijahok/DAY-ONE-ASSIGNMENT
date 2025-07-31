import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableViewIcon from '@mui/icons-material/TableView';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);

  // Mock analytics data
  const mockData = {
    timeSeriesData: {
      labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'],
      tweets: [120, 190, 300, 500, 200, 300, 450],
      engagement: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
      sentiment: [0.7, 0.6, 0.8, 0.4, 0.6, 0.7, 0.8]
    },
    topHashtags: [
      { hashtag: '#AI', count: 1250, growth: '+15%' },
      { hashtag: '#Tech', count: 980, growth: '+8%' },
      { hashtag: '#Crypto', count: 750, growth: '-5%' },
      { hashtag: '#Innovation', count: 650, growth: '+12%' },
      { hashtag: '#Future', count: 580, growth: '+20%' }
    ],
    topInfluencers: [
      { username: 'tech_guru', name: 'Tech Guru', followers: 250000, engagement: 12500, verified: true },
      { username: 'ai_expert', name: 'AI Expert', followers: 180000, engagement: 9800, verified: true },
      { username: 'crypto_whale', name: 'Crypto Whale', followers: 320000, engagement: 15600, verified: false },
      { username: 'innovation_hub', name: 'Innovation Hub', followers: 95000, engagement: 7200, verified: true }
    ],
    contentPerformance: [
      { type: 'Text Only', count: 4500, avg_engagement: 85 },
      { type: 'With Images', count: 2800, avg_engagement: 156 },
      { type: 'With Video', count: 1200, avg_engagement: 234 },
      { type: 'With Links', count: 3200, avg_engagement: 98 }
    ],
    engagementByHour: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      data: [45, 32, 28, 35, 58, 85, 120, 180, 220, 280, 320, 350, 380, 290, 250, 280, 320, 350, 380, 290, 180, 120, 85, 60]
    }
  };

  useEffect(() => {
    setAnalyticsData(mockData);
  }, [timeRange]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#ffffff' }
      },
    },
    scales: {
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: '#38444d' }
      },
      x: {
        ticks: { color: '#ffffff' },
        grid: { color: '#38444d' }
      }
    }
  };

  const timeSeriesChartData = {
    labels: mockData.timeSeriesData.labels,
    datasets: [
      {
        label: 'Tweets',
        data: mockData.timeSeriesData.tweets,
        backgroundColor: '#1DA1F2',
        borderColor: '#1DA1F2',
        yAxisID: 'y'
      },
      {
        label: 'Engagement',
        data: mockData.timeSeriesData.engagement,
        backgroundColor: '#17BF63',
        borderColor: '#17BF63',
        yAxisID: 'y1'
      }
    ]
  };

  const sentimentTrendData = {
    labels: mockData.timeSeriesData.labels,
    datasets: [
      {
        label: 'Sentiment Score',
        data: mockData.timeSeriesData.sentiment,
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const contentTypeData = {
    labels: mockData.contentPerformance.map(item => item.type),
    datasets: [
      {
        data: mockData.contentPerformance.map(item => item.avg_engagement),
        backgroundColor: ['#1DA1F2', '#17BF63', '#FF6B35', '#8B5CF6'],
        borderWidth: 0
      }
    ]
  };

  const hourlyEngagementData = {
    labels: mockData.engagementByHour.labels,
    datasets: [
      {
        label: 'Engagement',
        data: mockData.engagementByHour.data,
        backgroundColor: '#1DA1F2',
        borderColor: '#1DA1F2',
        borderWidth: 1
      }
    ]
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!analyticsData) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Advanced Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="1d">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Time Series Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Tweet Volume & Engagement Trends</Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={timeSeriesChartData} 
                  options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#ffffff' },
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Sentiment Trend</Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line data={sentimentTrendData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hashtag Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Top Trending Hashtags</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hashtag</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockData.topHashtags.map((hashtag, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {hashtag.hashtag}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(hashtag.count)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={hashtag.growth}
                            color={hashtag.growth.includes('+') ? 'success' : 'error'}
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
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChartIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Content Type Performance</Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={contentTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#ffffff' }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Influencer Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Top Influencers</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Followers</TableCell>
                      <TableCell align="right">Engagement</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockData.topInfluencers.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {user.name}
                                {user.verified && (
                                  <Chip label="✓" size="small" color="primary" sx={{ ml: 0.5, height: 16 }} />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(user.followers)}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(user.engagement)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Hourly Engagement Pattern</Typography>
              <Box sx={{ height: 250 }}>
                <Bar data={hourlyEngagementData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Content Performance Metrics */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TableViewIcon sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6">Content Performance Breakdown</Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Content Type</TableCell>
                  <TableCell align="right">Total Posts</TableCell>
                  <TableCell align="right">Avg Engagement</TableCell>
                  <TableCell align="right">Engagement Rate</TableCell>
                  <TableCell align="right">Performance Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.contentPerformance.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.type}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(item.count)}
                    </TableCell>
                    <TableCell align="right">
                      {item.avg_engagement}
                    </TableCell>
                    <TableCell align="right">
                      {(item.avg_engagement / 100 * 2.5).toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={item.avg_engagement > 150 ? 'High' : item.avg_engagement > 100 ? 'Medium' : 'Low'}
                        color={item.avg_engagement > 150 ? 'success' : item.avg_engagement > 100 ? 'warning' : 'error'}
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
    </Box>
  );
};

export default Analytics;