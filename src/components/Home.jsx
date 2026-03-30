import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext.jsx';
import QuestMap from './QuestMap.jsx';

function Home() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={styles.container}>
      <QuestMap />

      {/* Floating logout button */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  logoutButton: {
    position: 'absolute',
    bottom: '24px',
    right: '16px',
    zIndex: 1000,
    padding: '10px 20px',
    borderRadius: '20px',
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(10px)',
    color: '#f87171',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

export default Home;