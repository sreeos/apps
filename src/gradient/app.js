const $ = (id) => document.getElementById(id);
let stops = [{ c: '#ff7a59', p: 0 }, { c: '#7a5cff', p: 100 }];
const rnd = () => '#' + Array.from({ length: 3 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
function css() {
  const list = [...stops].sort((a, b) => a.p - b.p).map((s) => `${s.c} ${s.p}%`).join(', '), t = $('type').value, a = $('angle').value;
  return t === 'linear' ? `linear-gradient(${a}deg, ${list})` : t === 'radial' ? `radial-gradient(circle, ${list})` : `conic-gradient(from ${a}deg, ${list})`;
}
function update() {
  const v = css(); $('prev').style.background = v; $('css').value = `background: ${v};`;
  $('angleo').textContent = $('angle').value + '°'; $('angl').style.display = $('type').value === 'radial' ? 'none' : '';
}
function draw() {
  $('stops').replaceChildren(...stops.map((s, i) => {
    const d = document.createElement('div'); d.className = 'stop';
    d.innerHTML = `<input type="color" aria-label="Stop ${i + 1} color"><input type="range" min="0" max="100" aria-label="Stop ${i + 1} position"><output></output><button aria-label="Remove stop ${i + 1}">Remove</button>`;
    const [col, pos, out, del] = d.children; col.value = s.c; pos.value = s.p; out.textContent = s.p + '%';
    col.oninput = () => { s.c = col.value; update(); };
    pos.oninput = () => { s.p = +pos.value; out.textContent = s.p + '%'; update(); };
    del.disabled = stops.length <= 2; del.onclick = () => { stops.splice(i, 1); draw(); update(); };
    return d;
  }));
}
$('add').onclick = () => { stops.push({ c: rnd(), p: 50 }); draw(); update(); };
$('rand').onclick = () => { stops = stops.map((s) => ({ ...s, c: rnd() })); $('angle').value = Math.floor(Math.random() * 360); draw(); update(); };
$('type').onchange = $('angle').oninput = update;
$('copy').onclick = async () => {
  try { await sreeos.clipboard.write($('css').value); $('msg').textContent = 'Copied'; }
  catch { $('css').select(); $('msg').textContent = 'Press Ctrl+C to copy the selected text'; }
};
draw(); update();
