const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const WORDS = ('apple banana orange guitar planet rocket window garden bridge castle dragon forest island jungle kitchen laptop monkey needle ocean pencil quartz rabbit school ticket umbrella valley winter yellow zebra anchor basket candle desert engine falcon hammer insect jacket kettle lemon mirror nature oyster pepper queen river saddle tunnel violin wizard cactus doctor eagle flower glacier harbor iceberg jigsaw koala ladder magnet napkin orchid parrot quilt rainbow sunset turtle unicorn volcano whistle yogurt zipper balloon cabinet diamond elephant fiction giraffe horizon journey kingdom lantern machine network opinion picture quality reflect station teacher uniform village weather wonder pirate treasure captain compass mystery thunder blanket chimney library pyramid skeleton teapot tractor puzzle rhythm galaxy keyboard monitor program browser python server pixel binary memory cursor folder button signal').split(' ');
const MAX = 6;
let word, guessed, wrong, over;
const keysEl = [];
function start() {
  word = WORDS[rnd(WORDS.length)].toUpperCase(); guessed = new Set(); wrong = 0; over = false;
  keysEl.forEach((b) => { b.disabled = false; }); $('#msg').textContent = 'Type a letter or click one.'; render();
}
function render() {
  $('#word').textContent = [...word].map((c) => (guessed.has(c) || over ? c : '_')).join(' ');
  $('#word').setAttribute('aria-label', [...word].map((c) => (guessed.has(c) ? c : 'blank')).join(' '));
  $('#info').textContent = `Wrong: ${wrong}/${MAX}`; $('#best').textContent = `Wins: ${SAVE.wins || 0}  Streak: ${SAVE.streak || 0} (best ${SAVE.bestStreak || 0})`;
  const parts = ['<line x1="10" y1="165" x2="90" y2="165"/><line x1="30" y1="165" x2="30" y2="10"/><line x1="30" y1="10" x2="110" y2="10"/><line x1="110" y1="10" x2="110" y2="30"/>',
    '<circle cx="110" cy="45" r="15"/>', '<line x1="110" y1="60" x2="110" y2="105"/>', '<line x1="110" y1="70" x2="90" y2="92"/>', '<line x1="110" y1="70" x2="130" y2="92"/>', '<line x1="110" y1="105" x2="92" y2="140"/>', '<line x1="110" y1="105" x2="128" y2="140"/>'];
  $('#svg').innerHTML = parts.slice(0, wrong + 1).join('');
}
function guess(ch) {
  if (over || guessed.has(ch)) return;
  guessed.add(ch); keysEl[ch.charCodeAt(0) - 65].disabled = true;
  if (!word.includes(ch)) wrong++;
  if (wrong >= MAX) { over = true; SAVE.streak = 0; save(); $('#msg').textContent = `You lost. The word was ${word}.`; }
  else if ([...word].every((c) => guessed.has(c))) {
    over = true; SAVE.wins = (SAVE.wins || 0) + 1; SAVE.streak = (SAVE.streak || 0) + 1; SAVE.bestStreak = Math.max(SAVE.bestStreak || 0, SAVE.streak); save();
    $('#msg').textContent = 'You got it!';
  }
  render();
}
function init() {
  $('#stage').innerHTML = '<svg id="svg" viewBox="0 0 150 170" aria-label="Hangman drawing"></svg><div id="word"></div><div id="keys"></div>';
  for (let i = 0; i < 26; i++) { const c = String.fromCharCode(65 + i), b = document.createElement('button'); b.textContent = c; b.onclick = () => { guess(c); $('#stage').focus(); }; $('#keys').appendChild(b); keysEl.push(b); }
  $('#stage').addEventListener('keydown', (e) => { if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey) guess(e.key.toUpperCase()); });
  $('#restart').onclick = () => { start(); $('#stage').focus(); };
  start(); $('#stage').focus();
}
load().then(init);
