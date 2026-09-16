import React, { useState, useEffect, useRef } from 'react';
import GameWrapper from './GameWrapper';
import { getDifficulty } from '../utils/adaptiveEngine';
import { playFlipSound, playSuccessChime, playGentleTrySound } from '../utils/sound';
import {
  Coffee,
  Bell,
  Flower2,
  Bird,
  Sun,
  Waves,
  Radio,
  Flame,
  Sparkles
} from 'lucide-react';
import './MemoryMatch.css';

// Familiar items representing calming everyday objects & NER culture
const ALL_ITEMS = [
  { id: 'tea', label: 'Tea Leaf', icon: Coffee, color: '#667A63' },
  { id: 'bell', label: 'Namghar Bell', icon: Bell, color: '#B8785C' },
  { id: 'flower', label: 'Sewali Flower', icon: Flower2, color: '#D6B96C' },
  { id: 'bird', label: 'Morning Bird', icon: Bird, color: '#4A7C59' },
  { id: 'sun', label: 'Golden Sun', icon: Sun, color: '#D48C46' },
  { id: 'river', label: 'Brahmaputra Stream', icon: Waves, color: '#5B84B1' },
  { id: 'radio', label: 'Morning Radio', icon: Radio, color: '#8C6239' },
  { id: 'lamp', label: 'Brass Diya', icon: Flame, color: '#C05C46' }
];

export default function MemoryMatch() {
  const diffInfo = getDifficulty();
  const pairCount = diffInfo.pairCount || 4; // 3, 4, or 6

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeSec, setTimeSec] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef(null);

  // Initialize deck
  const initGame = () => {
    const selected = ALL_ITEMS.slice(0, pairCount);
    // Duplicate for pairs
    const deck = [...selected, ...selected]
      .map((item, idx) => ({
        ...item,
        uniqueId: `${item.id}_${idx}`
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setTimeSec(0);
    setIsCompleted(false);
    setIsLocked(false);
    setStartTime(Date.now());
  };

  useEffect(() => {
    initGame();
  }, [pairCount]);

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

  const handleCardClick = (index) => {
    if (isLocked) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].id)) return;

    playFlipSound();

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setMoves(prev => prev + 1);

      const firstCard = cards[nextFlipped[0]];
      const secondCard = cards[nextFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Match!
        setTimeout(() => {
          playSuccessChime();
          const nextMatched = [...matchedIds, firstCard.id];
          setMatchedIds(nextMatched);
          setFlippedIndices([]);
          setIsLocked(false);

          if (nextMatched.length === pairCount) {
            setIsCompleted(true);
          }
        }, 350);
      } else {
        // No match - gentle flip back
        setTimeout(() => {
          playGentleTrySound();
          setFlippedIndices([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  // Accuracy calculation: ideal moves / actual moves
  const idealMoves = pairCount;
  const accuracy = moves > 0 ? Math.min(100, Math.round((idealMoves / moves) * 100)) : 100;

  return (
    <GameWrapper
      title="Memory Match"
      subtitle="Remember where the pictures are."
      difficulty={diffInfo.difficulty}
      isCompleted={isCompleted}
      gameType="memory-match"
      stats={{
        timeSec,
        matches: `${matchedIds.length} / ${pairCount}`,
        moves,
        accuracy
      }}
      onRestart={initGame}
    >
      <div className="memory-match-container">
        {/* Supportive Instruction Banner */}
        <div className="match-status-bar">
          <span className="match-prompt">
            Tap a card to reveal the picture, then find its pair.
          </span>
          <span className="match-counter">
            Found {matchedIds.length} of {pairCount} pairs
          </span>
        </div>

        {/* Card Grid */}
        <div className={`card-grid grid-pairs-${pairCount}`}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedIds.includes(card.id);
            const showFace = isFlipped || isMatched;
            const Icon = card.icon;

            return (
              <button
                key={card.uniqueId}
                className={`memory-card-btn ${showFace ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(idx)}
                aria-label={showFace ? card.label : "Hidden picture card"}
                disabled={isMatched || isLocked}
              >
                <div className="card-face card-back">
                  <div className="card-back-pattern">
                    <Sparkles size={20} className="card-back-icon" />
                  </div>
                </div>

                <div className="card-face card-front">
                  <div className="card-front-content">
                    <div
                      className="card-icon-circle"
                      style={{ backgroundColor: `${card.color}18`, color: card.color }}
                    >
                      <Icon size={36} />
                    </div>
                    <span className="card-object-label">{card.label}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GameWrapper>
  );
}
