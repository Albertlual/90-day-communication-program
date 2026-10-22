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

    const pingRender = () => {
      const url = 'https://onrender.com';

      try {
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              logger.warn('Render keep-alive ping returned a non-OK status', { status: response.status, url });
            }
          })
          .catch((error) => {
            logger.warn('Render keep-alive ping failed', { message: error.message, url });
          });
      } catch (error) {
        logger.warn('Render keep-alive ping threw an exception', { message: error.message, url });
      }
    };

    setInterval(pingRender, 10 * 60 * 1000);
    pingRender();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection failed', { message: err.message });
    process.exit(1);
  });
