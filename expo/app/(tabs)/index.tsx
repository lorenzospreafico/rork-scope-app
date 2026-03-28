import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { List, Calendar } from 'lucide-react-native';
import { useTraining } from '@/hooks/training-store';
import { useTheme } from '@/hooks/theme-store';
import WorkoutCard from '@/components/dashboard/WorkoutCard';
import ProgressOverview from '@/components/dashboard/ProgressOverview';
import CalendarView from '@/components/dashboard/CalendarView';
import Button from '@/components/ui/Button';
import { WeeklyCheckInModal } from '@/components/WeeklyCheckIn';

export default function DashboardScreen() {
  const { 
    userProfile, 
    trainingPlan, 
    isAuthenticated, 
    isLoading, 
    shouldShowWeeklyCheckIn, 
    submitWeeklyCheckIn, 
    markCheckInPromptShown 
  } = useTraining();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/signup');
      } else if (!userProfile?.onboardingCompleted) {
        router.replace('/onboarding');
      } else if (shouldShowWeeklyCheckIn()) {
        // Show check-in modal after a short delay to let the screen load
        const timer = setTimeout(() => {
          setShowCheckInModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, isAuthenticated, userProfile, shouldShowWeeklyCheckIn]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.loadingContent, { paddingTop: insets.top + 40 }]}>
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading your training plan...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!trainingPlan) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.emptyContent, { paddingTop: insets.top + 40 }]}>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Training Plan</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Complete your onboarding to get started</Text>
            <Button
              title="Start Onboarding"
              onPress={() => router.push('/onboarding')}
              style={styles.startButton}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const todayWorkouts = trainingPlan.dailyWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate.toDateString() === today.toDateString();
  });

  const tomorrowWorkouts = trainingPlan.dailyWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate.toDateString() === tomorrow.toDateString();
  });

  const futureWorkouts = trainingPlan.dailyWorkouts
    .filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= dayAfterTomorrow;
    })
    .slice(0, 5);

  const handleCheckInSubmit = async (checkInData: any) => {
    await submitWeeklyCheckIn(checkInData);
    setShowCheckInModal(false);
  };

  const handleCheckInClose = async () => {
    await markCheckInPromptShown();
    setShowCheckInModal(false);
  };

  const getCurrentWeekNumber = (): number => {
    if (!trainingPlan) return 1;
    const planStartDate = new Date(trainingPlan.startDate);
    const now = new Date();
    const timeSinceStart = now.getTime() - planStartDate.getTime();
    const weeksSinceStart = Math.floor(timeSinceStart / (7 * 24 * 60 * 60 * 1000));
    return weeksSinceStart + 1;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={[styles.brandName, { color: theme.colors.accent }]}>Scope</Text>
                <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
                  Hey {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'there'}!
                </Text>
                <Text style={[styles.planName, { color: theme.colors.text }]}>{trainingPlan.name}</Text>
              </View>
              
              <View style={[styles.viewToggle, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === 'list' && [styles.activeToggleButton, { backgroundColor: theme.colors.accent }]
                  ]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={18} color={viewMode === 'list' ? 'white' : theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === 'calendar' && [styles.activeToggleButton, { backgroundColor: theme.colors.accent }]
                  ]}
                  onPress={() => setViewMode('calendar')}
                >
                  <Calendar size={18} color={viewMode === 'calendar' ? 'white' : theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

        {viewMode === 'list' ? (
          <>
            <ProgressOverview trainingPlan={trainingPlan} />

            {todayWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today</Text>
                  <View style={[styles.sectionAccent, { backgroundColor: theme.colors.accent }]} />
                </View>
                {todayWorkouts.map(workout => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onPress={() => router.push(`/workout/${workout.id}`)}
                  />
                ))}
              </View>
            )}

            {tomorrowWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tomorrow</Text>
                  <View style={[styles.sectionAccent, { backgroundColor: theme.colors.textSecondary }]} />
                </View>
                {tomorrowWorkouts.map(workout => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onPress={() => router.push(`/workout/${workout.id}`)}
                  />
                ))}
              </View>
            )}

            {futureWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Future Workouts</Text>
                  <View style={[styles.sectionAccent, { backgroundColor: theme.colors.textSecondary }]} />
                </View>
                {futureWorkouts.map(workout => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    onPress={() => router.push(`/workout/${workout.id}`)}
                  />
                ))}
              </View>
            )}

            {userProfile?.manualActivities && userProfile.manualActivities.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Logged Activities</Text>
                  <View style={[styles.sectionAccent, { backgroundColor: theme.colors.accent }]} />
                </View>
                <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                  Activities you completed outside your plan
                </Text>
                {userProfile.manualActivities
                  .slice(-5)
                  .reverse()
                  .map(activity => {
                    const activityDate = new Date(activity.date);
                    const today = new Date();
                    const isToday = activityDate.toDateString() === today.toDateString();
                    const yesterday = new Date(today);
                    yesterday.setDate(today.getDate() - 1);
                    const isYesterday = activityDate.toDateString() === yesterday.toDateString();
                    
                    let dateDisplay = activity.date;
                    if (isToday) dateDisplay = 'Today';
                    else if (isYesterday) dateDisplay = 'Yesterday';
                    else dateDisplay = activityDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    
                    return (
                      <View key={activity.id} style={[styles.activityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <View style={styles.activityHeader}>
                          <View style={styles.activityTitleContainer}>
                            <Text style={[styles.activityName, { color: theme.colors.text }]}>{activity.name}</Text>
                            <View style={[styles.loggedBadge, { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent }]}>
                              <Text style={[styles.loggedBadgeText, { color: theme.colors.accent }]}>LOGGED</Text>
                            </View>
                          </View>
                          <Text style={[styles.activityDate, { color: theme.colors.textSecondary }]}>{dateDisplay}</Text>
                        </View>
                        <View style={styles.activityDetails}>
                          <Text style={[styles.activityType, { color: theme.colors.accent }]}>{activity.type.toUpperCase()}</Text>
                          <Text style={[styles.activityDuration, { color: theme.colors.textSecondary }]}>{activity.duration} min</Text>
                          <Text style={[styles.activityIntensity, { color: theme.colors.textSecondary }]}>{activity.intensity} intensity</Text>
                        </View>
                        {activity.notes && (
                          <Text style={[styles.activityNotes, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                            {activity.notes}
                          </Text>
                        )}
                      </View>
                    );
                  })
                }
              </View>
            )}
          </>
        ) : (
          <CalendarView trainingPlan={trainingPlan} />
        )}

          <View style={styles.bottomPadding} />
        </ScrollView>
        
        {userProfile && (
          <WeeklyCheckInModal
            visible={showCheckInModal}
            onClose={handleCheckInClose}
            onSubmit={handleCheckInSubmit}
            weekNumber={getCurrentWeekNumber()}
            fitnessPillars={userProfile.fitnessPillars}
          />
        )}
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
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    minWidth: 200,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginLeft: 16,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleButton: {
    // Active styling handled by backgroundColor prop
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  bottomPadding: {
    height: 100,
  },
  activityCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loggedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  loggedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activityDate: {
    fontSize: 14,
  },
  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  activityType: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activityDuration: {
    fontSize: 14,
  },
  activityIntensity: {
    fontSize: 14,
  },
  activityNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});