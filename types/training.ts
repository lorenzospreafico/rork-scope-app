export interface TrainingGoal {
  id: string;
  name: string;
  description: string;
  icon: string;
  selected: boolean;
  importance?: number; // 1-5 scale, 5 being most important
}

export interface SportChoice {
  id: string;
  name: string;
  description: string;
  icon: string;
  recommendedPillars: {
    pillarId: string;
    importance: number;
  }[];
}

export interface FitnessPillar {
  id: string;
  name: string;
  description: string;
  icon: string;
  selected: boolean;
  importance?: number; // 1-5 scale, 5 being most important
  autoSelected?: boolean; // true if selected based on sport choice
}

export interface TimePreference {
  planDuration: number; // weeks
  sessionsPerWeek: number;
}

export interface HabitLevel {
  id: string;
  name: string;
  description: string;
  changeReadiness: number; // 1-5 scale
}

export interface WeekDay {
  id: number;
  name: string;
  short: string;
  available: boolean;
}

export interface PhysicalLimitation {
  id: string;
  area: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  duration?: number; // minutes or seconds
  reps?: number;
  sets?: number;
  restTime?: number; // seconds
  instructions: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetMuscles: string[];
  weight?: number; // for tracking progressive overload
  completed?: boolean;
  actualReps?: number;
  actualSets?: number;
  actualWeight?: number;
  notes?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  sessions: ExerciseSession[];
  personalBest?: {
    weight?: number;
    reps?: number;
    duration?: number;
    date: string;
  };
}

export interface ExerciseSession {
  date: string;
  sets: SetData[];
  notes?: string;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface SetData {
  reps?: number;
  weight?: number;
  duration?: number;
  completed: boolean;
  restTime?: number;
}

export interface DailyWorkout {
  id: string;
  date: string;
  title: string;
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  exercises: WorkoutExercise[];
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WeeklyProgress {
  weekNumber: number;
  startDate: string;
  endDate: string;
  completedWorkouts: number;
  totalWorkouts: number;
  totalMinutes: number;
  averageIntensity: number;
  achievements: string[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goals: TrainingGoal[];
  timePreference: TimePreference;
  availableDays: number[];
  dailyWorkouts: DailyWorkout[];
  weeklyProgress: WeeklyProgress[];
  currentWeek: number;
  exerciseProgress: ExerciseProgress[];
}

export interface ExistingSport {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'functional';
  frequency: number; // times per week
  duration: number; // minutes per session
  days: number[]; // day IDs when they do this sport
  flexibility: 'fixed' | 'somewhat-flexible' | 'very-flexible'; // willingness to change
  intensity: 'low' | 'medium' | 'high';
  description?: string;
}

export interface WeeklyCheckIn {
  id: string;
  date: string;
  weekNumber: number;
  responses: {
    satisfaction: number; // 1-5 scale
    difficultyLevel: number; // 1-5 scale
    timeCommitment: 'too-short' | 'just-right' | 'too-long';
    focusAdjustments: {
      pillarId: string;
      newImportance: number;
    }[];
    sessionDurationPreference: 'shorter' | 'same' | 'longer';
    additionalFeedback?: string;
  };
  adjustmentsMade: boolean;
}

export interface ManualActivity {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'functional';
  duration: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  notes: string;
  date: string;
  loggedAt: string; // ISO date string when it was logged
}

export interface UserProfile {
  fullName: string;
  email: string;
  goals: TrainingGoal[];
  fitnessPillars: FitnessPillar[];
  selectedSport?: SportChoice;
  timePreference: TimePreference;
  habitLevel: HabitLevel;
  availableDays: WeekDay[];
  blackoutDates: string[];
  limitations: PhysicalLimitation[];
  existingSports: ExistingSport[];
  onboardingCompleted: boolean;
  weeklyCheckIns: WeeklyCheckIn[];
  lastCheckInPrompt?: string; // ISO date string
  manualActivities: ManualActivity[];
}