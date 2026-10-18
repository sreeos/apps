const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
let count = 2;
const best = async () => Number(await sreeos.fs.readText('best.txt').catch(() => '0'));

async function roll() {
  const vals = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));
  const total = vals.reduce((a, b) => a + b, 0);
  document.getElementById('dice').textContent = vals.map((v) => FACES[v - 1]).join(' ');
  document.getElementById('total').textContent = `Total: ${total}`;
  if (total > (await best())) await sreeos.fs.write('best.txt', String(total)); // saved in the app's data folder
  document.getElementById('best').textContent = `Best: ${await best()}`;
}

sreeos.settings.get().then((s) => { count = Number(s.count); roll(); });
sreeos.on('settings', (s) => { count = Number(s.count); roll(); });
document.getElementById('roll').onclick = roll;
