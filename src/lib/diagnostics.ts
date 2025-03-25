// Diagnostics utility for troubleshooting

let diagnosticsInitialized = false;

export function initDiagnostics() {
  if (diagnosticsInitialized) return;
  
  console.log("Initializing diagnostics tools");
  
  // Add any initialization code here
  
  diagnosticsInitialized = true;
}

export function runDiagnostics() {
  console.log("Running diagnostics...");
  
  // Check DOM status
  const domStatus = checkDOMStatus();
  
  // Check environment variables
  const envStatus = checkEnvironmentVariables();
  
  // Check browser compatibility
  const browserStatus = checkBrowserCompatibility();
  
  // Get viewport size
  const viewport = `${window.innerWidth}x${window.innerHeight}`;
  
  // Get app mode
  const mode = import.meta.env.MODE || "unknown";
  
  return {
    timestamp: new Date().toISOString(),
    domStatus,
    envStatus,
    browserStatus,
    viewport,
    mode
  };
}

function checkDOMStatus() {
  try {
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      return {
        status: "error",
        message: "Root element not found"
      };
    }
    
    const childCount = rootElement.childElementCount;
    
    if (childCount === 0) {
      return {
        status: "warning",
        message: "Root element has no children"
      };
    }
    
    return {
      status: "ok",
      message: `DOM structure looks good (${childCount} root children)`
    };
  } catch (e) {
    return {
      status: "error",
      message: `Error checking DOM: ${e}`
    };
  }
}

function checkEnvironmentVariables() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      status: "warning",
      message: "Missing Supabase environment variables"
    };
  }
  
  return {
    status: "ok",
    message: "Environment variables present"
  };
}

function checkBrowserCompatibility() {
  // Check for essential browser features
  const features = {
    localStorage: typeof localStorage !== "undefined",
    fetch: typeof fetch !== "undefined",
    promise: typeof Promise !== "undefined",
    async: (function() { try { eval("async () => {}"); return true; } catch (e) { return false; } })()
  };
  
  const compatible = Object.values(features).every(Boolean);
  
  return {
    compatible,
    features,
    message: compatible ? "Browser is compatible" : "Browser may not be fully compatible"
  };
}