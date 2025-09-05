// Advanced monetization strategies for maximum revenue
export interface MonetizationStrategy {
  // Tiered subscription model
  tiers: {
    free: {
      habits: number;
      aiBoosts: number;
      features: string[];
      retention: number;
    };
    premium: {
      habits: number;
      aiBoosts: number;
      features: string[];
      price: number;
      retention: number;
    };
    elite: {
      habits: number;
      aiBoosts: number;
      features: string[];
      price: number;
      retention: number;
    };
  };
  
  // Psychological pricing strategies
  pricing: {
    anchor: number; // High anchor price
    decoy: number;  // Decoy effect price
    target: number; // Target conversion price
    charm: number;  // Charm pricing (e.g., $2.99)
  };
  
  // Conversion optimization
  conversion: {
    freeTrialDays: number;
    onboardingFunnel: string[];
    upgradeTriggers: string[];
    retentionHooks: string[];
  };
}

export const SOLUNA_MONETIZATION: MonetizationStrategy = {
  tiers: {
    free: {
      habits: 3, // Reduced from 6 to increase conversion
      aiBoosts: 1, // Reduced from 3 to increase urgency
      features: [
        'Basic habit tracking',
        'Simple streak counter',
        '1 AI insight per day',
        'Basic analytics'
      ],
      retention: 0.3 // 30% retention
    },
    premium: {
      habits: 25, // Not unlimited - creates upgrade path
      aiBoosts: 10, // Generous but not unlimited
      features: [
        'Advanced habit tracking',
        'AI-powered insights',
        'Detailed analytics',
        'Custom categories',
        'Export data',
        'Priority support'
      ],
      price: 2.99,
      retention: 0.7 // 70% retention
    },
    elite: {
      habits: 999, // Unlimited
      aiBoosts: 999, // Unlimited
      features: [
        'Everything in Premium',
        'Unlimited habits',
        'Unlimited AI insights',
        'Advanced analytics',
        'Habit coaching',
        '1-on-1 consultation',
        'Early access features',
        'Exclusive content'
      ],
      price: 9.99,
      retention: 0.85 // 85% retention
    }
  },
  
  pricing: {
    anchor: 19.99, // High anchor for annual
    decoy: 4.99,   // Monthly premium (decoy)
    target: 2.99,   // Target monthly price
    charm: 2.99     // Charm pricing
  },
  
  conversion: {
    freeTrialDays: 7, // 7-day free trial
    onboardingFunnel: [
      'Welcome screen with value prop',
      'Habit creation tutorial',
      'First AI insight experience',
      'Streak achievement celebration',
      'Upgrade prompt at peak engagement'
    ],
    upgradeTriggers: [
      'Habit limit reached',
      'AI boost limit reached',
      'Streak milestone achieved',
      'Analytics viewed',
      'Export attempted'
    ],
    retentionHooks: [
      'Daily streak notifications',
      'Weekly progress reports',
      'Achievement celebrations',
      'Social sharing prompts',
      'Personalized insights'
    ]
  }
};

// Advanced pricing psychology
export const PRICING_PSYCHOLOGY = {
  // Anchoring effect - show highest price first
  priceDisplay: ['$19.99/year', '$2.99/month', 'FREE'],
  
  // Scarcity and urgency
  urgency: {
    limitedTime: 'Limited time: 50% off first month',
    socialProof: 'Join 50,000+ users transforming their lives',
    exclusivity: 'Elite members only feature'
  },
  
  // Value demonstration
  valueProps: [
    'Save $35.88 per year with annual plan',
    'Unlimited AI insights worth $50/month',
    'Premium analytics worth $20/month',
    'Total value: $70/month - Get it for $2.99'
  ]
};

// Revenue optimization metrics
export const REVENUE_METRICS = {
  // Target conversion rates
  freeToPremium: 0.15, // 15% conversion
  premiumToElite: 0.05, // 5% upgrade rate
  
  // Lifetime value targets
  ltv: {
    free: 0,
    premium: 89.70, // $2.99 * 30 months average
    elite: 299.70   // $9.99 * 30 months average
  },
  
  // Churn rates
  churn: {
    free: 0.7,     // 70% churn (expected)
    premium: 0.3,  // 30% monthly churn
    elite: 0.15    // 15% monthly churn
  }
};
