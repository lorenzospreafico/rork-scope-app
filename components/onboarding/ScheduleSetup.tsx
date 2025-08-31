import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { WeekDay } from '@/types/training';
import { WEEK_DAYS } from '@/constants/training-data';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface ScheduleSetupProps {
  onNext: (availableDays: WeekDay[]) => void;
  onBack: () => void;
}

export default function ScheduleSetup({ onNext, onBack }: ScheduleSetupProps) {
  const { theme } = useTheme();
  const [availableDays, setAvailableDays] = useState<WeekDay[]>(WEEK_DAYS);

  const toggleDay = (dayId: number) => {
    setAvailableDays(prev =>
      prev.map(day =>
        day.id === dayId ? { ...day, available: !day.available } : day
      )
    );
  };

  const handleNext = () => {
    onNext(availableDays);
  };

  const selectedCount = availableDays.filter(day => day.available).length;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Training Schedule</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Select the days you&apos;re available to train</Text>

      <View style={styles.daysContainer}>
        {availableDays.map(day => (
          <TouchableOpacity
            key={day.id}
            style={[
              styles.dayCard, 
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              day.available && [styles.dayCardSelected, { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]
            ]}
            onPress={() => toggleDay(day.id)}
            activeOpacity={0.8}
          >
            <View style={styles.dayContent}>
              <Text style={[
                styles.dayShort, 
                { color: theme.colors.text },
                day.available && styles.dayShortSelected
              ]}>
                {day.short}
              </Text>
              <Text style={[
                styles.dayName, 
                { color: theme.colors.textSecondary },
                day.available && styles.dayNameSelected
              ]}>
                {day.name}
              </Text>
            </View>
            {day.available && (
              <View style={styles.checkmark}>
                <Check size={16} color="#ffffff" strokeWidth={3} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Scheduling Tips</Text>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          • Choose days you can consistently commit to{"\n"}
          • Allow rest days between intense sessions{"\n"}
          • Consider your work and personal schedule{"\n"}
          • You can always adjust this later
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.selectionCount, { color: theme.colors.textSecondary }]}>
          {selectedCount} day{selectedCount !== 1 ? "s" : ""} selected
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  dayCard: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  dayContent: {
    alignItems: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardSelected: {},
  dayShort: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dayShortSelected: {
    color: '#ffffff',
  },
  dayName: {
    fontSize: 12,
  },
  dayNameSelected: {
    color: '#cccccc',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
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