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
  Image as ImageIcon
} from 'lucide-react';
import { getMemories, addMemory } from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import { speakText } from '../../utils/speech';
import ImageUploadBox from '../../components/common/ImageUploadBox';
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
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'people',
    relation: '',
    description: '',
    avatarUrl: SAMPLE_AVATARS[0].url
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playFlipSound();
    setIsModalOpen(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    playSuccessChime();
    const newEntry = {
      name: formData.name.trim(),
      category: formData.category,
      type: formData.category === 'people' ? 'person' : formData.category === 'places' ? 'place' : formData.category === 'things' ? 'thing' : 'moment',
      relation: formData.relation.trim() || 'Family Member',
      description: formData.description.trim() || 'A cherished memory in our family circle.',
      avatarUrl: formData.avatarUrl,
      hint: formData.relation.trim() || formData.name.trim()
    };

    const updated = addMemory(newEntry);
    setMemories(updated);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'people',
      relation: '',
      description: '',
      avatarUrl: SAMPLE_AVATARS[0].url
    });

    setSaveSuccessNotice(`"${newEntry.name}" added to memories! Now available in "Who Is This?".`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
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
              </div>

              <div className="memory-card-content">
                <div className="memory-title-row">
                  <h3 className="memory-name">{mem.name}</h3>
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
                </div>
                <p className="memory-desc-snippet">{mem.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedMemory(null)}>
          <div className="memory-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedMemory(null)} aria-label="Close modal">
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

                <button
                  className="modal-audio-btn"
                  onClick={() => handleSpeakMemory(selectedMemory)}
                  aria-label="Listen to memory"
                >
                  <Volume2 size={20} />
                  <span>Listen</span>
                </button>
              </div>

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
              <h2 className="modal-heading">Add a Cherished Memory</h2>
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

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-accent">
                  <Check size={18} />
                  <span>Save Memory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
