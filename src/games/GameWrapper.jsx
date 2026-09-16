import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, Home, Sparkles } from 'lucide-react';
import { playCompletionChime, playFlipSound } from '../utils/sound';
import { recordActivity } from '../utils/storage';
import './GameWrapper.css';

export default function GameWrapper({
  title,
  subtitle,
  difficulty = 'medium',
  isCompleted = false,
  stats = null,
  gameType,
  onRestart,
  children
}) {
  const navigate = useNavigate();
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    if (isCompleted && !recorded && stats) {
      playCompletionChime();
      // Record session to storage for adaptive engine & caregiver tracking
      recordActivity({
        type: gameType,
        name: title,
        accuracy: stats.accuracy || 100,
        responseTimeSec: stats.timeSec || 45,
        difficulty: difficulty,
        moves: stats.moves || 0,
        matches: stats.matches || 0,
        notes: `Completed at ${difficulty} level.`
      });
      setRecorded(true);
    }
  }, [isCompleted, recorded, stats, gameType, title, difficulty]);

  const handleBack = () => {
    playFlipSound();
    navigate('/play');
  };

  const handleHome = () => {
    playFlipSound();
    navigate('/home');
  };

  const handleRestart = () => {
    playFlipSound();
    setRecorded(false);
    if (onRestart) onRestart();
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '01:15';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-wrapper-container">
      {/* Game Header */}
      <header className="game-screen-header">
        <button className="game-back-btn" onClick={handleBack} aria-label="Back to activities">
          <ArrowLeft size={22} />
          <span>Activities</span>
        </button>

        <div className="game-title-center">
          <h1 className="game-header-title">{title}</h1>
          {subtitle && <p className="game-header-sub">{subtitle}</p>}
        </div>

        <div className="game-difficulty-pill">
          <span className="diff-dot" />
          <span className="diff-label">
            {difficulty === 'hard' ? 'Advanced' : difficulty === 'easy' ? 'Gentle' : 'Comfortable'}
          </span>
        </div>
      </header>

      {/* Main Game Stage or Calm Completion Screen */}
      <div className="game-stage-area">
        {isCompleted && stats ? (
          <div className="completion-card animate-fade-in">
            <div className="completion-icon-wrap">
              <CheckCircle2 size={48} className="completion-check-icon" />
            </div>

            <h2 className="completion-heading">Well Done</h2>
            <p className="completion-subheading">
              You completed <strong>{title}</strong>.
            </p>

            <div className="completion-stats-grid">
              <div className="stat-box">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(stats.timeSec)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Matches / Score</span>
                <span className="stat-value">{stats.matches}</span>
              </div>
              {stats.moves > 0 && (
                <div className="stat-box">
                  <span className="stat-label">Steps</span>
                  <span className="stat-value">{stats.moves}</span>
                </div>
              )}
            </div>

            <div className="adaptive-feedback-box">
              <Sparkles size={18} className="adaptive-sparkle-icon" />
              <p>
                Mindora uses your activity history to personalize future exercises.
              </p>
            </div>

            <div className="completion-actions">
              <button className="btn-patient-large completion-btn primary-action" onClick={handleRestart}>
                <RotateCcw size={20} />
                <span>Play Again</span>
              </button>
              <button className="btn-patient-large completion-btn secondary-action" onClick={handleHome}>
                <Home size={20} />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
