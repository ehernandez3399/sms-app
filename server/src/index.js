// server/src/index.js
require('dotenv').config();
const express       = require('express');
const connectDB     = require('./config/db');
const { agenda }    = require('./services/scheduler');
const cors          = require('cors');

const authMiddleware = require('./middleware/auth');
const authRoutes     = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const customerRoutes = require('./routes/customers');
const jobRoutes      = require('./routes/jobs');

async function start() {
  // Connect Mongo & start Agenda
  await connectDB();
  await agenda.start();

  const app = express();

  // CORS for your React dev server
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  }));

  app.use(express.json());

  // Auth
  app.use('/auth', authRoutes);

  // Business CRUD
  app.use('/businesses', authMiddleware, businessRoutes);

  // Customer endpoints
  app.use(
    '/businesses/:businessId/customers',
    authMiddleware,
    customerRoutes
  );
  app.use(
    '/customers',
    authMiddleware,
    customerRoutes
  );

  // Job endpoints
  app.use(
    '/businesses/:businessId/jobs',
    authMiddleware,
    jobRoutes
  );
  app.use(
    '/customers/:customerId/jobs',
    authMiddleware,
    jobRoutes
  );
  // Global jobs list (for Dashboard stats)
  app.use(
    '/jobs',
    authMiddleware,
    jobRoutes
  );

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => console.error(err));
