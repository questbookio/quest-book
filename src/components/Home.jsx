import React, { useState, useCallback, useRef } from 'react';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  const userLocationRef = useRef(null);

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const handleLogout = async () => { await signOut(auth); };

  const handleLevelUp = useCallback((newLevel) => {
    setLevelUpData(newLevel);
    setTimeout(() => setLevelUpData(null), 4000);
  }, []);

  const handleQuestCreated = () => {
    setShowCreate(false);
    setToast('Quest submitted! It will appear on the map after review.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleAdminClose = () => { setShowAdmin(false); setRefreshKey(k => k + 1); };

  const handleUserLocation = useCallback((latlng) => { userLocationRef.current = latlng; }, []);

  return (
    <div style={styles.container}>
      <QuestMap key={refreshKey} onUserLocation={handleUserLocation} />
      <XpBar onLevelUp={handleLevelUp} />

      <div style={styles.topButtons}>
        <button onClick={() => setShowProfile(true)} style={styles.topButton}>👤</button>
        <button onClick={() => setShowLeaderboard(true)} style={styles.topButton}>🏆</button>
        <button onClick={() => setShowFeed(true)} style={styles.topButton}>📡</button>
      </div>

      {isAdmin && <button onClick={() => setShowAdmin(true)} style={styles.adminButton}>🛡️</button>}
      <button onClick={() => setShowAdventure(true)} style={styles.adventureButton}>⚡</button>
      <button onClick={() => setShowCreate(true)} style={styles.createButton}>＋</button>
      <button onClick={handleLogout} style={styles.logoutButton}>Log Out</button>

      {showProfile && <Profile onClose={() => setShowProfile(false)} />}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showFeed && <SocialFeed onClose={() => setShowFeed(false)} />}
      {showAdventure && <AdventureMode onClose={() => setShowAdventure(false)} userLocation={userLocationRef.current} />}
      {showCreate && <CreateQuest onClose={() => setShowCreate(false)} onCreated={handleQuestCreated} />}
      {showAdmin && <AdminPanel onClose={handleAdminClose} />}

      {toast && <div style={styles.toast}><span style={styles.toastText}>{toast}</span></div>}

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
  container: { position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' },
  topButtons: { position: 'absolute', top: '56px', right: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' },
  topButton: { width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adminButton: { position: 'absolute', bottom: '200px', right: '16px', zIndex: 1000, width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adventureButton: { position: 'absolute', bottom: '150px', right: '16px', zIndex: 1000, width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(139,92,246,0.3)' },
  createButton: { position: 'absolute', bottom: '90px', right: '16px', zIndex: 1000, width: '52px', height: '52px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)', color: '#0a0a0f', fontSize: '26px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,200,87,0.3)', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
  logoutButton: { position: 'absolute', bottom: '28px', right: '16px', zIndex: 1000, padding: '10px 16px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', color: '#f87171', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
  toast: { position: 'absolute', top: '70px', left: '16px', right: '76px', zIndex: 3000, padding: '14px 20px', borderRadius: '14px', background: 'rgba(255,200,87,0.12)', border: '1px solid rgba(255,200,87,0.25)', backdropFilter: 'blur(10px)', textAlign: 'center', animation: 'slideUp 0.3s ease-out' },
  toastText: { color: '#ffc857', fontSize: '14px', fontWeight: '600', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
  levelUpOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 5000, animation: 'fadeIn 0.3s ease-out' },
  levelUpCard: { textAlign: 'center', padding: '40px 48px', borderRadius: '24px', background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)', border: '1px solid rgba(255,200,87,0.3)', boxShadow: '0 0 60px rgba(255,200,87,0.15)', animation: 'slideUp 0.4s ease-out', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" },
  levelUpIcon: { fontSize: '56px', marginBottom: '16px' },
  levelUpTitle: { fontSize: '12px', fontWeight: '800', color: '#ffc857', letterSpacing: '3px', marginBottom: '8px' },
  levelUpName: { fontSize: '28px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' },
  levelUpSubtext: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
};

export default Home;