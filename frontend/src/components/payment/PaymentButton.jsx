import { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import 'intasend-inlinejs-sdk';

const PaymentButton = ({ onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      // Initialize IntaSend with your public key
      const instance = new window.IntaSend({
        publicAPIKey: "ISPubKey_test_2f9f191d-5660-4f36-9375-b3bdda45fc30",
        live: false // Set to true for live environment
      });

      instance
        .on("COMPLETE", (response) => {
          console.log("COMPLETE:", response);
          onPaymentComplete(response);
          setLoading(false);
        })
        .on("FAILED", (response) => {
          console.log("FAILED:", response);
          setError('Payment failed. Please try again.');
          setLoading(false);
        })
        .on("IN-PROGRESS", () => {
          console.log("INPROGRESS ...");
          setLoading(true);
        });
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError('Failed to initialize payment. Please try again.');
    }
  }, [onPaymentComplete]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}
      <button
        className="intaSendPayButton"
        data-amount="10000"
        data-currency="KES"
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Processing...' : 'Pay KES 10000 to Create Poll'}
      </button>
      <Typography variant="caption" color="textSecondary">
        Payment required to create new polls
      </Typography>
    </Box>
  );
};

export default PaymentButton; 