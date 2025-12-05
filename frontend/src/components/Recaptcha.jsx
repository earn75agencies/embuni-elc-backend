/**
 * reCAPTCHA Component
 * Google reCAPTCHA v2 and v3 integration
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildUrl } from '../config/api';

const Recaptcha = ({ 
  version = 'v3', 
  action = 'submit',
  onVerify,
  onError,
  theme = 'light',
  size = 'normal',
  className = ''
}) => {
  const { token } = useAuth();
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [config, setConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Load reCAPTCHA configuration
    const loadConfig = async () => {
      try {
        const response = await fetch(buildUrl('/recaptcha/config'));
        const data = await response.json();
        
        if (data.success && data.data.enabled) {
          setConfig(data.data);
          loadRecaptchaScript(data.data.siteKey, data.data.version);
        } else {
          setLoading(false);
          if (onError) onError('reCAPTCHA is not enabled');
        }
      } catch (error) {
        console.error('Failed to load reCAPTCHA config:', error);
        setLoading(false);
        if (onError) onError('Failed to load reCAPTCHA');
      }
    };

    loadConfig();
  }, []);

  const loadRecaptchaScript = (siteKey, version) => {
    // Check if script already loaded
    if (window.grecaptcha) {
      initializeRecaptcha(siteKey, version);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeRecaptcha(siteKey, version);
    };
    script.onerror = () => {
      setLoading(false);
      if (onError) onError('Failed to load reCAPTCHA script');
    };
    document.head.appendChild(script);
  };

  const initializeRecaptcha = (siteKey, version) => {
    if (version === 'v3') {
      // v3 is invisible, no UI needed
      setLoading(false);
    } else if (version === 'v2') {
      // v2 requires widget
      if (window.grecaptcha && recaptchaRef.current) {
        widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: siteKey,
          theme: theme,
          size: size,
          callback: (token) => {
            if (onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (onError) onError('reCAPTCHA expired');
          },
          'error-callback': () => {
            if (onError) onError('reCAPTCHA error');
          }
        });
        setLoading(false);
      }
    }
  };

  const executeV3 = async () => {
    if (!window.grecaptcha || !config) {
      if (onError) onError('reCAPTCHA not loaded');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(config.siteKey, { action });
      if (onVerify) onVerify(token);
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      if (onError) onError('reCAPTCHA execution failed');
      return null;
    }
  };

  // Expose execute function for v3
  React.useImperativeHandle(recaptchaRef, () => ({
    execute: executeV3
  }));

  if (!config || !config.enabled) {
    return null;
  }

  if (version === 'v3') {
    // v3 is invisible, return a ref for programmatic execution
    return (
      <div className={className} style={{ display: 'none' }}>
        <div ref={recaptchaRef}></div>
      </div>
    );
  }

  // v2 checkbox
  return (
    <div className={className}>
      {loading && <div className="text-sm text-neutral-600">Loading reCAPTCHA...</div>}
      <div ref={recaptchaRef}></div>
    </div>
  );
};

export default Recaptcha;

