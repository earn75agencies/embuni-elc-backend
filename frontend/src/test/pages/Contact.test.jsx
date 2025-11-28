/**
 * Component Test Example
 * Example test for a React component using Vitest and React Testing Library
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from '../../pages/Contact';
import { createMockUser } from '../setup';
import { ContactProvider } from '../../context/ContactContext';

// Mock the contact service
vi.mock('../../services/contactService', () => ({
  contactService: {
    getContactInfo: vi.fn(() => Promise.resolve({
      email: 'elp@uoem.ac.ke',
      phone: '+254 712 345 678',
      address: 'University of Embu, Embu, Kenya',
      socialLinks: {
        facebook: 'https://facebook.com',
        twitter: 'https://twitter.com',
        instagram: 'https://www.instagram.com/uoem_elc?igsh=MXAzbW42dXQ4MDJ1YQ==',
        linkedin: 'https://linkedin.com'
      }
    })),
    submitContactForm: vi.fn(() => Promise.resolve({ success: true }))
  }
}));

// Mock the analytics
vi.mock('../../utils/analytics', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
    trackFeatureUsage: vi.fn()
  })
}));

// Test wrapper with router and context
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ContactProvider>
      {children}
    </ContactProvider>
  </BrowserRouter>
);

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders contact form correctly', () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
  
  it('validates form fields', async () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Try to submit empty form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });
  });
  
  it('validates email format', async () => {
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });
  
  it('submits form successfully', async () => {
    const { submitContactForm } = await import('../../services/contactService');
    submitContactForm.mockResolvedValue({
      success: true,
      message: 'Message sent successfully'
    });
    
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a test message'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });
  
  it('handles submission error', async () => {
    const { submitContactForm } = await import('../../services/contactService');
    submitContactForm.mockRejectedValue(new Error('Network error'));
    
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });
  
  it('shows loading state during submission', async () => {
    const { submitContactForm } = await import('../../services/contactService');
    submitContactForm.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
  });
  
  it('resets form after successful submission', async () => {
    const { submitContactForm } = await import('../../services/contactService');
    submitContactForm.mockResolvedValue({
      success: true,
      message: 'Message sent successfully'
    });
    
    render(
      <TestWrapper>
        <Contact />
      </TestWrapper>
    );
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole('button', { name: /send message/i });
    
    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'This is a test message' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
    
    // Check form is reset
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(messageInput.value).toBe('');
  });
});
