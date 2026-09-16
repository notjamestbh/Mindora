// Speech synthesis & recognition utilities for Mindora
import { getReminders, getMemories, getPatient } from './storage';
import { generateSpokenStatsSummary, getFullStatsSummary } from './statsSummary';

/**
 * Checks if Speech Recognition is supported in the current browser
 */
export const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return ! !(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Creates and starts a SpeechRecognition instance with callbacks
 */
export const createSpeechRecognizer = ({ onResult, onError, onEnd, onStart }) => {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // Indian English / natural regional accent

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};

/**
 * Speaks text aloud using window.speechSynthesis
 */
export const speakText = (text, onEnd) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, calm cadence for elderly comprehension
    utterance.pitch = 1.0;

    // Pick a warm voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis error:", e);
  }
};

/**
 * Matches user voice query to rich, reassuring responses based on current patient data
 */
export const getAssistantResponse = (userQuery) => {
  const query = (userQuery || '').toLowerCase().trim();
  const reminders = getReminders();
  const memories = getMemories();
  const patient = getPatient();

  // 0. Stats Summarization (Games, Routines, Cognitive Health)
  if (
    query.includes('stat') ||
    query.includes('summar') ||
    query.includes('score') ||
    query.includes('progress') ||
    query.includes('report') ||
    query.includes('how did i do') ||
    query.includes('how am i doing') ||
    query.includes('accuracy') ||
    query.includes('performance')
  ) {
    const summary = generateSpokenStatsSummary();
    return {
      text: summary.text,
      action: "/caregiver",
      actionLabel: "View Detailed Trends",
      statsData: summary.statsData,
      type: "stats"
    };
  }

  // 1. What do I have today / Schedule / Routine
  if (query.includes('today') || query.includes('schedule') || query.includes('routine') || query.includes('what do i have')) {
    const completed = reminders.filter(r => r.completed);
    const pending = reminders.filter(r => !r.completed);

    if (pending.length === 0) {
      return {
        text: "You have completed all your routines for today! Rest comfortably and enjoy your afternoon tea.",
        action: "/today"
      };
    }

    const nextOne = pending[0];
    return {
      text: `You have completed ${completed.length} routines so far. Next is your ${nextOne.title} scheduled for ${nextOne.time}.`,
      action: "/today"
    };
  }

  // 2. Medicine / Pills
  if (query.includes('medicine') || query.includes('tablet') || query.includes('pill') || query.includes('dose')) {
    const med = reminders.find(r => r.category === 'medication' && !r.completed);
    if (med) {
      return {
        text: `Your upcoming medicine is scheduled for ${med.time}. Please have a glass of warm water ready.`,
        action: "/today"
      };
    } else {
      return {
        text: "You have taken your scheduled morning medicine. Your evening tablet will be at 7:30 PM with warm milk.",
        action: "/today"
      };
    }
  }

  // 3. Daughter Anu / Family visits
  if (query.includes('anu') || query.includes('visiting') || query.includes('daughter') || query.includes('visit')) {
    return {
      text: "Your daughter Anu visits every Sunday morning. She will bring fresh tea leaves and enjoy a quiet verandah walk with you.",
      action: "/memory"
    };
  }

  // 4. Son Arun / Phone call
  if (query.includes('arun') || query.includes('son') || query.includes('call')) {
    return {
      text: "Your son Arun lives in Guwahati and calls every evening around 6:00 PM to ask about your day.",
      action: "/memory"
    };
  }

  // 5. Granddaughter Maya
  if (query.includes('maya') || query.includes('granddaughter') || query.includes('child')) {
    return {
      text: "Maya is your seven-year-old granddaughter. She loves drawing colorful birds and hearing your folk stories.",
      action: "/memory"
    };
  }

  // 6. Husband Ravi
  if (query.includes('ravi') || query.includes('husband')) {
    return {
      text: "Ravi was your loving husband and companion of 45 years. You shared many peaceful morning walks along the river.",
      action: "/memory"
    };
  }

  // 7. Show memories / photos
  if (query.includes('memory') || query.includes('memories') || query.includes('photo') || query.includes('pictures')) {
    return {
      text: `You have ${memories.length} cherished memories saved with Anu, Maya, Ravi, and your family home in Assam.`,
      action: "/memory"
    };
  }

  // 8. Play game / activity
  if (query.includes('play') || query.includes('game') || query.includes('activity') || query.includes('exercise')) {
    return {
      text: "Let's play an activity! Memory Match and 'Who Is This?' are ready for you right now.",
      action: "/play"
    };
  }

  // 9. Time / Day
  if (query.includes('time') || query.includes('day') || query.includes('date')) {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      text: `Today is ${dayName}. The current time is ${timeString}.`,
      action: "/today"
    };
  }

  // Default warm assistance
  return {
    text: "I am here with you, Amma. You can ask me about your medicine, today's schedule, or your family photos.",
    action: null
  };
};
