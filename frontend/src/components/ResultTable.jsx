import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Database, Clock, FileSpreadsheet, Loader2 } from 'lucide-react';

export const ResultTable = ({
  results,
  schemaContext = [],
  isLoading = false,
  error = null,
  executionTime = null,
}) => {
  const [copied, setCopied] = useState(false);

  // Initial Idle State
  if (!isLoading && !error && results === null) {
    return (
      <div className="h-full bg-white border border-border rounded-lg flex flex-col items-center justify-center p-8 text-center shadow-card">
        <div className="w-10 h-10 rounded-full bg-surface-muted border border-border flex items-center justify-center text-text-muted mb-3">
          <Database className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          No query results yet
        </h3>
        <p className="text-xs text-text-secondary max-w-sm">
          Write a SQL query in the editor and click <strong className="text-text-primary">Run Query</strong> (or press Ctrl+Enter) to view results.
        </p>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full bg-white border border-border rounded-lg flex flex-col items-center justify-center p-8 text-center shadow-card">
        <Loader2 className="w-6 h-6 animate-spin text-text-secondary mb-3" />
        <h3 className="text-sm font-medium text-text-primary mb-1">
          Executing query...
        </h3>
        <p className="text-xs text-text-muted font-mono">
          Connecting to database and awaiting response
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="h-full bg-white border border-border rounded-lg flex flex-col p-6 shadow-card overflow-y-auto">
        <div className="flex items-center gap-2 text-status-error mb-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="text-sm font-semibold">Query Execution Failed</h3>
        </div>
        <div className="p-3.5 bg-status-error-bg border border-status-error-border rounded-md font-mono text-xs text-status-error break-all leading-relaxed select-text">
          {error}
        </div>
        <div className="mt-4 text-xs text-text-secondary space-y-1">
          <p className="font-medium text-text-primary">Troubleshooting tips:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-0.5 text-[11px]">
            <li>Check for SQL syntax errors or typos in table/column names.</li>
            <li>Ensure the selected active database contains the referenced tables.</li>
            <li>Verify database user permissions for this operation.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Parse result rows and columns
  const isArrayData = Array.isArray(results);
  const rows = isArrayData ? results : (results?.data && Array.isArray(results.data) ? results.data : []);
  
  // Non-SELECT mutation results (like UPDATE / INSERT / CREATE with affectedRows)
  const isMutationResult = !isArrayData && results && typeof results === 'object' && ('affectedRows' in results || 'insertId' in results || 'command' in results);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  const handleCopyJSON = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-border rounded-lg overflow-hidden shadow-card">
      {/* Result Header Toolbar */}
      <div className="h-10 px-3 border-b border-border bg-surface-muted flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            Results
          </span>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-surface-subtle border border-border text-text-secondary">
            {rows.length} {rows.length === 1 ? 'row' : 'rows'}
          </span>
          {executionTime !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted">
              <Clock className="w-3 h-3" />
              {executionTime}ms
            </span>
          )}
        </div>

        {/* Copy / Actions */}
        {rows.length > 0 && (
          <button
            type="button"
            onClick={handleCopyJSON}
            className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-surface-subtle transition-colors cursor-pointer"
            title="Copy results as JSON"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-success" />
                <span className="text-status-success">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        )}
      </div>

      {schemaContext.length > 0 && (
        <div className="max-h-40 overflow-y-auto border-b border-border bg-surface-muted/40 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-primary">
              Retrieved schema context
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              {schemaContext.length} chunks
            </span>
          </div>
          <div className="space-y-1.5">
            {schemaContext.map((item, index) => {
              const payload = item.payload || {};

              return (
                <div
                  key={`${payload.tableName || 'schema'}-${index}`}
                  className="rounded border border-border bg-white px-2 py-1.5 text-[10px]"
                >
                  <div className="flex items-center gap-2 font-mono text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {payload.tableName || 'Schema'}
                    </span>
                    <span>{payload.type || 'chunk'}</span>
                    <span className="ml-auto">score {Number(item.score).toFixed(3)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap font-mono text-text-secondary">
                    {payload.content || 'No content returned'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table Content Area */}
      <div className="flex-1 overflow-auto bg-white relative">
        {isMutationResult ? (
          <div className="p-6">
            <div className="p-4 bg-surface-muted border border-border rounded-md font-mono text-xs space-y-1.5">
              <div className="font-semibold text-text-primary text-sm mb-2">
                Statement Executed Successfully
              </div>
              {Object.entries(results).map(([key, val]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-text-secondary">{key}:</span>
                  <span className="text-text-primary font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-xs font-semibold text-text-primary mb-1">
              Query executed successfully
            </p>
            <p className="text-xs text-text-secondary font-mono">
              No rows returned. (0 rows)
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead className="sticky top-0 z-10 bg-surface-muted border-b border-border shadow-subtle">
              <tr>
                <th className="w-12 px-3 py-2 text-[10px] font-semibold text-text-muted border-r border-border select-none text-center">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-[11px] font-semibold text-text-primary border-r border-border last:border-r-0 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-surface-muted/60 transition-colors"
                >
                  <td className="px-3 py-2 text-[10px] text-text-muted border-r border-border text-center select-none bg-surface-muted/30">
                    {rowIdx + 1}
                  </td>
                  {columns.map((col) => {
                    const value = row[col];
                    const isNull = value === null || value === undefined;

                    return (
                      <td
                        key={col}
                        className="px-3 py-2 border-r border-border last:border-r-0 whitespace-nowrap max-w-xs truncate text-text-primary select-text"
                        title={isNull ? 'NULL' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      >
                        {isNull ? (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface-subtle text-text-muted italic border border-border">
                            NULL
                          </span>
                        ) : typeof value === 'boolean' ? (
                          <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${value ? 'bg-status-success-bg text-status-success' : 'bg-status-error-bg text-status-error'}`}>
                            {value ? 'TRUE' : 'FALSE'}
                          </span>
                        ) : typeof value === 'object' ? (
                          JSON.stringify(value)
                        ) : (
                          String(value)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Result Footer */}
      <div className="h-6 px-3 border-t border-border bg-surface-muted flex items-center justify-between text-[10px] font-mono text-text-secondary select-none">
        <span>Columns: {columns.length}</span>
        <span>Rendered: {rows.length} records</span>
      </div>
    </div>
  );
};

export default ResultTable;
