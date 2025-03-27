# Mkura - Modern Voting System

Mkura is a modern, engaging voting system built with the MERN stack (MongoDB, Express.js, React.js, and Node.js). It provides a secure and user-friendly platform for conducting elections and polls.

## Features

- User authentication and authorization
- Real-time vote counting
- Interactive polls and surveys
- Mobile-responsive design
- Secure voting mechanism
- Admin dashboard for managing elections
- Results visualization with charts
- Email notifications

## Tech Stack

- Frontend: React.js, Material-UI, Chart.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

5. Access the application at `http://localhost:3000`

## Project Structure

```
mkura/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   ├── utils/
    │   └── App.js
    └── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Admin Credentials

To access the admin dashboard, use the following credentials:

```
Email:admin@mkura.com
Password: admin123456
```

Note: These are default credentials. Please change them after first login for security purposes.

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Polls
- GET /api/polls - Get all polls
- POST /api/polls - Create a new poll (admin only)
- GET /api/polls/:id - Get a specific poll
- PUT /api/polls/:id - Update a poll (admin only)
- DELETE /api/polls/:id - Delete a poll (admin only)
- POST /api/polls/:id/vote - Vote on a poll

### Payments
- POST /api/payments/verify - Verify IntaSend payment
- GET /api/payments/status - Check payment status 