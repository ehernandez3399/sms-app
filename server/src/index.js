require('dotenv').config();
const express           = require('express');
const connectDB         = require('./config/db');
const { agenda }        = require('./services/scheduler');

const authMiddleware    = require('./middleware/auth');
const authRoutes        = require('./routes/auth');
const businessRoutes    = require('./routes/businesses');
const customerRoutes    = require('./routes/customers');
const jobRoutes         = require('./routes/jobs');
const cors    = require('cors');

async function start() {
  await connectDB();
  await agenda.start();

  const app = express();
  app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  }));
  app.use(express.json());

  // auth
  app.use('/auth', authRoutes);

  // businesses & customers
  app.use('/businesses', authMiddleware, businessRoutes);
  app.use('/businesses/:businessId/customers', authMiddleware, customerRoutes);

  // jobs mounted two ways:
  //  • fetch all jobs for a given customer
  app.use('/customers/:customerId/jobs',   authMiddleware, jobRoutes);
  //  • fetch all jobs for a given business
  app.use('/businesses/:businessId/jobs',  authMiddleware, jobRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(err => console.error(err));
