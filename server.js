const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Uses ICECAST_URL from Render env vars, or defaults to local host
const ICECAST_TARGET = process.env.ICECAST_URL || 'http://127.0.0.1:8000';

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  '/live.mp3',
  createProxyMiddleware({
    target: ICECAST_TARGET,
    changeOrigin: true,
    pathRewrite: { '^/live.mp3': '/live.mp3' }
  })
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying /live.mp3 -> ${ICECAST_TARGET}`);
});
