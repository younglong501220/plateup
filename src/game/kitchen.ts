import { Appliance, ApplianceType, Customer, GameItem, PlayerState, Particle, FloatingText, DailyMission, MissionType } from './types';
import { doesPlateMatchRecipe, RECIPES } from './recipes';
import { sound } from './sound';

export const GRID_COLS = 12;
export const GRID_ROWS = 8;
export const TILE_SIZE = 70;

export function createInitialAppliances(): Appliance[] {
  return [
    // Top Row Kitchen Stations (Col 0 to 11)
    { id: 'app_bin', type: 'bin', x: 0, y: 1, item: null },
    { id: 'app_meat', type: 'crate_meat', x: 1, y: 1, item: null },
    { id: 'app_bun', type: 'crate_bun', x: 2, y: 1, item: null },
    { id: 'app_cheese', type: 'crate_cheese', x: 3, y: 1, item: null },
    { id: 'app_lettuce', type: 'crate_lettuce', x: 4, y: 1, item: null },
    { id: 'app_tomato', type: 'crate_tomato', x: 5, y: 1, item: null },
    { id: 'app_prep1', type: 'prep_board', x: 6, y: 1, item: null, progress: 0 },
    { id: 'app_prep2', type: 'prep_board', x: 7, y: 1, item: null, progress: 0 },
    { id: 'app_hob1', type: 'hob', x: 8, y: 1, item: null, progress: 0, burnProgress: 0 },
    { id: 'app_hob2', type: 'hob', x: 9, y: 1, item: null, progress: 0, burnProgress: 0 },
    { id: 'app_sink', type: 'sink', x: 10, y: 1, item: null, progress: 0 },
    { id: 'app_plates', type: 'plates', x: 11, y: 1, item: null, count: 5 },

    // Middle Island Work Counters (Rows 3 & 4)
    { id: 'app_cnt1', type: 'counter', x: 4, y: 3, item: null },
    { id: 'app_cnt2', type: 'counter', x: 5, y: 3, item: null },
    { id: 'app_cnt3', type: 'counter', x: 6, y: 3, item: null },
    { id: 'app_cnt4', type: 'counter', x: 7, y: 3, item: null },

    // Dining Tables
    { id: 'app_table1', type: 'table', x: 2, y: 6, item: null, tablePlate: null, customer: null },
    { id: 'app_table2', type: 'table', x: 5, y: 6, item: null, tablePlate: null, customer: null },
    { id: 'app_table3', type: 'table', x: 8, y: 6, item: null, tablePlate: null, customer: null },
  ];
}

export function generateDailyMission(day: number, availableRecipes: string[]): DailyMission {
  const missionTypes: MissionType[] = ['no_waste', 'no_burn', 'zero_unhappy', 'speed_serve'];
  if (availableRecipes.includes('salad')) missionTypes.push('serve_salad');
  if (availableRecipes.includes('steak')) missionTypes.push('serve_steak');

  const chosenType = missionTypes[Math.floor(Math.random() * missionTypes.length)];

  switch (chosenType) {
    case 'no_waste':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '綠色零廢棄 ♻️',
        desc: '今日營業全程「不丟棄任何食物」進廚餘桶',
        rewardGold: 35,
        type: 'no_waste',
        targetCount: 0,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
    case 'no_burn':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '米其林控火大師 🥩',
        desc: '今日營業全程「零肉排燒焦」',
        rewardGold: 30,
        type: 'no_burn',
        targetCount: 0,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
    case 'zero_unhappy':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '賓至如歸五星好評 💖',
        desc: '今日「零顧客憤怒離席」，保持聲望無扣除',
        rewardGold: 45,
        rewardRep: 1,
        type: 'zero_unhappy',
        targetCount: 0,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
    case 'speed_serve':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '極速出餐狂潮 ⚡',
        desc: '在顧客耐心高於 70% 時順利出餐 3 次',
        rewardGold: 40,
        type: 'speed_serve',
        targetCount: 3,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
    case 'serve_salad':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '田園生菜特推 🥗',
        desc: '今日成功端出田園鮮蔬沙拉 2 份',
        rewardGold: 45,
        type: 'serve_salad',
        targetCount: 2,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
    case 'serve_steak':
      return {
        id: `mission_${day}_${Date.now()}`,
        title: '頂級牛排之夜 🥩',
        desc: '今日成功端出炙烤香煎牛排 2 份',
        rewardGold: 50,
        type: 'serve_steak',
        targetCount: 2,
        currentCount: 0,
        isFailed: false,
        isCompleted: false,
      };
  }
}

const CUSTOMER_PALETTES = [
  { color: '#e63946', skin: '#ffd166' },
  { color: '#457b9d', skin: '#ffcad4' },
  { color: '#2a9d8f', skin: '#f4a261' },
  { color: '#9b5de5', skin: '#fed9b7' },
  { color: '#f77f00', skin: '#ffe5d9' },
  { color: '#00b4d8', skin: '#fcd5ce' },
];

export function spawnCustomerForTable(
  table: Appliance,
  allowedOrders: string[],
  patienceMultiplier: number
): Customer {
  const palette = CUSTOMER_PALETTES[Math.floor(Math.random() * CUSTOMER_PALETTES.length)];
  const order = allowedOrders[Math.floor(Math.random() * allowedOrders.length)];
  const basePatience = order === 'cheeseburger' ? 120 : 100;
  const maxP = basePatience * patienceMultiplier;

  return {
    id: `cust_${Date.now()}_${Math.random()}`,
    tableId: table.id,
    order,
    state: 'waiting',
    patience: maxP,
    maxPatience: maxP,
    eatingTimer: 45, // ticks to eat
    color: palette.color,
    skinColor: palette.skin,
  };
}

/**
 * Finds the appliance directly in front of the player or nearest
 */
export function getTargetAppliance(player: PlayerState, appliances: Appliance[]): Appliance | null {
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  // Compute offset in facing direction
  let targetX = px;
  let targetY = py;
  const reach = 48;

  if (player.facing === 'up') targetY -= reach;
  else if (player.facing === 'down') targetY += reach;
  else if (player.facing === 'left') targetX -= reach;
  else if (player.facing === 'right') targetX += reach;

  let bestApp: Appliance | null = null;
  let minDist = 75;

  for (const app of appliances) {
    const ax = app.x * TILE_SIZE + TILE_SIZE / 2;
    const ay = app.y * TILE_SIZE + TILE_SIZE / 2;
    const dist = Math.hypot(targetX - ax, targetY - ay);
    if (dist < minDist) {
      minDist = dist;
      bestApp = app;
    }
  }

  // Fallback to closest within immediate proximity if facing empty
  if (!bestApp) {
    let closestDist = 58;
    for (const app of appliances) {
      const ax = app.x * TILE_SIZE + TILE_SIZE / 2;
      const ay = app.y * TILE_SIZE + TILE_SIZE / 2;
      const dist = Math.hypot(px - ax, py - ay);
      if (dist < closestDist) {
        closestDist = dist;
        bestApp = app;
      }
    }
  }

  return bestApp;
}

/**
 * Checks bounding collision against room walls and appliances
 */
export function checkCollision(x: number, y: number, w: number, h: number, appliances: Appliance[]): boolean {
  // Room boundary
  const minX = 10;
  const maxX = (GRID_COLS - 0.2) * TILE_SIZE - w;
  const minY = 50;
  const maxY = (GRID_ROWS - 0.2) * TILE_SIZE - h;

  if (x < minX || x > maxX || y < minY || y > maxY) return true;

  // Solid appliances
  const padding = 10;
  for (const app of appliances) {
    const ax = app.x * TILE_SIZE + padding;
    const ay = app.y * TILE_SIZE + padding;
    const aw = TILE_SIZE - padding * 2;
    const ah = TILE_SIZE - padding * 2;

    if (x < ax + aw && x + w > ax && y < ay + ah && y + h > ay) {
      return true;
    }
  }

  return false;
}
