import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, User, Calendar, Target, RefreshCw, TrendingUp, Moon, Sun, LogOut } from 'lucide-react-native';
import { useTraining } from '@/hooks/training-store';
import { useTheme } from '@/hooks/theme-store';
import { useAuth } from '@/hooks/auth-store';
import Button from '@/components/ui/Button';
import { WeeklyCheckInModal } from '@/components/WeeklyCheckIn';

export default function SettingsScreen() {
  const { userProfile, trainingPlan, submitWeeklyCheckIn } = useTraining();
  const { theme, isDark, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);

  const handleRestartOnboarding = () => {
    Alert.alert(
      'Restart Onboarding',
      'This will reset your current training plan and preferences. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Restart', 
          style: 'destructive',
          onPress: () => router.push('/onboarding')
        },
      ]
    );
  };

  const handleTestCheckIn = () => {
    setShowCheckInModal(true);
  };

  const handleCheckInSubmit = async (checkInData: any) => {
    await submitWeeklyCheckIn(checkInData);
    setShowCheckInModal(false);
    Alert.alert('Success', 'Your preferences have been updated!');
  };

  const handleCheckInClose = () => {
    setShowCheckInModal(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const getCurrentWeekNumber = (): number => {
    if (!trainingPlan) return 1;
    const planStartDate = new Date(trainingPlan.startDate);
    const now = new Date();
    const timeSinceStart = now.getTime() - planStartDate.getTime();
    const weeksSinceStart = Math.floor(timeSinceStart / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weeksSinceStart + 1);
  };

  const settingsItems = [
    {
      icon: Target,
      title: 'Training Goals',
      subtitle: userProfile?.goals.map(g => g.name).join(', ') || 'Not set',
      onPress: () => {},
    },
    {
      icon: Calendar,
      title: 'Schedule',
      subtitle: `${userProfile?.availableDays.filter(d => d.available).length || 0} days per week`,
      onPress: () => {},
    },
    {
      icon: User,
      title: 'Profile',
      subtitle: 'Personal information and preferences',
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          </View>

        {trainingPlan && (
          <View style={[styles.planCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.planTitle, { color: theme.colors.text }]}>{trainingPlan.name}</Text>
            <Text style={[styles.planSubtitle, { color: theme.colors.textSecondary }]}>
              {new Date(trainingPlan.startDate).toLocaleDateString()} - {new Date(trainingPlan.endDate).toLocaleDateString()}
            </Text>
            <Text style={[styles.planDetails, { color: theme.colors.textSecondary }]}>
              {trainingPlan.timePreference.sessionsPerWeek}x per week • {trainingPlan.timePreference.planDuration} week plan
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              {isDark ? <Moon size={20} color={theme.colors.textSecondary} /> : <Sun size={20} color={theme.colors.textSecondary} />}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Light Mode</Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{!isDark ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={!isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={!isDark ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Training Plan</Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <item.icon size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          {user && (
            <View style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
                <User size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Signed in as</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{user.email}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.colors.background }]}>
              <LogOut size={20} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Sign Out</Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Sign out of your account</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Actions</Text>
          <Button
            title="Weekly Check-in (Test)"
            onPress={handleTestCheckIn}
            variant="secondary"
            style={[styles.actionButton, { marginBottom: 12 }]}
          />
          <Button
            title="Restart Onboarding"
            onPress={handleRestartOnboarding}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  planDetails: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  actionButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 100,
  },
});