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
  X,
  Edit2,
  Repeat
} from 'lucide-react';
import {
  getReminders,
  saveReminders,
  addReminder,
  editReminder,
  toggleReminder
} from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import { useStorageListener } from '../../hooks/useStorageListener';
import './CaregiverReminders.css';

export default function CaregiverReminders() {
  const [reminders, setReminders] = useState(getReminders());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
    frequency: 'Once daily (Morning)',
    dosage: '1 Tablet',
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
      const updated = reminders.filter((r) => r.id !== id);
      saveReminders(updated);
      setReminders(updated);
    }
  };

  const handleOpenAdd = () => {
    playFlipSound();
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      time: '08:00 AM',
      category: 'medication',
      frequency: 'Once daily (Morning)',
      dosage: '1 Tablet',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rem) => {
    playFlipSound();
    setIsEditing(true);
    setEditingId(rem.id);
    setFormData({
      title: rem.title || '',
      time: rem.time || '08:00 AM',
      category: rem.category || 'medication',
      frequency: rem.frequency || (rem.category === 'medication' ? 'Once daily (Morning)' : ''),
      dosage: rem.dosage || (rem.category === 'medication' ? '1 Tablet' : ''),
      notes: rem.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    playSuccessChime();

    if (isEditing && editingId) {
      const updates = {
        title: formData.title.trim(),
        time: formData.time,
        category: formData.category,
        notes: formData.notes.trim()
      };
      if (formData.category === 'medication') {
        updates.frequency = formData.frequency.trim() || 'Once daily';
        updates.dosage = formData.dosage.trim();
      }
      const updated = editReminder(editingId, updates);
      setReminders([...updated]);
      setIsModalOpen(false);
      setNotice(`Updated "${updates.title}" successfully.`);
    } else {
      const newRem = {
        title: formData.title.trim(),
        time: formData.time,
        category: formData.category,
        notes: formData.notes.trim()
      };
      if (formData.category === 'medication') {
        newRem.frequency = formData.frequency.trim() || 'Once daily';
        newRem.dosage = formData.dosage.trim();
      }

      const updated = addReminder(newRem);
      setReminders([...updated]);
      setIsModalOpen(false);
      setNotice(`Reminder "${newRem.title}" added to Amma's daily routine.`);
    }

    setTimeout(() => setNotice(null), 3500);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medication':
        return Pill;
      case 'meal':
        return Coffee;
      case 'activity':
        return Brain;
      default:
        return Footprints;
    }
  };

  return (
    <div className="caregiver-reminders-container">
      {/* Header */}
      <div className="reminders-header-row">
        <div>
          <h1 className="caregiver-title">Daily Reminders &amp; Schedule</h1>
          <p className="caregiver-subtitle">
            Configure routine reminders and medicines that appear on Amma's screen and answer voice queries.
          </p>
        </div>

        <button className="add-reminder-btn" onClick={handleOpenAdd}>
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
                  <h3 className={`rem-title ${rem.completed ? 'done-text' : ''}`}>
                    {rem.title}
                  </h3>
                  {rem.frequency && (
                    <span className="rem-freq-tag">
                      <Repeat size={11} />
                      <span>{rem.frequency}</span>
                    </span>
                  )}
                  {rem.dosage && (
                    <span className="rem-dose-tag">
                      <span>{rem.dosage}</span>
                    </span>
                  )}
                </div>
                {rem.notes && <p className="rem-notes">{rem.notes}</p>}
              </div>

              <div className="rem-actions-col">
                <button
                  className="edit-rem-btn"
                  onClick={() => handleOpenEdit(rem)}
                  title="Edit reminder"
                  aria-label="Edit reminder"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="delete-rem-btn"
                  onClick={() => handleDelete(rem.id, rem.title)}
                  title="Delete reminder"
                  aria-label="Delete reminder"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding/editing reminder */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="rem-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-heading">
                {isEditing ? 'Edit Routine Reminder' : 'Add Daily Routine Reminder'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
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

              {formData.category === 'medication' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Medicine Frequency</label>
                    <input
                      type="text"
                      placeholder="e.g. Once daily (Morning), Twice daily"
                      value={formData.frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Tablet, 5 ml"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </>
              )}

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
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>{isEditing ? 'Update Reminder' : 'Save Reminder'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
