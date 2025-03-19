import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle, HelpCircle, RefreshCw, Lock } from "lucide-react";

const TroubleshootingPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Troubleshooting Guide</h1>
        <p className="text-muted-foreground">
          If you're experiencing issues with the RowQuest app, here are some common problems and solutions
        </p>
      </div>

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
                  <li>If you continue to have issues, try using a different browser or clearing your cache</li>
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