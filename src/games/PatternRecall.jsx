import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import {
  Circle,
  Square,
  Triangle,
  Star,
  Diamond,
  Heart,
  Eye,
  Check,
  Sparkles
} from 'lucide-react';
import './PatternRecall.css';

const SHAPES = [
  { id: 'circle', label: 'Circle', icon: Circle, color: '#667A63' },
  { id: 'square', label: 'Square', icon: Square, color: '#B8785C' },
  { id: 'triangle', label: 'Triangle', icon: Triangle, color: '#5B84B1' },
  { id: 'star', label: 'Star', icon: Star, color: '#D6B96C' },
  { id: 'diamond', label: 'Diamond', icon: Diamond, color: '#8C6239' },
  { id: 'heart', label: 'Heart', icon: Heart, color: '#C05C46' }
];

export default function PatternRecall() {
  const diffInfo = getDifficulty();
  const [level, setLevel] = useState(1); // 1 (3 items), 2 (4 items), 3 (5 items)
  const [sequence, setSequence] = useState([]);
  const [missingIndex, setMissingIndex] = useState(2);
  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'recall'
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [timeSec, setTimeSec] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef(null);
  const memorizeTimerRef = useRef(null);

  const initGame = () => {
    setLevel(1);
    setCorrectRounds(0);
    setAttempts(0);
    setTimeSec(0);
    setIsCompleted(false);
    setStartTime(Date.now());
    startRound(1);
  };

  const startRound = (roundLevel) => {
    const seqLength = roundLevel === 1 ? 3 : roundLevel === 2 ? 4 : 5;
    
    // Pick distinct random shapes
    const shuffled = [...SHAPES].sort(() => Math.random() - 0.5);
    const roundSeq = shuffled.slice(0, seqLength);
    const targetMissing = seqLength - 1; // Last item missing ("What came next?")

    setSequence(roundSeq);
    setMissingIndex(targetMissing);
    setPhase('memorize');
    setSelectedOption(null);
    setFeedback(null);
    setCountdown(4);

    // Options: the correct shape + 2 distractors
    const correctShape = roundSeq[targetMissing];
    const distractors = SHAPES.filter(s => s.id !== correctShape.id).sort(() => Math.random() - 0.5).slice(0, 2);
    const roundOptions = [correctShape, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);

    // 4-second memorization timer
    let count = 4;
    if (memorizeTimerRef.current) clearInterval(memorizeTimerRef.current);
    memorizeTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(memorizeTimerRef.current);
        setPhase('recall');
      }
    }, 1000);
  };

  useEffect(() => {
    initGame();
    return () => {
      if (memorizeTimerRef.current) clearInterval(memorizeTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Time tracking
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

  const handleSelectOption = (shape) => {
    if (selectedOption && feedback?.isCorrect) return;

    playFlipSound();
    setSelectedOption(shape);
    setAttempts(prev => prev + 1);

    const correctShape = sequence[missingIndex];

    if (shape.id === correctShape.id) {
      // Correct!
      playSuccessChime();
      setCorrectRounds(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        message: `That's right! ${shape.label} completes the pattern.`
      });

      setTimeout(() => {
        if (level < 3) {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          startRound(nextLvl);
        } else {
          setIsCompleted(true);
        }
      }, 1600);
    } else {
      playGentleTrySound();
      setFeedback({
        isCorrect: false,
        message: "That's okay. Take a look and try another shape."
      });
    }
  };

  const accuracy = attempts > 0 ? Math.round((correctRounds / attempts) * 100) : 100;

  return (
    <GameWrapper
      title="Pattern Recall"
      subtitle="Remember the visual sequence."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="pattern"
      stats={{
        timeSec,
        matches: `${correctRounds} / 3`,
        moves: attempts,
        accuracy
      }}
      onRestart={initGame}
    >
      <div className="pattern-recall-container">
        {/* Level & Phase Header */}
        <div className="pattern-status-bar">
          <span className="level-badge">Round {level} of 3</span>
          <span className="phase-indicator">
            {phase === 'memorize' ? (
              <span className="memorize-tag">
                <Eye size={15} />
                <span>Notice the shapes ({countdown}s)</span>
              </span>
            ) : (
              <span className="recall-tag">
                <Sparkles size={15} />
                <span>What came next?</span>
              </span>
            )}
          </span>
        </div>

        {/* Visual Sequence Display */}
        <div className="sequence-card">
          <div className="sequence-track">
            {sequence.map((shape, idx) => {
              const Icon = shape.icon;
              const isMissing = phase === 'recall' && idx === missingIndex;
              const showShape = phase === 'memorize' || !isMissing;

              return (
                <div key={idx} className="sequence-node">
                  {showShape ? (
                    <div
                      className="shape-circle"
                      style={{ backgroundColor: `${shape.color}15`, color: shape.color, borderColor: shape.color }}
                    >
                      <Icon size={38} />
                    </div>
                  ) : (
                    <div className="shape-circle missing-spot">
                      <span className="question-mark">?</span>
                    </div>
                  )}

                  {idx < sequence.length - 1 && (
                    <span className="sequence-arrow">&rarr;</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recall Options */}
        {phase === 'recall' && (
          <div className="recall-section animate-fade-in">
            <h3 className="recall-prompt">Which shape completes the sequence?</h3>

            <div className="pattern-options-grid">
              {options.map((shape) => {
                const Icon = shape.icon;
                const isSelected = selectedOption?.id === shape.id;
                const isRight = isSelected && feedback?.isCorrect;
                const isWrong = isSelected && feedback && !feedback.isCorrect;

                return (
                  <button
                    key={shape.id}
                    className={`pattern-option-btn ${isRight ? 'correct' : ''} ${isWrong ? 'incorrect' : ''}`}
                    onClick={() => handleSelectOption(shape)}
                    aria-label={`Select ${shape.label}`}
                  >
                    <div
                      className="option-shape-circle"
                      style={{ backgroundColor: `${shape.color}15`, color: shape.color }}
                    >
                      <Icon size={34} />
                    </div>
                    <span className="option-label">{shape.label}</span>
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className={`pattern-feedback ${feedback.isCorrect ? 'positive' : 'encouraging'}`}>
                <p>{feedback.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </GameWrapper>
  );
}
