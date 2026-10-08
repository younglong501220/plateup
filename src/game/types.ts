export type GamePhase = 'PREP' | 'SERVICE' | 'SHOP' | 'GAMEOVER';

export type ItemType = 
  | 'raw_meat'
  | 'cooked_meat'
  | 'burnt_meat'
  | 'bun'
  | 'cheese'
  | 'sliced_cheese'
  | 'lettuce'
  | 'sliced_lettuce'
  | 'tomato'
  | 'sliced_tomato'
  | 'plate'
  | 'dirty_plate';

export interface GameItem {
  type: ItemType;
  contents?: ItemType[]; // for plates holding ingredients
}

export type ApplianceType =
  | 'crate_meat'
  | 'crate_bun'
  | 'crate_cheese'
  | 'crate_lettuce'
  | 'crate_tomato'
  | 'hob'
  | 'sink'
  | 'prep_board'
  | 'counter'
  | 'plates'
  | 'bin'
  | 'table';

export interface Appliance {
  id: string;
  type: ApplianceType;
  x: number; // grid column (0-indexed)
  y: number; // grid row (0-indexed)
  item: GameItem | null;
  progress?: number; // 0 to 100 for cooking/washing/chopping
  burnProgress?: number; // 0 to 100 for overcooking
  count?: number; // for plate stack
  tablePlate?: GameItem | null; // for dining table dirty dish
  customer?: Customer | null; // customer currently seated
  isUpgraded?: boolean; // e.g. turbo hob, power sink
}

export type CustomerState = 'walking_in' | 'waiting' | 'eating' | 'leaving';

export interface Customer {
  id: string;
  tableId: string;
  order: string; // e.g. 'burger', 'cheeseburger', 'salad', 'deluxe_burger', 'steak'
  state: CustomerState;
  patience: number;
  maxPatience: number;
  eatingTimer: number;
  color: string;
  skinColor: string;
}

export interface UpgradeCard {
  id: string;
  name: string;
  desc: string;
  cost: number;
  icon: string;
  tag: string;
  applied: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'square' | 'sparkle';
}

export interface PlayerState {
  x: number; // world x pixels
  y: number; // world y pixels
  w: number;
  h: number;
  dirX: number; // -1, 0, 1
  dirY: number; // -1, 0, 1
  facing: 'up' | 'down' | 'left' | 'right';
  heldItem: GameItem | null;
  walkFrame: number;
  isMoving: boolean;
}

export interface KitchenStats {
  dishesServedTotal: number;
  dishesServedToday: number;
  moneyEarnedTotal: number;
  bestDay: number;
  missionsCompleted: number;
}

export interface HallOfFameData {
  bestDay: number;
  bestMoney: number;
  bestMissions: number;
  bestDishes: number;
}

export type MissionType = 
  | 'no_waste'      // 零廚餘：不丟棄任何食物
  | 'no_burn'       // 完美火候：無肉排燒焦
  | 'zero_unhappy'  // 零憤怒：無顧客憤怒離席
  | 'speed_serve'   // 快速出餐：在耐心80%以上出餐指定次數
  | 'serve_salad'   // 今日特色：完成田園沙拉
  | 'serve_steak';  // 今日特色：完成頂級牛排

export interface DailyMission {
  id: string;
  title: string;
  desc: string;
  rewardGold: number;
  rewardRep?: number;
  type: MissionType;
  targetCount: number;
  currentCount: number;
  isFailed: boolean;
  isCompleted: boolean;
}

export interface RushHourState {
  isActive: boolean;
  timeLeft: number; // seconds remaining
  totalDuration: number;
  hasTriggeredToday: boolean;
}

export interface KitchenBot {
  id: string;
  type: 'apprentice' | 'delivery';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  heldItem: GameItem | null;
  actionCooldown: number;
}

