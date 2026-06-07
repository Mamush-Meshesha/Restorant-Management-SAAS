/**
 * Example usage of refresh token functionality
 *
 * This file demonstrates how to use the refresh token system
 * in your React components and API calls.
 */

import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import {
  refreshAuthToken,
  ensureValidToken,
  isTokenExpired,
} from "@/lib/tokenUtils";

// Example 1: Using the hook in a React component
export const ExampleComponent = () => {
  const {
    refreshTokenManually,
    isTokenExpired,
    isAuthenticated,
    hasRefreshToken,
  } = useTokenRefresh();

  const handleRefreshToken = async () => {
    try {
      const success = await refreshTokenManually();
      if (success) {
        console.log("Token refreshed successfully");
      } else {
        console.log("Token refresh failed");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  // Example of how to use the hook values
  const tokenStatus = isAuthenticated() ? "Valid" : "Invalid";
  const tokenExpiredStatus = isTokenExpired ? "Yes" : "No";
  const hasRefreshTokenStatus = hasRefreshToken ? "Yes" : "No";

  console.log("Token Status:", tokenStatus);
  console.log("Token Expired:", tokenExpiredStatus);
  console.log("Has Refresh Token:", hasRefreshTokenStatus);

  // Return the handler function for use in JSX components
  return {
    handleRefreshToken,
    tokenStatus,
    tokenExpiredStatus,
    hasRefreshTokenStatus,
  };
};

// Example 2: Using the utility functions directly
export const exampleUtilityUsage = async () => {
  // Check if token is expired (if you have expiry info)
  const loginExpiry = "2024-12-31T23:59:59Z"; // Example expiry
  const expired = isTokenExpired(loginExpiry);
  console.log("Token expired:", expired);

  // Ensure token is valid (will refresh if needed)
  const isValid = await ensureValidToken(loginExpiry);
  console.log("Token is valid:", isValid);

  // Refresh token manually
  const refreshSuccess = await refreshAuthToken();
  console.log("Refresh successful:", refreshSuccess);
};

// Example 3: API call with automatic token refresh
export const exampleApiCall = async () => {
  // The axios interceptor will automatically handle token refresh
  // if the token is expired or about to expire
  try {
    const response = await fetch("/api/some-endpoint", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // This will be handled by axios interceptor
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("API call successful:", data);
    }
  } catch (error) {
    console.error("API call failed:", error);
  }
};

/**
 * Key Features of the Refresh Token Implementation:
 *
 * 1. Automatic Token Refresh:
 *    - 401 responses trigger automatic token refresh and request retry
 *    - New access token and refresh token are automatically stored
 *
 * 2. Manual Token Refresh:
 *    - Use the useTokenRefresh hook for manual refresh operations
 *    - Check token status in your components
 *
 * 3. Error Handling:
 *    - Failed refresh attempts automatically logout the user
 *    - Prevents infinite refresh loops
 *
 * 4. API Response Handling:
 *    - Handles response: { message, token, refreshToken, user, loginExpiry }
 *    - Updates both access token, refresh token, and login expiry in Redux store
 *
 * 5. Redux Integration:
 *    - Token state is managed in Redux store
 *    - Automatic updates when tokens are refreshed
 *
 * 6. TypeScript Support:
 *    - Full type safety for all refresh token operations
 *    - Proper error handling with typed responses
 */
