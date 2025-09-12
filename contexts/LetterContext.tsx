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
  status?: string;
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
  searchLetters: (query: string) => Letter[];
  filterLetters: (filters: { date?: Date; recipientId?: string; status?: string }) => Letter[];
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
  status?: string;            // optionnel, utile pour filtrer par statut
  createdAt: Date;           // peut être une string au chargement, on reconvertit avec new Date(...)
  reminderDate?: Date;
  notificationId?: string;
}

interface LetterContextType {
  letters: Letter[];
  addLetter: (letter: Letter) => void;
  updateLetter: (id: string, updatedLetter: Letter) => void;
  deleteLetter: (id: string) => void;

  // Compteur & droits selon l'abonnement
  getMonthlyCount: () => number;
  canGenerateLetter: (plan?: 'free' | 'premium') => boolean;

  // Statistiques pour le dashboard
  getStatistics: () => {
    totalLetters: number;
    thisMonth: number;
    mostUsedType: string;
    shareRate: number;
  };

  // Recherche / filtres (optionnels mais pratiques pour l'historique)
  searchLetters: (query: string) => Letter[];
  filterLetters: (filters: { date?: Date; recipientId?: string; status?: string }) => Letter[];
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
  // Le paramètre est optionnel : si non fourni, on utilise le plan du contexte.
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

    const mostUsedType = Object.keys(typeCount).reduce(
      (a, b) => ((typeCount[a] || 0) > (typeCount[b] || 0) ? a : b),
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

  // Recherche simple sur titre / contenu / nom destinataire
  const searchLetters = (query: string) => {
    const lower = query.trim().toLowerCase();
    if (!lower) return letters.slice();
    return letters.filter(letter => {
      const recName = `${letter.recipient?.firstName ?? ''} ${letter.recipient?.lastName ?? ''}`.toLowerCase();
      return (
        letter.title.toLowerCase().includes(lower) ||
        (letter.content ?? '').toLowerCase().includes(lower) ||
        recName.includes(lower)
      );
    });
  };

  // Filtres par date (jour exact), destinataire et statut
  const filterLetters = ({ date, recipientId, status }: { date?: Date; recipientId?: string; status?: string }) => {
    const sameDay = (a: Date | string, b: Date) => {
      const da = new Date(a);
      const db = new Date(b);
      return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
      );
    };

    return letters.filter(letter => {
      const matchesDate = date ? sameDay(letter.createdAt, date) : true;
      const matchesRecipient = recipientId ? letter.recipient?.id === recipientId : true;
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
  const ctx = useContext(LetterContext);
  if (!ctx) throw new Error('useLetters must be used within a LetterProvider');
  return ctx;
}
