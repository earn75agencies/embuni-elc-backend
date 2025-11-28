/**
 * Performance Monitoring Hook
 * Tracks and reports performance metrics for production monitoring
 */

import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

export const usePerformanceMonitor = (componentName, options = {}) => {
  const {
    trackRenderTime = true,
    trackUserInteractions = false,
    trackNetworkRequests = false,
    threshold = 100 // ms threshold for warnings
  } = options;

  const renderStartTime = useRef(performance.now());
  const interactionCount = useRef(0);
  const networkRequestCount = useRef(0);

  // Track component render time
  useEffect(() => {
    if (trackRenderTime) {
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime.current;
      
      performanceMonitor.recordMetric({
        type: 'component_render',
        component: componentName,
        duration: renderTime,
        timestamp: Date.now()
      });

      if (renderTime > threshold) {
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }
  }, [componentName, trackRenderTime, threshold]);

  // Track user interactions
  const trackInteraction = useCallback((action, details = {}) => {
    if (trackUserInteractions) {
      interactionCount.current += 1;
      
      performanceMonitor.recordMetric({
        type: 'user_interaction',
        component: componentName,
        action,
        interactionCount: interactionCount.current,
        details,
        timestamp: Date.now()
      });
    }
  }, [componentName, trackUserInteractions]);

  // Track network requests
  const trackNetworkRequest = useCallback((url, method, duration, status) => {
    if (trackNetworkRequests) {
      networkRequestCount.current += 1;
      
      performanceMonitor.recordMetric({
        type: 'network_request',
        component: componentName,
        url,
        method,
        duration,
        status,
        requestCount: networkRequestCount.current,
        timestamp: Date.now()
      });
    }
  }, [componentName, trackNetworkRequests]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    return performanceMonitor.getComponentMetrics(componentName);
  }, [componentName]);

  return {
    trackInteraction,
    trackNetworkRequest,
    getPerformanceSummary,
    interactionCount: interactionCount.current,
    networkRequestCount: networkRequestCount.current
  };
};

export default usePerformanceMonitor;
