// components/OrderCard.js
import React, { useState } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import ProductCard from './ProductCard';

const OrderCard = ({ order }) => {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const isOrderProcessed = order.status === 'Processed';

  const handlePayment = () => {
    setIsPaymentProcessing(true);

    fetch(`http://localhost:4001/process-payment/${order._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: order.orderItems.map((item) => ({
          id: item.product ? item.product._id : null,
          quantity: item.quantity,
        })),
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        window.location = url; // Redirect to the Stripe payment page
      })
      .catch((e) => {
        console.error(e.error);
      })
      .finally(() => {
        setIsPaymentProcessing(false);
      });
  };

  return (
    <Card>
      <CardContent>
        {/* Other order details */}
        <Typography variant="h6">Order: {order._id}</Typography>
        <Typography variant="subtitle1">Order Status: {order.status}</Typography>
        <Typography variant="subtitle1">User ID: {order.user}</Typography>
        <Typography variant="subtitle1">Date: {new Date(order.dateOrdered).toLocaleString()}</Typography>
        <Typography variant="subtitle1">Total Price: ${order.totalPrice}</Typography>
        
        {/* Shipping Details */}
        <Typography variant="h6">Shipping Details</Typography>
        <Typography variant="subtitle1">Shipping Address 1: {order.shippingAddress1}</Typography>
        <Typography variant="subtitle1">City: {order.city}</Typography>
        <Typography variant="subtitle1">ZIP: {order.zip}</Typography>
        <Typography variant="subtitle1">Country: {order.country}</Typography>
        <Typography variant="subtitle1">Phone: {order.phone}</Typography>

        {/* Order Items */}
        <Typography variant="h6">Order Items</Typography>
        {order.orderItems.map((orderItem) => (
          <ProductCard key={orderItem._id} product={orderItem.product} quantity={orderItem.quantity} />
        ))}

        {/* Payment Button */}
        <Button
          variant="contained"
          color="primary"
          disabled={isPaymentProcessing || isOrderProcessed}
          onClick={handlePayment}
        >
          {isOrderProcessed ? 'Order Processed' : isPaymentProcessing ? 'Processing Payment...' : 'Pay Now'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
