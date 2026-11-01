import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
http.createServer(async (req, res) => {
  try {
    const request = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(request.pathname);
    if (pathname === '/__collect') {
      // Dev-only sink used when scraping public listing photos from a real browser session.
      const key = request.searchParams.get('key') || '';
      const suffix = request.searchParams.get('kind') === 'cover' ? '-cover' : '';
      const urls = JSON.parse(request.searchParams.get('urls') || '[]');
      if (!/^[a-z]{1,2}$/.test(key) || !Array.isArray(urls)) { res.writeHead(400).end('bad request'); return; }
      await mkdir(path.join(root, 'artifacts'), { recursive: true });
      await writeFile(path.join(root, 'artifacts', `photos-${key}${suffix}.json`), JSON.stringify(urls));
      res.writeHead(200, { 'Content-Type': 'text/plain' }).end(`ok ${key} ${urls.length}`);
      return;
    }
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Не удалось открыть файл');
  }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Авито Вместе: http://127.0.0.1:${process.env.PORT || 4173}`));
