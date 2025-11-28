import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('Starting React app...');

// Error handling for React rendering
try {
  console.log('Attempting to render App...');
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('React rendering error:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>Application Error</h1>
      <p>Failed to render application.</p>
      <details>
        <summary>Error Details</summary>
        <pre>${error.message}</pre>
      </details>
    </div>
  `;
}
