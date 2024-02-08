// Payments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`http://localhost:4001/userPayments/${router.query.id}`);
        setPayments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Payments</h1>
      {loading && <p>Loading payments...</p>}
      {!loading && payments.length === 0 && <p>No payments found.</p>}
      {!loading && payments.length > 0 && (
        <div className="flex flex-wrap -mx-4">
          {payments.map(payment => (
            <div key={payment._id} className="border p-4 m-4 w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
              <h3 className="text-lg font-bold mb-2">Payment ID: {payment._id}</h3>
              <p>Payment Method: {payment.paymentMethod}</p>
              <p>Payment Status: {payment.paymentStatus}</p>
              <p>Amount: {payment.amount} {payment.currency}</p>
              <p>Payment Date: {new Date(payment.paymentDate).toLocaleString()}</p>
              <h4 className="text-lg font-bold mt-2">Order Details:</h4>
              <ul>
                {payment.order.orderItems.map(orderItem => (
                  <li key={orderItem.product._id} className="mb-1">
                    <p>Product: {orderItem.product.name}</p>
                    <p>Quantity: {orderItem.quantity}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
