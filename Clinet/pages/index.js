// pages/index.js
import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard'; // Assuming you have a ProductCard component

const LandingPage = () => {
  return (
    <Container>
      {/* Hero Section */}
      <Hero
        title="Discover Unique Products"
        description="Explore our curated collection of high-quality products and enjoy exclusive offers."
      />

      {/* Featured Products Section */}
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <ProductCard
            name="Premium Watch"
            price="$199.99"
            imageSrc="/images/product1.jpg"
            description="Elegant and stylish watch for any occasion."
          />
        </Grid>
        <Grid item xs={4}>
          <ProductCard
            name="Wireless Headphones"
            price="$129.99"
            imageSrc="/images/product2.jpg"
            description="Immerse yourself in music with these high-quality headphones."
          />
        </Grid>
        <Grid item xs={4}>
          <ProductCard
            name="Leather Backpack"
            price="$149.99"
            imageSrc="/images/product3.jpg"
            description="Stay organized and stylish with this durable leather backpack."
          />
        </Grid>
      </Grid>

      {/* Call-to-Action Section */}
      <Hero
        title="Exclusive Offer!"
        description="Get 10% off on your first purchase. Limited time only. Use code: FIRST10"
      />

      {/* Testimonials Section (Optional) */}
      <Box mt={5}>
        <Typography variant="h4" align="center" gutterBottom>
          What Our Customers Say
        </Typography>
        {/* Add testimonials or customer reviews here */}
      </Box>
    </Container>
  );
};

export default LandingPage;
