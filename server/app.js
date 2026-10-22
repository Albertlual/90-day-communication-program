const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const progressRoutes = require('./routes/progressRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --- API routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/program', programRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/evaluation', evaluationRoutes);
// Future phases mount additional routers here:
// app.use('/api/vocabulary', vocabularyRoutes);

// --- Serve the built React app in production (single Render Web Service) ---
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- 404 for unmatched API routes ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Central error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
