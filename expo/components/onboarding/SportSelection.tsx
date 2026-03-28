import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { SportChoice } from '@/types/training';
import { SPORT_CHOICES } from '@/constants/training-data';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface SportSelectionProps {
  onNext: (selectedSport?: SportChoice) => void;
  onBack: () => void;
}

export default function SportSelection({ onNext, onBack }: SportSelectionProps) {
  const { theme } = useTheme();
  const [selectedSport, setSelectedSport] = useState<SportChoice | null>(null);

  const handleSportSelection = (sport: SportChoice) => {
    setSelectedSport(sport);
  };

  const handleNext = () => {
    if (selectedSport) {
      onNext(selectedSport);
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Which sport do you practice?</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        We&apos;ll create a training plan to support your sport performance
      </Text>

      <ScrollView style={styles.sportsList} showsVerticalScrollIndicator={false}>
        {SPORT_CHOICES.map(sport => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              selectedSport?.id === sport.id && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
            ]}
            onPress={() => handleSportSelection(sport)}
            activeOpacity={0.8}
          >
            <View style={styles.sportHeader}>
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <View style={styles.sportInfo}>
                <Text style={[
                  styles.sportName,
                  { color: theme.colors.text },
                  selectedSport?.id === sport.id && { color: '#ffffff' }
                ]}>
                  {sport.name}
                </Text>
                <Text style={[
                  styles.sportDescription,
                  { color: theme.colors.textSecondary },
                  selectedSport?.id === sport.id && { color: '#cccccc' }
                ]}>
                  {sport.description}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
            disabled={!selectedSport}
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
    marginBottom: 40,
    lineHeight: 22,
  },

  sportsList: {
    flex: 1,
  },
  sportCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  sportInfo: {
    flex: 1,
  },
  sportName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sportDescription: {
    fontSize: 14,
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