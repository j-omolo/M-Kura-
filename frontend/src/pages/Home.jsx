import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
} from '@mui/material';
import { HowToVote, AccessTime } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'all',
    'Politics',
    'Technology',
    'Sports',
    'Entertainment',
    'Education',
    'Other',
  ];

  useEffect(() => {
    fetchPolls();
  }, [category, sortBy]);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/polls');
      let filteredPolls = res.data;

      // Filter by category
      if (category !== 'all') {
        filteredPolls = filteredPolls.filter((poll) => poll.category === category);
      }

      // Filter by search query
      if (searchQuery) {
        filteredPolls = filteredPolls.filter(
          (poll) =>
            poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            poll.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort polls
      switch (sortBy) {
        case 'newest':
          filteredPolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          filteredPolls.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'mostVotes':
          filteredPolls.sort((a, b) => b.totalVotes - a.totalVotes);
          break;
        default:
          break;
      }

      setPolls(filteredPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchPolls();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Active Polls
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search polls"
              value={searchQuery}
              onChange={handleSearch}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="mostVotes">Most Votes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {polls.map((poll) => (
          <Grid item xs={12} md={6} lg={4} key={poll._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {poll.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {poll.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<HowToVote />}
                    label={`${poll.totalVotes} votes`}
                    size="small"
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={`Ends ${format(new Date(poll.endDate), 'MMM d, yyyy')}`}
                    size="small"
                  />
                </Box>
                <Chip
                  label={poll.category}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to={`/polls/${poll._id}`}
                  size="small"
                  color="primary"
                >
                  View Poll
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 