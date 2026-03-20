import {
  getBackendUserId,
  setBackendUserId,
  updateUserSnapshot,
} from '../lib/local-session';
import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

function mapDogPayload(data) {
  const dogName =
    (typeof data.name === 'string' && data.name) ||
    (typeof data.nom === 'string' && data.nom) ||
    '';
  return {
    hunger: Number(data.hunger ?? data.faim) || 0,
    health: Number(data.health ?? data.sante) || 0,
    maladie: Number(data.maladie) || 0,
    wallet_gold: Number(data.wallet_soft_gold ?? data.wallet_gold ?? data.or) || 0,
    wallet_gems: Number(data.wallet_hard_gems ?? data.wallet_gems ?? data.gemmes) || 0,
    dogName,
    breed: typeof data.race === 'string' ? data.race : '',
  };
}

export const useDogStore = create((set, get) => ({
  userId: '',
  hunger: 0,
  health: 0,
  maladie: 0,
  wallet_gold: 0,
  wallet_gems: 0,
  dogName: '',
  breed: '',

  /** Restore userId from storage (cold start). */
  hydrateUserIdFromStorage: async () => {
    const id = await getBackendUserId();
    if (id) {
      set({ userId: id });
    }
  },

  /**
   * POST /auth/login — stores the returned uid as userId for /dog/:userId and init-dog.
   * Backend prototype expects { pseudo: string }.
   */
  authApiLogin: async (pseudo) => {
    const trimmed = typeof pseudo === 'string' ? pseudo.trim() : '';
    if (!trimmed) return false;
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo: trimmed }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const uid = typeof data.uid === 'string' ? data.uid.trim() : '';
      if (!uid) return false;
      set({ userId: uid });
      await setBackendUserId(uid);
      return true;
    } catch {
      return false;
    }
  },

  fetchDog: async () => {
    const userId = get().userId;
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/dog/${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const mapped = mapDogPayload(data);
      set(mapped);
      if (mapped.dogName) {
        await updateUserSnapshot({ dogName: mapped.dogName });
      }
    } catch {
      /* ignore network errors */
    }
  },

  /**
   * POST /init-dog with { name, userId, race? } (not nom).
   */
  initDog: async (dogName, race) => {
    const userId = get().userId;
    if (!userId) return false;
    const name = typeof dogName === 'string' ? dogName.trim() : '';
    if (!name) return false;
    try {
      const res = await fetch(`${API_URL}/init-dog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          userId,
          race: typeof race === 'string' ? race : '',
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const mapped = mapDogPayload(data);
      set(mapped);
      if (mapped.dogName) {
        await updateUserSnapshot({ dogName: mapped.dogName });
      }
      return true;
    } catch {
      return false;
    }
  },

  /** Call after logout so in-memory API user id is cleared. */
  resetAfterLogout: () =>
    set({
      userId: '',
      hunger: 0,
      health: 0,
      maladie: 0,
      wallet_gold: 0,
      wallet_gems: 0,
      dogName: '',
      breed: '',
    }),
}));
