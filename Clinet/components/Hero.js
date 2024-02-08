// components/Hero.jsx
import React from 'react';
import { Button, Typography } from '@mui/material';

const Hero = ({ title, description }) => {
  return (
    <div className="hero">
      <Typography variant="h2" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" paragraph>
        {description}
      </Typography>
      <Button variant="contained" color="primary">
        Shop Now
      </Button>
    </div>
  );
};

export default Hero;
