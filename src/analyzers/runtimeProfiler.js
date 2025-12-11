const puppeteer = require('puppeteer');

async function profile(projectPath, options = {}) {
  const url = options.url || 'http://localhost:3000';
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  await page.evaluate(() => {
    if (window.gc) window.gc();
  }).catch(()=>{});

  const client = await page.target().createCDPSession();
  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');
  const snap1 = await client.send('HeapProfiler.takeHeapSnapshot');

  await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); });
  await page.waitForTimeout(1000);

  await client.send('HeapProfiler.collectGarbage');
  const snap2 = await client.send('HeapProfiler.takeHeapSnapshot');

  await browser.close();
  return { url, note: 'Heap snapshots taken (raw snapshot data not embedded to limit file size).', snapshots: ['snapshot1', 'snapshot2'] };
}

module.exports = { profile };
