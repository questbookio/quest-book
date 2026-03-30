import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

function Signup({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords don\'t match');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError('Something went wrong. Try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoSection}>
          <div style={styles.compass}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#ffc857" strokeWidth="2" />
              <circle cx="24" cy="24" r="3" fill="#ffc857" />
              <path d="M24 6L26 20H22L24 6Z" fill="#ffc857" />
              <path d="M24 42L22 28H26L24 42Z" fill="rgba(255,200,87,0.4)" />
              <path d="M6 24L20 22V26L6 24Z" fill="rgba(255,200,87,0.4)" />
              <path d="M42 24L28 26V22L42 24Z" fill="#ffc857" />
            </svg>
          </div>
          <h1 style={styles.title}>Join Quest Book</h1>
          <p style={styles.subtitle}>Your adventure begins here</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSignup} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@questbook.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>Already exploring?</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={onSwitch} style={styles.switchButton}>
          Log In
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
  card: {
    width: '100%',
    maxWidth: '380px',
    padding: '40px 28px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  compass: {
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,200,87,0.7)',
    margin: 0,
    fontStyle: 'italic',
    letterSpacing: '1px',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    WebkitAppearance: 'none',
  },
  button: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #ffc857 0%, #f0a030 100%)',
    color: '#0a0a0f',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '8px',
    letterSpacing: '0.5px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  switchButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,200,87,0.3)',
    background: 'transparent',
    color: '#ffc857',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Signup;