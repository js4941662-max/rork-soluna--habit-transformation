import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import type { User, Habit } from '@/types';

// Performance constants for optimal performance
const PERFORMANCE_CONFIG = {
  BATCH_SIZE: 10,
  DEBOUNCE_DELAY: 300,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  MEMORY_CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
} as const;

const STORAGE_KEYS = {
  USER: 'soluna_user_v4',
  HABITS: 'soluna_habits_v4',
  AI_BOOSTS: 'soluna_ai_boosts_v4',
  LAST_RESET: 'soluna_last_reset_v4',
  CACHE: 'soluna_cache_v4'
} as const;

const DEFAULT_USER: User = {
  id: '1',
  name: 'User',
  email: 'user@example.com',
  isPremium: false,
  avatar: undefined,
  createdAt: new Date(),
  subscriptionId: undefined,
  customerId: undefined,
  joinedAt: new Date().toDateString(),
  dailyAiBoosts: 3,
  lastAiBoostReset: new Date().toDateString(),
  hasCompletedOnboarding: false,
  totalSpent: 0,
  lifetimeValue: 0,
  churnRisk: 'low',
  lastActiveAt: new Date(),
  streakRecord: 0,
  achievementCount: 0,
};

const HABIT_LIMIT_FREE = 6;
const DAILY_AI_BOOSTS_FREE = 3;
const DAILY_AI_BOOSTS_PREMIUM = 50;

// Optimized emoji detection with memoization
const emojiCache = new Map<string, string>();
const getHabitEmoji = (title: string): string => {
  const titleLower = title.toLowerCase();
  
  if (emojiCache.has(titleLower)) {
    return emojiCache.get(titleLower)!;
  }
  
  let emoji = '🎯'; // Default
  
  // Fitness & Health
  if (titleLower.includes('gym') || titleLower.includes('workout') || titleLower.includes('exercise')) emoji = '💪';
  else if (titleLower.includes('run') || titleLower.includes('jog')) emoji = '🏃';
  else if (titleLower.includes('walk') || titleLower.includes('dog')) emoji = '🚶';
  else if (titleLower.includes('yoga') || titleLower.includes('stretch')) emoji = '🧘';
  else if (titleLower.includes('water') || titleLower.includes('hydrat')) emoji = '💧';
  else if (titleLower.includes('sleep') || titleLower.includes('bed')) emoji = '😴';
  else if (titleLower.includes('eat') || titleLower.includes('meal') || titleLower.includes('nutrition')) emoji = '🥗';
  // Learning & Productivity
  else if (titleLower.includes('read') || titleLower.includes('book')) emoji = '📚';
  else if (titleLower.includes('write') || titleLower.includes('journal')) emoji = '✍️';
  else if (titleLower.includes('meditat')) emoji = '🧘‍♀️';
  else if (titleLower.includes('learn') || titleLower.includes('study')) emoji = '🎓';
  else if (titleLower.includes('code') || titleLower.includes('program')) emoji = '💻';
  // Creative & Personal
  else if (titleLower.includes('art') || titleLower.includes('draw') || titleLower.includes('paint')) emoji = '🎨';
  else if (titleLower.includes('music') || titleLower.includes('instrument')) emoji = '🎵';
  else if (titleLower.includes('clean') || titleLower.includes('organize')) emoji = '🧹';
  else if (titleLower.includes('call') || titleLower.includes('family') || titleLower.includes('friend')) emoji = '📞';
  
  emojiCache.set(titleLower, emoji);
  return emoji;
};

export const [SolunaProvider, useSoluna] = createContextHook(() => {
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyAIBoosts, setDailyAIBoosts] = useState<number>(DAILY_AI_BOOSTS_FREE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Performance optimization refs
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);

  // Advanced caching system
  const getCachedData = useCallback((key: string) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < PERFORMANCE_CONFIG.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, { data, timestamp: Date.now() });
  }, []);

  // Debounced save function for performance
  const debouncedSave = useCallback((key: string, data: any, saveFunction: (data: any) => Promise<void>) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(async () => {
      try {
        await saveFunction(data);
        setCachedData(key, data);
        lastSaveRef.current = Date.now();
      } catch (error) {
        console.error(`Failed to save ${key}:`, error);
      }
    }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
  }, [setCachedData]);

  // Memory cleanup function
  const cleanupMemory = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of cacheRef.current.entries()) {
      if (now - value.timestamp > PERFORMANCE_CONFIG.CACHE_DURATION) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  // Optimized data initialization with batch loading and caching
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check cache first
        const cachedUser = getCachedData('user');
        const cachedHabits = getCachedData('habits');
        const cachedBoosts = getCachedData('ai_boosts');
        
        if (cachedUser && cachedHabits && cachedBoosts) {
          setUser(cachedUser);
          setHabits(cachedHabits);
          setDailyAIBoosts(cachedBoosts);
          setIsLoading(false);
          return;
        }
        
        // Batch load all storage keys for better performance
        const [storedUser, storedHabits, storedBoosts, lastResetDate] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.HABITS),
          AsyncStorage.getItem(STORAGE_KEYS.AI_BOOSTS),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET)
        ]);
        
        // Process user data with error handling
        let processedUser = DEFAULT_USER;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            processedUser = { 
              ...parsedUser, 
              createdAt: new Date(parsedUser.createdAt),
              joinedAt: parsedUser.joinedAt || new Date(parsedUser.createdAt).toDateString()
            };
          } catch (parseError) {
            console.warn('Failed to parse user data, using defaults');
          }
        }
        setUser(processedUser);
        setCachedData('user', processedUser);

        // Process habits data with optimized parsing
        let processedHabits: Habit[] = [];
        if (storedHabits) {
          try {
            processedHabits = JSON.parse(storedHabits).map((habit: any) => ({
              ...habit,
              createdAt: new Date(habit.createdAt),
            }));
          } catch (parseError) {
            console.warn('Failed to parse habits data, using empty array');
          }
        }
        setHabits(processedHabits);
        setCachedData('habits', processedHabits);

        // Handle daily AI boosts reset with optimization
        const today = new Date().toDateString();
        const shouldReset = lastResetDate !== today;
        const newBoosts = shouldReset 
          ? (processedUser.isPremium ? DAILY_AI_BOOSTS_PREMIUM : DAILY_AI_BOOSTS_FREE)
          : (storedBoosts ? parseInt(storedBoosts, 10) : DAILY_AI_BOOSTS_FREE);
        
        setDailyAIBoosts(newBoosts);
        setCachedData('ai_boosts', newBoosts);
        
        if (shouldReset) {
          // Batch write operations for better performance
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.AI_BOOSTS, newBoosts.toString()),
            AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET, today)
          ]);
        }
        
        retryCountRef.current = 0; // Reset retry count on success
      } catch (err) {
        console.error('Failed to initialize data:', err);
        
        // Retry logic with exponential backoff
        if (retryCountRef.current < PERFORMANCE_CONFIG.MAX_RETRIES) {
          retryCountRef.current++;
          setTimeout(() => initializeData(), Math.pow(2, retryCountRef.current) * 1000);
          return;
        }
        
        setError('Failed to load your data. Please restart the app.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [getCachedData, setCachedData]);

  // Memory cleanup effect
  useEffect(() => {
    const cleanupInterval = setInterval(cleanupMemory, PERFORMANCE_CONFIG.MEMORY_CLEANUP_INTERVAL);
    return () => clearInterval(cleanupInterval);
  }, [cleanupMemory]);

  // Optimized save functions with caching and debouncing
  const saveUser = useCallback(async (userData: User) => {
    try {
      setCachedData('user', userData);
      debouncedSave('user', userData, async (data) => {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
        setUser(data);
      });
    } catch (err) {
      console.error('Failed to save user:', err);
      setError('Failed to save user data.');
    }
  }, [setCachedData, debouncedSave]);

  const saveHabits = useCallback(async (habitsData: Habit[]) => {
    try {
      setCachedData('habits', habitsData);
      debouncedSave('habits', habitsData, async (data) => {
        await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(data));
        setHabits(data);
      });
    } catch (err) {
      console.error('Failed to save habits:', err);
      setError('Failed to save habits.');
    }
  }, [setCachedData, debouncedSave]);

  // Optimized habit operations
  const addHabit = useCallback(async (title: string, emoji?: string, category?: string): Promise<boolean> => {
    try {
      if (!user.isPremium && habits.length >= HABIT_LIMIT_FREE) {
        return false;
      }

      const smartEmoji = emoji || getHabitEmoji(title);
      const habitCategory = category || 'Personal';

      const newHabit: Habit = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique ID
        title: title.trim(),
        emoji: smartEmoji,
        category: habitCategory,
        streak: 0,
        isCompleted: false,
        completedDates: [],
        createdAt: new Date(),
        bestStreak: 0,
        totalCompletions: 0,
      };

      const updatedHabits = [...habits, newHabit];
      await saveHabits(updatedHabits);
      return true;
    } catch (err) {
      console.error('Failed to add habit:', err);
      setError('Failed to add habit.');
      return false;
    }
  }, [habits, user.isPremium, saveHabits]);

  // Optimized habit toggle with batch updates
  const toggleHabit = useCallback(async (habitId: string) => {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      const updatedHabits = habits.map(habit => {
        if (habit.id !== habitId) return habit;
        
        const isCurrentlyCompleted = habit.completedDates?.includes(today) || false;
        let newCompletedDates: string[];
        let newStreak = habit.streak;
        let newTotalCompletions = habit.totalCompletions || 0;

        if (isCurrentlyCompleted) {
          // Uncomplete the habit
          newCompletedDates = habit.completedDates?.filter(date => date !== today) || [];
          const wasCompletedYesterday = habit.completedDates?.includes(yesterday) || false;
          newStreak = wasCompletedYesterday ? Math.max(0, habit.streak - 1) : 0;
          newTotalCompletions = Math.max(0, newTotalCompletions - 1);
        } else {
          // Complete the habit
          newCompletedDates = [...(habit.completedDates || []), today];
          const wasCompletedYesterday = habit.completedDates?.includes(yesterday) || false;
          newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;
          newTotalCompletions = newTotalCompletions + 1;
        }

        const newBestStreak = Math.max(habit.bestStreak || 0, newStreak);

        return {
          ...habit,
          isCompleted: !isCurrentlyCompleted,
          completedDates: newCompletedDates,
          streak: Math.max(0, newStreak),
          bestStreak: newBestStreak,
          totalCompletions: newTotalCompletions,
        };
      });

      await saveHabits(updatedHabits);
    } catch (err) {
      console.error('Failed to toggle habit:', err);
      setError('Failed to update habit.');
    }
  }, [habits, saveHabits]);

  // Optimized delete habit
  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      const updatedHabits = habits.filter(habit => habit.id !== habitId);
      await saveHabits(updatedHabits);
    } catch (err) {
      console.error('Failed to delete habit:', err);
      setError('Failed to delete habit.');
    }
  }, [habits, saveHabits]);

  // Optimized utility functions
  const canAddHabit = useCallback((): boolean => {
    return user.isPremium || habits.length < HABIT_LIMIT_FREE;
  }, [user.isPremium, habits.length]);

  const getHabitLimit = useCallback((): number => {
    return user.isPremium ? Infinity : HABIT_LIMIT_FREE;
  }, [user.isPremium]);

  // Optimized AI boost usage
  const useAIBoost = useCallback(async (): Promise<boolean> => {
    try {
      if (dailyAIBoosts <= 0) {
        return false;
      }

      const newBoosts = dailyAIBoosts - 1;
      setDailyAIBoosts(newBoosts);
      setCachedData('ai_boosts', newBoosts);
      
      // Debounced save for AI boosts
      debouncedSave('ai_boosts', newBoosts, async (data) => {
        await AsyncStorage.setItem(STORAGE_KEYS.AI_BOOSTS, data.toString());
      });
      
      return true;
    } catch (err) {
      console.error('Failed to use AI boost:', err);
      setError('Failed to use AI boost.');
      return false;
    }
  }, [dailyAIBoosts, setCachedData, debouncedSave]);

  // Optimized user operations
  const updateUserAvatar = useCallback(async (avatarUri: string) => {
    try {
      const updatedUser = { ...user, avatar: avatarUri };
      await saveUser(updatedUser);
    } catch (err) {
      console.error('Failed to update avatar:', err);
      setError('Failed to update profile picture.');
    }
  }, [user, saveUser]);

  const updateUserName = useCallback(async (name: string) => {
    try {
      const updatedUser = { ...user, name: name.trim() };
      await saveUser(updatedUser);
    } catch (err) {
      console.error('Failed to update name:', err);
      setError('Failed to update name.');
    }
  }, [user, saveUser]);

  // Optimized sign out with cleanup
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.HABITS,
        STORAGE_KEYS.AI_BOOSTS,
        STORAGE_KEYS.LAST_RESET,
      ]);
      
      // Clear cache
      cacheRef.current.clear();
      
      // Reset state to defaults
      setUser(DEFAULT_USER);
      setHabits([]);
      setDailyAIBoosts(DAILY_AI_BOOSTS_FREE);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Failed to sign out:', err);
      setError('Failed to sign out. Please try again.');
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Optimized premium upgrade
  const upgradeToPremium = useCallback(async (subscriptionId: string, customerId: string) => {
    try {
      const updatedUser = {
        ...user,
        isPremium: true,
        subscriptionId,
        customerId,
      };
      await saveUser(updatedUser);
      
      // Reset AI boosts to premium amount
      const newBoosts = DAILY_AI_BOOSTS_PREMIUM;
      setDailyAIBoosts(newBoosts);
      setCachedData('ai_boosts', newBoosts);
      
      debouncedSave('ai_boosts', newBoosts, async (data) => {
        await AsyncStorage.setItem(STORAGE_KEYS.AI_BOOSTS, data.toString());
      });
    } catch (err) {
      console.error('Failed to upgrade to premium:', err);
      setError('Failed to upgrade account.');
    }
  }, [user, saveUser, setCachedData, debouncedSave]);

  // Optimized reset function
  const resetUserData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.HABITS,
        STORAGE_KEYS.AI_BOOSTS,
        STORAGE_KEYS.LAST_RESET,
      ]);
      
      cacheRef.current.clear();
      
      setUser(DEFAULT_USER);
      setHabits([]);
      setDailyAIBoosts(DAILY_AI_BOOSTS_FREE);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Failed to reset user data:', err);
      setError('Failed to reset user data.');
      return false;
    }
  }, []);

  // Highly optimized analytics with memoization
  const getAnalytics = useCallback(() => {
    const today = new Date().toDateString();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return date.toDateString();
    }).reverse();

    const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
    const totalHabits = habits.length;
    const activeHabits = habits.filter(h => h.streak > 0).length;
    const totalCompletions = habits.reduce((sum, h) => sum + (h.totalCompletions || 0), 0);
    const averageStreak = habits.length > 0 ? habits.reduce((sum, h) => sum + h.streak, 0) / habits.length : 0;
    const successRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const weeklyData = last7Days.map(date => {
      const completed = habits.filter(h => h.completedDates?.includes(date)).length;
      return { date, completed, total: totalHabits };
    });

    const categoryData = habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topStreaks = [...habits]
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 5)
      .map(h => ({ name: h.title, streak: h.streak, emoji: h.emoji }));

    return {
      completedToday,
      totalHabits,
      activeHabits,
      totalCompletions,
      averageStreak: Math.round(averageStreak * 10) / 10,
      successRate,
      weeklyData,
      categoryData,
      topStreaks,
    };
  }, [habits]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      cacheRef.current.clear();
    };
  }, []);

  return useMemo(() => ({
    // State
    user,
    habits,
    dailyAIBoosts,
    isLoading,
    error,
    
    // Actions
    addHabit,
    toggleHabit,
    deleteHabit,
    canAddHabit,
    getHabitLimit,
    useAIBoost,
    updateUserAvatar,
    updateUserName,
    signOut,
    clearError,
    upgradeToPremium,
    getAnalytics,
    saveUser,
    resetUserData,
  }), [
    user,
    habits,
    dailyAIBoosts,
    isLoading,
    error,
    addHabit,
    toggleHabit,
    deleteHabit,
    canAddHabit,
    getHabitLimit,
    useAIBoost,
    updateUserAvatar,
    updateUserName,
    signOut,
    clearError,
    upgradeToPremium,
    getAnalytics,
    saveUser,
    resetUserData,
  ]);
});