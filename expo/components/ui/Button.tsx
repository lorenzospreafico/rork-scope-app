import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/theme-store';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.isDark ? '#1a1a1a' : '#000000' };
      case 'secondary':
        return { backgroundColor: theme.colors.surface };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.border,
        };
      default:
        return { backgroundColor: theme.isDark ? '#1a1a1a' : '#000000' };
    }
  };
  
  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: '#ffffff' };
      case 'secondary':
        return { color: theme.colors.text };
      case 'outline':
        return { color: theme.colors.text };
      default:
        return { color: '#ffffff' };
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});