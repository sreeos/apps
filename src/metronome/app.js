const $ = (id) => document.getElementById(id);
let ctx, running = false, beat = 0, next = 0, timer, taps = [];
const bpm = () => +$('bpm').value, beats = () => +$('sig').value;
function dots() {
  $('dots').replaceChildren(...Array.from({ length: beats() }, (_, i) => { const d = document.createElement('div'); d.className = 'dot' + (i ? '' : ' first'); return d; }));
}
function setBpm(v) { v = Math.max(30, Math.min(240, Math.round(v))); $('bpm').value = v; $('bpmv').textContent = v; sreeos.setTitle(`${v} BPM — Metronome`); }
function click(t, accent) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = accent ? 1500 : 1000; o.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(accent ? 1 : 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
  o.start(t); o.stop(t + 0.07);
}
function flash(i, t) {
  setTimeout(() => { [...$('dots').children].forEach((d, k) => d.classList.toggle('lit', k === i)); }, Math.max(0, (t - ctx.currentTime) * 1000));
}
function schedule() {
  const sixth = $('sig').value === '6';
  while (next < ctx.currentTime + 0.15) {
    click(next, beat === 0 && $('acc').checked); flash(beat, next);
    next += 60 / bpm() / (sixth ? 2 : 1); // 6/8 counts eighth notes
    beat = (beat + 1) % beats();
  }
}
function start() {
  ctx = ctx || new AudioContext(); ctx.resume();
  running = true; beat = 0; next = ctx.currentTime + 0.05; $('go').textContent = 'Stop';
  schedule(); timer = setInterval(schedule, 25);
}
function stop() { running = false; clearInterval(timer); $('go').textContent = 'Start'; [...$('dots').children].forEach((d) => d.classList.remove('lit')); }
$('go').onclick = () => (running ? stop() : start());
$('bpm').oninput = (e) => setBpm(+e.target.value);
$('m10').onclick = () => setBpm(bpm() - 10); $('m1').onclick = () => setBpm(bpm() - 1);
$('p1').onclick = () => setBpm(bpm() + 1); $('p10').onclick = () => setBpm(bpm() + 10);
$('sig').onchange = () => { dots(); beat = 0; };
$('tap').onclick = () => {
  const n = performance.now(); if (taps.length && n - taps[taps.length - 1] > 2000) taps = [];
  taps.push(n); taps = taps.slice(-6);
  if (taps.length > 1) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
};
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT') { e.preventDefault(); $('go').click(); } });
dots(); setBpm(100);
