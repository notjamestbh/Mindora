import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import {
  Sun,
  Coffee,
  Pill,
  Moon,
  Utensils,
  Footprints,
  Check,
  Sparkles,
  BedDouble,
  Heart
} from 'lucide-react';
import './RoutineSequence.css';

const ROUTINE_ROUNDS = [
  {
    id: 'round_1',
    title: 'Morning Routine',
    steps: [
      { label: 'Wake Up', icon: Sun, color: '#D48C46' },
      { label: 'Wash & Freshen', icon: Footprints, color: '#5B84B1' },
      { label: 'Ginger Tea & Breakfast', icon: Coffee, color: '#667A63' }
    ],
    question: 'What naturally comes next?',
    correct: { id: 'opt_med', label: 'Morning Medicine', desc: 'Take prescribed morning tablet with warm water', icon: Pill, color: '#B8785C' },
    distractors: [
      { id: 'opt_sleep', label: 'Go to Sleep for Night', desc: 'Bedtime sleep', icon: Moon, color: '#5A6065' },
      { id: 'opt_dinner', label: 'Night Dinner', desc: 'Evening meal', icon: Utensils, color: '#8C6239' }
    ]
  },
  {
    id: 'round_2',
    title: 'Afternoon Rhythm',
    steps: [
      { label: 'Prepare Fresh Lunch', icon: Utensils, color: '#B8785C' },
      { label: 'Warm Rice & Lentils', icon: Coffee, color: '#667A63' },
      { label: 'Wipe the Table Clean', icon: Footprints, color: '#5B84B1' }
    ],
    question: 'What is the calm next step in the afternoon?',
    correct: { id: 'opt_rest', label: 'Quiet Afternoon Rest', desc: 'A peaceful nap or reading on the verandah', icon: BedDouble, color: '#667A63' },
    distractors: [
      { id: 'opt_wake', label: 'Wake Up for the Day', desc: 'Early morning waking', icon: Sun, color: '#D48C46' },
      { id: 'opt_breakfast', label: 'Eat Breakfast Again', desc: 'Morning breakfast', icon: Utensils, color: '#8C6239' }
    ]
  },
  {
    id: 'round_3',
    title: 'Evening Routine',
    steps: [
      { label: 'Namghar Prayer Bell', icon: Heart, color: '#D6B96C' },
      { label: 'Verandah Walk', icon: Footprints, color: '#5B84B1' },
      { label: 'Light Warm Supper', icon: Utensils, color: '#667A63' }
    ],
    question: 'What completes your evening before sleep?',
    correct: { id: 'opt_evening_med', label: 'Evening Medicine & Rest', desc: 'Night dose and getting cozy in bed', icon: Moon, color: '#5A6065' },
    distractors: [
      { id: 'opt_morning_tea', label: 'Morning Ginger Chai', desc: 'First cup of sunrise', icon: Coffee, color: '#667A63' },
      { id: 'opt_sunrise', label: 'Watch Sunrise', desc: 'Beginning the day', icon: Sun, color: '#D48C46' }
    ]
  }
];

export default function RoutineSequence() {
  const diffInfo = getDifficulty();
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
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
    setTimeSec(0);
    setIsCompleted(false);
    setStartTime(Date.now());
    loadRound(0);
  };

  const loadRound = (idx) => {
    if (idx >= ROUTINE_ROUNDS.length) {
      setIsCompleted(true);
      return;
    }

    const round = ROUTINE_ROUNDS[idx];
    const choices = [round.correct, ...round.distractors].sort(() => Math.random() - 0.5);
    setOptions(choices);
    setSelectedOption(null);
    setFeedback(null);
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

  const handleSelectOption = (choice) => {
    if (selectedOption && feedback?.isCorrect) return;

    playFlipSound();
    setSelectedOption(choice);
    setAttempts(prev => prev + 1);

    const round = ROUTINE_ROUNDS[currentRoundIdx];

    if (choice.id === round.correct.id) {
      // Correct
      playSuccessChime();
      setCorrectCount(prev => prev + 1);
      setFeedback({
        isCorrect: true,
        message: `That's right! ${choice.label} is the natural next step.`
      });

      setTimeout(() => {
        const nextIdx = currentRoundIdx + 1;
        if (nextIdx < ROUTINE_ROUNDS.length) {
          setCurrentRoundIdx(nextIdx);
          loadRound(nextIdx);
        } else {
          setIsCompleted(true);
        }
      }, 1600);
    } else {
      // Gentle Try Again
      playGentleTrySound();
      setFeedback({
        isCorrect: false,
        message: "Think about what normally happens next. Let's try again."
      });
    }
  };

  const round = ROUTINE_ROUNDS[currentRoundIdx];
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100;

  return (
    <GameWrapper
      title="What Comes Next?"
      subtitle="Follow the natural steps of everyday routines."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="routine"
      stats={{
        timeSec,
        matches: `${correctCount} / ${ROUTINE_ROUNDS.length}`,
        moves: attempts,
        accuracy
      }}
      onRestart={initGame}
    >
      {round && (
        <div className="routine-container">
          {/* Progress Header */}
          <div className="routine-progress-header">
            <span className="routine-name-pill">{round.title}</span>
            <span className="routine-counter">Step {currentRoundIdx + 1} of {ROUTINE_ROUNDS.length}</span>
          </div>

          {/* Sequence Steps */}
          <div className="sequence-chain-card">
            <div className="steps-chain">
              {round.steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="chain-step-node">
                    <div
                      className="step-circle"
                      style={{ backgroundColor: `${step.color}15`, color: step.color, borderColor: step.color }}
                    >
                      <Icon size={30} />
                    </div>
                    <span className="step-text">{step.label}</span>
                    <span className="chain-connector">&rarr;</span>
                  </div>
                );
              })}

              {/* Missing Target Node */}
              <div className="chain-step-node target-node">
                <div className="step-circle missing-step">
                  <span className="step-qm">?</span>
                </div>
                <span className="step-text target-prompt">Next Step</span>
              </div>
            </div>
          </div>

          {/* Question */}
          <h2 className="routine-question">{round.question}</h2>

          {/* Options */}
          <div className="routine-options-list">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedOption?.id === opt.id;
              const isRight = isSelected && feedback?.isCorrect;
              const isWrong = isSelected && feedback && !feedback.isCorrect;

              return (
                <button
                  key={opt.id}
                  className={`routine-choice-btn ${isRight ? 'correct' : ''} ${isWrong ? 'incorrect' : ''}`}
                  onClick={() => handleSelectOption(opt)}
                  aria-label={`Select ${opt.label}`}
                >
                  <div
                    className="choice-icon-wrap"
                    style={{ backgroundColor: `${opt.color}15`, color: opt.color }}
                  >
                    <Icon size={28} />
                  </div>

                  <div className="choice-content">
                    <span className="choice-title">{opt.label}</span>
                    <span className="choice-desc">{opt.desc}</span>
                  </div>

                  {isRight && <Check size={24} className="choice-check-icon" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`routine-feedback-box ${feedback.isCorrect ? 'positive' : 'encouraging'}`}>
              <p>{feedback.message}</p>
            </div>
          )}
        </div>
      )}
    </GameWrapper>
  );
}
