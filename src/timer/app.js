let cfg = { work: '25', rest: '5' }, resting = false, left = 0, end = 0, tick, rounds = 0;
const $ = (id) => document.getElementById(id);
const len = () => Number(resting ? cfg.rest : cfg.work) * 60;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function show() {
  $('clock').textContent = fmt(left);
  $('phase').textContent = resting ? 'Break' : 'Focus';
  $('go').textContent = tick ? 'Pause' : 'Start';
  $('done').textContent = rounds ? `${rounds} focus round${rounds > 1 ? 's' : ''} done` : '';
  sreeos.setTitle(tick ? `${fmt(left)} — Focus Timer` : 'Focus Timer');
}
function reset() { clearInterval(tick); tick = null; left = len(); show(); }
function step() {
  // measured against the clock, so a throttled background tab stays accurate
  left = Math.max(0, Math.round((end - Date.now()) / 1000));
  if (!left) {
    if (!resting) rounds++;
    sreeos.notify(resting ? 'Break over, back to focus' : `Focus round done. Take ${cfg.rest} minutes.`);
    resting = !resting; left = len(); end = Date.now() + left * 1000;
  }
  show();
}

$('go').onclick = () => {
  if (tick) { clearInterval(tick); tick = null; } else { end = Date.now() + left * 1000; tick = setInterval(step, 250); }
  show();
};
$('reset').onclick = () => { resting = false; reset(); };
const apply = (s) => { cfg = s; if (!tick) reset(); };
sreeos.settings.get().then(apply);
sreeos.on('settings', apply);
