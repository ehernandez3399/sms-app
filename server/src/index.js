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

  // ✅ Start Agenda and schedule the one‐time sweeper
  await agenda.start();
  await agenda.every('1 minute', 'process one-time jobs');
  await agenda.now('process one-time jobs');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // 🔥 Mount your routes in the correct order
  app.use('/auth', authRoutes);
  app.use('/businesses', authMiddleware, businessRoutes);
  app.use('/businesses/:businessId/customers', authMiddleware, customerRoutes);
  app.use('/customers/:customerId/jobs', authMiddleware, jobRoutes);

  // Optional health check
  app.get('/ping', (req, res) => res.send('pong'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => console.error('Failed to start server:', err));
