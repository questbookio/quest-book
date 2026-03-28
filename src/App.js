import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';

function AppContent() {
  const { user } = useAuth();
  const [screen, setScreen] = useState('login');

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