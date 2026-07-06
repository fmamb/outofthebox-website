const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = __dirname;
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0] || '/');
  const clean = decoded === '/' ? '/index.html' : decoded;
  const normalized = path.normalize(clean).replace(/^([.][.][/\\])+/, '');
  return path.join(rootDir, normalized);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);

  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': 'no-cache',
  });

  stream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  });

  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    const indexPath = path.join(filePath, 'index.html');
    fs.stat(indexPath, (indexErr, indexStats) => {
      if (!indexErr && indexStats.isFile()) {
        sendFile(res, indexPath);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    });
  });
});

server.listen(port, host, () => {
  process.stdout.write(`Serving ${rootDir} at http://${host}:${port}/\n`);
});

