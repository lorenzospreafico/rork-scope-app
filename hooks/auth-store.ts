import { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { signUp as authSignUp, signIn as authSignIn, signOut as authSignOut, getCurrentUser, getSession } from '@/lib/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const [user, session] = await Promise.all([getCurrentUser(), getSession()]);
      setState({
        user,
        session,
        isLoading: false,
        isAuthenticated: !!user,
      });
    } catch (error) {
      console.log('Auth refresh error:', error);
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authSignUp(fullName, email, password);
      await refreshAuth();
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [refreshAuth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authSignIn(email, password);
      await refreshAuth();
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [refreshAuth]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await authSignOut();
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  useEffect(() => {
    refreshAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setState({
            user: session?.user || null,
            session,
            isLoading: false,
            isAuthenticated: !!session?.user,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refreshAuth]);

  const actions: AuthActions = useMemo(() => ({
    signUp,
    signIn,
    signOut,
    refreshAuth,
  }), [signUp, signIn, signOut, refreshAuth]);

  return useMemo(() => ({
    ...state,
    ...actions,
  }), [state, actions]);
});