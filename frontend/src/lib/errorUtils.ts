import type { AxiosError } from "axios";

/**
 * Helper function to extract error message from axios error or any error
 * @param error - The error object to extract message from
 * @returns A user-friendly error message
 */
export const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      const responseData = axiosError.response.data as Record<string, unknown>;
      // Try to extract error message from common server response formats
      if (typeof responseData.message === "string") {
        return responseData.message;
      }
      if (typeof responseData.error === "string") {
        return responseData.error;
      }
      if (Array.isArray(responseData.errors)) {
        return responseData.errors.join(", ");
      }
      if (typeof responseData === "string") {
        return responseData;
      }
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error && typeof error === "object" && "message" in error) {
    return (error as Error).message;
  }
  return "An unexpected error occurred";
};

/**
 * Helper function to extract detailed error information from axios error
 * @param error - The error object to extract information from
 * @returns Object containing error details
 */
export const extractErrorDetails = (
  error: unknown
): {
  message: string;
  status?: number;
  statusText?: string;
  data?: unknown;
} => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError;
    return {
      message: extractErrorMessage(error),
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    };
  }

  return {
    message: extractErrorMessage(error),
  };
};

/**
 * Helper function to check if error is an axios error
 * @param error - The error to check
 * @returns True if it's an axios error
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return error !== null && typeof error === "object" && "response" in error;
};
