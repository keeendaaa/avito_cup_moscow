import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const dataset = JSON.parse(await readFile('/tmp/dataset.json', 'utf8'));
const dir = new URL('../assets/listings/', import.meta.url);
const existing = await readdir(dir);
const content = {};

for (const [key, entry] of Object.entries(dataset)) {
  content[key] = entry.desc;
  for (const name of existing.filter(n => n.startsWith(key + '-'))) {
    await unlink(new URL(name, dir));
  }
  let index = 0;
  for (const url of entry.imgs) {
    if (index >= 4) break;
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 30000) continue;
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isWebp = buf.subarray(0, 4).toString() === 'RIFF';
      if (!isJpeg && !isWebp) continue;
      if (isWebp) {
        const temp = `/tmp/${key}-${index}.webp`;
        await writeFile(temp, buf);
        execFileSync('sips', ['-s', 'format', 'jpeg', temp, '--out', `/tmp/${key}-${index}.jpg`], { stdio: 'ignore' });
        buf = await readFile(`/tmp/${key}-${index}.jpg`);
      }
      index += 1;
      await writeFile(new URL(`${key}-${index}.jpg`, dir), buf);
      console.log(key, index, Math.round(buf.length / 1024) + 'kb');
    } catch (error) {
      console.log(key, 'fail', url.slice(0, 40), error.message);
    }
  }
  if (!index) console.log(key, 'NO PHOTOS');
}

await writeFile(new URL('content.mjs', dir), '// Descriptions captured from the public Avito listing pages.\nexport const descriptions = ' + JSON.stringify(content, null, 2) + ';\n');
console.log('done');
