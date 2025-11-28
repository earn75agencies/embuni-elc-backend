/**
 * useRecaptcha Hook
 * Easy reCAPTCHA integration for forms
 */

import { useState, useEffect, useRef } from 'react';
import { buildUrl } from '../config/api';

export const useRecaptcha = (version = 'v3', action = 'submit') => {
  const [config, setConfig] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(buildUrl('/recaptcha/config'));
      const data = await response.json();
      
      if (data.success && data.data.enabled) {
        setConfig(data.data);
        await loadRecaptchaScript(data.data.siteKey, data.data.version);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load reCAPTCHA config:', error);
      setLoading(false);
      setError('Failed to load reCAPTCHA');
    }
  };

  const loadRecaptchaScript = (siteKey, version) => {
    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        resolve();
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
        setLoading(false);
      };
      script.onerror = () => {
        reject(new Error('Failed to load reCAPTCHA script'));
        setLoading(false);
        setError('Failed to load reCAPTCHA script');
      };
      document.head.appendChild(script);
    });
  };

  const execute = async () => {
    if (!window.grecaptcha || !config) {
      setError('reCAPTCHA not loaded');
      return null;
    }

    try {
      setError(null);
      const token = await window.grecaptcha.execute(config.siteKey, { action });
      setToken(token);
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      setError('reCAPTCHA execution failed');
      return null;
    }
  };

  const reset = () => {
    setToken(null);
    setError(null);
    if (window.grecaptcha && recaptchaRef.current) {
      window.grecaptcha.reset(recaptchaRef.current);
    }
  };

  return {
    config,
    token,
    loading,
    error,
    execute,
    reset,
    isEnabled: config?.enabled || false
  };
};

