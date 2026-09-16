import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Users,
  MapPin,
  Sparkles,
  Volume2,
  X,
  Check,
  Image as ImageIcon,
  Mic,
  Radio,
  Edit3
} from 'lucide-react';
import { getMemories, addMemory, editMemory } from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import { speakText } from '../../utils/speech';
import { playPersonVoice, stopAllVoices } from '../../utils/voicePlayer';
import ImageUploadBox from '../../components/common/ImageUploadBox';
import VoiceRecorderBox from '../../components/common/VoiceRecorderBox';
import { useStorageListener } from '../../hooks/useStorageListener';
import './MyMemory.css';

const SAMPLE_AVATARS = [
  { label: 'Daughter / Woman', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Son / Young Man', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Grandchild', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Husband / Elder', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Green Tea Hills', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Courtyard Garden', url: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80' }
];

export default function MyMemory() {
  const [memories, setMemories] = useState(getMemories());
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(null);

  useStorageListener((detail) => {
    if (detail && detail.key === 'mindora_memories') {
      setMemories(getMemories());
    }
  });

  const [activeVoicePlayingId, setActiveVoicePlayingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'people',
    relation: '',
    description: '',
    avatarUrl: SAMPLE_AVATARS[0].url,
    voiceAudioUrl: '',
    voiceGreeting: '',
    voiceProfile: 'daughter',
    voicePitch: 1.15
  });

  const categories = [
    { key: 'all', label: 'All', icon: Sparkles },
    { key: 'people', label: 'People', icon: Users },
    { key: 'places', label: 'Places', icon: MapPin },
    { key: 'things', label: 'Things', icon: Heart },
    { key: 'moments', label: 'Moments', icon: Sparkles }
  ];

  const filteredMemories = activeCategory === 'all'
    ? memories
    : memories.filter(m => m.category === activeCategory || m.type === activeCategory.slice(0, -1));

  const handleOpenModal = () => {
    playFlipSound();
    setEditingMemoryId(null);
    setFormData({
      name: '',
      category: 'people',
      relation: '',
      description: '',
      avatarUrl: SAMPLE_AVATARS[0].url,
      voiceAudioUrl: '',
      voiceGreeting: '',
      voiceProfile: 'daughter',
      voicePitch: 1.15
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mem) => {
    playFlipSound();
    setEditingMemoryId(mem.id);
    const categoryVal = mem.category || (mem.type === 'person' ? 'people' : mem.type === 'place' ? 'places' : mem.type === 'thing' ? 'things' : 'moments');
    setFormData({
      name: mem.name || '',
      category: categoryVal,
      relation: mem.relation || '',
      description: mem.description || '',
      avatarUrl: mem.avatarUrl || SAMPLE_AVATARS[0].url,
      voiceAudioUrl: mem.voiceAudioUrl || '',
      voiceGreeting: mem.voiceGreeting || '',
      voiceProfile: mem.voiceProfile || 'daughter',
      voicePitch: typeof mem.voicePitch === 'number' ? mem.voicePitch : 1.15
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playFlipSound();
    stopAllVoices();
    setIsModalOpen(false);
    setEditingMemoryId(null);
  };

  const handleSelectMemoryCard = (mem) => {
    playFlipSound();
    setSelectedMemory(mem);
  };

  const handleSpeakMemory = (mem) => {
    playFlipSound();
    const narration = `${mem.name}. ${mem.relation ? `${mem.relation}. ` : ''}${mem.description}`;
    speakText(narration);
  };

  const handlePlayVoice = (mem) => {
    playFlipSound();
    if (activeVoicePlayingId === mem.id) {
      stopAllVoices();
      setActiveVoicePlayingId(null);
    } else {
      setActiveVoicePlayingId(mem.id);
      playPersonVoice(mem, {
        onStart: () => setActiveVoicePlayingId(mem.id),
        onEnd: () => setActiveVoicePlayingId(null),
        onError: () => setActiveVoicePlayingId(null)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    playSuccessChime();

    if (editingMemoryId) {
      // Edit existing memory
      const updatedFields = {
        name: formData.name.trim(),
        category: formData.category,
        type: formData.category === 'people' ? 'person' : formData.category === 'places' ? 'place' : formData.category === 'things' ? 'thing' : 'moment',
        relation: formData.relation.trim() || 'Family Member',
        description: formData.description.trim() || 'A cherished memory in our family circle.',
        avatarUrl: formData.avatarUrl,
        hint: formData.relation.trim() || formData.name.trim(),
        voiceAudioUrl: formData.voiceAudioUrl || '',
        voiceGreeting: formData.voiceGreeting || '',
        voiceProfile: formData.voiceProfile || 'daughter',
        voicePitch: formData.voicePitch || 1.0
      };

      const updated = editMemory(editingMemoryId, updatedFields);
      setMemories(updated);

      if (selectedMemory && selectedMemory.id === editingMemoryId) {
        setSelectedMemory({ ...selectedMemory, ...updatedFields });
      }

      setIsModalOpen(false);
      setEditingMemoryId(null);

      setSaveSuccessNotice(`"${updatedFields.name}" updated! Changes are live in TalkBot and memory games.`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    } else {
      // Create new memory
      const newEntry = {
        name: formData.name.trim(),
        category: formData.category,
        type: formData.category === 'people' ? 'person' : formData.category === 'places' ? 'place' : formData.category === 'things' ? 'thing' : 'moment',
        relation: formData.relation.trim() || 'Family Member',
        description: formData.description.trim() || 'A cherished memory in our family circle.',
        avatarUrl: formData.avatarUrl,
        hint: formData.relation.trim() || formData.name.trim(),
        voiceAudioUrl: formData.voiceAudioUrl || '',
        voiceGreeting: formData.voiceGreeting || '',
        voiceProfile: formData.voiceProfile || 'daughter',
        voicePitch: formData.voicePitch || 1.0
      };

      const updated = addMemory(newEntry);
      setMemories(updated);
      setIsModalOpen(false);
      setFormData({
        name: '',
        category: 'people',
        relation: '',
        description: '',
        avatarUrl: SAMPLE_AVATARS[0].url,
        voiceAudioUrl: '',
        voiceGreeting: '',
        voiceProfile: 'daughter',
        voicePitch: 1.15
      });

      setSaveSuccessNotice(`"${newEntry.name}" added to memories! Voice clip ready for "Who's Speaking?".`);
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }
  };

  return (
    <div className="my-memory-container">
      {/* Header */}
      <div className="memory-header-row">
        <div>
          <h1 className="patient-greeting">My Memory</h1>
          <p className="patient-subhead">Things that are important to you.</p>
        </div>

        <button className="add-memory-btn" onClick={handleOpenModal} aria-label="Add new memory">
          <Plus size={20} />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Success Notification Pill */}
      {saveSuccessNotice && (
        <div className="memory-success-banner animate-fade-in">
          <Check size={18} className="success-icon" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="memory-categories-bar" role="tablist">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              role="tab"
              aria-selected={isActive}
              className={`cat-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                playFlipSound();
                setActiveCategory(cat.key);
              }}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="memory-empty-state">
          <Heart size={44} className="empty-icon" />
          <h3 className="empty-title">Your memory library is still growing.</h3>
          <p className="empty-desc">
            Ask a caregiver to add people, places or moments that are important to you.
          </p>
        </div>
      ) : (
        <div className="memories-grid">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="memory-card"
              onClick={() => handleSelectMemoryCard(mem)}
              role="button"
              tabIndex={0}
              aria-label={`View memory: ${mem.name}`}
            >
              <div className="memory-card-img-wrap">
                <img
                  src={mem.avatarUrl}
                  alt={mem.name}
                  className="memory-card-img"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                {mem.relation && (
                  <span className="memory-relation-badge">{mem.relation}</span>
                )}
                {(mem.type === 'person' || mem.category === 'people') && (mem.voiceAudioUrl || mem.voiceGreeting) && (
                  <span className="memory-voice-indicator" title="Voice clip available">
                    <Mic size={11} />
                    <span>Voice</span>
                  </span>
                )}
              </div>

              <div className="memory-card-content">
                <div className="memory-title-row">
                  <h3 className="memory-name">{mem.name}</h3>
                  <div className="card-btn-group">
                    {(mem.type === 'person' || mem.category === 'people') && (
                      <button
                        className={`voice-card-btn ${activeVoicePlayingId === mem.id ? 'playing' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayVoice(mem);
                        }}
                        title={`Listen to ${mem.name}'s voice`}
                        aria-label={`Listen to ${mem.name}'s voice`}
                      >
                        <Mic size={15} />
                      </button>
                    )}
                    <button
                      className="speak-card-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeakMemory(mem);
                      }}
                      title="Read memory aloud"
                      aria-label={`Read ${mem.name} aloud`}
                    >
                      <Volume2 size={16} />
                    </button>
                    <button
                      className="edit-card-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(mem);
                      }}
                      title={`Edit ${mem.name}`}
                      aria-label={`Edit ${mem.name}`}
                    >
                      <Edit3 size={15} />
                    </button>
                  </div>
                </div>
                <p className="memory-desc-snippet">{mem.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="modal-backdrop animate-fade-in" onClick={() => { stopAllVoices(); setSelectedMemory(null); }}>
          <div className="memory-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { stopAllVoices(); setSelectedMemory(null); }} aria-label="Close modal">
              <X size={20} />
            </button>

            <div className="modal-detail-img-wrap">
              <img src={selectedMemory.avatarUrl} alt={selectedMemory.name} className="modal-detail-img" />
            </div>

            <div className="modal-detail-info">
              <div className="modal-title-bar">
                <div>
                  <h2 className="modal-mem-name">{selectedMemory.name}</h2>
                  {selectedMemory.relation && (
                    <span className="modal-mem-relation">{selectedMemory.relation}</span>
                  )}
                </div>

                <div className="modal-actions-right">
                  <button
                    className="modal-edit-btn"
                    onClick={() => {
                      const memToEdit = selectedMemory;
                      setSelectedMemory(null);
                      handleOpenEdit(memToEdit);
                    }}
                    title="Edit this memory"
                    aria-label={`Edit ${selectedMemory.name}`}
                  >
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="modal-audio-btn"
                    onClick={() => handleSpeakMemory(selectedMemory)}
                    aria-label="Listen to memory description"
                  >
                    <Volume2 size={16} />
                    <span>Story</span>
                  </button>
                </div>
              </div>

              {(selectedMemory.type === 'person' || selectedMemory.category === 'people') && (
                <div className="modal-voice-banner">
                  <div className="voice-banner-left">
                    <div className="voice-icon-pulse">
                      <Mic size={18} />
                    </div>
                    <div>
                      <span className="voice-banner-title">{selectedMemory.name}'s Voice</span>
                      <p className="voice-banner-sub">
                        {selectedMemory.voiceGreeting
                          ? `"${selectedMemory.voiceGreeting.slice(0, 65)}..."`
                          : "Listen to familiar greeting & voice clip."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`modal-voice-play-btn ${activeVoicePlayingId === selectedMemory.id ? 'playing' : ''}`}
                    onClick={() => handlePlayVoice(selectedMemory)}
                  >
                    <Volume2 size={16} />
                    <span>{activeVoicePlayingId === selectedMemory.id ? 'Stop' : 'Play Voice'}</span>
                  </button>
                </div>
              )}

              <p className="modal-mem-text">{selectedMemory.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={handleCloseModal}>
          <div className="memory-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-heading">
                {editingMemoryId ? "Edit Cherished Memory" : "Add a Cherished Memory"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="memory-form">
              <div className="form-group">
                <label className="form-label">Name or Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya, Assam Garden, Morning Chai"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  <option value="people">People (Family &amp; Friends)</option>
                  <option value="places">Places (Home &amp; Hometown)</option>
                  <option value="things">Things (Everyday Objects)</option>
                  <option value="moments">Moments (Festivals &amp; Trips)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Relationship or Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Granddaughter, Childhood Home, Daily Comfort"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Memory Description</label>
                <textarea
                  rows={3}
                  placeholder="What makes this person or place special to remember?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <ImageUploadBox
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                  label="Memory Photo or Portrait"
                  presets={SAMPLE_AVATARS}
                  placeholder="Upload family photo, moment, or place from your device"
                />
              </div>

              {formData.category === 'people' && (
                <div className="form-group">
                  <VoiceRecorderBox
                    audioUrl={formData.voiceAudioUrl}
                    onAudioChange={(url) => setFormData({ ...formData, voiceAudioUrl: url })}
                    greeting={formData.voiceGreeting}
                    onGreetingChange={(text) => setFormData({ ...formData, voiceGreeting: text })}
                    profile={formData.voiceProfile}
                    onProfileChange={(prof) => setFormData({ ...formData, voiceProfile: prof })}
                    pitch={formData.voicePitch}
                    onPitchChange={(p) => setFormData({ ...formData, voicePitch: p })}
                    personName={formData.name || 'Loved One'}
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>{editingMemoryId ? "Save Changes" : "Save Memory"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
