import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getAllQuestStatuses } from '../services/questService.js';

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const miles = meters / 1609.34;
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

function getDirection(userLat, userLng, questLat, questLng) {
  const dLat = questLat - userLat;
  const dLng = questLng - userLng;
  const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
}

const DIRECTION_ARROWS = {
  'N': '↑', 'NE': '↗', 'E': '→', 'SE': '↘',
  'S': '↓', 'SW': '↙', 'W': '←', 'NW': '↖',
};

const DIFFICULTY_COLORS = {
  Easy: '#34d399',
  Medium: '#fbbf24',
  Hard: '#f87171',
};

function AdventureMode({ onClose, userLocation }) {
  const { user } = useAuth();
  const [state, setState] = useState('intro');
  const [quest, setQuest] = useState(null);
  const [distance, setDistance] = useState(null);
  const [direction, setDirection] = useState(null);
  const [error, setError] = useState('');

  const findRandomQuest = async () => {
    setState('searching');
    setError('');

    try {
      const snapshot = await getDocs(collection(db, 'quests'));
      const allQuests = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(q => !q.status || q.status === 'active');

      const statuses = await getAllQuestStatuses(user.uid);
      const available = allQuests.filter(q => !statuses[q.id]);

      if (available.length === 0) {
        setError("You've done every quest! Create more or wait for new ones.");
        setState('intro');
        return;
      }

      const picked = available[Math.floor(Math.random() * available.length)];
      setQuest(picked);

      if (userLocation) {
        const dist = getDistanceMeters(userLocation.lat, userLocation.lng, picked.lat, picked.lng);
        setDistance(dist);
        setDirection(getDirection(userLocation.lat, userLocation.lng, picked.lat, picked.lng));
      }

      setState('active');
    } catch (err) {
      console.error('Error finding quest:', err);
      setError('Something went wrong. Try again.');
      setState('intro');
    }
  };

  // Live distance tracking
  useEffect(() => {
    if (state !== 'active' || !quest) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const dist = getDistanceMeters(pos.coords.latitude, pos.coords.longitude, quest.lat, quest.lng);
        setDistance(dist);
        setDirection(getDirection(pos.coords.latitude, pos.coords.longitude, quest.lat, quest.lng));
        if (dist <= (quest.radius || 200)) {
          setState('arrived');
        }
      },
      (err) => console.error('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [state, quest]);

  const handleReroll = () => {
    setQuest(null);
    setDistance(null);
    setDirection(null);
    findRandomQuest();
  };

  return (
    <>
      <div style={styles.backdrop} onClick={state === 'intro' ? onClose : undefined} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <p style={styles.headerTitle}>⚡ Adventure Mode</p>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {/* Intro */}
        {state === 'intro' && (
          <div style={styles.introSection}>
            <div style={styles.introIcon}>🎲</div>
            <p style={styles.introTitle}>Ready for anything?</p>
            <p style={styles.introText}>
              We'll pick a random quest for you. You'll only see the distance and direction — everything else is a mystery until you arrive.
            </p>
            {error && <p style={styles.errorText}>{error}</p>}
            <button onClick={findRandomQuest} style={styles.goButton}>Let's Go</button>
          </div>
        )}

        {/* Searching */}
        {state === 'searching' && (
          <div style={styles.searchingSection}>
            <div style={styles.spinner} />
            <p style={styles.searchingText}>Finding your adventure...</p>
          </div>
        )}

        {/* Active - navigating */}
        {state === 'active' && quest && (
          <div style={styles.activeSection}>
            <div style={styles.mysteryCard}>
              <div style={styles.mysteryIcon}>🔒</div>
              <p style={styles.mysteryTitle}>Mystery Quest</p>
              <p style={styles.mysterySubtext}>Everything will be revealed when you arrive</p>
            </div>

            <div style={styles.navCard}>
              <div style={styles.directionCircle}>
                <span style={styles.directionArrow}>
                  {direction ? DIRECTION_ARROWS[direction] : '•'}
                </span>
              </div>
              <div style={styles.navInfo}>
                <p style={styles.navDistance}>
                  {distance !== null ? formatDistance(distance) : 'Calculating...'}
                </p>
                <p style={styles.navDirection}>
                  Head {direction || '...'} to reach your quest
                </p>
              </div>
            </div>

            <div style={styles.clueRow}>
              <div style={styles.clueItem}>
                <span style={styles.clueLabel}>Difficulty</span>
                <span style={{ ...styles.clueValue, color: DIFFICULTY_COLORS[quest.difficulty] || '#fbbf24' }}>{quest.difficulty}</span>
              </div>
              <div style={styles.clueDivider} />
              <div style={styles.clueItem}>
                <span style={styles.clueLabel}>Reward</span>
                <span style={{ ...styles.clueValue, color: '#ffc857' }}>{quest.xp} XP</span>
              </div>
              <div style={styles.clueDivider} />
              <div style={styles.clueItem}>
                <span style={styles.clueLabel}>Cost</span>
                <span style={styles.clueValue}>{quest.cost || 'Free'}</span>
              </div>
            </div>

            <button onClick={handleReroll} style={styles.rerollButton}>🎲 Different quest</button>
          </div>
        )}

        {/* Arrived */}
        {state === 'arrived' && quest && (
          <div style={styles.arrivedSection}>
            <div style={styles.arrivedIcon}>🎉</div>
            <p style={styles.arrivedTitle}>You've Arrived!</p>

            <div style={styles.revealCard}>
              <p style={styles.revealLabel}>🎯 YOUR QUEST</p>
              <p style={styles.revealHint}>"{quest.hint}"</p>
              <p style={styles.revealObjective}>{quest.objective}</p>
              {quest.bonusObjectives && quest.bonusObjectives.length > 0 && (
                <div style={styles.revealBonus}>
                  <p style={styles.revealBonusLabel}>⭐ BONUS</p>
                  {quest.bonusObjectives.map((b, i) => (
                    <p key={i} style={styles.revealBonusItem}>• {b}</p>
                  ))}
                </div>
              )}
              {quest.requiredItems && quest.requiredItems.length > 0 && (
                <div style={styles.revealItems}>
                  <p style={styles.revealItemsLabel}>🎒 YOU'LL NEED</p>
                  <p style={styles.revealItemsText}>{quest.requiredItems.join(', ')}</p>
                </div>
              )}
            </div>

            <p style={styles.arrivedSubtext}>Find this quest on the map to accept and complete it for XP!</p>
            <button onClick={onClose} style={styles.doneButton}>Back to Map</button>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1999 },
  sheet: { position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)', borderRadius: '20px 20px 0 0', padding: '12px 20px 32px', zIndex: 2000, animation: 'slideUp 0.3s ease-out', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", WebkitOverflowScrolling: 'touch' },
  handleBar: { display: 'flex', justifyContent: 'center', marginBottom: '12px' },
  handle: { width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  introSection: { textAlign: 'center', padding: '20px 0' },
  introIcon: { fontSize: '56px', marginBottom: '16px' },
  introTitle: { fontSize: '22px', fontWeight: '700', color: '#ffffff', marginBottom: '10px' },
  introText: { fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', marginBottom: '24px', padding: '0 8px' },
  errorText: { fontSize: '13px', color: '#f87171', marginBottom: '16px' },
  goButton: { width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)', color: '#0a0a0f', fontSize: '17px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' },
  searchingSection: { textAlign: 'center', padding: '40px 0' },
  spinner: { width: '40px', height: '40px', border: '3px solid rgba(255,200,87,0.2)', borderTop: '3px solid #ffc857', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' },
  searchingText: { fontSize: '15px', color: 'rgba(255,255,255,0.5)' },
  activeSection: { padding: '0' },
  mysteryCard: { textAlign: 'center', padding: '24px 16px', borderRadius: '16px', background: 'rgba(255,200,87,0.04)', border: '1px dashed rgba(255,200,87,0.2)', marginBottom: '16px' },
  mysteryIcon: { fontSize: '36px', marginBottom: '8px' },
  mysteryTitle: { fontSize: '18px', fontWeight: '700', color: '#ffc857', marginBottom: '4px' },
  mysterySubtext: { fontSize: '13px', color: 'rgba(255,255,255,0.35)' },
  navCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' },
  directionCircle: { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,200,87,0.1)', border: '2px solid rgba(255,200,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  directionArrow: { fontSize: '28px', color: '#ffc857' },
  navInfo: { flex: 1 },
  navDistance: { fontSize: '24px', fontWeight: '700', color: '#ffffff', marginBottom: '2px' },
  navDirection: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  clueRow: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '14px 0', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' },
  clueItem: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  clueLabel: { fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' },
  clueValue: { fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  clueDivider: { width: '1px', height: '28px', background: 'rgba(255,255,255,0.06)' },
  rerollButton: { width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
  arrivedSection: { textAlign: 'center', padding: '10px 0' },
  arrivedIcon: { fontSize: '48px', marginBottom: '12px' },
  arrivedTitle: { fontSize: '22px', fontWeight: '700', color: '#34d399', marginBottom: '16px' },
  revealCard: { textAlign: 'left', padding: '20px 16px', borderRadius: '16px', background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)', marginBottom: '16px' },
  revealLabel: { fontSize: '11px', fontWeight: '700', color: '#34d399', letterSpacing: '1.5px', marginBottom: '10px' },
  revealHint: { fontSize: '16px', fontWeight: '600', color: '#ffffff', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '12px' },
  revealObjective: { fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' },
  revealBonus: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  revealBonusLabel: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,200,87,0.6)', letterSpacing: '1.5px', marginBottom: '6px' },
  revealBonusItem: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8' },
  revealItems: { marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  revealItemsLabel: { fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '4px' },
  revealItemsText: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  arrivedSubtext: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '16px' },
  doneButton: { width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#ffffff', fontSize: '17px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' },
};

export default AdventureMode;