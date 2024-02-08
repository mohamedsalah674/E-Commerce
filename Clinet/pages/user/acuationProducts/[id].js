// src/components/AuctionProducts.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Typography } from '@mui/material';
import AuctionProduct from '../../../components/AuctionProduct';

const AuctionProducts = () => {
  const [auctionProducts, setAuctionProducts] = useState([]);

  useEffect(() => {
    // Fetch auction products
    const fetchAuctionProducts = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/auctionProducts');
        setAuctionProducts(response.data);
      } catch (error) {
        console.error('Error fetching auction products:', error);
      }
    };

    fetchAuctionProducts();
  }, []);

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom>
        Auction Products
      </Typography>
      <Grid container spacing={2}>
        {auctionProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <AuctionProduct product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AuctionProducts;
