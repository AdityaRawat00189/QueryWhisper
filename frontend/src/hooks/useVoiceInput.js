import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Check if the Web Speech API is available in the current browser.
 * Chrome exposes it as webkitSpeechRecognition; standard is SpeechRecognition.
 */
const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

/**
 * useVoiceInput — a reusable hook for browser-based speech-to-text.
 *
 * @param {Object}  options
 * @param {string}  [options.lang='en-US']          Recognition language
 * @param {boolean} [options.continuous=false]       Keep listening after pauses
 * @param {boolean} [options.interimResults=true]    Show partial results while speaking
 * @param {Function} [options.onResult]              Callback fired with final transcript
 *
 * @returns {{ isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript }}
 */
export const useVoiceInput = ({
  lang = 'en-US',
  continuous = false,
  interimResults = true,
  onResult,
} = {}) => {
  const SpeechRecognition = getSpeechRecognition();
  const isSupported = !!SpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  // Keep callback ref fresh without re-creating the recognition instance
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Tear down any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
      }

      if (finalText) {
        setTranscript(finalText);
        setInterimTranscript('');
        onResultRef.current?.(finalText);
      }
    };

    recognition.onerror = (event) => {
      // 'aborted' is expected when we manually stop — don't treat as error
      if (event.error === 'aborted') return;

      const messages = {
        'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
        'no-speech': 'No speech detected. Please try again.',
        'network': 'Network error occurred during speech recognition.',
        'audio-capture': 'No microphone found. Please check your audio input device.',
      };

      setError(messages[event.error] || `Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, SpeechRecognition, lang, continuous, interimResults]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useVoiceInput;
