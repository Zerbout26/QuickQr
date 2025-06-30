import { useEffect } from 'react';

interface PerformanceMetrics {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metrics: PerformanceMetrics = {};
        
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            metrics.LCP = entry.startTime;
            break;
          case 'first-input':
            metrics.FID = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            metrics.CLS = (entry as any).value;
            break;
          case 'first-contentful-paint':
            metrics.FCP = entry.startTime;
            break;
        }

        // Send to analytics if you have Google Analytics
        if (metrics.LCP || metrics.FID || metrics.CLS || metrics.FCP) {
          console.log('Core Web Vitals:', metrics);
          // You can send this to Google Analytics or your analytics service
          // gtag('event', 'core_web_vitals', metrics);
        }
      }
    });

    // Observe different performance metrics
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'first-contentful-paint'] });

    // Monitor Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
      console.log('TTFB:', TTFB);
      // gtag('event', 'core_web_vitals', { TTFB });
    }

    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}; 