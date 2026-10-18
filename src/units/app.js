const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
// factor = size of the unit in the base unit
const U = {
  Length: { base: 'm', u: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344, 'nautical mile': 1852 } },
  Mass: { u: { mg: 1e-6, g: 0.001, kg: 1, tonne: 1000, ounce: 0.028349523125, pound: 0.45359237, stone: 6.35029318 } },
  Volume: { u: { mL: 0.001, L: 1, 'm³': 1000, tsp: 0.00492892, tbsp: 0.0147868, 'fl oz': 0.0295735, cup: 0.236588, pint: 0.473176, quart: 0.946353, 'gallon (US)': 3.78541 } },
  Speed: { u: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, knot: 0.514444, 'ft/s': 0.3048 } },
  Data: { u: { bit: 1 / 8, byte: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824, TiB: 1099511627776 } },
  Temperature: { u: { '°C': 0, '°F': 0, K: 0 } },
};
const toC = { '°C': (v) => v, '°F': (v) => (v - 32) * 5 / 9, K: (v) => v - 273.15 };
const fromC = { '°C': (v) => v, '°F': (v) => v * 9 / 5 + 32, K: (v) => v + 273.15 };
function conv(cat, v, a, b) {
  if (cat === 'Temperature') return fromC[b](toC[a](v));
  return v * U[cat].u[a] / U[cat].u[b];
}
const fmt = (n) => (Number.isFinite(n) ? Number(n.toPrecision(10)).toLocaleString(undefined, { maximumFractionDigits: 10 }) : '—');
function fill(sel, items, pick) { sel.textContent = ''; items.forEach((x, i) => sel.add(new Option(x, x, false, i === pick))); }
function loadCat() { const k = Object.keys(U[$('cat').value].u); fill($('u1'), k, 0); fill($('u2'), k, Math.min(2, k.length - 1)); calc(); }
function calc() {
  const cat = $('cat').value, v = parseFloat($('v1').value), a = $('u1').value, b = $('u2').value;
  if (isNaN(v)) { $('res').textContent = '—'; $('all').textContent = ''; return; }
  $('res').textContent = `${fmt(v)} ${a} = ${fmt(conv(cat, v, a, b))} ${b}`;
  $('all').textContent = Object.keys(U[cat].u).filter((u) => u !== a).map((u) => `${fmt(conv(cat, v, a, u))} ${u}`).join('   ·   ');
}
fill($('cat'), Object.keys(U), 0);
$('cat').onchange = loadCat;
for (const id of ['v1', 'u1', 'u2']) $(id).oninput = calc;
$('sw').onclick = () => { const t = $('u1').value; $('u1').value = $('u2').value; $('u2').value = t; calc(); };
loadCat();
