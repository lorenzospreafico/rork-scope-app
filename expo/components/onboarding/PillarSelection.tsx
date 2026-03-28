import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Heart, Dumbbell, Flower, Zap, Target, ZapOff, Star } from 'lucide-react-native';
import { FitnessPillar, SportChoice } from '@/types/training';
import { FITNESS_PILLARS } from '@/constants/training-data';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface PillarSelectionProps {
  selectedSport?: SportChoice;
  fitnessGoal?: 'strength' | 'health' | 'balanced';
  onNext: (pillars: FitnessPillar[]) => void;
  onBack: () => void;
}

const iconMap = {
  heart: Heart,
  dumbbell: Dumbbell,
  flower: Flower,
  zap: Zap,
  target: Target,
  'zap-off': ZapOff,
};

// Fitness goal to pillar mappings
const FITNESS_GOAL_PILLARS = {
  strength: [
    { pillarId: 'strength', importance: 5 },
    { pillarId: 'muscular-endurance', importance: 4 },
    { pillarId: 'balance-stability', importance: 3 },
    { pillarId: 'mobility', importance: 3 },
  ],
  health: [
    { pillarId: 'cardio', importance: 5 },
    { pillarId: 'mobility', importance: 4 },
    { pillarId: 'balance-stability', importance: 4 },
    { pillarId: 'strength', importance: 3 },
  ],
  balanced: [
    { pillarId: 'cardio', importance: 3 },
    { pillarId: 'strength', importance: 3 },
    { pillarId: 'mobility', importance: 3 },
    { pillarId: 'muscular-endurance', importance: 3 },
    { pillarId: 'balance-stability', importance: 3 },
    { pillarId: 'speed', importance: 3 },
  ],
};

export default function PillarSelection({ selectedSport, fitnessGoal, onNext, onBack }: PillarSelectionProps) {
  const { theme } = useTheme();
  const [selectedPillars, setSelectedPillars] = useState<FitnessPillar[]>([]);

  useEffect(() => {
    if (selectedSport) {
      // Auto-select pillars based on sport choice
      const pillarsWithRecommendations = FITNESS_PILLARS.map(pillar => {
        const recommendation = selectedSport.recommendedPillars.find(
          rec => rec.pillarId === pillar.id
        );
        
        if (recommendation) {
          return {
            ...pillar,
            selected: true,
            importance: recommendation.importance,
            autoSelected: true,
          };
        }
        
        return { ...pillar, selected: false };
      });
      
      setSelectedPillars(pillarsWithRecommendations);
    } else if (fitnessGoal) {
      // Auto-select pillars based on fitness goal
      const goalRecommendations = FITNESS_GOAL_PILLARS[fitnessGoal];
      const pillarsWithRecommendations = FITNESS_PILLARS.map(pillar => {
        const recommendation = goalRecommendations.find(
          rec => rec.pillarId === pillar.id
        );
        
        if (recommendation) {
          return {
            ...pillar,
            selected: true,
            importance: recommendation.importance,
            autoSelected: true,
          };
        }
        
        return { ...pillar, selected: false };
      });
      
      setSelectedPillars(pillarsWithRecommendations);
    } else {
      // Start with all pillars unselected for manual selection
      setSelectedPillars(FITNESS_PILLARS.map(pillar => ({ ...pillar, selected: false })));
    }
  }, [selectedSport, fitnessGoal]);

  const togglePillar = (pillarId: string) => {
    setSelectedPillars(prev =>
      prev.map(pillar =>
        pillar.id === pillarId 
          ? { 
              ...pillar, 
              selected: !pillar.selected, 
              importance: pillar.selected ? undefined : 3,
              autoSelected: false // User manually changed it
            } 
          : pillar
      )
    );
  };

  const setImportance = (pillarId: string, importance: number) => {
    setSelectedPillars(prev =>
      prev.map(pillar =>
        pillar.id === pillarId ? { ...pillar, importance } : pillar
      )
    );
  };

  const handleNext = () => {
    const selected = selectedPillars.filter(pillar => pillar.selected);
    if (selected.length > 0) {
      onNext(selected);
    }
  };

  const selectedCount = selectedPillars.filter(pillar => pillar.selected).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {selectedSport ? (
        <>
          <Text style={[styles.title, { color: theme.colors.text }]}>Perfect for {selectedSport.name}!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Based on your sport, we&apos;ve recommended these fitness pillars. 
            You can adjust their importance or add/remove any.
          </Text>
        </>
      ) : fitnessGoal ? (
        <>
          <Text style={[styles.title, { color: theme.colors.text }]}>Perfect for your goal!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Based on your fitness goal, we&apos;ve recommended these pillars. 
            You can adjust their importance or add/remove any.
          </Text>
        </>
      ) : (
        <>
          <Text style={[styles.title, { color: theme.colors.text }]}>Choose your fitness focus</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Select the fitness pillars you want to focus on and set their importance level
          </Text>
        </>
      )}

      <ScrollView style={styles.pillarsList} showsVerticalScrollIndicator={false}>
        {selectedPillars.map(pillar => {
          const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
          return (
            <View key={pillar.id} style={[
              styles.pillarCard, 
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              pillar.selected && { backgroundColor: theme.colors.surface, borderColor: theme.colors.accent, borderWidth: 2 }
            ]}>
              <TouchableOpacity
                style={styles.pillarHeader}
                onPress={() => togglePillar(pillar.id)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.iconContainer, 
                  { backgroundColor: theme.colors.background },
                  pillar.selected && { backgroundColor: theme.colors.background }
                ]}>
                  <IconComponent
                    size={24}
                    color={pillar.selected ? theme.colors.accent : theme.colors.text}
                  />
                </View>
                <View style={styles.pillarInfo}>
                  <View style={styles.pillarTitleRow}>
                    <Text style={[
                      styles.pillarName, 
                      { color: theme.colors.text }
                    ]}>
                      {pillar.name}
                    </Text>
                    {pillar.autoSelected && (
                      <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.accentLight }]}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.pillarDescription, 
                    { color: theme.colors.textSecondary }
                  ]}>
                    {pillar.description}
                  </Text>
                </View>
              </TouchableOpacity>
              
              {pillar.selected && (
                <View style={styles.importanceSection}>
                  <Text style={[styles.importanceLabel, { color: theme.colors.text }]}>Importance Level</Text>
                  <View style={styles.importanceStars}>
                    {[1, 2, 3, 4, 5].map(level => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setImportance(pillar.id, level)}
                        style={styles.starButton}
                        activeOpacity={0.7}
                      >
                        <Star
                          size={20}
                          color={(pillar.importance || 3) >= level ? theme.colors.accentLight : '#666666'}
                          fill={(pillar.importance || 3) >= level ? theme.colors.accentLight : 'transparent'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[styles.importanceText, { color: theme.colors.textSecondary }]}>
                    {pillar.importance === 1 && 'Low Priority'}
                    {pillar.importance === 2 && 'Below Average'}
                    {(pillar.importance === 3 || !pillar.importance) && 'Moderate Priority'}
                    {pillar.importance === 4 && 'High Priority'}
                    {pillar.importance === 5 && 'Top Priority'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.selectionCount, { color: theme.colors.textSecondary }]}>
          {selectedCount} pillar{selectedCount !== 1 ? 's' : ''} selected
        </Text>
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
            disabled={selectedCount === 0}
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  pillarsList: {
    flex: 1,
  },
  pillarCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pillarInfo: {
    flex: 1,
  },
  pillarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillarName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  recommendedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillarDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  importanceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  importanceLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    fontStyle: 'italic',
  },
  footer: {
    paddingVertical: 24,
    borderTopWidth: 1,
  },
  selectionCount: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
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