import React, { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export const GeneratedSQL = ({ sqlQuery, isVisible = true }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!sqlQuery || !isVisible) return null;

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(sqlQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy to clipboard', e);
    }
  };

  return (
    <div className="w-full bg-white border border-border rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-9 px-4 border-b border-border bg-surface-muted flex items-center justify-between select-none hover:bg-surface-subtle transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-status-success" />
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            Generated SQL
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="inline-flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded hover:bg-white transition-colors"
              title="Copy SQL to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-status-success" />
                  <span className="text-status-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </div>
      </button>

      {/* SQL Code Block */}
      {isExpanded && (
        <div className="p-4 bg-[#FAFBFC] overflow-x-auto">
          <pre className="text-xs font-mono text-text-primary leading-relaxed whitespace-pre-wrap break-words select-text">
            <code>{sqlQuery}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default GeneratedSQL;
