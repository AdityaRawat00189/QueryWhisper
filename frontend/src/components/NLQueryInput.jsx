import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

export const NLQueryInput = ({
  onSubmit,
  isLoading = false,
  disabled = false,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const textareaRef = useRef(null);

  // Sync with external value changes (e.g. clicking history item)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [query]);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed || isLoading || disabled) return;
    onSubmit(trimmed);
  }, [query, isLoading, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="w-full bg-white border border-border rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <div className="h-10 px-4 border-b border-border bg-surface-muted flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            Ask in Natural Language
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono">
          <kbd className="px-1 py-0.5 rounded bg-surface-subtle border border-border">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1 py-0.5 rounded bg-surface-subtle border border-border">Enter</kbd>
          <span className="ml-1">to run</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-end gap-3 p-4">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your database anything... e.g. &quot;Show me all teachers and their department names&quot;"
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 resize-none text-sm text-text-primary placeholder:text-text-muted bg-transparent outline-none leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '24px', maxHeight: '160px' }}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isLoading || disabled}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover active:bg-black transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand shadow-subtle cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-surface-muted overflow-hidden">
          <div className="h-full bg-brand animate-pulse rounded-full" style={{ width: '60%' }} />
        </div>
      )}
    </div>
  );
};

export default NLQueryInput;
