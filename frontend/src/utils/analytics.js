/**
 * Analytics and Monitoring Integration
 * Provides comprehensive analytics tracking and monitoring capabilities
 */

// Analytics configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  googleAnalytics: {
    enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    measurementId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    config: {
      debug_mode: import.meta.env.NODE_ENV !== 'production',
      send_page_view: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: false
    }
  },
  
  // Sentry error tracking
  sentry: {
    enabled: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    dsn: import.meta.env.VITE_SENTRY_DSN,
    config: {
      environment: import.meta.env.NODE_ENV,
      release: import.meta.env.VITE_APP_VERSION,
      tracesSampleRate: import.meta.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0
    }
  },
  
  // Hotjar heatmaps and session recordings
  hotjar: {
    enabled: import.meta.env.VITE_HOTJAR_ID !== undefined,
    siteId: import.meta.env.VITE_HOTJAR_ID,
    config: {
      debug: import.meta.env.NODE_ENV !== 'production'
    }
  },
  
  // Custom analytics
  custom: {
    enabled: true,
    endpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
    batchSize: 10,
    flushInterval: 30000
  }
};

// Analytics manager class
class AnalyticsManager {
  constructor() {
    this.isInitialized = false;
    this.eventQueue = [];
    this.userProperties = {};
    this.sessionId = this.generateSessionId();
    this.userId = null;
    
    // Initialize analytics
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }
  
  // Initialize analytics services
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Google Analytics
      await this.initializeGoogleAnalytics();
      
      // Initialize Sentry
      await this.initializeSentry();
      
      // Initialize Hotjar
      await this.initializeHotjar();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }
  
  // Generate session ID
  generateSessionId() {
    const stored = sessionStorage.getItem('analytics_session_id');
    if (stored) return stored;
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  }
  
  // Initialize Google Analytics 4
  async initializeGoogleAnalytics() {
    if (!ANALYTICS_CONFIG.googleAnalytics.enabled || !ANALYTICS_CONFIG.googleAnalytics.measurementId) {
      return;
    }
    
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, ANALYTICS_CONFIG.googleAnalytics.config);
    
    // Set session ID
    window.gtag('set', 'session_id', this.sessionId);
  }
  
  // Initialize Sentry
  async initializeSentry() {
    if (!ANALYTICS_CONFIG.sentry.enabled || !ANALYTICS_CONFIG.sentry.dsn) {
      return;
    }
    
    try {
      // Dynamically import Sentry
      const Sentry = await import('@sentry/browser');
      
      Sentry.init({
        dsn: ANALYTICS_CONFIG.sentry.dsn,
        environment: ANALYTICS_CONFIG.sentry.config.environment,
        release: ANALYTICS_CONFIG.sentry.config.release,
        tracesSampleRate: ANALYTICS_CONFIG.sentry.config.tracesSampleRate,
        replaysSessionSampleRate: ANALYTICS_CONFIG.sentry.config.replaysSessionSampleRate,
        replaysOnErrorSampleRate: ANALYTICS_CONFIG.sentry.config.replaysOnErrorSampleRate,
        
        // Integrations
        integrations: [
          new Sentry.BrowserTracing(),
          new Sentry.Replay({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        
        // Before send callback
        beforeSend: (event) => {
          // Add custom context
          event.contexts = {
            ...event.contexts,
            analytics: {
              sessionId: this.sessionId,
              userId: this.userId,
              userProperties: this.userProperties
            }
          };
          
          return event;
        }
      });
      
      // Set user context
      if (this.userId) {
        Sentry.setUser({ id: this.userId });
      }
      
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }
  
  // Initialize Hotjar
  async initializeHotjar() {
    if (!ANALYTICS_CONFIG.hotjar.enabled || !ANALYTICS_CONFIG.hotjar.siteId) {
      return;
    }
    
    // Load Hotjar script
    (function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:ANALYTICS_CONFIG.hotjar.siteId,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  }
  
  // Setup event listeners
  setupEventListeners() {
    // Track page views
    this.trackPageView();
    
    // Track route changes
    this.trackRouteChanges();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track performance metrics
    this.trackPerformanceMetrics();
    
    // Track errors
    this.trackErrors();
  }
  
  // Track page view
  trackPageView(path = null) {
    const pagePath = path || window.location.pathname;
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
        page_path: pagePath
      });
    }
    
    // Custom analytics
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: document.title,
      page_location: window.location.href
    });
  }
  
  // Track route changes
  trackRouteChanges() {
    let lastPath = window.location.pathname;
    
    // Override history methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      const result = originalPushState.apply(this, args);
      analyticsManager.trackPageView();
      return result;
    };
    
    history.replaceState = function(...args) {
      const result = originalReplaceState.apply(this, args);
      analyticsManager.trackPageView();
      return result;
    };
    
    // Listen to popstate events
    window.addEventListener('popstate', () => {
      analyticsManager.trackPageView();
    });
  }
  
  // Track user interactions
  trackUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (event) => {
      const element = event.target.closest('button, a, [role="button"]');
      if (element) {
        this.trackEvent('click', {
          element_type: element.tagName.toLowerCase(),
          element_text: element.textContent?.substring(0, 50),
          element_id: element.id,
          element_class: element.className,
          page_path: window.location.pathname
        });
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          form_id: form.id,
          form_class: form.className,
          form_action: form.action,
          page_path: window.location.pathname
        });
      }
    });
    
    // Track scroll depth
    let maxScrollDepth = 0;
    const scrollThresholds = [25, 50, 75, 90];
    
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        scrollThresholds.forEach(threshold => {
          if (scrollDepth >= threshold && !this.hasTrackedScrollDepth(threshold)) {
            this.trackEvent('scroll_depth', {
              depth: threshold,
              page_path: window.location.pathname
            });
            this.markScrollDepthTracked(threshold);
          }
        });
      }
    });
  }
  
  // Check if scroll depth has been tracked
  hasTrackedScrollDepth(depth) {
    const key = `scroll_depth_tracked_${depth}`;
    return sessionStorage.getItem(key) === 'true';
  }
  
  // Mark scroll depth as tracked
  markScrollDepthTracked(depth) {
    const key = `scroll_depth_tracked_${depth}`;
    sessionStorage.setItem(key, 'true');
  }
  
  // Track performance metrics
  trackPerformanceMetrics() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackEvent('performance_metric', {
              name: entry.name,
              value: entry.startTime || entry.duration || entry.value,
              type: entry.entryType,
              page_path: window.location.pathname
            });
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Failed to observe performance metrics:', error);
      }
    }
  }
  
  // Track errors
  trackErrors() {
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        page_path: window.location.pathname
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('promise_rejection', {
        reason: event.reason?.message || event.reason,
        page_path: window.location.pathname
      });
    });
  }
  
  // Track custom event
  trackEvent(eventName, parameters = {}) {
    const event = {
      name: eventName,
      parameters: {
        ...parameters,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        user_id: this.userId,
        ...this.userProperties
      }
    };
    
    // Google Analytics
    if (window.gtag && ANALYTICS_CONFIG.googleAnalytics.enabled) {
      window.gtag('event', eventName, parameters);
    }
    
    // Custom analytics
    this.eventQueue.push(event);
    
    // Flush queue if needed
    if (this.eventQueue.length >= ANALYTICS_CONFIG.custom.batchSize) {
      this.flushEventQueue();
    }
  }
  
  // Flush event queue
  async flushEventQueue() {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    if (!ANALYTICS_CONFIG.custom.endpoint) return;
    
    try {
      await fetch(`${ANALYTICS_CONFIG.custom.endpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events,
          metadata: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            session_id: this.sessionId,
            user_id: this.userId
          }
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Add events back to queue for retry
      this.eventQueue.unshift(...events);
    }
  }
  
  // Set user ID
  setUserId(userId) {
    this.userId = userId;
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('set', 'user_id', userId);
    }
    
    // Sentry
    if (window.Sentry) {
      window.Sentry.setUser({ id: userId });
    }
  }
  
  // Set user properties
  setUserProperties(properties) {
    this.userProperties = { ...this.userProperties, ...properties };
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('set', 'user_properties', this.userProperties);
    }
    
    // Sentry
    if (window.Sentry) {
      window.Sentry.setUser({
        id: this.userId,
        ...this.userProperties
      });
    }
  }
  
  // Track conversion
  trackConversion(conversionType, value = 0, currency = 'USD') {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      currency
    });
    
    // Google Analytics e-commerce
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: `${conversionType}_${Date.now()}`,
        value,
        currency,
        items: [{
          item_id: conversionType,
          item_name: conversionType,
          category: 'conversion'
        }]
      });
    }
  }
  
  // Track engagement
  trackEngagement(type, target, duration = null) {
    this.trackEvent('engagement', {
      engagement_type: type,
      target,
      duration,
      page_path: window.location.pathname
    });
  }
  
  // Track feature usage
  trackFeatureUsage(featureName, properties = {}) {
    this.trackEvent('feature_usage', {
      feature_name: featureName,
      ...properties
    });
  }
  
  // Start periodic flush
  startPeriodicFlush() {
    setInterval(() => {
      this.flushEventQueue();
    }, ANALYTICS_CONFIG.custom.flushInterval);
  }
}

// Global analytics manager instance
export const analyticsManager = new AnalyticsManager();

// Start periodic flush
if (typeof window !== 'undefined') {
  analyticsManager.startPeriodicFlush();
}

// Analytics hooks for React
export const useAnalytics = () => {
  const trackEvent = (eventName, parameters = {}) => {
    analyticsManager.trackEvent(eventName, parameters);
  };
  
  const trackPageView = (path = null) => {
    analyticsManager.trackPageView(path);
  };
  
  const setUserId = (userId) => {
    analyticsManager.setUserId(userId);
  };
  
  const setUserProperties = (properties) => {
    analyticsManager.setUserProperties(properties);
  };
  
  const trackConversion = (type, value, currency) => {
    analyticsManager.trackConversion(type, value, currency);
  };
  
  const trackEngagement = (type, target, duration) => {
    analyticsManager.trackEngagement(type, target, duration);
  };
  
  const trackFeatureUsage = (featureName, properties) => {
    analyticsManager.trackFeatureUsage(featureName, properties);
  };
  
  return {
    trackEvent,
    trackPageView,
    setUserId,
    setUserProperties,
    trackConversion,
    trackEngagement,
    trackFeatureUsage
  };
};

export default {
  analyticsManager,
  useAnalytics,
  ANALYTICS_CONFIG
};
