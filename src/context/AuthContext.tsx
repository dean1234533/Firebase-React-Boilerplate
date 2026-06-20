/**
 * AuthContext.tsx — Single source of truth for the current user.
 *
 * Wrap your app with <AuthProvider> once in main.tsx.
 * Consume via the useAuth() hook — never call subscribeToAuthState in components.
 */

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, subscribeToAuthState } from '@/services/AuthService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  justSignedOut: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  justSignedOut: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [justSignedOut, setJustSignedOut] = useState(false);

  // Tracks the previous user value so we can detect the signed-in → signed-out transition.
  // Initialised to undefined so the first emission (cold start, not a sign-out) is ignored.
  const prevUserRef = useRef<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      const wasSignedIn = prevUserRef.current !== undefined && prevUserRef.current !== null;
      const isNowSignedOut = firebaseUser === null;

      setJustSignedOut(wasSignedIn && isNowSignedOut);
      prevUserRef.current = firebaseUser;
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, justSignedOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
