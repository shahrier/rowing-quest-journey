import React from 'react';
import { Link } from 'react-router-dom';

const TroubleshootingPage = () => {
  return (
    <div>
      <h1>Troubleshooting Guide</h1>
      <p>If you're experiencing issues with the RowQuest app, here are some common problems and solutions:</p>
      <h2>1. Sign-Up Issues</h2>
      <p>If you encounter an error while signing up, please check the following:</p>
      <ul>
        <li>Ensure that your email is valid and not already in use.</li>
        <li>Check that your password meets the required criteria.</li>
        <li>Verify that all required fields are filled out correctly.</li>
      </ul>

      <h2>2. Login Problems</h2>
      <p>If you cannot log in, consider the following:</p>
      <ul>
        <li>Make sure you are using the correct email and password.</li>
        <li>Check your internet connection.</li>
        <li>If you forgot your password, use the password reset link.</li>
      </ul>

      <h2>3. Performance Issues</h2>
      <p>If the app is running slowly, try the following:</p>
      <ul>
        <li>Clear your browser cache and cookies.</li>
        <li>Ensure that your device meets the app's requirements.</li>
        <li>Close any unnecessary tabs or applications that may be using resources.</li>
      </ul>

      <h2>4. Contact Support</h2>
      <p>If you still need help, please contact our support team:</p>
      <p>Email: support@rowingquest.com</p>
      <Link to='/'>Go back to Home</Link>
    </div>
  );
};

export default TroubleshootingPage;
