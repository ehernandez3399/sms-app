const Agenda = require('agenda');
const dotenv = require('dotenv');

dotenv.config();

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: process.env.AGENDA_COLLECTION
  }
});

module.exports = agenda;
