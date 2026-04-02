import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ACHIEVEMENTS, getUserAchievements } from '../services/achievementService.js';

function Achievements({ onClose }) {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getUserAchievements(user.uid);
      setUnlocked(data);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const unlockedCount = Object.keys(unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <div>
            <p style={styles.headerTitle}>🏅 Achievements</p>
            <p style={styles.headerSub}>{unlockedCount} / {totalCount} unlocked</p>
          </div>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressOuter}>
          <div style={{
            ...styles.progressInner,
            width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%`,
          }} />
        </div>

        {loading ? (
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        ) : (
          <div style={styles.grid}>
            {ACHIEVEMENTS.map(a => {
              const isUnlocked = !!unlocked[a.id];
              return (
                <div
                  key={a.id}
                  style={{
                    ...styles.badge,
                    background: isUnlocked ? 'rgba(255,200,87,0.06)' : 'rgba(255,255,255,0.02)',
                    borderColor: isUnlocked ? 'rgba(255,200,87,0.2)' : 'rgba(255,255,255,0.05)',
                    opacity: isUnlocked ? 1 : 0.45,
                  }}
                >
                  <span style={{
                    ...styles.badgeIcon,
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  }}>{a.icon}</span>
                  <p style={{
                    ...styles.badgeName,
                    color: isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  }}>{a.name}</p>
                  <p style={styles.badgeDesc}>{a.description}</p>
                  {isUnlocked && <span style={styles.checkmark}>✓</span>}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff' },
  headerSub: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progressOuter: { height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px', overflow: 'hidden' },
  progressInner: { height: '100%', borderRadius: '2px', background: 'linear-gradient(90deg, #ffc857, #f0a030)', transition: 'width 0.5s ease' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(255,200,87,0.2)', borderTop: '3px solid #ffc857', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  badge: { position: 'relative', padding: '16px 12px', borderRadius: '14px', border: '1px solid', textAlign: 'center', transition: 'all 0.2s' },
  badgeIcon: { fontSize: '28px', display: 'block', marginBottom: '6px', transition: 'filter 0.2s' },
  badgeName: { fontSize: '13px', fontWeight: '700', marginBottom: '4px' },
  badgeDesc: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.4' },
  checkmark: { position: 'absolute', top: '8px', right: '8px', fontSize: '10px', color: '#34d399', background: 'rgba(52,211,153,0.15)', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
};

export default Achievements;