/**
 * System diagnostics utility for monitoring app health
 */

export async function logDiagnostics() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
      memory: getMemoryInfo(),
      storage: await getStorageInfo(),
      performance: getPerformanceMetrics(),
    };
    
    return diagnostics;
  } catch (error) {
    console.error("Error collecting diagnostics:", error);
    return { error: "Failed to collect diagnostics" };
  }
}

function getMemoryInfo() {
  // @ts-ignore - performance.memory is non-standard but available in Chrome
  if (performance && performance.memory) {
    return {
      // @ts-ignore
      jsHeapSizeLimit: formatBytes(performance.memory.jsHeapSizeLimit),
      // @ts-ignore
      totalJSHeapSize: formatBytes(performance.memory.totalJSHeapSize),
      // @ts-ignore
      usedJSHeapSize: formatBytes(performance.memory.usedJSHeapSize),
    };
  }
  return "Not available";
}

async function getStorageInfo() {
  try {
    // Check localStorage
    let localStorageUsed = 0;
    let localStorageAvailable = true;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || "";
        localStorageUsed += (localStorage.getItem(key) || "").length;
      }
    } catch (e) {
      localStorageAvailable = false;
    }
    
    // Check if navigator.storage is available (modern browsers)
    let quota = "Not available";
    let usage = "Not available";
    
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      quota = formatBytes(estimate.quota || 0);
      usage = formatBytes(estimate.usage || 0);
    }
    
    return {
      localStorage: {
        available: localStorageAvailable,
        used: formatBytes(localStorageUsed * 2), // Multiply by 2 for UTF-16 encoding
      },
      storageQuota: quota,
      storageUsage: usage,
    };
  } catch (e) {
    return "Error getting storage info";
  }
}

function getPerformanceMetrics() {
  if (!performance) return "Not available";
  
  try {
    const navigationTiming = performance.getEntriesByType("navigation")[0];
    
    if (!navigationTiming) return "Navigation timing not available";
    
    // @ts-ignore
    const loadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
    // @ts-ignore
    const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime;
    
    return {
      loadTime: `${Math.round(loadTime)}ms`,
      domContentLoaded: `${Math.round(domContentLoaded)}ms`,
    };
  } catch (e) {
    return "Error getting performance metrics";
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}