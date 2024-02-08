import React from 'react';

const UserProfile = () => {
  // Fetch user data from your backend or context
  const userData = {
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    // Add more user-related data
  };

  return (
    <div>
      <h3>User Profile</h3>
      <p>Username: {userData.username}</p>
      <p>Email: {userData.email}</p>
      {/* Add more user-related information */}
    </div>
  );
};

export default UserProfile;
