require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const Client = require('./models/client');

async function seedClient() {
  await connectDB();

  const email = 'edh@gmail.com';
  const plainPassword = 'password';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await Client.findOne({ email });
  if (existing) {
    console.log('Client already exists.');
  } else {
    const client = await Client.create({
      name: 'Ed H',
      email,
      apiKey: 'edh-api-key',
      passwordHash,
      plan: 'pro'
    });

    console.log('Client created:', client);
  }

  mongoose.connection.close();
}

seedClient().catch(err => {
  console.error('Error seeding client:', err);
  mongoose.connection.close();
});
