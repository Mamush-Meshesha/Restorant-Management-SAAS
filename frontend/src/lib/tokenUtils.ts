import { refreshToken } from "@/api/_auth";
import { store } from "@/redux/store";
import { setRefreshedToken, logoutFinished } from "@/redux/slices/authSlice";
import { extractErrorMessage } from "./errorUtils";

/**
 * Checks if a token is expired or about to expire
 * @param loginExpiry - The login expiry timestamp
 * @param bufferMinutes - Buffer time in minutes before expiry to consider token as expired
 * @returns True if token is expired or about to expire
 */
export const isTokenExpired = (
  loginExpiry: string | null,
  bufferMinutes: number = 5
): boolean => {

  if (!loginExpiry) return false; // If no expiry info, assume token is valid



  const expiryTime = new Date(loginExpiry).getTime();
  const currentTime = new Date().getTime();
  const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds

  return currentTime >= expiryTime - bufferTime;
};

/**
 * Refreshes the authentication token using the refresh token
 * @returns Promise<boolean> - True if refresh was successful, false otherwise
 */
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const state = store.getState();
    const refreshTokenValue = state.auth?.refreshToken;
    console.log("Attempting to refresh token...", { refreshTokenValue });

    if (!refreshTokenValue) {
      console.warn("No refresh token available");
      return false;
    }

    const response = await refreshToken({ refreshToken: refreshTokenValue });
    const { token, refreshToken: newRefreshToken, loginExpiry } = response.data;

    // Update the store with new token, refresh token, and login expiry
    store.dispatch(
      setRefreshedToken({
        token,
        refreshToken: newRefreshToken,
        loginExpiry,
      })
    );

    console.log("Token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Failed to refresh token:", extractErrorMessage(error));

    // If refresh fails, logout the user
    store.dispatch(logoutFinished());

    return false;
  }
};

/**
 * Attempts to refresh token if it's expired or about to expire
 * @param loginExpiry - The current login expiry timestamp
 * @returns Promise<boolean> - True if token is valid or was successfully refreshed
 */
export const ensureValidToken = async (
  loginExpiry: string | null
): Promise<boolean> => {
  if (!isTokenExpired(loginExpiry)) {
    return true; // Token is still valid
  }

  console.log("Token expired or about to expire, attempting refresh...");
  return await refreshAuthToken();
};
