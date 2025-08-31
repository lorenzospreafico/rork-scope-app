import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    card: string;
    accent: string;
    accentLight: string;
    accentDark: string;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#f0f0f0',
    primary: '#000000',
    card: '#ffffff',
    accent: '#FF6B35',
    accentLight: '#FF8A5B',
    accentDark: '#E55A2B',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#000000',
    surface: '#1c1c1e',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    border: '#38383a',
    primary: '#1a1a1a',
    card: '#1c1c1e',
    accent: '#FF6B35',
    accentLight: '#FF8A5B',
    accentDark: '#E55A2B',
  },
};

const THEME_STORAGE_KEY = 'app_theme_preference';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      console.log('🎨 Loading theme preference...', Platform.OS);
      
      // Add delay for Android to ensure AsyncStorage is ready
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        const parsedTheme = JSON.parse(stored);
        console.log('🎨 Loaded theme from storage:', parsedTheme);
        setIsDark(parsedTheme);
      } else {
        console.log('🎨 No theme in storage, defaulting to dark mode');
        // Default to dark mode
        setIsDark(true);
      }
    } catch (error) {
      console.log('❌ Error loading theme preference:', error);
      // Fallback to dark mode on error
      setIsDark(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = useCallback(async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newIsDark));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  }, [isDark]);

  const theme = isDark ? darkTheme : lightTheme;

  return useMemo(() => ({
    theme,
    isDark,
    toggleTheme,
    isLoading,
  }), [theme, isDark, toggleTheme, isLoading]);
});