import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { getCreatorInfo } from '../services/questService.js';

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

const LEVELS = [
  { name: 'Explorer', minXp: 0, icon: '🧭' },
  { name: 'Adventurer', minXp: 1000, icon: '⚔️' },
  { name: 'Legend', minXp: 5000, icon: '👑' },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

function QuestDetail({ quest, questStatus, distance, formatDistance, onClose, onAccept, onOpenActive }) {
  if (!quest) return null;

  const [creatorInfo, setCreatorInfo] = useState(null);

  useEffect(() => {
    if (quest.createdBy) {
      getCreatorInfo(quest.createdBy).then(info => setCreatorInfo(info));
    }
  }, [quest.createdBy]);

  const catColor = CATEGORY_COLORS[quest.category] || '#ffc857';
  const catIcon = CATEGORY_ICONS[quest.category] || '📍';
  const diffColor = DIFFICULTY_COLORS[quest.difficulty] || '#fbbf24';
  const isAccepted = questStatus === 'accepted';
  const isCompleted = questStatus === 'completed';
  const isOwnQuest = quest.createdBy === auth.currentUser?.uid;

  const creatorLevel = creatorInfo ? getLevel(creatorInfo.xp) : null;

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}>
          <div style={styles.handle} />
        </div>

        {/* Category badge + status */}
        <div style={styles.categoryRow}>
          <div style={styles.badgeRow}>
            <span style={{
              ...styles.categoryBadge,
              background: `${catColor}15`,
              border: `1px solid ${catColor}40`,
              color: catColor,
            }}>
              {catIcon} {quest.category?.charAt(0).toUpperCase() + quest.category?.slice(1)}
            </span>
            {isAccepted && (
              <span style={styles.statusBadgeAccepted}>⚔️ Active</span>
            )}
            {isCompleted && (
              <span style={styles.statusBadgeCompleted}>✅ Completed</span>
            )}
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Distance indicator */}
        {distance !== null && distance !== undefined && (
          <div style={styles.distanceRow}>
            <span style={styles.distanceIcon}>📍</span>
            <span style={styles.distanceText}>{formatDistance(distance)}</span>
          </div>
        )}

        {/* Creator info */}
        {quest.createdBy && (
          <div style={styles.creatorRow}>
            <div style={styles.creatorLeft}>
              <span style={styles.creatorIcon}>
                {creatorLevel ? creatorLevel.icon : '🧭'}
              </span>
              <div>
                <p style={styles.creatorLabel}>
                  {isOwnQuest ? 'Created by you' : 'Community Quest'}
                </p>
                {creatorLevel && (
                  <p style={styles.creatorRank}>{creatorLevel.name}</p>
                )}
              </div>
            </div>
            <div style={styles.completionCount}>
              <span style={styles.completionNumber}>{quest.completionCount || 0}</span>
              <span style={styles.completionLabel}>completed</span>
            </div>
          </div>
        )}

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

        {/* Objective section */}
        {isAccepted || isCompleted ? (
          <div style={styles.objectiveSection}>
            <p style={styles.objectiveLabel}>🎯 QUEST OBJECTIVE</p>
            <p style={styles.objectiveText}>{quest.objective}</p>
            {quest.bonusObjectives && quest.bonusObjectives.length > 0 && (
              <div style={styles.bonusSection}>
                <p style={styles.bonusLabel}>⭐ BONUS OBJECTIVES</p>
                {quest.bonusObjectives.map((bonus, i) => (
                  <p key={i} style={styles.bonusItem}>• {bonus}</p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={styles.mysterySection}>
            <div style={styles.lockIcon}>🔒</div>
            <p style={styles.mysteryTitle}>Objective Hidden</p>
            <p style={styles.mysteryText}>
              Accept this quest to reveal what awaits you. Travel to the location to complete it.
            </p>
          </div>
        )}

        {/* Required items */}
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

        {/* Action button */}
        {isCompleted ? (
          <div style={styles.completedBanner}>
            <span style={styles.completedText}>✅ Quest Complete — {quest.xp} XP Earned</span>
          </div>
        ) : isAccepted ? (
          <button onClick={onOpenActive} style={styles.completeButton}>
            📸 Complete Quest
          </button>
        ) : (
          <button onClick={() => onAccept(quest)} style={styles.acceptButton}>
            Accept Quest
          </button>
        )}
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
    maxHeight: '85vh',
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
    marginBottom: '12px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  categoryBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  statusBadgeAccepted: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: 'rgba(251,191,36,0.1)',
    border: '1px solid rgba(251,191,36,0.3)',
    color: '#fbbf24',
  },
  statusBadgeCompleted: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: 'rgba(52,211,153,0.1)',
    border: '1px solid rgba(52,211,153,0.3)',
    color: '#34d399',
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
  distanceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
  },
  distanceIcon: {
    fontSize: '14px',
  },
  distanceText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  creatorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '16px',
  },
  creatorLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  creatorIcon: {
    fontSize: '22px',
  },
  creatorLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  creatorRank: {
    fontSize: '11px',
    color: 'rgba(255,200,87,0.5)',
    fontWeight: '600',
  },
  completionCount: {
    textAlign: 'center',
  },
  completionNumber: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffc857',
  },
  completionLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
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
  objectiveSection: {
    padding: '20px 16px',
    borderRadius: '16px',
    background: 'rgba(52,211,153,0.04)',
    border: '1px solid rgba(52,211,153,0.15)',
    marginBottom: '20px',
  },
  objectiveLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#34d399',
    letterSpacing: '1.5px',
    marginBottom: '10px',
  },
  objectiveText: {
    fontSize: '15px',
    color: '#ffffff',
    lineHeight: '1.6',
  },
  bonusSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
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
  completeButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  completedBanner: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    background: 'rgba(52,211,153,0.08)',
    border: '1px solid rgba(52,211,153,0.2)',
    textAlign: 'center',
  },
  completedText: {
    color: '#34d399',
    fontSize: '15px',
    fontWeight: '600',
  },
};

export default QuestDetail;