/**
 * Utility functions for application diagnostics and troubleshooting
 */
import { supabase } from './supabase';

// Check if the DOM is properly initialized
export function checkDOMStatus() {
  console.log("🔍 Checking DOM status");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("❌ Root element not found in DOM");
    return {
      rootFound: false,
      childCount: 0,
      status: "error",
      message: "Root element not found"
    };
  }
  
  const childCount = rootElement.childElementCount;
  const children = Array.from(rootElement.children).map(child => ({
    tagName: child.tagName,
    className: child.className,
    id: child.id,
    childCount: child.childElementCount
  }));
  
  console.log("📊 Root element details:", {
    tagName: rootElement.tagName,
    className: rootElement.className,
    childCount,
    children
  });
  
  if (childCount === 0) {
    console.warn("⚠️ Root element has no children - React may not be mounting");
    return {
      rootFound: true,
      childCount: 0,
      status: "warning",
      message: "Root element has no children"
    };
  }
  
  return {
    rootFound: true,
    childCount,
    children,
    status: "ok",
    message: `Root element has ${childCount} children`
  };
}

// Check environment variables
export function checkEnvironmentVariables() {
  console.log("🔍 Checking environment variables");
  const requiredVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  
  const envVarStatus = {};
  requiredVars.forEach(varName => {
    envVarStatus[varName] = !!import.meta.env[varName];
  });
  
  console.log("📊 Environment variables status:", envVarStatus);
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(", ")}`);
    return {
      status: "warning",
      missingVars,
      envVarStatus,
      message: `Missing ${missingVars.length} required environment variables`
    };
  }
  
  return {
    status: "ok",
    missingVars: [],
    envVarStatus,
    message: "All required environment variables are present"
  };
}

// Check browser compatibility
export function checkBrowserCompatibility() {
  console.log("🔍 Checking browser compatibility");
  const features = {
    localStorage: typeof localStorage !== "undefined",
    sessionStorage: typeof sessionStorage !== "undefined",
    fetch: typeof fetch !== "undefined",
    promise: typeof Promise !== "undefined",
    async: typeof async function() {} !== "undefined",
    webCrypto: typeof window.crypto !== "undefined",
    indexedDB: typeof indexedDB !== "undefined",
    serviceWorker: 'serviceWorker' in navigator,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })(),
    webP: (() => {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    })()
  };
  
  console.log("📊 Browser features:", features);
  
  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([name]) => name);
  
  if (missingFeatures.length > 0) {
    console.warn(`⚠️ Browser missing required features: ${missingFeatures.join(", ")}`);
    return {
      compatible: false,
      missingFeatures,
      features,
      message: `Browser is missing ${missingFeatures.length} required features`
    };
  }
  
  return {
    compatible: true,
    missingFeatures: [],
    features,
    message: "Browser is compatible with all required features"
  };
}

// Check for CSS issues
export function checkCSSIssues() {
  console.log("🔍 Checking for CSS issues");
  
  try {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const bodyStyles = window.getComputedStyle(document.body);
    const rootElement = document.getElementById('root');
    const rootStyles2 = rootElement ? window.getComputedStyle(rootElement) : null;
    
    const cssIssues = [];
    
    // Check for visibility issues
    if (bodyStyles.display === 'none') cssIssues.push('Body display is none');
    if (bodyStyles.visibility === 'hidden') cssIssues.push('Body visibility is hidden');
    if (bodyStyles.opacity === '0') cssIssues.push('Body opacity is 0');
    
    if (rootElement) {
      if (rootStyles2.display === 'none') cssIssues.push('Root element display is none');
      if (rootStyles2.visibility === 'hidden') cssIssues.push('Root element visibility is hidden');
      if (rootStyles2.opacity === '0') cssIssues.push('Root element opacity is 0');
      if (rootStyles2.height === '0px') cssIssues.push('Root element height is 0');
    }
    
    // Check for CSS variables
    const missingCSSVars = [];
    const requiredVars = [
      '--background', '--foreground', '--primary', '--primary-foreground'
    ];
    
    for (const varName of requiredVars) {
      const value = rootStyles.getPropertyValue(varName).trim();
      if (!value) missingCSSVars.push(varName);
    }
    
    if (missingCSSVars.length > 0) {
      cssIssues.push(`Missing CSS variables: ${missingCSSVars.join(', ')}`);
    }
    
    const cssDetails = {
      bodyDisplay: bodyStyles.display,
      bodyVisibility: bodyStyles.visibility,
      bodyOpacity: bodyStyles.opacity,
      bodyHeight: bodyStyles.height,
      bodyWidth: bodyStyles.width,
      bodyBackground: bodyStyles.backgroundColor,
      bodyColor: bodyStyles.color,
      rootDisplay: rootStyles2?.display,
      rootVisibility: rootStyles2?.visibility,
      rootOpacity: rootStyles2?.opacity,
      rootHeight: rootStyles2?.height,
      rootWidth: rootStyles2?.width,
      rootPosition: rootStyles2?.position,
      rootZIndex: rootStyles2?.zIndex,
      rootOverflow: rootStyles2?.overflow,
    };
    
    console.log("📊 CSS properties:", cssDetails);
    
    if (cssIssues.length > 0) {
      console.warn("⚠️ CSS issues detected:", cssIssues);
      return {
        status: "warning",
        issues: cssIssues,
        details: cssDetails,
        message: `${cssIssues.length} CSS issues detected`
      };
    }
    
    return {
      status: "ok",
      issues: [],
      details: cssDetails,
      message: "No CSS issues detected"
    };
  } catch (error) {
    console.error("❌ Error checking CSS:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
      message: "Error checking CSS"
    };
  }
}

// Check database connection
export async function checkDatabaseConnection() {
  console.log("🔍 Checking database connection");
  
  try {
    const result = await verifySupabaseConnection();
    
    return {
      status: result.connected ? "ok" : "error",
      connected: result.connected,
      details: result,
      message: result.connected 
        ? `Connected to database (${result.duration.toFixed(2)}ms)` 
        : `Failed to connect to database: ${result.error}`
    };
  } catch (error) {
    console.error("❌ Error checking database connection:", error);
    return {
      status: "error",
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      message: "Error checking database connection"
    };
  }
}

// Check for JavaScript errors
export function checkJavaScriptErrors() {
  console.log("🔍 Checking for JavaScript errors");
  
  // @ts-ignore - Access error count from window
  const errorCount = window.__diagnostics_error_count || 0;
  
  return {
    status: errorCount > 0 ? "warning" : "ok",
    errorCount,
    message: errorCount > 0 
      ? `${errorCount} JavaScript errors detected` 
      : "No JavaScript errors detected"
  };
}

// Check React rendering
export function checkReactRendering() {
  console.log("🔍 Checking React rendering");
  
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      return {
        status: "error",
        rendered: false,
        message: "Root element not found"
      };
    }
    
    // Look for React-specific attributes
    const reactAttributes = ['data-reactroot', 'data-reactid', '_reactListening'];
    const hasReactAttributes = Array.from(rootElement.children).some(child => {
      return reactAttributes.some(attr => 
        child.hasAttribute(attr) || child.hasAttribute(`data-${attr}`)
      );
    });
    
    // Check for React DevTools
    // @ts-ignore
    const hasReactDevTools = typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined";
    
    // Check for React component structure
    const possibleReactStructure = rootElement.innerHTML.includes('react') || 
                                  rootElement.innerHTML.includes('_reactListening');
    
    const result = {
      status: hasReactAttributes || possibleReactStructure ? "ok" : "warning",
      rendered: hasReactAttributes || possibleReactStructure,
      hasReactDevTools,
      possibleReactStructure,
      childCount: rootElement.childElementCount,
      message: hasReactAttributes 
        ? "React appears to be rendering correctly" 
        : "No clear evidence of React rendering"
    };
    
    console.log("📊 React rendering check:", result);
    return result;
  } catch (error) {
    console.error("❌ Error checking React rendering:", error);
    return {
      status: "error",
      rendered: false,
      error: error instanceof Error ? error.message : String(error),
      message: "Error checking React rendering"
    };
  }
}

// Run all diagnostics
export async function runDiagnostics() {
  console.group("🔍 Running Application Diagnostics");
  
  try {
    console.log("⏳ Starting diagnostics at", new Date().toISOString());
    
    const domStatus = checkDOMStatus();
    console.log("📊 DOM Status:", domStatus);
    
    const envStatus = checkEnvironmentVariables();
    console.log("📊 Environment Variables:", envStatus);
    
    const browserStatus = checkBrowserCompatibility();
    console.log("📊 Browser Compatibility:", browserStatus);
    
    const cssStatus = checkCSSIssues();
    console.log("📊 CSS Status:", cssStatus);
    
    const reactStatus = checkReactRendering();
    console.log("📊 React Rendering:", reactStatus);
    
    const jsErrorStatus = checkJavaScriptErrors();
    console.log("📊 JavaScript Errors:", jsErrorStatus);
    
    console.log("⏳ Running database connection check...");
    const dbStatus = await checkDatabaseConnection();
    console.log("📊 Database Connection:", dbStatus);
    
    const results = {
      domStatus,
      envStatus,
      browserStatus,
      cssStatus,
      reactStatus,
      jsErrorStatus,
      dbStatus,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      mode: import.meta.env.MODE,
      url: window.location.href,
      performance: {
        memory: performance.memory ? {
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory.usedJSHeapSize
        } : 'Not available',
        navigation: {
          type: performance.navigation.type,
          redirectCount: performance.navigation.redirectCount
        },
        timing: {
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 'Not available'
        }
      }
    };
    
    console.log("✅ Diagnostics completed successfully");
    console.log("📊 Full diagnostics results:", results);
    
    return results;
  } catch (error) {
    console.error("❌ Error running diagnostics:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
  } finally {
    console.groupEnd();
  }
}

// Track JavaScript errors
export function trackJavaScriptErrors() {
  // @ts-ignore - Add error count to window
  window.__diagnostics_error_count = 0;
  // @ts-ignore - Add error log to window
  window.__diagnostics_errors = [];
  
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // @ts-ignore
    window.__diagnostics_error_count++;
    // @ts-ignore
    window.__diagnostics_errors.push({
      timestamp: new Date().toISOString(),
      message: args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')
    });
    originalConsoleError(...args);
  };
  
  window.addEventListener('error', (event) => {
    // @ts-ignore
    window.__diagnostics_error_count++;
    // @ts-ignore
    window.__diagnostics_errors.push({
      timestamp: new Date().toISOString(),
      type: 'uncaught',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // @ts-ignore
    window.__diagnostics_error_count++;
    // @ts-ignore
    window.__diagnostics_errors.push({
      timestamp: new Date().toISOString(),
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason)
    });
  });
}

// Initialize diagnostics
export function initDiagnostics() {
  console.log("🛠️ Initializing diagnostics tools");
  
  // Track JavaScript errors
  trackJavaScriptErrors();
  
  // Run diagnostics on load
  window.addEventListener("load", () => {
    console.log("🔍 Scheduling post-load diagnostics");
    setTimeout(async () => {
      console.log("🔍 Running post-load diagnostics");
      const results = await runDiagnostics();
      
      // Log critical issues
      const criticalIssues = [];
      if (results.domStatus.status === "error") criticalIssues.push("DOM issues");
      if (results.envStatus.status === "warning") criticalIssues.push("Environment variable issues");
      if (results.dbStatus.status === "error") criticalIssues.push("Database connection issues");
      if (results.reactStatus.status === "warning") criticalIssues.push("React rendering issues");
      
      if (criticalIssues.length > 0) {
        console.warn("⚠️ Critical issues detected:", criticalIssues);
      }
    }, 1000);
  });
  
  // Add diagnostics to window for console access
  // @ts-ignore
  window.__diagnostics = {
    run: runDiagnostics,
    checkDOM: checkDOMStatus,
    checkEnv: checkEnvironmentVariables,
    checkBrowser: checkBrowserCompatibility,
    checkCSS: checkCSSIssues,
    checkDB: checkDatabaseConnection,
    checkReact: checkReactRendering,
    checkJS: checkJavaScriptErrors,
    // @ts-ignore
    getErrors: () => window.__diagnostics_errors || []
  };
  
  console.log("✅ Diagnostics initialized. Access via window.__diagnostics in console.");
}

export async function logDiagnostics() {
  return {
    react: checkReactRendering(),
    database: await checkDatabaseStatus(),
  };
}

async function checkDatabaseStatus() {
  try {
    // Try a simple query to verify connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    return {
      status: error ? 'error' : 'connected',
      error: error ? error.message : null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString(),
    };
  }
}

async function verifySupabaseConnection() {
  try {
    const { data, error } = await supabase.rpc('rpc_function_name'); // Example of a function call without a specific table
    return {
      connected: !error,
      data,
      error,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}