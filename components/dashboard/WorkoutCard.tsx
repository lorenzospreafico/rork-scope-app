import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, CheckCircle, Circle } from 'lucide-react-native';
import { DailyWorkout } from '@/types/training';
import { useTheme } from '@/hooks/theme-store';

interface WorkoutCardProps {
  workout: DailyWorkout;
  onPress: () => void;
}

export default function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  const { theme } = useTheme();
  const intensityColors = {
    low: '#34C759',
    medium: theme.colors.accent,
    high: '#FF3B30',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        workout.completed && [styles.completedContainer, { backgroundColor: theme.colors.background }]
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{formatDate(workout.date)}</Text>
          <View style={[styles.intensityDot, { backgroundColor: intensityColors[workout.intensity] }]} />
        </View>
        <View style={styles.statusIcon}>
          {workout.completed ? (
            <CheckCircle size={24} color="#34C759" />
          ) : (
            <Circle size={24} color={theme.colors.textSecondary} />
          )}
        </View>
      </View>

      <Text style={[
        styles.title, 
        { color: theme.colors.text },
        workout.completed && [styles.completedTitle, { color: theme.colors.textSecondary }]
      ]}>
        {workout.title}
      </Text>
      <Text style={[
        styles.type, 
        { color: theme.colors.textSecondary },
        workout.completed && [styles.completedType, { color: theme.colors.textSecondary }]
      ]}>
        {workout.type}
      </Text>

      <View style={styles.footer}>
        <View style={styles.durationContainer}>
          <Clock size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>{workout.duration} min</Text>
        </View>
        <View style={styles.exerciseCountContainer}>
          <Text style={[styles.exerciseCount, { color: theme.colors.textSecondary }]}>
            {workout.exercises.length} exercises
          </Text>
          {!workout.completed && (
            <View style={[styles.exerciseCountAccent, { backgroundColor: theme.colors.accent }]} />
          )}
        </View>
      </View>

      {workout.completed && workout.completedAt && (
        <Text style={[styles.completedTime, { color: theme.colors.textSecondary }]}>
          Completed {new Date(workout.completedAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    backgroundColor: '#f8f9fa',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIcon: {
    // Icon styling handled by component
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  completedTitle: {
    color: '#666666',
  },
  type: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  completedType: {
    color: '#999999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  exerciseCountAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  completedTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    fontStyle: 'italic',
  },
});