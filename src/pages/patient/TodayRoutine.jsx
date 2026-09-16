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
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  SlidersHorizontal,
  Repeat,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  getReminders,
  toggleReminder,
  addReminder,
  editReminder,
  deleteReminder
} from '../../utils/storage';
import { playSuccessChime, playFlipSound } from '../../utils/sound';
import { useStorageListener } from '../../hooks/useStorageListener';
import './TodayRoutine.css';

const FREQUENCY_PRESETS = [
  'Once daily (Morning)',
  'Once daily (Night)',
  'Twice daily (Morning & Night)',
  'Thrice daily',
  'Every 8 hours',
  'As needed (SOS)'
];

const TIME_PRESETS_MED = ['08:00 AM', '09:00 AM', '01:00 PM', '07:30 PM', '09:00 PM'];
const TIME_PRESETS_ROUTINE = ['08:00 AM', '10:30 AM', '12:30 PM', '04:30 PM', '08:00 PM'];
const DOSAGE_PRESETS = ['1 Tablet', '2 Tablets', '1 Capsule', '5 ml', '10 ml', '1 Drop'];

export default function TodayRoutine() {
  const [reminders, setReminders] = useState(getReminders());
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('add_medicine'); // 'add_medicine' | 'add_routine' | 'manage' | 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Forms state
  const [medForm, setMedForm] = useState({
    title: '',
    time: '09:00 AM',
    frequency: 'Once daily (Morning)',
    dosage: '1 Tablet',
    notes: ''
  });

  const [routineForm, setRoutineForm] = useState({
    title: '',
    time: '10:30 AM',
    category: 'activity',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    title: '',
    time: '',
    category: 'medication',
    frequency: '',
    dosage: '',
    notes: ''
  });

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_reminders') {
      setReminders(getReminders());
    }
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleToggle = (id) => {
    playFlipSound();
    const updated = toggleReminder(id);
    setReminders([...updated]);

    const toggledItem = updated.find((r) => r.id === id);
    if (toggledItem?.completed) {
      playSuccessChime();
    }
  };

  // Open customizer modal
  const openCustomizer = (tab = 'add_medicine') => {
    playFlipSound();
    setActiveTab(tab);
    setEditingItem(null);
    setModalOpen(true);
  };

  // Open inline edit for specific item
  const openEditModal = (item) => {
    playFlipSound();
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      time: item.time || '09:00 AM',
      category: item.category || 'medication',
      frequency: item.frequency || (item.category === 'medication' ? 'Once daily (Morning)' : ''),
      dosage: item.dosage || (item.category === 'medication' ? '1 Tablet' : ''),
      notes: item.notes || ''
    });
    setActiveTab('edit');
    setModalOpen(true);
  };

  // Handlers for Add Medicine
  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();
    if (!medForm.title.trim()) return;

    playSuccessChime();
    const newMed = {
      title: medForm.title.trim(),
      time: medForm.time.trim() || '09:00 AM',
      category: 'medication',
      frequency: medForm.frequency.trim() || 'Once daily',
      dosage: medForm.dosage.trim() || '1 Tablet',
      notes: medForm.notes.trim()
    };

    const updated = addReminder(newMed);
    setReminders([...updated]);
    setModalOpen(false);
    setMedForm({
      title: '',
      time: '09:00 AM',
      frequency: 'Once daily (Morning)',
      dosage: '1 Tablet',
      notes: ''
    });
    showToast(`Added medicine "${newMed.title}" for ${newMed.time}`);
  };

  // Handlers for Add Routine
  const handleAddRoutineSubmit = (e) => {
    e.preventDefault();
    if (!routineForm.title.trim()) return;

    playSuccessChime();
    const newRoutine = {
      title: routineForm.title.trim(),
      time: routineForm.time.trim() || '10:30 AM',
      category: routineForm.category,
      notes: routineForm.notes.trim()
    };

    const updated = addReminder(newRoutine);
    setReminders([...updated]);
    setModalOpen(false);
    setRoutineForm({
      title: '',
      time: '10:30 AM',
      category: 'activity',
      notes: ''
    });
    showToast(`Added schedule routine "${newRoutine.title}" at ${newRoutine.time}`);
  };

  // Handlers for Save Edit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingItem || !editForm.title.trim()) return;

    playSuccessChime();
    const updates = {
      title: editForm.title.trim(),
      time: editForm.time.trim(),
      category: editForm.category,
      notes: editForm.notes.trim()
    };

    if (editForm.category === 'medication') {
      updates.frequency = editForm.frequency.trim() || 'Once daily';
      updates.dosage = editForm.dosage.trim();
    }

    const updated = editReminder(editingItem.id, updates);
    setReminders([...updated]);
    setModalOpen(false);
    setEditingItem(null);
    showToast(`Updated "${updates.title}" successfully`);
  };

  // Delete item handler
  const handleDeleteItem = (id, title) => {
    playFlipSound();
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      const updated = deleteReminder(id);
      setReminders([...updated]);
      if (editingItem?.id === id) {
        setEditingItem(null);
        setActiveTab('manage');
      }
      showToast(`Removed "${title}" from daily schedule.`);
    }
  };

  const completedCount = reminders.filter((r) => r.completed).length;
  const medications = reminders.filter((r) => r.category === 'medication');
  const generalRoutines = reminders.filter((r) => r.category !== 'medication');
  const medsCompletedCount = medications.filter((m) => m.completed).length;
  const routinesCompletedCount = generalRoutines.filter((g) => g.completed).length;

  const getEncouragement = () => {
    if (completedCount === reminders.length && reminders.length > 0) {
      return 'All daily routines & medicines completed. Relax and have a restful evening.';
    }
    if (medsCompletedCount === medications.length && medications.length > 0) {
      return 'All scheduled medicines taken on time! Keep going with your peaceful day.';
    }
    if (completedCount >= 2) {
      return 'Well done. Your daily routine is progressing steadily.';
    }
    return 'Take your time. Each moment at your own gentle pace.';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medication':
        return Pill;
      case 'meal':
        return Coffee;
      case 'activity':
        return Brain;
      case 'wellness':
        return Footprints;
      default:
        return Clock;
    }
  };

  return (
    <div className="today-routine-container">
      {/* Header */}
      <div className="today-header">
        <div>
          <div className="today-title-row">
            <h1 className="patient-greeting">Today's Schedule</h1>
          </div>
          <p className="patient-subhead">Your daily medicines &amp; routine at a glance.</p>
        </div>

        <div className="header-right-actions">
          <div className="progress-badge">
            <span>
              {completedCount} of {reminders.length} Done
            </span>
          </div>

          {/* Fully customizable Caregiver button */}
          <button
            className="caregiver-customizer-btn"
            onClick={() => openCustomizer('add_medicine')}
            title="Caregiver: Customize medicines and daily schedule"
          >
            <SlidersHorizontal size={17} />
            <span>Customize Schedule &amp; Medicines</span>
            <span className="caregiver-pill-tag">Caregiver</span>
          </button>
        </div>
      </div>

      {/* Toast notice */}
      {toastMessage && (
        <div className="customizer-toast animate-fade-in">
          <Check size={18} className="toast-check-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Encouragement Banner */}
      <div className="today-encouragement-banner">
        <Sparkles size={18} className="encouragement-sparkle" />
        <p className="encouragement-text">{getEncouragement()}</p>
      </div>

      {/* SECTION 1: MEDICINES & HEALTH */}
      <section className="routine-section-group" aria-labelledby="medicines-section-title">
        <div className="section-header-bar">
          <div className="section-header-left">
            <div className="section-icon-badge medicine-badge">
              <Pill size={20} />
            </div>
            <div>
              <h2 id="medicines-section-title" className="section-heading">
                Medicines &amp; Health
              </h2>
              <p className="section-subtitle">
                Track dosages, timings, and medicine frequency.
              </p>
            </div>
          </div>

          <div className="section-header-right">
            <span className="section-count-badge">
              {medsCompletedCount}/{medications.length} Taken
            </span>
            <button
              className="section-add-btn"
              onClick={() => openCustomizer('add_medicine')}
              title="Add New Medicine"
            >
              <Plus size={15} />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>

        {medications.length === 0 ? (
          <div className="empty-section-card">
            <Pill size={32} className="empty-icon" />
            <p>No medicines scheduled for today.</p>
            <button
              className="empty-cta-btn"
              onClick={() => openCustomizer('add_medicine')}
            >
              <Plus size={16} /> Add Amma's Medicine
            </button>
          </div>
        ) : (
          <div className="routine-timeline-list">
            {medications.map((rem, idx) => {
              const isDone = rem.completed;
              const isNextActive = !isDone && (idx === 0 || medications[idx - 1]?.completed);

              return (
                <div
                  key={rem.id}
                  className={`timeline-item-card medicine-card ${
                    isDone ? 'done' : isNextActive ? 'active' : 'upcoming'
                  }`}
                  onClick={() => handleToggle(rem.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${rem.title} at ${rem.time}. ${
                    isDone ? 'Completed' : 'Tap to mark taken'
                  }`}
                >
                  <div className="timeline-left-time">
                    <span className="time-string">{rem.time}</span>
                    <div
                      className={`status-indicator-dot ${
                        isDone ? 'dot-done' : isNextActive ? 'dot-active' : 'dot-upcoming'
                      }`}
                    />
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-title-row">
                      <div className="timeline-icon-wrap medication">
                        <Pill size={20} />
                      </div>
                      <div className="medicine-meta-block">
                        <h3 className="timeline-title">{rem.title}</h3>

                        {/* Medicine Timing & Frequency badges */}
                        <div className="med-badges-row">
                          <span className="med-badge time-pill">
                            <Clock size={12} />
                            <span>Timing: {rem.time}</span>
                          </span>
                          {rem.frequency && (
                            <span className="med-badge frequency-pill">
                              <Repeat size={12} />
                              <span>{rem.frequency}</span>
                            </span>
                          )}
                          {rem.dosage && (
                            <span className="med-badge dosage-pill">
                              <span>Dose: {rem.dosage}</span>
                            </span>
                          )}
                        </div>

                        {rem.notes && <p className="timeline-notes">{rem.notes}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Actions column: Caregiver Quick Edit + Done toggle */}
                  <div className="timeline-action-col">
                    <button
                      type="button"
                      className="caregiver-quick-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(rem);
                      }}
                      title="Caregiver: Edit this medicine"
                      aria-label="Edit medicine"
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>

                    <div className="timeline-action-check">
                      {isDone ? (
                        <div className="check-done-pill">
                          <CheckCircle2 size={20} className="check-icon" />
                          <span>Taken</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mark-done-btn"
                          aria-label="Mark medicine taken"
                        >
                          <Circle size={20} className="circle-empty" />
                          <span>Mark Taken</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: DAILY ROUTINE & ACTIVITIES */}
      <section className="routine-section-group" aria-labelledby="routines-section-title">
        <div className="section-header-bar">
          <div className="section-header-left">
            <div className="section-icon-badge routine-badge">
              <Calendar size={20} />
            </div>
            <div>
              <h2 id="routines-section-title" className="section-heading">
                Daily Routine &amp; Activities
              </h2>
              <p className="section-subtitle">
                Gentle daily rhythm of meals, cognitive exercises, and walks.
              </p>
            </div>
          </div>

          <div className="section-header-right">
            <span className="section-count-badge">
              {routinesCompletedCount}/{generalRoutines.length} Done
            </span>
            <button
              className="section-add-btn"
              onClick={() => openCustomizer('add_routine')}
              title="Add Daily Routine"
            >
              <Plus size={15} />
              <span>Add Routine</span>
            </button>
          </div>
        </div>

        {generalRoutines.length === 0 ? (
          <div className="empty-section-card">
            <Calendar size={32} className="empty-icon" />
            <p>No routines scheduled for today.</p>
            <button
              className="empty-cta-btn"
              onClick={() => openCustomizer('add_routine')}
            >
              <Plus size={16} /> Add Daily Routine
            </button>
          </div>
        ) : (
          <div className="routine-timeline-list">
            {generalRoutines.map((rem, idx) => {
              const Icon = getCategoryIcon(rem.category);
              const isDone = rem.completed;
              const isNextActive =
                !isDone && (idx === 0 || generalRoutines[idx - 1]?.completed);

              return (
                <div
                  key={rem.id}
                  className={`timeline-item-card ${
                    isDone ? 'done' : isNextActive ? 'active' : 'upcoming'
                  }`}
                  onClick={() => handleToggle(rem.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${rem.title} at ${rem.time}. ${
                    isDone ? 'Completed' : 'Tap to mark done'
                  }`}
                >
                  <div className="timeline-left-time">
                    <span className="time-string">{rem.time}</span>
                    <div
                      className={`status-indicator-dot ${
                        isDone ? 'dot-done' : isNextActive ? 'dot-active' : 'dot-upcoming'
                      }`}
                    />
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-title-row">
                      <div className={`timeline-icon-wrap ${rem.category}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="routine-title-header">
                          <h3 className="timeline-title">{rem.title}</h3>
                          <span className={`cat-pill-badge ${rem.category}`}>
                            {rem.category}
                          </span>
                        </div>
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

                  {/* Actions column: Caregiver Quick Edit + Done toggle */}
                  <div className="timeline-action-col">
                    <button
                      type="button"
                      className="caregiver-quick-edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(rem);
                      }}
                      title="Caregiver: Edit this routine"
                      aria-label="Edit routine"
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>

                    <div className="timeline-action-check">
                      {isDone ? (
                        <div className="check-done-pill">
                          <CheckCircle2 size={20} className="check-icon" />
                          <span>Done</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="mark-done-btn"
                          aria-label="Mark done"
                        >
                          <Circle size={20} className="circle-empty" />
                          <span>Mark Done</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CAREGIVER SCHEDULE & MEDICINE CUSTOMIZATION MODAL */}
      {modalOpen && (
        <div
          className="modal-backdrop animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="schedule-customizer-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-modal-title"
          >
            {/* Modal Header */}
            <div className="customizer-modal-header">
              <div className="customizer-header-title-wrap">
                <div className="caregiver-badge-chip">
                  <ShieldCheck size={14} />
                  <span>Caregiver Portal</span>
                </div>
                <h2 id="customizer-modal-title" className="customizer-modal-heading">
                  Schedule &amp; Medicine Customizer
                </h2>
                <p className="customizer-modal-sub">
                  Full control over Amma's daily medicines, timings, frequencies, and routine.
                </p>
              </div>

              <button
                className="customizer-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close customizer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customizer Navigation Tabs */}
            <div className="customizer-nav-tabs">
              <button
                className={`customizer-tab-btn ${activeTab === 'add_medicine' ? 'active' : ''}`}
                onClick={() => {
                  playFlipSound();
                  setActiveTab('add_medicine');
                  setEditingItem(null);
                }}
              >
                <Pill size={16} />
                <span>Add Medicine</span>
              </button>

              <button
                className={`customizer-tab-btn ${activeTab === 'add_routine' ? 'active' : ''}`}
                onClick={() => {
                  playFlipSound();
                  setActiveTab('add_routine');
                  setEditingItem(null);
                }}
              >
                <Calendar size={16} />
                <span>Add Routine</span>
              </button>

              <button
                className={`customizer-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                onClick={() => {
                  playFlipSound();
                  setActiveTab('manage');
                  setEditingItem(null);
                }}
              >
                <SlidersHorizontal size={16} />
                <span>Manage All ({reminders.length})</span>
              </button>

              {editingItem && activeTab === 'edit' && (
                <button className="customizer-tab-btn active editing-tab">
                  <Edit2 size={16} />
                  <span>Edit: {editingItem.title?.substring(0, 18)}...</span>
                </button>
              )}
            </div>

            {/* TAB 1: ADD NEW MEDICINE */}
            {activeTab === 'add_medicine' && (
              <form onSubmit={handleAddMedicineSubmit} className="customizer-form-body">
                <div className="form-alert-info">
                  <Pill size={18} />
                  <span>
                    New medicines will automatically appear in Amma's routine, trigger reminder checks, and update TalkBot voice responses.
                  </span>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">
                    Medicine Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blood Pressure Tablet, Multivitamin, Eye Drops"
                    value={medForm.title}
                    onChange={(e) => setMedForm({ ...medForm, title: e.target.value })}
                    className="customizer-form-input"
                  />
                </div>

                {/* Medicine Timing */}
                <div className="customizer-form-group">
                  <div className="label-with-presets">
                    <label className="customizer-form-label">
                      Medicine Timing <span className="req-star">*</span>
                    </label>
                    <span className="preset-hint">Quick select or type custom</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={medForm.time}
                    onChange={(e) => setMedForm({ ...medForm, time: e.target.value })}
                    className="customizer-form-input"
                  />
                  <div className="quick-presets-chips">
                    {TIME_PRESETS_MED.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-chip ${medForm.time === preset ? 'selected' : ''}`}
                        onClick={() => setMedForm({ ...medForm, time: preset })}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Frequency */}
                <div className="customizer-form-group">
                  <div className="label-with-presets">
                    <label className="customizer-form-label">
                      Medicine Frequency <span className="req-star">*</span>
                    </label>
                    <span className="preset-hint">How often Amma takes this</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Once daily (Morning), Twice daily, As needed"
                    value={medForm.frequency}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    className="customizer-form-input"
                  />
                  <div className="quick-presets-chips">
                    {FREQUENCY_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-chip ${
                          medForm.frequency === preset ? 'selected' : ''
                        }`}
                        onClick={() => setMedForm({ ...medForm, frequency: preset })}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine Dosage */}
                <div className="customizer-form-group">
                  <label className="customizer-form-label">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tablet, 1 Capsule, 5 ml"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    className="customizer-form-input"
                  />
                  <div className="quick-presets-chips">
                    {DOSAGE_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`preset-chip ${medForm.dosage === d ? 'selected' : ''}`}
                        onClick={() => setMedForm({ ...medForm, dosage: d })}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes / Instructions */}
                <div className="customizer-form-group">
                  <label className="customizer-form-label">Caregiver Guidance &amp; Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Take after morning breakfast with half a glass of warm water"
                    value={medForm.notes}
                    onChange={(e) => setMedForm({ ...medForm, notes: e.target.value })}
                    className="customizer-form-input"
                  />
                </div>

                <div className="customizer-form-actions">
                  <button
                    type="button"
                    className="customizer-btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="customizer-btn-primary">
                    <Check size={18} />
                    <span>Save Medicine to Schedule</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ADD DAILY ROUTINE */}
            {activeTab === 'add_routine' && (
              <form onSubmit={handleAddRoutineSubmit} className="customizer-form-body">
                <div className="form-alert-info">
                  <Calendar size={18} />
                  <span>
                    Add meals, garden strolls, or rest schedules to support Amma's daily routine consistency.
                  </span>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">
                    Routine Title <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verandah Walk, Afternoon Ginger Tea, Family Video Call"
                    value={routineForm.title}
                    onChange={(e) =>
                      setRoutineForm({ ...routineForm, title: e.target.value })
                    }
                    className="customizer-form-input"
                  />
                </div>

                <div className="customizer-form-group">
                  <div className="label-with-presets">
                    <label className="customizer-form-label">
                      Scheduled Time <span className="req-star">*</span>
                    </label>
                    <span className="preset-hint">Quick select or type custom</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={routineForm.time}
                    onChange={(e) =>
                      setRoutineForm({ ...routineForm, time: e.target.value })
                    }
                    className="customizer-form-input"
                  />
                  <div className="quick-presets-chips">
                    {TIME_PRESETS_ROUTINE.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-chip ${
                          routineForm.time === preset ? 'selected' : ''
                        }`}
                        onClick={() => setRoutineForm({ ...routineForm, time: preset })}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">Category</label>
                  <select
                    value={routineForm.category}
                    onChange={(e) =>
                      setRoutineForm({ ...routineForm, category: e.target.value })
                    }
                    className="customizer-form-select"
                  >
                    <option value="meal">Meal &amp; Hydration</option>
                    <option value="activity">Cognitive Activity &amp; Mindora Game</option>
                    <option value="wellness">Wellness, Garden &amp; Stroll</option>
                    <option value="routine">General Rest &amp; Care</option>
                  </select>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">Helpful Guidance / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh seasonal fruit, warm sunshine on the verandah"
                    value={routineForm.notes}
                    onChange={(e) =>
                      setRoutineForm({ ...routineForm, notes: e.target.value })
                    }
                    className="customizer-form-input"
                  />
                </div>

                <div className="customizer-form-actions">
                  <button
                    type="button"
                    className="customizer-btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="customizer-btn-primary">
                    <Check size={18} />
                    <span>Save Routine Schedule</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: MANAGE ALL ITEMS */}
            {activeTab === 'manage' && (
              <div className="customizer-manage-container">
                <div className="manage-filter-bar">
                  <div className="filter-pill-group">
                    <button
                      className={`filter-pill ${filterCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setFilterCategory('all')}
                    >
                      All ({reminders.length})
                    </button>
                    <button
                      className={`filter-pill ${filterCategory === 'medication' ? 'active' : ''}`}
                      onClick={() => setFilterCategory('medication')}
                    >
                      Medicines ({medications.length})
                    </button>
                    <button
                      className={`filter-pill ${filterCategory === 'routines' ? 'active' : ''}`}
                      onClick={() => setFilterCategory('routines')}
                    >
                      Routines ({generalRoutines.length})
                    </button>
                  </div>

                  <div className="manage-quick-add-group">
                    <button
                      className="manage-quick-btn"
                      onClick={() => setActiveTab('add_medicine')}
                    >
                      <Plus size={14} /> New Medicine
                    </button>
                    <button
                      className="manage-quick-btn"
                      onClick={() => setActiveTab('add_routine')}
                    >
                      <Plus size={14} /> New Routine
                    </button>
                  </div>
                </div>

                <div className="manage-items-list">
                  {reminders
                    .filter((item) => {
                      if (filterCategory === 'medication') return item.category === 'medication';
                      if (filterCategory === 'routines') return item.category !== 'medication';
                      return true;
                    })
                    .map((item) => {
                      const isMed = item.category === 'medication';
                      const Icon = getCategoryIcon(item.category);

                      return (
                        <div key={item.id} className="manage-item-row">
                          <div className="manage-item-info">
                            <div className="manage-item-top">
                              <span className="manage-time-tag">{item.time}</span>
                              <span
                                className={`cat-pill-badge ${
                                  isMed ? 'medication' : item.category
                                }`}
                              >
                                {isMed ? 'Medicine' : item.category}
                              </span>
                              {item.frequency && (
                                <span className="med-badge frequency-pill">
                                  <Repeat size={11} />
                                  <span>{item.frequency}</span>
                                </span>
                              )}
                              {item.dosage && (
                                <span className="med-badge dosage-pill">
                                  <span>{item.dosage}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="manage-item-title">{item.title}</h4>
                            {item.notes && (
                              <p className="manage-item-notes">{item.notes}</p>
                            )}
                          </div>

                          <div className="manage-item-actions">
                            <button
                              type="button"
                              className="manage-edit-btn"
                              onClick={() => openEditModal(item)}
                              title="Edit this item"
                            >
                              <Edit2 size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="manage-delete-btn"
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              title="Delete this item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 4: EDIT EXISTING ITEM */}
            {activeTab === 'edit' && editingItem && (
              <form onSubmit={handleEditSubmit} className="customizer-form-body">
                <div className="form-alert-info edit-mode-alert">
                  <Edit2 size={18} />
                  <span>
                    Editing <strong>"{editingItem.title}"</strong>. Changes take effect immediately across Amma's schedule and voice assistant.
                  </span>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">
                    Title <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="customizer-form-input"
                  />
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">
                    Scheduled Timing <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="customizer-form-input"
                  />
                  <div className="quick-presets-chips">
                    {(editForm.category === 'medication'
                      ? TIME_PRESETS_MED
                      : TIME_PRESETS_ROUTINE
                    ).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`preset-chip ${
                          editForm.time === preset ? 'selected' : ''
                        }`}
                        onClick={() => setEditForm({ ...editForm, time: preset })}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="customizer-form-group">
                  <label className="customizer-form-label">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="customizer-form-select"
                  >
                    <option value="medication">Medication &amp; Health</option>
                    <option value="meal">Meal &amp; Hydration</option>
                    <option value="activity">Cognitive Activity</option>
                    <option value="wellness">Wellness &amp; Walk</option>
                    <option value="routine">General Routine</option>
                  </select>
                </div>

                {/* If Medication, show Frequency & Dosage fields */}
                {editForm.category === 'medication' && (
                  <>
                    <div className="customizer-form-group">
                      <div className="label-with-presets">
                        <label className="customizer-form-label">
                          Medicine Frequency
                        </label>
                        <span className="preset-hint">Presets or custom</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Once daily (Morning)"
                        value={editForm.frequency}
                        onChange={(e) =>
                          setEditForm({ ...editForm, frequency: e.target.value })
                        }
                        className="customizer-form-input"
                      />
                      <div className="quick-presets-chips">
                        {FREQUENCY_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`preset-chip ${
                              editForm.frequency === preset ? 'selected' : ''
                            }`}
                            onClick={() => setEditForm({ ...editForm, frequency: preset })}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="customizer-form-group">
                      <label className="customizer-form-label">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Tablet"
                        value={editForm.dosage}
                        onChange={(e) =>
                          setEditForm({ ...editForm, dosage: e.target.value })
                        }
                        className="customizer-form-input"
                      />
                      <div className="quick-presets-chips">
                        {DOSAGE_PRESETS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            className={`preset-chip ${
                              editForm.dosage === d ? 'selected' : ''
                            }`}
                            onClick={() => setEditForm({ ...editForm, dosage: d })}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="customizer-form-group">
                  <label className="customizer-form-label">Notes &amp; Guidance</label>
                  <input
                    type="text"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="customizer-form-input"
                  />
                </div>

                <div className="customizer-form-actions between">
                  <button
                    type="button"
                    className="customizer-btn-delete"
                    onClick={() => handleDeleteItem(editingItem.id, editingItem.title)}
                  >
                    <Trash2 size={16} />
                    <span>Delete Schedule</span>
                  </button>

                  <div className="right-btn-group">
                    <button
                      type="button"
                      className="customizer-btn-secondary"
                      onClick={() => {
                        setEditingItem(null);
                        setActiveTab('manage');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="customizer-btn-primary">
                      <Check size={18} />
                      <span>Update Schedule</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
