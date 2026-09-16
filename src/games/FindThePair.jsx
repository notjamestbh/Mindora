import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import {
  Coffee,
  Leaf,
  BookOpen,
  Glasses,
  Flower2,
  Droplets,
  Radio,
  Volume2,
  Check
} from 'lucide-react';
import './FindThePair.css';

const PAIR_ROUNDS = [
  {
    id: 'p_round_1',
    theme: 'Morning Comfort',
    pair: ['cup', 'tea'],
    explanation: 'The tea cup and fresh tea leaves belong together for a warm morning drink.',
    items: [
      { id: 'cup', label: 'Brass Cup', icon: Coffee, color: '#B8785C' },
      { id: 'tea', label: 'Fresh Tea Leaves', icon: Leaf, color: '#667A63' },
      { id: 'radio', label: 'Transistor Radio', icon: Radio, color: '#8C6239' },
      { id: 'glasses', label: 'Reading Glasses', icon: Glasses, color: '#5B84B1' },
      { id: 'flower', label: 'Sewali Flower', icon: Flower2, color: '#D6B96C' },
      { id: 'droplets', label: 'Water Pitcher', icon: Droplets, color: '#4A7C59' }
    ]
  },
  {
    id: 'p_round_2',
    theme: 'Quiet Afternoon',
    pair: ['book', 'glasses'],
    explanation: 'The prayer book and reading glasses belong together for peaceful reading.',
    items: [
      { id: 'book', label: 'Prayer Book', icon: BookOpen, color: '#B8785C' },
      { id: 'glasses', label: 'Reading Glasses', icon: Glasses, color: '#5B84B1' },
      { id: 'cup', label: 'Brass Cup', icon: Coffee, color: '#667A63' },
      { id: 'flower', label: 'Garden Flower', icon: Flower2, color: '#D6B96C' },
      { id: 'radio', label: 'Radio', icon: Radio, color: '#8C6239' },
      { id: 'droplets', label: 'Water Pitcher', icon: Droplets, color: '#4A7C59' }
    ]
  },
  {
    id: 'p_round_3',
    theme: 'Courtyard Garden',
    pair: ['flower', 'droplets'],
    explanation: 'The courtyard garden and water pitcher belong together to nourish the plants.',
    items: [
      { id: 'flower', label: 'Jasmine Plant', icon: Flower2, color: '#D6B96C' },
      { id: 'droplets', label: 'Water Pitcher', icon: Droplets, color: '#4A7C59' },
      { id: 'cup', label: 'Brass Cup', icon: Coffee, color: '#B8785C' },
      { id: 'book', label: 'Prayer Book', icon: BookOpen, color: '#8C6239' },
      { id: 'radio', label: 'Transistor Radio', icon: Radio, color: '#5B84B1' },
      { id: 'glasses', label: 'Reading Glasses', icon: Glasses, color: '#667A63' }
    ]
  }
];

export default function FindThePair() {
  const diffInfo = getDifficulty();
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeSec, setTimeSec] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  const initGame = () => {
    setCurrentRoundIdx(0);
    setCorrectCount(0);
    setAttempts(0);
    setSelectedItems([]);
    setFeedback(null);
    setTimeSec(0);
    setIsCompleted(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initGame();
  }, []);

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

  const handleItemClick = (id) => {
    if (feedback?.isCorrect) return; // Wait for round advance

    playFlipSound();

    let nextSelected;
    if (selectedItems.includes(id)) {
      nextSelected = selectedItems.filter(item => item !== id);
    } else {
      if (selectedItems.length >= 2) {
        nextSelected = [id]; // Reset to current clicked
      } else {
        nextSelected = [...selectedItems, id];
      }
    }

    setSelectedItems(nextSelected);

    if (nextSelected.length === 2) {
      setAttempts(prev => prev + 1);
      const round = PAIR_ROUNDS[currentRoundIdx];
      const isPair = round.pair.includes(nextSelected[0]) && round.pair.includes(nextSelected[1]);

      if (isPair) {
        // Correct pair!
        playSuccessChime();
        setCorrectCount(prev => prev + 1);
        setFeedback({
          isCorrect: true,
          message: round.explanation
        });

        setTimeout(() => {
          const nextIdx = currentRoundIdx + 1;
          if (nextIdx < PAIR_ROUNDS.length) {
            setCurrentRoundIdx(nextIdx);
            setSelectedItems([]);
            setFeedback(null);
          } else {
            setIsCompleted(true);
          }
        }, 1800);
      } else {
        // Not a pair
        playGentleTrySound();
        setFeedback({
          isCorrect: false,
          message: "Those two are nice, but see if there's a closer pair that works together."
        });
        setTimeout(() => {
          setSelectedItems([]);
        }, 1200);
      }
    } else {
      setFeedback(null);
    }
  };

  const round = PAIR_ROUNDS[currentRoundIdx];
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100;

  return (
    <GameWrapper
      title="Find the Pair"
      subtitle="Pick two objects that naturally belong together."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="pair"
      stats={{
        timeSec,
        matches: `${correctCount} / ${PAIR_ROUNDS.length}`,
        moves: attempts,
        accuracy
      }}
      onRestart={initGame}
    >
      {round && (
        <div className="pair-game-container">
          {/* Header */}
          <div className="pair-status-header">
            <span className="pair-theme-pill">{round.theme}</span>
            <span className="pair-counter">Round {currentRoundIdx + 1} of {PAIR_ROUNDS.length}</span>
          </div>

          <h2 className="pair-prompt">Which two objects belong together?</h2>

          {/* Grid of 6 objects */}
          <div className="pair-objects-grid">
            {round.items.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedItems.includes(item.id);
              const isCorrectPair = isSelected && feedback?.isCorrect;

              return (
                <button
                  key={item.id}
                  className={`pair-item-card ${isSelected ? 'selected' : ''} ${isCorrectPair ? 'paired' : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  aria-label={`Select ${item.label}`}
                >
                  <div
                    className="pair-icon-wrap"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <Icon size={38} />
                  </div>
                  <span className="pair-item-name">{item.label}</span>
                  {isCorrectPair && <Check size={20} className="pair-check" />}
                </button>
              );
            })}
          </div>

          {/* Explanation / Feedback */}
          {feedback && (
            <div className={`pair-feedback-banner ${feedback.isCorrect ? 'positive' : 'encouraging'}`}>
              <p>{feedback.message}</p>
            </div>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
