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
import { isFirebaseConfigured } from "./firebase/config";
import {
  getPromosFromFirestore,
  getStoreContactFromFirestore,
  subscribePromos,
  subscribeStoreContact,
} from "./firebase/firestore";
import type { PromoBannerItem } from "./promos";

interface ContactContextValue {
  contact: StoreContact;
  loading: boolean;
  promos: PromoBannerItem[];
  promosLoading: boolean;
  refresh: () => Promise<void>;
}

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<StoreContact>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [promos, setPromos] = useState<PromoBannerItem[]>([]);
  const [promosLoading, setPromosLoading] = useState<boolean>(isFirebaseConfigured);

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setPromosLoading(false);
      return;
    }
    try {
      setLoading(true);
      setPromosLoading(true);
      const [liveContact, livePromos] = await Promise.allSettled([
        getStoreContactFromFirestore(),
        getPromosFromFirestore(),
      ]);
      if (liveContact.status === "fulfilled" && liveContact.value) {
        setContact(normalizeContact(liveContact.value));
      }
      if (livePromos.status === "fulfilled") {
        setPromos(livePromos.value);
      }
    } catch {
      // Fall back cleanly if rules or Firebase aren't ready yet.
    } finally {
      setLoading(false);
      setPromosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setPromosLoading(false);
      return;
    }
    void refresh();
    const unsubContact = subscribeStoreContact(
      (live) => {
        if (live) setContact(normalizeContact(live));
        setLoading(false);
      },
      () => setLoading(false)
    );
    const unsubPromos = subscribePromos(
      (livePromos) => {
        setPromos(livePromos);
        setPromosLoading(false);
      },
      () => setPromosLoading(false)
    );
    return () => {
      unsubContact();
      unsubPromos();
    };
  }, [refresh]);

  const value = useMemo<ContactContextValue>(
    () => ({
      contact,
      loading,
      promos,
      promosLoading,
      refresh,
    }),
    [contact, loading, promos, promosLoading, refresh]
  );

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact(): ContactContextValue {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    return {
      contact: DEFAULT_CONTACT,
      loading: false,
      promos: [],
      promosLoading: false,
      refresh: async () => {},
    };
  }
  return ctx;
}

export function usePromos(): {
  promos: PromoBannerItem[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { promos, promosLoading, refresh } = useContact();
  return { promos, loading: promosLoading, refresh };
}
