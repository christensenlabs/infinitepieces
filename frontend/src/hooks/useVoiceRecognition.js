import { useState, useEffect, useRef } from 'react';

/**
 * Hook for browser speech recognition.
 * Appends recognized speech to the current value via onChange.
 */
export function useVoiceRecognition(value, onChange) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const currentVal = valueRef.current || '';
          const space = (currentVal && !currentVal.endsWith(' ')) ? ' ' : '';
          onChangeRef.current({ target: { value: currentVal + space + finalTranscript.trim() } });
        }
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      recognition.onend = () => { setIsRecording(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        setVoiceError('Voice dictation is not supported in this browser.');
        setTimeout(() => setVoiceError(''), 3000);
        return;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return { isRecording, toggleRecording, voiceError };
}
