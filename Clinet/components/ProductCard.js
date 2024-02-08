import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const ProductCard = ({ product, quantity }) => {
  const defaultImageSrc = '/Firstima.JPG';

  const renderAuctionDetails = () => {
    const { auctionProduct } = product || {};
    if (auctionProduct) {
      const { name, startingPrice, currentPrice } = auctionProduct;
      const totalPrice = currentPrice ? currentPrice * quantity : 0;
      return (
        <>
          <Typography variant="h6">{name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Starting Price: ${startingPrice || 0}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Current Price: ${currentPrice || 0}
          </Typography>
          <Typography variant="subtitle1">Quantity: {quantity}</Typography>
          <Typography variant="subtitle1">Total Price: ${totalPrice}</Typography>
        </>
      );
    }
    return null;
  };

  return (
    <Card style={{ marginBottom: '10px' }}>
      {product && product.images && product.images.length > 0 ? (
        <img
          src={product.images[0]}
          alt={product.name || 'Product Image'}
          style={{ width: '100%', maxHeight: '140px', objectFit: 'cover' }}
        />
      ) : (
        <img
          src={defaultImageSrc}
          alt={product && product.name ? product.name : 'Default Image'}
          style={{ width: '100%', maxHeight: '140px', objectFit: 'cover' }}
        />
      )}
      <CardContent>
        {product && product.isAuction ? (
          renderAuctionDetails()
        ) : (
          <>
            <Typography variant="h6">
              {product && product.name ? product.name : 'Product Name'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Price: ${product && product.price ? product.price : 0}
            </Typography>
            <Typography variant="subtitle1">Quantity: {quantity}</Typography>
            <Typography variant="subtitle1">
              Total Price: ${product && product.price ? product.price * quantity : 0}
            </Typography>
          </>
        )}
        {/* Add more details as needed */}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
