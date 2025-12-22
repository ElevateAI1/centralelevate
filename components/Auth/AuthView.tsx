import React from 'react';
import { Login } from './Login';

export const AuthView: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  return (
    <Login onLoginSuccess={onAuthSuccess} />
  );
};

