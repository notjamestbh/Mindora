import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Check } from 'lucide-react';
import { playFlipSound } from '../../utils/sound';
import './ImageUploadBox.css';

/**
 * Resizes and compresses an image file using an HTML Canvas to keep localStorage light
 */
const compressImageFile = (file, maxWidth = 600, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly JPEG data URL
        const compressedDataUrl = elem.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ImageUploadBox({
  value,
  onChange,
  label = "Photo / Portrait",
  presets = [],
  placeholder = "Upload a photo from your computer or device"
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please choose an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    try {
      setIsProcessing(true);
      const compressedDataUrl = await compressImageFile(file);
      playFlipSound();
      onChange(compressedDataUrl);
    } catch (err) {
      console.error("Error processing image file:", err);
      alert("Unable to process this image. Please try another file.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please drop a valid image file");
      return;
    }

    try {
      setIsProcessing(true);
      const compressedDataUrl = await compressImageFile(file);
      playFlipSound();
      onChange(compressedDataUrl);
    } catch (err) {
      console.error("Error processing dropped image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="image-upload-box-wrapper">
      {label && <label className="image-upload-label">{label}</label>}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Main Upload / Preview Area */}
      {value ? (
        <div className="image-preview-card">
          <div className="preview-image-container">
            <img src={value} alt="Selected preview" className="preview-image-thumb" />
            <div className="preview-overlay">
              <button
                type="button"
                className="change-image-btn"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                title="Change photo"
              >
                <Camera size={16} />
                <span>Change</span>
              </button>
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => {
                  playFlipSound();
                  onChange('');
                }}
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="preview-caption">
            <Check size={14} className="caption-check-icon" />
            <span>Image ready to use</span>
          </div>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }
          }}
        >
          <div className="dropzone-icon-circle">
            <Upload size={22} />
          </div>
          <div className="dropzone-text-group">
            <span className="dropzone-main-text">
              {isProcessing ? "Processing photo..." : "Click or drag & drop photo here"}
            </span>
            <span className="dropzone-sub-text">{placeholder}</span>
          </div>
        </div>
      )}

      {/* Preset suggestions picker if provided */}
      {presets && presets.length > 0 && (
        <div className="preset-suggestions-container">
          <span className="preset-row-heading">Or choose from familiar presets:</span>
          <div className="preset-thumbs-scroller">
            {presets.map((preset, idx) => {
              const url = typeof preset === 'string' ? preset : preset.url;
              const title = typeof preset === 'string' ? `Preset ${idx + 1}` : preset.label;
              const isSelected = value === url;

              return (
                <button
                  type="button"
                  key={idx}
                  className={`preset-thumb-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    playFlipSound();
                    onChange(url);
                  }}
                  title={title}
                  aria-label={title}
                >
                  <img src={url} alt={title} className="preset-thumb-img" />
                  {isSelected && (
                    <div className="preset-selected-badge">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
