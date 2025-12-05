/**
 * MSW API Handlers
 * Mock API handlers for testing
 */

import { rest } from 'msw';
import { createMockUser, createMockEvent, createMockPost } from '../setup';

const API_BASE = 'http://localhost:3000/api';

// Authentication handlers
export const authHandlers = [
  // Login
  rest.post(`${API_BASE}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user: createMockUser({ email }),
            token: 'mock-jwt-token'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: { message: 'Invalid credentials' }
      })
    );
  }),
  
  // Register
  rest.post(`${API_BASE}/auth/register`, (req, res, ctx) => {
    const { email, password, name } = req.body;
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          user: createMockUser({ email, name }),
          token: 'mock-jwt-token'
        }
      })
    );
  }),
  
  // Logout
  rest.post(`${API_BASE}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Logged out successfully'
      })
    );
  }),
  
  // Get profile
  rest.get(`${API_BASE}/auth/profile`, (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.includes('Bearer mock-jwt-token')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: { message: 'Unauthorized' }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockUser()
      })
    );
  })
];

// Events handlers
export const eventsHandlers = [
  // Get events list
  rest.get(`${API_BASE}/events`, (req, res, ctx) => {
    const events = [
      createMockEvent({ id: '1', title: 'Upcoming Event 1' }),
      createMockEvent({ id: '2', title: 'Upcoming Event 2' }),
      createMockEvent({ id: '3', title: 'Past Event', isUpcoming: false })
    ];
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: events
      })
    );
  }),
  
  // Get single event
  rest.get(`${API_BASE}/events/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '404') {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: { message: 'Event not found' }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockEvent({ id })
      })
    );
  }),
  
  // Create event
  rest.post(`${API_BASE}/events`, (req, res, ctx) => {
    const eventData = req.body;
    
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: createMockEvent(eventData)
      })
    );
  }),
  
  // Update event
  rest.put(`${API_BASE}/events/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const eventData = req.body;
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockEvent({ id, ...eventData })
      })
    );
  }),
  
  // Delete event
  rest.delete(`${API_BASE}/events/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Event deleted successfully'
      })
    );
  })
];

// Posts handlers
export const postsHandlers = [
  // Get posts list
  rest.get(`${API_BASE}/posts`, (req, res, ctx) => {
    const posts = [
      createMockPost({ id: '1', title: 'Latest Post 1' }),
      createMockPost({ id: '2', title: 'Latest Post 2' }),
      createMockPost({ id: '3', title: 'Featured Post', isFeatured: true })
    ];
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: posts
      })
    );
  }),
  
  // Get single post
  rest.get(`${API_BASE}/posts/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === '404') {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          error: { message: 'Post not found' }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: createMockPost({ id })
      })
    );
  })
];

// Contact handlers
export const contactHandlers = [
  // Submit contact form
  rest.post(`${API_BASE}/contact/message`, (req, res, ctx) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          error: { message: 'All fields are required' }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'Message sent successfully'
      })
    );
  }),
  
  // Get contact info
  rest.get(`${API_BASE}/contact`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          email: 'contact@example.com',
          phone: '+254 123 456 789',
          address: '123 Test Street, Nairobi, Kenya'
        }
      })
    );
  })
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Network error
  rest.get(`${API_BASE}/network-error`, (req, res, ctx) => {
    return res.networkError('Network connection failed');
  }),
  
  // Server error
  rest.get(`${API_BASE}/server-error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        success: false,
        error: { message: 'Internal server error' }
      })
    );
  }),
  
  // Timeout error
  rest.get(`${API_BASE}/timeout`, (req, res, ctx) => {
    return res(
      ctx.delay(10000), // 10 second delay
      ctx.status(200),
      ctx.json({ success: true })
    );
  })
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...eventsHandlers,
  ...postsHandlers,
  ...contactHandlers,
  ...errorHandlers
];
