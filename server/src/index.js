require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { agenda } = require('./services/scheduler');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const customerRoutes = require('./routes/customers');
const jobRoutes = require('./routes/jobs');

async function start() {
  await connectDB();
  await agenda.start();

  // ✅ Schedule the one-time job sweeper if not already scheduled
  await agenda.start();
  await agenda.every('1 minute', 'process one-time jobs');
  await agenda.now('process one-time jobs'); // 👈 add this

  const app = express();
  app.use(cors());  
  app.use(express.json());

  // ✅ Register all API routes
  app.use('/auth', authRoutes);
  app.use('/businesses', authMiddleware, businessRoutes);
  app.use(
   '/businesses/:businessId/customers',
  authMiddleware,
  require('./routes/customers')
);
  app.use('/customers', customerRoutes);
  app.use('/jobs', jobRoutes);

  // Optional ping route
  app.get('/ping', (req, res) => res.send('pong'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => console.error('Failed to start server:', err));
