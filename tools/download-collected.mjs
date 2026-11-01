import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const dir = new URL('../assets/listings/', import.meta.url);
const artifacts = new URL('../artifacts/', import.meta.url);

function dimensions(path) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
    return { w: Number(out.match(/pixelWidth: (\d+)/)[1]), h: Number(out.match(/pixelHeight: (\d+)/)[1]) };
  } catch { return null; }
}

const files = (await readdir(artifacts)).filter(n => n.startsWith('photos-') && n.endsWith('.json'));
for (const name of files) {
  const key = name.slice(7, -5);
  let urls = JSON.parse(await readFile(new URL(name, artifacts), 'utf8'));
  try {
    const cover = JSON.parse(await readFile(new URL(`photos-${key}-cover.json`, artifacts), 'utf8'));
    urls = [...cover, ...urls];
  } catch {}
  for (const existing of (await readdir(dir)).filter(n => n.startsWith(key + '-'))) await unlink(new URL(existing, dir));

  const hashes = new Set();
  let index = 0;
  for (const url of urls) {
    if (index >= 8) break;
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 40000) continue;
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isWebp = buf.subarray(0, 4).toString() === 'RIFF';
      if (!isJpeg && !isWebp) continue;
      await writeFile('/tmp/candidate.bin', buf);
      let dim;
      if (isWebp) {
        execFileSync('sips', ['-s', 'format', 'jpeg', '/tmp/candidate.bin', '--out', '/tmp/candidate.jpg'], { stdio: 'ignore' });
        dim = dimensions('/tmp/candidate.jpg');
        buf = await readFile('/tmp/candidate.jpg');
      } else {
        dim = dimensions('/tmp/candidate.bin');
      }
      if (!dim || Math.max(dim.w, dim.h) < 700 || Math.min(dim.w, dim.h) < 380) continue;
      const digest = crypto.createHash('sha1').update(buf).digest('hex');
      if (hashes.has(digest)) continue;
      hashes.add(digest);
      index += 1;
      await writeFile(new URL(`${key}-${index}.jpg`, dir), buf);
    } catch {}
  }
  console.log(key, 'saved', index, 'of', urls.length);
}
