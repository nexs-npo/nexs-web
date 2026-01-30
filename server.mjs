import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { handler as ssrHandler } from './dist/server/entry.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || '0.0.0.0';
const port = parseInt(process.env.PORT || '8080', 10);

const authUser = process.env.PREVIEW_AUTH_USER || 'preview';
const authPassword = process.env.PREVIEW_AUTH_PASSWORD;

const assets = sirv(join(__dirname, 'dist/client'), {
  etag: true,
  gzip: true,
  brotli: true,
});

function checkAuth(req, res) {
  if (!authPassword) return true;

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/health') return true;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString();
      const [u, p] = decoded.split(':');
      if (u === authUser && p === authPassword) return true;
    }
  }

  res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Preview"' });
  res.end('Authentication required');
  return false;
}

const server = createServer((req, res) => {
  if (!checkAuth(req, res)) return;
  assets(req, res, () => {
    ssrHandler(req, res);
  });
});

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
