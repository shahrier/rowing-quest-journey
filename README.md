# Rowing Quest Journey

A virtual rowing journey application that tracks team progress across a virtual Atlantic crossing.

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
2. Run the SQL setup script located in `src/scripts/setupDatabase.sql` in the Supabase SQL editor
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

## Debugging

The application includes comprehensive debugging tools:

1. In development mode, a debug panel is available by clicking the debug icon in the bottom right corner
2. You can also enable debug mode in production by adding `?debug=true` to the URL
3. The debug panel provides:
   - Database connection status and diagnostics
   - System information
   - Network status
   - JavaScript error tracking

## Project Structure

- `/src/components` - UI components
- `/src/contexts` - React context providers
- `/src/lib` - Core utilities and libraries
- `/src/integrations` - External service integrations
- `/src/utils` - Helper functions and utilities
- `/src/scripts` - Setup and maintenance scripts

## Troubleshooting

If you encounter database connection issues:

1. Verify your environment variables are correctly set
2. Check the Supabase project status in your dashboard
3. Use the debug panel to run diagnostics
4. Check the browser console for detailed error messages

## License

MIT