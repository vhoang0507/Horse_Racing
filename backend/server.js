// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const connectDB = require('./config/db');

// // Connect to DB
// connectDB();

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
// });

// // Middleware
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// app.use(express.json());

// // Attach io to requests so controllers can emit events
// app.use((req, res, next) => { req.io = io; next(); });

// // Routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/horses', require('./routes/horseRoutes'));
// app.use('/api/tournaments', require('./routes/tournamentRoutes'));
// app.use('/api/races', require('./routes/raceRoutes'));
// app.use('/api/results', require('./routes/resultRoutes'));
// app.use('/api/bets', require('./routes/betRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/invitations', require('./routes/invitationRoutes'));

// app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ success: false, message: 'Internal Server Error' });
// });

// // Socket.io
// io.on('connection', (socket) => {
//   console.log(`🔌 Client connected: ${socket.id}`);
//   socket.on('join_race', (raceId) => socket.join(`race_${raceId}`));
//   socket.on('leave_race', (raceId) => socket.leave(`race_${raceId}`));
//   socket.on('disconnect', () => console.log(`❌ Client disconnected: ${socket.id}`));
// });

// const PORT = process.env.PORT || 5000;
// if (process.env.NODE_ENV !== 'production') {
//   server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// }

// module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Attach io to requests so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/horses', require('./routes/horseRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/races', require('./routes/raceRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/bets', require('./routes/betRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join_race', (raceId) => {
    socket.join(`race_${raceId}`);
  });

  socket.on('leave_race', (raceId) => {
    socket.leave(`race_${raceId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;