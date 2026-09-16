import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getMemories, addMemory } from '../utils/storage';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import { User, Check, Heart, Camera, Plus, X, Users } from 'lucide-react';
import ImageUploadBox from '../components/common/ImageUploadBox';
import { useStorageListener } from '../hooks/useStorageListener';
import './WhoIsThis.css';

const DEFAULT_FAMILY_PRESETS = [
  { label: 'Daughter / Woman', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Son / Young Man', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Granddaughter', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Husband / Senior', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' }
];

export default function WhoIsThis() {
  const diffInfo = getDifficulty();
  const [people, setPeople] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect: bool, message: string }
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeSec, setTimeSec] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: '',
    hint: '',
    avatarUrl: ''
  });
  const [saveBanner, setSaveBanner] = useState(null);

  // Load people from memory library
  const initGame = () => {
    const allMemories = getMemories();
    const familyMembers = allMemories.filter(m => m.type === 'person' || m.category === 'people');

    // Ensure we have at least 2-4 names for multiple choice
    const validPeople = familyMembers.length >= 2 ? familyMembers : [
      { id: 'p1', name: 'Anu', relation: 'Daughter', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', hint: 'Visits every Sunday' },
      { id: 'p2', name: 'Arun', relation: 'Son', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80', hint: 'Calls every evening from Guwahati' },
      { id: 'p3', name: 'Maya', relation: 'Granddaughter', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', hint: 'Loves drawing and folk tales' },
      { id: 'p4', name: 'Ravi', relation: 'Husband', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', hint: 'Beloved lifelong companion' }
    ];

    setPeople(validPeople);
    setCurrentIndex(0);
    setAttempts(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setFeedback(null);
    setIsCompleted(false);
    setTimeSec(0);
    setStartTime(Date.now());
    generateRound(validPeople, 0);
  };

  const generateRound = (list, index) => {
    if (index >= list.length) {
      setIsCompleted(true);
      return;
    }

    const currentPerson = list[index];
    // Gather wrong answers from other people
    const otherNames = list.filter(p => p.name !== currentPerson.name).map(p => p.name);
    
    // Shuffle and pick 2-3 distractors
    const shuffledDistractors = otherNames.sort(() => Math.random() - 0.5).slice(0, 2);
    const roundOptions = [currentPerson.name, ...shuffledDistractors].sort(() => Math.random() - 0.5);

    setOptions(roundOptions);
    setSelectedOption(null);
    setFeedback(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_memories') {
      // Reinitialize the game silently if a memory changes
      if (!isCompleted) {
         initGame();
      }
    }
  });

  // Timer
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

  const handleSelectOption = (name) => {
    if (selectedOption && feedback?.isCorrect) return; // Already answered correctly

    playFlipSound();
    setSelectedOption(name);
    setAttempts(prev => prev + 1);

    const currentPerson = people[currentIndex];

    if (name.toLowerCase() === currentPerson.name.toLowerCase()) {
      // Correct!
      playSuccessChime();
      setCorrectCount(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        message: `Yes! That is ${currentPerson.name}. (${currentPerson.relation || "Family"})`
      });

      // Advance after a calm pause
      setTimeout(() => {
        const nextIdx = currentIndex + 1;
        if (nextIdx < people.length) {
          setCurrentIndex(nextIdx);
          generateRound(people, nextIdx);
        } else {
          setIsCompleted(true);
        }
      }, 1600);
    } else {
      // Gentle encouragement
      playGentleTrySound();
      setFeedback({
        isCorrect: false,
        message: "That's okay. Take your time and let's try again."
      });
    }
  };

  const handleOpenUpload = () => {
    playFlipSound();
    setNewPerson({
      name: '',
      relation: 'Family Member',
      hint: '',
      avatarUrl: DEFAULT_FAMILY_PRESETS[0].url
    });
    setIsUploadModalOpen(true);
  };

  const handleSaveUploadedPhoto = (e) => {
    e.preventDefault();
    if (!newPerson.name.trim()) return;

    playSuccessChime();
    const photoUrl = newPerson.avatarUrl || DEFAULT_FAMILY_PRESETS[0].url;
    const added = {
      name: newPerson.name.trim(),
      category: 'people',
      type: 'person',
      relation: newPerson.relation.trim() || 'Family Member',
      hint: newPerson.hint.trim() || newPerson.relation.trim(),
      description: `${newPerson.name.trim()} (${newPerson.relation.trim() || 'Family Member'}). Added to personalized memory activities.`,
      avatarUrl: photoUrl
    };

    // Save to storage
    addMemory(added);

    // Update current game list with newly added family member
    const updatedPeople = [...people, added];
    setPeople(updatedPeople);
    setIsUploadModalOpen(false);

    setSaveBanner(`"${added.name}" added to the game! Now ${updatedPeople.length} family photos in your game.`);
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const currentPerson = people[currentIndex];
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100;

  return (
    <GameWrapper
      title="Who Is This?"
      subtitle="People and moments you know."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="who-is-this"
      stats={{
        timeSec,
        matches: `${correctCount} / ${people.length}`,
        moves: attempts,
        accuracy
      }}
      onRestart={initGame}
    >
      <div className="who-is-this-container">
        {/* Top Control Bar: Progress + Upload Action */}
        <div className="who-top-action-bar">
          <div className="who-progress-info">
            <span className="who-count-label">
              Person {people.length > 0 ? currentIndex + 1 : 0} of {people.length}
            </span>
            {currentPerson?.hint && (
              <span className="who-hint-pill">
                <Heart size={13} />
                <span>{currentPerson.relation || "Family"}</span>
              </span>
            )}
          </div>

          <button
            className="who-upload-btn"
            onClick={handleOpenUpload}
            title="Upload a new family photo to this game"
          >
            <Camera size={16} />
            <span>Add Family Photo</span>
          </button>
        </div>

        {/* Save confirmation banner */}
        {saveBanner && (
          <div className="who-save-banner animate-fade-in">
            <Check size={16} />
            <span>{saveBanner}</span>
          </div>
        )}

        {currentPerson && (
          <>
            {/* Person Portrait */}
            <div className="person-portrait-card">
              <div className="image-frame">
                <img
                  src={currentPerson.avatarUrl}
                  alt="Familiar family member"
                  className="person-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="fallback-avatar" style={{ display: 'none' }}>
                  <User size={64} />
                </div>
              </div>
            </div>

            {/* Question */}
            <h2 className="who-question">Who is this?</h2>

            {/* Answer Options */}
            <div className="who-options-list">
              {options.map((name) => {
                const isSelected = selectedOption === name;
                const isRightAnswer = isSelected && feedback?.isCorrect;
                const isWrongAnswer = isSelected && feedback && !feedback.isCorrect;

                return (
                  <button
                    key={name}
                    className={`who-option-btn ${isRightAnswer ? 'correct' : ''} ${isWrongAnswer ? 'incorrect' : ''}`}
                    onClick={() => handleSelectOption(name)}
                    aria-label={`Select ${name}`}
                  >
                    <span className="option-name">{name}</span>
                    {isRightAnswer && <Check size={24} className="check-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Supportive Feedback Box */}
            {feedback && (
              <div className={`who-feedback-banner ${feedback.isCorrect ? 'positive' : 'encouraging'}`}>
                <p>{feedback.message}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Family Photo Modal */}
      {isUploadModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsUploadModalOpen(false)}>
          <div className="who-upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Camera size={20} className="modal-header-icon" />
                <h3 className="modal-heading">Add Family Photo to Game</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsUploadModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUploadedPhoto} className="who-upload-form">
              <p className="who-upload-intro">
                Upload a picture of a loved one or family member. They will appear right away in Amma's <em>"Who Is This?"</em> recognition game!
              </p>

              {/* Image Upload Box */}
              <ImageUploadBox
                value={newPerson.avatarUrl}
                onChange={(url) => setNewPerson({ ...newPerson, avatarUrl: url })}
                label="Family Member Photo"
                presets={DEFAULT_FAMILY_PRESETS}
                placeholder="Upload photo from device (JPG, PNG, WEBP)"
              />

              <div className="form-group">
                <label className="form-label">Full Name or Familiar Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma, Uncle Rajiv, Priya"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Relation</label>
                  <input
                    type="text"
                    placeholder="e.g. Daughter, Brother, Grandson"
                    value={newPerson.relation}
                    onChange={(e) => setNewPerson({ ...newPerson, relation: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Helpful Hint / Clue</label>
                  <input
                    type="text"
                    placeholder="e.g. Loves gardening"
                    value={newPerson.hint}
                    onChange={(e) => setNewPerson({ ...newPerson, hint: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>Save &amp; Include in Game</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GameWrapper>
  );
}
