import React from 'react';
import IssueCard from './IssueCard';

function FileSection({ title, files }){
  return (
    <div className="mt-4">
      <h2 className="font-semibold">{title}</h2>
      {files.map(file => (
        <div key={file.file} className="p-4 border rounded mt-2">
          <div className="font-mono">{file.file}</div>
          <div className="mt-2 grid gap-2">
            {file.issues && file.issues.length ? file.issues.map((iss, idx)=> <IssueCard key={idx} issue={iss} />) : <div className="text-sm text-gray-500">No issues found</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ReportList({ astResults = [], securityResults = [] }){
  return (
    <div className="mt-4 grid gap-4">
      <FileSection title="Performance (AST) Findings" files={astResults} />
      <FileSection title="Security (AST) Findings" files={securityResults} />
    </div>
  )
}
