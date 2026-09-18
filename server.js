import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from root directory
app.use(express.static(__dirname));

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
