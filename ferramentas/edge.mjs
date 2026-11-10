// node shot.mjs <url> <outPrefix> <width> <height> <scrollY,scrollY,...> [pdf]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, out, W = '1440', H = '900', ys = '0', mode] = process.argv.slice(2);
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(process.env.SHOT_TMP || tmpdir(), 'edge-'));
const p = spawn(EDGE, ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pend = new Map();
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const errors = [];
try {
  let tgt;
  for (let i = 0; i < 40; i++) { try { tgt = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (tgt) break; } catch {} await sleep(250); }
  ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); } if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') errors.push(d.params.entry.text + ' ' + (d.params.entry.url || '')); };
  await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: +W < 600 });
  await send('Page.navigate', { url });
  await sleep(3500);
  if (mode === 'pdf') {
    const r = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    writeFileSync(out, Buffer.from(r.data, 'base64'));
    console.log('pdf', out);
  } else {
    for (const y of ys.split(',')) {
      const js = (y.startsWith('#')||y.startsWith('.')) ? `document.querySelector('${y}').scrollIntoView()` : `window.scrollTo(0, ${y})`;
      await send('Runtime.evaluate', { expression: js + ";document.querySelectorAll('.cursor,.cursor-dot').forEach(e=>e.style.display='none')" });
      await sleep(1400);
      const r = await send('Page.captureScreenshot', { format: 'png' });
      const f = `${out}-${y.replace(/[^\w]/g, '')}.png`;
      writeFileSync(f, Buffer.from(r.data, 'base64'));
      console.log('shot', f);
    }
  }
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
} finally { try { ws?.close(); } catch {} p.kill(); }
process.exit(0);
