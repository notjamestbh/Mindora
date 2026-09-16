import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Grid,
  Heart,
  Sparkles
} from 'lucide-react';
import { getActivities, getReminders } from '../../utils/storage';
import { playFlipSound } from '../../utils/sound';
import './CaregiverActivity.css';

export default function CaregiverActivity() {
  const [activities] = useState(getActivities());
  const [reminders] = useState(getReminders());
  const [filter, setFilter] = useState('all'); // all | games | routines

  // Merge games and completed routine items chronologically
  const routineEvents = reminders
    .filter(r => r.completed)
    .map(r => ({
      id: `ev_${r.id}`,
      type: 'routine-completed',
      name: r.title,
      timeStr: `Today, ${r.completedAt || r.time}`,
      accuracy: 100,
      responseTimeSec: null,
      difficulty: 'routine',
      notes: r.notes || "Completed as scheduled"
    }));

  const allItems = [...activities, ...routineEvents];

  const filteredItems = filter === 'games'
    ? allItems.filter(i => i.type !== 'routine-completed')
    : filter === 'routines'
    ? allItems.filter(i => i.type === 'routine-completed')
    : allItems;

  const formatSeconds = (sec) => {
    if (!sec) return null;
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return mins > 0 ? `${mins}m ${s}s` : `${s}s`;
  };

  return (
    <div className="caregiver-activity-container">
      <div className="activity-page-header">
        <div>
          <h1 className="caregiver-title">Activity Feed</h1>
          <p className="caregiver-subtitle">Chronological record of cognitive exercises and daily routine events.</p>
        </div>

        {/* Filter Pills */}
        <div className="activity-filter-bar">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => { playFlipSound(); setFilter('all'); }}
          >
            All Activity ({allItems.length})
          </button>
          <button
            className={`filter-pill ${filter === 'games' ? 'active' : ''}`}
            onClick={() => { playFlipSound(); setFilter('games'); }}
          >
            Cognitive Games ({activities.length})
          </button>
          <button
            className={`filter-pill ${filter === 'routines' ? 'active' : ''}`}
            onClick={() => { playFlipSound(); setFilter('routines'); }}
          >
            Routines ({routineEvents.length})
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="activity-feed-list">
        {filteredItems.map((item) => {
          const isRoutine = item.type === 'routine-completed';

          return (
            <div key={item.id} className="feed-item-card animate-fade-in">
              <div className="feed-icon-column">
                <div className={`feed-icon-circle ${isRoutine ? 'routine' : 'game'}`}>
                  {isRoutine ? <CheckCircle2 size={20} /> : <Grid size={20} />}
                </div>
                <div className="feed-connector-line" />
              </div>

              <div className="feed-content-column">
                <div className="feed-top-line">
                  <span className="feed-timestamp">{item.timeStr || "Recent"}</span>
                  <span className={`feed-type-pill ${isRoutine ? 'routine' : 'game'}`}>
                    {isRoutine ? 'Daily Routine' : 'Cognitive Game'}
                  </span>
                </div>

                <h3 className="feed-item-title">{item.name}</h3>
                {item.notes && <p className="feed-item-notes">{item.notes}</p>}

                {/* Metrics row for cognitive games */}
                {!isRoutine && (
                  <div className="feed-metrics-row">
                    <div className="metric-tag">
                      <span className="metric-tag-label">Accuracy:</span>
                      <strong className="metric-tag-val">{item.accuracy}%</strong>
                    </div>

                    {item.responseTimeSec && (
                      <div className="metric-tag">
                        <span className="metric-tag-label">Response Time:</span>
                        <strong className="metric-tag-val">{formatSeconds(item.responseTimeSec)}</strong>
                      </div>
                    )}

                    <div className="metric-tag">
                      <span className="metric-tag-label">Difficulty:</span>
                      <span className="difficulty-name">{item.difficulty}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
