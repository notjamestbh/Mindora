import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Calendar,
  Mic,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Sun,
  Sunset,
  Sunrise,
  Compass
} from 'lucide-react';
import { playFlipSound } from '../../utils/sound';
import { getPatient, getReminders, getMemories, getSettings } from '../../utils/storage';
import { recommendActivity } from '../../utils/adaptiveEngine';
import { getTranslation } from '../../data/translations';
import { useStorageListener } from '../../hooks/useStorageListener';
import './PatientHome.css';

export default function PatientHome() {
  const [patient, setPatient] = useState(getPatient());
  const [reminders, setReminders] = useState(getReminders());
  const [recommendation, setRecommendation] = useState(recommendActivity());
  const settings = getSettings();
  const t = getTranslation(settings.language || 'en');

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_patient') setPatient(getPatient());
    if (detail && detail.key === 'mindora_reminders') setReminders(getReminders());
  });

  // Time-aware greeting & scenery icon
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        text: t.greetingMorning || "Good morning, Amma",
        period: "Morning",
        icon: Sunrise,
        atmosphere: "Gentle morning mist over the tea hills &bull; Warm chai ready"
      };
    }
    if (hour < 17) {
      return {
        text: t.greetingAfternoon || "Good afternoon, Amma",
        period: "Afternoon",
        icon: Sun,
        atmosphere: "Peaceful verandah shade &bull; Courtyard birds singing"
      };
    }
    return {
      text: t.greetingEvening || "Good evening, Amma",
      period: "Evening",
      icon: Sunset,
      atmosphere: "Calm twilight &bull; Namghar prayer bell &bull; Time for light rest"
    };
  };

  const greetingInfo = getGreetingData();
  const GreetingIcon = greetingInfo.icon;

  const completedReminders = reminders.filter(r => r.completed);
  const nextReminder = reminders.find(r => !r.completed);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="patient-home-view">
      {/* Scenic Horizon Greeting Banner */}
      <section className="scenic-greeting-banner animate-fade-in">
        <div className="scenic-banner-art">
          {/* Layered Tea Hills & River Sunset/Sunrise Scene */}
          <svg
            viewBox="0 0 800 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="scenic-svg"
            preserveAspectRatio="xMidYMax slice"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBF7EC" />
                <stop offset="60%" stopColor="#F5F0E4" />
                <stop offset="100%" stopColor="#EDE8DC" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E59866" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#D6B96C" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="hillBack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667A63" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#667A63" stopOpacity="0.12" />
              </linearGradient>
              <linearGradient id="hillFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667A63" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#556752" stopOpacity="0.30" />
              </linearGradient>
              <linearGradient id="riverStream" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5B84B1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#5B84B1" stopOpacity="0.10" />
              </linearGradient>
            </defs>

            {/* Sky Background */}
            <rect width="800" height="200" fill="url(#skyGrad)" />

            {/* Gentle Warm Sun Orb */}
            <circle cx="640" cy="85" r="45" fill="url(#sunGrad)" />

            {/* Distant Mountains */}
            <path d="M0,130 Q160,80 320,115 T640,95 T800,110 L800,200 L0,200 Z" fill="url(#hillBack)" />

            {/* River Ribbon */}
            <path d="M0,165 C240,150 480,180 800,160 L800,200 L0,200 Z" fill="url(#riverStream)" />

            {/* Foreground Rolling Tea Hills */}
            <path d="M0,155 Q200,125 420,150 T800,140 L800,200 L0,200 Z" fill="url(#hillFront)" />

            {/* Distant Flying Birds */}
            <g opacity="0.35">
              <path d="M480,50 Q485,45 490,50 Q495,45 500,50" stroke="#556752" strokeWidth="1.5" fill="none" />
              <path d="M505,42 Q509,38 513,42 Q517,38 521,42" stroke="#556752" strokeWidth="1.2" fill="none" />
            </g>
          </svg>
        </div>

        {/* Content over Banner */}
        <div className="scenic-banner-content">
          <div className="banner-top-meta">
            <div className="time-period-tag">
              <GreetingIcon size={14} className="period-icon" />
              <span>{greetingInfo.period} &bull; {patient.region}</span>
            </div>
            <span className="date-tag">{formattedDate}</span>
          </div>

          <h1 className="patient-greeting-title">{greetingInfo.text}</h1>
          <p className="patient-atmosphere-note" dangerouslySetInnerHTML={{ __html: greetingInfo.atmosphere }} />
        </div>
      </section>

      {/* Main Subheading */}
      <div className="patient-nav-prompt">
        <h2 className="prompt-heading">{t.subtitleHome || "What would you like to do today?"}</h2>
      </div>

      {/* Adaptive Personalized Suggestion Card */}
      {recommendation && (
        <section className="adaptive-prompt-card">
          <div className="adaptive-card-left">
            <div className="adaptive-sparkle-pill">
              <Sparkles size={16} />
              <span>Prepared For You</span>
            </div>
            <h3 className="adaptive-card-title">
              {recommendation.game.title}
            </h3>
            <p className="adaptive-card-desc">
              {recommendation.reason || "A gentle visual activity designed for your morning."}
            </p>
          </div>

          <Link
            to={recommendation.game.path}
            className="adaptive-play-btn"
            onClick={playFlipSound}
            aria-label={`Start recommended activity: ${recommendation.game.title}`}
          >
            <span>Play Now</span>
            <ArrowRight size={20} />
          </Link>
        </section>
      )}

      {/* 4 Main Action Cards */}
      <section className="patient-actions-grid" aria-label="Main activities">
        {/* PLAY */}
        <Link to="/play" className="patient-action-card card-play" onClick={playFlipSound}>
          <div className="action-icon-circle green">
            <Brain size={34} />
          </div>
          <div className="action-text-content">
            <h3 className="action-title">{t.playTitle || "Play"}</h3>
            <p className="action-desc">{t.playDesc || "Exercise your memory with gentle activities"}</p>
          </div>
          <div className="action-arrow">
            <ArrowRight size={22} />
          </div>
        </Link>

        {/* MY MEMORY */}
        <Link to="/memory" className="patient-action-card card-memory" onClick={playFlipSound}>
          <div className="action-icon-circle warm">
            <Heart size={34} />
          </div>
          <div className="action-text-content">
            <h3 className="action-title">{t.memoryTitle || "My Memory"}</h3>
            <p className="action-desc">{t.memoryDesc || "People, places, and moments you hold dear"}</p>
          </div>
          <div className="action-arrow">
            <ArrowRight size={22} />
          </div>
        </Link>

        {/* TODAY */}
        <Link to="/today" className="patient-action-card card-today" onClick={playFlipSound}>
          <div className="action-icon-circle blue">
            <Calendar size={34} />
          </div>
          <div className="action-text-content">
            <h3 className="action-title">{t.todayTitle || "Today"}</h3>
            <p className="action-desc">{t.todayDesc || "Your daily routine and reminders at a glance"}</p>
          </div>
          <div className="action-arrow">
            <ArrowRight size={22} />
          </div>
        </Link>

        {/* TALK */}
        <Link to="/talk" className="patient-action-card card-talk" onClick={playFlipSound}>
          <div className="action-icon-circle yellow">
            <Mic size={34} />
          </div>
          <div className="action-text-content">
            <h3 className="action-title">{t.talkTitle || "Talk"}</h3>
            <p className="action-desc">{t.talkDesc || "Ask Mindora about your day or family"}</p>
          </div>
          <div className="action-arrow">
            <ArrowRight size={22} />
          </div>
        </Link>
      </section>

      {/* Routine Quick Glimpse */}
      <section className="routine-glimpse-card">
        <div className="glimpse-header">
          <div className="glimpse-title-group">
            <Clock size={18} className="glimpse-icon" />
            <span className="glimpse-heading">Today's Rhythm</span>
          </div>
          <span className="glimpse-badge">
            {completedReminders.length} of {reminders.length} Done
          </span>
        </div>

        {nextReminder ? (
          <div className="glimpse-body">
            <span className="next-tag">Next Upcoming:</span>
            <p className="next-title">
              <strong>{nextReminder.time}</strong> &bull; {nextReminder.title}
            </p>
          </div>
        ) : (
          <div className="glimpse-body">
            <CheckCircle2 size={20} className="all-done-icon" />
            <p className="all-done-text">All routines completed for today. Well done!</p>
          </div>
        )}
      </section>
    </div>
  );
}
