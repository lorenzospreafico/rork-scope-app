import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TimePreference } from '@/types/training';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface TimePreferencesProps {
  onNext: (timePreference: TimePreference) => void;
  onBack: () => void;
}

export default function TimePreferences({ onNext, onBack }: TimePreferencesProps) {
  const { theme } = useTheme();
  const [planDuration, setPlanDuration] = useState(8);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

  const planOptions = [4, 8, 12, 16, 24];
  const sessionFrequencyOptions = [2, 3, 4, 5, 6, 7];

  const handleNext = () => {
    onNext({
      planDuration,
      sessionsPerWeek,
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Time Preferences</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Help us create a plan that fits your schedule</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Plan Duration</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>How many weeks do you want to commit to?</Text>
        <View style={styles.optionsGrid}>
          {planOptions.map(weeks => (
            <Button
              key={weeks}
              title={`${weeks} weeks`}
              onPress={() => setPlanDuration(weeks)}
              variant={planDuration === weeks ? 'outline' : 'secondary'}
              style={planDuration === weeks ? [styles.optionButton, { borderColor: theme.colors.accent }] : styles.optionButton}
              textStyle={planDuration === weeks ? { color: theme.colors.accent } : undefined}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly Frequency</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>How many times per week can you train?</Text>
        <View style={styles.optionsGrid}>
          {sessionFrequencyOptions.map(frequency => (
            <Button
              key={frequency}
              title={`${frequency}x/week`}
              onPress={() => setSessionsPerWeek(frequency)}
              variant={sessionsPerWeek === frequency ? 'outline' : 'secondary'}
              style={sessionsPerWeek === frequency ? [styles.optionButton, { borderColor: theme.colors.accent }] : styles.optionButton}
              textStyle={sessionsPerWeek === frequency ? { color: theme.colors.accent } : undefined}
            />
          ))}
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.buttonRow}>
          <Button
            title="Back"
            onPress={onBack}
            variant="secondary"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleNext}
            variant="outline"
            style={[styles.continueButton, { borderColor: theme.colors.accent }]}
            textStyle={{ color: theme.colors.accent }}
          />
        </View>
      </View>
    </ScrollView>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    minWidth: 80,
    paddingHorizontal: 16,
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