import { useState, useEffect } from 'react';
import type { TourStep } from '../components/Tour';

export const useTour = (apiKey: string | undefined) => {
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [tourIdx, setTourIdx] = useState<number>(0);

  const tourSteps: TourStep[] = [
    { target: "#model-dd", title: "Model", desc: "Choose a Gemini model. Fast — flash, smart — pro.", placement: "bottom" },
    { target: "[data-tour='temperature']", title: "Temperature", desc: "Higher — more creative, lower — more stable.", placement: "bottom" },
    { target: "[data-tour='output']", title: "Max response tokens", desc: "Limit the length of the output. Slider + number.", placement: "bottom" },
    { target: "[data-tour='system-btn']", title: "System prompt", desc: "Customize how the AI assistant behaves and responds globally.", placement: "bottom" },
    { target: "[data-tour='key-btn']", title: "API key", desc: "Click here to paste your AI Studio key.", placement: "bottom" },
    { target: "[data-tour='theme-toggle']", title: "Dark/Light theme", desc: "Is your eyes tired? Toggle it.", placement: "bottom" },
    { target: "[data-tour='new-chat']", title: "New chat", desc: "Creates a fresh conversation. The title will be auto-generated later.", placement: "bottom" },
    { target: "[data-tour='composer']", title: "Input field", desc: "Write your question. Enter — send, Shift+Enter — new line.", placement: "top" },
    { target: "[data-tour='send-btn']", title: "Send", desc: "Type here — I'll respond. During streaming, you'll see Stop here.", placement: "bottom" },
  ];

  // Auto-start tour once
  useEffect(() => {
    if (!localStorage.getItem("odaba_tour_shown")) {
      // Show tour only if user has already inserted API key
      if (apiKey) {
        setTourOpen(true);
        localStorage.setItem("odaba_tour_shown", "1");
      }
    }
  }, [apiKey]);

  const startTour = () => {
    setTourIdx(0);
    setTourOpen(true);
  };

  const closeTour = () => {
    setTourOpen(false);
  };

  const nextStep = (index: number) => {
    setTourIdx(index);
  };

  return {
    tourOpen,
    tourIdx,
    tourSteps,
    startTour,
    closeTour,
    nextStep,
  };
};
