import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Only run in production and if PerformanceObserver is supported
    if (process.env.NODE_ENV !== 'production' || !('PerformanceObserver' in window)) {
      return;
    }

    const metrics: Partial<PerformanceMetrics> = {};

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
        console.log('FCP:', fcpEntry.startTime);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metrics.lcp = lastEntry.startTime;
        console.log('LCP:', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const firstInputEntry = entry as PerformanceEventTiming;
        if (firstInputEntry.processingStart) {
          metrics.fid = firstInputEntry.processingStart - firstInputEntry.startTime;
          console.log('FID:', metrics.fid);
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      metrics.cls = clsValue;
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      console.log('TTFB:', metrics.ttfb);
    }

    // Send metrics to analytics after page load
    const sendMetrics = () => {
      if (Object.keys(metrics).length > 0) {
        // Send to your analytics service
        console.log('Performance Metrics:', metrics);
        
        // Example: Send to Google Analytics
        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'performance', {
            event_category: 'Web Vitals',
            event_label: 'Core Web Vitals',
            value: Math.round(metrics.lcp || 0),
            custom_parameters: {
              fcp: Math.round(metrics.fcp || 0),
              lcp: Math.round(metrics.lcp || 0),
              fid: Math.round(metrics.fid || 0),
              cls: Math.round((metrics.cls || 0) * 1000) / 1000,
              ttfb: Math.round(metrics.ttfb || 0),
            }
          });
        }
      }
    };

    // Send metrics when page is hidden (user navigates away)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendMetrics();
      }
    });

    // Send metrics after 5 seconds as fallback
    setTimeout(sendMetrics, 5000);

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}; 