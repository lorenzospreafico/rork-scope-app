import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Plus } from 'lucide-react-native';
import { TrainingPlan, DailyWorkout } from '@/types/training';
import { useTheme } from '@/hooks/theme-store';
import { useTraining } from '@/hooks/training-store';
import { router } from 'expo-router';

interface CalendarViewProps {
  trainingPlan: TrainingPlan;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  workouts: DailyWorkout[];
  manualActivities: any[];
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 48; // Account for padding
const DAY_WIDTH = CALENDAR_WIDTH / 7;

export default function CalendarView({ trainingPlan }: CalendarViewProps) {
  const { theme } = useTheme();
  const { userProfile } = useTraining();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        workouts: getWorkoutsForDate(date),
        manualActivities: getManualActivitiesForDate(date)
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        workouts: getWorkoutsForDate(date),
        manualActivities: getManualActivitiesForDate(date)
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        workouts: getWorkoutsForDate(date),
        manualActivities: getManualActivitiesForDate(date)
      });
    }
    
    return days;
  };

  const getWorkoutsForDate = (date: Date): DailyWorkout[] => {
    return trainingPlan.dailyWorkouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.toDateString() === date.toDateString();
    });
  };

  const getManualActivitiesForDate = (date: Date): any[] => {
    if (!userProfile?.manualActivities) return [];
    return userProfile.manualActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderDayContent = (day: CalendarDay) => {
    const hasWorkouts = day.workouts.length > 0;
    const hasManualActivities = day.manualActivities.length > 0;
    const completedWorkouts = day.workouts.filter(w => w.completed).length;
    const totalWorkouts = day.workouts.length;
    const allWorkoutsCompleted = totalWorkouts > 0 && completedWorkouts === totalWorkouts;
    
    return (
      <View style={styles.dayContent}>
        <Text style={[
          styles.dayNumber,
          { color: day.isCurrentMonth ? theme.colors.text : theme.colors.textSecondary },
          isToday(day.date) && [styles.todayText, { color: theme.colors.accent }],
          !day.isCurrentMonth && styles.otherMonthText
        ]}>
          {day.date.getDate()}
        </Text>
        
        <View style={styles.dayIndicators}>
          {hasWorkouts && (
            <View style={[
              styles.workoutIndicator,
              { backgroundColor: allWorkoutsCompleted ? '#34C759' : theme.colors.accent }
            ]} />
          )}
          {hasManualActivities && (
            <View style={[
              styles.manualActivityIndicator,
              { backgroundColor: theme.colors.accent + '80' }
            ]} />
          )}
        </View>
      </View>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;
    
    const selectedDay = getCalendarDays().find(day => 
      day.date.toDateString() === selectedDate.toDateString()
    );
    
    if (!selectedDay) return null;
    
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const isPast = selectedDate < new Date();
    
    return (
      <View style={[styles.selectedDateDetails, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.selectedDateHeader}>
          <Text style={[styles.selectedDateTitle, { color: theme.colors.text }]}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <TouchableOpacity 
            onPress={() => setSelectedDate(null)}
            style={styles.closeButton}
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>×</Text>
          </TouchableOpacity>
        </View>
        
        {selectedDay.workouts.length > 0 && (
          <View style={styles.workoutsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Planned Workouts</Text>
            {selectedDay.workouts.map(workout => (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.workoutItem,
                  { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                  workout.completed && styles.completedWorkoutItem
                ]}
                onPress={() => {
                  setSelectedDate(null);
                  router.push(`/workout/${workout.id}`);
                }}
              >
                <View style={styles.workoutItemHeader}>
                  <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>{workout.title}</Text>
                  {workout.completed ? (
                    <CheckCircle size={20} color="#34C759" />
                  ) : (
                    <Circle size={20} color={theme.colors.textSecondary} />
                  )}
                </View>
                <Text style={[styles.workoutType, { color: theme.colors.textSecondary }]}>{workout.type}</Text>
                <Text style={[styles.workoutDuration, { color: theme.colors.textSecondary }]}>{workout.duration} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {selectedDay.manualActivities.length > 0 && (
          <View style={styles.activitiesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Logged Activities</Text>
            {selectedDay.manualActivities.map(activity => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  { backgroundColor: theme.colors.background, borderColor: theme.colors.border }
                ]}
              >
                <View style={styles.activityItemHeader}>
                  <Text style={[styles.activityTitle, { color: theme.colors.text }]}>{activity.name}</Text>
                  <View style={[styles.loggedBadge, { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent }]}>
                    <Text style={[styles.loggedBadgeText, { color: theme.colors.accent }]}>LOGGED</Text>
                  </View>
                </View>
                <Text style={[styles.activityType, { color: theme.colors.textSecondary }]}>{activity.type}</Text>
                <Text style={[styles.activityDuration, { color: theme.colors.textSecondary }]}>{activity.duration} min</Text>
              </View>
            ))}
          </View>
        )}
        
        {selectedDay.workouts.length === 0 && selectedDay.manualActivities.length === 0 && (
          <View style={styles.emptyDay}>
            <Text style={[styles.emptyDayText, { color: theme.colors.textSecondary }]}>
              {isToday ? 'No workouts planned for today' : 
               isPast ? 'No activities recorded' : 
               'No workouts planned'}
            </Text>
            {(isToday || isPast) && (
              <TouchableOpacity 
                style={[styles.addActivityButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => {
                  setSelectedDate(null);
                  router.push('/log-activity');
                }}
              >
                <Plus size={16} color="white" />
                <Text style={styles.addActivityButtonText}>Log Activity</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const calendarDays = getCalendarDays();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.monthTitle, { color: theme.colors.text }]}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
          <ChevronRight size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.calendar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.dayNamesRow}>
          {dayNames.map(dayName => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text style={[styles.dayName, { color: theme.colors.textSecondary }]}>{dayName}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isToday(day.date) && [styles.todayCell, { backgroundColor: theme.colors.accent + '20' }],
                selectedDate?.toDateString() === day.date.toDateString() && 
                [styles.selectedCell, { backgroundColor: theme.colors.accent + '40' }]
              ]}
              onPress={() => setSelectedDate(day.date)}
              activeOpacity={0.7}
            >
              {renderDayContent(day)}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {renderSelectedDateDetails()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendar: {
    marginHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dayNamesRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayNameCell: {
    width: DAY_WIDTH,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_WIDTH,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderRightColor: '#f0f0f0',
    borderBottomColor: '#f0f0f0',
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#bbdefb',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  todayText: {
    fontWeight: 'bold',
  },
  otherMonthText: {
    opacity: 0.4,
  },
  dayIndicators: {
    flexDirection: 'row',
    gap: 2,
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  manualActivityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDateDetails: {
    margin: 24,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutsSection: {
    marginBottom: 16,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  workoutItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  completedWorkoutItem: {
    opacity: 0.7,
  },
  workoutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  workoutType: {
    fontSize: 12,
    marginBottom: 2,
  },
  workoutDuration: {
    fontSize: 12,
  },
  activityItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  activityItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  loggedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  loggedBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activityType: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityDuration: {
    fontSize: 12,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyDayText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addActivityButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});