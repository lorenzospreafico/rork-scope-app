import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrainingPlan } from '@/types/training';
import { useTheme } from '@/hooks/theme-store';
import ProgressBar from '@/components/ui/ProgressBar';

interface ProgressOverviewProps {
  trainingPlan: TrainingPlan;
}

export default function ProgressOverview({ trainingPlan }: ProgressOverviewProps) {
  const { theme } = useTheme();
  const totalWorkouts = trainingPlan.dailyWorkouts.length;
  const completedWorkouts = trainingPlan.dailyWorkouts.filter(w => w.completed).length;
  const progress = totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0;

  const currentWeekWorkouts = trainingPlan.dailyWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
  });

  const thisWeekCompleted = currentWeekWorkouts.filter(w => w.completed).length;
  const thisWeekTotal = currentWeekWorkouts.length;

  const totalMinutes = trainingPlan.dailyWorkouts
    .filter(w => w.completed)
    .reduce((sum, w) => sum + w.duration, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{completedWorkouts}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Workouts Done</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total Time</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.statNumber, { color: theme.colors.text }]}>{thisWeekCompleted}/{thisWeekTotal}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>This Week</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Overall Progress</Text>
          <Text style={[styles.progressPercentage, { color: theme.colors.text }]}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
        <ProgressBar progress={progress} height={12} />
        <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>
          {completedWorkouts} of {totalWorkouts} workouts completed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  progressSection: {
    // Progress section styling
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
});