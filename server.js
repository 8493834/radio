const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set your target Icecast URL (defaults to local Icecast if ICECAST_URL env variable isn't set)
const ICECAST_TARGET = process.env.ICECAST_URL || 'http://127.0.0.1:8000';

// 1. Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// 2. Proxy audio stream requests directly to Icecast
app.use(
  '/live.mp3',
  createProxyMiddleware({
    target: ICECAST_TARGET,
    changeOrigin: true,
    pathRewrite: {
      '^/live.mp3': '/live.mp3', // Forwards to target + /live.mp3
    },
    onError: (err, req, res) => {
      console.error('Proxy connection error:', err.message);
      res.status(502).send('Audio stream currently offline.');
    },
  })
);

// 3. Fallback route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying /live.mp3 -> ${ICECAST_TARGET}`);
});
