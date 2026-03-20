import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const useDogStore = create((set) => ({
  hunger: 0,
  health: 0,
  maladie: 0,
  wallet_gold: 0,
  wallet_gems: 0,
  dogName: '',
  breed: '',
  fetchDog: async () => {
    const res = await fetch(`${API_URL}/dog`);
    if (!res.ok) return;
    const data = await res.json();
    set({
      hunger: Number(data.hunger) || 0,
      health: Number(data.health) || 0,
      maladie: Number(data.maladie) || 0,
      wallet_gold: Number(data.wallet_soft_gold ?? data.wallet_gold) || 0,
      wallet_gems: Number(data.wallet_hard_gems ?? data.wallet_gems) || 0,
      dogName: typeof data.nom === 'string' ? data.nom : '',
      breed: typeof data.race === 'string' ? data.race : '',
    });
  },
  initDog: async (nom, race) => {
    const res = await fetch(`${API_URL}/init-dog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, race }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    set({
      hunger: Number(data.hunger) || 0,
      health: Number(data.health) || 0,
      maladie: Number(data.maladie) || 0,
      wallet_gold: Number(data.wallet_soft_gold ?? data.wallet_gold) || 0,
      wallet_gems: Number(data.wallet_hard_gems ?? data.wallet_gems) || 0,
      dogName: typeof data.nom === 'string' ? data.nom : nom,
      breed: typeof data.race === 'string' ? data.race : race,
    });
    return true;
  },
}));
