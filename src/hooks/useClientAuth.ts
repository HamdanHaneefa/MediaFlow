// Hook for using Client Authentication Context
import { useContext } from 'react';
import { AuthContext } from '../contexts/ClientAuthContext';

export const useClientAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};

export default useClientAuth;
