import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import apiLinks from './routes/api_links.js';
import { renderIndex, renderCode, handleRedirect } from './routes/redirect.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(bodyParser.json());

// health check exactly at /healthz
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, version: '1.0' });
});

// API
app.use('/api/links', apiLinks);

// UI pages
app.get('/', renderIndex);
app.get('/code/:code', renderCode);

// Redirect (must come after /code)
app.get('/:code', handleRedirect);

// start server
app.listen(PORT, () => {
  console.log(`TinyLink running on port ${PORT}`);
});
