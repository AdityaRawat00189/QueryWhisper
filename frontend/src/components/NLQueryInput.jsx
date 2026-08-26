import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send, Loader2, Mic, MicOff } from 'lucide-react';
import useVoiceInput from '../hooks/useVoiceInput';

export const NLQueryInput = ({
  onSubmit,
  isLoading = false,
  disabled = false,
  initialValue = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const textareaRef = useRef(null);

  // --- Voice input integration ---
  // When voice recognition finishes, fill the textarea and auto-submit
  // through the same /execute-query pipeline as typed queries.
  const handleVoiceResult = useCallback(
    (finalTranscript) => {
      setQuery(finalTranscript);
      // Auto-submit voice transcript through the existing execute-query route
      onSubmit?.(finalTranscript);
    },
    [onSubmit]
  );

  const {
    isListening,
    interimTranscript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useVoiceInput({ onResult: handleVoiceResult });

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Sync with external value changes (e.g. clicking history item)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Show interim (partial) transcript live while speaking
  const displayValue = isListening && interimTranscript ? interimTranscript : query;

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [displayValue]);

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
    <div
      className={`w-full bg-white border rounded-lg shadow-card overflow-hidden transition-all duration-300 ${
        isListening ? 'voice-listening-card' : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="h-10 px-4 border-b border-border bg-surface-muted flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            Ask in Natural Language
          </span>
          {isListening && (
            <span className="inline-flex items-center gap-1.5 ml-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 voice-dot-blink" />
              <span className="text-[10px] font-semibold text-red-600 tracking-wide uppercase">
                Listening
              </span>
            </span>
          )}
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
          value={displayValue}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Speak now...'
              : 'Ask your database anything... e.g. "Show me all teachers and their department names"'
          }
          disabled={isLoading || disabled || isListening}
          rows={1}
          className={`flex-1 resize-none text-sm bg-transparent outline-none leading-relaxed disabled:cursor-not-allowed transition-colors duration-200 ${
            isListening
              ? 'text-red-600 placeholder:text-red-300'
              : 'text-text-primary placeholder:text-text-muted disabled:opacity-50'
          }`}
          style={{ minHeight: '24px', maxHeight: '160px' }}
        />

        {/* Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={!isVoiceSupported || isLoading || disabled}
          title={
            !isVoiceSupported
              ? 'Voice input is not supported in this browser'
              : isListening
                ? 'Stop listening'
                : 'Start voice input'
          }
          className={`shrink-0 relative inline-flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-red-500 text-white shadow-lg animate-pulse-ring scale-110'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border hover:border-border-strong hover:shadow-subtle'
          }`}
        >
          {!isVoiceSupported ? (
            <MicOff className="w-4 h-4" />
          ) : isListening ? (
            /* Animated sound wave bars when listening */
            <span className="flex items-center gap-[3px]">
              <span className="voice-wave-bar" />
              <span className="voice-wave-bar" />
              <span className="voice-wave-bar" />
              <span className="voice-wave-bar" />
            </span>
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Ask / Submit Button */}
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

      {/* Voice Error Feedback */}
      {voiceError && (
        <div className="px-4 pb-3">
          <p className="text-xs text-status-error">{voiceError}</p>
        </div>
      )}

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
