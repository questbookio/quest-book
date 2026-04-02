import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';

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

const TABS = [
  { id: 'xp', label: 'Total XP', field: 'xp', icon: '⚡' },
  { id: 'quests', label: 'Quests', field: 'questsCompleted', icon: '🏆' },
  { id: 'creator', label: 'Creator XP', field: 'creatorXpEarned', icon: '🗺️' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function Leaderboard({ onClose }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('xp');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const tab = TABS.find(t => t.id === activeTab);
      const q = query(
        collection(db, 'users'),
        orderBy(tab.field, 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const userData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => (u[tab.field] || 0) > 0);
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
    setLoading(false);
  };

  const tab = TABS.find(t => t.id === activeTab);

  const myRank = users.findIndex(u => u.id === user?.uid);

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <p style={styles.headerTitle}>🏆 Leaderboard</p>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tab,
                background: activeTab === t.id
                  ? 'rgba(255,200,87,0.12)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: activeTab === t.id
                  ? 'rgba(255,200,87,0.3)'
                  : 'rgba(255,255,255,0.08)',
                color: activeTab === t.id
                  ? '#ffc857'
                  : 'rgba(255,255,255,0.4)',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Your rank banner */}
        {myRank >= 0 && (
          <div style={styles.myRankBanner}>
            <span style={styles.myRankLabel}>Your rank</span>
            <span style={styles.myRankNumber}>#{myRank + 1}</span>
          </div>
        )}

        {loading ? (
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        ) : users.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No one on the board yet. Be the first!</p>
          </div>
        ) : (
          <div style={styles.list}>
            {/* Top 3 podium */}
            {users.length >= 3 && (
              <div style={styles.podium}>
                {/* 2nd place */}
                <div style={styles.podiumSpot}>
                  <div style={{ ...styles.podiumAvatar, ...styles.podiumSilver }}>
                    <span style={styles.podiumEmoji}>{users[1].avatar || '🧭'}</span>
                  </div>
                  <span style={styles.podiumMedal}>{MEDALS[1]}</span>
                  <p style={styles.podiumName}>{users[1].displayName || 'Explorer'}</p>
                  <p style={styles.podiumScore}>{(users[1][tab.field] || 0).toLocaleString()}</p>
                </div>
                {/* 1st place */}
                <div style={styles.podiumSpot}>
                  <div style={{ ...styles.podiumAvatar, ...styles.podiumGold }}>
                    <span style={{ ...styles.podiumEmoji, fontSize: '28px' }}>{users[0].avatar || '🧭'}</span>
                  </div>
                  <span style={{ ...styles.podiumMedal, fontSize: '24px' }}>{MEDALS[0]}</span>
                  <p style={styles.podiumName}>{users[0].displayName || 'Explorer'}</p>
                  <p style={{ ...styles.podiumScore, color: '#ffc857' }}>{(users[0][tab.field] || 0).toLocaleString()}</p>
                </div>
                {/* 3rd place */}
                <div style={styles.podiumSpot}>
                  <div style={{ ...styles.podiumAvatar, ...styles.podiumBronze }}>
                    <span style={styles.podiumEmoji}>{users[2].avatar || '🧭'}</span>
                  </div>
                  <span style={styles.podiumMedal}>{MEDALS[2]}</span>
                  <p style={styles.podiumName}>{users[2].displayName || 'Explorer'}</p>
                  <p style={styles.podiumScore}>{(users[2][tab.field] || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Rest of the list */}
            {users.slice(users.length >= 3 ? 3 : 0).map((u, index) => {
              const rank = users.length >= 3 ? index + 4 : index + 1;
              const isMe = u.id === user?.uid;
              const level = getLevel(u.xp || 0);

              return (
                <div
                  key={u.id}
                  style={{
                    ...styles.listItem,
                    background: isMe
                      ? 'rgba(255,200,87,0.06)'
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isMe
                      ? 'rgba(255,200,87,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <span style={styles.rank}>#{rank}</span>
                  <span style={styles.listAvatar}>{u.avatar || '🧭'}</span>
                  <div style={styles.listInfo}>
                    <p style={{
                      ...styles.listName,
                      color: isMe ? '#ffc857' : 'rgba(255,255,255,0.8)',
                    }}>
                      {u.displayName || 'Explorer'}
                      {isMe && <span style={styles.youBadge}> (you)</span>}
                    </p>
                    <p style={styles.listLevel}>{level.icon} {level.name}</p>
                  </div>
                  <span style={styles.listScore}>
                    {(u[tab.field] || 0).toLocaleString()}
                  </span>
                </div>
              );
            })}

            {/* If less than 3, show simple list for top entries too */}
            {users.length < 3 && users.length > 0 && (
              <>
                {users.map((u, index) => {
                  const isMe = u.id === user?.uid;
                  const level = getLevel(u.xp || 0);
                  return (
                    <div
                      key={u.id}
                      style={{
                        ...styles.listItem,
                        background: isMe
                          ? 'rgba(255,200,87,0.06)'
                          : 'rgba(255,255,255,0.02)',
                        borderColor: isMe
                          ? 'rgba(255,200,87,0.15)'
                          : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <span style={styles.rank}>{MEDALS[index] || `#${index + 1}`}</span>
                      <span style={styles.listAvatar}>{u.avatar || '🧭'}</span>
                      <div style={styles.listInfo}>
                        <p style={{
                          ...styles.listName,
                          color: isMe ? '#ffc857' : 'rgba(255,255,255,0.8)',
                        }}>
                          {u.displayName || 'Explorer'}
                          {isMe && <span style={styles.youBadge}> (you)</span>}
                        </p>
                        <p style={styles.listLevel}>{level.icon} {level.name}</p>
                      </div>
                      <span style={styles.listScore}>
                        {(u[tab.field] || 0).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
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
    alignItems: 'center',
    marginBottom: '16px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
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
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  tab: {
    flex: 1,
    padding: '10px 8px',
    borderRadius: '12px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  myRankBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '12px',
    background: 'rgba(255,200,87,0.06)',
    border: '1px solid rgba(255,200,87,0.15)',
    marginBottom: '16px',
  },
  myRankLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
  },
  myRankNumber: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffc857',
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
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.35)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  podium: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '12px',
    marginBottom: '20px',
    padding: '16px 0',
  },
  podiumSpot: {
    textAlign: 'center',
    flex: 1,
  },
  podiumAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 4px',
  },
  podiumGold: {
    width: '56px',
    height: '56px',
    background: 'rgba(255,200,87,0.15)',
    border: '2px solid rgba(255,200,87,0.4)',
  },
  podiumSilver: {
    background: 'rgba(192,192,192,0.1)',
    border: '2px solid rgba(192,192,192,0.3)',
  },
  podiumBronze: {
    background: 'rgba(205,127,50,0.1)',
    border: '2px solid rgba(205,127,50,0.3)',
  },
  podiumEmoji: {
    fontSize: '22px',
  },
  podiumMedal: {
    fontSize: '18px',
    display: 'block',
    marginBottom: '4px',
  },
  podiumName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  podiumScore: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid',
  },
  rank: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    minWidth: '30px',
  },
  listAvatar: {
    fontSize: '22px',
    flexShrink: 0,
  },
  listInfo: {
    flex: 1,
    minWidth: 0,
  },
  listName: {
    fontSize: '14px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  youBadge: {
    fontSize: '11px',
    fontWeight: '400',
    opacity: 0.6,
  },
  listLevel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '2px',
  },
  listScore: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffc857',
    flexShrink: 0,
  },
};

export default Leaderboard;