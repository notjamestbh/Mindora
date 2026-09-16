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

  // 3. Add Reminder or Medicine
  const addReminderMatch = query.match(/(?:add reminder for|remind me to|add medicine|add prescription) (.+) at (.+)/i);
  if (addReminderMatch) {
    const title = addReminderMatch[1].trim();
    const time = addReminderMatch[2].trim();
    const isMed = title.includes('pill') || title.includes('medicine') || title.includes('tablet') || query.includes('medicine') || query.includes('prescription');
    const newRem = {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      time: time.toUpperCase(),
      category: isMed ? 'medication' : 'wellness',
      notes: 'Added by voice request.'
    };
    if (isMed) {
      newRem.frequency = 'Once daily';
      newRem.dosage = '1 Tablet';
    }
    addReminder(newRem);
    return {
      text: `I have added ${isMed ? 'medicine' : 'a reminder for'} ${title} scheduled for ${time}.`,
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
    const allMeds = reminders.filter(r => r.category === 'medication');
    if (allMeds.length === 0) {
      return {
        text: "You have no medicines scheduled for today. Rest comfortably and enjoy your day.",
        action: "/today"
      };
    }

    const pendingMeds = allMeds.filter(r => !r.completed);
    const takenMeds = allMeds.filter(r => r.completed);

    if (pendingMeds.length === 0) {
      const takenSummary = takenMeds.map(m => m.title).join(', ');
      return {
        text: `You have taken all your scheduled medicines for today (${takenSummary}). Well done!`,
        action: "/today"
      };
    }

    const nextMed = pendingMeds[0];
    let details = `${nextMed.title} scheduled for ${nextMed.time}`;
    if (nextMed.frequency) details += ` (${nextMed.frequency})`;
    if (nextMed.dosage) details += `, dosage: ${nextMed.dosage}`;

    let responseText = `Your upcoming medicine is ${details}.`;
    if (nextMed.notes) {
      responseText += ` Note: ${nextMed.notes}.`;
    } else {
      responseText += ` Please have a glass of warm water ready.`;
    }

    if (pendingMeds.length > 1) {
      responseText += ` You also have ${pendingMeds.length - 1} more medicine scheduled later today.`;
    }

    return {
      text: responseText,
      action: "/today"
    };
  }

  // 3. Dynamic Memory Lookup (Matches any Person, Place, Thing, or Moment in storage)
  const matchedMemory = memories.find(m => {
    const nameLower = (m.name || '').toLowerCase();
    const relLower = (m.relation || '').toLowerCase();
    // Match by person/place name
    if (nameLower && query.includes(nameLower)) return true;
    // Match by relationship / category keyword (if >= 3 characters)
    if (relLower && relLower.length >= 3 && query.includes(relLower)) return true;
    return false;
  });

  if (matchedMemory) {
    const isPerson = matchedMemory.type === 'person' || matchedMemory.category === 'people';
    let text = "";
    if (isPerson) {
      text = `${matchedMemory.name} is your ${matchedMemory.relation || 'family member'}. ${matchedMemory.description}`;
      if (matchedMemory.voiceGreeting) {
        text += ` ${matchedMemory.name}'s voice greeting says: "${matchedMemory.voiceGreeting}"`;
      }
    } else {
      text = `${matchedMemory.name} (${matchedMemory.relation || 'cherished memory'}): ${matchedMemory.description}`;
    }

    return {
      text,
      action: "/memory",
      actionLabel: `View ${matchedMemory.name} in Memories`
    };
  }

  // 4. Broad Family Query: "tell me about my family", "who are my family", "loved ones"
  if (
    query.includes('family') ||
    query.includes('relative') ||
    query.includes('children') ||
    query.includes('kids') ||
    query.includes('loved one') ||
    query.includes('who are my')
  ) {
    const familyMembers = memories.filter(m => m.type === 'person' || m.category === 'people');
    if (familyMembers.length > 0) {
      const namesList = familyMembers.map(m => `${m.name} (${m.relation || 'Family'})`).join(', ');
      return {
        text: `In your family circle, you have ${namesList}. Would you like to hear more about any of them, or listen to their voice in 'Who's Speaking?'?`,
        action: "/memory",
        actionLabel: "View Family Memories"
      };
    }
  }

  // 5. Show memories / photos
  if (
    query.includes('memory') ||
    query.includes('memories') ||
    query.includes('photo') ||
    query.includes('pictures') ||
    query.includes('album')
  ) {
    const familyCount = memories.filter(m => m.type === 'person' || m.category === 'people').length;
    const placesCount = memories.filter(m => m.type === 'place' || m.category === 'places').length;
    return {
      text: `You have ${memories.length} cherished memories saved—including ${familyCount} loving family members and ${placesCount} familiar places. You can tap below to view your album or play 'Who Is This?'.`,
      action: "/memory",
      actionLabel: "Open My Memory"
    };
  }

  // 6. Voice game / Who's speaking / Recognize voice
  if (
    query.includes('voice') ||
    query.includes('speaking') ||
    query.includes('whose voice') ||
    query.includes('who is speaking') ||
    query.includes('hear voice')
  ) {
    return {
      text: "Let's play 'Who's Speaking?'! You can listen to familiar voices of your loved ones and recognize who is talking.",
      action: "/game/whos-speaking",
      actionLabel: "Play Who's Speaking"
    };
  }

  // 7. Play game / activity
  if (query.includes('play') || query.includes('game') || query.includes('activity') || query.includes('exercise')) {
    return {
      text: "Let's play an activity! 'Who's Speaking?', Memory Match, and 'Who Is This?' are ready for you right now.",
      action: "/play",
      actionLabel: "Choose an Activity"
    };
  }

  // 8. Time / Day
  if (query.includes('time') || query.includes('day') || query.includes('date')) {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      text: `Today is ${dayName}. The current time is ${timeString}.`,
      action: "/today"
    };
  }

  // 9. Friendly Greetings ("hello", "hi", "namaste", "good morning")
  if (
    query.includes('hello') ||
    query.includes('hi') ||
    query.includes('namaste') ||
    query.includes('hey') ||
    query.includes('good morning') ||
    query.includes('good afternoon') ||
    query.includes('good evening')
  ) {
    const hour = new Date().getHours();
    const greetingTime = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const name = patient?.name || "Amma";
    return {
      text: `${greetingTime}, ${name}! It is wonderful to talk with you. How are you feeling right now? We can review your schedule, talk about your family, or play a relaxing memory game.`,
      action: null
    };
  }

  // 10. Companion Identity & Capabilities ("who are you", "what can you do", "help")
  if (
    query.includes('who are you') ||
    query.includes('what can you do') ||
    query.includes('how are you') ||
    query.includes('help')
  ) {
    return {
      text: `I am Mindora, your everyday cognitive companion. I'm here to gently remind you of medicines and routines, share family memories, and play relaxing memory exercises with you. What would you like to do?`,
      action: null
    };
  }

  // --- REVAMPED DYNAMIC EMPATHETIC FALLBACKS ---
  // When query is not specifically recognized, choose from a pool of varied, supportive prompts
  const name = patient?.name || "Amma";
  const familyMembers = memories.filter(m => m.type === 'person' || m.category === 'people');
  const samplePerson = familyMembers.length > 0
    ? familyMembers[Math.floor(Math.random() * familyMembers.length)]
    : null;
  const pendingRoutines = reminders.filter(r => !r.completed);
  const nextRoutine = pendingRoutines.length > 0 ? pendingRoutines[0] : null;

  const fallbackResponses = [
    {
      text: `I'm listening gently, ${name}. You can ask me about your schedule${nextRoutine ? ` (like your ${nextRoutine.title} at ${nextRoutine.time})` : ''}, or ask me about ${samplePerson ? samplePerson.name : 'your family'}. What sounds comforting to you?`,
      action: nextRoutine ? "/today" : "/memory",
      actionLabel: nextRoutine ? "View Today's Routine" : "View Memories"
    },
    {
      text: `I am right here with you, ${name}. There is never any rush. Would you like to hear a family memory${samplePerson ? ` of ${samplePerson.name}` : ''}, or shall we play 'Who's Speaking?' together?`,
      action: "/game/whos-speaking",
      actionLabel: "Play Who's Speaking"
    },
    {
      text: `Take your time, ${name}. You can ask me 'When is my next medicine?', 'Tell me about ${samplePerson ? samplePerson.name : 'my family'}', or say 'Let's play a game'. How can I help you right now?`,
      action: "/today",
      actionLabel: "Check Today's Schedule"
    },
    {
      text: `I didn't quite catch that, but I'm right by your side, ${name}. Would you like to check your daily routine progress or listen to familiar voices in your memory album?`,
      action: "/memory",
      actionLabel: "Open Memories"
    },
    {
      text: `Every moment at your own peaceful pace, ${name}. You can ask me to summarize your cognitive stats, check your evening pills, or look at your family photos. What sounds best?`,
      action: "/caregiver",
      actionLabel: "View Activity Stats"
    }
  ];

  // Rotate response pseudo-randomly based on query length and minute
  const chosenIndex = (query.length + new Date().getMinutes()) % fallbackResponses.length;
  return fallbackResponses[chosenIndex];
};
