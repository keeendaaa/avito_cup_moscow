import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';

const LISTINGS = {
  a: ['istra/doma_dachi_kottedzhi/5-k._kottedzh_225_m_1240360045', '5-к. коттедж, 225'],
  b: ['odintsovo/doma_dachi_kottedzhi/3-k._kottedzh_72_m_4660140519', '3-к. коттедж, 72'],
  c: ['istra/doma_dachi_kottedzhi/10-k._i_bolee_kottedzh_422_m_8407661686', '422'],
  d: ['kubinka/doma_dachi_kottedzhi/6-k._kottedzh_286_m_1843762738', '286'],
  e: ['istra/doma_dachi_kottedzhi/7-k._kottedzh_360_m_4633119970', '7-к. коттедж'],
  f: ['lobnya/doma_dachi_kottedzhi/8-k._kottedzh_360_m_2659140270', '8-к. коттедж'],
  g: ['moskva/mebel_i_interer/divan_pryamoy_spin_8336878154', 'СПИН'],
  h: ['moskva/predlozheniya_uslug/svadebnyy_fotograf_moskva_7598301888', 'Свадебный фотограф'],
  i: ['moskva/realty_rent/butik-otel_vellion_smolenskiy_4169344518', 'Веллион'],
  j: ['moskva/realty_rent/gostinitsa_kadashevskaya_8008765096', 'Кадашевская'],
  k: ['moskva/kvartiry/2-k._kvartira_46_m_1021_et._7901980626', '2-к. квартира, 46'],
  m: ['moskva/krasota_i_zdorove/nabor_moschino_toy_boy_3230868848', 'Moschino'],
  n: ['moskva/avtomobili/hyundai_solaris_1.6_at_2015_114_000_km_8349978558', 'Solaris'],
  o: ['moskva/avtomobili/changan_eado_plus_1.4_amt_2023_22_085_km_8300440259', 'Eado'],
  p: ['moskva/gotoviy_biznes/deystvuyuschee_kafe_8437923895', 'Действующее кафе'],
};

const dir = new URL('../assets/listings/', import.meta.url);
const norm = value => value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

function dimensions(path) {
  try {
    const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', path], { encoding: 'utf8' });
    const w = Number(out.match(/pixelWidth: (\d+)/)[1]);
    const h = Number(out.match(/pixelHeight: (\d+)/)[1]);
    return { w, h };
  } catch { return null; }
}

for (const [key, [path, needle]] of Object.entries(LISTINGS)) {
  const target = `https://www-avito-ru.translate.goog/${path}?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en`;
  let html = '';
  for (let i = 0; i < 3 && !html; i++) {
    try {
      const res = await fetch(target, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' } });
      const text = await res.text();
      if (res.ok && text.length > 50000 && !text.includes('Доступ ограничен')) html = text;
    } catch {}
  }
  if (!html) { console.log(key, 'page failed'); continue; }

  const matched = [];
  const rest = [];
  for (const tag of html.match(/<img[^>]*>/g) || []) {
    const src = tag.match(/src="(https:\/\/[a-z0-9]+\.img\.avito\.st\/image\/[^"]+)"/);
    if (!src) continue;
    const url = src[1].split('?')[0];
    const alt = tag.match(/alt="([^"]*)"/);
    if (alt && norm(alt[1]).includes(norm(needle))) matched.push(url);
    else rest.push(url);
  }
  const unique = [...new Set(matched)].concat([...new Set(rest)]);
  for (const name of (await readdir(dir)).filter(n => n.startsWith(key + '-'))) await unlink(new URL(name, dir));

  let index = 0;
  const hashes = new Set();
  for (const url of unique) {
    if (index >= 8) break;
    const tmp = '/tmp/cand.bin';
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      let buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 40000) continue;
      const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isWebp = buf.subarray(0, 4).toString() === 'RIFF';
      if (!isJpeg && !isWebp) continue;
      await writeFile(tmp, buf);
      let dim = null;
      if (isWebp) {
        execFileSync('sips', ['-s', 'format', 'jpeg', tmp, '--out', '/tmp/cand.jpg'], { stdio: 'ignore' });
        dim = dimensions('/tmp/cand.jpg');
        buf = await readFile('/tmp/cand.jpg');
      } else {
        dim = dimensions(tmp);
      }
      if (!dim || Math.max(dim.w, dim.h) < 700 || Math.min(dim.w, dim.h) < 380) continue;
      const digest = crypto.createHash('sha1').update(buf).digest('hex');
      if (hashes.has(digest)) continue;
      hashes.add(digest);
      index += 1;
      await writeFile(new URL(`${key}-${index}.jpg`, dir), buf);
    } catch {}
  }
  console.log(key, 'photos:', index, 'candidates:', unique.length);
}
