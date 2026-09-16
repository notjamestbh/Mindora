import React, { useState } from 'react';
import {
  Compass,
  Globe,
  Sparkles,
  Heart,
  Save,
  Check,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { getPatient, savePatient } from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import './CaregiverProfile.css';

const NER_REGIONS = [
  "North Eastern Region (Assam)",
  "North Eastern Region (Meghalaya)",
  "North Eastern Region (Manipur)",
  "North Eastern Region (Mizoram)",
  "North Eastern Region (Nagaland)",
  "North Eastern Region (Arunachal Pradesh)",
  "North Eastern Region (Tripura)",
  "North Eastern Region (Sikkim)"
];

const CULTURAL_OPTIONS = [
  "Morning Tea & Sewali Flowers",
  "Namghar Prayer Bells",
  "Bihu Folk Melodies",
  "Traditional Loom & Gamosa",
  "Verandah Garden Walk",
  "Steamed Joha Rice & Lentils",
  "Vintage Valve Radio Ragas",
  "Brahmaputra Sunset Walk"
];

export default function CaregiverProfile() {
  const [patient, setPatientState] = useState(getPatient());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleToggleCulture = (opt) => {
    playFlipSound();
    const current = patient.culturalPreferences || [];
    const next = current.includes(opt)
      ? current.filter(item => item !== opt)
      : [...current, opt];

    const updated = { ...patient, culturalPreferences: next };
    setPatientState(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    playSuccessChime();
    savePatient(patient);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="caregiver-profile-container">
      <div className="profile-header-area">
        <div>
          <h1 className="caregiver-title">Patient World &amp; Cultural Customization</h1>
          <p className="caregiver-subtitle">
            Configure Amma's cultural background, familiar references, and caregiver contact details.
          </p>
        </div>

        <button className="btn-accent" onClick={handleSave}>
          <Save size={18} />
          <span>Save Changes</span>
        </button>
      </div>

      {savedNotice && (
        <div className="save-banner animate-fade-in">
          <Check size={18} />
          <span>Patient profile and cultural preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="caregiver-profile-form">
        {/* Patient Identity */}
        <div className="form-card">
          <div className="card-section-title">
            <UserCheck size={20} className="section-icon" />
            <h3>Patient Identity</h3>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Calling Name (Familiar)</label>
              <input
                type="text"
                value={patient.name}
                onChange={(e) => setPatientState({ ...patient, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={patient.fullName}
                onChange={(e) => setPatientState({ ...patient, fullName: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                value={patient.age}
                onChange={(e) => setPatientState({ ...patient, age: parseInt(e.target.value) || 68 })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Caregiver Contact Name</label>
              <input
                type="text"
                value={patient.caregiver}
                onChange={(e) => setPatientState({ ...patient, caregiver: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Region and Cultural Touchpoints */}
        <div className="form-card">
          <div className="card-section-title">
            <Compass size={20} className="section-icon" />
            <h3>Familiar World (NER Cultural Personalization)</h3>
          </div>
          <p className="card-desc">
            Selecting familiar cultural items helps Mindora populate cognitive exercises with
            natural autobiographical associations from the North Eastern Region.
          </p>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Geographic &amp; Cultural Region</label>
            <select
              value={patient.region}
              onChange={(e) => setPatientState({ ...patient, region: e.target.value })}
              className="form-select"
            >
              {NER_REGIONS.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Active Cultural Touchpoints</label>
            <div className="cultural-checkbox-grid">
              {CULTURAL_OPTIONS.map((opt, idx) => {
                const isChecked = (patient.culturalPreferences || []).includes(opt);
                return (
                  <button
                    type="button"
                    key={idx}
                    className={`cultural-toggle-pill ${isChecked ? 'selected' : ''}`}
                    onClick={() => handleToggleCulture(opt)}
                  >
                    <span className="pill-checkbox">{isChecked ? '✓' : ''}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Caregiver Observation Notes */}
        <div className="form-card">
          <div className="card-section-title">
            <Heart size={20} className="section-icon" />
            <h3>Caregiver Pacing &amp; Notes</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Personal Routine Notes</label>
            <textarea
              rows={3}
              value={patient.notes}
              onChange={(e) => setPatientState({ ...patient, notes: e.target.value })}
              className="form-textarea"
              placeholder="e.g. Responds warmly to morning tea and family pictures..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}
