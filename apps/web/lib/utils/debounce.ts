/**
 * Debounce Utility Function
 *
 * WHAT: Delays function execution until after a wait period has elapsed
 * since the last time it was invoked.
 *
 * WHY use debouncing?
 * - Performance: Reduce number of expensive operations (API calls, DOM updates)
 * - UX: Wait for user to "finish" typing before searching
 * - Cost: Fewer API calls = lower server costs
 *
 * REAL-WORLD EXAMPLE:
 * User types "Miami"
 *
 * WITHOUT debounce:
 * M     → API call 1
 * Mi    → API call 2
 * Mia   → API call 3
 * Miam  → API call 4
 * Miami → API call 5
 * Total: 5 API calls in ~500ms
 *
 * WITH debounce (300ms delay):
 * M     → Start timer
 * Mi    → Reset timer
 * Mia   → Reset timer
 * Miam  → Reset timer
 * Miami → Reset timer → Wait 300ms → API call
 * Total: 1 API call
 *
 * ALTERNATIVE 1: Throttle
 * - Executes at most once per time period
 * - Example: Every 300ms, execute regardless of calls
 * - Use case: Scroll handlers, resize handlers
 * ❌ Not ideal for search (executes too often)
 *
 * ALTERNATIVE 2: No delay (immediate)
 * - Execute on every keystroke
 * ❌ API spam, slow UX, expensive
 *
 * ✅ We chose Debounce because:
 * - Perfect for user input (typing, search)
 * - Waits for user to "finish"
 * - Industry standard (Google, Amazon, etc.)
 *
 * PERFORMANCE IMPACT:
 * - Reduces API calls by ~80-95%
 * - Saves bandwidth and server costs
 * - Improves perceived performance (less loading states)
 *
 * PITFALLS:
 * - ⚠️ Must call .cancel() on unmount to prevent memory leaks
 * - ⚠️ Don't use too long delay (>500ms feels laggy)
 * - ⚠️ Don't use for critical real-time updates
 *
 * RESOURCES:
 * - https://css-tricks.com/debouncing-throttling-explained-examples/
 * - https://web.dev/debounce-javascript-execution/
 * - https://lodash.com/docs/#debounce (industry reference)
 */

type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

/**
 * Creates a debounced function that delays invoking func until after
 * wait milliseconds have elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300ms)
 * @returns Debounced function with cancel method
 *
 * @example
 * const searchAPI = async (query: string) => {
 *   const response = await fetch(`/api/search?q=${query}`)
 *   return response.json()
 * }
 *
 * const debouncedSearch = debounce(searchAPI, 300)
 *
 * // User types "Miami"
 * debouncedSearch('M')     // Starts timer
 * debouncedSearch('Mi')    // Resets timer
 * debouncedSearch('Mia')   // Resets timer
 * debouncedSearch('Miami') // Resets timer, waits 300ms, then executes
 *
 * // Cleanup (important!)
 * debouncedSearch.cancel()
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
): DebouncedFunction<T> {
  // Timeout ID to track the pending execution
  let timeoutId: NodeJS.Timeout | null = null;

  /**
   * The debounced function
   *
   * HOW IT WORKS:
   * 1. Clear any pending timeout (reset timer)
   * 2. Start new timeout
   * 3. After 'wait' ms, execute the original function
   */
  const debouncedFn = function (this: any, ...args: Parameters<T>) {
    // Clear previous timer if exists
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timer
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  } as DebouncedFunction<T>;

  /**
   * Cancel method to clear pending execution
   *
   * CRITICAL: Call this on component unmount to prevent:
   * 1. Memory leaks (timeouts still running)
   * 2. State updates on unmounted components
   * 3. Unexpected API calls
   */
  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

/**
 * ADVANCED: Debounce with leading edge execution
 *
 * Sometimes you want to execute IMMEDIATELY on first call,
 * then debounce subsequent calls.
 *
 * Example: Button click protection
 * - First click: Execute immediately
 * - Rapid clicks: Ignore until delay passes
 *
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @param options - { leading: true } for immediate first execution
 */
export function debounceLeading<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  options: { leading?: boolean } = {},
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastCallTime = 0;

  const debouncedFn = function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    // Leading edge: Execute immediately on first call
    if (options.leading && now - lastCallTime > wait) {
      func.apply(this, args);
      lastCallTime = now;
      return;
    }

    // Standard debounce behavior
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      lastCallTime = Date.now();
      timeoutId = null;
    }, wait);
  } as DebouncedFunction<T>;

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

/**
 * COMPARISON: Debounce vs Throttle
 *
 * DEBOUNCE:
 * - Waits for calm period
 * - Executes AFTER last call + delay
 * - Use for: Search, form validation, auto-save
 *
 * THROTTLE:
 * - Executes at regular intervals
 * - Executes DURING activity
 * - Use for: Scroll handlers, mouse move, window resize
 *
 * Example:
 * 10 rapid calls with 300ms delay
 *
 * Debounce: Executes 1 time (after last call + 300ms)
 * Throttle: Executes 3-4 times (every 300ms during calls)
 */
