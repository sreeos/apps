const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
function hsl2rgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
const hex2 = (n) => n.toString(16).padStart(2, '0');
function show(r, g, b, skip) {
  const hex = '#' + hex2(r) + hex2(g) + hex2(b), [h, s, l] = rgb2hsl(r, g, b);
  if (skip !== 'hex') $('hex').value = hex;
  if (skip !== 'rgb') $('rgb').value = `rgb(${r}, ${g}, ${b})`;
  if (skip !== 'hsl') $('hsl').value = `hsl(${h}, ${s}%, ${l}%)`;
  $('pick').value = hex; $('sw').style.background = hex; $('msg').textContent = '';
  const lum = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  const cw = 1.05 / (L + 0.05), cb = (L + 0.05) / 0.05;
  $('contrast').textContent = `Contrast: ${cw.toFixed(2)}:1 with white, ${cb.toFixed(2)}:1 with black`;
}
function parse(kind) {
  const v = $(kind).value.trim(); let m;
  try {
    if (kind === 'hex') {
      m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v); if (!m) throw 0;
      let h = m[1]; if (h.length === 3) h = [...h].map((c) => c + c).join('');
      show(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4), 16), 'hex');
    } else {
      const n = (v.match(/-?\d+(\.\d+)?/g) || []).map(Number); if (n.length < 3) throw 0;
      if (kind === 'rgb') show(...n.slice(0, 3).map((x) => Math.round(clamp(x, 0, 255))), 'rgb');
      else show(...hsl2rgb(((n[0] % 360) + 360) % 360, clamp(n[1], 0, 100), clamp(n[2], 0, 100)), 'hsl');
    }
  } catch { $('msg').textContent = 'Not a valid ' + kind.toUpperCase() + ' colour'; }
}
for (const k of ['hex', 'rgb', 'hsl']) { $(k).oninput = () => parse(k); $('cp' + k).onclick = (e) => copy($(k).value, e.target); }
$('pick').oninput = () => { $('hex').value = $('pick').value; parse('hex'); $('hex').value = $('pick').value; };
$('hex').value = '#4f8cff'; parse('hex'); show(0x4f, 0x8c, 0xff);
