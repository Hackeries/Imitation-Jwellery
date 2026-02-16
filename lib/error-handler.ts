
export class NetworkError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Wrap a fetch call to handle network errors gracefully
 * @param fetchFn - The fetch function to wrap
 * @returns The response if successful, or throws a NetworkError
 */
export async function handleFetchError<T>(
  fetchFn: () => Promise<Response>,
  errorMessage?: string,
): Promise<T> {
  try {
    const response = await fetchFn();

    if (!response.ok) {
      let errorMsg = errorMessage || "Request failed";

      if (response.status === 401 || response.status === 403) {
        errorMsg = "Unauthorized. Please login again.";
      } else if (response.status === 404) {
        errorMsg = "Resource not found.";
      } else if (response.status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else if (response.status >= 500) {
        errorMsg = "Server is experiencing issues. Please try again later.";
      }

      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch {
      }

      throw new NetworkError(errorMsg, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      if (error.message.includes("Failed to fetch")) {
        throw new NetworkError(
          "Cannot connect to the server. Please check your internet connection or try again later.",
          undefined,
          true,
        );
      }

      if (error.message.includes("fetch")) {
        throw new NetworkError(
          "Network error. Please check your connection and try again.",
          undefined,
          true,
        );
      }
    }
    if (error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "An unexpected error occurred",
    );
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (!(error instanceof NetworkError) || !error.isNetworkError) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
