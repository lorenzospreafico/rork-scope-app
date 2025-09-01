import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme-store';
import { useTraining } from '@/hooks/training-store';
import { TrainingGoal, TimePreference, WeekDay, UserProfile, ExistingSport, SportChoice, FitnessPillar, Equipment } from '@/types/training';
import { HABIT_LEVELS } from '@/constants/training-data';
import SportSelection from '@/components/onboarding/SportSelection';
import PillarSelection from '@/components/onboarding/PillarSelection';
import TimePreferences from '@/components/onboarding/TimePreferences';
import ExistingSports from '@/components/onboarding/ExistingSports';
import ScheduleSetup from '@/components/onboarding/ScheduleSetup';
import InitialChoice from '@/components/onboarding/InitialChoice';
import FitnessGoalSelection from '@/components/onboarding/FitnessGoalSelection';
import EquipmentSelection from '@/components/onboarding/EquipmentSelection';

type OnboardingStep = 'initial-choice' | 'sport-selection' | 'fitness-goals' | 'pillars' | 'time' | 'existing-sports' | 'schedule' | 'equipment' | 'complete';

export default function OnboardingScreen() {
  const { saveUserProfile, generateTrainingPlan, saveTrainingPlan } = useTraining();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('initial-choice');
  const [selectedSport, setSelectedSport] = useState<SportChoice | undefined>(undefined);
  const [selectedPillars, setSelectedPillars] = useState<FitnessPillar[]>([]);
  const [selectedGoals] = useState<TrainingGoal[]>([]);
  const [fitnessGoal, setFitnessGoal] = useState<'strength' | 'health' | 'balanced' | undefined>(undefined);
  const [timePreference, setTimePreference] = useState<TimePreference | null>(null);
  const [existingSports, setExistingSports] = useState<ExistingSport[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [availableDays, setAvailableDays] = useState<WeekDay[]>([]);


  const handleInitialChoiceNext = (choice: 'sport' | 'fitness') => {
    if (choice === 'sport') {
      setCurrentStep('sport-selection');
    } else {
      setSelectedSport(undefined);
      setCurrentStep('fitness-goals');
    }
  };

  const handleSportNext = (sport?: SportChoice) => {
    setSelectedSport(sport);
    setCurrentStep('pillars');
  };

  const handleFitnessGoalNext = (goal: 'strength' | 'health' | 'balanced') => {
    setFitnessGoal(goal);
    setCurrentStep('pillars');
  };

  const handlePillarsNext = (pillars: FitnessPillar[]) => {
    setSelectedPillars(pillars);
    setCurrentStep('time');
  };

  const handleTimeNext = (time: TimePreference) => {
    setTimePreference(time);
    setCurrentStep('existing-sports');
  };

  const handleExistingSportsNext = (sports: ExistingSport[]) => {
    setExistingSports(sports);
    setCurrentStep('schedule');
  };

  const handleScheduleNext = (days: WeekDay[]) => {
    setAvailableDays(days);
    setCurrentStep('equipment');
  };

  const handleEquipmentNext = async (equipment: Equipment[]) => {
    setSelectedEquipment(equipment);
    
    if (!timePreference) return;

    const userProfile: UserProfile = {
      fullName: '',
      email: '',
      goals: selectedGoals,
      fitnessPillars: selectedPillars,
      selectedSport,
      timePreference,
      habitLevel: HABIT_LEVELS[1], // Default to 'inconsistent'
      availableDays: availableDays,
      blackoutDates: [],
      limitations: [],
      existingSports,
      availableEquipment: equipment,
      onboardingCompleted: true,
      weeklyCheckIns: [],
      manualActivities: [],
    };

    await saveUserProfile(userProfile);
    
    const trainingPlan = generateTrainingPlan(userProfile);
    await saveTrainingPlan(trainingPlan);
    
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'sport-selection':
        setCurrentStep('initial-choice');
        break;
      case 'fitness-goals':
        setCurrentStep('initial-choice');
        break;
      case 'pillars':
        if (selectedSport) {
          setCurrentStep('sport-selection');
        } else {
          setCurrentStep('fitness-goals');
        }
        break;
      case 'time':
        setCurrentStep('pillars');
        break;
      case 'existing-sports':
        setCurrentStep('time');
        break;
      case 'schedule':
        setCurrentStep('existing-sports');
        break;
      case 'equipment':
        setCurrentStep('schedule');
        break;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          {currentStep === 'initial-choice' && (
            <InitialChoice onNext={handleInitialChoiceNext} />
          )}
          {currentStep === 'sport-selection' && (
            <SportSelection onNext={handleSportNext} onBack={handleBack} />
          )}
          {currentStep === 'fitness-goals' && (
            <FitnessGoalSelection onNext={handleFitnessGoalNext} onBack={handleBack} />
          )}
          {currentStep === 'pillars' && (
            <PillarSelection 
              selectedSport={selectedSport}
              fitnessGoal={fitnessGoal || undefined}
              onNext={handlePillarsNext} 
              onBack={handleBack} 
            />
          )}
          {currentStep === 'time' && (
            <TimePreferences onNext={handleTimeNext} onBack={handleBack} />
          )}
          {currentStep === 'existing-sports' && (
            <ExistingSports onNext={handleExistingSportsNext} onBack={handleBack} />
          )}
          {currentStep === 'schedule' && (
            <ScheduleSetup onNext={handleScheduleNext} onBack={handleBack} />
          )}
          {currentStep === 'equipment' && (
            <EquipmentSelection onNext={handleEquipmentNext} onBack={handleBack} />
          )}
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});