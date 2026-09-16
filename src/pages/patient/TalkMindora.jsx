import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Activity,
  CheckCircle2,
  Clock,
  Heart,
  Brain,
  Award
} from 'lucide-react';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  getAssistantResponse
} from '../../utils/speech';
import { getFullStatsSummary } from '../../utils/statsSummary';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import './TalkMindora.css';

const QUICK_PROMPTS = [
  { label: "📊 Summarize my stats", query: "Summarize my stats and how I am doing" },
  { label: "🗓️ Today's routine", query: "What do I have scheduled today?" },
  { label: "💊 Upcoming medicine", query: "When is my next medicine?" },
  { label: "❤️ Family memories", query: "Tell me about my family members" },
  { label: "🎮 Play a game", query: "Let's play a memory game" }
];

export default function TalkMindora() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => {
    const initialStats = getFullStatsSummary();
    return [{
      id: 'welcome_1',
      sender: 'mindora',
      text: `Good morning, ${initialStats.patientName}! I am Mindora, your everyday companion. How are you feeling right now? You can ask me to summarize your stats, check your medicines, or explore memories.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: null
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const recognizerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isListening]);

  const handleStartListening = () => {
    playFlipSound();

    if (!isSpeechRecognitionSupported()) {
      alert("Voice speech recognition is not supported in this browser. You can type your message below!");
      return;
    }

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript.trim());
        }
      },
      onError: (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = (text) => {
    if (!text || !text.trim()) return;

    playFlipSound();

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate assistant reply
    setTimeout(() => {
      playSuccessChime();
      const reply = getAssistantResponse(text);

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'mindora',
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: reply.action,
        actionLabel: reply.actionLabel || "View Details",
        statsData: reply.statsData || null,
        type: reply.type || 'general'
      };

      setMessages((prev) => [...prev, botMsg]);

      // Read aloud
      handleSpeakMessage(botMsg.id, botMsg.text);
    }, 450);
  };

  const handleSpeakMessage = (id, text) => {
    setActiveSpeakingId(id);
    speakText(text, () => {
      setActiveSpeakingId(null);
    });
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    }
  };

  const handleClearChat = () => {
    playFlipSound();
    handleStopSpeaking();
    const stats = getFullStatsSummary();
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'mindora',
        text: `Chat refreshed. I am ready whenever you need me, ${stats.patientName}!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="talk-mindora-page">
      {/* Top Bar with Clear and Status */}
      <div className="talk-page-header">
        <div className="header-greeting-block">
          <h1 className="patient-greeting">Talk to Mindora</h1>
          <p className="patient-subhead">Voice &amp; Chat Companion with Live Health &amp; Activity Stats</p>
        </div>

        <button
          className="talk-reset-btn"
          onClick={handleClearChat}
          title="Start fresh conversation"
          aria-label="Start fresh conversation"
        >
          <RotateCcw size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="chat-conversation-container">
        <div className="messages-stream">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = activeSpeakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`message-row ${isUser ? 'user-row' : 'bot-row'} animate-fade-in`}
              >
                {!isUser && (
                  <div className="bot-avatar-badge">
                    <Sparkles size={18} />
                  </div>
                )}

                <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                  {/* Bubble Header */}
                  <div className="bubble-header-row">
                    <span className="sender-tag">{isUser ? "You" : "Mindora"}</span>
                    <div className="bubble-actions">
                      <span className="msg-timestamp">{msg.time}</span>
                      {!isUser && (
                        <button
                          className={`bubble-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
                          onClick={() => isSpeaking ? handleStopSpeaking() : handleSpeakMessage(msg.id, msg.text)}
                          title={isSpeaking ? "Stop speaking" : "Listen to message"}
                          aria-label={isSpeaking ? "Stop speaking" : "Listen to message"}
                        >
                          {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main text message */}
                  <p className="bubble-body-text">{msg.text}</p>

                  {/* Rich Stats Card (if query was stats-related) */}
                  {msg.statsData && (
                    <div className="interactive-stats-card animate-fade-in">
                      <div className="stats-card-header">
                        <div className="stats-header-title">
                          <Activity size={18} className="stats-header-icon" />
                          <span>Today's Cognitive &amp; Routine Snapshot</span>
                        </div>
                        <span className="stats-status-badge">Live Sync</span>
                      </div>

                      <div className="stats-metrics-grid">
                        {/* 1. Game Accuracy */}
                        <div className="stat-pill-metric">
                          <div className="metric-icon-wrap accuracy">
                            <Award size={18} />
                          </div>
                          <div className="metric-details">
                            <span className="metric-num">{msg.statsData.activities.avgAccuracy}%</span>
                            <span className="metric-desc">Game Accuracy</span>
                          </div>
                        </div>

                        {/* 2. Routines Done */}
                        <div className="stat-pill-metric">
                          <div className="metric-icon-wrap routines">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="metric-details">
                            <span className="metric-num">
                              {msg.statsData.routines.completedCount}/{msg.statsData.routines.total}
                            </span>
                            <span className="metric-desc">Routines Completed</span>
                          </div>
                        </div>

                        {/* 3. 7-Day Memory */}
                        <div className="stat-pill-metric">
                          <div className="metric-icon-wrap memory">
                            <Brain size={18} />
                          </div>
                          <div className="metric-details">
                            <span className="metric-num">
                              {msg.statsData.cognitiveTrends.memoryScore}%
                            </span>
                            <span className="metric-desc">7-Day Memory</span>
                          </div>
                        </div>

                        {/* 4. Family Faces */}
                        <div className="stat-pill-metric">
                          <div className="metric-icon-wrap family">
                            <Heart size={18} />
                          </div>
                          <div className="metric-details">
                            <span className="metric-num">
                              {msg.statsData.memories.familyCount} Faces
                            </span>
                            <span className="metric-desc">Family Members</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Upcoming Reminder if any */}
                      {msg.statsData.routines.nextReminder && (
                        <div className="upcoming-routine-strip">
                          <Clock size={16} className="clock-icon" />
                          <span>
                            <strong>Next:</strong> {msg.statsData.routines.nextReminder.title} ({msg.statsData.routines.nextReminder.time})
                          </span>
                        </div>
                      )}

                      {/* Quick Navigation Actions */}
                      <div className="stats-card-actions">
                        <button
                          className="stats-action-btn"
                          onClick={() => {
                            playFlipSound();
                            navigate('/today');
                          }}
                        >
                          <span>View Routines</span>
                          <ArrowRight size={14} />
                        </button>
                        <button
                          className="stats-action-btn secondary"
                          onClick={() => {
                            playFlipSound();
                            navigate('/play');
                          }}
                        >
                          <span>Play Games</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Standard Action Pill (if any and not full stats) */}
                  {msg.action && !msg.statsData && (
                    <button
                      className="bubble-action-pill"
                      onClick={() => {
                        playFlipSound();
                        navigate(msg.action);
                      }}
                    >
                      <span>{msg.actionLabel || "View Details"}</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Listening Pulse Indicator */}
          {isListening && (
            <div className="bot-row listening-pulse-row animate-fade-in">
              <div className="bot-avatar-badge listening">
                <Mic size={18} />
              </div>
              <div className="listening-banner-bubble">
                <span className="listening-wave-dot dot1" />
                <span className="listening-wave-dot dot2" />
                <span className="listening-wave-dot dot3" />
                <span className="listening-wave-text">Listening... Speak clearly to Mindora</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="quick-chips-wrapper">
          <span className="quick-chips-label">Suggestions:</span>
          <div className="chips-scroller">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                className="talk-chip-btn"
                onClick={() => handleSendMessage(prompt.query)}
              >
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input Controls Bar */}
        <div className="talk-input-controls-card">
          <form onSubmit={handleSubmit} className="talk-input-form">
            {/* Big Mic Button */}
            <button
              type="button"
              className={`talk-mic-trigger-btn ${isListening ? 'active-listening' : ''}`}
              onClick={handleStartListening}
              title={isListening ? "Listening... Click to stop" : "Click to speak with Mindora"}
              aria-label={isListening ? "Listening... Click to stop" : "Click to speak with Mindora"}
            >
              <Mic size={24} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask Mindora or type 'summarize stats'..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="talk-main-input"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="talk-submit-btn"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
