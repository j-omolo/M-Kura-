import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreatePoll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    options: [{ text: '' }],
  });
  const [error, setError] = useState('');

  const categories = [
    'Politics',
    'Technology',
    'Sports',
    'Entertainment',
    'Education',
    'Other',
  ];

  // Redirect non-admin users
  if (user && user.role !== 'admin') {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Alert severity="error">
            You do not have permission to create polls. Only administrators can create polls.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '' }]
    }));
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    if (formData.options.length < 2) {
      setError('At least two options are required');
      return;
    }

    if (formData.options.some((option) => !option.text.trim())) {
      setError('All options must be filled');
      return;
    }

    if (formData.endDate <= formData.startDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      // Format the data before sending
      const formattedData = {
        ...formData,
        options: formData.options.map(option => option.text),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      };
      
      const res = await axios.post('http://localhost:5000/api/polls', formattedData);
      navigate(`/polls/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating poll');
    }
  };

  return (
    
  	
  
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Poll
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Poll Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(newValue) =>
                    setFormData({ ...formData, startDate: newValue })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(newValue) =>
                    setFormData({ ...formData, endDate: newValue })
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Options
                </Typography>
                {formData.options.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                    />
                    {formData.options.length > 2 && (
                      <IconButton
                        color="error"
                        onClick={() => removeOption(index)}
                        sx={{ mt: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addOption}
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Create Poll
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreatePoll; 