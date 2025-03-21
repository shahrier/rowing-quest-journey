import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rowing Quest Journey</h1>
        <div>
          {user ? (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main>
        {user ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Welcome, {user.email}</h2>
            <p className="mb-4">
              Track your rowing journey and compete with other teams as you virtually
              cross the Atlantic Ocean from Boston to Amsterdam.
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold mb-2">Your Progress</h3>
              <p>Coming soon: Team progress tracking and statistics</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Log Activity</h3>
              <p>Coming soon: Activity logging form</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Track Your Rowing Journey</h2>
            <p className="text-xl mb-8">
              Join teams, log your rowing activities, and compete in a virtual
              journey across the Atlantic Ocean.
            </p>
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600"
            >
              Get Started
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}