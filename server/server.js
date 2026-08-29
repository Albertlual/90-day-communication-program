const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Fail fast and loudly if required secrets are missing, rather than
// starting a server that will error on the first real request.
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  logger.error('Copy .env.example to .env in the project root and fill in real values.');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB connected');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed', { message: err.message });
    process.exit(1);
  });
