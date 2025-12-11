import React from 'react';
export default function IssueCard({ issue }){
  return (
    <div className="p-2 bg-white shadow-sm rounded">
      <div><strong>{issue.type}</strong> — <small>{issue.severity}</small></div>
      <div className="text-sm">{issue.message}</div>
      {issue.suggestion && <div className="text-xs mt-1 text-gray-600">Suggestion: {issue.suggestion}</div>}
    </div>
  )
}
