# Rowing Quest Journey

A virtual rowing challenge application that tracks team progress across a simulated Atlantic Ocean crossing. Teams log their rowing activities to collectively cover the distance from Boston to Amsterdam (5,556 km).

## About the Application

Rowing Quest Journey is a team-based fitness tracking application designed for rowing enthusiasts. The app allows:

- **Team-based Progress**: Users join teams to collectively row the distance from Boston to Amsterdam
- **Activity Tracking**: Log rowing sessions with distance and duration
- **Journey Visualization**: See your team's progress on a map with checkpoints
- **Achievement System**: Earn badges for reaching milestones
- **Team Competition**: Compare your team's progress against others
- **Media Sharing**: Share photos and videos of your rowing journey

## Technical Features

- React + Vite frontend with TypeScript
- Supabase backend for authentication and data storage
- Tailwind CSS and shadcn/ui for styling
- Comprehensive error tracking and diagnostics
- Role-based access control (admin, team manager, user)
- Real-time updates for team progress

## Database Schema

The application uses the following data model:

- **Teams**: Groups of users working together to complete the journey
- **Profiles**: User information including role and team membership
- **Activities**: Individual rowing sessions with distance and duration
- **Badges**: Achievements that can be earned by users
- **Journey Checkpoints**: Notable locations along the virtual route
- **Media**: Photos and videos shared by team members

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Supabase account

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL setup script located in `database/setup.sql` in the Supabase SQL editor
3. Set up the admin user by running:

```bash
# Set environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
export ADMIN_EMAIL=your_admin_email

# Run the setup script
npx tsx src/scripts/setupAdmin.ts
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Debugging and Diagnostics

The application includes comprehensive debugging tools:

### Debug Panel

Access the debug panel by:
- In development mode: Click the debug icon in the bottom right corner
- In production: Add `?debug=true` to the URL

### Diagnostic Features

- **Database Diagnostics**: Connection status, table verification, function checks
- **System Information**: Browser details, memory usage, screen dimensions
- **Network Status**: Connection type, online status
- **Error Tracking**: JavaScript errors with stack traces and context
- **Performance Metrics**: Load times and rendering performance

### Troubleshooting Common Issues

#### Database Connection Problems

1. Verify your environment variables are correctly set
2. Check the Supabase project status in your dashboard
3. Use the debug panel to run database diagnostics
4. Check browser console for detailed error messages

#### Authentication Issues

1. Ensure the user exists in Supabase authentication
2. Verify the user has a corresponding entry in the profiles table
3. Check role assignments for proper permissions

## Project Structure

```
rowing-quest-journey/
├── database/           # Database setup scripts
├── public/             # Static assets
├── src/
│   ├── components/     # UI components
│   ├── contexts/       # React context providers
│   ├── integrations/   # External service integrations
│   ├── lib/            # Core utilities and libraries
│   ├── providers/      # Provider components
│   ├── scripts/        # Setup and maintenance scripts
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions and utilities
├── .env                # Environment variables (not in repo)
└── README.md           # Project documentation
```

## License

MIT