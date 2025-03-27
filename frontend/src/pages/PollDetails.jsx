import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { HowToVote, AccessTime, Person } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/polls/${id}`);
      setPoll(res.data);
      setHasVoted(res.data.voters.includes(user?._id));
      setLoading(false);
    } catch (err) {
      setError('Error fetching poll details');
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/polls/${id}/vote`, {
        optionId: selectedOption,
      });
      fetchPoll();
      setHasVoted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting vote');
    }
  };

  const getChartData = () => {
    if (!poll) return null;

    return {
      labels: poll.options.map((option) => option.text),
      datasets: [
        {
          data: poll.options.map((option) => option.votes),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#36A2EB',
          ],
        },
      ],
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!poll) {
    return (
      <Container>
        <Alert severity="error">Poll not found</Alert>
      </Container>
    );
  }

  const isPollActive = new Date(poll.endDate) > new Date();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {poll.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {poll.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip
              icon={<HowToVote />}
              label={`${poll.totalVotes} votes`}
              color="primary"
            />
            <Chip
              icon={<AccessTime />}
              label={`Ends ${format(new Date(poll.endDate), 'MMM d, yyyy')}`}
              color={isPollActive ? 'success' : 'error'}
            />
            <Chip
              icon={<Person />}
              label={poll.creator.name}
              variant="outlined"
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!hasVoted && isPollActive ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Cast your vote
              </Typography>
              <Grid container spacing={2}>
                {poll.options.map((option, index) => (
                  <Grid item xs={12} key={index}>
                    <Button
                      fullWidth
                      variant={selectedOption === option._id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedOption(option._id)}
                    >
                      {option.text}
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleVote}
                disabled={!selectedOption}
                sx={{ mt: 2 }}
              >
                Submit Vote
              </Button>
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Results
              </Typography>
              <Grid container spacing={2}>
                {poll.options.map((option, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {option.text}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(option.votes / poll.totalVotes) * 100}
                            sx={{ height: 10, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {option.votes} votes
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {poll.totalVotes > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Results Visualization
              </Typography>
              <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                <Pie data={getChartData()} />
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PollDetails; 