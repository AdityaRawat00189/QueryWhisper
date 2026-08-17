import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import Button from './Button';

const sampleQueries = [
  { label: 'Select users', sql: 'SELECT * FROM users LIMIT 10;' },
  { label: 'Count users', sql: 'SELECT COUNT(*) AS total_users FROM users;' },
  { label: 'Show tables', sql: 'SHOW TABLES;' },
  { label: 'Active check', sql: 'SELECT 1 AS status;' },
];

export const QueryEditor = ({
  query,
  onChange,
  onRun,
  isLoading = false,
  disabled = false,
}) => {
  // Handle keydown inside the editor wrapper to catch Ctrl+Enter / Cmd+Enter
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading && !disabled && query.trim()) {
          onRun();
        }
      }
    },
    [isLoading, disabled, query, onRun]
  );

  const handleClear = () => {
    onChange('');
  };

  const handlePresetSelect = (sqlString) => {
    onChange(sqlString);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-border rounded-lg overflow-hidden shadow-card">
      {/* Editor Header Toolbar */}
      <div className="h-10 px-3 border-b border-border bg-surface-muted flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            SQL Editor
          </span>
          <span className="text-[11px] font-mono text-text-muted hidden sm:inline-block">
            PostgreSQL / MySQL
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Preset Queries Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded hover:bg-surface-subtle transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Snippets</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-48 bg-white border border-border rounded-md shadow-dropdown z-20 py-1">
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(item.sql)}
                  className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-surface-muted font-mono transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={!query || isLoading}
            className="p-1.5 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:hover:text-text-secondary rounded hover:bg-surface-subtle transition-colors cursor-pointer"
            title="Clear editor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Run Query Primary Button */}
          <Button
            size="sm"
            onClick={onRun}
            isLoading={isLoading}
            disabled={disabled || !query.trim()}
            icon={isLoading ? null : Play}
            className="font-medium"
          >
            {isLoading ? 'Running...' : 'Run Query'}
          </Button>
        </div>
      </div>

      {/* Editor Main Surface */}
      <div
        className="flex-1 overflow-hidden relative"
        onKeyDown={handleKeyDown}
      >
        <CodeMirror
          value={query}
          height="100%"
          extensions={[sql()]}
          onChange={onChange}
          theme="light"
          placeholder="-- Enter your SQL query here (e.g. SELECT * FROM users;)"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: false,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: false,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: false,
            completionKeymap: true,
            lintKeymap: false,
          }}
          className="h-full text-sm font-mono"
        />
      </div>

      {/* Editor Footer Bar */}
      <div className="h-7 px-3 border-t border-border bg-surface-muted flex items-center justify-between text-[11px] text-text-secondary select-none font-mono">
        <div className="flex items-center gap-3">
          <span>Lines: {query ? query.split('\n').length : 0}</span>
          <span>Chars: {query.length}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <kbd className="px-1 py-0.5 rounded bg-surface-subtle border border-border">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1 py-0.5 rounded bg-surface-subtle border border-border">Enter</kbd>
          <span className="ml-1">to run</span>
        </div>
      </div>
    </div>
  );
};

export default QueryEditor;
