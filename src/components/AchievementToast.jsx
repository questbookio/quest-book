import React from 'react';

function AchievementToast({ achievement, onDismiss }) {
  if (!achievement) return null;

  return (
    <div style={styles.overlay} onClick={onDismiss}>
      <div style={styles.card}>
        <p style={styles.label}>ACHIEVEMENT UNLOCKED</p>
        <span style={styles.icon}>{achievement.icon}</span>
        <p style={styles.name}>{achievement.name}</p>
        <p style={styles.desc}>{achievement.description}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.6)',
    zIndex: 6000,
    animation: 'fadeIn 0.3s ease-out',
    cursor: 'pointer',
  },
  card: {
    textAlign: 'center',
    padding: '36px 44px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)',
    border: '1px solid rgba(255,200,87,0.35)',
    boxShadow: '0 0 80px rgba(255,200,87,0.2)',
    animation: 'slideUp 0.4s ease-out',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#ffc857',
    letterSpacing: '2.5px',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '52px',
    display: 'block',
    marginBottom: '12px',
  },
  name: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '6px',
  },
  desc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.45)',
  },
};

export default AchievementToast;