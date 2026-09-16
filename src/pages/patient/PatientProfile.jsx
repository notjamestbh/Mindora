import React, { useState } from 'react';
import {
  User,
  Heart,
  Globe,
  Type,
  Volume2,
  VolumeX,
  Eye,
  RotateCcw,
  Sparkles,
  Compass,
  Check
} from 'lucide-react';
import {
  getPatient,
  savePatient,
  getSettings,
  saveSettings,
  getMemories,
  getActivities,
  resetToDefaults
} from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import './PatientProfile.css';

export default function PatientProfile() {
  const [patient, setPatientState] = useState(getPatient());
  const [settings, setSettingsState] = useState(getSettings());
  const [memories] = useState(getMemories());
  const [activities] = useState(getActivities());
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleUpdateTextSize = (size) => {
    playFlipSound();
    const updated = { ...settings, textSize: size };
    setSettingsState(saveSettings(updated));
  };

  const handleToggleSound = () => {
    playFlipSound();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettingsState(saveSettings(updated));
  };

  const handleToggleContrast = () => {
    playFlipSound();
    const updated = { ...settings, highContrast: !settings.highContrast };
    setSettingsState(saveSettings(updated));
  };

  const handleLanguageChange = (lang) => {
    playFlipSound();
    const updated = { ...settings, language: lang };
    setSettingsState(saveSettings(updated));
    const updatedPatient = { ...patient, preferredLanguage: lang };
    setPatientState(savePatient(updatedPatient));
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm("Reset demo data to initial state? This restores default memories and activities.")) {
      resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="patient-profile-container">
      <div className="profile-header">
        <h1 className="patient-greeting">Profile &amp; Settings</h1>
        <p className="patient-subhead">Personal preferences and accessibility support.</p>
      </div>

      {showSavedMsg && (
        <div className="save-notice-pill animate-fade-in">
          <Check size={16} />
          <span>Preferences updated</span>
        </div>
      )}

      {/* Patient Summary Card */}
      <div className="profile-summary-card">
        <div className="profile-avatar-wrap">
          <User size={38} />
        </div>
        <div className="profile-info-block">
          <h2 className="patient-name-title">{patient.name}</h2>
          <p className="patient-meta-text">
            {patient.fullName} &bull; {patient.age} years old
          </p>
          <div className="profile-tags-row">
            <span className="profile-tag">
              <Compass size={13} />
              <span>{patient.region}</span>
            </span>
            <span className="profile-tag">
              <Heart size={13} />
              <span>Caregiver: {patient.caregiver} ({patient.caregiverRelation})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="settings-group-card">
        <h3 className="group-title">Accessibility &amp; Comfort</h3>

        {/* Text Size */}
        <div className="setting-row">
          <div className="setting-label-col">
            <div className="setting-icon-title">
              <Type size={18} />
              <strong>Text Size</strong>
            </div>
            <p className="setting-desc">Enlarge text across all screens for relaxed reading.</p>
          </div>

          <div className="text-size-options">
            {[
              { id: 'small', label: 'Small' },
              { id: 'normal', label: 'Normal' },
              { id: 'large', label: 'Large' },
              { id: 'xlarge', label: 'Extra Large' }
            ].map((size) => (
              <button
                key={size.id}
                className={`size-toggle-btn ${settings.textSize === size.id ? 'active' : ''}`}
                onClick={() => handleUpdateTextSize(size.id)}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Feedback */}
        <div className="setting-row">
          <div className="setting-label-col">
            <div className="setting-icon-title">
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <strong>Audio Feedback</strong>
            </div>
            <p className="setting-desc">Gentle, calming acoustic chimes for card flips and completed activities.</p>
          </div>

          <button
            className={`toggle-switch-btn ${settings.soundEnabled ? 'on' : 'off'}`}
            onClick={handleToggleSound}
            aria-label="Toggle sound"
          >
            <span>{settings.soundEnabled ? 'On' : 'Muted'}</span>
          </button>
        </div>

        {/* High Contrast */}
        <div className="setting-row">
          <div className="setting-label-col">
            <div className="setting-icon-title">
              <Eye size={18} />
              <strong>High Contrast</strong>
            </div>
            <p className="setting-desc">Enhances borders and text contrast for low vision clarity.</p>
          </div>

          <button
            className={`toggle-switch-btn ${settings.highContrast ? 'on' : 'off'}`}
            onClick={handleToggleContrast}
            aria-label="Toggle high contrast"
          >
            <span>{settings.highContrast ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="settings-group-card">
        <h3 className="group-title">Language &amp; Region</h3>

        <div className="setting-row">
          <div className="setting-label-col">
            <div className="setting-icon-title">
              <Globe size={18} />
              <strong>Preferred Language</strong>
            </div>
            <p className="setting-desc">Translates patient navigation and common voice prompts.</p>
          </div>

          <div className="language-options-grid">
            {[
              { code: 'en', name: 'English' },
              { code: 'ml', name: 'Malayalam (മലയാളം)' },
              { code: 'hi', name: 'Hindi (हिंदी)' },
              { code: 'as', name: 'Assamese (অসমীয়া)' }
            ].map((lang) => (
              <button
                key={lang.code}
                className={`lang-option-btn ${settings.language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cultural Familiarity World */}
      <div className="settings-group-card">
        <h3 className="group-title">Familiar World (NER Cultural Touchpoints)</h3>
        <p className="group-subtext">
          Elements built into cognitive exercises to stimulate autobiographical memory:
        </p>

        <div className="cultural-tags-list">
          {patient.culturalPreferences.map((pref, i) => (
            <span key={i} className="cultural-chip">
              <Sparkles size={14} className="chip-sparkle" />
              <span>{pref}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Demo Reset */}
      <div className="demo-reset-row">
        <button className="reset-demo-btn" onClick={handleReset}>
          <RotateCcw size={16} />
          <span>Reset Demo Data to Initial Defaults</span>
        </button>
      </div>
    </div>
  );
}
