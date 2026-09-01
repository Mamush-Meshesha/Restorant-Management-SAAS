import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Deep equality check for two values.
 * Uses JSON.stringify for simplicity, which works for standard API JSON responses.
 * (If the API response contains functions, Maps, Sets, or circular references, a custom deep equal function is needed).
 */
const deepEqual = (a: any, b: any) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (e) {
    return a === b;
  }
};

/**
 * useSmartPolling
 *
 * @param fetchFn The asynchronous function that fetches data.
 * @param intervalMs The polling interval in milliseconds.
 * @param deps Dependency array for when the fetchFn should be recreated.
 * @returns { data, loading, error, forceRefresh }
 */
export function useSmartPolling<T>(fetchFn: () => Promise<T>, intervalMs: number = 15000, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Store the latest data stringified in a ref to perform cheap comparisons without triggering re-renders
  const latestDataRef = useRef<T | null>(null);

  const executeFetch = useCallback(async (isInitial: boolean = false) => {
    if (isInitial && !latestDataRef.current) setLoading(true);
    try {
      const response = await fetchFn();
      
      // Compare the new response with the latest data we have stored
      if (!deepEqual(response, latestDataRef.current)) {
        latestDataRef.current = response;
        setData(response);
      }
      
      if (isInitial) setLoading(false);
      setError(null);
    } catch (err: any) {
      setError(err);
      if (isInitial) setLoading(false);
    }
  }, [fetchFn, ...deps]);

  useEffect(() => {
    // Initial fetch
    executeFetch(true);

    // Setup polling
    const intervalId = setInterval(() => {
      executeFetch(false);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [executeFetch, intervalMs]);

  return { data, loading, error, forceRefresh: () => executeFetch(false) };
}
