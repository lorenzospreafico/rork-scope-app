import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Plus, X, Calendar, Clock, Zap } from 'lucide-react-native';
import { ExistingSport } from '@/types/training';
import { WEEK_DAYS } from '@/constants/training-data';
import Button from '@/components/ui/Button';
import { useTheme } from '@/hooks/theme-store';

interface ExistingSportsProps {
  onNext: (existingSports: ExistingSport[]) => void;
  onBack: () => void;
}

const SPORT_CATEGORIES = [
  { id: 'cardio', name: 'Cardio', icon: '🏃' },
  { id: 'strength', name: 'Strength', icon: '💪' },
  { id: 'flexibility', name: 'Flexibility', icon: '🧘' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
] as const;

const FLEXIBILITY_OPTIONS = [
  { id: 'fixed', name: 'Fixed Schedule', description: 'I can\'t change when I do this' },
  { id: 'somewhat-flexible', name: 'Somewhat Flexible', description: 'I could adjust timing if needed' },
  { id: 'very-flexible', name: 'Very Flexible', description: 'I\'m open to changing this completely' },
] as const;

const INTENSITY_OPTIONS = [
  { id: 'low', name: 'Low', color: '#10b981' },
  { id: 'medium', name: 'Medium', color: '#f59e0b' },
  { id: 'high', name: 'High', color: '#ef4444' },
] as const;

export default function ExistingSports({ onNext, onBack }: ExistingSportsProps) {
  const { theme } = useTheme();
  const [existingSports, setExistingSports] = useState<ExistingSport[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSport, setNewSport] = useState<Partial<ExistingSport>>({
    name: '',
    category: 'cardio',
    frequency: 1,
    duration: 30,
    days: [],
    flexibility: 'somewhat-flexible',
    intensity: 'medium',
  });

  const addSport = () => {
    if (!newSport.name?.trim()) return;
    
    const sport: ExistingSport = {
      id: Date.now().toString(),
      name: newSport.name.trim(),
      category: newSport.category || 'cardio',
      frequency: newSport.frequency || 1,
      duration: newSport.duration || 30,
      days: newSport.days || [],
      flexibility: newSport.flexibility || 'somewhat-flexible',
      intensity: newSport.intensity || 'medium',
    };
    
    setExistingSports(prev => [...prev, sport]);
    setNewSport({
      name: '',
      category: 'cardio',
      frequency: 1,
      duration: 30,
      days: [],
      flexibility: 'somewhat-flexible',
      intensity: 'medium',
    });
    setShowAddModal(false);
  };

  const removeSport = (id: string) => {
    setExistingSports(prev => prev.filter(sport => sport.id !== id));
  };

  const toggleDay = (dayId: number) => {
    setNewSport(prev => ({
      ...prev,
      days: prev.days?.includes(dayId) 
        ? prev.days.filter(id => id !== dayId)
        : [...(prev.days || []), dayId]
    }));
  };

  const handleNext = () => {
    onNext(existingSports);
  };

  const getDayName = (dayId: number) => {
    return WEEK_DAYS.find(day => day.id === dayId)?.short || '';
  };

  const getFlexibilityColor = (flexibility: string) => {
    switch (flexibility) {
      case 'fixed': return '#ef4444';
      case 'somewhat-flexible': return '#f59e0b';
      case 'very-flexible': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Current Activities</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Tell us about any sports or activities you already do regularly
      </Text>

      {existingSports.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No activities added yet</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Add any sports, workouts, or activities you currently do to help us create a better plan
          </Text>
        </View>
      ) : (
        <View style={styles.sportsContainer}>
          {existingSports.map(sport => (
            <View key={sport.id} style={[styles.sportCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.sportHeader}>
                <View style={styles.sportInfo}>
                  <Text style={[styles.sportName, { color: theme.colors.text }]}>{sport.name}</Text>
                  <Text style={[styles.sportCategory, { color: theme.colors.textSecondary }]}>
                    {SPORT_CATEGORIES.find(cat => cat.id === sport.category)?.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeSport(sport.id)}
                  style={styles.removeButton}
                >
                  <X size={16} color="#666666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.sportDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={14} color="#666666" />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    {sport.frequency}x/week on {sport.days.map(getDayName).join(', ')}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#666666" />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{sport.duration} minutes</Text>
                </View>
                <View style={styles.detailRow}>
                  <Zap size={14} color={INTENSITY_OPTIONS.find(i => i.id === sport.intensity)?.color} />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    {INTENSITY_OPTIONS.find(i => i.id === sport.intensity)?.name} intensity
                  </Text>
                </View>
              </View>
              
              <View style={[styles.flexibilityBadge, { backgroundColor: getFlexibilityColor(sport.flexibility) + '20' }]}>
                <Text style={[styles.flexibilityText, { color: getFlexibilityColor(sport.flexibility) }]}>
                  {FLEXIBILITY_OPTIONS.find(f => f.id === sport.flexibility)?.name}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus size={20} color={theme.colors.text} />
        <Text style={[styles.addButtonText, { color: theme.colors.text }]}>Add Activity</Text>
      </TouchableOpacity>

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
            style={styles.continueButton}
          />
        </View>
      </View>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add Activity</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Activity Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
                value={newSport.name}
                onChangeText={(text) => setNewSport(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Tennis, Yoga, Running"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {SPORT_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: theme.colors.surface },
                      newSport.category === category.id && styles.categoryCardSelected
                    ]}
                    onPress={() => setNewSport(prev => ({ ...prev, category: category.id as any }))}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryName,
                      { color: theme.colors.text },
                      newSport.category === category.id && styles.categoryNameSelected
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Times per week</Text>
                <View style={[styles.numberInputContainer, { backgroundColor: theme.colors.surface }]}>
                  <TouchableOpacity
                    style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => setNewSport(prev => ({ ...prev, frequency: Math.max(1, (prev.frequency || 1) - 1) }))}
                  >
                    <Text style={[styles.numberButtonText, { color: theme.colors.text }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.numberValue, { color: theme.colors.text }]}>{newSport.frequency}</Text>
                  <TouchableOpacity
                    style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => setNewSport(prev => ({ ...prev, frequency: Math.min(7, (prev.frequency || 1) + 1) }))}
                  >
                    <Text style={[styles.numberButtonText, { color: theme.colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Duration (min)</Text>
                <View style={[styles.numberInputContainer, { backgroundColor: theme.colors.surface }]}>
                  <TouchableOpacity
                    style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => setNewSport(prev => ({ ...prev, duration: Math.max(15, (prev.duration || 30) - 15) }))}
                  >
                    <Text style={[styles.numberButtonText, { color: theme.colors.text }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.numberValue, { color: theme.colors.text }]}>{newSport.duration}</Text>
                  <TouchableOpacity
                    style={[styles.numberButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => setNewSport(prev => ({ ...prev, duration: Math.min(180, (prev.duration || 30) + 15) }))}
                  >
                    <Text style={[styles.numberButtonText, { color: theme.colors.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Which days?</Text>
              <View style={styles.daysGrid}>
                {WEEK_DAYS.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      { backgroundColor: theme.colors.surface },
                      newSport.days?.includes(day.id) && styles.dayButtonSelected
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      { color: theme.colors.text },
                      newSport.days?.includes(day.id) && styles.dayButtonTextSelected
                    ]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Intensity</Text>
              <View style={styles.intensityRow}>
                {INTENSITY_OPTIONS.map(intensity => (
                  <TouchableOpacity
                    key={intensity.id}
                    style={[
                      styles.intensityButton,
                      { backgroundColor: theme.colors.surface, borderColor: intensity.color },
                      newSport.intensity === intensity.id && { backgroundColor: intensity.color + '20' }
                    ]}
                    onPress={() => setNewSport(prev => ({ ...prev, intensity: intensity.id as any }))}
                  >
                    <Text style={[
                      styles.intensityText,
                      { color: intensity.color },
                      newSport.intensity === intensity.id && { fontWeight: '600' }
                    ]}>
                      {intensity.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>How flexible is your schedule?</Text>
              <View style={styles.flexibilityContainer}>
                {FLEXIBILITY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.flexibilityOption,
                      { backgroundColor: theme.colors.surface },
                      newSport.flexibility === option.id && styles.flexibilityOptionSelected
                    ]}
                    onPress={() => setNewSport(prev => ({ ...prev, flexibility: option.id as any }))}
                  >
                    <Text style={[
                      styles.flexibilityOptionTitle,
                      { color: theme.colors.text },
                      newSport.flexibility === option.id && styles.flexibilityOptionTitleSelected
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.flexibilityOptionDesc,
                      { color: theme.colors.textSecondary },
                      newSport.flexibility === option.id && styles.flexibilityOptionDescSelected
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
            <Button
              title="Add Activity"
              onPress={addSport}
              disabled={!newSport.name?.trim() || (newSport.days?.length || 0) === 0}
              style={styles.addModalButton}
            />
          </View>
        </View>
      </Modal>
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  sportsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  sportCard: {
    borderRadius: 16,
    padding: 16,
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sportInfo: {
    flex: 1,
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sportCategory: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 4,
  },
  sportDetails: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
  },
  flexibilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  flexibilityText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: 90,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: '#ff6b35',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  categoryNameSelected: {
    color: '#ff6b35',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayButtonSelected: {
    borderColor: '#ff6b35',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#ff6b35',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  intensityButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  flexibilityContainer: {
    gap: 12,
  },
  flexibilityOption: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  flexibilityOptionSelected: {
    borderColor: '#ff6b35',
  },
  flexibilityOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  flexibilityOptionTitleSelected: {
    color: '#ff6b35',
  },
  flexibilityOptionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  flexibilityOptionDescSelected: {
    color: '#ff6b35',
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  addModalButton: {
    width: '100%',
  },
});