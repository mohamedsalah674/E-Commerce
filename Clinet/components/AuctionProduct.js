// src/components/AuctionProduct.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, TextField } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const AuctionProduct = ({ product }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(product.currentPrice);
  const router = useRouter();

  const handleBidClick = async () => {
    try {

      const userId = "65bec97860a51dbc37f5d8f5";

      const response = await axios.post(`http://localhost:4001/auctionProducts/${product._id}/bid/${router.query.id}`, {
        bidAmount: parseFloat(bidAmount),
      });

      // Update the current price in the state
      setCurrentPrice(response.data.newCurrentPrice);

      toast.success('Bid placed successfully', { position: 'top-right' });
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.error, { position: 'top-right' });
    }
  };

  const handleBidAmountChange = (event) => {
    setBidAmount(event.target.value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="subtitle1">Starting Price: ${product.startingPrice}</Typography>
        <Typography variant="subtitle1">Current Price: ${currentPrice}</Typography>
        <Typography variant="subtitle1">Competition End: {product.competitionEnd}</Typography>

        {/* Additional fields as needed */}

        <TextField
          label="Bid Amount"
          type="number"
          value={bidAmount}
          onChange={handleBidAmountChange}
          fullWidth
          margin="normal"
        />

        <Button variant="contained" color="primary" onClick={handleBidClick}>
          Place Bid
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuctionProduct;

// Helper function to get the current user ID (replace with your implementation)
const getCurrentUserId = () => {
  // Replace this with logic to get the current user ID from your authentication system
  // For simplicity, this function returns a placeholder user ID (you should implement it based on your authentication system)
  return 'placeholderUserId';
};
