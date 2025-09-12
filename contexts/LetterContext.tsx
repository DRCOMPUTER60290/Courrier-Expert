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
}

interface LetterContextType {
  letters: Letter[];
  addLetter: (letter: Letter) => void;
  updateLetter: (id: string, updatedLetter: Letter) => void;
  deleteLetter: (id: string) => void;
  canGenerateLetter: () => boolean;
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
  const { plan } = useSubscription();

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
      const updated = prev.map(letter =>
        letter.id === id ? updatedLetter : letter
      );
      saveLetters(updated);
      return updated;
    });
  };

  const deleteLetter = (id: string) => {
    setLetters(prev => {
      const updated = prev.filter(letter => letter.id !== id);
      saveLetters(updated);
      return updated;
    });
  };

  const canGenerateLetter = () => {
    if (plan === 'premium') return true;
    const now = new Date();
    const count = letters.filter(letter => {
      const date = new Date(letter.createdAt);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    return count < 10;
  };

  const getStatistics = () => {
    const now = new Date();
    const thisMonth = letters.filter(letter => {
      const letterDate = new Date(letter.createdAt);
      return letterDate.getMonth() === now.getMonth() && 
             letterDate.getFullYear() === now.getFullYear();
    }).length;

    const typeCount: Record<string, number> = {};
    letters.forEach(letter => {
      typeCount[letter.type] = (typeCount[letter.type] || 0) + 1;
    });

    const mostUsedType = Object.keys(typeCount).reduce((a, b) => 
      typeCount[a] > typeCount[b] ? a : b, 'Aucun'
    );

    return {
      totalLetters: letters.length,
      thisMonth,
      mostUsedType: typeCount[mostUsedType] ? mostUsedType : 'Aucun',
      shareRate: Math.round((letters.length * 0.7 + Math.random() * 30)), // Simulation
    };
  };

  return (
    <LetterContext.Provider value={{ letters, addLetter, updateLetter, deleteLetter, getStatistics, canGenerateLetter }}>
      {children}
    </LetterContext.Provider>
  );
}

export function useLetters() {
  const context = useContext(LetterContext);
  if (!context) {
    throw new Error('useLetters must be used within a LetterProvider');
  }
  return context;
}