import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';

// Advanced retention system for maximum user engagement
export interface RetentionStrategy {
  // Engagement triggers
  triggers: {
    streakMilestones: number[];
    habitCompletions: number[];
    timeBased: string[];
    behaviorBased: string[];
  };
  
  // Reward system
  rewards: {
    achievements: Achievement[];
    badges: Badge[];
    unlocks: Unlock[];
  };
  
  // Notification strategy
  notifications: {
    morning: string[];
    evening: string[];
    milestone: string[];
    motivational: string[];
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  category: string;
}

export interface Unlock {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'theme' | 'insight' | 'template';
  unlocked: boolean;
  requirement: string;
}

export const RETENTION_STRATEGY: RetentionStrategy = {
  triggers: {
    streakMilestones: [3, 7, 14, 21, 30, 60, 90, 100, 365],
    habitCompletions: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    timeBased: ['morning', 'evening', 'weekend', 'monthly'],
    behaviorBased: ['first_habit', 'first_streak', 'first_ai_use', 'first_share']
  },
  
  rewards: {
    achievements: [
      {
        id: 'first_habit',
        title: 'Getting Started',
        description: 'Created your first habit',
        icon: '🎯',
        rarity: 'common',
        reward: 'Unlock AI insights',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Achieved a 7-day streak',
        icon: '🏆',
        rarity: 'rare',
        reward: 'Premium analytics',
        unlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: 'month_master',
        title: 'Month Master',
        description: 'Achieved a 30-day streak',
        icon: '👑',
        rarity: 'legendary',
        reward: 'Elite status',
        unlocked: false,
        progress: 0,
        maxProgress: 30
      },
      {
        id: 'habit_hunter',
        title: 'Habit Hunter',
        description: 'Completed 100 habits',
        icon: '🎖️',
        rarity: 'epic',
        reward: 'Custom themes',
        unlocked: false,
        progress: 0,
        maxProgress: 100
      }
    ],
    badges: [
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete habits before 8 AM',
        icon: '🌅',
        color: '#FFD700',
        unlocked: false,
        category: 'time'
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete habits after 10 PM',
        icon: '🦉',
        color: '#4B0082',
        unlocked: false,
        category: 'time'
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Maintain streaks on weekends',
        icon: '⚔️',
        color: '#FF6347',
        unlocked: false,
        category: 'consistency'
      }
    ],
    unlocks: [
      {
        id: 'ai_insights',
        name: 'AI Insights',
        description: 'Get personalized habit recommendations',
        type: 'feature',
        unlocked: false,
        requirement: 'Complete first habit'
      },
      {
        id: 'dark_theme',
        name: 'Dark Theme',
        description: 'Beautiful dark mode interface',
        type: 'theme',
        unlocked: false,
        requirement: 'Achieve 7-day streak'
      },
      {
        id: 'habit_templates',
        name: 'Habit Templates',
        description: 'Pre-made habit templates',
        type: 'template',
        unlocked: false,
        requirement: 'Complete 10 habits'
      }
    ]
  },
  
  notifications: {
    morning: [
      'Good morning! Ready to conquer today? 🌅',
      'Your habits are waiting for you! ⚡',
      'Start your day with a win! 🎯',
      'Morning habits = better day ahead! ☀️'
    ],
    evening: [
      'How did your day go? Check in with your habits! 🌙',
      'Evening reflection time! 📝',
      'Complete your habits before bed! 😴',
      'End your day on a high note! ✨'
    ],
    milestone: [
      'Amazing! You\'ve hit a new streak! 🔥',
      'Incredible progress! Keep it up! 🚀',
      'You\'re on fire! This streak is legendary! 👑',
      'Outstanding! You\'re in the top 1%! 🏆'
    ],
    motivational: [
      'Consistency is the key to success! 💪',
      'Every small step counts! 🌟',
      'You\'re building something amazing! 🏗️',
      'Progress, not perfection! 📈'
    ]
  }
};

export const useRetentionSystem = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(RETENTION_STRATEGY.rewards.achievements);
  const [badges, setBadges] = useState<Badge[]>(RETENTION_STRATEGY.rewards.badges);
  const [unlocks, setUnlocks] = useState<Unlock[]>(RETENTION_STRATEGY.rewards.unlocks);
  const [notifications, setNotifications] = useState<boolean>(true);

  // Check for achievement unlocks
  const checkAchievements = useCallback((habits: any[], streaks: number[], completions: number) => {
    const newAchievements = [...achievements];
    let hasNewAchievement = false;

    // First habit achievement
    if (habits.length >= 1 && !newAchievements[0].unlocked) {
      newAchievements[0].unlocked = true;
      newAchievements[0].progress = 1;
      hasNewAchievement = true;
    }

    // Streak achievements
    const maxStreak = Math.max(...streaks, 0);
    if (maxStreak >= 7 && !newAchievements[1].unlocked) {
      newAchievements[1].unlocked = true;
      newAchievements[1].progress = Math.min(maxStreak, 7);
      hasNewAchievement = true;
    }

    if (maxStreak >= 30 && !newAchievements[2].unlocked) {
      newAchievements[2].unlocked = true;
      newAchievements[2].progress = Math.min(maxStreak, 30);
      hasNewAchievement = true;
    }

    // Completion achievements
    const totalCompletions = completions;
    if (totalCompletions >= 100 && !newAchievements[3].unlocked) {
      newAchievements[3].unlocked = true;
      newAchievements[3].progress = Math.min(totalCompletions, 100);
      hasNewAchievement = true;
    }

    if (hasNewAchievement) {
      setAchievements(newAchievements);
      // Show achievement notification
      const unlockedAchievement = newAchievements.find(a => a.unlocked && a.progress === a.maxProgress);
      if (unlockedAchievement) {
        Alert.alert(
          '🎉 Achievement Unlocked!',
          `${unlockedAchievement.title}\n${unlockedAchievement.description}\n\nReward: ${unlockedAchievement.reward}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    }
  }, [achievements]);

  // Check for badge unlocks
  const checkBadges = useCallback((habits: any[], completions: any[]) => {
    const newBadges = [...badges];
    let hasNewBadge = false;

    // Early bird badge (habits completed before 8 AM)
    const earlyCompletions = completions.filter(c => {
      const hour = new Date(c.timestamp).getHours();
      return hour < 8;
    });
    
    if (earlyCompletions.length >= 5 && !newBadges[0].unlocked) {
      newBadges[0].unlocked = true;
      hasNewBadge = true;
    }

    // Night owl badge (habits completed after 10 PM)
    const nightCompletions = completions.filter(c => {
      const hour = new Date(c.timestamp).getHours();
      return hour >= 22;
    });
    
    if (nightCompletions.length >= 5 && !newBadges[1].unlocked) {
      newBadges[1].unlocked = true;
      hasNewBadge = true;
    }

    if (hasNewBadge) {
      setBadges(newBadges);
      const unlockedBadge = newBadges.find(b => b.unlocked);
      if (unlockedBadge) {
        Alert.alert(
          '🏆 Badge Earned!',
          `${unlockedBadge.name}\n${unlockedBadge.description}`,
          [{ text: 'Cool!', style: 'default' }]
        );
      }
    }
  }, [badges]);

  // Check for feature unlocks
  const checkUnlocks = useCallback((achievements: Achievement[]) => {
    const newUnlocks = [...unlocks];
    let hasNewUnlock = false;

    // AI insights unlock
    if (achievements[0].unlocked && !newUnlocks[0].unlocked) {
      newUnlocks[0].unlocked = true;
      hasNewUnlock = true;
    }

    // Dark theme unlock
    if (achievements[1].unlocked && !newUnlocks[1].unlocked) {
      newUnlocks[1].unlocked = true;
      hasNewUnlock = true;
    }

    // Habit templates unlock
    if (achievements[3].unlocked && !newUnlocks[2].unlocked) {
      newUnlocks[2].unlocked = true;
      hasNewUnlock = true;
    }

    if (hasNewUnlock) {
      setUnlocks(newUnlocks);
      const unlockedFeature = newUnlocks.find(u => u.unlocked);
      if (unlockedFeature) {
        Alert.alert(
          '🔓 Feature Unlocked!',
          `${unlockedFeature.name}\n${unlockedFeature.description}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    }
  }, [unlocks]);

  // Send motivational notifications
  const sendNotification = useCallback(async (type: 'morning' | 'evening' | 'milestone' | 'motivational') => {
    if (!notifications) return;

    const messages = RETENTION_STRATEGY.notifications[type];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // For now, just log the notification (expo-notifications not installed)
    console.log('Notification:', randomMessage);
    
    // In production, implement actual notifications
    // try {
    //   await Notifications.scheduleNotificationAsync({
    //     content: {
    //       title: 'Soluna',
    //       body: randomMessage,
    //       sound: 'default',
    //     },
    //     trigger: type === 'morning' ? { hour: 8, minute: 0, repeats: true } : 
    //              type === 'evening' ? { hour: 20, minute: 0, repeats: true } : null,
    //   });
    // } catch (error) {
    //   console.log('Notification error:', error);
    // }
  }, [notifications]);

  // Get user's retention score
  const getRetentionScore = useCallback(() => {
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const unlockedBadges = badges.filter(b => b.unlocked).length;
    const unlockedFeatures = unlocks.filter(u => u.unlocked).length;
    
    const totalPossible = achievements.length + badges.length + unlocks.length;
    const unlocked = unlockedAchievements + unlockedBadges + unlockedFeatures;
    
    return Math.round((unlocked / totalPossible) * 100);
  }, [achievements, badges, unlocks]);

  // Get personalized recommendations
  const getRecommendations = useCallback(() => {
    const score = getRetentionScore();
    const recommendations = [];

    if (score < 25) {
      recommendations.push('Complete your first habit to unlock AI insights!');
      recommendations.push('Try the morning routine template');
    } else if (score < 50) {
      recommendations.push('Build a 7-day streak to unlock premium analytics!');
      recommendations.push('Explore different habit categories');
    } else if (score < 75) {
      recommendations.push('Achieve a 30-day streak for elite status!');
      recommendations.push('Share your progress with friends');
    } else {
      recommendations.push('You\'re a habit master! Help others get started');
      recommendations.push('Try advanced habit stacking techniques');
    }

    return recommendations;
  }, [getRetentionScore]);

  return {
    achievements,
    badges,
    unlocks,
    notifications,
    checkAchievements,
    checkBadges,
    checkUnlocks,
    sendNotification,
    getRetentionScore,
    getRecommendations,
    setNotifications,
  };
};
