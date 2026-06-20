/**
 * useAuth.ts — Re-exports the hook from AuthContext for a clean import path.
 *
 * Usage in any component:
 *   import { useAuth } from '@/hooks/useAuth';
 *   const { user, loading } = useAuth();
 */

export { useAuth } from '@/context/AuthContext';
