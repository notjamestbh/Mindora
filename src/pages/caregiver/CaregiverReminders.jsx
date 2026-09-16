import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Pill,
  Coffee,
  Brain,
  Footprints,
  Check,
  X
} from 'lucide-react';
import { getReminders, saveReminders, addReminder, toggleReminder } from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import { useStorageListener } from '../../hooks/useStorageListener';
import './CaregiverReminders.css';

export default function CaregiverReminders() {
  const [reminders, setReminders] = useState(getReminders());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_reminders') {
      setReminders(getReminders());
    }
  });

  const [formData, setFormData] = useState({
    title: '',
    time: '08:00 AM',
    category: 'medication',
    notes: ''
  });

  const handleToggle = (id) => {
    playFlipSound();
    const updated = toggleReminder(id);
    setReminders([...updated]);
  };

  const handleDelete = (id, title) => {
    playFlipSound();
    if (window.confirm(`Delete reminder "${title}"?`)) {
      const updated = reminders.filter(r => r.id !== id);
      saveReminders(updated);
      setReminders(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    playSuccessChime();
    const newRem = {
      title: formData.title.trim(),
      time: formData.time,
      category: formData.category,
      notes: formData.notes.trim()
    };

    const updated = addReminder(newRem);
    setReminders([...updated]);
    setIsModalOpen(false);
    setFormData({ title: '', time: '08:00 AM', category: 'medication', notes: '' });

    setNotice(`Reminder "${newRem.title}" added to Amma's daily routine.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medication': return Pill;
      case 'meal': return Coffee;
      case 'activity': return Brain;
      default: return Footprints;
    }
  };

  return (
    <div className="caregiver-reminders-container">
      {/* Header */}
      <div className="reminders-header-row">
        <div>
          <h1 className="caregiver-title">Daily Reminders &amp; Schedule</h1>
          <p className="caregiver-subtitle">
            Configure routine reminders that appear on Amma's screen and answer voice queries.
          </p>
        </div>

        <button className="add-reminder-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Add Reminder</span>
        </button>
      </div>

      {notice && (
        <div className="reminder-notice animate-fade-in">
          <Check size={18} />
          <span>{notice}</span>
        </div>
      )}

      {/* Reminders List */}
      <div className="reminders-table-card">
        {reminders.map((rem) => {
          const Icon = getCategoryIcon(rem.category);
          return (
            <div key={rem.id} className="reminder-row-item">
              <button
                className={`rem-toggle-btn ${rem.completed ? 'completed' : ''}`}
                onClick={() => handleToggle(rem.id)}
                title="Toggle completion status"
              >
                {rem.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>

              <div className="rem-time-col">
                <Clock size={14} className="clock-icon" />
                <span className="time-badge">{rem.time}</span>
              </div>

              <div className="rem-content-col">
                <div className="rem-title-row">
                  <span className={`rem-cat-tag ${rem.category}`}>{rem.category}</span>
                  <h3 className={`rem-title ${rem.completed ? 'done-text' : ''}`}>{rem.title}</h3>
                </div>
                {rem.notes && <p className="rem-notes">{rem.notes}</p>}
              </div>

              <div className="rem-actions-col">
                <button
                  className="delete-rem-btn"
                  onClick={() => handleDelete(rem.id, rem.title)}
                  aria-label="Delete reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding reminder */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="rem-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-heading">Add Daily Routine Reminder</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="rem-modal-form">
              <div className="form-group">
                <label className="form-label">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Ginger Tea, Blood Pressure Tablet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Time</label>
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM, 04:00 PM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  <option value="medication">Medication &amp; Health</option>
                  <option value="meal">Meal &amp; Hydration</option>
                  <option value="activity">Cognitive Activity</option>
                  <option value="wellness">Wellness &amp; Walk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Helpful Guidance / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Take with half glass warm water"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>Save Reminder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
