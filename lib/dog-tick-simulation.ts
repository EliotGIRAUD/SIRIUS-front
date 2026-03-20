/**
 * Client-side dog stat decay — must stay in sync with `dogService.applyTickFromValues` (SIRIUS-back).
 * Used for smooth UI between throttled server syncs.
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
  let foodLoss = 0;
  let waterLoss = 0;

  if (meta.is_demo_mode) {
    const step = Math.max(1, meta.demoStepMs || 10_000);
    const steps = Math.floor(d / step);
    foodLoss = Math.floor(steps * meta.demoFoodLossPer10s * difficultyMult);
    waterLoss = Math.floor(steps * meta.demoWaterLossPer10s * difficultyMult);
  } else {
    const hours = d / (1000 * 60 * 60);
    foodLoss = Math.floor(hours * meta.foodLossPerHour * difficultyMult);
    waterLoss = Math.floor(hours * meta.waterLossPerHour * difficultyMult);
  }

  food = Math.max(0, food - foodLoss);
  water = Math.max(0, water - waterLoss);

  if (food === 0 || water === 0) {
    let healthLoss = 0;
    if (meta.is_demo_mode) {
      const step = Math.max(1, meta.demoStepMs || 10_000);
      const steps = Math.floor(d / step);
      healthLoss = Math.floor(steps * meta.demoHealthLossPer10sWhenDepleted * difficultyMult);
    } else {
      const hours = d / (1000 * 60 * 60);
      healthLoss = Math.floor(hours * meta.healthLossPerHourWhenDepleted * difficultyMult);
    }
    health = Math.max(0, health - healthLoss);
  }

  const maladie = health < 50 ? 100 : 0;
  return { food, water, health, maladie };
}
