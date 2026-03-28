import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Zap, Flower, Dumbbell, Trophy, Star } from 'lucide-react-native';
import { TrainingGoal } from '@/types/training';
import { TRAINING_GOALS } from '@/constants/training-data';
import Button from '@/components/ui/Button';

interface GoalSelectionProps {
  onNext: (goals: TrainingGoal[]) => void;
}

const iconMap = {
  heart: Heart,
  zap: Zap,
  flower: Flower,
  dumbbell: Dumbbell,
  trophy: Trophy,
};

export default function GoalSelection({ onNext }: GoalSelectionProps) {
  const [selectedGoals, setSelectedGoals] = useState<TrainingGoal[]>(TRAINING_GOALS);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.map(goal =>
        goal.id === goalId ? { ...goal, selected: !goal.selected, importance: goal.selected ? undefined : 3 } : goal
      )
    );
  };

  const setImportance = (goalId: string, importance: number) => {
    setSelectedGoals(prev =>
      prev.map(goal =>
        goal.id === goalId ? { ...goal, importance } : goal
      )
    );
  };

  const handleNext = () => {
    const selected = selectedGoals.filter(goal => goal.selected);
    if (selected.length > 0) {
      onNext(selected);
    }
  };

  const selectedCount = selectedGoals.filter(goal => goal.selected).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What are your training goals?</Text>
      <Text style={styles.subtitle}>Select your goals and set their importance level</Text>

      <ScrollView style={styles.goalsList} showsVerticalScrollIndicator={false}>
        {selectedGoals.map(goal => {
          const IconComponent = iconMap[goal.icon as keyof typeof iconMap];
          return (
            <View key={goal.id} style={[styles.goalCard, goal.selected && styles.goalCardSelected]}>
              <TouchableOpacity
                style={styles.goalHeader}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, goal.selected && styles.iconContainerSelected]}>
                  <IconComponent
                    size={24}
                    color={goal.selected ? '#ffffff' : '#1a1a1a'}
                  />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalName, goal.selected && styles.goalNameSelected]}>
                    {goal.name}
                  </Text>
                  <Text style={[styles.goalDescription, goal.selected && styles.goalDescriptionSelected]}>
                    {goal.description}
                  </Text>
                </View>
              </TouchableOpacity>
              
              {goal.selected && (
                <View style={styles.importanceSection}>
                  <Text style={styles.importanceLabel}>Importance Level</Text>
                  <View style={styles.importanceStars}>
                    {[1, 2, 3, 4, 5].map(level => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setImportance(goal.id, level)}
                        style={styles.starButton}
                        activeOpacity={0.7}
                      >
                        <Star
                          size={20}
                          color={(goal.importance || 3) >= level ? '#FFD700' : '#666666'}
                          fill={(goal.importance || 3) >= level ? '#FFD700' : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.importanceText}>
                    {goal.importance === 1 && 'Low Priority'}
                    {goal.importance === 2 && 'Below Average'}
                    {(goal.importance === 3 || !goal.importance) && 'Moderate Priority'}
                    {goal.importance === 4 && 'High Priority'}
                    {goal.importance === 5 && 'Top Priority'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectionCount}>
          {selectedCount} goal{selectedCount !== 1 ? 's' : ''} selected
        </Text>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={selectedCount === 0}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  goalsList: {
    flex: 1,
  },
  goalCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#333333',
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  goalNameSelected: {
    color: '#ffffff',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  goalDescriptionSelected: {
    color: '#cccccc',
  },
  footer: {
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  selectionCount: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  continueButton: {
    width: '100%',
  },
  importanceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#444444',
  },
  importanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  importanceStars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starButton: {
    marginRight: 4,
    padding: 4,
  },
  importanceText: {
    fontSize: 12,
    color: '#cccccc',
    fontStyle: 'italic',
  },
});