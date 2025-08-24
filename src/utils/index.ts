// Utility functions

export const cn = (...cls: Array<string | false | null | undefined>) => cls.filter(Boolean).join(" ");

export const now = () => Date.now();
export const uid = () => Math.random().toString(36).slice(2);
export const fmtTime = (ts: number) => new Date(ts).toLocaleString();

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Safe localStorage operations
export const safeLocalStorage = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Input validation
export const validateInput = {
  maxLength: (text: string, max: number): boolean => text.length <= max,
  minLength: (text: string, min: number): boolean => text.length >= min,
  isNotEmpty: (text: string): boolean => text.trim().length > 0,
  sanitizeHtml: (text: string): string => text.replace(/<[^>]*>/g, '')
};
