import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.compass}>
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#ffc857" strokeWidth="2" />
            <circle cx="24" cy="24" r="3" fill="#ffc857" />
            <path d="M24 6L26 20H22L24 6Z" fill="#ffc857" />
            <path d="M24 42L22 28H26L24 42Z" fill="rgba(255,200,87,0.4)" />
            <path d="M6 24L20 22V26L6 24Z" fill="rgba(255,200,87,0.4)" />
            <path d="M42 24L28 26V22L42 24Z" fill="#ffc857" />
          </svg>
        </div>

        <h1 style={styles.title}>Quest Book</h1>
        <p style={styles.welcome}>Welcome, explorer</p>
        <p style={styles.email}>{user?.email}</p>

        <div style={styles.placeholder}>
          <p style={styles.placeholderText}>
            The map is coming in Session 4
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Log Out
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #0a0a0f 0%, #12121f 50%, #0d1117 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  content: {
    textAlign: 'center',
    maxWidth: '380px',
    width: '100%',
  },
  compass: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  welcome: {
    fontSize: '16px',
    color: 'rgba(255,200,87,0.7)',
    margin: '0 0 4px 0',
    fontStyle: 'italic',
  },
  email: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.35)',
    margin: '0 0 40px 0',
  },
  placeholder: {
    padding: '40px 20px',
    borderRadius: '16px',
    border: '1px dashed rgba(255,200,87,0.2)',
    background: 'rgba(255,255,255,0.02)',
    marginBottom: '32px',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
    margin: 0,
  },
  logoutButton: {
    padding: '14px 32px',
    borderRadius: '12px',
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
};

export default Home;