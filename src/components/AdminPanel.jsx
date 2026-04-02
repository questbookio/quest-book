import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

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

function AdminPanel({ onClose }) {
  const [pendingQuests, setPendingQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quests'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const quests = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingQuests(quests);
    } catch (err) {
      console.error('Error fetching pending quests:', err);
    }
    setLoading(false);
  };

  const handleApprove = async (questId) => {
    setActioningId(questId);
    try {
      await updateDoc(doc(db, 'quests', questId), { status: 'active' });
      setPendingQuests(prev => prev.filter(q => q.id !== questId));
    } catch (err) {
      console.error('Error approving quest:', err);
    }
    setActioningId(null);
  };

  const handleReject = async (questId) => {
    setActioningId(questId);
    try {
      await deleteDoc(doc(db, 'quests', questId));
      setPendingQuests(prev => prev.filter(q => q.id !== questId));
    } catch (err) {
      console.error('Error rejecting quest:', err);
    }
    setActioningId(null);
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}>
          <div style={styles.handle} />
        </div>

        <div style={styles.header}>
          <div>
            <p style={styles.headerTitle}>🛡️ Moderation</p>
            <p style={styles.headerSub}>{pendingQuests.length} quest{pendingQuests.length !== 1 ? 's' : ''} awaiting review</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner} />
          </div>
        ) : pendingQuests.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>✅</p>
            <p style={styles.emptyText}>All clear — no quests to review</p>
          </div>
        ) : (
          <div style={styles.questList}>
            {pendingQuests.map(quest => (
              <div key={quest.id} style={styles.questCard}>
                {/* Category + difficulty */}
                <div style={styles.cardTopRow}>
                  <span style={styles.cardCategory}>
                    {CATEGORY_ICONS[quest.category] || '📍'} {quest.category}
                  </span>
                  <span style={{
                    ...styles.cardDifficulty,
                    color: DIFFICULTY_COLORS[quest.difficulty] || '#fbbf24',
                  }}>
                    {quest.difficulty} · {quest.xp} XP
                  </span>
                </div>

                {/* Hint */}
                <div style={styles.cardSection}>
                  <p style={styles.cardLabel}>HINT</p>
                  <p style={styles.cardText}>"{quest.hint}"</p>
                </div>

                {/* Objective */}
                <div style={styles.cardSection}>
                  <p style={styles.cardLabel}>OBJECTIVE</p>
                  <p style={styles.cardText}>{quest.objective}</p>
                </div>

                {/* Location */}
                <div style={styles.cardSection}>
                  <p style={styles.cardLabel}>LOCATION</p>
                  <p style={styles.cardTextSmall}>
                    {quest.lat?.toFixed(4)}, {quest.lng?.toFixed(4)}
                  </p>
                </div>

                {/* Cost + tags */}
                <div style={styles.cardMetaRow}>
                  <span style={styles.cardMeta}>💰 {quest.cost || 'Free'}</span>
                  {quest.tags && quest.tags.map((tag, i) => (
                    <span key={i} style={styles.cardTag}>{tag}</span>
                  ))}
                </div>

                {/* Required items */}
                {quest.requiredItems && quest.requiredItems.length > 0 && (
                  <div style={styles.cardSection}>
                    <p style={styles.cardLabel}>REQUIRED ITEMS</p>
                    <p style={styles.cardTextSmall}>{quest.requiredItems.join(', ')}</p>
                  </div>
                )}

                {/* Bonus objectives */}
                {quest.bonusObjectives && quest.bonusObjectives.length > 0 && (
                  <div style={styles.cardSection}>
                    <p style={styles.cardLabel}>BONUS OBJECTIVES</p>
                    {quest.bonusObjectives.map((b, i) => (
                      <p key={i} style={styles.cardTextSmall}>• {b}</p>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div style={styles.actionRow}>
                  <button
                    onClick={() => handleReject(quest.id)}
                    disabled={actioningId === quest.id}
                    style={{
                      ...styles.rejectButton,
                      opacity: actioningId === quest.id ? 0.5 : 1,
                    }}
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => handleApprove(quest.id)}
                    disabled={actioningId === quest.id}
                    style={{
                      ...styles.approveButton,
                      opacity: actioningId === quest.id ? 0.5 : 1,
                    }}
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
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
    maxHeight: '92vh',
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
    marginBottom: '12px',
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
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '2px',
  },
  headerSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
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
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255,200,87,0.2)',
    borderTop: '3px solid #ffc857',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.4)',
  },
  questList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  questCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '16px',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardCategory: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'capitalize',
  },
  cardDifficulty: {
    fontSize: '12px',
    fontWeight: '600',
  },
  cardSection: {
    marginBottom: '10px',
  },
  cardLabel: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '1.5px',
    marginBottom: '4px',
  },
  cardText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: '1.5',
  },
  cardTextSmall: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: '1.5',
  },
  cardMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  cardMeta: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    padding: '3px 8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
  },
  cardTag: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.35)',
    padding: '3px 8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  rejectButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.08)',
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  approveButton: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AdminPanel;