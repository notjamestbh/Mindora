import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Grid,
  Sparkles,
  ArrowRight,
  Clock,
  Shuffle,
  Calendar,
  Mic,
  Volume2
} from 'lucide-react';
import { playFlipSound } from '../../utils/sound';
import { getDifficulty } from '../../utils/adaptiveEngine';
import './GameHub.css';

export default function GameHub() {
  const diffInfo = getDifficulty();

  const gamesList = [
    {
      to: '/game/whos-speaking',
      title: "Who's Speaking?",
      desc: 'Listen to loved ones and recognize their voices.',
      time: 'About 2 minutes',
      icon: Volume2,
      color: 'warm'
    },
    {
      to: '/game/who-is-this',
      title: 'Who Is This?',
      desc: 'Recognize family members and cherished friends.',
      time: 'About 2 minutes',
      icon: Heart,
      color: 'warm'
    },
    {
      to: '/game/memory-match',
      title: 'Memory Match',
      desc: 'Remember where familiar pictures are hidden.',
      time: 'About 2 minutes',
      icon: Grid,
      color: 'green'
    },
    {
      to: '/game/pattern',
      title: 'Pattern Recall',
      desc: 'Recall a gentle sequence of shapes and symbols.',
      time: 'About 2 minutes',
      icon: Sparkles,
      color: 'yellow'
    },
    {
      to: '/game/routine',
      title: 'What Comes Next?',
      desc: 'Follow the natural steps of everyday routines.',
      time: 'About 2 minutes',
      icon: Calendar,
      color: 'blue'
    },
    {
      to: '/game/pair',
      title: 'Find the Pair',
      desc: 'Pick two objects that naturally belong together.',
      time: 'About 2 minutes',
      icon: Shuffle,
      color: 'green'
    }
  ];

  return (
    <div className="game-hub-container">
      {/* Header */}
      <div className="game-hub-header">
        <h1 className="game-hub-heading">Choose an activity</h1>
        <p className="game-hub-sub">
          Take your time. There is no rush or pressure.
        </p>
      </div>

      {/* Adaptive notice */}
      <div className="hub-adaptive-banner">
        <div className="adaptive-dot-indicator" />
        <span>
          Activities adapted to {diffInfo.difficulty === 'hard' ? 'an engaging' : diffInfo.difficulty === 'easy' ? 'a gentle' : 'a comfortable'} pacing.
        </span>
      </div>

      {/* Game Cards List */}
      <div className="game-cards-list">
        {gamesList.map((game) => {
          const Icon = game.icon;
          return (
            <Link
              key={game.to}
              to={game.to}
              className="hub-game-card"
              onClick={playFlipSound}
              aria-label={`Play ${game.title}`}
            >
              <div className={`game-card-icon-wrap ${game.color}`}>
                <Icon size={32} />
              </div>

              <div className="game-card-info">
                <div className="game-card-top-line">
                  <h2 className="game-card-title">{game.title}</h2>
                </div>
                <p className="game-card-desc">{game.desc}</p>
                <div className="game-card-meta">
                  <span className="game-meta-time">
                    <Clock size={13} />
                    <span>{game.time}</span>
                  </span>
                </div>
              </div>

              <div className="game-card-action">
                <span className="play-pill">Play</span>
                <ArrowRight size={18} className="hub-arrow-icon" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
