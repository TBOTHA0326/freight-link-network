// =============================================
// AUTH UTILITIES - Helper functions for authentication
// =============================================

/**
 * Wait for auth state to be ready
 * Useful to avoid race conditions during authentication flows
 */
export function waitForAuthState(timeoutMs: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Auth state timeout'));
    }, timeoutMs);

    const checkAuth = () => {
      // Check if we have a session
      if (typeof window !== 'undefined') {
        const supabaseAuthStorage = localStorage.getItem('sb-' + (process.env.NEXT_PUBLIC_SUPABASE_URL?.split('://')[1]?.split('.')[0] || '') + '-auth-token');
        if (supabaseAuthStorage) {
          clearTimeout(timeout);
          resolve();
          return;
        }
      }

      // Check again in a bit
      setTimeout(checkAuth, 100);
    };

    checkAuth();
  });
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Wait with exponential backoff
      const delay = initialDelayMs * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Safe redirect that ensures auth state is properly established
 */
export async function safeAuthRedirect(url: string, delayMs: number = 200): Promise<void> {
  // Wait a bit for auth state to propagate
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  // Force a page reload to ensure clean auth state
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}