import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Sparkles, 
  Trophy, 
  Star, 
  Zap, 
  Heart,
  Target,
  TrendingUp,
  Award,
  Gem
} from 'lucide-react-native';
import { colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

// Award-winning micro-interactions
export const MicroInteractions = {
  // Celebration animations
  celebration: {
    confetti: true,
    particleEffects: true,
    hapticFeedback: true,
    soundEffects: true,
  },
  
  // Smooth transitions
  transitions: {
    duration: 300,
    easing: 'ease-in-out',
    spring: { tension: 100, friction: 8 },
  },
  
  // Loading states
  loading: {
    skeleton: true,
    shimmer: true,
    progress: true,
  }
};

// Premium onboarding flow
export const PremiumOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animations, setAnimations] = useState({
    fadeIn: new Animated.Value(0),
    slideUp: new Animated.Value(50),
    scale: new Animated.Value(0.8),
  });

  const steps = [
    {
      icon: <Target size={48} color={colors.accent} />,
      title: "Track Unlimited Habits",
      description: "Break free from limitations and build the life you want",
      value: "Worth $50/month"
    },
    {
      icon: <Zap size={48} color={colors.accent} />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations to accelerate your progress",
      value: "Worth $30/month"
    },
    {
      icon: <TrendingUp size={48} color={colors.accent} />,
      title: "Advanced Analytics",
      description: "See your transformation with detailed progress reports",
      value: "Worth $20/month"
    },
    {
      icon: <Crown size={48} color={colors.accent} />,
      title: "Elite Status",
      description: "Join the top 1% of habit transformers worldwide",
      value: "Priceless"
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animations.fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animations.slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(animations.scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  return (
    <View style={styles.onboardingContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.stepContainer,
            {
              opacity: animations.fadeIn,
              transform: [
                { translateY: animations.slideUp },
                { scale: animations.scale }
              ]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            {steps[currentStep].icon}
          </View>
          
          <Text style={styles.stepTitle}>
            {steps[currentStep].title}
          </Text>
          
          <Text style={styles.stepDescription}>
            {steps[currentStep].description}
          </Text>
          
          <View style={styles.valueBadge}>
            <Text style={styles.valueText}>
              {steps[currentStep].value}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.activeDot
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

// Achievement system
export const AchievementSystem = () => {
  const achievements = [
    {
      id: 'first_habit',
      title: 'Getting Started',
      description: 'Created your first habit',
      icon: <Target size={24} color={colors.accent} />,
      reward: 'Unlock AI insights',
      rarity: 'common'
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: '7-day streak achieved',
      icon: <Trophy size={24} color={colors.accent} />,
      reward: 'Premium analytics',
      rarity: 'rare'
    },
    {
      id: 'month_master',
      title: 'Month Master',
      description: '30-day streak achieved',
      icon: <Crown size={24} color={colors.accent} />,
      reward: 'Elite status',
      rarity: 'legendary'
    }
  ];

  return (
    <View style={styles.achievementContainer}>
      <Text style={styles.achievementTitle}>Achievements</Text>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementItem}>
          <View style={styles.achievementIcon}>
            {achievement.icon}
          </View>
          <View style={styles.achievementContent}>
            <Text style={styles.achievementName}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDesc}>
              {achievement.description}
            </Text>
            <Text style={styles.achievementReward}>
              {achievement.reward}
            </Text>
          </View>
          <View style={[
            styles.rarityBadge,
            achievement.rarity === 'common' ? styles.commonBadge :
            achievement.rarity === 'rare' ? styles.rareBadge :
            achievement.rarity === 'epic' ? styles.epicBadge :
            styles.legendaryBadge
          ]}>
            <Text style={styles.rarityText}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// Social proof and testimonials
export const SocialProof = () => {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Manager',
      text: 'Soluna transformed my life. I went from 0 habits to 15 consistent habits in just 3 months!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Johnson',
      role: 'Entrepreneur',
      text: 'The AI insights are incredible. It\'s like having a personal coach in my pocket.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student',
      text: 'Finally, a habit app that actually works. The streak system keeps me motivated daily.',
      rating: 5,
      avatar: '👩‍🎓'
    }
  ];

  return (
    <View style={styles.socialProofContainer}>
      <Text style={styles.socialProofTitle}>
        Join 50,000+ Users Transforming Their Lives
      </Text>
      
      <View style={styles.testimonialsContainer}>
        {testimonials.map((testimonial, index) => (
          <View key={index} style={styles.testimonialCard}>
            <View style={styles.testimonialHeader}>
              <Text style={styles.avatar}>{testimonial.avatar}</Text>
              <View style={styles.testimonialInfo}>
                <Text style={styles.testimonialName}>
                  {testimonial.name}
                </Text>
                <Text style={styles.testimonialRole}>
                  {testimonial.role}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} color={colors.accent} fill={colors.accent} />
                ))}
              </View>
            </View>
            <Text style={styles.testimonialText}>
              "{testimonial.text}"
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.9★</Text>
          <Text style={styles.statLabel}>App Store Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1M+</Text>
          <Text style={styles.statLabel}>Habits Completed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  onboardingContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center',
    maxWidth: width * 0.9,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  valueBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  valueText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.background,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  achievementContainer: {
    padding: 20,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  achievementReward: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  commonBadge: {
    backgroundColor: colors.textSecondary + '20',
  },
  rareBadge: {
    backgroundColor: colors.accent + '20',
  },
  legendaryBadge: {
    backgroundColor: colors.primary + '20',
  },
  epicBadge: {
    backgroundColor: colors.accent + '20',
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  socialProofContainer: {
    padding: 20,
  },
  socialProofTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  testimonialsContainer: {
    marginBottom: 30,
  },
  testimonialCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 24,
    marginRight: 12,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  testimonialRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  testimonialText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
