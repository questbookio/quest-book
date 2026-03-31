import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';

const LEVELS = [
  { name: 'Explorer', minXp: 0, maxXp: 999, icon: '🧭' },
  { name: 'Adventurer', minXp: 1000, maxXp: 4999, icon: '⚔️' },
  { name: 'Legend', minXp: 5000, maxXp: 10000, icon: '👑' },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

function getProgress(xp) {
  const level = getLevel(xp);
  const range = level.maxXp - level.minXp;
  const progress = xp - level.minXp;
  return Math.min(progress / range, 1);
}

function XpBar({ onLevelUp }) {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [prevLevel, setPrevLevel] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const newXp = data.xp || 0;
        const newLevel = getLevel(newXp);

        // Check for level up
        if (prevLevel && newLevel.name !== prevLevel.name && newXp > 0) {
          onLevelUp(newLevel);
        }

        setPrevLevel(newLevel);
        setXp(newXp);
        setQuestsCompleted(data.questsCompleted || 0);
      }
    });

    return () => unsubscribe();
  }, [user, prevLevel, onLevelUp]);

  const level = getLevel(xp);
  const progress = getProgress(xp);
  const xpInLevel = xp - level.minXp;
  const xpNeeded = level.maxXp - level.minXp;

  return (
    <div
      style={styles.container}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Compact bar */}
      <div style={styles.compactRow}>
        <span style={styles.levelIcon}>{level.icon}</span>
        <div style={styles.barOuter}>
          <div style={{
            ...styles.barInner,
            width: `${Math.max(progress * 100, 2)}%`,
          }} />
        </div>
        <span style={styles.xpText}>{xp} XP</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={styles.expandedSection}>
          <div style={styles.levelRow}>
            <span style={styles.levelName}>{level.icon} {level.name}</span>
            <span style={styles.levelProgress}>{xp} / {level.maxXp} XP</span>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <span style={styles.statValue}>{questsCompleted}</span>
              <span style={styles.statLabel}>Quests Done</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statValue}>{xp}</span>
              <span style={styles.statLabel}>Total XP</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statValue}>{level.name}</span>
              <span style={styles.statLabel}>Rank</span>
            </div>
          </div>
          {level.maxXp - xp > 0 && (
            <p style={styles.nextLevel}>
              {level.maxXp - xp} XP until next rank
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '24px',
    left: '16px',
    right: '80px',
    zIndex: 1000,
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '12px 14px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'all 0.2s ease',
  },
  compactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  levelIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  barOuter: {
    flex: 1,
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
  xpText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffc857',
    flexShrink: 0,
    minWidth: '50px',
    textAlign: 'right',
  },
  expandedSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  levelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  levelName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
  },
  levelProgress: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '12px',
    padding: '12px 0',
    marginBottom: '10px',
  },
  stat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statDivider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255,255,255,0.08)',
  },
  nextLevel: {
    fontSize: '11px',
    color: 'rgba(255,200,87,0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default XpBar;