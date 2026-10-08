import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GamePhase, Appliance, Customer, GameItem, Particle, PlayerState, FloatingText, KitchenStats, UpgradeCard, DailyMission, RushHourState, KitchenBot, HallOfFameData } from './game/types';
import { GRID_COLS, GRID_ROWS, TILE_SIZE, createInitialAppliances, getTargetAppliance, checkCollision, spawnCustomerForTable, generateDailyMission } from './game/kitchen';
import { GameRenderer } from './game/renderer';
import { sound } from './game/sound';
import { RECIPES, doesPlateMatchRecipe, getPlateDescription } from './game/recipes';
import { INITIAL_UPGRADE_POOL } from './game/upgrades';
import { loadHallOfFame, updateHallOfFame } from './game/storage';
import { HeaderHUD } from './components/HeaderHUD';
import { RecipeModal } from './components/RecipeModal';
import { NightShopModal } from './components/NightShopModal';
import { GameOverModal } from './components/GameOverModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import { TouchControls } from './components/TouchControls';
import { UtensilsCrossed, HelpCircle, Bell, Zap, Target, Trophy } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // High-level game states
  const [phase, setPhase] = useState<GamePhase>('PREP');
  const [day, setDay] = useState<number>(1);
  const [money, setMoney] = useState<number>(0);
  const [reputation, setReputation] = useState<number>(3);
  const [customersRemaining, setCustomersRemaining] = useState<number>(4);
  const [dayEarnings, setDayEarnings] = useState<number>(0);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [heldItemName, setHeldItemName] = useState<string>('空手');
  const [showTouchControls, setShowTouchControls] = useState<boolean>(false);

  // Hall of Fame Persistent Records
  const [hallOfFame, setHallOfFame] = useState<HallOfFameData>(() => loadHallOfFame());
  const [newRecords, setNewRecords] = useState<string[]>([]);

  // Daily Mission State
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(() => generateDailyMission(1, ['burger']));

  // Rush Hour State
  const [rushHour, setRushHour] = useState<RushHourState>({
    isActive: false,
    timeLeft: 0,
    totalDuration: 20,
    hasTriggeredToday: false,
  });

  // Upgrades & Shop
  const [upgrades, setUpgrades] = useState<UpgradeCard[]>(INITIAL_UPGRADE_POOL);
  const [availableShopUpgrades, setAvailableShopUpgrades] = useState<UpgradeCard[]>([]);

  // Golden Bell ability
  const [hasBell, setHasBell] = useState<boolean>(false);
  const [bellUsesLeft, setBellUsesLeft] = useState<number>(2);

  // Statistics
  const [stats, setStats] = useState<KitchenStats>(() => {
    const savedBest = parseInt(localStorage.getItem('plateup_best_day') || '1', 10);
    return {
      dishesServedTotal: 0,
      dishesServedToday: 0,
      moneyEarnedTotal: 0,
      bestDay: savedBest,
      missionsCompleted: 0,
    };
  });

  // Bots state
  const botsRef = useRef<KitchenBot[]>([]);

  // Game Mutable State Refs (for smooth 60fps canvas loop without re-render thrashing)
  const playerRef = useRef<PlayerState>({
    x: 5 * TILE_SIZE,
    y: 3.5 * TILE_SIZE,
    w: 38,
    h: 38,
    dirX: 0,
    dirY: 0,
    facing: 'down',
    heldItem: null,
    walkFrame: 0,
    isMoving: false,
  });

  const appliancesRef = useRef<Appliance[]>(createInitialAppliances());
  const activeCustomersRef = useRef<Customer[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const touchDirRef = useRef<'up' | 'down' | 'left' | 'right' | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const phaseRef = useRef<GamePhase>('PREP');
  const dayRef = useRef<number>(1);
  const moneyRef = useRef<number>(0);
  const repRef = useRef<number>(3);
  const customersLeftRef = useRef<number>(4);
  const totalCustomersStartRef = useRef<number>(4);
  const dayEarningsRef = useRef<number>(0);
  const dailyMissionRef = useRef<DailyMission | null>(dailyMission);
  const rushHourRef = useRef<RushHourState>(rushHour);

  // Buffs & Unlocks Ref
  const buffsRef = useRef({
    playerSpeed: 1.0,
    cookSpeed: 1.0,
    washSpeed: 1.0,
    patience: 1.0,
    tips: 0,
    noBurn: false,
    autoDishwasher: false,
    cheeseUnlocked: false,
    saladUnlocked: false,
    steakUnlocked: false,
    deluxeUnlocked: false,
    magicSpice: false,
    hasDeliveryBot: false,
    hasApprenticeBot: false,
  });

  // Sync refs
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    moneyRef.current = money;
  }, [money]);
  useEffect(() => {
    repRef.current = reputation;
  }, [reputation]);
  useEffect(() => {
    dailyMissionRef.current = dailyMission;
  }, [dailyMission]);
  useEffect(() => {
    rushHourRef.current = rushHour;
  }, [rushHour]);

  // Spawn visual floating text
  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: `${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -1.2,
    });
  }, []);

  // Spawn visual particles
  const addParticles = useCallback((x: number, y: number, color: string, count: number = 5, shape: 'circle' | 'square' | 'sparkle' = 'circle') => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 0.5,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: Math.floor(Math.random() * 20 + 20),
        shape,
      });
    }
  }, []);

  // Sound handlers
  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  }, [isMuted]);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    sound.setVolume(vol);
  }, []);

  // Ring Golden Service Bell
  const handleRingBell = useCallback(() => {
    if (!hasBell || bellUsesLeft <= 0 || phaseRef.current !== 'SERVICE') return;

    sound.sfxBell();
    setBellUsesLeft((prev) => prev - 1);

    // Heal all customers patience by +50%
    activeCustomersRef.current.forEach((cust) => {
      if (cust.state === 'waiting') {
        cust.patience = Math.min(cust.maxPatience, cust.patience + cust.maxPatience * 0.5);
      }
    });

    const px = playerRef.current.x + playerRef.current.w / 2;
    const py = playerRef.current.y - 20;
    addFloatingText(px, py, '🔔 迎賓金鐘奏響！全員耐心大幅回復！', '#fde047');
    addParticles(px, py, '#fde047', 15, 'sparkle');
  }, [hasBell, bellUsesLeft, addFloatingText, addParticles]);

  // Customer Serving logic
  const handleServeOrder = (app: Appliance, player: PlayerState) => {
    if (!app.customer || !player.heldItem || player.heldItem.type !== 'plate') return false;
    const cust = app.customer;
    if (cust.state !== 'waiting') return false;

    // Check if plate matches order
    if (doesPlateMatchRecipe(player.heldItem, cust.order)) {
      const orderType = cust.order;
      const initialPatienceRatio = cust.patience / cust.maxPatience;

      player.heldItem = null;
      setHeldItemName('空手');
      cust.state = 'eating';
      cust.eatingTimer = 50;

      const recipe = RECIPES[orderType];
      let earn = (recipe ? recipe.price : 20) + buffsRef.current.tips;
      if (buffsRef.current.magicSpice) {
        earn = Math.round(earn * 1.35);
      }

      sound.sfxServe();
      const tx = app.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = app.y * TILE_SIZE + TILE_SIZE / 2;
      addFloatingText(tx, ty - 20, `上菜成功! +$${earn}`, '#34d399');
      addParticles(tx, ty, '#fbbf24', 8, 'sparkle');

      // Update Daily Mission progress
      if (dailyMissionRef.current && !dailyMissionRef.current.isFailed) {
        const m = dailyMissionRef.current;
        if (m.type === 'speed_serve' && initialPatienceRatio >= 0.7) {
          m.currentCount += 1;
          if (m.currentCount >= m.targetCount) {
            m.isCompleted = true;
            sound.sfxMissionComplete();
            addFloatingText(tx, ty - 40, '🎯 每日目標達成！', '#38bdf8');
          }
          setDailyMission({ ...m });
        } else if (m.type === 'serve_salad' && orderType === 'salad') {
          m.currentCount += 1;
          if (m.currentCount >= m.targetCount) {
            m.isCompleted = true;
            sound.sfxMissionComplete();
            addFloatingText(tx, ty - 40, '🎯 每日目標達成！', '#38bdf8');
          }
          setDailyMission({ ...m });
        } else if (m.type === 'serve_steak' && orderType === 'steak') {
          m.currentCount += 1;
          if (m.currentCount >= m.targetCount) {
            m.isCompleted = true;
            sound.sfxMissionComplete();
            addFloatingText(tx, ty - 40, '🎯 每日目標達成！', '#38bdf8');
          }
          setDailyMission({ ...m });
        }
      }

      // Update financial stats
      setMoney((prev) => {
        const next = prev + earn;
        moneyRef.current = next;
        return next;
      });
      setDayEarnings((prev) => prev + earn);
      dayEarningsRef.current += earn;

      setStats((prev) => {
        const total = prev.moneyEarnedTotal + earn;
        return {
          ...prev,
          dishesServedToday: prev.dishesServedToday + 1,
          dishesServedTotal: prev.dishesServedTotal + 1,
          moneyEarnedTotal: total,
        };
      });

      return true;
    } else {
      // Wrong dish served
      sound.sfxFail();
      const tx = app.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = app.y * TILE_SIZE + TILE_SIZE / 2;
      addFloatingText(tx, ty - 10, '餐點錯誤！', '#f87171');
      return false;
    }
  };

  // Main interaction: SPACE key (Pick / Drop / Assemble)
  const interactSpace = useCallback(() => {
    const player = playerRef.current;
    const app = getTargetAppliance(player, appliancesRef.current);
    if (!app) return;

    // 1. Trash Bin
    if (app.type === 'bin' && player.heldItem) {
      sound.sfxTrash();
      const tx = app.x * TILE_SIZE + TILE_SIZE / 2;
      const ty = app.y * TILE_SIZE + TILE_SIZE / 2;
      addFloatingText(tx, ty - 15, '已丟棄', '#94a3b8');

      // Fail 'no_waste' mission
      if (dailyMissionRef.current && dailyMissionRef.current.type === 'no_waste') {
        dailyMissionRef.current.isFailed = true;
        setDailyMission({ ...dailyMissionRef.current });
        addFloatingText(tx, ty - 32, '❌ 產生廚餘，挑戰失敗！', '#ef4444');
      }

      player.heldItem = null;
      setHeldItemName('空手');
      return;
    }

    // 2. Ingredient Crates (when empty handed)
    if (!player.heldItem) {
      if (app.type === 'crate_meat') {
        player.heldItem = { type: 'raw_meat' };
        sound.sfxPick();
        setHeldItemName('生肉排');
        return;
      }
      if (app.type === 'crate_bun') {
        player.heldItem = { type: 'bun' };
        sound.sfxPick();
        setHeldItemName('漢堡麵包');
        return;
      }
      if (app.type === 'crate_cheese') {
        player.heldItem = { type: 'cheese' };
        sound.sfxPick();
        setHeldItemName('整塊起司');
        return;
      }
      if (app.type === 'crate_lettuce') {
        player.heldItem = { type: 'lettuce' };
        sound.sfxPick();
        setHeldItemName('新鮮生菜');
        return;
      }
      if (app.type === 'crate_tomato') {
        player.heldItem = { type: 'tomato' };
        sound.sfxPick();
        setHeldItemName('紅番茄');
        return;
      }
      if (app.type === 'plates' && (app.count || 0) > 0) {
        app.count = (app.count || 0) - 1;
        player.heldItem = { type: 'plate', contents: [] };
        sound.sfxPick();
        setHeldItemName('乾淨餐盤');
        return;
      }
    }

    // 3. Stove / Hob
    if (app.type === 'hob') {
      // Put raw meat on hob
      if (player.heldItem?.type === 'raw_meat' && !app.item) {
        app.item = player.heldItem;
        app.progress = 0;
        app.burnProgress = 0;
        player.heldItem = null;
        sound.sfxDrop();
        setHeldItemName('空手');
        return;
      }

      // Pick up cooked meat with plate directly!
      if (app.item?.type === 'cooked_meat' && player.heldItem?.type === 'plate') {
        if (!player.heldItem.contents) player.heldItem.contents = [];
        player.heldItem.contents.push('cooked_meat');
        app.item = null;
        app.progress = 0;
        app.burnProgress = 0;
        sound.sfxPick();
        setHeldItemName(getPlateDescription(player.heldItem));
        return;
      }

      // Pick up cooked or burnt meat empty handed
      if (app.item && !player.heldItem) {
        player.heldItem = app.item;
        app.item = null;
        app.progress = 0;
        app.burnProgress = 0;
        sound.sfxPick();
        setHeldItemName(player.heldItem.type === 'burnt_meat' ? '燒焦肉排 (需丟棄)' : '熟肉排');
        return;
      }
    }

    // 4. Prep Board (Chop board for cheese, lettuce, tomato)
    if (app.type === 'prep_board') {
      // Place whole ingredient on board to chop
      if (['cheese', 'lettuce', 'tomato'].includes(player.heldItem?.type || '') && !app.item) {
        app.item = player.heldItem;
        app.progress = 0;
        player.heldItem = null;
        sound.sfxDrop();
        setHeldItemName('空手');
        return;
      }
      // General place on prep board
      if (player.heldItem && !app.item) {
        app.item = player.heldItem;
        player.heldItem = null;
        sound.sfxDrop();
        setHeldItemName('空手');
        return;
      }
      // Pick up item on prep board empty-handed
      if (app.item && !player.heldItem) {
        player.heldItem = app.item;
        app.item = null;
        sound.sfxPick();
        setHeldItemName(
          player.heldItem.type === 'sliced_cheese' ? '切片起司' :
          player.heldItem.type === 'sliced_lettuce' ? '切片生菜' :
          player.heldItem.type === 'sliced_tomato' ? '切片番茄' : player.heldItem.type
        );
        return;
      }
      // Direct plating of prepared ingredients from prep board into plate!
      if (app.item && ['sliced_cheese', 'sliced_lettuce', 'sliced_tomato'].includes(app.item.type) && player.heldItem?.type === 'plate') {
        if (!player.heldItem.contents) player.heldItem.contents = [];
        player.heldItem.contents.push(app.item.type as any);
        app.item = null;
        app.progress = 0;
        sound.sfxPick();
        setHeldItemName(getPlateDescription(player.heldItem));
        return;
      }
    }

    // 5. Work Counter (Hold or Assemble)
    if (app.type === 'counter') {
      if (!app.item && player.heldItem) {
        app.item = player.heldItem;
        player.heldItem = null;
        sound.sfxDrop();
        setHeldItemName('空手');
        return;
      }
      if (app.item && !player.heldItem) {
        player.heldItem = app.item;
        app.item = null;
        sound.sfxPick();
        setHeldItemName(player.heldItem.type === 'plate' ? getPlateDescription(player.heldItem) : player.heldItem.type);
        return;
      }
      // Assembly on counter: Plate in hand + counter ingredient
      if (player.heldItem?.type === 'plate' && app.item) {
        const canAdd = ['bun', 'cooked_meat', 'sliced_cheese', 'sliced_lettuce', 'sliced_tomato'].includes(app.item.type);
        if (canAdd) {
          if (!player.heldItem.contents) player.heldItem.contents = [];
          player.heldItem.contents.push(app.item.type as any);
          app.item = null;
          sound.sfxPick();
          setHeldItemName(getPlateDescription(player.heldItem));
          return;
        }
      }
      // Assembly on counter: Plate on counter + ingredient in hand
      if (app.item?.type === 'plate' && player.heldItem) {
        const canAdd = ['bun', 'cooked_meat', 'sliced_cheese', 'sliced_lettuce', 'sliced_tomato'].includes(player.heldItem.type);
        if (canAdd) {
          if (!app.item.contents) app.item.contents = [];
          app.item.contents.push(player.heldItem.type as any);
          player.heldItem = null;
          sound.sfxPick();
          setHeldItemName('空手');
          return;
        }
      }
    }

    // 6. Dining Table
    if (app.type === 'table') {
      // Serve customer
      if (app.customer && app.customer.state === 'waiting' && player.heldItem?.type === 'plate') {
        handleServeOrder(app, player);
        return;
      }
      // Collect dirty plate
      if (app.tablePlate && !player.heldItem) {
        player.heldItem = app.tablePlate;
        app.tablePlate = null;
        sound.sfxPick();
        setHeldItemName('髒餐盤');
        return;
      }
    }

    // 7. Sink (Dishwashing)
    if (app.type === 'sink') {
      // Put dirty plate into sink
      if (player.heldItem?.type === 'dirty_plate' && !app.item) {
        app.item = player.heldItem;
        app.progress = 0;
        player.heldItem = null;
        sound.sfxDrop();
        setHeldItemName('空手');
        return;
      }
      // Take clean plate from sink
      if (app.item?.type === 'plate' && !player.heldItem) {
        player.heldItem = app.item;
        app.item = null;
        sound.sfxPick();
        setHeldItemName('乾淨餐盤');
        return;
      }
    }
  }, [addFloatingText]);

  // Secondary interaction: E key held (Chop / Wash)
  const interactActionE = useCallback(() => {
    const player = playerRef.current;
    const app = getTargetAppliance(player, appliancesRef.current);
    if (!app) return;

    // Wash dirty plate in sink
    if (app.type === 'sink' && app.item?.type === 'dirty_plate') {
      app.progress = (app.progress || 0) + 1.8 * buffsRef.current.washSpeed;
      sound.sfxWash();
      addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#38bdf8', 2);

      if (app.progress >= 100) {
        app.item = { type: 'plate', contents: [] };
        app.progress = 0;
        sound.sfxCoin();
        addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '清洗完成 ✨', '#38bdf8');
      }
      return;
    }

    // Chop cheese on prep board
    if (app.type === 'prep_board' && app.item?.type === 'cheese') {
      app.progress = (app.progress || 0) + 2.5;
      sound.sfxChop();
      addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#facc15', 2);

      if (app.progress >= 100) {
        app.item = { type: 'sliced_cheese' };
        app.progress = 0;
        sound.sfxPick();
        addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '起司切片完成 🧀', '#facc15');
      }
      return;
    }

    // Chop lettuce on prep board
    if (app.type === 'prep_board' && app.item?.type === 'lettuce') {
      app.progress = (app.progress || 0) + 2.5;
      sound.sfxChopVegetable();
      addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#22c55e', 2);

      if (app.progress >= 100) {
        app.item = { type: 'sliced_lettuce' };
        app.progress = 0;
        sound.sfxPick();
        addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '生菜切碎完成 🥗', '#22c55e');
      }
      return;
    }

    // Chop tomato on prep board
    if (app.type === 'prep_board' && app.item?.type === 'tomato') {
      app.progress = (app.progress || 0) + 2.5;
      sound.sfxChopVegetable();
      addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#ef4444', 2);

      if (app.progress >= 100) {
        app.item = { type: 'sliced_tomato' };
        app.progress = 0;
        sound.sfxPick();
        addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '番茄切片完成 🍅', '#ef4444');
      }
      return;
    }
  }, [addFloatingText, addParticles]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        interactSpace();
      }
      if (e.code === 'KeyQ') {
        e.preventDefault();
        handleRingBell();
      }
      if (e.code === 'KeyE') {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [interactSpace, handleRingBell]);

  // Touch Direction handler
  const handleTouchDir = useCallback((dir: 'up' | 'down' | 'left' | 'right' | null) => {
    touchDirRef.current = dir;
  }, []);

  const handleTouchEDown = useCallback(() => {
    keysRef.current['KeyE'] = true;
  }, []);

  const handleTouchEUp = useCallback(() => {
    keysRef.current['KeyE'] = false;
  }, []);

  // Start Open for Business (Service Phase)
  const handleStartService = () => {
    setPhase('SERVICE');
    phaseRef.current = 'SERVICE';
    lastSpawnTimeRef.current = performance.now();
    sound.sfxServe();
  };

  // End of Day: Enter Shop Phase
  const handleEndDay = useCallback(() => {
    setPhase('SHOP');
    phaseRef.current = 'SHOP';
    sound.sfxDayClear();

    // Check completion of passive daily missions
    if (dailyMissionRef.current && !dailyMissionRef.current.isFailed) {
      const m = dailyMissionRef.current;
      if (m.type === 'no_waste' || m.type === 'no_burn' || m.type === 'zero_unhappy') {
        m.isCompleted = true;
        sound.sfxMissionComplete();

        // Add bonus reward
        setMoney((prev) => {
          const next = prev + m.rewardGold;
          moneyRef.current = next;
          return next;
        });
        if (m.rewardRep) {
          setReputation((prev) => Math.min(3, prev + (m.rewardRep || 0)));
          repRef.current = Math.min(3, repRef.current + (m.rewardRep || 0));
        }
        setStats((prev) => ({
          ...prev,
          missionsCompleted: prev.missionsCompleted + 1,
          moneyEarnedTotal: prev.moneyEarnedTotal + m.rewardGold,
        }));
      }
      setDailyMission({ ...m });
    }

    // Draft 3 random unapplied upgrades
    const unapplied = upgrades.filter((u) => !u.applied);
    const shuffled = [...unapplied].sort(() => 0.5 - Math.random()).slice(0, 3);
    setAvailableShopUpgrades(shuffled);
  }, [upgrades]);

  // Buy upgrade card
  const handleBuyUpgrade = (upgrade: UpgradeCard) => {
    if (money < upgrade.cost) return;

    const newMoney = money - upgrade.cost;
    setMoney(newMoney);
    moneyRef.current = newMoney;
    sound.sfxUpgrade();

    // Mark applied
    setUpgrades((prev) =>
      prev.map((u) => (u.id === upgrade.id ? { ...u, applied: true } : u))
    );
    setAvailableShopUpgrades((prev) =>
      prev.map((u) => (u.id === upgrade.id ? { ...u, applied: true } : u))
    );

    // Apply buff effects
    if (upgrade.id === 'boots') {
      buffsRef.current.playerSpeed += 0.3;
    } else if (upgrade.id === 'turbo_hob') {
      buffsRef.current.cookSpeed += 1.0;
      appliancesRef.current.forEach((a) => {
        if (a.type === 'hob') a.isUpgraded = true;
      });
    } else if (upgrade.id === 'power_sink') {
      buffsRef.current.washSpeed += 1.2;
      appliancesRef.current.forEach((a) => {
        if (a.type === 'sink') a.isUpgraded = true;
      });
    } else if (upgrade.id === 'safe_hob') {
      buffsRef.current.noBurn = true;
    } else if (upgrade.id === 'dishwasher') {
      buffsRef.current.autoDishwasher = true;
    } else if (upgrade.id === 'recipe_salad') {
      buffsRef.current.saladUnlocked = true;
    } else if (upgrade.id === 'recipe_steak') {
      buffsRef.current.steakUnlocked = true;
    } else if (upgrade.id === 'recipe_deluxe') {
      buffsRef.current.deluxeUnlocked = true;
    } else if (upgrade.id === 'magic_spice') {
      buffsRef.current.magicSpice = true;
    } else if (upgrade.id === 'service_bell') {
      setHasBell(true);
      setBellUsesLeft(2);
    } else if (upgrade.id === 'bot_delivery') {
      buffsRef.current.hasDeliveryBot = true;
      if (!botsRef.current.some((b) => b.type === 'delivery')) {
        botsRef.current.push({
          id: 'bot_deliv',
          type: 'delivery',
          x: 6 * TILE_SIZE,
          y: 3.5 * TILE_SIZE,
          targetX: 6 * TILE_SIZE,
          targetY: 3.5 * TILE_SIZE,
          heldItem: null,
          actionCooldown: 0,
        });
      }
    } else if (upgrade.id === 'bot_apprentice') {
      buffsRef.current.hasApprenticeBot = true;
      if (!botsRef.current.some((b) => b.type === 'apprentice')) {
        botsRef.current.push({
          id: 'bot_appr',
          type: 'apprentice',
          x: 7 * TILE_SIZE,
          y: 2.2 * TILE_SIZE,
          targetX: 7 * TILE_SIZE,
          targetY: 2.2 * TILE_SIZE,
          heldItem: null,
          actionCooldown: 0,
        });
      }
    } else if (upgrade.id === 'extra_table') {
      const existing = appliancesRef.current.find((a) => a.id === 'app_table4');
      if (!existing) {
        appliancesRef.current.push({
          id: 'app_table4',
          type: 'table',
          x: 10,
          y: 6,
          item: null,
          tablePlate: null,
          customer: null,
        });
      }
    } else if (upgrade.id === 'rep_heal') {
      setReputation((prev) => Math.min(3, prev + 1));
      repRef.current = Math.min(3, repRef.current + 1);
    }
  };

  // Next Day Transition
  const handleNextDay = () => {
    const nextDay = day + 1;
    const newCustCount = 3 + nextDay * 2;
    setDay(nextDay);
    dayRef.current = nextDay;
    setCustomersRemaining(newCustCount);
    customersLeftRef.current = newCustCount;
    totalCustomersStartRef.current = newCustCount;
    setDayEarnings(0);
    dayEarningsRef.current = 0;

    // Reset Rush Hour & Bell
    setRushHour({
      isActive: false,
      timeLeft: 0,
      totalDuration: 20,
      hasTriggeredToday: false,
    });
    setBellUsesLeft(2);

    // Generate fresh Daily Mission
    const allowedRecipes = ['burger'];
    if (buffsRef.current.cheeseUnlocked) allowedRecipes.push('cheeseburger');
    if (buffsRef.current.saladUnlocked) allowedRecipes.push('salad');
    if (buffsRef.current.steakUnlocked) allowedRecipes.push('steak');
    if (buffsRef.current.deluxeUnlocked) allowedRecipes.push('deluxe_burger');
    const newMission = generateDailyMission(nextDay, allowedRecipes);
    setDailyMission(newMission);
    dailyMissionRef.current = newMission;

    // Reset clean plates stack
    appliancesRef.current.forEach((a) => {
      if (a.type === 'plates') {
        a.count = 5;
      }
    });

    setPhase('PREP');
    phaseRef.current = 'PREP';

    // Update best day & Hall of Fame
    setStats((prev) => {
      const best = Math.max(prev.bestDay, nextDay);
      return { ...prev, bestDay: best, dishesServedToday: 0 };
    });

    const hofRes = updateHallOfFame(
      nextDay,
      stats.moneyEarnedTotal,
      stats.missionsCompleted,
      stats.dishesServedTotal
    );
    setHallOfFame(hofRes.data);
  };

  // Game Over trigger
  const handleTriggerGameOver = useCallback(() => {
    // Record into Hall of Fame
    const hofRes = updateHallOfFame(
      dayRef.current,
      stats.moneyEarnedTotal,
      stats.missionsCompleted,
      stats.dishesServedTotal
    );
    setHallOfFame(hofRes.data);

    const labelMap: Record<string, string> = {
      day: `最高生存 第 ${hofRes.data.bestDay} 天`,
      money: `最高金幣 $${hofRes.data.bestMoney}`,
      missions: `最高任務 ${hofRes.data.bestMissions} 項`,
      dishes: `最高出餐 ${hofRes.data.bestDishes} 份`,
    };
    setNewRecords(hofRes.recordKeys.map((k) => labelMap[k] || k));

    setPhase('GAMEOVER');
    phaseRef.current = 'GAMEOVER';
    sound.sfxGameOver();
  }, [stats]);

  // Restart clean run
  const handleRestart = () => {
    setDay(1);
    dayRef.current = 1;
    setMoney(0);
    moneyRef.current = 0;
    setReputation(3);
    repRef.current = 3;
    setCustomersRemaining(4);
    customersLeftRef.current = 4;
    totalCustomersStartRef.current = 4;
    setDayEarnings(0);
    dayEarningsRef.current = 0;

    // Reset buffs
    buffsRef.current = {
      playerSpeed: 1.0,
      cookSpeed: 1.0,
      washSpeed: 1.0,
      patience: 1.0,
      tips: 0,
      noBurn: false,
      autoDishwasher: false,
      cheeseUnlocked: false,
      saladUnlocked: false,
      steakUnlocked: false,
      deluxeUnlocked: false,
      magicSpice: false,
      hasDeliveryBot: false,
      hasApprenticeBot: false,
    };

    setHasBell(false);
    setBellUsesLeft(2);
    botsRef.current = [];

    // Reset mission and rush hour
    const newM = generateDailyMission(1, ['burger']);
    setDailyMission(newM);
    dailyMissionRef.current = newM;

    setRushHour({
      isActive: false,
      timeLeft: 0,
      totalDuration: 20,
      hasTriggeredToday: false,
    });

    // Reset upgrades
    setUpgrades(INITIAL_UPGRADE_POOL.map((u) => ({ ...u, applied: false })));

    // Reset appliances
    appliancesRef.current = createInitialAppliances();
    activeCustomersRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Reset player
    playerRef.current = {
      x: 5 * TILE_SIZE,
      y: 3.5 * TILE_SIZE,
      w: 38,
      h: 38,
      dirX: 0,
      dirY: 0,
      facing: 'down',
      heldItem: null,
      walkFrame: 0,
      isMoving: false,
    };
    setHeldItemName('空手');

    setPhase('PREP');
    phaseRef.current = 'PREP';
  };

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx, canvas.width, canvas.height);
  }, []);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(100, now - lastTime);
      lastTime = now;

      const player = playerRef.current;
      const keys = keysRef.current;
      const currentPhase = phaseRef.current;

      // 1. Player Movement Calculation
      let dx = 0;
      let dy = 0;

      if (keys['KeyW'] || keys['ArrowUp'] || touchDirRef.current === 'up') dy -= 1;
      if (keys['KeyS'] || keys['ArrowDown'] || touchDirRef.current === 'down') dy += 1;
      if (keys['KeyA'] || keys['ArrowLeft'] || touchDirRef.current === 'left') dx -= 1;
      if (keys['KeyD'] || keys['ArrowRight'] || touchDirRef.current === 'right') dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const isMoving = dx !== 0 || dy !== 0;
      player.isMoving = isMoving;
      if (isMoving) {
        player.walkFrame += 0.5;
        if (Math.abs(dx) > Math.abs(dy)) {
          player.facing = dx > 0 ? 'right' : 'left';
        } else {
          player.facing = dy > 0 ? 'down' : 'up';
        }
      }

      const moveSpeed = 4 * buffsRef.current.playerSpeed;
      const newX = player.x + dx * moveSpeed;
      const newY = player.y + dy * moveSpeed;

      // Wall and Appliance Collisions
      if (!checkCollision(newX, player.y, player.w, player.h, appliancesRef.current)) {
        player.x = newX;
      }
      if (!checkCollision(player.x, newY, player.w, player.h, appliancesRef.current)) {
        player.y = newY;
      }

      // Continuous E Key action (Washing & Chopping)
      if (keys['KeyE']) {
        interactActionE();
      }

      // 2. Appliances Updates (Cooking & Burning)
      for (const app of appliancesRef.current) {
        // Stove cooking
        if (app.type === 'hob' && app.item?.type === 'raw_meat') {
          app.progress = (app.progress || 0) + 0.35 * buffsRef.current.cookSpeed;
          if (Math.random() < 0.08) {
            sound.sfxCook();
            addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#fbbf24', 2);
          }

          if (app.progress >= 100) {
            app.item.type = 'cooked_meat';
            app.progress = 100;
            app.burnProgress = 0;
            sound.sfxPick();
            addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '熟肉排完成！', '#fbbf24');
          }
        }
        // Stove burning if left too long (unless protected by safe_hob)
        else if (app.type === 'hob' && app.item?.type === 'cooked_meat') {
          if (!buffsRef.current.noBurn) {
            app.burnProgress = (app.burnProgress || 0) + 0.12;
            if (app.burnProgress > 50 && Math.random() < 0.06) {
              sound.sfxBurn();
              addParticles(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + TILE_SIZE / 2, '#4b5563', 2);
            }
            if (app.burnProgress >= 100) {
              app.item.type = 'burnt_meat';
              app.burnProgress = 0;
              sound.sfxBurn();
              addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '燒焦了！💥', '#ef4444');

              // Fail 'no_burn' mission
              if (dailyMissionRef.current && dailyMissionRef.current.type === 'no_burn') {
                dailyMissionRef.current.isFailed = true;
                setDailyMission({ ...dailyMissionRef.current });
              }
            }
          }
        }

        // Auto dishwasher upgrade
        if (buffsRef.current.autoDishwasher && app.type === 'sink' && app.item?.type === 'dirty_plate') {
          app.progress = (app.progress || 0) + 0.25;
          if (app.progress >= 100) {
            app.item = { type: 'plate', contents: [] };
            app.progress = 0;
            addFloatingText(app.x * TILE_SIZE + TILE_SIZE / 2, app.y * TILE_SIZE + 10, '洗碗機洗淨 ✨', '#38bdf8');
          }
        }
      }

      // 3. Customer Generation and Flow (Service Phase)
      if (currentPhase === 'SERVICE') {
        // Check Rush Hour Mid-day trigger
        const rh = rushHourRef.current;
        if (!rh.hasTriggeredToday && customersLeftRef.current <= Math.ceil(totalCustomersStartRef.current / 2) && customersLeftRef.current > 0) {
          rh.isActive = true;
          rh.timeLeft = 20;
          rh.hasTriggeredToday = true;
          setRushHour({ ...rh });
          sound.sfxRushHour();
          addFloatingText(GRID_COLS * TILE_SIZE / 2, 80, '⚡ RUSH HOUR 尖峰狂潮來襲！', '#f87171');
        }

        // Rush Hour countdown
        if (rh.isActive) {
          rh.timeLeft -= dt / 1000;
          if (rh.timeLeft <= 0) {
            rh.isActive = false;
            rh.timeLeft = 0;
            setRushHour({ ...rh });
            addFloatingText(GRID_COLS * TILE_SIZE / 2, 80, '尖峰客潮已平息 🌟', '#38bdf8');
          }
        }

        // Spawn interval: halved during Rush Hour!
        const baseInterval = rh.isActive ? 1600 : 3500;
        if (now - lastSpawnTimeRef.current > baseInterval && customersLeftRef.current > 0) {
          const emptyTables = appliancesRef.current.filter(
            (a) => a.type === 'table' && !a.customer && !a.tablePlate
          );

          if (emptyTables.length > 0) {
            const table = emptyTables[Math.floor(Math.random() * emptyTables.length)];
            const allowedOrders = ['burger'];
            if (buffsRef.current.cheeseUnlocked) allowedOrders.push('cheeseburger');
            if (buffsRef.current.saladUnlocked) allowedOrders.push('salad');
            if (buffsRef.current.steakUnlocked) allowedOrders.push('steak');
            if (buffsRef.current.deluxeUnlocked) allowedOrders.push('deluxe_burger');

            const customer = spawnCustomerForTable(table, allowedOrders, buffsRef.current.patience);
            table.customer = customer;
            activeCustomersRef.current.push(customer);

            customersLeftRef.current -= 1;
            setCustomersRemaining(customersLeftRef.current);
            lastSpawnTimeRef.current = now;
          }
        }

        // Customer tick updates
        const customers = activeCustomersRef.current;
        const decayRate = buffsRef.current.magicSpice ? 0.05 : 0.07;

        for (let i = customers.length - 1; i >= 0; i--) {
          const c = customers[i];
          const table = appliancesRef.current.find((a) => a.id === c.tableId);

          if (c.state === 'waiting') {
            c.patience -= decayRate;
            if (c.patience <= 0) {
              // Impatient walkout: lose reputation heart
              sound.sfxFail();
              const tx = (table?.x || 0) * TILE_SIZE + TILE_SIZE / 2;
              const ty = (table?.y || 0) * TILE_SIZE + TILE_SIZE / 2;
              addFloatingText(tx, ty - 20, '-1 ❤️ 顧客憤怒離席！', '#ef4444');
              addParticles(tx, ty, '#ef4444', 8);

              // Fail 'zero_unhappy' mission
              if (dailyMissionRef.current && dailyMissionRef.current.type === 'zero_unhappy') {
                dailyMissionRef.current.isFailed = true;
                setDailyMission({ ...dailyMissionRef.current });
              }

              if (table) table.customer = null;
              customers.splice(i, 1);

              const nextRep = repRef.current - 1;
              setReputation(nextRep);
              repRef.current = nextRep;

              if (nextRep <= 0) {
                handleTriggerGameOver();
                break;
              }
            }
          } else if (c.state === 'eating') {
            c.eatingTimer -= 0.35;
            if (c.eatingTimer <= 0) {
              // Finished meal!
              if (table) {
                table.customer = null;
                table.tablePlate = { type: 'dirty_plate' };
              }
              customers.splice(i, 1);
            }
          }
        }

        // 4. Update Kitchen Bots AI (Delivery Bot & Apprentice Bot)
        for (const bot of botsRef.current) {
          if (bot.type === 'delivery') {
            // Delivery bot: looks for completed plates on island counters and delivers to waiting customer
            if (!bot.heldItem) {
              // Look for ready-to-serve plate on island counters
              const counterWithPlate = appliancesRef.current.find(
                (a) => a.type === 'counter' && a.item?.type === 'plate' && a.item.contents && a.item.contents.length > 0
              );
              if (counterWithPlate && counterWithPlate.item) {
                const targetPlate = counterWithPlate.item;
                // Check if any customer wants this plate
                const customerWaiting = activeCustomersRef.current.find(
                  (c) => c.state === 'waiting' && doesPlateMatchRecipe(targetPlate, c.order)
                );
                if (customerWaiting) {
                  // Move towards counter
                  const cx = counterWithPlate.x * TILE_SIZE + TILE_SIZE / 2;
                  const cy = counterWithPlate.y * TILE_SIZE + TILE_SIZE / 2;
                  const dist = Math.hypot(bot.x - cx, bot.y - cy);
                  if (dist > 15) {
                    bot.x += ((cx - bot.x) / dist) * 2.8;
                    bot.y += ((cy - bot.y) / dist) * 2.8;
                  } else {
                    bot.heldItem = counterWithPlate.item;
                    counterWithPlate.item = null;
                  }
                }
              }
            } else {
              // Deliver held plate to waiting customer
              const targetCustomer = activeCustomersRef.current.find(
                (c) => c.state === 'waiting' && doesPlateMatchRecipe(bot.heldItem!, c.order)
              );
              if (targetCustomer) {
                const table = appliancesRef.current.find((a) => a.id === targetCustomer.tableId);
                if (table) {
                  const tx = table.x * TILE_SIZE + TILE_SIZE / 2;
                  const ty = table.y * TILE_SIZE + TILE_SIZE / 2;
                  const dist = Math.hypot(bot.x - tx, bot.y - ty);
                  if (dist > 25) {
                    bot.x += ((tx - bot.x) / dist) * 2.8;
                    bot.y += ((ty - bot.y) / dist) * 2.8;
                  } else {
                    // Serve!
                    targetCustomer.state = 'eating';
                    targetCustomer.eatingTimer = 50;
                    const recipe = RECIPES[targetCustomer.order];
                    let earn = (recipe ? recipe.price : 20) + buffsRef.current.tips;
                    if (buffsRef.current.magicSpice) earn = Math.round(earn * 1.35);

                    sound.sfxServe();
                    addFloatingText(tx, ty - 20, `🤖 無人侍者上菜! +$${earn}`, '#38bdf8');
                    bot.heldItem = null;

                    setMoney((prev) => {
                      const next = prev + earn;
                      moneyRef.current = next;
                      return next;
                    });
                    setDayEarnings((prev) => prev + earn);
                    dayEarningsRef.current += earn;
                    setStats((prev) => ({
                      ...prev,
                      dishesServedToday: prev.dishesServedToday + 1,
                      dishesServedTotal: prev.dishesServedTotal + 1,
                      moneyEarnedTotal: prev.moneyEarnedTotal + earn,
                    }));
                  }
                }
              }
            }
          } else if (bot.type === 'apprentice') {
            // Apprentice bot: patrols prep boards to chop, or saves burning meat
            const hobWithCookedMeat = appliancesRef.current.find(
              (a) => a.type === 'hob' && a.item?.type === 'cooked_meat' && (a.burnProgress || 0) > 40
            );
            if (hobWithCookedMeat && hobWithCookedMeat.item) {
              const emptyCounter = appliancesRef.current.find((a) => a.type === 'counter' && !a.item);
              if (emptyCounter) {
                emptyCounter.item = hobWithCookedMeat.item;
                hobWithCookedMeat.item = null;
                hobWithCookedMeat.burnProgress = 0;
                addFloatingText(
                  hobWithCookedMeat.x * TILE_SIZE + TILE_SIZE / 2,
                  hobWithCookedMeat.y * TILE_SIZE + 10,
                  '🧑‍🍳 學徒及時起鍋！',
                  '#34d399'
                );
              }
            }

            // Also slowly helps chop whole items on prep boards
            for (const app of appliancesRef.current) {
              if (app.type === 'prep_board' && app.item && ['cheese', 'lettuce', 'tomato'].includes(app.item.type)) {
                app.progress = (app.progress || 0) + 0.8;
                if (app.progress >= 100) {
                  if (app.item.type === 'cheese') app.item.type = 'sliced_cheese';
                  else if (app.item.type === 'lettuce') app.item.type = 'sliced_lettuce';
                  else if (app.item.type === 'tomato') app.item.type = 'sliced_tomato';
                  app.progress = 0;
                  addFloatingText(
                    app.x * TILE_SIZE + TILE_SIZE / 2,
                    app.y * TILE_SIZE + 10,
                    '🧑‍🍳 學徒備料切好！',
                    '#38bdf8'
                  );
                }
              }
            }
          }
        }

        // End of day condition: all customers served and left
        if (customersLeftRef.current === 0 && activeCustomersRef.current.length === 0) {
          handleEndDay();
        }
      }

      // 5. Update Particle Physics
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = 1 - pt.life / pt.maxLife;
        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }

      // 6. Update Floating Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // 7. Canvas Render
      if (rendererRef.current) {
        const targetedApp = getTargetAppliance(player, appliancesRef.current);
        rendererRef.current.render(
          player,
          appliancesRef.current,
          particlesRef.current,
          floatingTextsRef.current,
          targetedApp,
          currentPhase === 'PREP',
          rushHourRef.current.isActive,
          rushHourRef.current.timeLeft,
          botsRef.current
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    handleEndDay,
    handleTriggerGameOver,
    interactActionE,
    addFloatingText,
    addParticles,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-['Plus_Jakarta_Sans',sans-serif] selection:bg-amber-500 selection:text-slate-950">
      {/* Top Bar HUD with Daily Mission & Rush Hour */}
      <HeaderHUD
        day={day}
        money={money}
        reputation={reputation}
        customersRemaining={customersRemaining}
        phase={phase}
        dailyMission={dailyMission}
        rushHour={rushHour}
        hasBell={hasBell}
        bellUsesLeft={bellUsesLeft}
        onRingBell={handleRingBell}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        onOpenRecipes={() => setIsRecipeModalOpen(true)}
        onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
        onStartService={handleStartService}
      />

      {/* Main Game Stage */}
      <main className="w-full max-w-5xl px-4 py-2 flex flex-col items-center justify-center flex-1">
        {/* Game Canvas Container */}
        <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 bg-slate-900">
          <canvas
            ref={canvasRef}
            width={GRID_COLS * TILE_SIZE}
            height={GRID_ROWS * TILE_SIZE}
            className="block max-w-full h-auto"
            style={{ aspectRatio: `${GRID_COLS}/${GRID_ROWS}` }}
          />

          {/* Currently Carried Item Pill Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span>手中拿取：</span>
            <strong className="text-white font-mono">{heldItemName}</strong>
          </div>

          {/* Golden Bell on-screen shortcut */}
          {hasBell && phase === 'SERVICE' && (
            <button
              onClick={handleRingBell}
              disabled={bellUsesLeft <= 0}
              className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all shadow-lg ${
                bellUsesLeft > 0
                  ? 'bg-amber-500/90 hover:bg-amber-400 border-amber-300 text-slate-950 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Bell className="w-4 h-4 fill-current" />
              <span>敲金鐘 Q ({bellUsesLeft})</span>
            </button>
          )}

          {/* Mobile touch toggle */}
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="sm:hidden absolute top-3 right-3 bg-slate-900/80 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 cursor-pointer"
          >
            {showTouchControls ? '隱藏螢幕手把' : '顯示螢幕手把'}
          </button>
        </div>

        {/* Quick Keyboard Reference below Canvas */}
        <div className="w-full max-w-5xl mt-3 flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded font-mono font-bold">WASD</kbd> 移動
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded font-mono font-bold">Space</kbd> 拿放/組裝
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 rounded font-mono font-bold">E</kbd> 洗碗/切菜(長按)
            </span>
            {hasBell && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-amber-300">
                  <kbd className="px-1.5 py-0.5 bg-amber-500 text-slate-950 rounded font-mono font-bold">Q</kbd> 敲金鐘
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setIsRecipeModalOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>料理 SOP 攻略</span>
            </button>
          </div>
        </div>

        {/* Virtual Touchpad / Joystick (for mobile/tablet touch) */}
        {(showTouchControls || typeof window !== 'undefined' && 'ontouchstart' in window) && (
          <TouchControls
            onDirectionPress={handleTouchDir}
            onSpaceDown={interactSpace}
            onEDown={handleTouchEDown}
            onEUp={handleTouchEUp}
          />
        )}
      </main>

      {/* Footer Info with Hall of Fame */}
      <footer className="w-full max-w-5xl py-2.5 px-4 border-t border-slate-900 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span>PlateUp! Web 廚房流水線經營模擬</span>
        </div>

        {/* Hall of Fame badge trigger */}
        <button
          onClick={() => setIsHallOfFameOpen(true)}
          className="flex items-center gap-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 rounded-lg text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          title="點擊查看完整廚房名人堂"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-amber-300">廚房名人堂：</span>
          <span className="font-mono tabular-nums">最高第 {hallOfFame.bestDay} 天</span>
          <span>·</span>
          <span className="font-mono tabular-nums">最高金幣 ${hallOfFame.bestMoney}</span>
          <span>·</span>
          <span className="font-mono tabular-nums">最高任務 {hallOfFame.bestMissions} 項</span>
        </button>

        <div className="flex items-center gap-2 text-slate-400">
          <span>本次出餐：{stats.dishesServedTotal} 份</span>
          <span>·</span>
          <span>本次任務：{stats.missionsCompleted} 項</span>
        </div>
      </footer>

      {/* Modals */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />

      <NightShopModal
        isOpen={phase === 'SHOP'}
        day={day}
        money={money}
        dayEarnings={dayEarnings}
        customersServedToday={stats.dishesServedToday}
        dailyMission={dailyMission}
        availableUpgrades={availableShopUpgrades}
        onBuyUpgrade={handleBuyUpgrade}
        onNextDay={handleNextDay}
      />

      <GameOverModal
        isOpen={phase === 'GAMEOVER'}
        day={day}
        stats={stats}
        hallOfFame={hallOfFame}
        newRecords={newRecords}
        onRestart={handleRestart}
        onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
      />

      <HallOfFameModal
        isOpen={isHallOfFameOpen}
        onClose={() => setIsHallOfFameOpen(false)}
        hallOfFame={hallOfFame}
      />
    </div>
  );
}
