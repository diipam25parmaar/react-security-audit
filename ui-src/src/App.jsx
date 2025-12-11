import React, { useEffect, useState } from 'react';
import ReportList from './components/ReportList';

export default function App() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch('/api/report').then(r=>r.json()).then(j=>{ setReport(j); setLoading(false); }).catch(e=>{ console.error(e); setLoading(false); });
  },[]);

  if (loading) return <div className="p-6">Loading report...</div>
  if (!report) return <div className="p-6">No report available</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">React Security & Performance Audit Report</h1>
      <p>Generated at: {report.generatedAt}</p>
      <div className="mt-2 p-2 border rounded">
        <strong>Summary</strong>
        <div>Scanned files: {report.summary.scannedFiles}</div>
        <div>Perf issues: {report.summary.totalPerfIssues}</div>
        <div>Security issues: {report.summary.totalSecurityIssues}</div>
        <div>React version detected: {report.depReport && report.depReport.reactVersion}</div>
      </div>
      <ReportList astResults={report.astResults} securityResults={report.securityResults} runtimeResults={report.runtimeResults} />
      <div className="mt-4">
        <a href="/download" className="underline">Download JSON Report</a>
      </div>
    </div>
  );
}
