import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadRecipients, saveRecipients } from '@/utils/recipientStorage';

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

  useEffect(() => {
    loadRecipients().then(setRecipients);
  }, []);

  const persist = (updated: Recipient[]) => {
    setRecipients(updated);
    saveRecipients(updated);
  };

  const addRecipient = (recipient: Recipient) => {
    const newRecipient = { ...recipient, id: Date.now().toString() };
    persist([...recipients, newRecipient]);
  };

  const updateRecipient = (id: string, recipient: Recipient) => {
    persist(recipients.map(r => (r.id === id ? { ...recipient, id } : r)));
  };

  const deleteRecipient = (id: string) => {
    persist(recipients.filter(r => r.id !== id));
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
