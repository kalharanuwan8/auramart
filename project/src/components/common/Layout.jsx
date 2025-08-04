import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingChatButton from './FloatingChatButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
};

export default Layout;