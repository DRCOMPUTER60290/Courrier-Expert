import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Plan = 'free' | 'premium';

interface SubscriptionContextType {
  plan: Plan;
  upgrade: () => void;
  downgrade: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>('free');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('subscriptionPlan');
        if (stored === 'premium' || stored === 'free') {
          setPlan(stored);
        }
      } catch (e) {
        console.error('Failed to load subscription plan', e);
      }
    })();
  }, []);

  const persistPlan = async (value: Plan) => {
    try {
      await AsyncStorage.setItem('subscriptionPlan', value);
    } catch (e) {
      console.error('Failed to save subscription plan', e);
    }
  };

  const upgrade = () => {
    setPlan('premium');
    persistPlan('premium');
  };

  const downgrade = () => {
    setPlan('free');
    persistPlan('free');
  };

  return (
    <SubscriptionContext.Provider value={{ plan, upgrade, downgrade }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

