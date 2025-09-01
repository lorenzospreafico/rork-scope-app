import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { UserProfile, TrainingPlan, DailyWorkout, WorkoutExercise, ExerciseSession, WeeklyCheckIn, ManualActivity } from '@/types/training';
import { EXERCISE_DATABASE } from '@/constants/training-data';

const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  TRAINING_PLAN: 'training_plan',
  IS_AUTHENTICATED: 'is_authenticated',
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const [TrainingProvider, useTraining] = createContextHook(() => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, planData, authData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.TRAINING_PLAN),
        AsyncStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED),
      ]);

      if (authData) {
        setIsAuthenticated(JSON.parse(authData));
      }
      if (profileData) {
        const profile = JSON.parse(profileData);
        // Ensure manualActivities field exists for backward compatibility
        if (!profile.manualActivities) {
          profile.manualActivities = [];
        }
        // Ensure availableEquipment field exists for backward compatibility
        if (!profile.availableEquipment) {
          profile.availableEquipment = [{
            id: 'bodyweight',
            name: 'Bodyweight Only',
            category: 'functional',
            description: 'No equipment needed - use your body weight',
            icon: 'user',
            available: true,
          }];
        }
        setUserProfile(profile);
      }
      if (planData) {
        setTrainingPlan(JSON.parse(planData));
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }, []);

  const saveTrainingPlan = useCallback(async (plan: TrainingPlan) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINING_PLAN, JSON.stringify(plan));
      setTrainingPlan(plan);
    } catch (error) {
      console.error('Error saving training plan:', error);
    }
  }, []);

  const completeWorkout = useCallback(async (workoutId: string, notes?: string) => {
    if (!trainingPlan) return;

    const workout = trainingPlan.dailyWorkouts.find(w => w.id === workoutId);
    if (!workout) return;

    // Update exercise progress
    const updatedExerciseProgress = [...(trainingPlan.exerciseProgress || [])];
    
    workout.exercises.forEach(exercise => {
      if (exercise.completed) {
        let exerciseProgress = updatedExerciseProgress.find(ep => ep.exerciseId === exercise.id);
        
        if (!exerciseProgress) {
          exerciseProgress = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sessions: [],
          };
          updatedExerciseProgress.push(exerciseProgress);
        }

        const session: ExerciseSession = {
          date: new Date().toISOString().split('T')[0],
          sets: [],
          notes: exercise.notes,
        };

        // Create set data based on exercise completion
        const setsCompleted = exercise.actualSets || exercise.sets || 1;
        for (let i = 0; i < setsCompleted; i++) {
          session.sets.push({
            reps: exercise.actualReps || exercise.reps,
            weight: exercise.actualWeight || exercise.weight,
            duration: exercise.duration,
            completed: true,
          });
        }

        exerciseProgress.sessions.push(session);

        // Update personal best
        const currentBest = exerciseProgress.personalBest;
        const newWeight = exercise.actualWeight || exercise.weight;
        const newReps = exercise.actualReps || exercise.reps;
        const newDuration = exercise.duration;

        if (!currentBest || 
            (newWeight && (!currentBest.weight || newWeight > currentBest.weight)) ||
            (newReps && (!currentBest.reps || newReps > currentBest.reps)) ||
            (newDuration && (!currentBest.duration || newDuration > currentBest.duration))) {
          exerciseProgress.personalBest = {
            weight: newWeight,
            reps: newReps,
            duration: newDuration,
            date: new Date().toISOString().split('T')[0],
          };
        }
      }
    });

    const updatedPlan = {
      ...trainingPlan,
      dailyWorkouts: trainingPlan.dailyWorkouts.map(w =>
        w.id === workoutId
          ? {
              ...w,
              completed: true,
              completedAt: new Date().toISOString(),
              notes,
            }
          : w
      ),
      exerciseProgress: updatedExerciseProgress,
    };

    await saveTrainingPlan(updatedPlan);
  }, [trainingPlan, saveTrainingPlan]);

  const updateExerciseInWorkout = useCallback(async (workoutId: string, exerciseId: string, updates: Partial<WorkoutExercise>) => {
    if (!trainingPlan) return;

    const updatedPlan = {
      ...trainingPlan,
      dailyWorkouts: trainingPlan.dailyWorkouts.map(workout =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.map(exercise =>
                exercise.id === exerciseId
                  ? { ...exercise, ...updates }
                  : exercise
              ),
            }
          : workout
      ),
    };

    await saveTrainingPlan(updatedPlan);
  }, [trainingPlan, saveTrainingPlan]);

  const generateTrainingPlan = useCallback((profile: UserProfile): TrainingPlan => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + (profile.timePreference.planDuration * 7));

    // Generate target session duration based on frequency and pillars
    const targetSessionDuration = generateTargetSessionDuration(profile.timePreference.sessionsPerWeek, profile.fitnessPillars.length);

    const dailyWorkouts: DailyWorkout[] = [];
    const currentDate = new Date(startDate);

    // Create a map of existing sports by day for easy lookup
    const existingSportsByDay = new Map<number, typeof profile.existingSports>();
    profile.existingSports.forEach(sport => {
      sport.days.forEach(dayId => {
        if (!existingSportsByDay.has(dayId)) {
          existingSportsByDay.set(dayId, []);
        }
        existingSportsByDay.get(dayId)!.push(sport);
      });
    });

    // Create a balanced weekly schedule that distributes rest days evenly
    const createWeeklySchedule = (availableDays: number[], sessionsPerWeek: number): number[] => {
      const schedule: number[] = [];
      const availableCount = availableDays.length;
      
      if (sessionsPerWeek >= availableCount) {
        // If sessions >= available days, use all available days
        return availableDays;
      }
      
      // Calculate optimal spacing
      const spacing = Math.floor(availableCount / sessionsPerWeek);
      const remainder = availableCount % sessionsPerWeek;
      
      let currentIndex = 0;
      for (let i = 0; i < sessionsPerWeek; i++) {
        schedule.push(availableDays[currentIndex]);
        
        // Add extra spacing for some sessions to distribute remainder
        const extraSpacing = i < remainder ? 1 : 0;
        currentIndex = (currentIndex + spacing + extraSpacing) % availableCount;
      }
      
      return schedule.sort((a, b) => a - b);
    };
    
    // Get available days and create balanced schedule
    const availableDayIds = profile.availableDays.filter(day => day.available).map(day => day.id);
    const weeklySchedule = createWeeklySchedule(availableDayIds, profile.timePreference.sessionsPerWeek);
    
    console.log('Weekly schedule pattern:', weeklySchedule, 'from available days:', availableDayIds);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const availableDay = profile.availableDays.find(day => day.id === dayOfWeek);
      const existingSportsToday = existingSportsByDay.get(dayOfWeek) || [];
      
      // Check if this day should have a workout based on our balanced schedule
      const shouldHaveWorkout = weeklySchedule.includes(dayOfWeek) || existingSportsToday.length > 0;

      // Only schedule workouts if:
      // 1. This day is available for training
      // 2. This day is in our balanced schedule OR has existing sports
      if (availableDay?.available && shouldHaveWorkout) {
        // Always add existing sports (they're fixed commitments)
        if (existingSportsToday.length > 0) {
          
          // Create workouts for existing sports
          existingSportsToday.forEach((sport, index) => {
            const workout: DailyWorkout = {
              id: `existing_sport_${currentDate.getTime()}_${index}`,
              date: currentDate.toISOString().split('T')[0],
              title: sport.name,
              type: sport.category,
              duration: sport.duration,
              intensity: sport.intensity,
              exercises: generateExistingSportExercises(sport),
              completed: false,
            };
            dailyWorkouts.push(workout);
          });

          // Add complementary training if there's time and flexibility
          const totalExistingDuration = existingSportsToday.reduce((sum, sport) => sum + sport.duration, 0);
          const hasFlexibleSports = existingSportsToday.some(sport => sport.flexibility !== 'fixed');
          
          if (totalExistingDuration < targetSessionDuration && hasFlexibleSports) {
            const remainingDuration = targetSessionDuration - totalExistingDuration;
            if (remainingDuration >= 15) { // Only add if at least 15 minutes available
              const complementaryExercises = generateComplementaryExercises(existingSportsToday, profile.fitnessPillars, remainingDuration);
              const actualDuration = calculateWorkoutDuration(complementaryExercises);
              
              const complementaryWorkout: DailyWorkout = {
                id: `complementary_${currentDate.getTime()}`,
                date: currentDate.toISOString().split('T')[0],
                title: generateComplementaryWorkoutTitle(existingSportsToday, profile.fitnessPillars),
                type: 'Complementary Training',
                duration: actualDuration,
                intensity: 'low', // Keep it light to complement existing activities
                exercises: complementaryExercises,
                completed: false,
              };
              dailyWorkouts.push(complementaryWorkout);
            }
          }
        } else {
          // For regular training days - no existing sports
          
          // Regular training day - no existing sports
          const weekNumber = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
          const dayIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
          
          const isCombined = shouldCreateCombinedWorkout(profile.fitnessPillars, weekNumber, dayIndex);
          const workoutExercises = generateExercises(profile.fitnessPillars, targetSessionDuration, weekNumber, dayIndex, profile.availableEquipment);
          const actualDuration = calculateWorkoutDuration(workoutExercises);
          
          // Determine workout type based on exercises and focus
          const workoutType = determineWorkoutType(workoutExercises, profile.fitnessPillars, isCombined);
          
          const workout: DailyWorkout = {
            id: `workout_${currentDate.getTime()}`,
            date: currentDate.toISOString().split('T')[0],
            title: generateWorkoutTitle(profile.fitnessPillars, isCombined ? 'combined' : 'single', weekNumber),
            type: workoutType,
            duration: actualDuration,
            intensity: generateIntensity(profile.habitLevel.changeReadiness),
            exercises: workoutExercises,
            completed: false,
          };
          dailyWorkouts.push(workout);
        }
        
        // No need to track workouts per week since we're using a balanced schedule
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      id: `plan_${Date.now()}`,
      name: 'Your Personalized Plan',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      goals: profile.goals,
      timePreference: profile.timePreference,
      availableDays: profile.availableDays.filter(day => day.available).map(day => day.id),
      dailyWorkouts,
      weeklyProgress: [],
      currentWeek: 1,
      exerciseProgress: [],
    };
  }, []);

  const generateWorkoutTitle = (pillars: any[], workoutType: 'single' | 'combined' = 'single', weekNumber: number = 1): string => {
    if (workoutType === 'combined') {
      const combinedTitles = [
        'Power & Flow', 'Strength & Cardio Fusion', 'Balance & Power', 'Endurance & Mobility',
        'Athletic Hybrid', 'Complete Conditioning', 'Dynamic Duo', 'Fusion Training',
        'Multi-Modal', 'Cross Training', 'Hybrid Power', 'Total Body Fusion'
      ];
      return combinedTitles[Math.floor(Math.random() * combinedTitles.length)];
    }
    
    if (pillars.length === 0) return 'General Fitness';
    
    const primaryPillar = pillars.reduce((prev, current) => 
      (prev.importance > current.importance) ? prev : current
    );
    
    // Expanded title variations with progression themes
    const titleMap: { [key: string]: string[] } = {
      'cardio': [
        'Cardio Blast', 'Heart Pumper', 'Endurance Builder', 'Cardio Crusher', 'Rhythm & Flow',
        'Pulse Raiser', 'Cardio Storm', 'Heart Rate Hero', 'Endurance Express', 'Cardio Circuit',
        'Beat Drop', 'Cardio Ignite', 'Pulse Power', 'Heart Strong', 'Cardio Surge'
      ],
      'strength': [
        'Strength Builder', 'Power Session', 'Muscle Maker', 'Strength Focus', 'Iron Will',
        'Power Hour', 'Strength Stack', 'Muscle Mission', 'Power Play', 'Strength Storm',
        'Muscle Forge', 'Power Pump', 'Strength Surge', 'Iron Core', 'Power Drive'
      ],
      'mobility': [
        'Flexibility Flow', 'Mobility Master', 'Range & Flow', 'Stretch & Restore', 'Fluid Motion',
        'Mobility Magic', 'Flow State', 'Stretch Session', 'Mobility Moment', 'Flex Appeal',
        'Range Rider', 'Mobility Mix', 'Stretch & Strengthen', 'Flow Focus', 'Mobility Mastery'
      ],
      'muscular-endurance': [
        'Endurance Challenge', 'Stamina Builder', 'Endurance Test', 'Staying Power', 'Endurance Edge',
        'Stamina Storm', 'Endurance Engine', 'Marathon Mode', 'Stamina Stack', 'Endurance Elite',
        'Stamina Surge', 'Endurance Express', 'Power Endurance', 'Stamina Strong', 'Endurance Evolution'
      ],
      'balance-stability': [
        'Balance & Control', 'Stability Focus', 'Core & Balance', 'Steady & Strong', 'Balance Boost',
        'Stability Stack', 'Core Control', 'Balance Beam', 'Stability Storm', 'Core Connection',
        'Balance Builder', 'Stability Session', 'Core & Coordination', 'Balance Mastery', 'Stability Strong'
      ],
      'speed': [
        'Speed & Power', 'Quick & Fast', 'Explosive Training', 'Speed Demon', 'Lightning Fast',
        'Speed Storm', 'Quick Strike', 'Explosive Edge', 'Speed Session', 'Fast & Furious',
        'Speed Surge', 'Quick Fire', 'Explosive Power', 'Speed Stack', 'Lightning Bolt'
      ],
    };
    
    const titles = titleMap[primaryPillar.id] || ['Fitness Focus'];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const calculateExerciseDuration = (exercise: WorkoutExercise): number => {
    let totalTime = 0;
    
    if (exercise.duration) {
      // Duration-based exercise (e.g., plank, running)
      const sets = exercise.sets || 1;
      const restTime = exercise.restTime || 30;
      
      // Convert duration to seconds if it's in minutes (assume values > 300 are in seconds)
      const durationInSeconds = exercise.duration > 300 ? exercise.duration : exercise.duration * 60;
      
      totalTime = (durationInSeconds * sets) + (restTime * (sets - 1));
    } else if (exercise.reps) {
      // Rep-based exercise
      const sets = exercise.sets || 1;
      const reps = exercise.reps;
      const restTime = exercise.restTime || 45;
      
      // Estimate time per rep based on exercise difficulty and type
      let timePerRep = 2; // Default 2 seconds per rep
      
      // Adjust based on exercise characteristics
      if (exercise.targetMuscles.includes('cardiovascular')) {
        timePerRep = 1; // Faster cardio movements
      } else if (exercise.difficulty === 'advanced' || exercise.name.toLowerCase().includes('slow')) {
        timePerRep = 3; // Slower, more controlled movements
      } else if (exercise.name.toLowerCase().includes('explosive') || exercise.name.toLowerCase().includes('jump')) {
        timePerRep = 1.5; // Quick explosive movements
      }
      
      const workTime = reps * timePerRep * sets;
      const restTimeTotal = restTime * (sets - 1);
      
      totalTime = workTime + restTimeTotal;
    } else {
      // Fallback for exercises without clear duration or reps
      totalTime = 180; // 3 minutes default
    }
    
    return Math.ceil(totalTime / 60); // Convert to minutes and round up
  };
  
  const calculateWorkoutDuration = (exercises: WorkoutExercise[]): number => {
    if (exercises.length === 0) return 30;
    
    let totalDuration = 0;
    
    // Calculate time for each exercise
    exercises.forEach(exercise => {
      totalDuration += calculateExerciseDuration(exercise);
    });
    
    // Add warm-up time (5 minutes for most workouts)
    totalDuration += 5;
    
    // Add cool-down time (3-5 minutes depending on workout length)
    const coolDownTime = totalDuration > 30 ? 5 : 3;
    totalDuration += coolDownTime;
    
    // Add transition time between exercises (30 seconds per exercise)
    const transitionTime = Math.ceil((exercises.length - 1) * 0.5);
    totalDuration += transitionTime;
    
    // Round to nearest 5 minutes for cleaner presentation
    return Math.ceil(totalDuration / 5) * 5;
  };
  
  const generateTargetSessionDuration = (sessionsPerWeek: number, pillarCount: number): number => {
    // This is now used as a target for exercise selection, not final duration
    let targetDuration = 30; // Default 30 minutes
    
    if (sessionsPerWeek <= 2) {
      targetDuration = 45; // Longer sessions for less frequent training
    } else if (sessionsPerWeek >= 5) {
      targetDuration = 25; // Shorter sessions for more frequent training
    }
    
    // Adjust for number of pillars (more pillars = slightly longer sessions)
    if (pillarCount >= 3) {
      targetDuration += 10;
    }
    
    return Math.min(targetDuration, 60); // Cap at 60 minutes
  };

  const determineWorkoutType = (exercises: WorkoutExercise[], pillars: any[], isCombined: boolean): string => {
    if (isCombined) return 'Combined Focus';
    
    // Analyze exercises to determine the actual focus
    const muscleGroups = exercises.flatMap(ex => ex.targetMuscles);
    const cardioCount = muscleGroups.filter(m => m.includes('cardiovascular')).length;
    const strengthCount = muscleGroups.filter(m => ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'quadriceps', 'glutes', 'hamstrings'].some(muscle => m.includes(muscle))).length;
    const mobilityCount = muscleGroups.filter(m => m.includes('flexibility') || m.includes('mobility')).length;
    
    if (cardioCount > strengthCount && cardioCount > mobilityCount) return 'Cardio Focus';
    if (strengthCount > cardioCount && strengthCount > mobilityCount) return 'Strength Focus';
    if (mobilityCount > 0) return 'Mobility Focus';
    
    // Fallback to primary pillar
    const primaryPillar = pillars.reduce((prev: any, current: any) => 
      (prev.importance > current.importance) ? prev : current
    );
    return primaryPillar?.name || 'General Fitness';
  };
  
  const generateIntensity = (changeReadiness: number): 'low' | 'medium' | 'high' => {
    if (changeReadiness >= 4) return 'low';
    if (changeReadiness >= 2) return 'medium';
    return 'high';
  };

  const generateExistingSportExercises = (sport: any): WorkoutExercise[] => {
    // Create a simple exercise entry for existing sports
    return [{
      id: `existing_${sport.id}_${Date.now()}`,
      name: sport.name,
      duration: sport.duration * 60, // Convert to seconds
      instructions: `Complete your ${sport.name} session as planned. Track your performance and any notes.`,
      difficulty: sport.intensity === 'high' ? 'advanced' : sport.intensity === 'medium' ? 'intermediate' : 'beginner',
      targetMuscles: getCategoryMuscles(sport.category),
      completed: false,
    }];
  };

  const generateComplementaryWorkoutTitle = (existingSports: any[], pillars: any[]): string => {
    const sportCategories = existingSports.map(sport => sport.category);
    
    if (sportCategories.includes('cardio')) {
      return 'Recovery & Mobility';
    }
    if (sportCategories.includes('strength')) {
      return 'Cardio Finisher';
    }
    if (sportCategories.includes('flexibility')) {
      return 'Strength Activation';
    }
    
    return 'Balanced Complement';
  };

  const generateComplementaryExercises = (existingSports: any[], pillars: any[], duration: number): WorkoutExercise[] => {
    const exerciseCount = Math.max(2, Math.min(4, Math.floor(duration / 10))); // 2-4 exercises for complementary work
    const exercises: WorkoutExercise[] = [];
    const sportCategories = existingSports.map(sport => sport.category);
    
    // Choose complementary exercises based on existing sports
    let complementaryPool: WorkoutExercise[] = [];
    
    if (sportCategories.includes('cardio')) {
      // Add mobility and flexibility after cardio
      complementaryPool = [...EXERCISE_DATABASE.mobility, ...EXERCISE_DATABASE['balance-stability']];
    } else if (sportCategories.includes('strength')) {
      // Add light cardio after strength
      complementaryPool = EXERCISE_DATABASE.cardio.filter(ex => ex.difficulty === 'beginner');
    } else if (sportCategories.includes('flexibility')) {
      // Add activation exercises after flexibility
      complementaryPool = [...EXERCISE_DATABASE['muscular-endurance'], ...EXERCISE_DATABASE['balance-stability']];
    } else {
      // General complementary work
      complementaryPool = [...EXERCISE_DATABASE['balance-stability'], ...EXERCISE_DATABASE.mobility];
    }
    
    // Select exercises
    const usedExercises = new Set<string>();
    for (let i = 0; i < exerciseCount && complementaryPool.length > 0; i++) {
      let attempts = 0;
      let selectedExercise: WorkoutExercise;
      
      do {
        const randomIndex = Math.floor(Math.random() * complementaryPool.length);
        selectedExercise = complementaryPool[randomIndex];
        attempts++;
      } while (usedExercises.has(selectedExercise.id) && attempts < 10);
      
      if (!usedExercises.has(selectedExercise.id)) {
        usedExercises.add(selectedExercise.id);
        exercises.push({
          ...selectedExercise,
          id: `${selectedExercise.id}_comp_${Date.now()}_${i}`,
          completed: false,
        });
      }
    }
    
    return exercises;
  };

  const getCategoryMuscles = (category: string): string[] => {
    switch (category) {
      case 'cardio': return ['cardiovascular system', 'legs', 'core'];
      case 'strength': return ['full body', 'major muscle groups'];
      case 'flexibility': return ['full body', 'joints', 'connective tissue'];
      case 'sports': return ['sport-specific muscles', 'coordination'];
      case 'functional': return ['core', 'stabilizers', 'movement patterns'];
      default: return ['general fitness'];
    }
  };

  const mapPillarToExerciseCategory = (pillarId: string): string => {
    switch (pillarId) {
      case 'cardio': return 'cardio';
      case 'strength': return 'strength';
      case 'mobility': return 'mobility';
      case 'muscular-endurance': return 'muscular-endurance';
      case 'balance-stability': return 'balance-stability';
      case 'speed': return 'speed';
      default: return 'strength';
    }
  };

  const shouldCreateCombinedWorkout = (pillars: any[], weekNumber: number, dayIndex: number): boolean => {
    // More sophisticated logic for combined workouts
    if (pillars.length < 2) return false;
    
    // Increase combined workout frequency as weeks progress
    const baseChance = 0.25; // 25% base chance
    const weekBonus = Math.min(weekNumber * 0.05, 0.15); // Up to 15% bonus by week 3
    const dayVariation = (dayIndex % 3 === 0) ? 0.1 : 0; // Every 3rd day gets bonus
    
    const totalChance = baseChance + weekBonus + dayVariation;
    return Math.random() < totalChance;
  };
  
  const selectCombinedFocus = (pillars: any[]): string => {
    // Sort pillars by importance and pick top 2
    const sortedPillars = [...pillars].sort((a, b) => b.importance - a.importance);
    const primary = sortedPillars[0]?.id || 'strength';
    const secondary = sortedPillars[1]?.id || 'cardio';
    
    // Define valid combinations
    const combinations = [
      'cardio-strength',
      'strength-mobility', 
      'balance-strength'
    ];
    
    // Try to find a matching combination
    const combo1 = `${primary}-${secondary}`;
    const combo2 = `${secondary}-${primary}`;
    
    if (combinations.includes(combo1)) return combo1;
    if (combinations.includes(combo2)) return combo2;
    
    // Default to cardio-strength if no match
    return 'cardio-strength';
  };
  
  const generateExercises = (pillars: any[], targetDuration: number, weekNumber: number = 1, dayIndex: number = 0, availableEquipment?: any[]): WorkoutExercise[] => {
    // More sophisticated exercise selection with variety tracking
    let exerciseCount = Math.max(3, Math.min(8, Math.floor(targetDuration / 6)));
    const usedExercises = new Set<string>();
    
    // Decide workout focus with more variety
    const isCombined = shouldCreateCombinedWorkout(pillars, weekNumber, dayIndex);
    const workoutFocus = selectWorkoutFocus(pillars, weekNumber, dayIndex, isCombined);
    
    let availableExercises: WorkoutExercise[] = [];
    
    if (isCombined && workoutFocus.type === 'combined') {
      // Combined workout
      if (EXERCISE_DATABASE[workoutFocus.focus]) {
        availableExercises = [...EXERCISE_DATABASE[workoutFocus.focus]];
        console.log(`Generated combined workout: ${workoutFocus.focus}`);
      }
    } else {
      // Single focus or multi-pillar workout
      availableExercises = buildExercisePool(pillars, workoutFocus, exerciseCount);
      console.log(`Generated ${workoutFocus.type} workout: ${workoutFocus.focus}`);
    }
    
    // Fallback if no exercises available
    if (availableExercises.length === 0) {
      availableExercises = getDefaultExercisePool();
    }
    
    // Filter exercises based on available equipment
    const equipmentFilteredExercises = filterExercisesByEquipment(availableExercises, availableEquipment);
    
    // Select exercises with better variety logic
    const selectedExercises = selectVariedExercises(equipmentFilteredExercises, exerciseCount, targetDuration, usedExercises);
    
    return selectedExercises;
  };
  
  const selectWorkoutFocus = (pillars: any[], weekNumber: number, dayIndex: number, isCombined: boolean) => {
    if (isCombined) {
      return {
        type: 'combined' as const,
        focus: selectCombinedFocus(pillars)
      };
    }
    
    // Rotate through pillars more systematically
    const sortedPillars = [...pillars].sort((a, b) => b.importance - a.importance);
    
    // Use day index and week to create variety
    const focusIndex = (dayIndex + weekNumber) % sortedPillars.length;
    const primaryPillar = sortedPillars[focusIndex] || sortedPillars[0];
    
    // Occasionally do multi-pillar focus (not combined exercises, but mixed)
    const shouldMixPillars = sortedPillars.length > 2 && Math.random() < 0.3;
    
    return {
      type: shouldMixPillars ? 'multi-pillar' as const : 'single' as const,
      focus: primaryPillar.id,
      secondary: shouldMixPillars ? sortedPillars[(focusIndex + 1) % sortedPillars.length]?.id : undefined
    };
  };
  
  const buildExercisePool = (pillars: any[], workoutFocus: any, exerciseCount: number): WorkoutExercise[] => {
    const pool: WorkoutExercise[] = [];
    
    if (workoutFocus.type === 'multi-pillar' && workoutFocus.secondary) {
      // Multi-pillar workout: mix exercises from multiple pillars
      const primaryKey = mapPillarToExerciseCategory(workoutFocus.focus);
      const secondaryKey = mapPillarToExerciseCategory(workoutFocus.secondary);
      
      if (EXERCISE_DATABASE[primaryKey]) {
        pool.push(...EXERCISE_DATABASE[primaryKey]);
      }
      if (EXERCISE_DATABASE[secondaryKey]) {
        pool.push(...EXERCISE_DATABASE[secondaryKey]);
      }
      
      // Add a third pillar occasionally for variety
      if (pillars.length > 2 && Math.random() < 0.4) {
        const sortedPillars = [...pillars].sort((a, b) => b.importance - a.importance);
        const tertiaryPillar = sortedPillars[2];
        if (tertiaryPillar) {
          const tertiaryKey = mapPillarToExerciseCategory(tertiaryPillar.id);
          if (EXERCISE_DATABASE[tertiaryKey]) {
            pool.push(...EXERCISE_DATABASE[tertiaryKey].slice(0, 2)); // Just a few exercises
          }
        }
      }
    } else {
      // Single pillar focus
      const pillarKey = mapPillarToExerciseCategory(workoutFocus.focus);
      if (EXERCISE_DATABASE[pillarKey]) {
        pool.push(...EXERCISE_DATABASE[pillarKey]);
        
        // Add some variety from related pillars
        const relatedPillars = getRelatedPillars(workoutFocus.focus);
        relatedPillars.forEach(relatedKey => {
          if (EXERCISE_DATABASE[relatedKey] && Math.random() < 0.3) {
            pool.push(...EXERCISE_DATABASE[relatedKey].slice(0, 2));
          }
        });
      }
    }
    
    return pool;
  };
  
  const getRelatedPillars = (pillarId: string): string[] => {
    const relations: { [key: string]: string[] } = {
      'cardio': ['muscular-endurance', 'speed'],
      'strength': ['muscular-endurance', 'balance-stability'],
      'mobility': ['balance-stability'],
      'muscular-endurance': ['cardio', 'strength'],
      'balance-stability': ['mobility', 'strength'],
      'speed': ['cardio', 'strength']
    };
    return relations[pillarId] || [];
  };
  
  const getDefaultExercisePool = (): WorkoutExercise[] => {
    return [
      ...EXERCISE_DATABASE.strength.slice(0, 3),
      ...EXERCISE_DATABASE.cardio.slice(0, 3),
      ...EXERCISE_DATABASE.mobility.slice(0, 2)
    ];
  };
  
  const selectVariedExercises = (pool: WorkoutExercise[], targetCount: number, targetDuration: number, usedExercises: Set<string>): WorkoutExercise[] => {
    const exercises: WorkoutExercise[] = [];
    let currentDuration = 0;
    const maxAttempts = 30;
    let attempts = 0;
    
    // Group exercises by difficulty and type for better selection
    const exercisesByDifficulty = {
      beginner: pool.filter(ex => ex.difficulty === 'beginner'),
      intermediate: pool.filter(ex => ex.difficulty === 'intermediate'),
      advanced: pool.filter(ex => ex.difficulty === 'advanced')
    };
    
    // Ensure variety in difficulty levels
    const difficultyDistribution = {
      beginner: Math.ceil(targetCount * 0.4),
      intermediate: Math.ceil(targetCount * 0.4),
      advanced: Math.floor(targetCount * 0.2)
    };
    
    // Select exercises with difficulty variety
    for (const [difficulty, count] of Object.entries(difficultyDistribution)) {
      const availableExercises = exercisesByDifficulty[difficulty as keyof typeof exercisesByDifficulty];
      let selected = 0;
      
      while (selected < count && availableExercises.length > 0 && attempts < maxAttempts) {
        attempts++;
        const randomIndex = Math.floor(Math.random() * availableExercises.length);
        const selectedExercise = availableExercises[randomIndex];
        
        if (!usedExercises.has(selectedExercise.id)) {
          const exerciseWithId = {
            ...selectedExercise,
            id: `${selectedExercise.id}_${Date.now()}_${exercises.length}`,
            completed: false,
          };
          
          const exerciseDuration = calculateExerciseDuration(exerciseWithId);
          
          if (currentDuration + exerciseDuration <= targetDuration + 15) {
            usedExercises.add(selectedExercise.id);
            exercises.push(exerciseWithId);
            currentDuration += exerciseDuration;
            selected++;
          }
        }
        
        if (exercises.length >= targetCount) break;
      }
    }
    
    // Fill remaining slots if needed
    while (exercises.length < Math.max(3, targetCount) && attempts < maxAttempts) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedExercise = pool[randomIndex];
      
      if (!usedExercises.has(selectedExercise.id)) {
        const exerciseWithId = {
          ...selectedExercise,
          id: `${selectedExercise.id}_${Date.now()}_${exercises.length}`,
          completed: false,
        };
        
        usedExercises.add(selectedExercise.id);
        exercises.push(exerciseWithId);
      }
    }
    
    return exercises;
  };
  
  const filterExercisesByEquipment = (exercises: WorkoutExercise[], availableEquipment?: any[]): WorkoutExercise[] => {
    if (!availableEquipment || availableEquipment.length === 0) {
      // If no equipment specified, return bodyweight exercises only
      return exercises.filter(exercise => 
        !exercise.requiredEquipment || 
        exercise.requiredEquipment.length === 0 ||
        exercise.requiredEquipment.includes('bodyweight')
      );
    }
    
    const availableEquipmentIds = availableEquipment.map(eq => eq.id);
    
    return exercises.filter(exercise => {
      // If exercise has no equipment requirements, it's always available
      if (!exercise.requiredEquipment || exercise.requiredEquipment.length === 0) {
        return true;
      }
      
      // Check if all required equipment is available
      return exercise.requiredEquipment.every(requiredId => 
        availableEquipmentIds.includes(requiredId)
      );
    });
  };

  const signIn = useCallback(async (userData?: { fullName: string; email: string }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(true));
      setIsAuthenticated(true);
      
      // If user data is provided, create a basic profile
      if (userData) {
        const basicProfile: Partial<UserProfile> = {
          fullName: userData.fullName,
          email: userData.email,
          goals: [],
          fitnessPillars: [],
          timePreference: { planDuration: 4, sessionsPerWeek: 3 },
          habitLevel: { id: '', name: '', description: '', changeReadiness: 3 },
          availableDays: [],
          blackoutDates: [],
          limitations: [],
          existingSports: [],
          onboardingCompleted: false,
          weeklyCheckIns: [],
          manualActivities: [],
          availableEquipment: [{
            id: 'bodyweight',
            name: 'Bodyweight Only',
            category: 'functional',
            description: 'No equipment needed - use your body weight',
            icon: 'user',
            available: true,
          }],
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(basicProfile));
        setUserProfile(basicProfile as UserProfile);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.removeItem(STORAGE_KEYS.TRAINING_PLAN),
      ]);
      setIsAuthenticated(false);
      setUserProfile(null);
      setTrainingPlan(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const shouldShowWeeklyCheckIn = useCallback((): boolean => {
    if (!userProfile || !trainingPlan) return false;
    
    const planStartDate = new Date(trainingPlan.startDate);
    const now = new Date();
    const timeSinceStart = now.getTime() - planStartDate.getTime();
    const weeksSinceStart = Math.floor(timeSinceStart / WEEK_IN_MS);
    
    // Show check-in after 1 week and then every week
    if (weeksSinceStart < 1) return false;
    
    // Check if we've already shown check-in for this week
    const lastCheckInPrompt = userProfile.lastCheckInPrompt ? new Date(userProfile.lastCheckInPrompt) : null;
    const weeksSinceLastPrompt = lastCheckInPrompt ? 
      Math.floor((now.getTime() - lastCheckInPrompt.getTime()) / WEEK_IN_MS) : Infinity;
    
    // Show if it's been at least a week since last prompt
    return weeksSinceLastPrompt >= 1;
  }, [userProfile, trainingPlan]);

  const submitWeeklyCheckIn = useCallback(async (checkInData: Omit<WeeklyCheckIn, 'id' | 'date' | 'weekNumber'>) => {
    if (!userProfile || !trainingPlan) return;
    
    const now = new Date();
    const planStartDate = new Date(trainingPlan.startDate);
    const weekNumber = Math.floor((now.getTime() - planStartDate.getTime()) / WEEK_IN_MS) + 1;
    
    const checkIn: WeeklyCheckIn = {
      id: `checkin_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      weekNumber,
      ...checkInData,
    };
    
    // Update user profile with check-in data
    const updatedProfile: UserProfile = {
      ...userProfile,
      weeklyCheckIns: [...(userProfile.weeklyCheckIns || []), checkIn],
      lastCheckInPrompt: now.toISOString(),
    };
    
    // Apply adjustments if any were made
    if (checkInData.adjustmentsMade) {
      // Update pillar importance
      if (checkInData.responses.focusAdjustments.length > 0) {
        updatedProfile.fitnessPillars = updatedProfile.fitnessPillars.map(pillar => {
          const adjustment = checkInData.responses.focusAdjustments.find(adj => adj.pillarId === pillar.id);
          return adjustment ? { ...pillar, importance: adjustment.newImportance } : pillar;
        });
      }
      
      // Update session duration preference
      if (checkInData.responses.sessionDurationPreference !== 'same') {
        const currentDuration = updatedProfile.timePreference.sessionsPerWeek;
        let newDuration = currentDuration;
        
        if (checkInData.responses.sessionDurationPreference === 'shorter') {
          // Reduce session duration by increasing frequency (if possible) or just reducing time
          newDuration = Math.min(currentDuration + 1, 7);
        } else if (checkInData.responses.sessionDurationPreference === 'longer') {
          // Increase session duration by reducing frequency (if possible)
          newDuration = Math.max(currentDuration - 1, 2);
        }
        
        updatedProfile.timePreference = {
          ...updatedProfile.timePreference,
          sessionsPerWeek: newDuration,
        };
      }
      
      // Regenerate training plan with updated preferences
      const newPlan = generateTrainingPlan(updatedProfile);
      await saveTrainingPlan(newPlan);
    }
    
    await saveUserProfile(updatedProfile);
  }, [userProfile, trainingPlan, generateTrainingPlan, saveUserProfile, saveTrainingPlan]);

  const markCheckInPromptShown = useCallback(async () => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      lastCheckInPrompt: new Date().toISOString(),
    };
    
    await saveUserProfile(updatedProfile);
  }, [userProfile, saveUserProfile]);

  const logManualActivity = useCallback(async (activityData: Omit<ManualActivity, 'id' | 'loggedAt'>) => {
    if (!userProfile) return;
    
    const activity: ManualActivity = {
      ...activityData,
      id: `manual_activity_${Date.now()}`,
      loggedAt: new Date().toISOString(),
    };
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      manualActivities: [...(userProfile.manualActivities || []), activity],
    };
    
    await saveUserProfile(updatedProfile);
  }, [userProfile, saveUserProfile]);

  return useMemo(() => ({
    userProfile,
    trainingPlan,
    isAuthenticated,
    isLoading,
    saveUserProfile,
    saveTrainingPlan,
    completeWorkout,
    updateExerciseInWorkout,
    generateTrainingPlan,
    signIn,
    signOut,
    shouldShowWeeklyCheckIn,
    submitWeeklyCheckIn,
    markCheckInPromptShown,
    logManualActivity,
  }), [userProfile, trainingPlan, isAuthenticated, isLoading, saveUserProfile, saveTrainingPlan, completeWorkout, updateExerciseInWorkout, generateTrainingPlan, signIn, signOut, shouldShowWeeklyCheckIn, submitWeeklyCheckIn, markCheckInPromptShown, logManualActivity]);
});