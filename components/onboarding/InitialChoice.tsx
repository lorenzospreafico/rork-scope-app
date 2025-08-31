import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, Trophy } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme-store';

interface InitialChoiceProps {
  onNext: (choice: 'sport' | 'fitness') => void;
}

export default function InitialChoice({ onNext }: InitialChoiceProps) {
  const { theme } = useTheme();
  const [selectedChoice, setSelectedChoice] = useState<'sport' | 'fitness' | null>(null);

  const handleChoiceSelection = (choice: 'sport' | 'fitness') => {
    setSelectedChoice(choice);
    // Add a small delay for visual feedback
    setTimeout(() => {
      onNext(choice);
    }, 150);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>I want to build a fitness plan around...</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Choose your focus to get the most personalized training experience
      </Text>

      <View style={styles.choicesContainer}>
        <TouchableOpacity
          style={[
            styles.choiceCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            selectedChoice === 'sport' && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
          ]}
          onPress={() => handleChoiceSelection('sport')}
          activeOpacity={0.8}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.background },
            selectedChoice === 'sport' && { backgroundColor: 'rgba(255,255,255,0.2)' }
          ]}>
            <Trophy
              size={32}
              color={selectedChoice === 'sport' ? '#ffffff' : theme.colors.accent}
            />
          </View>
          <Text style={[
            styles.choiceTitle,
            { color: theme.colors.text },
            selectedChoice === 'sport' && { color: '#ffffff' }
          ]}>
            A specific sport
          </Text>
          <Text style={[
            styles.choiceDescription,
            { color: theme.colors.textSecondary },
            selectedChoice === 'sport' && { color: '#cccccc' }
          ]}>
            I practice a sport regularly and want to build a plan to sustain it
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.choiceCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            selectedChoice === 'fitness' && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
          ]}
          onPress={() => handleChoiceSelection('fitness')}
          activeOpacity={0.8}
        >
          <View style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.background },
            selectedChoice === 'fitness' && { backgroundColor: 'rgba(255,255,255,0.2)' }
          ]}>
            <Target
              size={32}
              color={selectedChoice === 'fitness' ? '#ffffff' : theme.colors.accent}
            />
          </View>
          <Text style={[
            styles.choiceTitle,
            { color: theme.colors.text },
            selectedChoice === 'fitness' && { color: '#ffffff' }
          ]}>
            Not interested in a sport - I just want to get a tailored fitness plan
          </Text>
          <Text style={[
            styles.choiceDescription,
            { color: theme.colors.textSecondary },
            selectedChoice === 'fitness' && { color: '#cccccc' }
          ]}>
            I want to build my perfect fitness plan without focusing on a specific sport
          </Text>
        </TouchableOpacity>
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
  choicesContainer: {
    flex: 1,
    gap: 20,
  },
  choiceCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  choiceTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  choiceDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});