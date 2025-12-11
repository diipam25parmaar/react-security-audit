const express = require('express');
const path = require('path');

let lastReport = null;

function startServer(report, port = 3001) {
  lastReport = report;
  const app = express();
  const publicDir = path.join(__dirname, 'public');
  app.use(express.json());
  app.get('/api/report', (req, res) => res.json(lastReport));
  app.get('/download', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=rsaudit-report.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(lastReport, null, 2));
  });
  app.use(express.static(publicDir));
  app.listen(port, () => console.log('Report server running on http://localhost:' + port));
}

module.exports = { startServer };
