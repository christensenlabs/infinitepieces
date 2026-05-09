import { useState, useEffect, useRef, useCallback } from 'react';
import { callGemini } from '../lib/gemini';

/**
 * Voice-to-AI copilot hook. Provides speech recognition + Gemini AI response.
 * @param {string} apiKey - Gemini API key
 * @param {string} role - User role (e.g. 'BCBA', 'RBT') to tailor system prompt
 */
export function useInfiniteCopilot(apiKey, role) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState('');

  const recognitionRef = useRef(null);
  const processAIIntentRef = useRef(null);

  const processAIIntent = useCallback(async (spokenText) => {
    setIsProcessing(true);
    let systemText = 'You are the Infinite OS AI.';
    if (role === 'BCBA') systemText = 'You are an elite BCBA-D Copilot.';

    try {
      const result = await callGemini(`User said: "${spokenText}"`, apiKey, systemText);
      setAiResponse(result);
    } catch {
      setVoiceError('Network error. AI unavailable.');
      setTimeout(() => setVoiceError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, role]);

  useEffect(() => {
    processAIIntentRef.current = processAIIntent;
  }, [processAIIntent]);

  useEffect(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let final = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) final += event.results[i][0].transcript;
          }
          if (final) {
            setTranscript(final.trim());
            processAIIntentRef.current(final.trim());
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    } catch (e) {
      console.warn('Speech recognition setup failed.', e);
    }
  }, [role]);

  const startListening = useCallback(() => {
    if (!apiKey) {
      setVoiceError('AI Disabled: Missing API Key. Set it in Settings.');
      setTimeout(() => setVoiceError(''), 3000);
      return;
    }
    if (recognitionRef.current) {
      setTranscript('');
      setAiResponse('');
      setVoiceError('');
      setIsListening(true);
      try { recognitionRef.current.start(); } catch { /* already started */ }
    }
  }, [apiKey]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { startListening, stopListening, isListening, transcript, aiResponse, isProcessing, voiceError };
}
