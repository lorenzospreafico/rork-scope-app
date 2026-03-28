import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/theme-store';

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
}

export default function ProgressBar({
  progress,
  height = 8,
  backgroundColor,
  progressColor,
  borderRadius = 4,
}: ProgressBarProps) {
  const { theme } = useTheme();
  
  const defaultBackgroundColor = backgroundColor || theme.colors.border;
  const defaultProgressColor = progressColor || theme.colors.accent;
  
  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: defaultBackgroundColor,
          borderRadius,
        },
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${Math.max(0, Math.min(100, progress * 100))}%`,
            backgroundColor: defaultProgressColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});