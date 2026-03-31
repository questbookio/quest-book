import React, { useState, useRef } from 'react';

function QuestActive({ quest, onComplete, onClose }) {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Photo must be under 10MB');
      return;
    }

    setPhoto(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleComplete = async () => {
    if (!photo) {
      setError('Upload a photo to complete this quest');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await onComplete(quest, photo);
    } catch (err) {
      setError('Something went wrong. Try again.');
      setUploading(false);
    }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}>
          <div style={styles.handle} />
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.activeLabel}>⚔️ ACTIVE QUEST</p>
            <p style={styles.categoryText}>
              {quest.category?.charAt(0).toUpperCase() + quest.category?.slice(1)}
            </p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Objective */}
        <div style={styles.objectiveSection}>
          <p style={styles.objectiveLabel}>🎯 QUEST OBJECTIVE</p>
          <p style={styles.objectiveText}>{quest.objective}</p>
        </div>

        {/* Bonus objectives */}
        {quest.bonusObjectives && quest.bonusObjectives.length > 0 && (
          <div style={styles.bonusSection}>
            <p style={styles.bonusLabel}>⭐ BONUS OBJECTIVES</p>
            {quest.bonusObjectives.map((bonus, i) => (
              <p key={i} style={styles.bonusItem}>• {bonus}</p>
            ))}
          </div>
        )}

        {/* Photo upload section */}
        <div style={styles.photoSection}>
          <p style={styles.photoLabel}>📸 PROOF OF COMPLETION</p>
          <p style={styles.photoSubtext}>Take a photo or upload one from your gallery</p>

          {preview ? (
            <div style={styles.previewContainer}>
              <img src={preview} alt="Quest proof" style={styles.previewImage} />
              <button onClick={handleRemovePhoto} style={styles.removePhotoButton}>
                ✕ Remove
              </button>
            </div>
          ) : (
            <div style={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
              <div style={styles.uploadIcon}>📷</div>
              <p style={styles.uploadText}>Tap to upload photo</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* XP reward reminder */}
        <div style={styles.rewardReminder}>
          <span style={styles.rewardText}>🏆 {quest.xp} XP on completion</span>
        </div>

        {/* Complete button */}
        <button
          onClick={handleComplete}
          disabled={uploading || !photo}
          style={{
            ...styles.completeButton,
            opacity: (uploading || !photo) ? 0.5 : 1,
            cursor: (uploading || !photo) ? 'not-allowed' : 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Complete Quest'}
        </button>
      </div>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1999,
  },
  sheet: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)',
    borderRadius: '20px 20px 0 0',
    padding: '12px 20px 32px',
    zIndex: 2000,
    animation: 'slideUp 0.3s ease-out',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    WebkitOverflowScrolling: 'touch',
  },
  handleBar: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  handle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  activeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: '1.5px',
    marginBottom: '4px',
  },
  categoryText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
  },
  closeButton: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectiveSection: {
    padding: '16px',
    borderRadius: '14px',
    background: 'rgba(52,211,153,0.04)',
    border: '1px solid rgba(52,211,153,0.15)',
    marginBottom: '16px',
  },
  objectiveLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  objectiveText: {
    fontSize: '15px',
    color: '#ffffff',
    lineHeight: '1.6',
  },
  bonusSection: {
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(255,200,87,0.04)',
    border: '1px solid rgba(255,200,87,0.1)',
    marginBottom: '20px',
  },
  bonusLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255,200,87,0.6)',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  bonusItem: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: '1.8',
  },
  photoSection: {
    marginBottom: '16px',
  },
  photoLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '1.5px',
    marginBottom: '4px',
  },
  photoSubtext: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '12px',
  },
  uploadArea: {
    padding: '32px 20px',
    borderRadius: '14px',
    border: '2px dashed rgba(255,200,87,0.25)',
    background: 'rgba(255,200,87,0.03)',
    textAlign: 'center',
    cursor: 'pointer',
  },
  uploadIcon: {
    fontSize: '36px',
    marginBottom: '8px',
  },
  uploadText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: '14px',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    maxHeight: '250px',
    objectFit: 'cover',
    borderRadius: '14px',
    display: 'block',
  },
  removePhotoButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '6px 12px',
    borderRadius: '20px',
    border: 'none',
    background: 'rgba(0,0,0,0.7)',
    color: '#f87171',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  rewardReminder: {
    textAlign: 'center',
    marginBottom: '14px',
  },
  rewardText: {
    fontSize: '14px',
    color: 'rgba(255,200,87,0.6)',
    fontWeight: '600',
  },
  completeButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
};

export default QuestActive;