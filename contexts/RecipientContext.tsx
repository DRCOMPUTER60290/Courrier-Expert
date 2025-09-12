import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadRecipients, saveRecipients, queueRecipient, getPendingRecipients, clearPendingRecipients } from '@/utils/recipientStorage';
import { fetchRecipients, saveRecipientRemote } from '@/services/letterApi';
import { useAuth } from '@/contexts/AuthContext';

export interface Recipient {
  id?: string;
  firstName: string;
  lastName: string;
  status: string;
  address: string;
  postalCode: string;
  city: string;
  email: string;
  phone: string;
}

interface RecipientContextType {
  recipients: Recipient[];
  addRecipient: (recipient: Recipient) => void;
  updateRecipient: (id: string, recipient: Recipient) => void;
  deleteRecipient: (id: string) => void;
}

const RecipientContext = createContext<RecipientContextType | undefined>(undefined);

export function RecipientProvider({ children }: { children: React.ReactNode }) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    loadRecipients().then(setRecipients);
  }, []);

  const sync = async () => {
    if (!token) return;
    const pending = await getPendingRecipients();
    for (const r of pending) {
      try {
        await saveRecipientRemote(r, token);
      } catch (err) {
        console.error('Failed to sync recipient', err);
        return;
      }
    }
    if (pending.length) await clearPendingRecipients();
    try {
      const remote = await fetchRecipients(token);
      setRecipients(remote);
      saveRecipients(remote);
    } catch (err) {
      console.error('Failed to fetch recipients', err);
    }
  };

  useEffect(() => {
    sync();
  }, [token]);

  const persist = (updated: Recipient[]) => {
    setRecipients(updated);
    saveRecipients(updated);
  };

  const addRecipient = (recipient: Recipient) => {
    const newRecipient = { ...recipient, id: Date.now().toString() };
    persist([...recipients, newRecipient]);
    if (token) {
      saveRecipientRemote(newRecipient, token).catch(() => queueRecipient(newRecipient));
    } else {
      queueRecipient(newRecipient);
    }
  };

  const updateRecipient = (id: string, recipient: Recipient) => {
    const updated = recipients.map(r => (r.id === id ? { ...recipient, id } : r));
    persist(updated);
    if (token) {
      saveRecipientRemote({ ...recipient, id }, token).catch(() => queueRecipient({ ...recipient, id }));
    } else {
      queueRecipient({ ...recipient, id });
    }
  };

  const deleteRecipient = (id: string) => {
    persist(recipients.filter(r => r.id !== id));
    // deletion sync not implemented
  };

  return (
    <RecipientContext.Provider value={{ recipients, addRecipient, updateRecipient, deleteRecipient }}>
      {children}
    </RecipientContext.Provider>
  );
}

export function useRecipients() {
  const context = useContext(RecipientContext);
  if (!context) {
    throw new Error('useRecipients must be used within a RecipientProvider');
  }
  return context;
}
