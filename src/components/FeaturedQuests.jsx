import React, { useState, useEffect } from 'react';
import { getFeaturedQuests } from '../services/featuredService.js';

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

const DIFFICULTY_COLORS = {
  Easy: '#34d399',
  Medium: '#fbbf24',
  Hard: '#f87171',
};

function FeaturedQuests({ onClose, onSelectQuest }) {
  const [featured, setFeatured] = useState({ daily: null, weekly: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await getFeaturedQuests();
      setFeatured(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const renderCard = (quest, type) => {
    if (!quest) return null;
    const isDaily = type === 'daily';
    const catIcon = CATEGORY_ICONS[quest.category] || '📍';
    const catColor = CATEGORY_COLORS[quest.category] || '#ffc857';
    const diffColor = DIFFICULTY_COLORS[quest.difficulty] || '#fbbf24';

    return (
      <div
        style={{
          ...styles.card,
          borderColor: isDaily ? 'rgba(255,200,87,0.25)' : 'rgba(192,132,252,0.25)',
          background: isDaily
            ? 'linear-gradient(135deg, rgba(255,200,87,0.06) 0%, rgba(240,160,48,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(192,132,252,0.06) 0%, rgba(124,58,237,0.03) 100%)',
        }}
        onClick={() => onSelectQuest(quest.id)}
      >
        {/* Badge */}
        <div style={styles.cardBadgeRow}>
          <span style={{
            ...styles.cardBadge,
            background: isDaily ? 'rgba(255,200,87,0.15)' : 'rgba(192,132,252,0.15)',
            color: isDaily ? '#ffc857' : '#c084fc',
            borderColor: isDaily ? 'rgba(255,200,87,0.3)' : 'rgba(192,132,252,0.3)',
          }}>
            {isDaily ? '☀️ Quest of the Day' : '🌟 Quest of the Week'}
          </span>
        </div>

        {/* Hint */}
        <p style={styles.cardHint}>"{quest.hint}"</p>

        {/* Meta */}
        <div style={styles.cardMeta}>
          <span style={{ ...styles.metaChip, color: catColor }}>
            {catIcon} {quest.category}
          </span>
          <span style={{ ...styles.metaChip, color: diffColor }}>
            {quest.difficulty}
          </span>
          <span style={{ ...styles.metaChip, color: '#ffc857' }}>
            {quest.xp} XP
          </span>
        </div>

        {/* Bonus XP */}
        <div style={{
          ...styles.bonusBanner,
          background: isDaily ? 'rgba(255,200,87,0.08)' : 'rgba(192,132,252,0.08)',
          borderColor: isDaily ? 'rgba(255,200,87,0.15)' : 'rgba(192,132,252,0.15)',
        }}>
          <span style={{
            ...styles.bonusText,
            color: isDaily ? '#ffc857' : '#c084fc',
          }}>
            🎁 +{quest.bonusXp} BONUS XP
          </span>
        </div>

        <p style={styles.cardCta}>Tap to view quest →</p>
      </div>
    );
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <p style={styles.headerTitle}>⭐ Featured Quests</p>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        <p style={styles.headerSub}>
          Complete featured quests for bonus XP! Refreshes automatically.
        </p>

        {loading ? (
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        ) : (
          <div style={styles.cards}>
            {renderCard(featured.daily, 'daily')}
            {renderCard(featured.weekly, 'weekly')}
            {!featured.daily && !featured.weekly && (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No featured quests available right now.</p>
              </div>
            )}
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  headerTitle: { fontSize: '20px', fontWeight: '700', color: '#ffffff' },
  headerSub: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' },
  closeButton: { background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '40px 0' },
  spinner: { width: '32px', height: '32px', border: '3px solid rgba(255,200,87,0.2)', borderTop: '3px solid #ffc857', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  cards: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { padding: '18px', borderRadius: '16px', border: '1px solid', cursor: 'pointer', transition: 'transform 0.15s', },
  cardBadgeRow: { marginBottom: '12px' },
  cardBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: '1px solid', letterSpacing: '0.3px' },
  cardHint: { fontSize: '17px', fontWeight: '600', color: '#ffffff', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '14px' },
  cardMeta: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' },
  metaChip: { fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  bonusBanner: { padding: '10px', borderRadius: '10px', border: '1px solid', textAlign: 'center', marginBottom: '10px' },
  bonusText: { fontSize: '13px', fontWeight: '800', letterSpacing: '1px' },
  cardCta: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', textAlign: 'right' },
  emptyState: { textAlign: 'center', padding: '30px' },
  emptyText: { fontSize: '14px', color: 'rgba(255,255,255,0.35)' },
};

export default FeaturedQuests;