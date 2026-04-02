import React, { useState, useCallback, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext.jsx';
import QuestMap from './QuestMap.jsx';
import XpBar from './XpBar.jsx';
import CreateQuest from './CreateQuest.jsx';
import AdminPanel from './AdminPanel.jsx';
import Profile from './Profile.jsx';
import Leaderboard from './Leaderboard.jsx';
import SocialFeed from './SocialFeed.jsx';
import AdventureMode from './AdventureMode.jsx';
import Achievements from './Achievements.jsx';
import AchievementToast from './AchievementToast.jsx';
import FeaturedQuests from './FeaturedQuests.jsx';
import NotificationCenter from './NotificationCenter.jsx';
import NavBar from './NavBar.jsx';
import { getUnreadCount } from '../services/notificationService.js';

const ADMIN_UIDS = [
  'RkUgAmQMLxOB9OM1z4cd9GJqqM53',
];

function Home() {
  const { user } = useAuth();
  const [levelUpData, setLevelUpData] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFeed, setShowFeed] = useState(false);
  const [showAdventure, setShowAdventure] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [focusQuestId, setFocusQuestId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const count = await getUnreadCount(user.uid);
      setUnreadCount(count);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleLevelUp = useCallback((newLevel) => {
    setLevelUpData(newLevel);
    setTimeout(() => setLevelUpData(null), 4000);
  }, []);

  const handleQuestCreated = () => {
    setShowCreate(false);
    setToast('Quest submitted! It will appear on the map after review.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleAdminClose = () => {
    setShowAdmin(false);
    setRefreshKey(k => k + 1);
  };

  const handleAdventureClose = () => {
    setShowAdventure(false);
    setRefreshKey(k => k + 1);
  };

  const handleAchievement = useCallback((achievement) => {
    setAchievementToast(achievement);
    setUnreadCount(c => c + 1);
  }, []);

  const handleSelectFeaturedQuest = (questId) => {
    setShowFeatured(false);
    setFocusQuestId(questId);
  };

  return (
    <div style={styles.container}>
      <QuestMap key={refreshKey} onAchievement={handleAchievement} focusQuestId={focusQuestId} onFocusHandled={() => setFocusQuestId(null)} />

      {/* XP Bar */}
      <XpBar onLevelUp={handleLevelUp} />

      {/* Navigation bar */}
      <NavBar
        onProfile={() => setShowProfile(true)}
        onLeaderboard={() => setShowLeaderboard(true)}
        onFeed={() => setShowFeed(true)}
        onAchievements={() => setShowAchievements(true)}
        onNotifications={() => setShowNotifications(true)}
        unreadCount={unreadCount}
      />

      {/* Left side action buttons */}
      <div style={styles.leftButtons}>
        <button onClick={() => setShowFeatured(true)} style={styles.leftButton} title="Featured Quests">⭐</button>
        <button onClick={() => setShowAdventure(true)} style={styles.adventureButton} title="Adventure Mode">⚡</button>
      </div>

      {/* Right side action buttons */}
      <div style={styles.rightButtons}>
        {isAdmin && (
          <button onClick={() => setShowAdmin(true)} style={styles.rightButton} title="Moderation">🛡️</button>
        )}
        <button onClick={() => setShowCreate(true)} style={styles.createButton} title="Create Quest">＋</button>
        <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>
      </div>

      {/* Sheets */}
      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showFeed && <SocialFeed onClose={() => setShowFeed(false)} />}
      {showAdventure && <AdventureMode onClose={handleAdventureClose} userLocation={userLocation} />}
      {showAchievements && <Achievements onClose={() => setShowAchievements(false)} />}
      {showFeatured && <FeaturedQuests onClose={() => setShowFeatured(false)} onSelectQuest={handleSelectFeaturedQuest} />}
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} onUnreadChange={setUnreadCount} />}
      {showCreate && <CreateQuest onClose={() => setShowCreate(false)} onCreated={handleQuestCreated} />}
      {showAdmin && <AdminPanel onClose={handleAdminClose} />}

      {/* Achievement toast */}
      {achievementToast && (
        <AchievementToast achievement={achievementToast} onDismiss={() => setAchievementToast(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>
          <span style={styles.toastText}>{toast}</span>
        </div>
      )}

      {/* Level up notification */}
      {levelUpData && (
        <div style={styles.levelUpOverlay}>
          <div style={styles.levelUpCard}>
            <div style={styles.levelUpIcon}>{levelUpData.icon}</div>
            <p style={styles.levelUpTitle}>LEVEL UP!</p>
            <p style={styles.levelUpName}>{levelUpData.name}</p>
            <p style={styles.levelUpSubtext}>Keep exploring to reach the next rank</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
  },
  leftButtons: {
    position: 'absolute',
    bottom: '90px',
    left: '16px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  leftButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid rgba(255,200,87,0.3)',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(10px)',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adventureButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 100%)',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(192,132,252,0.3)',
  },
  rightButtons: {
    position: 'absolute',
    bottom: '24px',
    right: '16px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
  },
  rightButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(10px)',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)',
    color: '#0a0a0f',
    fontSize: '26px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(255,200,87,0.3)',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  logoutButton: {
    padding: '8px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(10,10,15,0.9)',
    backdropFilter: 'blur(10px)',
    color: '#f87171',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  toast: {
    position: 'absolute',
    top: '70px',
    left: '16px',
    right: '76px',
    zIndex: 3000,
    padding: '14px 20px',
    borderRadius: '14px',
    background: 'rgba(255,200,87,0.12)',
    border: '1px solid rgba(255,200,87,0.25)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
    animation: 'slideUp 0.3s ease-out',
  },
  toastText: {
    color: '#ffc857',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  levelUpOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.7)',
    zIndex: 5000,
    animation: 'fadeIn 0.3s ease-out',
  },
  levelUpCard: {
    textAlign: 'center',
    padding: '40px 48px',
    borderRadius: '24px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)',
    border: '1px solid rgba(255,200,87,0.3)',
    boxShadow: '0 0 60px rgba(255,200,87,0.15)',
    animation: 'slideUp 0.4s ease-out',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  levelUpIcon: { fontSize: '56px', marginBottom: '16px' },
  levelUpTitle: { fontSize: '12px', fontWeight: '800', color: '#ffc857', letterSpacing: '3px', marginBottom: '8px' },
  levelUpName: { fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' },
  levelUpSubtext: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
};

export default Home;