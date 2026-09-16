import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Brain,
  Bell,
  AlertTriangle,
  ArrowRight,
  Info,
  Sparkles,
  Heart,
  X
} from 'lucide-react';
import TrendChart from '../../components/caregiver/TrendChart';
import { getActivities, getReminders, getAlerts, dismissAlert } from '../../utils/storage';
import { getCaregiverInsights } from '../../utils/adaptiveEngine';
import { playFlipSound } from '../../utils/sound';
import { useStorageListener } from '../../hooks/useStorageListener';
import './CaregiverOverview.css';

export default function CaregiverOverview() {
  const [activities, setActivities] = useState(getActivities());
  const [reminders, setReminders] = useState(getReminders());
  const [alerts, setAlerts] = useState(getAlerts());
  const insights = getCaregiverInsights();

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_activities') setActivities(getActivities());
    if (detail && detail.key === 'mindora_reminders') setReminders(getReminders());
  });

  const handleDismiss = (id) => {
    playFlipSound();
    const updated = dismissAlert(id);
    setAlerts([...updated]);
  };

  const completedReminders = reminders.filter(r => r.completed);
  const memoryActs = activities.filter(a => a.type === 'memory-match' || a.type === 'who-is-this');

  return (
    <div className="caregiver-overview-container">
      {/* Header */}
      <div className="caregiver-greeting-header">
        <h1 className="caregiver-title">Good morning, Anu</h1>
        <p className="caregiver-subtitle">Here's how Amma's week is going.</p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">ACTIVITY</span>
            <div className="stat-icon-wrap green">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-card-number">{activities.length} sessions</div>
          <span className="stat-card-sub">Completed this week</span>
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">ROUTINE COMPLETION</span>
            <div className="stat-icon-wrap blue">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-card-number">86%</div>
          <span className="stat-card-sub">Daily adherence rate</span>
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">MEMORY EXERCISES</span>
            <div className="stat-icon-wrap warm">
              <Heart size={18} />
            </div>
          </div>
          <div className="stat-card-number">{memoryActs.length} finished</div>
          <span className="stat-card-sub">Familiar recall active</span>
        </div>

        <div className="summary-stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">REMINDERS</span>
            <div className="stat-icon-wrap yellow">
              <Bell size={18} />
            </div>
          </div>
          <div className="stat-card-number">{completedReminders.length} / {reminders.length}</div>
          <span className="stat-card-sub">Completed today</span>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="caregiver-alerts-section">
          <h2 className="section-label">Caregiver Observations &amp; Alerts</h2>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="caregiver-alert-card">
                <div className="alert-icon-wrap">
                  <Info size={18} />
                </div>
                <div className="alert-text-body">
                  <div className="alert-title-row">
                    <h4 className="alert-title">{alert.title}</h4>
                    <span className="alert-time">{alert.timestamp}</span>
                  </div>
                  <p className="alert-desc">{alert.description}</p>
                </div>
                <div className="alert-actions">
                  {alert.actionRoute && (
                    <Link to={alert.actionRoute} className="alert-action-btn" onClick={playFlipSound}>
                      <span>{alert.actionLabel || "View"}</span>
                    </Link>
                  )}
                  <button
                    className="alert-dismiss-btn"
                    onClick={() => handleDismiss(alert.id)}
                    aria-label="Dismiss alert"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Trend Chart */}
      <div className="trend-section-wrapper">
        <TrendChart />
      </div>

      {/* Adaptive Insights Panel */}
      <div className="insights-panel-card">
        <div className="insights-header">
          <Sparkles size={20} className="insights-icon" />
          <h3 className="insights-title">Caregiver Engagement Insights</h3>
        </div>
        <p className="insights-subtitle">
          Generated automatically by Mindora's adaptive engine to guide caregiver check-ins:
        </p>

        <div className="insights-bullets-grid">
          {insights.map((item, idx) => (
            <div key={idx} className={`insight-card-item ${item.level}`}>
              <div className="insight-cat-tag">{item.category}</div>
              <p className="insight-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
