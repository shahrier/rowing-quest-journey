export function monitorPerformance() {
  if (typeof window === 'undefined') return;

  const metrics = {
    memory: performance.memory,
    navigation: performance.navigation,
    timing: {
      loadTime: performance.now(),
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
    }
  };

  console.log('Performance metrics:', metrics);
  return metrics;
} 