import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadLetters, saveLetters, queueLetter, getPendingLetters, clearPendingLetters } from '@/utils/letterStorage';
import { fetchLetters, saveLetterRemote } from '@/services/letterApi';
import { useAuth } from '@/contexts/AuthContext';
import { Recipient } from '@/contexts/RecipientContext';

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
  const { token } = useAuth();

  useEffect(() => {
    loadLetters().then(setLetters);
  }, []);

  const sync = async () => {
    if (!token) return;
    const pending = await getPendingLetters();
    for (const l of pending) {
      try {
        await saveLetterRemote(l, token);
      } catch (err) {
        console.error('Failed to sync letter', err);
        return;
      }
    }
    if (pending.length) await clearPendingLetters();
    try {
      const remote = await fetchLetters(token);
      setLetters(remote);
      saveLetters(remote);
    } catch (err) {
      console.error('Failed to fetch letters', err);
    }
  };

  useEffect(() => {
    sync();
  }, [token]);

  const addLetter = (letter: Letter) => {
    setLetters(prev => {
      const updated = [letter, ...prev];
      saveLetters(updated);
      return updated;
    });
    if (token) {
      saveLetterRemote(letter, token).catch(() => queueLetter(letter));
    } else {
      queueLetter(letter);
    }
  };

  const updateLetter = (id: string, updatedLetter: Letter) => {
    setLetters(prev => {
      const updated = prev.map(letter =>
        letter.id === id ? updatedLetter : letter
      );
      saveLetters(updated);
      return updated;
    });
    if (token) {
      saveLetterRemote(updatedLetter, token).catch(() => queueLetter(updatedLetter));
    } else {
      queueLetter(updatedLetter);
    }
  };

  const deleteLetter = (id: string) => {
    setLetters(prev => {
      const updated = prev.filter(letter => letter.id !== id);
      saveLetters(updated);
      return updated;
    });
    // deletion sync not implemented, could queue
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
      shareRate: Math.round((letters.length * 0.7 + Math.random() * 30)),
    };
  };

  return (
    <LetterContext.Provider value={{ letters, addLetter, updateLetter, deleteLetter, getStatistics }}>
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
