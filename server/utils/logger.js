// Minimal structured logger. Deliberately simple — swap for a library
// like pino/winston later if log volume/format needs grow.
// Never pass passwords, API keys, or raw user response text as meta.
const timestamp = () => new Date().toISOString();

const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${timestamp()} - ${message}`, meta);
  },
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${timestamp()} - ${message}`, meta);
  },
  error: (message, meta = {}) => {
    console.error(`[ERROR] ${timestamp()} - ${message}`, meta);
  },
};

module.exports = logger;
