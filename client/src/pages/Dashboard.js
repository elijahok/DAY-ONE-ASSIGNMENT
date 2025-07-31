import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockData = {
    summary: {
      totalTweets: 15423,
      totalEngagement: 89456,
      avgEngagementRate: 5.8,
      topHashtag: '#AI',
      trendingScore: 94
    },
    recentAnalysis: [
      { topic: 'Artificial Intelligence', tweets: 3420, engagement: 25600, sentiment: 'positive' },
      { topic: 'Cryptocurrency', tweets: 2840, engagement: 18900, sentiment: 'mixed' },
      { topic: 'Technology', tweets: 4200, engagement: 31200, sentiment: 'positive' },
      { topic: 'Politics', tweets: 1960, engagement: 13400, sentiment: 'negative' }
    ],
    engagementTrends: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [1200, 1900, 3000, 5000, 2000, 3000, 4500]
    },
    sentimentDistribution: {
      positive: 45,
      neutral: 35,
      negative: 20
    }
  };

  useEffect(() => {
    // Initialize with mock data
    setDashboardData(mockData);
  }, []);

  const engagementChartData = {
    labels: mockData.engagementTrends.labels,
    datasets: [
      {
        label: 'Daily Engagement',
        data: mockData.engagementTrends.data,
        backgroundColor: '#1DA1F2',
        borderColor: '#1DA1F2',
        borderWidth: 1,
      },
    ],
  };

  const sentimentChartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          mockData.sentimentDistribution.positive,
          mockData.sentimentDistribution.neutral,
          mockData.sentimentDistribution.negative,
        ],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: '#38444d',
        },
      },
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: '#38444d',
        },
      },
    },
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'mixed': return 'warning';
      default: return 'default';
    }
  };

  if (!dashboardData) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Analytics Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Total Tweets</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.summary.totalTweets.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzed this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FavoriteIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h6">Total Engagement</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.summary.totalEngagement.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Likes, shares, comments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShareIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Avg Engagement</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.summary.avgEngagementRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Engagement rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6">Trending Score</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {dashboardData.summary.trendingScore}/100
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-calculated trend score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Weekly Engagement Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={engagementChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Sentiment Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut 
                  data={sentimentChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#ffffff',
                        },
                      },
                    },
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Topic Analysis
              </Typography>
              <Grid container spacing={2}>
                {dashboardData.recentAnalysis.map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {item.topic}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.tweets.toLocaleString()} tweets
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.engagement.toLocaleString()} engagements
                        </Typography>
                        <Chip 
                          label={item.sentiment}
                          color={getSentimentColor(item.sentiment)}
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" size="large">
          Start New Analysis
        </Button>
        <Button variant="outlined" size="large">
          View Detailed Reports
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;