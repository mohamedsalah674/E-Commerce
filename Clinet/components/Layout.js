// components/Layout.js
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div>
      {/* Include common elements like header, navigation, etc. */}
      <header>
        <h1>Your E-Commerce Store</h1>
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Footer */}
      <footer>&copy; 2024 Your Company</footer>
    </div>
  );
};

export default Layout;
