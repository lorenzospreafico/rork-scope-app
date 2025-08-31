import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { X, Star, Clock, Target, TrendingUp } from 'lucide-react-native';
import { WeeklyCheckIn, FitnessPillar } from '@/types/training';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface WeeklyCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (checkIn: Omit<WeeklyCheckIn, 'id' | 'date' | 'weekNumber'>) => void;
  weekNumber: number;
  fitnessPillars: FitnessPillar[];
}

export function WeeklyCheckInModal({
  visible,
  onClose,
  onSubmit,
  weekNumber,
  fitnessPillars,
}: WeeklyCheckInModalProps) {
  const { theme } = useTheme();
  const [satisfaction, setSatisfaction] = useState<number>(3);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3);
  const [timeCommitment, setTimeCommitment] = useState<'too-short' | 'just-right' | 'too-long'>('just-right');
  const [sessionDurationPreference, setSessionDurationPreference] = useState<'shorter' | 'same' | 'longer'>('same');
  const [focusAdjustments, setFocusAdjustments] = useState<{ pillarId: string; newImportance: number }[]>([]);
  const [additionalFeedback, setAdditionalFeedback] = useState<string>('');

  const handlePillarAdjustment = (pillarId: string, newImportance: number) => {
    setFocusAdjustments(prev => {
      const existing = prev.find(adj => adj.pillarId === pillarId);
      if (existing) {
        return prev.map(adj => 
          adj.pillarId === pillarId ? { ...adj, newImportance } : adj
        );
      } else {
        return [...prev, { pillarId, newImportance }];
      }
    });
  };

  const handleSubmit = () => {
    const checkInData = {
      responses: {
        satisfaction,
        difficultyLevel,
        timeCommitment,
        focusAdjustments,
        sessionDurationPreference,
        additionalFeedback: additionalFeedback.trim() || undefined,
      },
      adjustmentsMade: focusAdjustments.length > 0 || sessionDurationPreference !== 'same',
    };
    
    onSubmit(checkInData);
  };

  const renderStarRating = (value: number, onChange: (value: number) => void, label: string) => (
    <View style={styles.ratingSection}>
      <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => onChange(star)}
            style={styles.starButton}
          >
            <Star
              size={28}
              color={star <= value ? theme.colors.accent : '#E0E0E0'}
              fill={star <= value ? theme.colors.accent : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOptionButtons = (
    options: { value: string; label: string }[],
    selectedValue: string,
    onSelect: (value: any) => void
  ) => (
    <View style={styles.optionContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            selectedValue === option.value && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              { color: theme.colors.textSecondary },
              selectedValue === option.value && { color: '#ffffff' },
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerContent}>
            <TrendingUp size={24} color={theme.colors.accent} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Week {weekNumber} Check-in</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            How has your first week been? Let&apos;s adjust your plan to make it even better.
          </Text>

          {renderStarRating(
            satisfaction,
            setSatisfaction,
            "How satisfied are you with your workouts?"
          )}

          {renderStarRating(
            difficultyLevel,
            setDifficultyLevel,
            "How challenging have your workouts been?"
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              <Clock size={18} color={theme.colors.accent} /> How do you feel about your session length?
            </Text>
            {renderOptionButtons(
              [
                { value: 'too-short', label: 'Too Short' },
                { value: 'just-right', label: 'Just Right' },
                { value: 'too-long', label: 'Too Long' },
              ],
              timeCommitment,
              setTimeCommitment
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Would you prefer sessions to be:
            </Text>
            {renderOptionButtons(
              [
                { value: 'shorter', label: 'Shorter' },
                { value: 'same', label: 'Same Length' },
                { value: 'longer', label: 'Longer' },
              ],
              sessionDurationPreference,
              setSessionDurationPreference
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              <Target size={18} color={theme.colors.accent} /> Adjust your fitness focus
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Want to focus more or less on certain areas? Adjust the importance below:
            </Text>
            
            {fitnessPillars.filter(p => p.selected).map(pillar => {
              const currentAdjustment = focusAdjustments.find(adj => adj.pillarId === pillar.id);
              const currentImportance = currentAdjustment?.newImportance ?? pillar.importance ?? 3;
              
              return (
                <View key={pillar.id} style={styles.pillarAdjustment}>
                  <Text style={[styles.pillarName, { color: theme.colors.text }]}>{pillar.name}</Text>
                  <View style={styles.importanceSlider}>
                    {[1, 2, 3, 4, 5].map(level => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.importanceButton,
                          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                          currentImportance >= level && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
                        ]}
                        onPress={() => handlePillarAdjustment(pillar.id, level)}
                      >
                        <Text
                          style={[
                            styles.importanceButtonText,
                            { color: theme.colors.textSecondary },
                            currentImportance >= level && { color: '#ffffff' },
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Additional feedback (optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: theme.colors.surface, 
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }
              ]}
              placeholder="Any other thoughts or suggestions?"
              placeholderTextColor={theme.colors.textSecondary}
              value={additionalFeedback}
              onChangeText={setAdditionalFeedback}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <Button
            title="Update My Plan"
            onPress={handleSubmit}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
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
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 20,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 32,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  pillarAdjustment: {
    marginBottom: 20,
  },
  pillarName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  importanceSlider: {
    flexDirection: 'row',
    gap: 8,
  },
  importanceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  submitButton: {
    marginTop: 0,
  },
});