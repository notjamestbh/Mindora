import React from 'react';
import './AmbientBackground.css';

export default function AmbientBackground({ variant = 'default' }) {
  return (
    <div className={`ambient-bg-wrapper ${variant}`} aria-hidden="true">
      {/* Warm Ambient Glows */}
      <div className="glow-orb glow-top-right" />
      <div className="glow-orb glow-bottom-left" />
      <div className="glow-orb glow-center-warm" />

      {/* Decorative Landscape SVG (Rolling Tea Hills & River Contours of NER) */}
      <svg
        className="ambient-landscape-svg"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Gradients for gentle landscape depth */}
          <linearGradient id="hillGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667A63" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#667A63" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="hillGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B8785C" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#667A63" stopOpacity="0.03" />
          </linearGradient>

          <linearGradient id="hillGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D6B96C" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#667A63" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#B8785C" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5B84B1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#5B84B1" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Distant Mountain Range */}
        <path
          d="M0,280 Q180,210 360,250 T720,230 T1080,210 T1440,240 L1440,600 L0,600 Z"
          fill="url(#hillGrad1)"
        />

        {/* Middle Rolling Tea Hill Slopes */}
        <path
          d="M0,360 Q220,300 460,340 T920,310 T1440,350 L1440,600 L0,600 Z"
          fill="url(#hillGrad2)"
        />

        {/* Brahmaputra River Curve Flow */}
        <path
          d="M0,450 C300,430 500,480 800,460 C1100,440 1300,480 1440,470 L1440,600 L0,600 Z"
          fill="url(#riverGrad)"
        />

        {/* Foreground Tea Plantation Contours */}
        <path
          d="M0,490 Q280,450 600,490 T1200,470 T1440,510 L1440,600 L0,600 Z"
          fill="url(#hillGrad3)"
        />

        {/* Soft Organic Topographic Contour Lines */}
        <path
          d="M0,320 Q240,270 480,310 T960,280 T1440,310"
          stroke="#667A63"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,390 Q260,350 520,380 T1040,360 T1440,390"
          stroke="#B8785C"
          strokeOpacity="0.06"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M0,470 Q300,430 640,460 T1280,440 T1440,480"
          stroke="#667A63"
          strokeOpacity="0.08"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Peaceful Birds in the Sky */}
        <g opacity="0.25">
          <path d="M280,180 Q288,174 296,180 Q304,174 312,180" stroke="#667A63" strokeWidth="1.5" fill="none" />
          <path d="M305,165 Q311,160 317,165 Q323,160 329,165" stroke="#667A63" strokeWidth="1.2" fill="none" />
          <path d="M325,185 Q330,181 335,185 Q340,181 345,185" stroke="#667A63" strokeWidth="1" fill="none" />
        </g>
      </svg>

      {/* Gentle Floating Tea Leaves Motif */}
      <div className="ambient-leaf leaf-1" />
      <div className="ambient-leaf leaf-2" />
      <div className="ambient-leaf leaf-3" />
    </div>
  );
}
