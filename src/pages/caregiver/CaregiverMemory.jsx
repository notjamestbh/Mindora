import React, { useState } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Users,
  MapPin,
  Sparkles,
  Check,
  X,
  Info
} from 'lucide-react';
import { getMemories, addMemory, deleteMemory } from '../../utils/storage';
import { playFlipSound, playSuccessChime } from '../../utils/sound';
import ImageUploadBox from '../../components/common/ImageUploadBox';
import './CaregiverMemory.css';

const SAMPLE_OPTIONS = [
  { label: 'Daughter / Woman', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Son / Young Man', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Granddaughter', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Husband / Senior', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Niece / Sister', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tea Hills', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80' }
];

export default function CaregiverMemory() {
  const [memories, setMemories] = useState(getMemories());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetCategory, setPresetCategory] = useState('people');
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'people',
    relation: '',
    description: '',
    avatarUrl: SAMPLE_OPTIONS[0].url
  });

  const handleOpenAdd = (cat = 'people') => {
    playFlipSound();
    setPresetCategory(cat);
    setFormData({
      name: '',
      category: cat,
      relation: cat === 'people' ? 'Family Member' : cat === 'places' ? 'Familiar Place' : 'Household Object',
      description: '',
      avatarUrl: SAMPLE_OPTIONS[0].url
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    playFlipSound();
    if (window.confirm(`Remove "${name}" from memory library?`)) {
      const updated = deleteMemory(id);
      setMemories([...updated]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    playSuccessChime();
    const newMem = {
      name: formData.name.trim(),
      category: formData.category,
      type: formData.category === 'people' ? 'person' : formData.category === 'places' ? 'place' : 'thing',
      relation: formData.relation.trim() || 'Family',
      description: formData.description.trim() || 'A familiar memory.',
      avatarUrl: formData.avatarUrl,
      hint: formData.relation.trim()
    };

    const updated = addMemory(newMem);
    setMemories([...updated]);
    setIsModalOpen(false);

    setFeedbackNotice(`Added "${newMem.name}". It is now immediately ready in patient games like "Who Is This?".`);
    setTimeout(() => setFeedbackNotice(null), 4500);
  };

  return (
    <div className="caregiver-memory-container">
      {/* Header */}
      <div className="memory-page-top">
        <div>
          <h1 className="caregiver-title">Memory Library Management</h1>
          <p className="caregiver-subtitle">
            Personalize Amma's companion world with family members, cherished locations, and familiar items.
          </p>
        </div>

        <div className="memory-quick-actions">
          <button className="add-btn person" onClick={() => handleOpenAdd('people')}>
            <Plus size={16} />
            <span>Add Person</span>
          </button>
          <button className="add-btn place" onClick={() => handleOpenAdd('places')}>
            <Plus size={16} />
            <span>Add Place</span>
          </button>
          <button className="add-btn thing" onClick={() => handleOpenAdd('things')}>
            <Plus size={16} />
            <span>Add Object</span>
          </button>
        </div>
      </div>

      {/* Golden Loop Demonstration Notice */}
      <div className="golden-loop-banner">
        <Info size={20} className="golden-info-icon" />
        <p>
          <strong>Dynamic Cognitive Personalization:</strong> Memories saved here are directly fed into
          Amma's patient activities—such as the <em>"Who Is This?"</em> family recognition game and <em>"Find the Pair"</em>.
        </p>
      </div>

      {feedbackNotice && (
        <div className="caregiver-save-notice animate-fade-in">
          <Check size={18} />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Memories Grid */}
      <div className="caregiver-memories-grid">
        {memories.map((mem) => (
          <div key={mem.id} className="cg-memory-card">
            <div className="cg-memory-img-wrap">
              <img src={mem.avatarUrl} alt={mem.name} className="cg-memory-img" />
              <span className={`cg-category-tag ${mem.category || mem.type}`}>
                {mem.category || mem.type}
              </span>
            </div>

            <div className="cg-memory-body">
              <div className="cg-title-row">
                <h3 className="cg-name">{mem.name}</h3>
                <button
                  className="delete-mem-btn"
                  onClick={() => handleDelete(mem.id, mem.name)}
                  title="Remove from memory library"
                  aria-label={`Remove ${mem.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {mem.relation && <span className="cg-relation">{mem.relation}</span>}
              <p className="cg-description">{mem.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for adding */}
      {isModalOpen && (
        <div className="modal-backdrop animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="cg-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-heading">Add to Memory Library</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="cg-modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya, Guwahati Riverfront, Morning Chai Cup"
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
                  <option value="people">Person (Family / Friend)</option>
                  <option value="places">Place (Home / Region)</option>
                  <option value="things">Object (Household / Cultural)</option>
                  <option value="moments">Moment (Festival / Milestone)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Relationship or Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Niece, Childhood Hill, Morning Comfort"
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Story Prompt</label>
                <textarea
                  rows={3}
                  placeholder="Notes about this person or memory to aid recall..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <ImageUploadBox
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                  label="Select or Upload Photo"
                  presets={SAMPLE_OPTIONS}
                  placeholder="Upload a high-resolution portrait or memorable location"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
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
