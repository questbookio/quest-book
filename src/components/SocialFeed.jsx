import React, { useState, useEffect } from 'react';
import { getActivityFeed } from '../services/socialService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const CATEGORY_ICONS = {
  exploration: '🧭',
  photo: '📸',
  challenge: '🧩',
  social: '👥',
  activity: '🏃',
};

const CATEGORY_COLORS = {
  exploration: '#34d399',
  photo: '#60a5fa',
  challenge: '#f472b6',
  social: '#c084fc',
  activity: '#fb923c',
};

function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const time = timestamp.toDate ? timestamp.toDate().getTime() : new Date(timestamp).getTime();
  const diff = now - time;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function SocialFeed({ onClose }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      const feed = await getActivityFeed(30);
      setActivities(feed);
      setLoading(false);
    };
    fetchFeed();
  }, []);

  const handleShare = (activity) => {
    const text = `I just completed a quest on Quest Book! 🗺️⚔️\n\n"${activity.questHint}"\n\n+${activity.questXp} XP earned!\n\nMake life an adventure → questbook.app`;
    if (navigator.share) {
      navigator.share({ title: 'Quest Book', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
      });
    }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <p style={styles.headerTitle}>📡 Activity Feed</p>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {loading ? (
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        ) : activities.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🌍</p>
            <p style={styles.emptyText}>No activity yet. Complete a quest to be the first!</p>
          </div>
        ) : (
          <div style={styles.feedList}>
            {activities.map(activity => {
              const isMe = activity.userId === user?.uid;
              const catIcon = CATEGORY_ICONS[activity.questCategory] || '📍';
              const catColor = CATEGORY_COLORS[activity.questCategory] || '#ffc857';

              return (
                <div key={activity.id} style={{
                  ...styles.feedItem,
                  background: isMe ? 'rgba(255,200,87,0.04)' : 'rgba(255,255,255,0.02)',
                  borderColor: isMe ? 'rgba(255,200,87,0.12)' : 'rgba(255,255,255,0.05)',
                }}>
                  {/* Avatar + content */}
                  <div style={styles.feedTop}>
                    <div style={styles.feedAvatar}>
                      <span style={styles.feedAvatarEmoji}>{activity.avatar || '🧭'}</span>
                    </div>
                    <div style={styles.feedContent}>
                      <p style={styles.feedName}>
                        {isMe ? 'You' : activity.displayName || 'Explorer'}
                        <span style={styles.feedAction}> completed a quest</span>
                      </p>
                      <p style={styles.feedTime}>{timeAgo(activity.createdAt)}</p>
                    </div>
                  </div>

                  {/* Quest card */}
                  <div style={styles.questCard}>
                    <div style={styles.questCardTop}>
                      <span style={{ ...styles.questCardCategory, color: catColor }}>
                        {catIcon} {activity.questCategory}
                      </span>
                      <span style={styles.questCardXp}>+{activity.questXp} XP</span>
                    </div>
                    <p style={styles.questCardHint}>"{activity.questHint}"</p>
                    <div style={styles.questCardBottom}>
                      <span style={styles.questCardDifficulty}>{activity.questDifficulty}</span>
                    </div>
                  </div>

                  {/* Share button */}
                  {isMe && (
                    <button
                      onClick={() => handleShare(activity)}
                      style={styles.shareButton}
                    >
                      📤 Share
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 },
  sheet: { position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', zIndex: 2000, animation: 'slideUp 0.3s ease-out', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", WebkitOverflowScrolling: 'touch' },
  handleBar: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  handle: { width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(255,200,87,0.2)', borderTop: '3px solid #ffc857', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { fontSize: '14px', color: 'rgba(255,255,255,0.35)' },
  feedList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  feedItem: { borderRadius: '16px', border: '1px solid', padding: '14px' },
  feedTop: { display: 'flex', gap: '10px', marginBottom: '12px' },
  feedAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,200,87,0.1)', border: '1px solid rgba(255,200,87,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  feedAvatarEmoji: { fontSize: '18px' },
  feedContent: { flex: 1 },
  feedName: { fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  feedAction: { fontWeight: '400', color: 'rgba(255,255,255,0.45)' },
  feedTime: { fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' },
  questCard: { padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  questCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  questCardCategory: { fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  questCardXp: { fontSize: '13px', fontWeight: '700', color: '#ffc857' },
  questCardHint: { fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic', lineHeight: '1.4', marginBottom: '6px' },
  questCardBottom: { display: 'flex', gap: '8px' },
  questCardDifficulty: { fontSize: '11px', color: 'rgba(255,255,255,0.3)' },
  shareButton: { marginTop: '10px', width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,200,87,0.2)', background: 'rgba(255,200,87,0.06)', color: '#ffc857', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
};

export default SocialFeed;