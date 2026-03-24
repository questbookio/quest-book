import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import './App.css';

function App() {
  const [status, setStatus] = useState('Checking Firebase connection...');

  useEffect(() => {
    if (auth) {
      setStatus('Firebase connected!');
    }
  }, []);

  const testSignUp = async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        'test@questbook.com',
        'testpassword123'
      );
      setStatus('Test account created! User: ' + result.user.email);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setStatus('Test account already exists — Firebase Auth is working!');
      } else {
        setStatus('Error: ' + error.message);
      }
    }
  };

  const testSignOut = async () => {
    await signOut(auth);
    setStatus('Signed out. Firebase Auth works!');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Quest Book</h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>{status}</p>
      <button
        onClick={testSignUp}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          marginBottom: '10px',
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}
      >
        Test Sign Up
      </button>
      <button
        onClick={testSignOut}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}
      >
        Test Sign Out
      </button>
    </div>
  );
}

export default App;