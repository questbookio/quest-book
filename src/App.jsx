import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import Home from './components/Home.jsx';
import { seedQuests } from './seedQuests.jsx';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('login');

  useEffect(() => {
    seedQuests();
  }, []);

  if (user) {
    return <Home />;
  }

  if (screen === 'signup') {
    return <Signup onSwitch={() => setScreen('login')} />;
  }

  if (screen === 'forgot') {
    return <ForgotPassword onBack={() => setScreen('login')} />;
  }

  return (
    <Login
      onSwitch={() => setScreen('signup')}
      onForgot={() => setScreen('forgot')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;