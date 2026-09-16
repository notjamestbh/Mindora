// Audio playback & synthesis engine for person voice recognition in Mindora
// Supports recorded audio clips (data URIs / audio URLs) with fallback to SpeechSynthesis

let currentAudio = null;
let isSpeaking = false;

/**
 * Voice persona presets for family members
 */
export const VOICE_PROFILES = {
  daughter: {
    label: "Daughter / Warm Soprano",
    pitch: 1.15,
    rate: 0.9,
    defaultGreeting: "Namaste Amma! It's Anu. I made some warm ginger tea for you and brought fresh leaves from the garden."
  },
  son: {
    label: "Son / Gentle Baritone",
    pitch: 0.85,
    rate: 0.92,
    defaultGreeting: "Hello Amma, it's Arun calling from Guwahati! How was your morning walk today?"
  },
  grandchild: {
    label: "Grandchild / Playful Child",
    pitch: 1.35,
    rate: 0.95,
    defaultGreeting: "Amma! It's Maya! Look at the colorful bird I drew for you today! Can you tell me a story?"
  },
  husband: {
    label: "Husband / Calm Elder",
    pitch: 0.8,
    rate: 0.85,
    defaultGreeting: "Good morning, Lakshmi. The morning breeze on the verandah is so calm today."
  },
  friend: {
    label: "Friend / Warm Companion",
    pitch: 1.0,
    rate: 0.9,
    defaultGreeting: "Hello Lakshmi, hope you are having a peaceful and relaxing morning."
  }
};

/**
 * Stops any currently playing audio clip or active speech synthesis
 */
export const stopAllVoices = () => {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // Ignore audio error
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore synthesis error
    }
  }

  isSpeaking = false;
};

/**
 * Returns whether any voice is currently playing
 */
export const isVoicePlaying = () => {
  return isSpeaking;
};

/**
 * Plays a person's voice clip.
 * Prioritizes recorded audio clip (HTML5 Audio).
 * Falls back to SpeechSynthesis with tailored pitch and warm Indian/natural voice.
 *
 * @param {Object} person - The person memory object
 * @param {Object} callbacks - { onStart, onEnd, onError }
 * @returns {Object} { stop: Function }
 */
export const playPersonVoice = (person, { onStart, onEnd, onError } = {}) => {
  stopAllVoices();

  if (!person) {
    if (onEnd) onEnd();
    return { stop: stopAllVoices };
  }

  // 1. If custom recorded/uploaded audio is present
  if (person.voiceAudioUrl && typeof Audio !== 'undefined') {
    try {
      isSpeaking = true;
      const audio = new Audio(person.voiceAudioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        isSpeaking = true;
        if (onStart) onStart();
      };

      audio.onended = () => {
        isSpeaking = false;
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn("Audio file playback error, falling back to speech synthesis:", err);
        currentAudio = null;
        // Fallback to synthesis
        speakPersonGreeting(person, { onStart, onEnd, onError });
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio play rejected (possible autoplay block), falling back to synthesis:", err);
          currentAudio = null;
          speakPersonGreeting(person, { onStart, onEnd, onError });
        });
      }

      return { stop: stopAllVoices };
    } catch (e) {
      console.warn("Audio creation failed, falling back to speech synthesis:", e);
      currentAudio = null;
    }
  }

  // 2. Fallback: Speak person greeting via SpeechSynthesis
  speakPersonGreeting(person, { onStart, onEnd, onError });
  return { stop: stopAllVoices };
};

/**
 * Synthesizes a person's spoken greeting with custom pitch and pace
 */
const speakPersonGreeting = (person, { onStart, onEnd, onError } = {}) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onError) onError("Speech synthesis not supported");
    if (onEnd) onEnd();
    return;
  }

  try {
    const greetingText = person.voiceGreeting ||
      (person.relation
        ? `Namaste Amma! This is ${person.name}, your ${person.relation}. Thinking of you warmly today.`
        : `Namaste Amma! This is ${person.name}. Wishing you a wonderful and peaceful day.`);

    const utterance = new SpeechSynthesisUtterance(greetingText);
    utterance.pitch = typeof person.voicePitch === 'number' ? person.voicePitch : 1.0;
    utterance.rate = typeof person.voiceRate === 'number' ? person.voiceRate : 0.88;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const voiceCandidate = voices.find(v =>
      (v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US')) &&
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Rishi'))
    );
    if (voiceCandidate) {
      utterance.voice = voiceCandidate;
    }

    utterance.onstart = () => {
      isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      isSpeaking = false;
      if (onError) onError(e);
      if (onEnd) onEnd();
    };

    isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    isSpeaking = false;
    console.warn("Error in speakPersonGreeting:", err);
    if (onError) onError(err);
    if (onEnd) onEnd();
  }
};
