import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

export default function Index() {
  console.log("🏠 Index page component rendering");
  const mountedRef = useRef(false);
  const [renderCount, setRenderCount] = useState(0);
  
  // Log when component mounts
  useEffect(() => {
    console.log("🔄 Index page mounted");
    mountedRef.current = true;
    
    // Log DOM structure for debugging
    const rootElement = document.getElementById("root");
    if (rootElement) {
      console.log("📊 Root element found with children:", rootElement.childElementCount);
      
      // Log the DOM tree structure (up to 3 levels deep)
      const logDOMTree = (element: Element, depth = 0, maxDepth = 3) => {
        if (depth > maxDepth) return;
        
        const children = Array.from(element.children);
        console.log(
          "  ".repeat(depth) + 
          `<${element.tagName.toLowerCase()}${element.id ? ` id="${element.id}"` : ''}${element.className ? ` class="${element.className}"` : ''}> ` +
          `(${children.length} children)`
        );
        
        children.forEach(child => logDOMTree(child, depth + 1, maxDepth));
      };
      
      console.group("📋 DOM Tree Structure");
      logDOMTree(rootElement);
      console.groupEnd();
    } else {
      console.warn("⚠️ Root element not found in DOM");
    }
    
    // Check CSS variables
    try {
      const rootStyles = getComputedStyle(document.documentElement);
      const cssVars = {
        background: rootStyles.getPropertyValue('--background'),
        foreground: rootStyles.getPropertyValue('--foreground'),
        primary: rootStyles.getPropertyValue('--primary'),
        radius: rootStyles.getPropertyValue('--radius'),
      };
      console.log("🎨 CSS Variables:", cssVars);
    } catch (e) {
      console.error("❌ Error checking CSS variables:", e);
    }
    
    return () => {
      console.log("🧹 Index page unmounting");
    };
  }, []);
  
  // Track render count
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);
  
  // Log render count
  useEffect(() => {
    console.log(`🔄 Index page render count: ${renderCount}`);
  }, [renderCount]);
  
  console.log("🖌️ Index page rendering UI");
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" data-testid="index-page">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto relative w-24 h-24">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 blur opacity-70"></div>
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-blue-700 text-white text-4xl font-bold">
            R
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">Welcome to RowQuest</h1>
          <p className="mt-2 text-muted-foreground">
            Track your rowing journey to your destination
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Render count: {renderCount}
          </p>
        </div>
        
        <div className="pt-4">
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Login / Register
          </Link>
        </div>
        
        <div className="pt-4 text-sm text-muted-foreground">
          <p>
            If you're experiencing issues, visit our{" "}
            <Link to="/troubleshooting" className="text-primary hover:underline">
              troubleshooting page
            </Link>
          </p>
        </div>
        
        <div className="pt-4 text-xs text-muted-foreground/70">
          <button 
            onClick={() => {
              console.log("🔍 Running diagnostics from Index page");
              // @ts-ignore
              if (window.__diagnostics?.run) {
                // @ts-ignore
                window.__diagnostics.run().then(results => {
                  console.log("📊 Diagnostics results:", results);
                });
              } else {
                console.warn("⚠️ Diagnostics not available");
              }
            }}
            className="text-primary hover:underline"
          >
            Run Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}