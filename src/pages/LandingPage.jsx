import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Activity,
  Smile
} from 'lucide-react';
import { playFlipSound } from '../utils/sound';
import Header from '../components/common/Header';
import AmbientBackground from '../components/common/AmbientBackground';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page-container">
      <AmbientBackground variant="landing" />
      {/* Top Header */}
      <Header isCaregiver={false} />

      {/* Cinematic Hero */}
      <section className="landing-hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={14} className="hero-badge-sparkle" />
            <span>AI-ASSISTED COGNITIVE SUPPORT</span>
          </div>

          <h1 className="hero-title animate-fade-in">
            A familiar way to keep the mind active.
          </h1>

          <p className="hero-description animate-fade-in">
            Mindora brings cognitive activities, memory assistance and everyday reminders into one
            simple companion designed around the person.
          </p>

          <div className="hero-cta-group animate-fade-in">
            <Link to="/home" className="btn-accent hero-primary-btn" onClick={playFlipSound}>
              <span>START MINDORA</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/caregiver" className="btn-secondary hero-secondary-btn" onClick={playFlipSound}>
              <Users size={18} />
              <span>CAREGIVER VIEW</span>
            </Link>
          </div>

          <div className="hero-tags-row animate-fade-in">
            <span className="hero-tag">&bull; Memory Support</span>
            <span className="hero-tag">&bull; Adaptive Activities</span>
            <span className="hero-tag">&bull; Everyday Assistance</span>
          </div>
        </div>

        {/* Abstract / Natural Calm Visual Surface */}
        <div className="hero-visual-card">
          <div className="visual-mockup-inner">
            <div className="mockup-header-bar">
              <span className="mockup-dot red" />
              <span className="mockup-dot yellow" />
              <span className="mockup-dot green" />
              <span className="mockup-title">Mindora Companion &bull; Amma</span>
            </div>

            <div className="mockup-grid">
              <div className="mockup-item">
                <div className="mockup-item-icon green">
                  <Brain size={22} />
                </div>
                <div>
                  <h4>Play</h4>
                  <p>Memory Match &bull; Today</p>
                </div>
              </div>

              <div className="mockup-item">
                <div className="mockup-item-icon warm">
                  <Heart size={22} />
                </div>
                <div>
                  <h4>My Memory</h4>
                  <p>Anu, Maya, Assam Hills</p>
                </div>
              </div>

              <div className="mockup-item">
                <div className="mockup-item-icon blue">
                  <Calendar size={22} />
                </div>
                <div>
                  <h4>Today</h4>
                  <p>3 of 4 routines completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Story: More than a game */}
      <section className="product-story-section">
        <div className="section-header-centered">
          <span className="section-eyebrow">A COMPLETE COMPANION</span>
          <h2 className="section-title">More than a game.</h2>
          <p className="section-subtext">
            Mindora learns from everyday interaction and turns it into personalized support.
          </p>
        </div>

        <div className="story-three-columns">
          <div className="story-column-card">
            <div className="story-icon-wrap green">
              <Brain size={28} />
            </div>
            <h3 className="story-card-title">PLAY</h3>
            <p className="story-card-desc">
              Short cognitive activities designed for regular engagement without scores, pressure, or frustration.
            </p>
          </div>

          <div className="story-column-card">
            <div className="story-icon-wrap warm">
              <Heart size={28} />
            </div>
            <h3 className="story-card-title">REMEMBER</h3>
            <p className="story-card-desc">
              Personal memories, familiar family faces and cherished regional moments built into everyday activities.
            </p>
          </div>

          <div className="story-column-card">
            <div className="story-icon-wrap yellow">
              <Calendar size={28} />
            </div>
            <h3 className="story-card-title">SUPPORT</h3>
            <p className="story-card-desc">
              Gentle routine reminders, spoken answers, and reassuring caregiver visibility.
            </p>
          </div>
        </div>
      </section>

      {/* How The System Works */}
      <section className="system-works-section">
        <div className="section-header-centered">
          <span className="section-eyebrow">THE ADAPTIVE LOOP</span>
          <h2 className="section-title">The system learns with you.</h2>
          <p className="section-subtext">
            A quiet loop of play, observation, and gentle assistance.
          </p>
        </div>

        <div className="steps-flow-container">
          <div className="flow-step-card">
            <span className="step-num">01</span>
            <h4 className="step-title">Play</h4>
            <p className="step-desc">
              The user enjoys a short, familiar activity at their own comfortable pace.
            </p>
          </div>

          <div className="flow-arrow">&rarr;</div>

          <div className="flow-step-card">
            <span className="step-num">02</span>
            <h4 className="step-title">Adapt</h4>
            <p className="step-desc">
              Mindora observes interaction patterns and adjusts future activity difficulty automatically.
            </p>
          </div>

          <div className="flow-arrow">&rarr;</div>

          <div className="flow-step-card">
            <span className="step-num">03</span>
            <h4 className="step-title">Support</h4>
            <p className="step-desc">
              Personalized memories and daily reminders fit naturally into the family's routine.
            </p>
          </div>
        </div>
      </section>

      {/* Caregiver Section */}
      <section className="caregiver-preview-section">
        <div className="caregiver-preview-grid">
          <div className="caregiver-text-pane">
            <span className="section-eyebrow">FOR FAMILIES &amp; CAREGIVERS</span>
            <h2 className="section-title">Keep connected without taking over.</h2>
            <p className="section-subtext">
              Caregivers get a clear view of activity, routines and changes in engagement without turning
              everyday life into a medical chart.
            </p>
            <div className="caregiver-feature-bullets">
              <div className="bullet-row">
                <CheckCircle2 size={18} className="bullet-icon" />
                <span>Manage personal family memory cards used directly in games</span>
              </div>
              <div className="bullet-row">
                <CheckCircle2 size={18} className="bullet-icon" />
                <span>Track 7-day and 30-day cognitive activity trends</span>
              </div>
              <div className="bullet-row">
                <CheckCircle2 size={18} className="bullet-icon" />
                <span>Set gentle medication and daily routine reminders</span>
              </div>
            </div>

            <Link to="/caregiver" className="btn-primary" onClick={playFlipSound}>
              <span>OPEN CAREGIVER VIEW</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="caregiver-card-mockup">
            <div className="mini-trend-box">
              <div className="mini-trend-header">
                <Activity size={18} className="mini-trend-icon" />
                <span>Weekly Activity Rhythm</span>
              </div>
              <div className="mini-stat-bar">
                <span className="mini-stat-label">Activities Completed</span>
                <span className="mini-stat-val">18 this week</span>
              </div>
              <div className="mini-stat-bar">
                <span className="mini-stat-label">Routine Adherence</span>
                <span className="mini-stat-val">86% completed</span>
              </div>
              <div className="mini-alert-pill">
                <span className="alert-bullet" />
                <span>Difficulty adapted to comfortable morning pacing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible AI Section */}
      <section className="responsible-ai-section">
        <div className="responsible-card">
          <div className="shield-icon-wrap">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 className="responsible-heading">Designed to assist, not diagnose.</h3>
            <p className="responsible-text">
              Mindora's activity metrics are intended to support engagement, familiar recall, and caregiver awareness.
              They are not a medical diagnosis or clinical assessment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <strong>MINDORA</strong> &bull; North Eastern Region Companion
          </div>
          <div className="footer-links">
            <Link to="/home">Patient Mode</Link>
            <Link to="/caregiver">Caregiver Mode</Link>
            <Link to="/profile">Cultural Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
