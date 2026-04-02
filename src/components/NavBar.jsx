import React from 'react';

function NavBar({ onProfile, onLeaderboard, onFeed, onAchievements, onNotifications, unreadCount }) {
  return (
    <div style={styles.nav}>
      <button onClick={onProfile} style={styles.navItem}>
        <span style={styles.navIcon}>👤</span>
        <span style={styles.navLabel}>Profile</span>
      </button>
      <button onClick={onLeaderboard} style={styles.navItem}>
        <span style={styles.navIcon}>🏆</span>
        <span style={styles.navLabel}>Ranks</span>
      </button>
      <button onClick={onFeed} style={styles.navItem}>
        <span style={styles.navIcon}>📡</span>
        <span style={styles.navLabel}>Feed</span>
      </button>
      <button onClick={onAchievements} style={styles.navItem}>
        <span style={styles.navIcon}>🏅</span>
        <span style={styles.navLabel}>Badges</span>
      </button>
      <div style={styles.bellItem}>
        <button onClick={onNotifications} style={styles.navItem}>
          <span style={styles.navIcon}>🔔</span>
          <span style={styles.navLabel}>Alerts</span>
        </button>
        {unreadCount > 0 && (
          <div style={styles.badge}>
            <span style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: {
    position: 'absolute',
    top: '56px',
    right: '12px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: 'rgba(10,10,15,0.92)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '8px 4px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 10px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  navIcon: {
    fontSize: '18px',
  },
  navLabel: {
    fontSize: '9px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.3px',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bellItem: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '6px',
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    background: '#f87171',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 3px',
    border: '2px solid rgba(10,10,15,0.92)',
  },
  badgeText: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 1,
  },
};

export default NavBar;