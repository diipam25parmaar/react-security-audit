#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
const main = require('./index');

program
  .name('rsaudit')
  .description('React Security & Performance Audit CLI')
  .version('1.0.0')
  .option('-p, --path <path>', 'project path to scan', process.cwd())
  .option('--no-runtime', 'skip runtime profiling (Puppeteer)')
  .option('-o, --output <file>', 'output report JSON path', 'rsaudit-report.json')
  .option('--serve [port]', 'start report server after analysis (optional port)', '3001')
  .parse(process.argv);

const opts = program.opts();

(async () => {
  try {
    const report = await main({
      projectPath: path.resolve(opts.path),
      runtime: opts.runtime,
      output: path.resolve(opts.output)
    });
    console.log('Analysis complete. Report saved to', opts.output);
    if (opts.serve) {
      const server = require('./server/server');
      server.startServer(report, parseInt(opts.serve || 3001, 10));
    }
  } catch (err) {
    console.error('Error running audit:', err);
    process.exit(1);
  }
})();
