import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-store';
import { useTheme } from '@/hooks/theme-store';
import Button from '@/components/ui/Button';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, isLoading: themeLoading } = useTheme();
  const [initComplete, setInitComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
            router.replace('/(tabs)/dashboard');
          } else {
            console.log('❌ User not authenticated, navigating to login');
            router.replace('/login');
          }
        } catch (error) {
          console.log('❌ Navigation error:', error);
          setHasError(true);
          // Fallback navigation after error
          setTimeout(() => {
            try {
              if (isAuthenticated) {
                router.push('/(tabs)/dashboard');
              } else {
                router.push('/login');
              }
            } catch (fallbackError) {
              console.log('❌ Fallback navigation also failed:', fallbackError);
            }
          }, 1000);
        }
      }, delay);
    }
  }, [isLoading, isAuthenticated, themeLoading, initComplete]);

  const handleRetry = () => {
    setHasError(false);
    setInitComplete(false);
    setRetryCount(prev => prev + 1);
  };

  const handleForceNavigation = () => {
    try {
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Unable to navigate. Please restart the app.');
    }
  };

  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Connection Issue
        </Text>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          {Platform.OS === 'android' 
            ? 'Having trouble connecting. This might be due to network issues or app updates.'
            : 'Unable to load the app properly.'}
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Retry"
            onPress={handleRetry}
            style={styles.retryButton}
          />
          <Button
            title="Continue to Login"
            onPress={handleForceNavigation}
            variant="outline"
            style={styles.continueButton}
          />
        </View>
        <Text style={[styles.debugText, { color: theme.colors.textSecondary }]}>
          Platform: {Platform.OS} • Retry: {retryCount}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading Scope...
      </Text>
      {Platform.OS === 'android' && (
        <Text style={[styles.androidNote, { color: theme.colors.textSecondary }]}>
          Android may take a moment longer to load
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  androidNote: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
  },
  debugText: {
    marginTop: 24,
    fontSize: 12,
    textAlign: 'center',
  },
});