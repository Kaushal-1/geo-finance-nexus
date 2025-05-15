
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Debounce function to prevent multiple repeated calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Function to prevent multiple auth toasts
export const createAuthToastManager = () => {
  let toastShown = false;
  let toastResetTimer: ReturnType<typeof setTimeout> | null = null;
  
  return {
    showAuthToast: (toastFn: Function, message: string) => {
      if (!toastShown) {
        toastShown = true;
        toastFn(message);
        
        // Reset the flag after some time
        if (toastResetTimer) clearTimeout(toastResetTimer);
        toastResetTimer = setTimeout(() => {
          toastShown = false;
        }, 5000);
      }
    },
    reset: () => {
      toastShown = false;
      if (toastResetTimer) clearTimeout(toastResetTimer);
    }
  };
};
