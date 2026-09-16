import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layouts
import PatientLayout from './components/patient/PatientLayout';
import CaregiverLayout from './components/caregiver/CaregiverLayout';

// Landing Page
import LandingPage from './pages/LandingPage';

// Patient Pages
import PatientHome from './pages/patient/PatientHome';
import GameHub from './pages/patient/GameHub';
import MyMemory from './pages/patient/MyMemory';
import TodayRoutine from './pages/patient/TodayRoutine';
import TalkMindora from './pages/patient/TalkMindora';
import PatientProfile from './pages/patient/PatientProfile';

// Games
import MemoryMatch from './games/MemoryMatch';
import WhoIsThis from './games/WhoIsThis';
import PatternRecall from './games/PatternRecall';
import RoutineSequence from './games/RoutineSequence';
import FindThePair from './games/FindThePair';
import WhosSpeaking from './games/WhosSpeaking';

// Caregiver Pages
import CaregiverOverview from './pages/caregiver/CaregiverOverview';
import CaregiverActivity from './pages/caregiver/CaregiverActivity';
import CaregiverMemory from './pages/caregiver/CaregiverMemory';
import CaregiverReminders from './pages/caregiver/CaregiverReminders';
import CaregiverProfile from './pages/caregiver/CaregiverProfile';

// Storage & Settings
import { getSettings, applySettingsToDOM } from './utils/storage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useEffect(() => {
    // Apply accessibility tokens (text size, high contrast, sound) on initial load
    const settings = getSettings();
    applySettingsToDOM(settings);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Patient Experience */}
        <Route element={<PatientLayout />}>
          <Route path="/home" element={<PatientHome />} />
          <Route path="/play" element={<GameHub />} />
          <Route path="/memory" element={<MyMemory />} />
          <Route path="/today" element={<TodayRoutine />} />
          <Route path="/talk" element={<TalkMindora />} />
          <Route path="/profile" element={<PatientProfile />} />

          {/* Games */}
          <Route path="/game/memory-match" element={<MemoryMatch />} />
          <Route path="/game/who-is-this" element={<WhoIsThis />} />
          <Route path="/game/whos-speaking" element={<WhosSpeaking />} />
          <Route path="/game/pattern" element={<PatternRecall />} />
          <Route path="/game/routine" element={<RoutineSequence />} />
          <Route path="/game/pair" element={<FindThePair />} />
        </Route>

        {/* Caregiver Experience */}
        <Route path="/caregiver" element={<CaregiverLayout />}>
          <Route index element={<CaregiverOverview />} />
          <Route path="activity" element={<CaregiverActivity />} />
          <Route path="memory" element={<CaregiverMemory />} />
          <Route path="reminders" element={<CaregiverReminders />} />
          <Route path="profile" element={<CaregiverProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
