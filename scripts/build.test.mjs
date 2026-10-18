import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';
import { entryFor } from './build.mjs';

const pkg = (m, extra = {}) => zipSync({ 'manifest.json': strToU8(JSON.stringify(m)), ...extra });
test('package validation', () => {
  const e = entryFor('a.sreeapp', pkg({ id: 'me.a', name: 'A', version: '1.0.0', icon: 'i.png' }, { 'index.html': strToU8('<p>'), 'i.png': new Uint8Array([1]) }));
  assert.equal(e.icon, 'data:image/png;base64,AQ==');
  assert.match(e.sha256, /^[0-9a-f]{64}$/);
  assert.equal(entryFor('w.sreeapp', pkg({ id: 'web.w', name: 'W', version: '1', url: 'https://w.test' })).package, 'packages/w.sreeapp');
  assert.throws(() => entryFor('x', pkg({ id: 'me.a', name: 'A', version: '1.0.0' })), /entry/);
  assert.throws(() => entryFor('x', pkg({ id: 'Bad', name: 'A', version: '1' })), /id/);
  assert.throws(() => entryFor('x', pkg({ id: 'me.a', name: 'A', version: '1', permissions: ['root'], url: 'https://x' })), /permission/);
  assert.throws(() => entryFor('x', pkg({ id: 'me.a', name: 'A', version: '1', url: 'http://x' })), /url/);
  const shots = new Map();
  const s = entryFor('s', pkg({ id: 'me.s', name: 'S', version: '1', url: 'https://s.test', screenshots: ['img/1.png'], changelog: 'New' }, { 'img/1.png': new Uint8Array([7]) }), shots);
  assert.deepEqual([s.screenshots, [...shots.values()][0], s.changelog, s.url], [['screenshots/me.s/1.png'], new Uint8Array([7]), 'New', 'https://s.test']);
  assert.throws(() => entryFor('x', pkg({ id: 'me.a', name: 'A', version: '1', url: 'https://x', screenshots: ['nope.png'] })), /screenshot/);
});
