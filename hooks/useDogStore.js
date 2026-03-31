import {
  getBackendUserId,
  setBackendUserId,
  updateUserSnapshot,
} from '../lib/local-session';
import { simulateDogStatsFromAnchor } from '../lib/dog-tick-simulation';
import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

/** @param {unknown} raw */
function normalizeTickMeta(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const m = /** @type {Record<string, unknown>} */ (raw);
  return {
    demoStepMs: Number(m.demoStepMs) || 10_000,
    is_demo_mode: m.is_demo_mode === true,
    difficulty_hardcore: m.difficulty_hardcore === true,
    foodLossPerHour: Number(m.foodLossPerHour) || 0,
    waterLossPerHour: Number(m.waterLossPerHour) || 0,
    healthLossPerHourWhenDepleted: Number(m.healthLossPerHourWhenDepleted) || 0,
    demoFoodLossPer10s: Number(m.demoFoodLossPer10s) || 0,
    demoWaterLossPer10s: Number(m.demoWaterLossPer10s) || 0,
    demoHealthLossPer10sWhenDepleted: Number(m.demoHealthLossPer10sWhenDepleted) || 0,
  };
}

/** Nourriture / eau : 100 = plein (API `food` / `water`, anciens `hunger` / `thirst`). */
function readFoodStat(obj) {
  const v = Number(obj.food ?? obj.hunger ?? obj.faim);
  return Number.isFinite(v) ? v : 0;
}

function readWaterStat(obj) {
  const v = Number(obj.water ?? obj.thirst ?? obj.soif);
  return Number.isFinite(v) ? v : 0;
}

/** @param {Record<string, unknown>} data */
function mapInitDogResponse(data) {
  const id = typeof data.id === 'string' ? data.id : '';
  return {
    dogId: id,
    food: readFoodStat(data),
    health: Number(data.health) || 0,
    maladie: data.is_sick === true ? 100 : 0,
    water: readWaterStat(data),
    dogName:
      (typeof data.name === 'string' && data.name.trim()) ||
      (typeof data.nom === 'string' && data.nom.trim()) ||
      '',
    breed:
      (typeof data.breed === 'string' && data.breed) ||
      (typeof data.race === 'string' && data.race) ||
      '',
  };
}

/** @param {Record<string, unknown>} data */
function mapDogsListPayload(data) {
  const dogs = Array.isArray(data.dogs) ? data.dogs : [];
  const primary = dogs[0] || null;
  const wallet_gold = Number(data.wallet_soft_gold ?? data.wallet_gold ?? data.or) || 0;
  const wallet_gems = Number(data.wallet_hard_gems ?? data.wallet_gems ?? data.gemmes) || 0;
  const inventory = data && typeof data.inventory === 'object' ? data.inventory : null;
  const items =
    inventory && typeof inventory.items === 'object' && inventory.items
      ? inventory.items
      : {};
  const croquettes = Math.max(0, Number(items.croquettes) || 0);
  const water_bottle = Math.max(0, Number(items.water_bottle) || 0);
  const unlocked_skins = Array.isArray(data.unlocked_skins) ? data.unlocked_skins.filter((x) => typeof x === 'string') : [];

  if (!primary) {
    return {
      dogId: '',
      food: 0,
      health: 0,
      maladie: 0,
      water: 0,
      wallet_gold,
      wallet_gems,
      inventory: { croquettes, water_bottle },
      unlocked_skins,
      active_skin_id: '',
      dogName: '',
      breed: '',
      difficulty_mode: typeof data.difficulty_mode === 'string' ? data.difficulty_mode : 'normal',
      is_demo_mode: data.is_demo_mode === true,
      tickMeta: null,
    };
  }

  const id = typeof primary.id === 'string' ? primary.id : '';
  return {
    dogId: id,
    food: readFoodStat(primary),
    health: Number(primary.health) || 0,
    maladie: primary.is_sick === true ? 100 : 0,
    water: readWaterStat(primary),
    wallet_gold,
    wallet_gems,
    inventory: { croquettes, water_bottle },
    unlocked_skins,
    active_skin_id: typeof primary.active_skin_id === 'string' ? primary.active_skin_id : '',
    dogName:
      (typeof primary.name === 'string' && primary.name.trim()) ||
      (typeof primary.nom === 'string' && primary.nom.trim()) ||
      '',
    breed:
      (typeof primary.breed === 'string' && primary.breed) ||
      (typeof primary.race === 'string' && primary.race) ||
      '',
    difficulty_mode: typeof data.difficulty_mode === 'string' ? data.difficulty_mode : 'normal',
    is_demo_mode: data.is_demo_mode === true,
    tickMeta: normalizeTickMeta(primary.tick_meta),
  };
}

export const useDogStore = create((set, get) => ({
  userId: '',
  dogId: '',
  food: 0,
  health: 0,
  maladie: 0,
  water: 0,
  wallet_gold: 0,
  wallet_gems: 0,
  inventory: { croquettes: 0, water_bottle: 0 },
  unlocked_skins: [],
  active_skin_id: '',
  difficulty_mode: 'normal',
  is_demo_mode: false,
  dogName: '',
  breed: '',
  /** From GET /dogs — drives local decay between syncs. */
  tickMeta: null,
  statsAnchor: null,
  serverClockOffsetMs: 0,

  /** Restore userId from storage (cold start). */
  hydrateUserIdFromStorage: async () => {
    const id = await getBackendUserId();
    if (id) {
      set({ userId: id });
    }
  },

  /**
   * POST /auth/login — stores the returned uid as userId for /dogs/:userId and init-dog.
   */
  authApiLogin: async ({ idToken, pseudo } = {}) => {
    const token = typeof idToken === 'string' ? idToken.trim() : '';
    const pseudoTrimmed = typeof pseudo === 'string' ? pseudo.trim() : '';
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: token,
          ...(pseudoTrimmed ? { pseudo: pseudoTrimmed } : {}),
        }),
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

  /**
   * POST /auth/register — stores the returned uid as userId for /dogs/:userId and init-dog.
   */
  authApiRegister: async ({ idToken, pseudo } = {}) => {
    const token = typeof idToken === 'string' ? idToken.trim() : '';
    const pseudoTrimmed = typeof pseudo === 'string' ? pseudo.trim() : '';
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: token,
          ...(pseudoTrimmed ? { pseudo: pseudoTrimmed } : {}),
        }),
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

  /**
   * GET /dogs/:userId — user + primary dog stats + wallets.
   * @returns {Promise<boolean|null>} true if at least one dog exists, false if none, null on network/other error
   */
  fetchDog: async () => {
    const userId = get().userId;
    if (!userId) return null;
    try {
      const res = await fetch(`${API_URL}/dogs/${encodeURIComponent(userId)}`);
      if (res.status === 404) {
        set({
          dogId: '',
          food: 0,
          health: 0,
          maladie: 0,
          water: 0,
          dogName: '',
          breed: '',
          wallet_gold: 0,
          wallet_gems: 0,
          inventory: { croquettes: 0, water_bottle: 0 },
          unlocked_skins: [],
          active_skin_id: '',
          difficulty_mode: 'normal',
          is_demo_mode: false,
          tickMeta: null,
          statsAnchor: null,
          serverClockOffsetMs: 0,
        });
        return false;
      }
      if (!res.ok) return null;
      const data = await res.json();
      const dogs = Array.isArray(data.dogs) ? data.dogs : [];
      const mapped = mapDogsListPayload(data);
      const smRaw = Number(data.server_now_ms);
      const serverTimeMs = Number.isFinite(smRaw) ? smRaw : Date.now();
      const receivedAt = Date.now();
      const statsAnchor =
        mapped.dogId && mapped.tickMeta
          ? {
              food: mapped.food,
              water: mapped.water,
              health: mapped.health,
              serverTimeMs,
            }
          : null;
      set({
        ...mapped,
        statsAnchor,
        serverClockOffsetMs: serverTimeMs - receivedAt,
      });
      if (mapped.dogName) {
        await updateUserSnapshot({ dogName: mapped.dogName });
      } else {
        await updateUserSnapshot({ dogName: '' });
      }
      return dogs.length > 0;
    } catch {
      return null;
    }
  },

  /** Recompute food/water/health/maladie from last server anchor + clock offset (call ~1/s on home). */
  applyLiveTick: () => {
    const s = get();
    if (!s.tickMeta || !s.statsAnchor) return;
    const serverNow = Date.now() + s.serverClockOffsetMs;
    const elapsed = Math.max(0, serverNow - s.statsAnchor.serverTimeMs);
    const out = simulateDogStatsFromAnchor(
      s.statsAnchor.food,
      s.statsAnchor.water,
      s.statsAnchor.health,
      elapsed,
      s.tickMeta,
    );
    set({
      food: out.food,
      water: out.water,
      health: out.health,
      maladie: out.maladie,
    });
  },

  /**
   * POST /init-dog with { name, userId, breed? | race? }.
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
      const mapped = mapInitDogResponse(data);
      set((state) => ({ ...state, ...mapped }));
      if (mapped.dogName) {
        await updateUserSnapshot({ dogName: mapped.dogName });
      }
      await get().fetchDog();
      return true;
    } catch {
      return false;
    }
  },

  feedDog: async () => {
    const userId = get().userId;
    const dogId = get().dogId;
    if (!userId || !dogId) return false;
    try {
      const res = await fetch(`${API_URL}/interact/feed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dogId }),
      });
      if (!res.ok) return false;
      await get().fetchDog();
      return true;
    } catch {
      return false;
    }
  },

  buyConsumable: async (item, quantity = 1) => {
    const userId = get().userId;
    if (!userId) return { ok: false, error: 'userId manquant' };
    try {
      const res = await fetch(`${API_URL}/shop/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, item, quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: typeof data.error === 'string' ? data.error : 'Achat impossible' };
      }
      await get().fetchDog();
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Erreur réseau' };
    }
  },

  buySkin: async (skinId) => {
    const userId = get().userId;
    if (!userId) return { ok: false, error: 'userId manquant' };
    const sid = typeof skinId === 'string' ? skinId.trim() : '';
    if (!sid) return { ok: false, error: 'skinId manquant' };
    try {
      const res = await fetch(`${API_URL}/shop/buy-skin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skinId: sid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: typeof data.error === 'string' ? data.error : 'Achat impossible' };
      }
      await get().fetchDog();
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Erreur réseau' };
    }
  },

  equipSkin: async (skinId) => {
    const userId = get().userId;
    const dogId = get().dogId;
    const sid = typeof skinId === 'string' ? skinId.trim() : '';
    if (!userId || !dogId) return { ok: false, error: 'userId/dogId manquant' };
    if (!sid) return { ok: false, error: 'skinId manquant' };
    try {
      const res = await fetch(`${API_URL}/dog/${encodeURIComponent(dogId)}/equip-skin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skinId: sid }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: typeof data.error === 'string' ? data.error : "Équipement impossible" };
      }
      await get().fetchDog();
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Erreur réseau' };
    }
  },

  giveWater: async () => {
    const ok = await get().feedDog();
    return ok;
  },

  updateSettings: async ({ difficulty_mode, is_demo_mode } = {}) => {
    const userId = get().userId;
    if (!userId) return { ok: false, error: 'userId manquant' };
    try {
      const res = await fetch(`${API_URL}/user/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, difficulty_mode, is_demo_mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, error: typeof data.error === 'string' ? data.error : 'Erreur serveur' };
      }
      set((state) => ({
        ...state,
        difficulty_mode:
          typeof data.difficulty_mode === 'string' ? data.difficulty_mode : state.difficulty_mode,
        is_demo_mode:
          typeof data.is_demo_mode === 'boolean' ? data.is_demo_mode : state.is_demo_mode,
      }));
      await get().fetchDog();
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Erreur réseau' };
    }
  },

  /** Call after logout so in-memory API user id is cleared. */
  resetAfterLogout: () =>
    set({
      userId: '',
      dogId: '',
      food: 0,
      health: 0,
      maladie: 0,
      water: 0,
      wallet_gold: 0,
      wallet_gems: 0,
      inventory: { croquettes: 0, water_bottle: 0 },
      unlocked_skins: [],
      active_skin_id: '',
      difficulty_mode: 'normal',
      is_demo_mode: false,
      dogName: '',
      breed: '',
      tickMeta: null,
      statsAnchor: null,
      serverClockOffsetMs: 0,
    }),
}));
