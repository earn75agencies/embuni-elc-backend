/**
 * reCAPTCHA Service
 * Handles reCAPTCHA configuration and token generation
 */

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

class RecaptchaService {
  constructor() {
    this.config = null;
    this.scriptLoaded = false;
  }

  /**
   * Load reCAPTCHA configuration from backend
   */
  async loadConfig() {
    try {
      const response = await fetch(`${API_URL}/api/recaptcha/config`);
      const data = await response.json();
      
      if (data.success) {
        this.config = data.data;
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load reCAPTCHA config:', error);
      return null;
    }
  }

  /**
   * Load reCAPTCHA script
   */
  async loadScript() {
    if (this.scriptLoaded || window.grecaptcha) {
      return Promise.resolve();
    }

    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config || !this.config.enabled) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.config.siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Execute reCAPTCHA v3
   */
  async execute(action = 'submit') {
    try {
      await this.loadScript();

      if (!window.grecaptcha || !this.config) {
        throw new Error('reCAPTCHA not loaded');
      }

      const token = await window.grecaptcha.execute(this.config.siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      throw error;
    }
  }

  /**
   * Get reCAPTCHA configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Check if reCAPTCHA is enabled
   */
  isEnabled() {
    return this.config?.enabled || false;
  }
}

export const recaptchaService = new RecaptchaService();
export default recaptchaService;

