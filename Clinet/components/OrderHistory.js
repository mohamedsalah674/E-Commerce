// components/OrderHistory.js
import React from 'react';
import OrderCard from './OrderCard';

const OrderHistory = ({ orders }) => {
  return (
    <div>
      <h3>Order History</h3>
      {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <OrderCard order={order} />
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
