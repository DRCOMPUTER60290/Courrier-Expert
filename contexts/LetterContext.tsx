// contexts/LetterContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadLetters, saveLetters } from '@/utils/letterStorage';
import { Recipient } from '@/contexts/RecipientContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export interface Letter {
  id: string;
  type: string;
  title: string;
  content: string;
  recipient: Recipient;
  data: Record<string, any>;
  createdAt: Date;
  reminderDate?: Date;
  notificationId?: string;
}

interface LetterContextType {
  letters: Letter[];
  addLetter: (letter: Letter) => void;
  updateLetter: (id: string, updatedLetter: Letter) => void;
  deleteLetter: (id: string) => void;

  // Compatibilité des deux branches :
  // - getMonthlyCount : compteur du mois en cours
  // - canGenerateLetter : accepte un plan optionnel (utilise le plan du SubscriptionContext par défaut)
  getMonthlyCount: () => number;
  canGenerateLetter: (plan?: 'free' | 'premium') => boolean;

  getStatistics: () => {
    totalLetters: number;
    thisMonth: number;
    mostUsedType: string;
    shareRate: number;
  };
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export function LetterProvider({ children }: { children: React.ReactNode }) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const { plan } = useSubscription(); // 'free' | 'premium'

  useEffect(() => {
    loadLetters().then(setLetters);
  }, []);

  const addLetter = (letter: Letter) => {
    setLetters(prev => {
      const updated = [letter, ...prev];
      saveLetters(updated);
      return updated;
    });
  };

  const updateLetter = (id: string, updatedLetter: Letter) => {
    setLetters(prev => {
      const updated = prev.map(l => (l.id === id ? updatedLetter : l));
      saveLetters(updated);
      return updated;
    });
  };

  const deleteLetter = (id: string) => {
    setLetters(prev => {
      const updated = prev.filter(l => l.id !== id);
      saveLetters(updated);
      return updated;
    });
  };

  const getMonthlyCount = () => {
    const now = new Date();
    return letters.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  };

  // Limite : 10 lettres / mois pour 'free', illimité pour 'premium'.
  // plan paramétrable (compat) mais optionnel : par défaut on prend le plan du contexte.
  const canGenerateLetter = (overridePlan?: 'free' | 'premium') => {
    const effectivePlan = overridePlan ?? plan;
    if (effectivePlan === 'premium') return true;
    return getMonthlyCount() < 10;
  };

  const getStatistics = () => {
    const now = new Date();
    const thisMonth = letters.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const typeCount: Record<string, number> = {};
    letters.forEach(l => {
      typeCount[l.type] = (typeCount[l.type] || 0) + 1;
    });

    const mostUsedType = Object.keys(typeCount).reduce((a, b) =>
      (typeCount[a] || 0) > (typeCount[b] || 0) ? a : b,
      'Aucun'
    );

    return {
      totalLetters: letters.length,
      thisMonth,
      mostUsedType: typeCount[mostUsedType] ? mostUsedType : 'Aucun',
      // Simulation d’un taux de partage
      shareRate: Math.round(letters.length * 0.7 + Math.random() * 30),
    };
  };

  return (
    <LetterContext.Provider
      value={{
        letters,
        addLetter,
        updateLetter,
        deleteLetter,
        getMonthlyCount,
        canGenerateLetter,
        getStatistics,
      }}
    >
      {children}
    </LetterContext.Provider>
  );
}

export function useLetters() {
  const ctx = useContext(LetterContext);
  if (!ctx) throw new Error('useLetters must be used within a LetterProvider');
  return ctx;
}
