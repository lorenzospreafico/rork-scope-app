import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, CheckCircle, Circle, ArrowLeft, Edit3 } from 'lucide-react-native';
import { useTraining } from '@/hooks/training-store';
import { useTheme } from '@/hooks/theme-store';
import Button from '@/components/ui/Button';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams();
  const { trainingPlan, completeWorkout, updateExerciseInWorkout } = useTraining();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: any }>({});

  const workout = trainingPlan?.dailyWorkouts.find(w => w.id === id);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.errorContainer, { paddingTop: insets.top + 40 }]}>
            <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>Workout not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const toggleExercise = async (exerciseId: string) => {
    const isCompleted = completedExercises.has(exerciseId);
    
    if (!isCompleted) {
      // Mark as completed
      setCompletedExercises(prev => new Set([...prev, exerciseId]));
      await updateExerciseInWorkout(workout.id, exerciseId, { completed: true });
    } else {
      // Mark as incomplete
      setCompletedExercises(prev => {
        const newSet = new Set(prev);
        newSet.delete(exerciseId);
        return newSet;
      });
      await updateExerciseInWorkout(workout.id, exerciseId, { completed: false });
    }
  };



  const startEditing = (exerciseId: string, exercise: any) => {
    setEditingExercise(exerciseId);
    setTempValues({
      actualReps: exercise.actualReps || exercise.reps || '',
      actualSets: exercise.actualSets || exercise.sets || '',
      actualWeight: exercise.actualWeight || exercise.weight || '',
      notes: exercise.notes || '',
    });
  };

  const saveEditing = async () => {
    if (!editingExercise) return;
    
    const updates: any = {};
    if (tempValues.actualReps) updates.actualReps = parseInt(tempValues.actualReps);
    if (tempValues.actualSets) updates.actualSets = parseInt(tempValues.actualSets);
    if (tempValues.actualWeight) updates.actualWeight = parseFloat(tempValues.actualWeight);
    if (tempValues.notes) updates.notes = tempValues.notes;
    
    await updateExerciseInWorkout(workout.id, editingExercise, updates);
    setEditingExercise(null);
    setTempValues({});
  };

  const cancelEditing = () => {
    setEditingExercise(null);
    setTempValues({});
  };

  const handleCompleteWorkout = async () => {
    if (!allExercisesCompleted) {
      Alert.alert(
        'Incomplete Workout',
        'Please complete all exercises before finishing the workout.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    await completeWorkout(workout.id);
    Alert.alert(
      'Workout Complete!',
      'Great job! Your progress has been saved.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const allExercisesCompleted = workout.exercises.length > 0 && 
    completedExercises.size === workout.exercises.length;

  const intensityColors = {
    low: '#34C759',
    medium: '#FF9500',
    high: '#FF3B30',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { 
          backgroundColor: theme.colors.card, 
          borderBottomColor: theme.colors.border,
          paddingTop: insets.top + 16
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Workout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.workoutHeader, { 
            backgroundColor: theme.colors.card, 
            borderBottomColor: theme.colors.border 
          }]}>
            <Text style={[styles.workoutTitle, { color: theme.colors.text }]}>{workout.title}</Text>
            <Text style={[styles.workoutType, { color: theme.colors.textSecondary }]}>{workout.type}</Text>
            
            <View style={styles.workoutMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>{workout.duration} min</Text>
              </View>
              <View style={[styles.intensityBadge, { backgroundColor: intensityColors[workout.intensity] }]}>
                <Text style={styles.intensityText}>{workout.intensity.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.exercisesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exercises ({workout.exercises.length})</Text>
          
          {workout.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.has(exercise.id) || exercise.completed;
            const isEditing = editingExercise === exercise.id;
            
            return (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                  isCompleted && [styles.exerciseCardCompleted, { 
                    backgroundColor: theme.isDark ? '#1a2e1a' : '#f8f9fa',
                    borderColor: '#34C759'
                  }]
                ]}
              >
                <View style={styles.exerciseHeader}>
                  <View style={[styles.exerciseNumber, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.exerciseNumberText, { color: theme.colors.textSecondary }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={[
                      styles.exerciseName,
                      { color: theme.colors.text },
                      isCompleted && [styles.exerciseNameCompleted, { color: theme.colors.textSecondary }]
                    ]}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseDetails}>
                      {exercise.reps && (
                        <Text style={[styles.exerciseDetail, { color: theme.colors.textSecondary }]}>
                          {exercise.actualReps || exercise.reps} reps
                        </Text>
                      )}
                      {exercise.sets && (
                        <Text style={[styles.exerciseDetail, { color: theme.colors.textSecondary }]}>
                          {exercise.actualSets || exercise.sets} sets
                        </Text>
                      )}
                      {exercise.duration && (
                        <Text style={[styles.exerciseDetail, { color: theme.colors.textSecondary }]}>{exercise.duration}s</Text>
                      )}
                      {exercise.actualWeight && (
                        <Text style={[styles.exerciseDetail, { color: theme.colors.textSecondary }]}>{exercise.actualWeight}kg</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => startEditing(exercise.id, exercise)}
                      style={styles.editButton}
                    >
                      <Edit3 size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleExercise(exercise.id)}>
                      {isCompleted ? (
                        <CheckCircle size={24} color="#34C759" />
                      ) : (
                        <Circle size={24} color="#cccccc" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={[
                  styles.exerciseInstructions,
                  { color: theme.colors.textSecondary },
                  isCompleted && [styles.exerciseInstructionsCompleted, { color: theme.colors.textSecondary }]
                ]}>
                  {exercise.instructions}
                </Text>

                {exercise.notes && (
                  <Text style={[styles.exerciseNotes, { color: theme.colors.textSecondary }]}>Notes: {exercise.notes}</Text>
                )}

                {isEditing && (
                  <View style={[styles.editingPanel, { 
                    backgroundColor: theme.colors.background, 
                    borderColor: theme.colors.border 
                  }]}>
                    <View style={styles.editRow}>
                      {exercise.reps && (
                        <View style={styles.editField}>
                          <Text style={styles.editLabel}>Reps</Text>
                          <TextInput
                            style={styles.editInput}
                            value={tempValues.actualReps?.toString()}
                            onChangeText={(text) => setTempValues(prev => ({ ...prev, actualReps: text }))}
                            keyboardType="numeric"
                            placeholder={exercise.reps?.toString()}
                          />
                        </View>
                      )}
                      {exercise.sets && (
                        <View style={styles.editField}>
                          <Text style={styles.editLabel}>Sets</Text>
                          <TextInput
                            style={styles.editInput}
                            value={tempValues.actualSets?.toString()}
                            onChangeText={(text) => setTempValues(prev => ({ ...prev, actualSets: text }))}
                            keyboardType="numeric"
                            placeholder={exercise.sets?.toString()}
                          />
                        </View>
                      )}
                      <View style={styles.editField}>
                        <Text style={styles.editLabel}>Weight (kg)</Text>
                        <TextInput
                          style={styles.editInput}
                          value={tempValues.actualWeight?.toString()}
                          onChangeText={(text) => setTempValues(prev => ({ ...prev, actualWeight: text }))}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                      </View>
                    </View>
                    <View style={styles.editField}>
                      <Text style={styles.editLabel}>Notes</Text>
                      <TextInput
                        style={[styles.editInput, styles.notesInput]}
                        value={tempValues.notes}
                        onChangeText={(text) => setTempValues(prev => ({ ...prev, notes: text }))}
                        placeholder="Add notes..."
                        multiline
                      />
                    </View>
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={cancelEditing} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={saveEditing} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

            <View style={styles.bottomPadding} />
          </ScrollView>

          <View style={[styles.footer, { 
            backgroundColor: theme.colors.card, 
            borderTopColor: theme.colors.border 
          }]}>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {completedExercises.size} of {workout.exercises.length} exercises completed
            </Text>
            <Button
              title={workout.completed ? "Workout Completed" : "Complete Workout"}
              onPress={handleCompleteWorkout}
              disabled={workout.completed || !allExercisesCompleted}
              style={styles.completeButton}
            />
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  workoutHeader: {
    padding: 24,
    borderBottomWidth: 1,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 16,
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  intensityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  exercisesSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  exerciseCardCompleted: {
    borderColor: '#34C759',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseNameCompleted: {},
  exerciseDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#666666',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  exerciseInstructions: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  exerciseInstructionsCompleted: {
    color: '#999999',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  completeButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
  exerciseNotes: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 8,
  },
  editingPanel: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  editField: {
    flex: 1,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  notesInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});