/**
 * Client-side dog stat decay — must stay in sync with `dogService.applyTickFromValues` (SIRIUS-back).
 * Uses continuous drain (fractional steps / hours) so the HUD can update every second.
 */

export type TickMeta = {
  demoStepMs: number;
  is_demo_mode: boolean;
  difficulty_hardcore: boolean;
  foodLossPerHour: number;
  waterLossPerHour: number;
  healthLossPerHourWhenDepleted: number;
  demoFoodLossPer10s: number;
  demoWaterLossPer10s: number;
  demoHealthLossPer10sWhenDepleted: number;
};

const MAX_STAT = 100;

/**
 * From a snapshot at time T, apply the same decay as the server for `deltaMs` ms after T.
 */
export function simulateDogStatsFromAnchor(
  foodStart: number,
  waterStart: number,
  healthStart: number,
  deltaMs: number,
  meta: TickMeta,
): { food: number; water: number; health: number; maladie: number } {
  const d = Math.max(0, deltaMs);
  let food = Number.isFinite(foodStart) ? foodStart : MAX_STAT;
  let water = Number.isFinite(waterStart) ? waterStart : MAX_STAT;
  let health = Number.isFinite(healthStart) ? healthStart : MAX_STAT;

  const difficultyMult = meta.difficulty_hardcore ? 2 : 1;
  const stepMs = Math.max(1, meta.demoStepMs || 10_000);

  if (meta.is_demo_mode) {
    const u = d / stepMs;
    food = Math.max(0, Math.floor(food - u * meta.demoFoodLossPer10s * difficultyMult + 1e-9));
    water = Math.max(0, Math.floor(water - u * meta.demoWaterLossPer10s * difficultyMult + 1e-9));
  } else {
    const foodLoss = Math.floor((d / (1000 * 60 * 60)) * meta.foodLossPerHour * difficultyMult);
    const waterLoss = Math.floor((d / (1000 * 60 * 60)) * meta.waterLossPerHour * difficultyMult);
    food = Math.max(0, food - foodLoss);
    water = Math.max(0, water - waterLoss);
  }

  if (food === 0 || water === 0) {
    if (meta.is_demo_mode) {
      const u = d / stepMs;
      const lost = u * meta.demoHealthLossPer10sWhenDepleted * difficultyMult;
      health = Math.max(0, Math.floor(health - lost + 1e-9));
    } else {
      const healthLoss = Math.floor((d / (1000 * 60 * 60)) * meta.healthLossPerHourWhenDepleted * difficultyMult);
      health = Math.max(0, health - healthLoss);
    }
  }

  const maladie = health < 50 ? 100 : 0;
  return { food, water, health, maladie };
}
