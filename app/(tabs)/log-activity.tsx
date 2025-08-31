import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, Alert, Modal, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/hooks/theme-store';
import { useTraining } from '@/hooks/training-store';
import Button from '@/components/ui/Button';
import { Clock, Calendar, Target } from 'lucide-react-native';
import { ManualActivity } from '@/types/training';

type ManualActivityForm = Omit<ManualActivity, 'id' | 'loggedAt'>;

const ACTIVITY_TYPES = [
  { id: 'cardio', name: 'Cardio', icon: '🏃‍♂️' },
  { id: 'strength', name: 'Strength', icon: '💪' },
  { id: 'flexibility', name: 'Flexibility', icon: '🧘‍♀️' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
];

const INTENSITY_LEVELS = [
  { id: 'low', name: 'Low', description: 'Light effort, could do this all day' },
  { id: 'medium', name: 'Medium', description: 'Moderate effort, breathing harder' },
  { id: 'high', name: 'High', description: 'Hard effort, challenging to maintain' },
];

export default function LogActivityScreen() {
  const { theme } = useTheme();
  const { logManualActivity, generateTrainingPlan, userProfile, saveTrainingPlan } = useTraining();
  
  const [activity, setActivity] = useState<ManualActivityForm>({
    name: '',
    type: 'cardio',
    duration: 30,
    intensity: 'medium',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  const [showUpdatePlanModal, setShowUpdatePlanModal] = useState<boolean>(false);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<boolean>(false);

  const handleLogActivity = async () => {
    if (!activity.name.trim()) {
      Alert.alert('Missing Information', 'Please enter an activity name.');
      return;
    }

    if (activity.duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration.');
      return;
    }

    setIsLogging(true);
    
    try {
      await logManualActivity(activity);
      setShowUpdatePlanModal(true);
    } catch (error) {
      console.error('Error logging activity:', error);
      Alert.alert('Error', 'Failed to log activity. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!userProfile) return;
    
    setIsUpdatingPlan(true);
    
    try {
      const updatedPlan = generateTrainingPlan(userProfile);
      await saveTrainingPlan(updatedPlan);
      
      Alert.alert(
        'Plan Updated!', 
        'Your training plan has been updated to account for your recent activity.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
      
    } catch (error) {
      console.error('Error updating plan:', error);
      Alert.alert('Error', 'Failed to update training plan. Please try again.');
    } finally {
      setIsUpdatingPlan(false);
      setShowUpdatePlanModal(false);
    }
  };

  const handleSkipUpdate = () => {
    setShowUpdatePlanModal(false);
    Alert.alert(
      'Activity Logged!', 
      'Your activity has been recorded successfully.',
      [{ text: 'OK', onPress: () => resetForm() }]
    );
  };

  const resetForm = () => {
    setActivity({
      name: '',
      type: 'cardio',
      duration: 30,
      intensity: 'medium',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Log Activity</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Record activities not in your plan
          </Text>
        </View>

        {/* Activity Name Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Activity Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              value={activity.name}
              onChangeText={(text) => setActivity(prev => ({ ...prev, name: text }))}
              placeholder="e.g., Morning Run, Yoga Session"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Activity Type Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Activity Type</Text>
          <View style={styles.typeContainer}>
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeButton, {
                  backgroundColor: activity.type === type.id ? theme.colors.accent : theme.colors.card,
                  borderColor: activity.type === type.id ? theme.colors.accent : theme.colors.border,
                }]}
                onPress={() => setActivity(prev => ({ ...prev, type: type.id as any }))}
                activeOpacity={0.7}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeText, {
                  color: activity.type === type.id ? 'white' : theme.colors.text,
                }]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Duration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Duration (minutes)</Text>
          <View style={styles.inputWrapper}>
            <View style={[styles.durationContainer, { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border 
            }]}>
              <Clock size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.durationInput, { color: theme.colors.text }]}
                value={activity.duration.toString()}
                onChangeText={(text) => {
                  const duration = parseInt(text) || 0;
                  setActivity(prev => ({ ...prev, duration }));
                }}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Intensity Level Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Intensity Level</Text>
          <View style={styles.intensityContainer}>
            {INTENSITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[styles.intensityButton, {
                  backgroundColor: activity.intensity === level.id ? theme.colors.accent : theme.colors.card,
                  borderColor: activity.intensity === level.id ? theme.colors.accent : theme.colors.border,
                }]}
                onPress={() => setActivity(prev => ({ ...prev, intensity: level.id as any }))}
                activeOpacity={0.7}
              >
                <Text style={[styles.intensityText, {
                  color: activity.intensity === level.id ? 'white' : theme.colors.text,
                }]}>{level.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.descriptionWrapper}>
            <Text style={[styles.intensityDescription, { color: theme.colors.textSecondary }]}>
              {INTENSITY_LEVELS.find(l => l.id === activity.intensity)?.description}
            </Text>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Date</Text>
          <View style={styles.inputWrapper}>
            <View style={[styles.dateContainer, { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border 
            }]}>
              <Calendar size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.dateInput, { color: theme.colors.text }]}
                value={activity.date}
                onChangeText={(text) => setActivity(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text }]}>Notes (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              value={activity.notes}
              onChangeText={(text) => setActivity(prev => ({ ...prev, notes: text }))}
              placeholder="How did it feel? Any observations?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button Section */}
        <View style={styles.submitSection}>
          <Button
            title={isLogging ? "Logging Activity..." : "Log Activity"}
            onPress={handleLogActivity}
            disabled={isLogging}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Update Plan Modal */}
      <Modal
        visible={showUpdatePlanModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpdatePlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Target size={24} color={theme.colors.accent} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Update Training Plan?</Text>
            </View>
            
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Would you like to update your training plan based on this activity? This will adjust your upcoming workouts to account for the work you've already done.
            </Text>
            
            <View style={styles.modalButtons}>
              <Button
                title="Skip Update"
                onPress={handleSkipUpdate}
                variant="secondary"
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                textStyle={{ color: theme.colors.text }}
              />
              <Button
                title={isUpdatingPlan ? "Updating..." : "Update Plan"}
                onPress={handleUpdatePlan}
                disabled={isUpdatingPlan}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    flexGrow: 1,
    paddingBottom: Platform.OS === 'android' ? 60 : 40,
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputWrapper: {
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    width: '100%',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeButton: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  typeIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  separator: {
    height: 24,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  durationInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    textAlign: 'left',
  },
  intensityContainer: {
    flexDirection: 'row',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  intensityButton: {
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionWrapper: {
    width: '100%',
  },
  intensityDescription: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    width: '100%',
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    textAlign: 'left',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    minHeight: 100,
    width: '100%',
  },
  submitSection: {
    paddingHorizontal: 24,
    marginTop: 20,
    paddingBottom: 20,
  },
  submitButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});