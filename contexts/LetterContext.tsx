import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadLetters, saveLetters } from '@/utils/letterStorage';
import { Recipient } from '@/contexts/RecipientContext';

export interface Letter {
  id: string;
  type: string;
  title: string;
  content: string;
  recipient: Recipient;
  data: Record<string, any>;
  status?: string;
  createdAt: Date;
}

interface LetterContextType {
  letters: Letter[];
  addLetter: (letter: Letter) => void;
  updateLetter: (id: string, updatedLetter: Letter) => void;
  deleteLetter: (id: string) => void;
  getMonthlyCount: () => number;
  canGenerateLetter: (plan: 'free' | 'premium') => boolean;
  getStatistics: () => {
    totalLetters: number;
    thisMonth: number;
    mostUsedType: string;
    shareRate: number;
  };
  searchLetters: (query: string) => Letter[];
  filterLetters: (filters: { date?: Date; recipientId?: string; status?: string }) => Letter[];
}

const LetterContext = createContext<LetterContextType | undefined>(undefined);

export function LetterProvider({ children }: { children: React.ReactNode }) {
  const [letters, setLetters] = useState<Letter[]>([]);

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

  const getMonthlyCount = () => {
    const now = new Date();
    return letters.filter(letter => {
      const letterDate = new Date(letter.createdAt);
      return (
        letterDate.getMonth() === now.getMonth() &&
        letterDate.getFullYear() === now.getFullYear()
      );
    }).length;
  };

  const canGenerateLetter = (plan: 'free' | 'premium') => {
    if (plan === 'free' && getMonthlyCount() >= 10) {
      return false;
    }
    return true;
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

  const searchLetters = (query: string) => {
    const lower = query.toLowerCase();
    return letters.filter(letter =>
      letter.title.toLowerCase().includes(lower) ||
      `${letter.recipient.firstName} ${letter.recipient.lastName}`.toLowerCase().includes(lower)
    );
  };

  const filterLetters = ({ date, recipientId, status }: { date?: Date; recipientId?: string; status?: string }) => {
    return letters.filter(letter => {
      const matchesDate = date
        ? new Date(letter.createdAt).toDateString() === date.toDateString()
        : true;
      const matchesRecipient = recipientId ? letter.recipient.id === recipientId : true;
      const matchesStatus = status ? letter.status === status : true;
      return matchesDate && matchesRecipient && matchesStatus;
    });
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
        searchLetters,
        filterLetters,
      }}
    >
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