import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/theme-store';
import { Equipment } from '@/types/training';
import { AVAILABLE_EQUIPMENT } from '@/constants/training-data';
import { ChevronLeft, Check } from 'lucide-react-native';
import Button from '@/components/ui/Button';

interface EquipmentSelectionProps {
  onNext: (equipment: Equipment[]) => void;
  onBack: () => void;
}

export default function EquipmentSelection({ onNext, onBack }: EquipmentSelectionProps) {
  const { theme } = useTheme();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>(
    AVAILABLE_EQUIPMENT.filter(eq => eq.id === 'bodyweight')
  );

  const toggleEquipment = (equipment: Equipment) => {
    if (equipment.id === 'bodyweight') {
      return;
    }
    
    setSelectedEquipment(prev => {
      const isSelected = prev.some(eq => eq.id === equipment.id);
      if (isSelected) {
        return prev.filter(eq => eq.id !== equipment.id);
      } else {
        return [...prev, { ...equipment, available: true }];
      }
    });
  };

  const isSelected = (equipmentId: string) => {
    return selectedEquipment.some(eq => eq.id === equipmentId);
  };

  const handleNext = () => {
    onNext(selectedEquipment);
  };

  const equipmentByCategory = AVAILABLE_EQUIPMENT.reduce((acc, equipment) => {
    if (!acc[equipment.category]) {
      acc[equipment.category] = [];
    }
    acc[equipment.category].push(equipment);
    return acc;
  }, {} as Record<string, Equipment[]>);

  const categoryNames = {
    strength: 'Strength Equipment',
    cardio: 'Cardio Equipment',
    flexibility: 'Flexibility & Recovery',
    functional: 'Functional Training'
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Equipment Access</Text>
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Select the equipment you have access to. This helps us create workouts tailored to your setup.
      </Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(equipmentByCategory).map(([category, equipment]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
              {categoryNames[category as keyof typeof categoryNames]}
            </Text>
            
            <View style={styles.equipmentGrid}>
              {equipment.map((item) => {
                const selected = isSelected(item.id);
                const isBodyweight = item.id === 'bodyweight';
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.equipmentCard,
                      {
                        backgroundColor: selected 
                          ? theme.colors.primary + '20'
                          : theme.colors.surface,
                        borderColor: selected 
                          ? theme.colors.primary
                          : theme.colors.border,
                        opacity: isBodyweight ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => toggleEquipment(item)}
                    disabled={isBodyweight}
                  >
                    {selected && (
                      <View style={[styles.checkIcon, { backgroundColor: theme.colors.primary }]}>
                        <Check size={16} color="white" />
                      </View>
                    )}
                    
                    <Text style={[styles.equipmentName, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    
                    <Text style={[styles.equipmentDescription, { color: theme.colors.textSecondary }]}>
                      {item.description}
                    </Text>
                    
                    {isBodyweight && (
                      <Text style={[styles.alwaysIncluded, { color: theme.colors.primary }]}>
                        Always included
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          style={styles.continueButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  equipmentGrid: {
    gap: 12,
  },
  equipmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  equipmentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  alwaysIncluded: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 20,
  },
  footer: {
    paddingVertical: 20,
  },
  continueButton: {
    marginTop: 0,
  },
});