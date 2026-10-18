const $ = (id) => document.getElementById(id);
let ctx, noiseBuf, step = 0, next = 0, timer, running = false;
const audio = () => { if (!ctx) { ctx = new AudioContext(); noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } ctx.resume(); return ctx; };
function env(g, t, peak, dur) { g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); }
function osc(t, type, f0, f1, dur, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, vol, dur); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(t, ftype, freq, dur, vol) {
  const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  n.buffer = noiseBuf; f.type = ftype; f.frequency.value = freq; env(g, t, vol, dur);
  n.connect(f); f.connect(g); g.connect(ctx.destination); n.start(t); n.stop(t + dur + 0.02);
}
const VOICES = [
  ['Kick', (t) => osc(t, 'sine', 150, 40, 0.35, 1)],
  ['Snare', (t) => { noise(t, 'highpass', 1500, 0.18, 0.7); osc(t, 'triangle', 220, 120, 0.1, 0.5); }],
  ['Clap', (t) => { [0, 0.012, 0.024].forEach((d) => noise(t + d, 'bandpass', 1200, 0.08, 0.6)); noise(t + 0.036, 'bandpass', 1200, 0.2, 0.6); }],
  ['Hat', (t) => noise(t, 'highpass', 7000, 0.05, 0.5)],
  ['Open hat', (t) => noise(t, 'highpass', 6000, 0.3, 0.45)],
  ['Tom', (t) => osc(t, 'sine', 200, 90, 0.3, 0.9)],
  ['Rim', (t) => { osc(t, 'square', 800, 600, 0.03, 0.3); noise(t, 'bandpass', 3000, 0.03, 0.3); }],
  ['Cowbell', (t) => { osc(t, 'square', 560, 555, 0.25, 0.25); osc(t, 'square', 845, 840, 0.25, 0.25); }],
];
const pat = VOICES.map(() => Array(16).fill(false));
const DEMO = { 0: [0, 4, 8, 12], 1: [4, 12], 3: [0, 2, 4, 6, 8, 10, 12, 14] };
for (const k in DEMO) DEMO[k].forEach((s) => (pat[k][s] = true));
const cells = VOICES.map(() => []);

VOICES.forEach(([name, fn], r) => {
  const b = document.createElement('button'); b.textContent = name;
  b.onpointerdown = () => { audio(); fn(ctx.currentTime); b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 90); };
  $('pads').append(b);
  const row = document.createElement('div'); row.className = 'seq';
  const l = document.createElement('span'); l.textContent = name; row.append(l);
  for (let s = 0; s < 16; s++) {
    const c = document.createElement('button');
    c.className = 'step' + (s % 4 === 0 ? ' q' : '') + (pat[r][s] ? ' on' : '');
    c.setAttribute('aria-label', `${name} step ${s + 1}`); c.setAttribute('aria-pressed', pat[r][s]);
    c.onclick = () => { pat[r][s] = !pat[r][s]; c.classList.toggle('on', pat[r][s]); c.setAttribute('aria-pressed', pat[r][s]); };
    cells[r].push(c); row.append(c);
  }
  $('grid').append(row);
});
function tick() {
  while (next < ctx.currentTime + 0.12) {
    const s = step, t = next;
    VOICES.forEach(([, fn], r) => { if (pat[r][s]) fn(t); });
    setTimeout(() => cells.forEach((row, r) => row.forEach((c, i) => c.classList.toggle('now', i === s && running))), Math.max(0, (t - ctx.currentTime) * 1000));
    next += 60 / +$('bpm').value / 4; step = (step + 1) % 16;
  }
}
$('go').onclick = () => {
  if (running) { running = false; clearInterval(timer); $('go').textContent = 'Play'; cells.forEach((row) => row.forEach((c) => c.classList.remove('now'))); return; }
  audio(); running = true; step = 0; next = ctx.currentTime + 0.05; $('go').textContent = 'Stop'; tick(); timer = setInterval(tick, 25);
};
$('bpm').oninput = (e) => { $('bpmo').textContent = e.target.value; };
$('clear').onclick = () => { pat.forEach((r) => r.fill(false)); cells.forEach((row) => row.forEach((c) => { c.classList.remove('on'); c.setAttribute('aria-pressed', false); })); };
