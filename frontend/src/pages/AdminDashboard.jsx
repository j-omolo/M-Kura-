import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  HowToVote as PollIcon,
  BarChart as StatsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PaymentButton from '../components/payment/PaymentButton';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPolls: 0,
    activePolls: 0,
    totalVotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editPollDialog, setEditPollDialog] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [hasValidPayment, setHasValidPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    checkPaymentStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, pollsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/admin/users'),
        axios.get('http://localhost:5000/api/polls')
      ]);

      setUsers(usersRes.data);
      setPolls(pollsRes.data);

      // Calculate statistics
      setStats({
        totalUsers: usersRes.data.length,
        totalPolls: pollsRes.data.length,
        activePolls: pollsRes.data.filter(poll => poll.isActive).length,
        totalVotes: pollsRes.data.reduce((acc, poll) => acc + poll.totalVotes, 0)
      });
    } catch (err) {
      setError('Error fetching dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payment/check', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setHasValidPayment(response.data.hasValidPayment);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentError('Failed to check payment status');
    }
  };

  const handlePaymentComplete = async (results) => {
    try {
      // Record the payment in the backend
      await axios.post('http://localhost:5000/api/payment/record', {
        paymentId: results.payment_id,
        amount: results.amount,
        currency: results.currency,
        status: 'completed'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setHasValidPayment(true);
      setPaymentError('');
      
      // Show success message
      setError('Payment successful! You can now create polls.');
      
      // Refresh payment status
      await checkPaymentStatus();
    } catch (error) {
      console.error('Error recording payment:', error);
      setPaymentError('Failed to record payment. Please contact support.');
    }
  };

  const handleCreatePoll = async (pollData) => {
    try {
      if (!hasValidPayment) {
        setError('Please complete payment before creating a poll');
        return;
      }

      await axios.post('http://localhost:5000/api/polls', pollData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh polls data
      await fetchDashboardData();
      setEditPollDialog(false);
      setError('');
    } catch (error) {
      if (error.response?.data?.error === 'PAYMENT_REQUIRED') {
        setError('Payment required to create a poll');
        setHasValidPayment(false);
      } else {
        setError('Failed to create poll. Please try again.');
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditUserDialog(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://localhost:5000/api/auth/admin/users/${selectedUser._id}`, {
        role: selectedUser.role
      });
      fetchDashboardData();
      setEditUserDialog(false);
    } catch (err) {
      setError('Error updating user');
      console.error(err);
    }
  };

  const handleEditPoll = (poll) => {
    setSelectedPoll(poll);
    setEditPollDialog(true);
  };

  const handleUpdatePoll = async () => {
    try {
      await axios.put(`http://localhost:5000/api/polls/${selectedPoll._id}`, {
        isActive: selectedPoll.isActive
      });
      fetchDashboardData();
      setEditPollDialog(false);
    } catch (err) {
      setError('Error updating poll');
      console.error(err);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      try {
        await axios.delete(`http://localhost:5000/api/polls/${pollId}`);
        fetchDashboardData();
      } catch (err) {
        setError('Error deleting poll');
        console.error(err);
      }
    }
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert 
          severity={error.includes('successful') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {paymentError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {paymentError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{stats.totalUsers}</Typography>
              <Typography color="textSecondary">Total Users</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <PollIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{stats.totalPolls}</Typography>
              <Typography color="textSecondary">Total Polls</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{stats.activePolls}</Typography>
              <Typography color="textSecondary">Active Polls</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <StatsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">{stats.totalVotes}</Typography>
              <Typography color="textSecondary">Total Votes</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Poll Management Section */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Poll Management
          </Typography>
          {!hasValidPayment ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography color="error" variant="body2">
                Payment required to create polls
              </Typography>
              <PaymentButton onPaymentComplete={handlePaymentComplete} />
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PollIcon />}
              onClick={handleMenuOpen}
            >
              Create New Poll
            </Button>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Votes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {polls.map((poll) => (
                <TableRow key={poll._id}>
                  <TableCell>{poll.title}</TableCell>
                  <TableCell>{poll.category}</TableCell>
                  <TableCell>
                    {poll.isActive ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<BlockIcon />}
                        label="Inactive"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>{poll.totalVotes}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPoll(poll)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeletePoll(poll._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Poll Dialog */}
      <Dialog
        open={editPollDialog}
        onClose={() => setEditPollDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPoll ? 'Edit Poll' : 'Create New Poll'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={selectedPoll?.title || ''}
              onChange={(e) => setSelectedPoll({ ...selectedPoll, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={selectedPoll?.description || ''}
              onChange={(e) => setSelectedPoll({ ...selectedPoll, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedPoll?.category || ''}
                onChange={(e) => setSelectedPoll({ ...selectedPoll, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="politics">Politics</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="entertainment">Entertainment</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedPoll?.startDate || ''}
              onChange={(e) => setSelectedPoll({ ...selectedPoll, startDate: e.target.value })}
            />
            <TextField
              label="End Date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedPoll?.endDate || ''}
              onChange={(e) => setSelectedPoll({ ...selectedPoll, endDate: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Options</InputLabel>
              <Select
                multiple
                value={selectedPoll?.options || []}
                onChange={(e) => setSelectedPoll({ ...selectedPoll, options: e.target.value })}
                label="Options"
              >
                {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPollDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleCreatePoll(selectedPoll)}
            variant="contained"
            color="primary"
          >
            {selectedPoll ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editUserDialog}
        onClose={() => setEditUserDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedUser?.role || ''}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateUser()}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 