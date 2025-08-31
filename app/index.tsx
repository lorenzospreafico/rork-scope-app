import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useTheme } from '@/hooks/theme-store';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, isLoading: themeLoading } = useTheme();
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    console.log('🏠 Index screen state:', { isLoading, isAuthenticated, themeLoading, platform: Platform.OS });
    
    // Wait for both auth and theme to load
    if (!isLoading && !themeLoading && !initComplete) {
      console.log('🚀 Initialization complete, navigating...');
      setInitComplete(true);
      
      // Add a small delay to ensure everything is ready, longer for Android
      const delay = Platform.OS === 'android' ? 300 : 100;
      setTimeout(() => {
        try {
          if (isAuthenticated) {
            console.log('✅ User authenticated, navigating to dashboard');
            router.replace('/(tabs)/dashboard' as any);
          } else {
            console.log('❌ User not authenticated, navigating to login');
            router.replace('/login' as any);
          }
        } catch (error) {
          console.log('❌ Navigation error:', error);
          // Fallback navigation
          if (isAuthenticated) {
            router.push('/(tabs)/dashboard' as any);
          } else {
            router.push('/login' as any);
          }
        }
      }, delay);
    }
  }, [isLoading, isAuthenticated, themeLoading, initComplete]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading Scope...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});