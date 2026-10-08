import { HallOfFameData } from './types';

const HOF_STORAGE_KEY = 'plateup_hall_of_fame';

export function loadHallOfFame(): HallOfFameData {
  try {
    const raw = localStorage.getItem(HOF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bestDay: typeof parsed.bestDay === 'number' ? parsed.bestDay : 1,
        bestMoney: typeof parsed.bestMoney === 'number' ? parsed.bestMoney : 0,
        bestMissions: typeof parsed.bestMissions === 'number' ? parsed.bestMissions : 0,
        bestDishes: typeof parsed.bestDishes === 'number' ? parsed.bestDishes : 0,
      };
    }
  } catch {
    // fallback if JSON parse fails
  }

  // Backwards compatibility with previous single key
  const legacyBestDay = parseInt(localStorage.getItem('plateup_best_day') || '1', 10);

  return {
    bestDay: legacyBestDay || 1,
    bestMoney: 0,
    bestMissions: 0,
    bestDishes: 0,
  };
}

export function updateHallOfFame(
  day: number,
  moneyEarned: number,
  missionsCompleted: number,
  dishesServed: number
): { data: HallOfFameData; isNewRecord: boolean; recordKeys: string[] } {
  const current = loadHallOfFame();
  const recordKeys: string[] = [];

  let isNewRecord = false;
  const nextData: HallOfFameData = { ...current };

  if (day > current.bestDay) {
    nextData.bestDay = day;
    isNewRecord = true;
    recordKeys.push('day');
  }

  if (moneyEarned > current.bestMoney) {
    nextData.bestMoney = moneyEarned;
    isNewRecord = true;
    recordKeys.push('money');
  }

  if (missionsCompleted > current.bestMissions) {
    nextData.bestMissions = missionsCompleted;
    isNewRecord = true;
    recordKeys.push('missions');
  }

  if (dishesServed > current.bestDishes) {
    nextData.bestDishes = dishesServed;
    isNewRecord = true;
    recordKeys.push('dishes');
  }

  try {
    localStorage.setItem(HOF_STORAGE_KEY, JSON.stringify(nextData));
    localStorage.setItem('plateup_best_day', nextData.bestDay.toString());
  } catch {
    // storage safe fail
  }

  return {
    data: nextData,
    isNewRecord,
    recordKeys,
  };
}
