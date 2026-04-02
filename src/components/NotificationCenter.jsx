import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getNotifications, markAllRead } from '../services/notificationService.js';

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

function NotificationCenter({ onClose, onUnreadChange }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const notifs = await getNotifications(user.uid);
      setNotifications(notifs);
      setLoading(false);

      // Mark all as read
      await markAllRead(user.uid);
      if (onUnreadChange) onUnreadChange(0);
    };
    fetch();
  }, [user]);

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />

      <div style={styles.sheet}>
        <div style={styles.handleBar}><div style={styles.handle} /></div>

        <div style={styles.header}>
          <p style={styles.headerTitle}>🔔 Notifications</p>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>

        {loading ? (
          <div style={styles.loadingState}><div style={styles.spinner} /></div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔕</p>
            <p style={styles.emptyText}>No notifications yet. Go complete some quests!</p>
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                style={{
                  ...styles.notifItem,
                  background: notif.read
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,200,87,0.04)',
                  borderColor: notif.read
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,200,87,0.12)',
                }}
              >
                <span style={styles.notifIcon}>{notif.data?.icon || '📌'}</span>
                <div style={styles.notifContent}>
                  <p style={styles.notifTitle}>{notif.data?.title || 'Notification'}</p>
                  <p style={styles.notifMessage}>{notif.data?.message || ''}</p>
                  <p style={styles.notifTime}>{timeAgo(notif.createdAt)}</p>
                </div>
                {!notif.read && <div style={styles.unreadDot} />}
              </div>
            ))}
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
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  notifItem: { display: 'flex', gap: '12px', padding: '14px', borderRadius: '14px', border: '1px solid', alignItems: 'flex-start', position: 'relative' },
  notifIcon: { fontSize: '24px', flexShrink: 0, marginTop: '2px' },
  notifContent: { flex: 1, minWidth: 0 },
  notifTitle: { fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' },
  notifMessage: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4', marginBottom: '4px' },
  notifTime: { fontSize: '11px', color: 'rgba(255,255,255,0.2)' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ffc857', flexShrink: 0, marginTop: '6px' },
};

export default NotificationCenter;