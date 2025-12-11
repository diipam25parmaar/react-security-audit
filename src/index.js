const fileScanner = require('./analyzers/fileScanner');
const astAnalyzer = require('./analyzers/astAnalyzer');
const runtimeProfiler = require('./analyzers/runtimeProfiler');
const securityAnalyzer = require('./analyzers/securityAnalyzer');
const depAnalyzer = require('./analyzers/dependencyAnalyzer');
const reportGenerator = require('./report/reportGenerator');
const fs = require('fs');

module.exports = async function main({ projectPath, runtime = true, output = 'rsaudit-report.json' }) {
  console.log('Scanning files in', projectPath);
  const files = await fileScanner.findSourceFiles(projectPath);
  console.log('Found', files.length, 'source files');

  const astResults = [];
  for (const f of files) {
    try {
      const res = await astAnalyzer.analyzeFile(f);
      astResults.push(res);
    } catch (err) {
      astResults.push({ file: f, error: String(err) });
    }
  }

  // security checks per-file (AST-based)
  const securityResults = [];
  for (const f of files) {
    try {
      const res = await securityAnalyzer.analyzeFile(f);
      securityResults.push(res);
    } catch (err) {
      securityResults.push({ file: f, error: String(err) });
    }
  }

  // dependency & compatibility
  const depReport = await depAnalyzer.analyzeDependencies(projectPath);

  let runtimeResults = null;
  if (runtime) {
    console.log('Running runtime profiler... (this will start a headless browser)');
    try {
      runtimeResults = await runtimeProfiler.profile(projectPath);
    } catch (err) {
      console.warn('Runtime profiling failed:', err.message);
      runtimeResults = { error: err.message };
    }
  }

  const report = reportGenerator.generate({ astResults, securityResults, runtimeResults, depReport, scannedFiles: files });
  fs.writeFileSync(output, JSON.stringify(report, null, 2), 'utf8');
  return report;
};
