import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getMemories, addMemory } from '../utils/storage';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import { playPersonVoice, stopAllVoices } from '../utils/voicePlayer';
import { useStorageListener } from '../hooks/useStorageListener';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Heart,
  User,
  Plus,
  X,
  Mic,
  Sparkles,
  Repeat
} from 'lucide-react';
import VoiceRecorderBox from '../components/common/VoiceRecorderBox';
import ImageUploadBox from '../components/common/ImageUploadBox';
import './WhosSpeaking.css';

const DEFAULT_PEOPLE = [
  {
    id: 'p1',
    name: 'Anu',
    relation: 'Daughter',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    hint: 'Visits every Sunday with fresh tea',
    voiceProfile: 'daughter',
    voicePitch: 1.15,
    voiceRate: 0.88,
    voiceGreeting: "Namaste Amma! It's Anu. I made some warm ginger tea for you and brought fresh tea leaves from the garden."
  },
  {
    id: 'p2',
    name: 'Arun',
    relation: 'Son',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    hint: 'Calls every evening from Guwahati',
    voiceProfile: 'son',
    voicePitch: 0.85,
    voiceRate: 0.90,
    voiceGreeting: "Hello Amma, this is Arun calling from Guwahati! How was your morning walk today?"
  },
  {
    id: 'p3',
    name: 'Maya',
    relation: 'Granddaughter',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    hint: '7 years old, loves drawing birds',
    voiceProfile: 'grandchild',
    voicePitch: 1.35,
    voiceRate: 0.94,
    voiceGreeting: "Amma! It's Maya! Look at the colorful singing bird I drew for you today! Will you tell me a story?"
  },
  {
    id: 'p4',
    name: 'Ravi',
    relation: 'Husband',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    hint: 'Lifelong companion of 45 years',
    voiceProfile: 'husband',
    voicePitch: 0.78,
    voiceRate: 0.84,
    voiceGreeting: "Good morning, Lakshmi. The breeze on the verandah is so calm and peaceful today."
  }
];

export default function WhosSpeaking() {
  const diffInfo = getDifficulty();
  const [people, setPeople] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // { isCorrect: bool, message: string }
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoReplay, setAutoReplay] = useState(true);

  // Stats
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeSec, setTimeSec] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: 'Family Member',
    hint: '',
    avatarUrl: '',
    voiceAudioUrl: '',
    voiceGreeting: '',
    voiceProfile: 'daughter',
    voicePitch: 1.15
  });
  const [saveBanner, setSaveBanner] = useState(null);

  const timerRef = useRef(null);
  const autoReplayTimerRef = useRef(null);

  // Initialize Game
  const initGame = () => {
    stopAllVoices();
    const allMemories = getMemories();
    const familyMembers = allMemories.filter(m => m.type === 'person' || m.category === 'people');

    // Ensure we have at least 2-4 people
    const validPeople = familyMembers.length >= 2 ? familyMembers : DEFAULT_PEOPLE;

    // Shuffle order of people for varied gameplay
    const shuffledPeople = [...validPeople].sort(() => Math.random() - 0.5);

    setPeople(shuffledPeople);
    setCurrentIndex(0);
    setAttempts(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setWrongAnswers([]);
    setFeedback(null);
    setIsRevealed(false);
    setIsCompleted(false);
    setTimeSec(0);
    setStartTime(Date.now());

    generateRound(shuffledPeople, 0);
  };

  const generateRound = (list, index) => {
    stopAllVoices();
    if (index >= list.length) {
      setIsCompleted(true);
      return;
    }

    const currentPerson = list[index];
    const otherNames = list.filter(p => p.name !== currentPerson.name).map(p => p.name);

    // Pick 2-3 distractors based on difficulty
    const distractorCount = diffInfo.difficulty === 'hard' ? 3 : 2;
    const shuffledDistractors = otherNames.sort(() => Math.random() - 0.5).slice(0, distractorCount);
    const roundOptions = [currentPerson.name, ...shuffledDistractors].sort(() => Math.random() - 0.5);

    setOptions(roundOptions);
    setSelectedOption(null);
    setWrongAnswers([]);
    setFeedback(null);
    setIsRevealed(false);

    // Play voice after a tiny visual breath
    setTimeout(() => {
      playCurrentPersonVoice(currentPerson);
    }, 450);
  };

  // Play voice for the current person
  const playCurrentPersonVoice = (personObj = null) => {
    const personToPlay = personObj || people[currentIndex];
    if (!personToPlay) return;

    // Clear any pending auto-replay timers
    if (autoReplayTimerRef.current) {
      clearTimeout(autoReplayTimerRef.current);
      autoReplayTimerRef.current = null;
    }

    setIsPlayingAudio(true);
    playPersonVoice(personToPlay, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => {
        setIsPlayingAudio(false);
        // If autoReplay is enabled and question hasn't been answered correctly yet, schedule next replay
        if (autoReplay && !isRevealed && !isCompleted) {
          autoReplayTimerRef.current = setTimeout(() => {
            playCurrentPersonVoice();
          }, 4500);
        }
      },
      onError: () => {
        setIsPlayingAudio(false);
      }
    });
  };

  const handleManualReplay = () => {
    playFlipSound();
    playCurrentPersonVoice();
  };

  // React to Storage updates
  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_memories') {
      if (!isCompleted) {
        initGame();
      }
    }
  });

  useEffect(() => {
    initGame();
    return () => {
      stopAllVoices();
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoReplayTimerRef.current) clearTimeout(autoReplayTimerRef.current);
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    if (!startTime || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [startTime, isCompleted]);

  // Handle Option Selection
  const handleSelectOption = (name) => {
    if (isRevealed) return; // Round already solved

    playFlipSound();
    setAttempts(prev => prev + 1);
    setSelectedOption(name);

    const currentPerson = people[currentIndex];

    if (name.toLowerCase() === currentPerson.name.toLowerCase()) {
      // --- CORRECT ANSWER ---
      stopAllVoices();
      playSuccessChime();
      setIsRevealed(true);
      setCorrectCount(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        message: `Yes! That is ${currentPerson.name} (${currentPerson.relation || "Family"}).`
      });

      // Advance after a comfortable celebratory pause
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < people.length) {
          setCurrentIndex(nextIdx);
          generateRound(people, nextIdx);
        } else {
          setIsCompleted(true);
        }
      }, 2300);
    } else {
      // --- GENTLE RE-TRY (REPLAY VOICE AUTOMATICALLY) ---
      playGentleTrySound();
      setWrongAnswers(prev => [...prev, name]);
      setFeedback({
        isCorrect: false,
        message: "That's okay, Amma. Take your time! Listen to the voice once more."
      });

      // Replay the voice clip again automatically!
      setTimeout(() => {
        playCurrentPersonVoice();
      }, 900);
    }
  };

  // Open / Close Add Voice Modal
  const handleOpenAddVoice = () => {
    playFlipSound();
    stopAllVoices();
    setNewPerson({
      name: '',
      relation: 'Family Member',
      hint: '',
      avatarUrl: DEFAULT_PEOPLE[0].avatarUrl,
      voiceAudioUrl: '',
      voiceGreeting: '',
      voiceProfile: 'daughter',
      voicePitch: 1.15
    });
    setIsAddModalOpen(true);
  };

  const handleSaveVoicePerson = (e) => {
    e.preventDefault();
    if (!newPerson.name.trim()) return;

    playSuccessChime();
    const added = {
      name: newPerson.name.trim(),
      category: 'people',
      type: 'person',
      relation: newPerson.relation.trim() || 'Family Member',
      hint: newPerson.hint.trim() || newPerson.relation.trim(),
      description: `${newPerson.name.trim()} (${newPerson.relation.trim() || 'Family Member'}). Added with personalized voice clip.`,
      avatarUrl: newPerson.avatarUrl || DEFAULT_PEOPLE[0].avatarUrl,
      voiceAudioUrl: newPerson.voiceAudioUrl || '',
      voiceGreeting: newPerson.voiceGreeting || '',
      voiceProfile: newPerson.voiceProfile || 'daughter',
      voicePitch: newPerson.voicePitch || 1.15
    };

    addMemory(added);

    const updated = [...people, added];
    setPeople(updated);
    setIsAddModalOpen(false);

    setSaveBanner(`"${added.name}" added to the voice game! You can now hear their voice clips.`);
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const currentPerson = people[currentIndex];
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100;

  return (
    <GameWrapper
      title="Who's Speaking?"
      subtitle="Listen to familiar voices of loved ones."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="whos-speaking"
      stats={{
        timeSec,
        matches: `${correctCount} / ${people.length}`,
        moves: attempts,
        accuracy
      }}
      onRestart={initGame}
    >
      <div className="whos-speaking-container">
        {/* Top Control Bar: Progress, Auto-Replay Toggle, Add Voice */}
        <div className="whos-top-bar">
          <div className="whos-progress-info">
            <span className="whos-count-label">
              Voice {people.length > 0 ? currentIndex + 1 : 0} of {people.length}
            </span>
            {currentPerson?.hint && (
              <span className="whos-clue-pill">
                <Heart size={13} />
                <span>{currentPerson.relation || "Family"}</span>
              </span>
            )}
          </div>

          <div className="whos-actions-group">
            {/* Auto-replay switch */}
            <button
              type="button"
              className={`auto-replay-toggle ${autoReplay ? 'active' : ''}`}
              onClick={() => {
                playFlipSound();
                setAutoReplay(!autoReplay);
              }}
              title="Repeat voice automatically until answered"
            >
              <Repeat size={14} />
              <span>Auto-Repeat: {autoReplay ? "On" : "Off"}</span>
            </button>

            <button
              type="button"
              className="whos-add-voice-btn"
              onClick={handleOpenAddVoice}
              title="Add another family member's voice clip"
            >
              <Mic size={15} />
              <span>Add Loved One's Voice</span>
            </button>
          </div>
        </div>

        {/* Save Confirmation Banner */}
        {saveBanner && (
          <div className="whos-save-banner animate-fade-in">
            <Check size={16} />
            <span>{saveBanner}</span>
          </div>
        )}

        {currentPerson && (
          <div className="whos-main-stage animate-fade-in">
            {/* Center Visualizer / Reveal Stage */}
            <div className="voice-stage-center">
              {isRevealed ? (
                /* Revealed Photo of the Person */
                <div className="person-revealed-card animate-pop-in">
                  <div className="revealed-img-frame">
                    <img
                      src={currentPerson.avatarUrl}
                      alt={currentPerson.name}
                      className="revealed-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="revealed-fallback-avatar" style={{ display: 'none' }}>
                      <User size={64} />
                    </div>
                  </div>
                  <div className="revealed-badge">
                    <Check size={18} className="revealed-check-icon" />
                    <span>{currentPerson.name} ({currentPerson.relation || "Family"})</span>
                  </div>
                </div>
              ) : (
                /* Acoustic Pulsing Speaker Visualizer */
                <div className={`acoustic-speaker-visualizer ${isPlayingAudio ? 'is-playing' : ''}`}>
                  <div className="soundwave-ring ring-3" />
                  <div className="soundwave-ring ring-2" />
                  <div className="soundwave-ring ring-1" />

                  <button
                    type="button"
                    className="acoustic-center-disc"
                    onClick={handleManualReplay}
                    title="Tap to listen to this voice again"
                    aria-label="Replay voice clip"
                  >
                    <Volume2 size={42} className="acoustic-icon" />
                    <span className="acoustic-disc-label">
                      {isPlayingAudio ? "Speaking..." : "Listen"}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Replay Controls & Question Prompt */}
            <div className="whos-prompt-row">
              <h2 className="whos-question-title">Whose voice is this?</h2>
              
              <button
                type="button"
                className={`btn-replay-voice ${isPlayingAudio ? 'playing' : ''}`}
                onClick={handleManualReplay}
                aria-label="Replay voice clip again"
              >
                <RotateCcw size={18} />
                <span>{isPlayingAudio ? "Playing Voice..." : "Listen Again"}</span>
              </button>
            </div>

            {/* Multiple Choice Options List */}
            <div className="whos-options-grid">
              {options.map((name) => {
                const isSelected = selectedOption === name;
                const isWrong = wrongAnswers.includes(name);
                const isRight = isRevealed && name.toLowerCase() === currentPerson.name.toLowerCase();

                return (
                  <button
                    key={name}
                    className={`whos-option-card ${isRight ? 'correct' : ''} ${isWrong ? 'incorrect' : ''} ${isSelected && !isRight && !isWrong ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(name)}
                    disabled={isRevealed || isWrong}
                    aria-label={`Choose ${name}`}
                  >
                    <span className="option-name-label">{name}</span>
                    {isRight && <Check size={24} className="option-check-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Supportive Reassuring Feedback Banner */}
            {feedback && (
              <div className={`whos-feedback-banner ${feedback.isCorrect ? 'positive' : 'encouraging'}`}>
                {feedback.isCorrect ? (
                  <Sparkles size={18} className="feedback-icon" />
                ) : (
                  <RotateCcw size={18} className="feedback-icon" />
                )}
                <p>{feedback.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Loved One's Voice Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="whos-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Mic size={20} className="modal-header-icon" />
                <h3 className="modal-heading">Add Loved One's Voice</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVoicePerson} className="whos-add-form">
              <p className="whos-add-intro">
                Record a quick voice clip or upload audio from a family member. They will appear right away in Amma's <em>"Who's Speaking?"</em> voice recognition game!
              </p>

              <div className="form-group">
                <label className="form-label">Full Name or Familiar Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya, Rajiv, Uncle Suresh"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Niece, Son, Cousin"
                    value={newPerson.relation}
                    onChange={(e) => setNewPerson({ ...newPerson, relation: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Helpful Memory Clue</label>
                  <input
                    type="text"
                    placeholder="e.g. Brings fresh jasmine flowers"
                    value={newPerson.hint}
                    onChange={(e) => setNewPerson({ ...newPerson, hint: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Voice Recorder Box */}
              <div className="form-group">
                <VoiceRecorderBox
                  audioUrl={newPerson.voiceAudioUrl}
                  onAudioChange={(url) => setNewPerson({ ...newPerson, voiceAudioUrl: url })}
                  greeting={newPerson.voiceGreeting}
                  onGreetingChange={(text) => setNewPerson({ ...newPerson, voiceGreeting: text })}
                  profile={newPerson.voiceProfile}
                  onProfileChange={(prof) => setNewPerson({ ...newPerson, voiceProfile: prof })}
                  pitch={newPerson.voicePitch}
                  onPitchChange={(p) => setNewPerson({ ...newPerson, voicePitch: p })}
                  personName={newPerson.name || 'Loved One'}
                />
              </div>

              {/* Photo Upload Box */}
              <div className="form-group">
                <ImageUploadBox
                  value={newPerson.avatarUrl}
                  onChange={(url) => setNewPerson({ ...newPerson, avatarUrl: url })}
                  label="Portrait Photo (Revealed when recognized)"
                  placeholder="Upload family portrait from your device"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>Save to Voice Game</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
