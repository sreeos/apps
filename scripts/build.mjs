// Builds the static store site in dist/: every package in packages/ (and every app folder in
// src/, zipped) is validated, hashed and listed in dist/index.json. --check only validates.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, extname, relative, basename, dirname } from 'node:path';
import { unzipSync, zipSync } from 'fflate';

const PERMISSIONS = ['notify', 'clipboard', 'launch', 'fs.home', 'fs.all'];
const ID = /^[a-z0-9][a-z0-9._-]{1,63}$/;
const SHOT = /\.(png|jpe?g|webp|gif)$/i;
const MIME = { png: 'image/png', svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', ico: 'image/x-icon' };

/**
 * Validate one package (zip bytes); returns its catalog entry or throws with the reason.
 * The manifest's screenshots are copied out of the package into `shots` (catalog path → bytes).
 */
export function entryFor(name, data, shots = new Map()) {
  const files = unzipSync(data);
  // a single top-level folder is allowed (same rule as SreeOS)
  const top = new Set(Object.keys(files).map((p) => p.split('/')[0]));
  const prefix = top.size === 1 && !files['manifest.json'] ? `${[...top][0]}/` : '';
  const raw = files[`${prefix}manifest.json`];
  if (!raw) throw new Error('manifest.json is missing');
  const m = JSON.parse(new TextDecoder().decode(raw));
  if (typeof m.id !== 'string' || !ID.test(m.id)) throw new Error('"id" is invalid');
  if (typeof m.name !== 'string' || !m.name.trim()) throw new Error('"name" is required');
  if (typeof m.version !== 'string' || !/^\d+(\.\d+)*$/.test(m.version)) throw new Error('"version" must be dotted numbers, e.g. 1.0.0');
  for (const p of m.permissions ?? []) if (!PERMISSIONS.includes(p)) throw new Error(`unknown permission "${p}"`);
  if (m.url !== undefined && !/^https:\/\//.test(m.url)) throw new Error('"url" must be https://');
  if (m.url === undefined && !files[`${prefix}${m.entry ?? 'index.html'}`]) throw new Error(`entry "${m.entry ?? 'index.html'}" is missing`);
  let icon = m.icon;
  const iconFile = icon && files[`${prefix}${icon.replace(/^\.?\//, '')}`];
  if (iconFile) icon = `data:${MIME[extname(icon).slice(1).toLowerCase()] ?? 'application/octet-stream'};base64,${Buffer.from(iconFile).toString('base64')}`;
  else if (icon && !/^https:\/\//.test(icon) && [...icon].length > 4) icon = undefined;
  if (m.changelog !== undefined && typeof m.changelog !== 'string') throw new Error('"changelog" must be a string');
  const screenshots = [];
  for (const p of m.screenshots ?? []) {
    const f = typeof p === 'string' && SHOT.test(p) && files[`${prefix}${p.replace(/^\.?\//, '')}`];
    if (!f) throw new Error(`screenshot "${p}" is missing or not an image`);
    const out = `screenshots/${m.id}/${basename(p)}`;
    shots.set(out, f);
    screenshots.push(out);
  }
  return {
    id: m.id, name: m.name, version: m.version, description: m.description, author: m.author, category: m.category, icon,
    permissions: m.permissions ?? [], package: `packages/${name}`, sha256: createHash('sha256').update(data).digest('hex'),
    size: data.length, url: m.url, changelog: m.changelog, screenshots: screenshots.length ? screenshots : undefined,
  };
}

const newer = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0);
  return false;
};

/** src/<app>/ folders → zip bytes (so simple apps can be contributed as plain files) */
function zipFolder(dir) {
  const out = {};
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : (out[relative(dir, p)] = readFileSync(p)); } };
  walk(dir);
  return zipSync(out, { mtime: '1980-01-01' }); // fixed mtime: same files → same hash
}

function main() {
  const check = process.argv.includes('--check');
  const pkgs = [];
  for (const f of readdirSync('packages').filter((f) => f.endsWith('.sreeapp'))) pkgs.push([f, readFileSync(join('packages', f))]);
  for (const d of readdirSync('src').filter((d) => statSync(join('src', d)).isDirectory())) {
    const data = zipFolder(join('src', d));
    const m = JSON.parse(readFileSync(join('src', d, 'manifest.json'), 'utf8'));
    pkgs.push([`${m.id}-${m.version}.sreeapp`, data]);
  }
  const best = new Map();
  let failed = false;
  for (const [name, data] of pkgs) {
    try {
      const shots = new Map();
      const e = entryFor(name, data, shots);
      // catalog-only screenshots (not shipped inside the app): screenshots/<id>/*.png in this repo
      const dir = join('screenshots', e.id);
      if (existsSync(dir)) for (const f of readdirSync(dir).filter((f) => SHOT.test(f)).sort()) shots.set(`${dir}/${f}`, readFileSync(join(dir, f)));
      if (shots.size) e.screenshots = [...shots.keys()];
      const cur = best.get(e.id);
      if (!cur || newer(e.version, cur[0].version)) best.set(e.id, [e, data, shots]);
    } catch (err) { failed = true; console.error(`✗ ${name}: ${err.message}`); }
  }
  if (failed) process.exit(1);
  const apps = [...best.values()].map(([e]) => e).sort((a, b) => a.name.localeCompare(b.name));
  console.log(apps.map((a) => `✓ ${a.id} ${a.version}`).join('\n'));
  if (check) return;
  rmSync('dist', { recursive: true, force: true });
  mkdirSync('dist/packages', { recursive: true });
  for (const [e, data, shots] of best.values()) {
    writeFileSync(join('dist', e.package), data);
    for (const [p, f] of shots) { mkdirSync(join('dist', dirname(p)), { recursive: true }); writeFileSync(join('dist', p), f); }
  }
  // featured.json: app ids shown first in the Store
  const featured = existsSync('featured.json') ? JSON.parse(readFileSync('featured.json', 'utf8')).filter((id) => best.has(id)) : [];
  writeFileSync('dist/index.json', JSON.stringify({ name: 'SreeOS Apps', featured, apps }, null, 2));
  copyFileSync('site/index.html', 'dist/index.html');
}
if (import.meta.url === `file://${process.argv[1]}`) main();
