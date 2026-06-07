import { useCallback } from "react";
import { useAppSelector } from "./auth";
import { refreshAuthToken, isTokenExpired } from "@/lib/tokenUtils";

/**
 * Hook for managing token refresh functionality
 * @returns Object with refresh functions and token status
 */
export const useTokenRefresh = () => {
  const { token, refreshToken, loginExpiry } = useAppSelector(
    (state) => state.auth
  );

  const refreshTokenManually = useCallback(async (): Promise<boolean> => {
    return await refreshAuthToken();
  }, []);

  const checkTokenExpiry = useCallback((): boolean => {
    return isTokenExpired(loginExpiry);
  }, [loginExpiry]);

  const isAuthenticated = useCallback((): boolean => {
    return !!(token && refreshToken && !isTokenExpired(loginExpiry));
  }, [token, refreshToken, loginExpiry]);

  return {
    refreshTokenManually,
    checkTokenExpiry,
    isAuthenticated,
    isTokenExpired: checkTokenExpiry(),
    hasRefreshToken: !!refreshToken,
  };
};
