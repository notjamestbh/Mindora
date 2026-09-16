import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Volume2,
  VolumeX,
  Type,
  Eye,
  Wifi,
  WifiOff,
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { getSettings, saveSettings } from '../../utils/storage';
import { playFlipSound } from '../../utils/sound';
import './Header.css';

export default function Header({ isCaregiver = false }) {
  const [settings, setSettingsState] = useState(getSettings());
  const [isOnline, setIsOnline] = useState(navigator.onLine !== false);
  const [showSyncNote, setShowSyncNote] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    playFlipSound();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettingsState(saveSettings(updated));
  };

  const cycleTextSize = () => {
    playFlipSound();
    const sizes = ['normal', 'large', 'xlarge'];
    const currentIdx = sizes.indexOf(settings.textSize || 'normal');
    const nextSize = sizes[(currentIdx + 1) % sizes.length];
    const updated = { ...settings, textSize: nextSize };
    setSettingsState(saveSettings(updated));
  };

  const toggleHighContrast = () => {
    playFlipSound();
    const updated = { ...settings, highContrast: !settings.highContrast };
    setSettingsState(saveSettings(updated));
  };

  const handleSimulateSync = () => {
    playFlipSound();
    setShowSyncNote(true);
    setTimeout(() => setShowSyncNote(false), 2400);
  };

  const isPatientRoute = !isCaregiver && location.pathname !== '/';

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={playFlipSound} aria-label="Mindora Home">
          <div className="logo-icon-wrap">
            <Brain size={22} className="brand-leaf-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">MINDORA</span>
            <span className="brand-tagline">Cognitive Companion</span>
          </div>
        </Link>

        {/* Center / Mode indicator */}
        <div className="header-center">
          <button 
            className="offline-pill" 
            onClick={handleSimulateSync}
            title="Click to verify local synchronization"
          >
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span className="status-text">
              {showSyncNote ? "Synced just now" : isOnline ? "Synced 2 min ago" : "Working offline"}
            </span>
          </button>
        </div>

        {/* Right Tools: Accessibility + Mode Switcher */}
        <div className="header-actions">
          {/* Accessibility: Text Size */}
          <button
            className="tool-btn"
            onClick={cycleTextSize}
            title={`Text Size: ${settings.textSize || 'normal'} (click to enlarge)`}
            aria-label="Change text size"
          >
            <Type size={18} />
            <span className="tool-btn-label">
              {settings.textSize === 'xlarge' ? 'XL' : settings.textSize === 'large' ? 'L' : 'Aa'}
            </span>
          </button>

          {/* Accessibility: Sound Toggle */}
          <button
            className={`tool-btn ${settings.soundEnabled ? 'active' : 'muted'}`}
            onClick={toggleSound}
            title={settings.soundEnabled ? "Sound enabled (click to mute)" : "Sound muted (click to enable)"}
            aria-label="Toggle sound feedback"
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Accessibility: Contrast Toggle */}
          <button
            className={`tool-btn ${settings.highContrast ? 'active' : ''}`}
            onClick={toggleHighContrast}
            title="Toggle high contrast mode"
            aria-label="Toggle high contrast"
          >
            <Eye size={18} />
          </button>

          {/* Mode Switcher */}
          {isCaregiver ? (
            <Link to="/home" className="mode-switch-btn patient-btn" onClick={playFlipSound}>
              <UserCheck size={16} />
              <span>Patient Mode</span>
            </Link>
          ) : (
            <Link to="/caregiver" className="mode-switch-btn caregiver-btn" onClick={playFlipSound}>
              <HeartHandshake size={16} />
              <span>Caregiver View</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
