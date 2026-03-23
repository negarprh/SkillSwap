# SkillSwap Backend - Aoof's implementation

This is an example backend implementation, Negar most likely has a different tech stack for it, but this is my attempt based on what the front-end expects from the backend.

## Features

- User authentication and registration
- Job posting and management
- Proposal system for freelancers
- Review system
- Platform statistics

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update the values:
     ```
     JWT_SECRET=your_secret_key_here
     PORT=3000
     ```

4. Run the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

See `BACKEND.md` in the root directory for complete API documentation.

## Database

The application uses SQLite database (`skillswap.db`) which is created automatically when the server starts.

## Technologies Used

- **Express.js**: Web framework
- **SQLite3**: Database
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing