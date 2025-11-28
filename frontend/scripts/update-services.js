#!/usr/bin/env node

/**
 * Script to update all services to use centralized API configuration
 * Replaces hardcoded URLs with API_ENDPOINTS
 */

const fs = require('fs');
const path = require('path');

// Services to update
const services = [
  'postService.js',
  'galleryService.js',
  'memberService.js',
  'adminService.js',
  'authService.js',
  'contactService.js',
  'adminCredentialService.js',
  'recaptchaService.js'
];

// Update patterns
const patterns = [
  {
    from: /const API_URL = `\${import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/embuni-elc-backend\.onrender\.com'}\/api\/\w+`;?/g,
    to: ''
  },
  {
    from: /import axios from 'axios';/g,
    to: "import apiClient from './apiClient';\nimport { API_ENDPOINTS } from '../config/api';"
  },
  {
    from: /await axios\.get\(`([^`]+)`/g,
    to: 'await apiClient.get($1'
  },
  {
    from: /await axios\.post\(`([^`]+)`,/g,
    to: 'await apiClient.post($1,'
  },
  {
    from: /await axios\.put\(`([^`]+)`,/g,
    to: 'await apiClient.put($1,'
  },
  {
    from: /await axios\.delete\(`([^`]+)`,/g,
    to: 'await apiClient.delete($1,'
  }
];

services.forEach(service => {
  const filePath = path.join(__dirname, '../src/services', service);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    patterns.forEach(pattern => {
      content = content.replace(pattern.from, pattern.to);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${service}`);
  } else {
    console.log(`❌ File not found: ${service}`);
  }
});

console.log('🎉 Service update complete!');