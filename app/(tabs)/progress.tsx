import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTraining } from '@/hooks/training-store';
import { useTheme } from '@/hooks/theme-store';
import ProgressBar from '@/components/ui/ProgressBar';
import { TrendingUp, Trophy, Zap, ChevronRight } from 'lucide-react-native';

export default function ProgressScreen() {
  const { trainingPlan } = useTraining();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'exercises'>('overview');

  if (!trainingPlan) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.emptyContent, { paddingTop: insets.top + 40 }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No training plan available</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const totalWorkouts = trainingPlan.dailyWorkouts.length;
  const completedWorkouts = trainingPlan.dailyWorkouts.filter(w => w.completed).length;
  const totalMinutes = trainingPlan.dailyWorkouts
    .filter(w => w.completed)
    .reduce((sum, w) => sum + w.duration, 0);

  const exerciseProgress = trainingPlan.exerciseProgress || [];

  const weeklyStats = [];
  const startDate = new Date(trainingPlan.startDate);
  const currentDate = new Date();
  
  for (let week = 0; week < trainingPlan.timePreference.planDuration; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (week * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekWorkouts = trainingPlan.dailyWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const weekCompleted = weekWorkouts.filter(w => w.completed).length;
    const weekTotal = weekWorkouts.length;
    const weekMinutes = weekWorkouts
      .filter(w => w.completed)
      .reduce((sum, w) => sum + w.duration, 0);

    weeklyStats.push({
      week: week + 1,
      completed: weekCompleted,
      total: weekTotal,
      minutes: weekMinutes,
      progress: weekTotal > 0 ? weekCompleted / weekTotal : 0,
      isCurrentWeek: currentDate >= weekStart && currentDate <= weekEnd,
    });
  }

  const getExerciseStats = (progress: any) => {
    const totalSessions = progress.sessions.length;
    const lastSession = progress.sessions[progress.sessions.length - 1];
    const firstSession = progress.sessions[0];
    
    let improvement = null;
    if (lastSession && firstSession && progress.sessions.length > 1) {
      const lastWeight = lastSession.sets[0]?.weight || 0;
      const firstWeight = firstSession.sets[0]?.weight || 0;
      const lastReps = lastSession.sets[0]?.reps || 0;
      const firstReps = firstSession.sets[0]?.reps || 0;
      
      if (lastWeight > firstWeight) {
        improvement = `+${lastWeight - firstWeight}kg`;
      } else if (lastReps > firstReps) {
        improvement = `+${lastReps - firstReps} reps`;
      }
    }
    
    return { totalSessions, improvement };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Progress</Text>
        </View>

      <View style={[styles.tabContainer, { backgroundColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, { color: theme.colors.textSecondary }, selectedTab === 'overview' && [styles.activeTabText, { color: theme.colors.text }]]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'exercises' && [styles.activeTab, { backgroundColor: theme.colors.card }]]}
          onPress={() => setSelectedTab('exercises')}
        >
          <Text style={[styles.tabText, { color: theme.colors.textSecondary }, selectedTab === 'exercises' && [styles.activeTabText, { color: theme.colors.text }]]}>
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' ? (
          <>
            <View style={[styles.overallCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Overall Progress</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>{completedWorkouts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>{totalWorkouts}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>{Math.floor(totalMinutes / 60)}h</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Time</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, { color: theme.colors.text }]}>{exerciseProgress.filter(ep => ep.personalBest).length}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>PRs</Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <ProgressBar 
                  progress={totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0} 
                  height={12}
                />
              </View>
            </View>

            <View style={styles.weeklySection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly Breakdown</Text>
              {weeklyStats.map(week => (
                <View 
                  key={week.week} 
                  style={[
                    styles.weekCard, 
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                    week.isCurrentWeek && [styles.currentWeekCard, { borderColor: theme.colors.accent, backgroundColor: theme.isDark ? '#1a0f0a' : '#fff8f5' }]
                  ]}
                >
                  <View style={styles.weekHeader}>
                    <Text style={[styles.weekTitle, { color: theme.colors.text }]}>
                      Week {week.week}
                      {week.isCurrentWeek && <Text style={[styles.currentLabel, { color: theme.colors.accent }]}> (Current)</Text>}
                    </Text>
                    <Text style={[styles.weekStats, { color: theme.colors.textSecondary }]}>
                      {week.completed}/{week.total} • {week.minutes}min
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={week.progress} 
                    height={8}
                    progressColor={week.isCurrentWeek ? theme.colors.accent : theme.colors.text}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.exercisesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exercise Progress</Text>
            {exerciseProgress.length === 0 ? (
              <View style={styles.emptyState}>
                <Zap size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.colors.textSecondary }]}>No Exercise Data Yet</Text>
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  Complete some workouts to see your exercise progress and personal bests.
                </Text>
              </View>
            ) : (
              exerciseProgress.map((progress) => {
                const stats = getExerciseStats(progress);
                return (
                  <View key={progress.exerciseId} style={[styles.exerciseProgressCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.exerciseProgressHeader}>
                      <View style={styles.exerciseProgressInfo}>
                        <Text style={[styles.exerciseProgressName, { color: theme.colors.text }]}>{progress.exerciseName}</Text>
                        <Text style={[styles.exerciseProgressStats, { color: theme.colors.textSecondary }]}>
                          {stats.totalSessions} sessions completed
                        </Text>
                      </View>
                      <ChevronRight size={20} color={theme.colors.textSecondary} />
                    </View>
                    
                    {progress.personalBest && (
                      <View style={styles.personalBestSection}>
                        <View style={styles.personalBestHeader}>
                          <Trophy size={16} color="#FFD700" />
                          <Text style={styles.personalBestLabel}>Personal Best</Text>
                        </View>
                        <View style={styles.personalBestStats}>
                          {progress.personalBest.weight && (
                            <Text style={styles.personalBestValue}>{progress.personalBest.weight}kg</Text>
                          )}
                          {progress.personalBest.reps && (
                            <Text style={styles.personalBestValue}>{progress.personalBest.reps} reps</Text>
                          )}
                          {progress.personalBest.duration && (
                            <Text style={styles.personalBestValue}>{progress.personalBest.duration}s</Text>
                          )}
                        </View>
                      </View>
                    )}
                    
                    {stats.improvement && (
                      <View style={styles.improvementBadge}>
                        <TrendingUp size={12} color="#34C759" />
                        <Text style={styles.improvementText}>{stats.improvement}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  overallCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  progressBar: {
    marginTop: 8,
  },
  weeklySection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  currentWeekCard: {
    borderColor: '#FF6B35',
    backgroundColor: '#fff8f5',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  currentLabel: {
    color: '#FF6B35',
  },
  weekStats: {
    fontSize: 14,
  },
  exercisesSection: {
    padding: 16,
  },
  exerciseProgressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  exerciseProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseProgressInfo: {
    flex: 1,
  },
  exerciseProgressName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseProgressStats: {
    fontSize: 14,
  },
  personalBestSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  personalBestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personalBestLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 6,
  },
  personalBestStats: {
    flexDirection: 'row',
    gap: 16,
  },
  personalBestValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E65100',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 100,
  },
});