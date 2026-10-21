import { useState, useEffect, useRef, useCallback } from 'react';

export const SUPPORTED_VOICE_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'en-IN', label: 'Hinglish / English (India)', flag: '🇮🇳' },
  { code: 'gu-IN', label: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
  { code: 'mr-IN', label: 'Marathi (मराठी)', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)', flag: '🇮🇳' },
  { code: 'te-IN', label: 'Telugu (తెలుగు)', flag: '🇮🇳' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)', flag: '🇮🇳' },
  { code: 'pa-IN', label: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
  { code: 'en-US', label: 'English (US)', flag: '🌐' },
];

/**
 * Custom React hook for Voice-to-Text transcription
 * Leverages native Web Speech API with regional Indian dialect support.
 *
 * @param {Object} options
 * @param {string} [options.defaultLanguage='hi-IN'] - Default recognition language code
 * @param {function} [options.onTranscriptUpdate] - Callback when speech chunk arrives
 */
export function useVoiceInput({
  defaultLanguage = 'hi-IN',
  onTranscriptUpdate = null,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [isSupported, setIsSupported] = useState(true);
  const [voiceError, setVoiceError] = useState(null);

  const recognitionRef = useRef(null);
  const isManuallyStoppedRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Stop listening cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort
        }
      }
    };
  }, []);

  const startListening = useCallback(
    (customCallback) => {
      setVoiceError(null);
      const SpeechRecognition =
        typeof window !== 'undefined' &&
        (window.SpeechRecognition || window.webkitSpeechRecognition);

      if (!SpeechRecognition) {
        setIsSupported(false);
        setVoiceError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        isManuallyStoppedRef.current = false;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError(null);
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptChunk;
            } else {
              interimTranscript += transcriptChunk;
            }
          }

          const activeText = finalTranscript || interimTranscript;
          if (activeText) {
            if (customCallback) {
              customCallback(activeText, event.results[event.results.length - 1].isFinal);
            } else if (onTranscriptUpdate) {
              onTranscriptUpdate(activeText, event.results[event.results.length - 1].isFinal);
            }
          }
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech') {
            // Ignore brief pauses in speech
            return;
          }
          if (event.error === 'not-allowed') {
            const isPlainHttpLan =
              typeof window !== 'undefined' &&
              window.location.protocol === 'http:' &&
              window.location.hostname !== 'localhost' &&
              window.location.hostname !== '127.0.0.1';

            if (isPlainHttpLan) {
              setVoiceError(
                'Mobile browsers block microphone access over plain HTTP (192.168.x.x) for security. Microphone requires HTTPS or localhost.'
              );
            } else {
              setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser.');
            }
          } else {
            setVoiceError(`Voice error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        setVoiceError(err.message || 'Could not start microphone');
        setIsListening(false);
      }
    },
    [selectedLanguage, onTranscriptUpdate]
  );

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(
    (customCallback) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(customCallback);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isListening,
    isSupported,
    voiceError,
    selectedLanguage,
    setSelectedLanguage,
    startListening,
    stopListening,
    toggleListening,
    supportedLanguages: SUPPORTED_VOICE_LANGUAGES,
  };
}
