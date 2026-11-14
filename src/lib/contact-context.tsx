"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_CONTACT, normalizeContact, type StoreContact } from "./contact";
import { getStoreContactFromFirestore, subscribeStoreContact } from "./firebase/firestore";

interface ContactContextValue {
  contact: StoreContact;
  loading: boolean;
  refresh: () => Promise<void>;
}

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<StoreContact>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const live = await getStoreContactFromFirestore();
      if (live) setContact(normalizeContact(live));
    } catch {
      // Fall back to default placeholders silently if rules or Firebase aren't ready yet.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsub = subscribeStoreContact(
      (live) => {
        if (live) setContact(normalizeContact(live));
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return unsub;
  }, [refresh]);

  const value = useMemo<ContactContextValue>(
    () => ({
      contact,
      loading,
      refresh,
    }),
    [contact, loading, refresh]
  );

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    return {
      contact: DEFAULT_CONTACT,
      loading: false,
      refresh: async () => {},
    };
  }
  return ctx;
}
