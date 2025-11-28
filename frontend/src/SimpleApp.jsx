import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple test components
const Home = () => <div style={{ padding: '20px' }}><h1>Home Page</h1><p>Home page content here</p></div>;
const About = () => <div style={{ padding: '20px' }}><h1>About Page</h1><p>About page content here</p></div>;

function SimpleApp() {
  console.log('SimpleApp rendering...');
  
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <nav style={{ backgroundColor: '#8B0000', padding: '1rem', color: 'white' }}>
          <h2>Equity Leaders Program - Navigation</h2>
          <a href="/" style={{ color: 'white', marginRight: '20px' }}>Home</a>
          <a href="/about" style={{ color: 'white' }}>About</a>
        </nav>
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default SimpleApp;