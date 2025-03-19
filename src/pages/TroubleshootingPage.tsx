import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, HelpCircle, RefreshCw, Lock, Bug, Cpu, Database, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runDiagnostics } from "@/lib/diagnostics";

const TroubleshootingPage = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean | null>(null);
  const [networkStatus, setNetworkStatus] = useState<boolean>(navigator.onLine);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    // Increment render count to track component re-renders
    setRenderCount(prev => prev + 1);
    
    // Check localStorage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setLocalStorageAvailable(true);
    } catch (e) {
      setLocalStorageAvailable(false);
    }
    
    // Listen for network status changes
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      // Run diagnostics
      const results = runDiagnostics();
      setDiagnosticResults(results);
      
      // Additional tests can be added here
    } catch (error) {
      console.error("Error running diagnostics:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const clearAppData = () => {
    if (confirm("This will clear all application data and reset the app. Continue?")) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear any IndexedDB databases
        window.indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          });
        }).catch(err => console.error("Error clearing IndexedDB:", err));
        
        // Clear cookies (this is a simple approach, might not clear all cookies)
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        });
        
        alert("Application data cleared. The page will now reload.");
        window.location.reload();
      } catch (e) {
        console.error("Error clearing app data:", e);
        alert("Failed to clear some application data. See console for details.");
      }
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Troubleshooting & Diagnostics</h1>
        <p className="text-muted-foreground">
          Tools to help identify and resolve issues with the RowQuest app
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-500" />
            System Diagnostics
          </CardTitle>
          <CardDescription>
            Check your system and application status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className={`h-5 w-5 ${networkStatus ? 'text-green-500' : 'text-red-500'}`} />
                  <h3 className="font-medium">Network Status</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {networkStatus ? 'Connected' : 'Offline'}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className={`h-5 w-5 ${localStorageAvailable ? 'text-green-500' : 'text-red-500'}`} />
                  <h3 className="font-medium">Local Storage</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {localStorageAvailable === null ? 'Checking...' : 
                   localStorageAvailable ? 'Available' : 'Not Available'}
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Render Count</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  This component has rendered {renderCount} times
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={runTests} 
                disabled={isRunningTests}
                className="flex items-center gap-2"
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4" />
                    Run Diagnostics
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearAppData}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Clear App Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
            
            {diagnosticResults && (
              <div className="mt-4 border rounded-lg p-4 bg-muted/30">
                <h3 className="font-medium mb-2">Diagnostic Results</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">DOM Status:</span>{" "}
                    <span className={
                      diagnosticResults.domStatus.status === "ok" ? "text-green-500" : 
                      diagnosticResults.domStatus.status === "warning" ? "text-yellow-500" : 
                      "text-red-500"
                    }>
                      {diagnosticResults.domStatus.message}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Environment:</span>{" "}
                    <span className={
                      diagnosticResults.envStatus.status === "ok" ? "text-green-500" : 
                      "text-yellow-500"
                    }>
                      {diagnosticResults.envStatus.message}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Browser Compatibility:</span>{" "}
                    <span className={
                      diagnosticResults.browserStatus.compatible ? "text-green-500" : 
                      "text-red-500"
                    }>
                      {diagnosticResults.browserStatus.message}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Viewport:</span>{" "}
                    <span className="text-muted-foreground">
                      {diagnosticResults.viewport}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Mode:</span>{" "}
                    <span className="text-muted-foreground">
                      {diagnosticResults.mode}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Common Issues
          </CardTitle>
          <CardDescription>
            Solutions for frequently encountered problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="signup-issues">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign-Up Issues
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p>If you encounter an error while signing up, please check the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ensure that your email is valid and not already in use</li>
                  <li>Check that your password meets the required criteria (at least 6 characters)</li>
                  <li>Verify that all required fields are filled out correctly</li>
                  <li>If creating a team, make sure you've provided a team name</li>
                  <li>Check your internet connection and try again</li>
                  <li>Try using a different browser or clearing your cache</li>
                </ul>
                <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded border border-amber-200 dark:border-amber-800 mt-2">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Note:</strong> After signing up, you'll need to verify your email address before you can log in. Check your inbox (and spam folder) for a verification email.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="login-problems">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Login Problems
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p>If you cannot log in, consider the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Make sure you are using the correct email and password</li>
                  <li>Check that you've verified your email address after signing up</li>
                  <li>Check your internet connection</li>
                  <li>If you forgot your password, use the password reset link</li>
                  <li>Try clearing your browser cookies and cache</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="blank-screen">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Blank Screen / App Not Loading
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p>If you're seeing a blank screen or the app isn't loading:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Try refreshing the page (press F5 or Ctrl+R)</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try using a different web browser</li>
                  <li>Check if you have JavaScript enabled in your browser</li>
                  <li>Disable any ad blockers or browser extensions that might interfere</li>
                  <li>Try accessing the app in incognito/private browsing mode</li>
                </ul>
                <div className="mt-3">
                  <Button 
                    onClick={() => window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'debug=true'}
                    variant="outline"
                    size="sm"
                  >
                    Launch Debug Mode
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="performance-issues">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Performance Issues
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p>If the app is running slowly, try the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Clear your browser cache and cookies</li>
                  <li>Ensure that your device meets the app's requirements</li>
                  <li>Close any unnecessary tabs or applications that may be using resources</li>
                  <li>Try using a different browser</li>
                  <li>Check your internet connection speed</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-issues">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Data Not Saving or Loading
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <p>If your activities or data aren't saving or loading correctly:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check your internet connection</li>
                  <li>Try refreshing the page</li>
                  <li>Make sure you're logged in with the correct account</li>
                  <li>Clear your browser cache and try again</li>
                  <li>If the problem persists, contact support with details about what data isn't saving</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            If you still need help, please contact our support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Our support team is available to help you with any issues you may encounter:</p>
          <div className="space-y-2">
            <p><strong>Email:</strong> support@rowingquest.com</p>
            <p><strong>Hours:</strong> Monday-Friday, 9am-5pm EST</p>
          </div>
          <div className="mt-6">
            <Link 
              to='/' 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TroubleshootingPage;