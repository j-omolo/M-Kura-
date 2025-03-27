import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { HowToVote, AccessTime, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/polls');
      const userPolls = res.data.filter((poll) => poll.creator._id === user._id);
      setPolls(userPolls);
    } catch (err) {
      setError('Error fetching polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await axios.delete(`http://localhost:5000/api/polls/${pollId}`);
        setPolls(polls.filter((poll) => poll._id !== pollId));
      } catch (err) {
        setError('Error deleting poll');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredPolls = polls.filter((poll) => {
    const isActive = new Date(poll.endDate) > new Date();
    return tabValue === 0 ? isActive : !isActive;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    
  
    

    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Polls
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Active Polls" />
            <Tab label="Ended Polls" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {filteredPolls.map((poll) => (
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
                      color={new Date(poll.endDate) > new Date() ? 'success' : 'error'}
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
                    View Results
                  </Button>
                  {new Date(poll.endDate) > new Date() && (
                    <Button
                      component={RouterLink}
                      to={`/polls/${poll._id}/edit`}
                      size="small"
                      startIcon={<Edit />}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(poll._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredPolls.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {tabValue === 0
                ? 'You have no active polls'
                : 'You have no ended polls'}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 