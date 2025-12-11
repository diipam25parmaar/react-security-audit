const { Document, Packer, Paragraph, TextRun } = require('docx');

function generate({ astResults, securityResults, runtimeResults, depReport, scannedFiles }) {
  const summary = {
    scannedFiles: scannedFiles.length,
    totalPerfIssues: astResults.reduce((sum, f) => sum + (f.issues ? f.issues.length : 0), 0),
    totalSecurityIssues: securityResults.reduce((sum,f)=> sum + (f.issues ? f.issues.length : 0), 0)
  };
  const report = { generatedAt: new Date().toISOString(), summary, astResults, securityResults, runtimeResults, depReport };
  return report;
}

module.exports = { generate };
