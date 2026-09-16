import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Mic,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Activity,
  Award,
  CheckCircle2,
  Brain,
  RotateCcw
} from 'lucide-react';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  getAssistantResponse
} from '../../utils/speech';
import { getFullStatsSummary } from '../../utils/statsSummary';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import './FloatingChatbot.css';

const QUICK_PROMPTS = [
  { label: "📊 Summarize stats", query: "Summarize my stats" },
  { label: "💊 Medicines", query: "When is my medicine?" },
  { label: "🗓️ Today", query: "What do I have today?" },
  { label: "❤️ Family", query: "Tell me about my family" }
];

export default function FloatingChatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const stats = getFullStatsSummary();
    return [{
      id: 'float_welcome',
      sender: 'mindora',
      text: `Hi ${stats.patientName}! I am here to help you. Would you like a summary of your stats or upcoming routines?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const recognizerRef = useRef(null);
  const chatEndRef = useRef(null);

  // If already on the dedicated /talk page, hide floating widget to prevent redundancy
  const isOnTalkPage = location.pathname === '/talk';

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (isOnTalkPage) {
    return null;
  }

  const handleToggleOpen = () => {
    playFlipSound();
    setIsOpen((prev) => !prev);
  };

  const handleStartListening = () => {
    playFlipSound();

    if (!isSpeechRecognitionSupported()) {
      alert("Voice speech recognition is not supported in this browser. You can type below!");
      return;
    }

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript.trim());
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false)
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

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      playSuccessChime();
      const reply = getAssistantResponse(text);

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: 'mindora',
        text: reply.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: reply.action,
        actionLabel: reply.actionLabel,
        statsData: reply.statsData,
        type: reply.type
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak text aloud
      setActiveSpeakingId(botMsg.id);
      speakText(botMsg.text, () => setActiveSpeakingId(null));
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="floating-chatbot-container">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="floating-chat-pill"
          onClick={handleToggleOpen}
          aria-label="Open Mindora Chat Companion"
          title="Chat or speak with Mindora"
        >
          <div className="floating-icon-wrap">
            <Sparkles size={20} className="sparkle-icon" />
          </div>
          <span className="floating-btn-text">Talk with Mindora</span>
          <span className="floating-pulse-badge" />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="floating-chat-window animate-scale-up">
          {/* Header */}
          <div className="floating-chat-header">
            <div className="floating-header-left">
              <div className="bot-status-dot" />
              <div>
                <h4 className="floating-header-title">Mindora Companion</h4>
                <span className="floating-header-sub">Voice &amp; Stats Assistant</span>
              </div>
            </div>

            <div className="floating-header-actions">
              <button
                className="header-mini-btn"
                onClick={() => {
                  playFlipSound();
                  navigate('/talk');
                  setIsOpen(false);
                }}
                title="Expand full screen"
                aria-label="Expand full screen"
              >
                <Maximize2 size={16} />
              </button>
              <button
                className="header-mini-btn"
                onClick={handleToggleOpen}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="floating-chat-body">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeaking = activeSpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`float-msg-row ${isUser ? 'user-row' : 'bot-row'}`}
                >
                  <div className={`float-msg-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
                    <div className="float-bubble-top">
                      <span className="float-sender">{isUser ? "You" : "Mindora"}</span>
                      {!isUser && (
                        <button
                          className="float-voice-icon"
                          onClick={() => {
                            if (isSpeaking) {
                              window.speechSynthesis?.cancel();
                              setActiveSpeakingId(null);
                            } else {
                              setActiveSpeakingId(msg.id);
                              speakText(msg.text, () => setActiveSpeakingId(null));
                            }
                          }}
                          title="Read aloud"
                          aria-label="Read aloud"
                        >
                          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                      )}
                    </div>

                    <p className="float-msg-text">{msg.text}</p>

                    {/* Stats Card in Floating Drawer */}
                    {msg.statsData && (
                      <div className="float-stats-card">
                        <div className="float-stat-badge">
                          <Award size={14} />
                          <span>{msg.statsData.activities.avgAccuracy}% Accuracy</span>
                        </div>
                        <div className="float-stat-badge">
                          <CheckCircle2 size={14} />
                          <span>{msg.statsData.routines.completedCount}/{msg.statsData.routines.total} Routines</span>
                        </div>
                        <div className="float-stat-badge">
                          <Brain size={14} />
                          <span>{msg.statsData.cognitiveTrends.memoryScore}% Memory</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isListening && (
              <div className="float-msg-row bot-row">
                <div className="float-msg-bubble bot-bubble listening">
                  <span>Listening carefully... speak now</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="floating-chips-bar">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                className="floating-prompt-chip"
                onClick={() => handleSendMessage(p.query)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSubmit} className="floating-chat-footer">
            <button
              type="button"
              className={`float-mic-btn ${isListening ? 'active-listening' : ''}`}
              onClick={handleStartListening}
              title={isListening ? "Listening... Click to stop" : "Speak to Mindora"}
              aria-label="Speak to Mindora"
            >
              <Mic size={18} />
            </button>

            <input
              type="text"
              placeholder="Ask anything or 'summarize stats'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="float-chat-input"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="float-send-btn"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
