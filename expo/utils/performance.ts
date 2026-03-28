// Advanced performance monitoring and optimization utilities

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  operationCount: number;
  errorCount: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private renderTimes: number[] = [];
  private maxSamples = 100;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(operation: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || {
      renderTime: 0,
      memoryUsage: 0,
      operationCount: 0,
      errorCount: 0,
    };

    this.metrics.set(operation, {
      ...existing,
      renderTime: (existing.renderTime + duration) / 2, // Moving average
      operationCount: existing.operationCount + 1,
    });

    this.renderTimes.push(duration);
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
  }

  recordError(operation: string): void {
    const existing = this.metrics.get(operation) || {
      renderTime: 0,
      memoryUsage: 0,
      operationCount: 0,
      errorCount: 0,
    };

    this.metrics.set(operation, {
      ...existing,
      errorCount: existing.errorCount + 1,
    });
  }

  getAverageRenderTime(): number {
    if (this.renderTimes.length === 0) return 0;
    return this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
  }

  getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.renderTimes = [];
  }

  isPerformanceGood(): boolean {
    const avgRenderTime = this.getAverageRenderTime();
    return avgRenderTime < 16; // 60fps threshold
  }
}

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory optimization utility
export const optimizeMemory = (): void => {
  if (global.gc) {
    global.gc();
  }
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  const startTiming = () => {
    return monitor.startTiming(componentName);
  };

  const recordError = () => {
    monitor.recordError(componentName);
  };

  return { startTiming, recordError };
};

// Batch operations for better performance
export const batchOperations = async <T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 10
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }
  
  return results;
};

// Memoization utility for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Clean cache if it gets too large
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
};

export default PerformanceMonitor;
