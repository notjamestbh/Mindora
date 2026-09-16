// Speech synthesis & recognition utilities for Mindora
import { getReminders, getMemories, getPatient, addMemory, deleteMemory, editMemory, addReminder, deleteReminder, editReminder } from './storage';
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

  // --- MUTATIVE ACTIONS ---

  // 1. Add Memory
  const addMemoryMatch = query.match(/add (?:a )?memory (?:of|for) (.+)/i);
  if (addMemoryMatch) {
    const name = addMemoryMatch[1].trim();
    // basic capitalization
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    addMemory({
      name: formattedName,
      category: 'people',
      relation: 'Added via Voice',
      description: `A new memory of ${formattedName} added by voice assistant.`,
      avatarUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' // default tea hills
    });
    return {
      text: `I have added a new memory for ${formattedName}. It is now in your memory library.`,
      action: "/memory"
    };
  }

  // 2. Delete Memory
  const deleteMemoryMatch = query.match(/(?:remove|delete) memory (?:of|for) (.+)/i);
  if (deleteMemoryMatch) {
    const name = deleteMemoryMatch[1].trim();
    const mem = memories.find(m => m.name.toLowerCase() === name);
    if (mem) {
      deleteMemory(mem.id);
      return { text: `I have removed the memory for ${mem.name}.`, action: "/memory" };
    }
    return { text: `I couldn't find a memory for ${name} to remove.`, action: "/memory" };
  }

  // 3. Add Reminder
  const addReminderMatch = query.match(/(?:add reminder for|remind me to) (.+) at (.+)/i);
  if (addReminderMatch) {
    const title = addReminderMatch[1].trim();
    const time = addReminderMatch[2].trim();
    addReminder({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      time: time.toUpperCase(), // basic am/pm capitalization
      category: title.includes('pill') || title.includes('medicine') ? 'medication' : 'wellness',
      notes: 'Added by voice request.'
    });
    return {
      text: `I have added a reminder to ${title} at ${time}.`,
      action: "/today"
    };
  }

  // 4. Edit Reminder Time
  const editReminderMatch = query.match(/change (.+) time to (.+)/i);
  if (editReminderMatch) {
    const title = editReminderMatch[1].trim();
    const time = editReminderMatch[2].trim();
    const rem = reminders.find(r => r.title.toLowerCase().includes(title));
    if (rem) {
      editReminder(rem.id, { time: time.toUpperCase() });
      return { text: `I have changed the time for ${rem.title} to ${time}.`, action: "/today" };
    }
    return { text: `I couldn't find a routine matching ${title}.`, action: "/today" };
  }

  // 5. Delete Reminder
  const deleteReminderMatch = query.match(/(?:remove|delete) (.+) reminder/i);
  if (deleteReminderMatch) {
    const title = deleteReminderMatch[1].trim();
    const rem = reminders.find(r => r.title.toLowerCase().includes(title));
    if (rem) {
      deleteReminder(rem.id);
      return { text: `I have removed the reminder for ${rem.title}.`, action: "/today" };
    }
    return { text: `I couldn't find a reminder for ${title} to remove.`, action: "/today" };
  }

  // --- READ ACTIONS ---

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

  // 7.5 Voice game / Who's speaking / Recognize voice
  if (
    query.includes('voice') ||
    query.includes('speaking') ||
    query.includes('whose voice') ||
    query.includes('who is speaking') ||
    query.includes('hear anu') ||
    query.includes('hear arun') ||
    query.includes('hear maya') ||
    query.includes('hear ravi')
  ) {
    return {
      text: "Let's play 'Who's Speaking?'! You can listen to familiar voices of your loved ones and recognize who is talking.",
      action: "/game/whos-speaking",
      actionLabel: "Play Who's Speaking"
    };
  }

  // 8. Play game / activity
  if (query.includes('play') || query.includes('game') || query.includes('activity') || query.includes('exercise')) {
    return {
      text: "Let's play an activity! 'Who's Speaking?', Memory Match and 'Who Is This?' are ready for you right now.",
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
