/**
 * Custom hook for API calls with loading, error, and data states
 * Modern pattern for handling async operations
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for API calls
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

/**
 * Hook for API calls with immediate execution
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApiQuery = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

