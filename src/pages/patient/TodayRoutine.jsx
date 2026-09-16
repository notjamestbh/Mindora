import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  Coffee,
  Pill,
  Brain,
  Footprints,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getReminders, toggleReminder } from '../../utils/storage';
import { playSuccessChime, playFlipSound } from '../../utils/sound';
import { useStorageListener } from '../../hooks/useStorageListener';
import './TodayRoutine.css';

export default function TodayRoutine() {
  const [reminders, setReminders] = useState(getReminders());

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_reminders') {
      setReminders(getReminders());
    }
  });

  const handleToggle = (id) => {
    playFlipSound();
    const updated = toggleReminder(id);
    setReminders([...updated]);

    const toggledItem = updated.find(r => r.id === id);
    if (toggledItem?.completed) {
      playSuccessChime();
    }
  };

  const completedCount = reminders.filter(r => r.completed).length;
  const progressPercent = Math.round((completedCount / reminders.length) * 100);

  const getEncouragement = () => {
    if (completedCount === reminders.length) {
      return "All daily routines completed. Relax and have a restful evening.";
    }
    if (completedCount >= 2) {
      return "Well done. Your day is on track.";
    }
    return "Take your time. Each moment at your own gentle pace.";
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medication': return Pill;
      case 'meal': return Coffee;
      case 'activity': return Brain;
      case 'wellness': return Footprints;
      default: return Clock;
    }
  };

  return (
    <div className="today-routine-container">
      {/* Header */}
      <div className="today-header">
        <div>
          <h1 className="patient-greeting">Today</h1>
          <p className="patient-subhead">Your day at a glance.</p>
        </div>

        <div className="progress-badge">
          <span>{completedCount} of {reminders.length} Done</span>
        </div>
      </div>

      {/* Encouragement Banner */}
      <div className="today-encouragement-banner">
        <Sparkles size={18} className="encouragement-sparkle" />
        <p className="encouragement-text">{getEncouragement()}</p>
      </div>

      {/* Routine Timeline */}
      <div className="routine-timeline-list">
        {reminders.map((rem, idx) => {
          const Icon = getCategoryIcon(rem.category);
          const isDone = rem.completed;
          const isNextActive = !isDone && (idx === 0 || reminders[idx - 1].completed);

          return (
            <div
              key={rem.id}
              className={`timeline-item-card ${isDone ? 'done' : isNextActive ? 'active' : 'upcoming'}`}
              onClick={() => handleToggle(rem.id)}
              role="button"
              tabIndex={0}
              aria-label={`${rem.title} at ${rem.time}. ${isDone ? 'Completed' : 'Tap to mark done'}`}
            >
              <div className="timeline-left-time">
                <span className="time-string">{rem.time}</span>
                <div className={`status-indicator-dot ${isDone ? 'dot-done' : isNextActive ? 'dot-active' : 'dot-upcoming'}`} />
              </div>

              <div className="timeline-content">
                <div className="timeline-title-row">
                  <div className={`timeline-icon-wrap ${rem.category}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="timeline-title">{rem.title}</h3>
                    {rem.notes && <p className="timeline-notes">{rem.notes}</p>}
                  </div>
                </div>

                {rem.category === 'activity' && !isDone && (
                  <Link
                    to="/play"
                    className="inline-play-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      playFlipSound();
                    }}
                  >
                    <span>Start Activity</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              <div className="timeline-action-check">
                {isDone ? (
                  <div className="check-done-pill">
                    <CheckCircle2 size={22} className="check-icon" />
                    <span>Done</span>
                  </div>
                ) : (
                  <button className="mark-done-btn" aria-label="Mark done">
                    <Circle size={22} className="circle-empty" />
                    <span>Mark Done</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
