import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  Trash2,
  Volume2,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import { playPersonVoice, stopAllVoices, VOICE_PROFILES } from '../../utils/voicePlayer';
import './VoiceRecorderBox.css';

export default function VoiceRecorderBox({
  audioUrl = '',
  onAudioChange,
  greeting = '',
  onGreetingChange,
  profile = 'daughter',
  onProfileChange,
  pitch = 1.0,
  onPitchChange,
  personName = 'Family Member'
}) {
  const [activeTab, setActiveTab] = useState('record'); // 'record' | 'upload' | 'preset'
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [recordError, setRecordError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const playbackRef = useRef(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllVoices();
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // --- Microphone Recording Handlers ---
  const startRecording = async () => {
    playFlipSound();
    setRecordError(null);
    stopPreview();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setRecordError("Microphone recording is not supported in this browser. Please upload an audio file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Determine mimeType
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Convert Blob to Base64 Data URL to store in localStorage
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result;
          playSuccessChime();
          if (onAudioChange) onAudioChange(base64Audio);
        };

        // Stop all audio tracks to release microphone hardware
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(200); // 200ms timeslices
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 20) { // Limit to 20 seconds to keep localStorage footprint reasonable
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setRecordError("Could not access microphone. Please check browser permissions or upload an audio file.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    playFlipSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recorder:", e);
      }
    }
    setIsRecording(false);
  };

  // --- Audio File Upload Handlers ---
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert("Please choose a valid audio file (.mp3, .wav, .m4a, .webm, .ogg)");
      return;
    }

    // Protect localStorage (max ~1.5MB for audio file)
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Please upload an audio file under 1.5 MB to keep the memory library fast and responsive.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      playSuccessChime();
      if (onAudioChange) onAudioChange(event.target.result);
    };
    reader.onerror = () => {
      alert("Failed to read audio file. Please try another recording.");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Playback Handlers ---
  const togglePlayPreview = () => {
    if (isPlayingPreview) {
      stopPreview();
    } else {
      playFlipSound();
      setIsPlayingPreview(true);

      const dummyPerson = {
        name: personName || 'Family Member',
        voiceAudioUrl: audioUrl,
        voiceGreeting: greeting || (VOICE_PROFILES[profile]?.defaultGreeting),
        voicePitch: pitch || (VOICE_PROFILES[profile]?.pitch) || 1.0,
        voiceRate: VOICE_PROFILES[profile]?.rate || 0.88
      };

      playbackRef.current = playPersonVoice(dummyPerson, {
        onStart: () => setIsPlayingPreview(true),
        onEnd: () => setIsPlayingPreview(false),
        onError: () => setIsPlayingPreview(false)
      });
    }
  };

  const stopPreview = () => {
    stopAllVoices();
    if (playbackRef.current && playbackRef.current.stop) {
      playbackRef.current.stop();
    }
    setIsPlayingPreview(false);
  };

  const removeAudio = () => {
    playFlipSound();
    stopPreview();
    if (onAudioChange) onAudioChange('');
  };

  const handleProfileSelect = (key) => {
    playFlipSound();
    if (onProfileChange) onProfileChange(key);
    const prof = VOICE_PROFILES[key];
    if (prof) {
      if (onPitchChange) onPitchChange(prof.pitch);
      if (!greeting && onGreetingChange) {
        onGreetingChange(prof.defaultGreeting);
      }
    }
  };

  return (
    <div className="voice-recorder-box-wrapper">
      <div className="voice-box-header">
        <label className="voice-box-label">
          <Volume2 size={16} className="voice-label-icon" />
          <span>Person's Voice Clip</span>
        </label>
        <span className="voice-box-sub">Used in the "Who's Speaking?" recognition game</span>
      </div>

      {/* Tabs */}
      <div className="voice-input-tabs">
        <button
          type="button"
          className={`voice-tab-btn ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => { playFlipSound(); setActiveTab('record'); }}
        >
          <Mic size={15} />
          <span>Record Voice</span>
        </button>

        <button
          type="button"
          className={`voice-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => { playFlipSound(); setActiveTab('upload'); }}
        >
          <Upload size={15} />
          <span>Upload Audio</span>
        </button>

        <button
          type="button"
          className={`voice-tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
          onClick={() => { playFlipSound(); setActiveTab('preset'); }}
        >
          <Sparkles size={15} />
          <span>Spoken Greeting &amp; Tone</span>
        </button>
      </div>

      {/* Tab 1: Live Microphone Recording */}
      {activeTab === 'record' && (
        <div className="voice-tab-panel record-panel">
          {audioUrl ? (
            <div className="recorded-clip-card animate-fade-in">
              <div className="clip-info">
                <div className="clip-indicator active" />
                <span className="clip-name">Custom Voice Clip Saved</span>
              </div>

              <div className="clip-actions">
                <button
                  type="button"
                  className={`voice-play-pill ${isPlayingPreview ? 'playing' : ''}`}
                  onClick={togglePlayPreview}
                  title={isPlayingPreview ? "Stop preview" : "Listen to recorded voice"}
                >
                  {isPlayingPreview ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlayingPreview ? "Stop" : "Listen"}</span>
                </button>

                <button
                  type="button"
                  className="voice-delete-btn"
                  onClick={removeAudio}
                  title="Remove recorded clip"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mic-record-area">
              {isRecording ? (
                <div className="recording-active-state animate-pulse-gentle">
                  <div className="record-pulsing-circle">
                    <Mic size={26} className="mic-icon-pulsing" />
                  </div>
                  <div className="record-live-text">
                    <span className="record-status-label">Recording Voice...</span>
                    <span className="record-timer">00:{recordDuration.toString().padStart(2, '0')} (Max 20s)</span>
                  </div>
                  <button
                    type="button"
                    className="btn-stop-recording"
                    onClick={stopRecording}
                  >
                    <Square size={16} fill="currentColor" />
                    <span>Done Recording</span>
                  </button>
                </div>
              ) : (
                <div className="recording-idle-state">
                  <p className="mic-instructions">
                    Ask {personName || 'your loved one'} to say a friendly greeting (e.g. <em>"Namaste Amma, how are you today?"</em>).
                  </p>
                  <button
                    type="button"
                    className="btn-start-recording"
                    onClick={startRecording}
                  >
                    <Mic size={18} />
                    <span>Tap to Record Voice</span>
                  </button>
                </div>
              )}

              {recordError && (
                <div className="record-error-banner animate-fade-in">
                  <AlertCircle size={15} />
                  <span>{recordError}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upload Audio File */}
      {activeTab === 'upload' && (
        <div className="voice-tab-panel upload-panel">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            style={{ display: 'none' }}
          />

          {audioUrl ? (
            <div className="recorded-clip-card animate-fade-in">
              <div className="clip-info">
                <Check size={16} className="check-green" />
                <span className="clip-name">Audio File Ready</span>
              </div>

              <div className="clip-actions">
                <button
                  type="button"
                  className={`voice-play-pill ${isPlayingPreview ? 'playing' : ''}`}
                  onClick={togglePlayPreview}
                >
                  {isPlayingPreview ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlayingPreview ? "Stop" : "Listen"}</span>
                </button>

                <button
                  type="button"
                  className="voice-change-btn"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <Upload size={14} />
                  <span>Change</span>
                </button>

                <button
                  type="button"
                  className="voice-delete-btn"
                  onClick={removeAudio}
                  title="Remove audio file"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="audio-upload-dropzone"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (fileInputRef.current) fileInputRef.current.click();
                }
              }}
            >
              <div className="audio-upload-icon-wrap">
                <Upload size={22} />
              </div>
              <div className="audio-upload-text">
                <span className="upload-main-text">Upload Loved One's Audio Clip</span>
                <span className="upload-sub-text">MP3, WAV, M4A, WEBM, or voice notes (Max 1.5MB)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Spoken Greeting & Tone Settings */}
      {activeTab === 'preset' && (
        <div className="voice-tab-panel preset-panel">
          <div className="persona-profile-row">
            <label className="sub-label">Voice Tone Persona:</label>
            <div className="persona-chips-scroller">
              {Object.entries(VOICE_PROFILES).map(([key, prof]) => {
                const isSelected = profile === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`persona-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleProfileSelect(key)}
                  >
                    <span>{prof.label}</span>
                    {isSelected && <Check size={12} className="persona-check" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="greeting-text-group">
            <div className="greeting-label-row">
              <label className="sub-label">Spoken Greeting Script:</label>
              <span className="greeting-hint">Spoken if no custom audio file is uploaded</span>
            </div>
            <textarea
              rows={2}
              className="greeting-textarea"
              placeholder="e.g. Namaste Amma! It's Anu, your daughter."
              value={greeting}
              onChange={(e) => onGreetingChange && onGreetingChange(e.target.value)}
            />
          </div>

          <div className="preview-greeting-bar">
            <button
              type="button"
              className={`voice-play-pill preview-full-btn ${isPlayingPreview ? 'playing' : ''}`}
              onClick={togglePlayPreview}
            >
              {isPlayingPreview ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlayingPreview ? "Stop Voice Preview" : "Listen to Voice Preview"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
