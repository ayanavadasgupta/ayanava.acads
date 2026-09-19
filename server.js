import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// PWA Manifest and Service Worker routes with exact headers (before static middleware)
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'manifest.webmanifest'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

// Serve static files from root directory
app.use(express.static(__dirname));

app.get('/apple-touch-icon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'apple-touch-icon.png'));
});

app.get('/apple-touch-icon-precomposed.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'apple-touch-icon.png'));
});

// Route handlers for primary HTML files and multi-page navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/research', (req, res) => {
  res.sendFile(path.join(__dirname, 'research.html'));
});

app.get('/career', (req, res) => {
  res.sendFile(path.join(__dirname, 'career.html'));
});

app.get('/cv', (req, res) => {
  res.sendFile(path.join(__dirname, 'cv.html'));
});

app.get('/cv.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'ayanava-dasgupta-cv.pdf'));
});

app.get('/ayanava-dasgupta-cv.pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'ayanava-dasgupta-cv.pdf'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
