import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Heart,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import Header from '../common/Header';
import AmbientBackground from '../common/AmbientBackground';
import FloatingChatbot from '../common/FloatingChatbot';
import { playFlipSound } from '../../utils/sound';
import { getPatient } from '../../utils/storage';
import './CaregiverLayout.css';

export default function CaregiverLayout() {
  const patient = getPatient();

  const navLinks = [
    { to: '/caregiver', end: true, icon: LayoutDashboard, label: "Overview" },
    { to: '/caregiver/activity', icon: Activity, label: "Activity Feed" },
    { to: '/caregiver/memory', icon: Heart, label: "Memory Library" },
    { to: '/caregiver/reminders', icon: Calendar, label: "Reminders" },
    { to: '/caregiver/profile', icon: User, label: "Patient & World" }
  ];

  return (
    <div className="caregiver-app-layout">
      <AmbientBackground variant="caregiver" />
      <Header isCaregiver={true} />

      {/* Patient Status Banner */}
      <section className="patient-context-banner">
        <div className="banner-inner">
          <div className="patient-avatar-pill">
            <span className="avatar-dot" />
            <span className="patient-meta">
              <strong>{patient.name}</strong> ({patient.fullName}) &bull; {patient.age} yrs &bull; {patient.region}
            </span>
          </div>

          <div className="disclaimer-badge" title="Ethical AI Notice">
            <ShieldCheck size={14} />
            <span>Support &amp; Awareness Platform &bull; Non-Diagnostic</span>
          </div>
        </div>
      </section>

      {/* Caregiver Navigation Bar */}
      <nav className="caregiver-nav-bar" aria-label="Caregiver sections">
        <div className="caregiver-nav-inner">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `caregiver-nav-link ${isActive ? 'active' : ''}`}
                onClick={playFlipSound}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Main Outlet */}
      <main className="caregiver-main-content">
        <Outlet />
      </main>
      <FloatingChatbot />

      {/* Subtle Ethical Footer */}
      <footer className="caregiver-footer">
        <div className="caregiver-footer-inner">
          <p>
            Mindora activity metrics reflect longitudinal cognitive engagement and routine adherence.
            They are designed for caregiver awareness and are not clinical or medical assessments.
          </p>
        </div>
      </footer>
    </div>
  );
}
