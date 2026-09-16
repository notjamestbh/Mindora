import React, { useState } from 'react';
import { getTrendData } from '../../utils/storage';
import { playFlipSound } from '../../utils/sound';
import './TrendChart.css';

export default function TrendChart() {
  const [timeframe, setTimeframe] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('all'); // all | memory | attention | recognition
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = getTrendData(timeframe);

  const handleTimeframeChange = (tf) => {
    playFlipSound();
    setTimeframe(tf);
    setHoveredPoint(null);
  };

  // Dimensions
  const width = 640;
  const height = 240;
  const padding = { top: 24, right: 30, bottom: 36, left: 42 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scales
  const minY = 50;
  const maxY = 100;
  const getY = (val) => padding.top + graphHeight - ((val - minY) / (maxY - minY)) * graphHeight;
  const getX = (idx) => padding.left + (idx / Math.max(1, data.length - 1)) * graphWidth;

  const buildPath = (metricKey) => {
    if (!data || data.length === 0) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[metricKey])}`).join(' ');
  };

  const metricsConfig = [
    { key: 'memory', label: 'Memory', color: 'var(--accent-green, #667A63)' },
    { key: 'attention', label: 'Attention', color: 'var(--accent-warm, #B8785C)' },
    { key: 'recognition', label: 'Recognition', color: 'var(--accent-yellow, #D6B96C)' }
  ];

  return (
    <div className="trend-chart-card">
      <div className="trend-header">
        <div>
          <div className="trend-title-row">
            <h3 className="trend-title">Cognitive Activity Trend</h3>
            <span className="trend-badge">Activity Engagement Metrics</span>
          </div>
          <p className="trend-subtitle">
            Longitudinal observation based on daily games and routines. Not a clinical assessment.
          </p>
        </div>

        <div className="timeframe-tabs">
          <button
            className={`tab-btn ${timeframe === '7d' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('7d')}
          >
            7 Days
          </button>
          <button
            className={`tab-btn ${timeframe === '30d' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('30d')}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Metric Filter Toggles */}
      <div className="metric-toggles">
        <button
          className={`metric-chip ${activeMetric === 'all' ? 'active' : ''}`}
          onClick={() => { playFlipSound(); setActiveMetric('all'); }}
        >
          All Activities
        </button>
        {metricsConfig.map((m) => (
          <button
            key={m.key}
            className={`metric-chip ${activeMetric === m.key ? 'active' : ''}`}
            onClick={() => { playFlipSound(); setActiveMetric(m.key); }}
          >
            <span className="chip-dot" style={{ backgroundColor: m.color }} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="trend-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y Axis Grid Lines */}
          {[60, 70, 80, 90, 100].map((level) => (
            <g key={level} className="grid-group">
              <line
                x1={padding.left}
                y1={getY(level)}
                x2={width - padding.right}
                y2={getY(level)}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={getY(level) + 4}
                textAnchor="end"
                className="axis-label"
              >
                {level}%
              </text>
            </g>
          ))}

          {/* Lines */}
          {metricsConfig.map((m) => {
            if (activeMetric !== 'all' && activeMetric !== m.key) return null;
            return (
              <path
                key={m.key}
                d={buildPath(m.key)}
                fill="none"
                stroke={m.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="metric-line"
              />
            );
          })}

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={d.day + i}>
              {/* X Axis Label */}
              <text
                x={getX(i)}
                y={height - 10}
                textAnchor="middle"
                className="axis-label x-axis"
              >
                {d.day}
              </text>

              {/* Metric dots */}
              {metricsConfig.map((m) => {
                if (activeMetric !== 'all' && activeMetric !== m.key) return null;
                const isHovered = hoveredPoint && hoveredPoint.idx === i && hoveredPoint.key === m.key;
                return (
                  <circle
                    key={m.key}
                    cx={getX(i)}
                    cy={getY(d[m.key])}
                    r={isHovered ? 6 : 4}
                    fill="var(--surface-primary)"
                    stroke={m.color}
                    strokeWidth={isHovered ? 3 : 2}
                    className="data-circle"
                    onMouseEnter={() => setHoveredPoint({ idx: i, key: m.key, value: d[m.key], day: d.day, label: m.label })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(getX(hoveredPoint.idx) / width) * 100}%`,
              top: `${(getY(hoveredPoint.value) / height) * 100}%`
            }}
          >
            <strong>{hoveredPoint.label}: {hoveredPoint.value}%</strong>
            <span>{hoveredPoint.day}</span>
          </div>
        )}
      </div>
    </div>
  );
}
