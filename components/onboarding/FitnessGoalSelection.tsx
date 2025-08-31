import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Zap, Heart, Scale } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';
import Button from '@/components/ui/Button';

type FitnessGoal = 'strength' | 'health' | 'balanced';

interface FitnessGoalSelectionProps {
  onNext: (goal: FitnessGoal) => void;
  onBack: () => void;
}

export default function FitnessGoalSelection({ onNext, onBack }: FitnessGoalSelectionProps) {
  const { theme } = useTheme();
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | null>(null);

  const goals = [
    {
      id: 'strength' as FitnessGoal,
      title: 'I want to be generally stronger',
      description: 'Build muscle, increase power, and develop functional strength for daily activities',
      icon: Zap,
    },
    {
      id: 'health' as FitnessGoal,
      title: 'I want to optimize for long-term health',
      description: 'Focus on cardiovascular health, mobility, and sustainable fitness habits',
      icon: Heart,
    },
    {
      id: 'balanced' as FitnessGoal,
      title: 'I want a balanced mix of everything',
      description: 'Combine strength, cardio, flexibility, and overall wellness in one program',
      icon: Scale,
    },
  ];

  const handleGoalSelection = (goal: FitnessGoal) => {
    setSelectedGoal(goal);
  };

  const handleNext = () => {
    if (selectedGoal) {
      onNext(selectedGoal);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.colors.text }]}>What&apos;s your main fitness goal?</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          This helps us create the perfect training plan tailored to your objectives
        </Text>

        <View style={styles.goalsContainer}>
          {goals.map(goal => {
            const IconComponent = goal.icon;
            const isSelected = selectedGoal === goal.id;
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  isSelected && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
                ]}
                onPress={() => handleGoalSelection(goal.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: theme.colors.background },
                  isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }
                ]}>
                  <IconComponent
                    size={28}
                    color={isSelected ? '#ffffff' : theme.colors.accent}
                  />
                </View>
                <Text style={[
                  styles.goalTitle,
                  { color: theme.colors.text },
                  isSelected && { color: '#ffffff' }
                ]}>
                  {goal.title}
                </Text>
                <Text style={[
                  styles.goalDescription,
                  { color: theme.colors.textSecondary },
                  isSelected && { color: '#cccccc' }
                ]}>
                  {goal.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.buttonRow}>
          <Button
            title="Back"
            onPress={onBack}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleNext}
            disabled={!selectedGoal}
            style={styles.continueButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 22,
  },
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  goalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});