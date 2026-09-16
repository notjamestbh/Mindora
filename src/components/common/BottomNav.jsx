import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Brain, Heart, Calendar, Mic } from 'lucide-react';
import { playFlipSound } from '../../utils/sound';
import { getTranslation } from '../../data/translations';
import { getSettings } from '../../utils/storage';
import './BottomNav.css';

export default function BottomNav() {
  const settings = getSettings();
  const t = getTranslation(settings.language || 'en');

  const navItems = [
    { to: '/home', icon: Home, label: t.navHome },
    { to: '/play', icon: Brain, label: t.navPlay },
    { to: '/memory', icon: Heart, label: t.navMemory },
    { to: '/today', icon: Calendar, label: t.navToday },
    { to: '/talk', icon: Mic, label: t.navTalk }
  ];

  return (
    <nav className="patient-bottom-nav" aria-label="Main Navigation">
      <div className="bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={playFlipSound}
            >
              <div className="nav-icon-container">
                <Icon size={24} className="nav-icon" />
              </div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
