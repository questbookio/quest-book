import React from 'react';

const CATEGORY_COLORS = {
  exploration: '#34d399',
  photo: '#60a5fa',
  challenge: '#f472b6',
  social: '#c084fc',
  activity: '#fb923c',
};

const CATEGORY_ICONS = {
  exploration: '🧭',
  photo: '📸',
  challenge: '🧩',
  social: '👥',
  activity: '🏃',
};

const DIFFICULTY_COLORS = {
  Easy: '#34d399',
  Medium: '#fbbf24',
  Hard: '#f87171',
};

function QuestDetail({ quest, onClose, onAccept }) {
  if (!quest) return null;

  const catColor = CATEGORY_COLORS[quest.category] || '#ffc857';
  const catIcon = CATEGORY_ICONS[quest.category] || '📍';
  const diffColor = DIFFICULTY_COLORS[quest.difficulty] || '#fbbf24';

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Bottom sheet */}
      <div style={styles.sheet}>
        {/* Drag handle */}
        <div style={styles.handleBar}>
          <div style={styles.handle} />
        </div>

        {/* Category badge */}
        <div style={styles.categoryRow}>
          <span style={{
            ...styles.categoryBadge,
            background: `${catColor}15`,
            border: `1px solid ${catColor}40`,
            color: catColor,
          }}>
            {catIcon} {quest.category?.charAt(0).toUpperCase() + quest.category?.slice(1)}
          </span>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Hint */}
        <div style={styles.hintSection}>
          <p style={styles.hintLabel}>CRYPTIC HINT</p>
          <p style={styles.hintText}>"{quest.hint}"</p>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Difficulty</span>
            <span style={{ ...styles.statValue, color: diffColor }}>
              {quest.difficulty}
            </span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Reward</span>
            <span style={{ ...styles.statValue, color: '#ffc857' }}>
              {quest.xp} XP
            </span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statBox}>
            <span style={styles.statLabel}>Cost</span>
            <span style={styles.statValue}>
              {quest.cost === 'Free' ? '🆓 Free' : `💰 ${quest.cost}`}
            </span>
          </div>
        </div>

        {/* Tags */}
        {quest.tags && quest.tags.length > 0 && (
          <div style={styles.tagsRow}>
            {quest.tags.map((tag, i) => (
              <span key={i} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        {/* Mystery objective section */}
        <div style={styles.mysterySection}>
          <div style={styles.lockIcon}>🔒</div>
          <p style={styles.mysteryTitle}>Objective Hidden</p>
          <p style={styles.mysteryText}>
            Travel to this location to reveal what awaits you. The quest objective will unlock when you're within range.
          </p>
        </div>

        {/* Required items (if any) */}
        {quest.requiredItems && quest.requiredItems.length > 0 && (
          <div style={styles.itemsSection}>
            <p style={styles.itemsLabel}>REQUIRED ITEMS</p>
            <div style={styles.itemsList}>
              {quest.requiredItems.map((item, i) => (
                <span key={i} style={styles.itemBadge}>🎒 {item}</span>
              ))}
            </div>
          </div>
        )}

        {/* Accept button */}
        <button onClick={() => onAccept(quest)} style={styles.acceptButton}>
          Accept Quest
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
    maxHeight: '80vh',
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
  categoryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  categoryBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
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
  hintSection: {
    marginBottom: '20px',
  },
  hintLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  hintText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '14px',
    padding: '14px 0',
    marginBottom: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  statBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.08)',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  tag: {
    padding: '5px 12px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
  },
  mysterySection: {
    textAlign: 'center',
    padding: '24px 16px',
    borderRadius: '16px',
    background: 'rgba(255,200,87,0.04)',
    border: '1px dashed rgba(255,200,87,0.2)',
    marginBottom: '20px',
  },
  lockIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  mysteryTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffc857',
    marginBottom: '6px',
  },
  mysteryText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: '1.5',
  },
  itemsSection: {
    marginBottom: '20px',
  },
  itemsLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '1.5px',
    marginBottom: '8px',
  },
  itemsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  itemBadge: {
    padding: '6px 12px',
    borderRadius: '10px',
    background: 'rgba(255,200,87,0.08)',
    border: '1px solid rgba(255,200,87,0.15)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
  },
  acceptButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)',
    color: '#0a0a0f',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
};

export default QuestDetail;