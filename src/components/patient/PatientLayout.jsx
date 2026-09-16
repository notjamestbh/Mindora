import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import BottomNav from '../common/BottomNav';
import AmbientBackground from '../common/AmbientBackground';
import FloatingChatbot from '../common/FloatingChatbot';
import './PatientLayout.css';

export default function PatientLayout() {
  return (
    <div className="patient-app-layout">
      <AmbientBackground variant="patient" />
      <Header isCaregiver={false} />
      <main className="patient-main-content">
        <Outlet />
      </main>
      <FloatingChatbot />
      <BottomNav />
    </div>
  );
}
