import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getActiveQuests, getCompletedQuests } from '../services/questService.js';

const LEVELS = [
  { name: 'Explorer', minXp: 0, maxXp: 999, icon: '🧭' },
  { name: 'Adventurer', minXp: 1000, maxXp: 4999, icon: '⚔️' },
  { name: 'Legend', minXp: 5000, maxXp: 10000, icon: '👑' },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

const AVATARS = ['🧭', '⚔️', '👑', '🐉', '🦅', '🔥', '🌊', '⚡', '🏔️', '🌙', '🦊', '🐺', '🦁', '🎯', '💎', '🛡️'];

const CATEGORY_ICONS = {
  exploration: '🧭',
  photo: '📸',
  challenge: '🧩',
  social: '👥',
  activity: '🏃',
};

function Profile({ onClose }) {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [activeQuests, setActiveQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [newName, setNewName] = useState('');
  const [tab, setTab] = useState('active');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Get user profile
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
          setNewName(snap.data().displayName || '');
        } else {
          // Create profile if doesn't exist
          const defaultData = {
            displayName: user.email.split('@')[0],
            avatar: '🧭',
            xp: 0,
            questsCompleted: 0,
            creatorXpEarned: 0,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, defaultData);
          setUserData(defaultData);
          setNewName(defaultData.displayName);
        }

        // Get quests
        const active = await getActiveQuests(user.uid);
        const completed = await getCompletedQuests(user.uid);
        setActiveQuests(active);
        setCompletedQuests(completed);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim().length < 2) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newName.trim().slice(0, 20),
      });
      setUserData(prev => ({ ...prev, displayName: newName.trim().slice(0, 20) }));
      setEditingName(false);
    } catch (err) {
      console.error('Error updating name:', err);
    }
  };

  const handleSelectAvatar = async (avatar) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { avatar });
      setUserData(prev => ({ ...prev, avatar }));
      setEditingAvatar(false);
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  if (loading) {
    return (
      <>
        <div style={styles.backdrop} onClick={onClose} />
        <div style={styles.sheet}>
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        </div>
      </>
    );
  }

  const xp = userData?.xp || 0;
  const level = getLevel(xp);
  const progress = (xp - level.minXp) / (level.maxXp - level.minXp);
  const displayName = userData?.displayName || user.email.split('@')[0];
  const avatar = userData?.avatar || '🧭';

  const questList = tab === 'active' ? activeQuests : completedQuests;

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        {/* Close button */}
        <div style={styles.topRow}>
          <div />
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Avatar + Name */}
        <div style={styles.profileHeader}>
          <div
            style={styles.avatarCircle}
            onClick={() => setEditingAvatar(!editingAvatar)}
          >
            <span style={styles.avatarEmoji}>{avatar}</span>
            <span style={styles.avatarEdit}>✏️</span>
          </div>

          {editingAvatar && (
            <div style={styles.avatarPicker}>
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => handleSelectAvatar(a)}
                  style={{
                    ...styles.avatarOption,
                    background: avatar === a ? 'rgba(255,200,87,0.2)' : 'rgba(255,255,255,0.04)',
                    borderColor: avatar === a ? '#ffc857' : 'rgba(255,255,255,0.08)',
                  }}
                >{a}</button>
              ))}
            </div>
          )}

          {editingName ? (
            <div style={styles.nameEditRow}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
                style={styles.nameInput}
                autoFocus
              />
              <button onClick={handleSaveName} style={styles.nameSaveButton}>Save</button>
              <button onClick={() => setEditingName(false)} style={styles.nameCancelButton}>✕</button>
            </div>
          ) : (
            <div style={styles.nameRow}>
              <p style={styles.displayName}>{displayName}</p>
              <button onClick={() => setEditingName(true)} style={styles.editNameButton}>✏️</button>
            </div>
          )}

          <p style={styles.emailText}>{user.email}</p>
        </div>

        {/* Level + XP bar */}
        <div style={styles.levelSection}>
          <div style={styles.levelTopRow}>
            <span style={styles.levelName}>{level.icon} {level.name}</span>
            <span style={styles.levelXp}>{xp} / {level.maxXp} XP</span>
          </div>
          <div style={styles.barOuter}>
            <div style={{ ...styles.barInner, width: `${Math.max(progress * 100, 2)}%` }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{userData?.questsCompleted || 0}</span>
            <span style={styles.statLabel}>Quests Done</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{xp}</span>
            <span style={styles.statLabel}>Total XP</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{activeQuests.length}</span>
            <span style={styles.statLabel}>Active</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{userData?.creatorXpEarned || 0}</span>
            <span style={styles.statLabel}>Creator XP</span>
          </div>
        </div>

        {/* Quest history tabs */}
        <div style={styles.tabRow}>
          <button
            onClick={() => setTab('active')}
            style={{
              ...styles.tab,
              borderBottomColor: tab === 'active' ? '#ffc857' : 'transparent',
              color: tab === 'active' ? '#ffc857' : 'rgba(255,255,255,0.35)',
            }}
          >Active ({activeQuests.length})</button>
          <button
            onClick={() => setTab('completed')}
            style={{
              ...styles.tab,
              borderBottomColor: tab === 'completed' ? '#34d399' : 'transparent',
              color: tab === 'completed' ? '#34d399' : 'rgba(255,255,255,0.35)',
            }}
          >Completed ({completedQuests.length})</button>
        </div>

        {/* Quest list */}
        {questList.length === 0 ? (
          <div style={styles.emptyList}>
            <p style={styles.emptyText}>
              {tab === 'active' ? 'No active quests. Go explore!' : 'No completed quests yet.'}
            </p>
          </div>
        ) : (
          <div style={styles.questList}>
            {questList.map(q => (
              <div key={q.id} style={styles.questItem}>
                <span style={styles.questItemIcon}>
                  {CATEGORY_ICONS[q.category] || '📍'}
                </span>
                <div style={styles.questItemContent}>
                  <p style={styles.questItemHint}>{q.hint}</p>
                  <p style={styles.questItemMeta}>
                    {q.difficulty} · {q.xp} XP
                    {q.completedAt && ' · ✅'}
                  </p>
                </div>
                <span style={{
                  ...styles.questItemXp,
                  color: tab === 'completed' ? '#34d399' : '#fbbf24',
                }}>
                  {tab === 'completed' ? `+${q.xp}` : q.xp} XP
                </span>
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
    marginBottom: '8px',
  },
  handle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.2)',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
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
    padding: '60px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255,200,87,0.2)',
    borderTop: '3px solid #ffc857',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  profileHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  avatarCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(255,200,87,0.1)',
    border: '2px solid rgba(255,200,87,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    cursor: 'pointer',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: '32px',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    fontSize: '12px',
    background: 'rgba(10,10,15,0.9)',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  avatarPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  avatarOption: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  displayName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
  },
  editNameButton: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    opacity: 0.5,
  },
  nameEditRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  nameInput: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid rgba(255,200,87,0.3)',
    background: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    outline: 'none',
    width: '160px',
    textAlign: 'center',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  nameSaveButton: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#ffc857',
    color: '#0a0a0f',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  nameCancelButton: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.25)',
  },
  levelSection: {
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '16px',
  },
  levelTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  levelName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
  },
  levelXp: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  barOuter: {
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #ffc857, #f0a030)',
    transition: 'width 0.5s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '20px',
  },
  statCard: {
    textAlign: 'center',
    padding: '12px 4px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  statNumber: {
    display: 'block',
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tabRow: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '12px',
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.2s',
  },
  emptyList: {
    textAlign: 'center',
    padding: '30px 20px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.3)',
  },
  questList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  questItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  questItemIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  questItemContent: {
    flex: 1,
    minWidth: 0,
  },
  questItemHint: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  questItemMeta: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '2px',
  },
  questItemXp: {
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
};

export default Profile;