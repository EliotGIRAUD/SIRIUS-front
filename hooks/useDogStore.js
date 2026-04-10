import {
  cacheSessionUser,
  getAuthToken,
  getBackendUserId,
  setAuthToken,
  setBackendUserId,
  updateUserSnapshot,
} from '../lib/local-session';
import { simulateDogStatsFromAnchor } from '../lib/dog-tick-simulation';
import { Platform } from 'react-native';
import { create } from 'zustand';

const RAW_API_URL = typeof process.env.EXPO_PUBLIC_API_URL === 'string'
  ? process.env.EXPO_PUBLIC_API_URL.trim()
  : '';

/**
 * On web, localhost is usually the most reliable way to hit the local API.
 * Keep LAN URL for native devices (Expo Go / simulators) where localhost is not the backend machine.
 */
const API_URL =
  Platform.OS === 'web'
    ? RAW_API_URL.replace(/^https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/i, 'http://localhost:3000') || 'http://localhost:3000'
    : RAW_API_URL || 'http://localhost:3000';
const FIREBASE_API_KEY = typeof process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'string'
  ? process.env.EXPO_PUBLIC_FIREBASE_API_KEY.trim()
  : '';

function jsonHeaders(get) {
  const t = get().authToken;
  const h = { 'Content-Type': 'application/json' };
  if (typeof t === 'string' && t.length > 0) {
    h.Authorization = `Bearer ${t}`;
  }
  return h;
}

async function firebaseAuthEmailPassword(mode, email, password) {
  if (!FIREBASE_API_KEY) return null;
  const endpoint = mode === 'register'
    ? 'https://identitytoolkit.googleapis.com/v1/accounts:signUp'
    : 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
  try {
    const res = await fetch(`${endpoint}?key=${encodeURIComponent(FIREBASE_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const idToken = typeof data.idToken === 'string' ? data.idToken.trim() : '';
    return idToken || null;
  } catch {
    return null;
  }
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function normalizeAuthPayload(data) {
  const uid = typeof data.uid === 'string'
    ? data.uid.trim()
    : typeof data.userId === 'string'
      ? data.userId.trim()
      : typeof data.id === 'string'
        ? data.id.trim()
        : '';
  const token = typeof data.token === 'string'
    ? data.token.trim()
    : typeof data.jwt === 'string'
      ? data.jwt.trim()
      : typeof data.accessToken === 'string'
        ? data.accessToken.trim()
        : '';
  const pseudo = typeof data.pseudo === 'string'
    ? data.pseudo.trim()
    : typeof data.username === 'string'
      ? data.username.trim()
      : '';
  return { uid, token, pseudo };
}

async function postBackendAuth(path, payload) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await readJsonSafe(res);
  return { ok: res.ok, status: res.status, data };
}

/** Default rates (golden_retriever–class profile) if API omits zeros. */
function normalizeTickMeta(raw) {
  if (raw == null || typeof raw !== 'object') return null;
  const m = /** @type {Record<string, unknown>} */ (raw);
  return {
    demoStepMs: Number(m.demoStepMs) || 10_000,
    is_demo_mode: m.is_demo_mode === true,
    difficulty_hardcore: m.difficulty_hardcore === true,
    foodLossPerHour: Number(m.foodLossPerHour) || 5,
    waterLossPerHour: Number(m.waterLossPerHour) || 7,
    healthLossPerHourWhenDepleted: Number(m.healthLossPerHourWhenDepleted) || 10,
    demoFoodLossPer10s: Number(m.demoFoodLossPer10s) || 1,
    demoWaterLossPer10s: Number(m.demoWaterLossPer10s) || 1,
    demoHealthLossPer10sWhenDepleted: Number(m.demoHealthLossPer10sWhenDepleted) || 2,
  };
}

/** When `tick_meta` is missing from JSON (older server). */
function buildFallbackTickMeta(/** @type {Record<string, unknown>} */ data, primary) {
  const breed =
    primary && typeof primary.breed === 'string' ? primary.breed : 'golden_retriever';
  const b = breed.toLowerCase().replace(/\s+/g, '_');
  const water = b === 'golden_retriever' ? 7 : 5;
  return normalizeTickMeta({
    demoStepMs: 10_000,
    is_demo_mode: data.is_demo_mode === true,
    difficulty_hardcore: data.difficulty_mode === 'hardcore',
    foodLossPerHour: 5,
    waterLossPerHour: water,
    healthLossPerHourWhenDepleted: 10,
    demoFoodLossPer10s: 1,
    demoWaterLossPer10s: 1,
    demoHealthLossPer10sWhenDepleted: 2,
  });
}

function resolveTickMeta(data, primary) {
  if (!primary) return null;
  const fromApi = normalizeTickMeta(primary.tick_meta);
  if (fromApi) return fromApi;
  return buildFallbackTickMeta(data, primary);
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
  authToken: '',
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
    const authTok = await getAuthToken();
    if (id) {
      set({
        userId: id,
        authToken: typeof authTok === 'string' ? authTok : '',
      });
    }
  },

  authApiLogin: async ({ email, password } = {}) => {
    const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pw = typeof password === 'string' ? password : '';
    if (!em || !pw) return false;
    try {
      // Prefer email/password contract (typical SQL auth backend),
      // then fallback to Firebase idToken contract for legacy compatibility.
      let authRes = await postBackendAuth('/auth/login', {
        email: em,
        password: pw,
      });
      if (!authRes.ok && authRes.status === 400) {
        const idToken = await firebaseAuthEmailPassword('login', em, pw);
        if (!idToken) return false;
        authRes = await postBackendAuth('/auth/login', { idToken });
      }
      if (!authRes.ok) return false;
      const { uid, token, pseudo } = normalizeAuthPayload(authRes.data);
      if (!uid) return false;
      set({ userId: uid, authToken: token });
      await setBackendUserId(uid);
      await setAuthToken(token);
      await cacheSessionUser({
        uid,
        email: em,
        displayName: pseudo,
      });
      return true;
    } catch {
      return false;
    }
  },

  authApiRegister: async ({ email, password, pseudo } = {}) => {
    const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const pw = typeof password === 'string' ? password : '';
    const pseudoTrimmed = typeof pseudo === 'string' ? pseudo.trim() : '';
    if (!em || !pw || !pseudoTrimmed) return false;
    try {
      let authRes = await postBackendAuth('/auth/register', {
        email: em,
        password: pw,
        pseudo: pseudoTrimmed,
      });
      if (!authRes.ok && authRes.status === 400) {
        const idToken = await firebaseAuthEmailPassword('register', em, pw);
        if (!idToken) return false;
        authRes = await postBackendAuth('/auth/register', {
          idToken,
          pseudo: pseudoTrimmed,
        });
      }
      if (!authRes.ok) return false;
      const { uid, token } = normalizeAuthPayload(authRes.data);
      if (!uid) return false;
      set({ userId: uid, authToken: token });
      await setBackendUserId(uid);
      await setAuthToken(token);
      await cacheSessionUser({
        uid,
        email: em,
        displayName: pseudoTrimmed,
      });
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
      const res = await fetch(`${API_URL}/dogs/${encodeURIComponent(userId)}`, {
        headers: jsonHeaders(get),
      });
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
      get().applyLiveTick();
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
        headers: jsonHeaders(get),
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
        headers: jsonHeaders(get),
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
        headers: jsonHeaders(get),
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
        headers: jsonHeaders(get),
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
        headers: jsonHeaders(get),
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
    const userId = get().userId;
    const dogId = get().dogId;
    if (!userId || !dogId) return { ok: false, error: 'userId/dogId manquant' };
    try {
      const res = await fetch(`${API_URL}/interact/water`, {
        method: 'PATCH',
        headers: jsonHeaders(get),
        body: JSON.stringify({ userId, dogId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          ok: false,
          error:
            typeof data.error === 'string'
              ? data.error
              : "Impossible de donner à boire pour l'instant.",
        };
      }
      await get().fetchDog();
      return { ok: true, data };
    } catch {
      return { ok: false, error: 'Erreur réseau' };
    }
  },

  updateSettings: async ({ difficulty_mode, is_demo_mode } = {}) => {
    const userId = get().userId;
    if (!userId) return { ok: false, error: 'userId manquant' };
    try {
      const res = await fetch(`${API_URL}/user/settings`, {
        method: 'PATCH',
        headers: jsonHeaders(get),
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
      authToken: '',
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
