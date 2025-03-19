/**
 * Utility functions for application diagnostics and troubleshooting
 */

// Check if the DOM is properly initialized
export function checkDOMStatus() {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Root element not found in DOM");
    return {
      rootFound: false,
      childCount: 0,
      status: "error",
      message: "Root element not found"
    };
  }
  
  const childCount = rootElement.childElementCount;
  
  if (childCount === 0) {
    console.warn("Root element has no children - React may not be mounting");
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
    status: "ok",
    message: `Root element has ${childCount} children`
  };
}

// Check environment variables
export function checkEnvironmentVariables() {
  const requiredVars = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.warn(`Missing environment variables: ${missingVars.join(", ")}`);
    return {
      status: "warning",
      missingVars,
      message: `Missing ${missingVars.length} required environment variables`
    };
  }
  
  return {
    status: "ok",
    missingVars: [],
    message: "All required environment variables are present"
  };
}

// Check browser compatibility
export function checkBrowserCompatibility() {
  const features = {
    localStorage: typeof localStorage !== "undefined",
    sessionStorage: typeof sessionStorage !== "undefined",
    fetch: typeof fetch !== "undefined",
    promise: typeof Promise !== "undefined",
    async: typeof async function() {} !== "undefined",
    webCrypto: typeof window.crypto !== "undefined",
  };
  
  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([name]) => name);
  
  if (missingFeatures.length > 0) {
    console.warn(`Browser missing required features: ${missingFeatures.join(", ")}`);
    return {
      compatible: false,
      missingFeatures,
      message: `Browser is missing ${missingFeatures.length} required features`
    };
  }
  
  return {
    compatible: true,
    missingFeatures: [],
    message: "Browser is compatible with all required features"
  };
}

// Run all diagnostics
export function runDiagnostics() {
  console.group("Application Diagnostics");
  
  const domStatus = checkDOMStatus();
  console.log("DOM Status:", domStatus);
  
  const envStatus = checkEnvironmentVariables();
  console.log("Environment Variables:", envStatus);
  
  const browserStatus = checkBrowserCompatibility();
  console.log("Browser Compatibility:", browserStatus);
  
  console.groupEnd();
  
  return {
    domStatus,
    envStatus,
    browserStatus,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    mode: import.meta.env.MODE
  };
}

// Initialize diagnostics
export function initDiagnostics() {
  // Run diagnostics on load
  window.addEventListener("load", () => {
    setTimeout(() => {
      runDiagnostics();
    }, 1000);
  });
  
  // Add diagnostics to window for console access
  // @ts-ignore
  window.__diagnostics = {
    run: runDiagnostics,
    checkDOM: checkDOMStatus,
    checkEnv: checkEnvironmentVariables,
    checkBrowser:checkBrowserCompatibility
  };
  
  console.log("Diagnostics initialized. Access via window.__diagnostics in console.");
}