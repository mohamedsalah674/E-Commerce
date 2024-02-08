// pages/dashboard.js
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import UserProfile from '../../../components/UserProfile';
import OrderHistory from '../../../components/OrderHistory';
import AccountSettings from '../../../components/AccountSettings';

import { useRouter } from 'next/router';


const Dashboard = () => {
  const [userOrders, setUserOrders] = useState([]);
  const userId = '65bec97860a51dbc37f5d8f5';
  const router = useRouter();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const response = await fetch(`http://localhost:4001/orders/get/userorders/${router.query.id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUserOrders(data);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      }
    };

    fetchUserOrders();
  }, [userId]);

  return (
    <Layout>
      <div>
        <h2>Welcome to Your Dashboard</h2>
        <UserProfile />
        <OrderHistory orders={userOrders} />
        <AccountSettings />
      </div>
    </Layout>
  );
};

export default Dashboard;
