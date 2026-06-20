/**
 * AuthContext.tsx — Single source of truth for the current user.
 *
 * Wrap your app with <AuthProvider> once in main.tsx.
 * Consume via the useAuth() hook — never call subscribeToAuthState in components.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, subscribeToAuthState } from '@/services/AuthService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
