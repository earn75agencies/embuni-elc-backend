import React from 'react';

function MinimalApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#8B0000', fontSize: '32px', marginBottom: '20px' }}>
        Equity Leaders Program
      </h1>
      <p style={{ fontSize: '18px', color: '#333' }}>
        University of Embu - Testing Minimal App
      </p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
        <p>✅ React is working</p>
        <p>✅ Styles are loading</p>
        <p>✅ App component renders</p>
      </div>
    </div>
  );
}

export default MinimalApp;