import { Appliance, Customer, GameItem, Particle, PlayerState, FloatingText, KitchenBot } from './types';
import { TILE_SIZE, GRID_COLS, GRID_ROWS } from './kitchen';
import { RECIPES } from './recipes';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public render(
    player: PlayerState,
    appliances: Appliance[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    targetedAppliance: Appliance | null,
    isPrepPhase: boolean,
    rushHourActive: boolean,
    rushHourTimeLeft: number,
    bots: KitchenBot[] = []
  ) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawFloors();
    this.drawAppliances(appliances, targetedAppliance);
    this.drawBots(bots);
    this.drawPlayer(player);
    this.drawParticles(particles);
    this.drawFloatingTexts(floatingTexts);

    if (rushHourActive) {
      this.drawRushHourBanner(rushHourTimeLeft);
    } else if (isPrepPhase) {
      this.drawPrepBanner();
    }
  }

  private drawBots(bots: KitchenBot[]) {
    const ctx = this.ctx;
    for (const bot of bots) {
      ctx.save();
      ctx.translate(bot.x, bot.y);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 16, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (bot.type === 'delivery') {
        // Delivery Bot Drone/Rover
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(-14, -12, 28, 24, 8);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -10, 4, 8);
        ctx.fillRect(12, -10, 4, 8);
        ctx.fillRect(-16, 4, 4, 8);
        ctx.fillRect(12, 4, 4, 8);

        // Antenna
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(0, -20);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -20, 3, 0, Math.PI * 2);
        ctx.fill();

        // Screen face
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-8, -6, 16, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-5, -3, 3, 3);
        ctx.fillRect(2, -3, 3, 3);
      } else {
        // Apprentice Chef Bot
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Little apprentice chef hat
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-8, -20, 16, 10, [4, 4, 1, 1]);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // If bot carrying an item
      if (bot.heldItem) {
        this.drawItem(bot.heldItem, 0, -28);
      }

      ctx.restore();
    }
  }

  private drawRushHourBanner(timeLeft: number) {
    const ctx = this.ctx;
    ctx.save();
    // Pulsing danger red/orange gradient
    const pulse = 0.8 + Math.sin(Date.now() * 0.008) * 0.15;
    ctx.fillStyle = `rgba(185, 28, 28, ${pulse})`;
    ctx.fillRect(0, 0, this.width, 38);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡ 尖峰客潮 RUSH HOUR！顧客激增！倒數: ${Math.ceil(timeLeft)} 秒`, this.width / 2, 19);
    ctx.restore();
  }

  private drawFloors() {
    const ctx = this.ctx;

    // Kitchen Floor (Rows 0 to 4) - Checkerboard porcelain tiles
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isAlt = (r + c) % 2 === 0;
        ctx.fillStyle = isAlt ? '#2d3345' : '#252b3b';
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#1e2330';
        ctx.lineWidth = 1;
        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Divider bar between kitchen and dining
    const dividerY = 5 * TILE_SIZE;
    ctx.fillStyle = '#181b24';
    ctx.fillRect(0, dividerY - 4, this.width, 8);

    // Dining Floor (Rows 5 to 7) - Warm parquet wooden floorboards
    for (let r = 5; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        ctx.fillStyle = (c % 2 === 0) ? '#4a3228' : '#432c22';
        ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Wood grain lines
        ctx.strokeStyle = '#38231b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, r * TILE_SIZE);
        ctx.lineTo(c * TILE_SIZE + TILE_SIZE, r * TILE_SIZE);
        ctx.moveTo(c * TILE_SIZE, r * TILE_SIZE + TILE_SIZE / 2);
        ctx.lineTo(c * TILE_SIZE + TILE_SIZE, r * TILE_SIZE + TILE_SIZE / 2);
        ctx.stroke();
      }
    }
  }

  private drawAppliances(appliances: Appliance[], targetedAppliance: Appliance | null) {
    const ctx = this.ctx;

    for (const app of appliances) {
      const ax = app.x * TILE_SIZE;
      const ay = app.y * TILE_SIZE;
      const isTargeted = targetedAppliance?.id === app.id;

      ctx.save();

      // Soft drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.roundRect(ax + 6, ay + 10, TILE_SIZE - 12, TILE_SIZE - 10, 10);
      ctx.fill();

      // Appliance counter base
      if (app.type === 'table') {
        this.drawDiningTable(app, ax, ay);
      } else {
        this.drawKitchenAppliance(app, ax, ay);
      }

      // Targeted interaction outline
      if (isTargeted) {
        ctx.strokeStyle = '#ffc83b';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.roundRect(ax + 2, ay + 2, TILE_SIZE - 4, TILE_SIZE - 4, 12);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }
  }

  private drawKitchenAppliance(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;

    // Outer counter cabinet
    const cabinetGrad = ctx.createLinearGradient(ax, ay, ax, ay + TILE_SIZE);
    cabinetGrad.addColorStop(0, '#3b4252');
    cabinetGrad.addColorStop(1, '#2e3440');
    ctx.fillStyle = cabinetGrad;
    ctx.beginPath();
    ctx.roundRect(ax + 4, ay + 4, TILE_SIZE - 8, TILE_SIZE - 8, 10);
    ctx.fill();

    // Top surface rim
    ctx.strokeStyle = '#4c566a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Specific Appliance surface design
    switch (app.type) {
      case 'crate_meat': {
        this.drawCrate(ax, ay, '#b91c1c', '生肉箱', '🥩');
        break;
      }
      case 'crate_bun': {
        this.drawCrate(ax, ay, '#d97706', '麵包箱', '🍞');
        break;
      }
      case 'crate_cheese': {
        this.drawCrate(ax, ay, '#eab308', '起司箱', '🧀');
        break;
      }
      case 'crate_lettuce': {
        this.drawCrate(ax, ay, '#16a34a', '生菜箱', '🥬');
        break;
      }
      case 'crate_tomato': {
        this.drawCrate(ax, ay, '#dc2626', '番茄箱', '🍅');
        break;
      }
      case 'hob': {
        this.drawHob(app, ax, ay);
        break;
      }
      case 'prep_board': {
        this.drawPrepBoard(app, ax, ay);
        break;
      }
      case 'counter': {
        this.drawCounter(app, ax, ay);
        break;
      }
      case 'sink': {
        this.drawSink(app, ax, ay);
        break;
      }
      case 'plates': {
        this.drawPlatesStack(app, ax, ay);
        break;
      }
      case 'bin': {
        this.drawTrashBin(ax, ay);
        break;
      }
    }
  }

  private drawCrate(ax: number, ay: number, color: string, label: string, emoji: string) {
    const ctx = this.ctx;
    // Wooden box inlay
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(ax + 10, ay + 10, TILE_SIZE - 20, 10);

    // Emoji icon
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2 - 4);

    // Label
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, ax + TILE_SIZE / 2, ay + TILE_SIZE - 12);
  }

  private drawHob(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;
    const isCooking = app.item?.type === 'raw_meat';
    const isBurnt = app.item?.type === 'burnt_meat';

    // Induction cooktop surface
    ctx.fillStyle = '#1a1d24';
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 8);
    ctx.fill();

    // Heating element ring
    ctx.strokeStyle = isBurnt ? '#7f1d1d' : isCooking ? '#ef4444' : '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ax + TILE_SIZE / 2, ay + TILE_SIZE / 2, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Cooktop label
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(app.isUpgraded ? '急速煎台' : '煎台', ax + TILE_SIZE / 2, ay + 18);

    // Item on hob
    if (app.item) {
      this.drawItem(app.item, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2);
    }

    // Cooking progress bar
    if (app.item && app.item.type === 'raw_meat' && (app.progress || 0) > 0) {
      const p = Math.min(100, app.progress || 0) / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, TILE_SIZE - 20, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, (TILE_SIZE - 20) * p, 6);
    }

    // Burning warning bar
    if (app.item && app.item.type === 'cooked_meat' && (app.burnProgress || 0) > 0) {
      const bp = Math.min(100, app.burnProgress || 0) / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, TILE_SIZE - 20, 6);
      ctx.fillStyle = bp > 0.6 ? '#dc2626' : '#ea580c';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, (TILE_SIZE - 20) * bp, 6);

      // Warning text
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('注意！', ax + TILE_SIZE / 2, ay + TILE_SIZE - 18);
    }
  }

  private drawPrepBoard(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;
    // Bamboo board
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.roundRect(ax + 10, ay + 10, TILE_SIZE - 20, TILE_SIZE - 20, 6);
    ctx.fill();
    ctx.strokeStyle = '#bc6c25';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#432818';
    ctx.textAlign = 'center';
    ctx.fillText('備料砧板', ax + TILE_SIZE / 2, ay + 19);

    if (app.item) {
      this.drawItem(app.item, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2 + 2);
    }

    // Chopping progress bar
    if (app.item && (app.progress || 0) > 0 && (app.progress || 0) < 100) {
      const p = (app.progress || 0) / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, TILE_SIZE - 20, 6);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, (TILE_SIZE - 20) * p, 6);
    }
  }

  private drawCounter(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;
    // Stainless steel top
    const grad = ctx.createLinearGradient(ax, ay, ax + TILE_SIZE, ay + TILE_SIZE);
    grad.addColorStop(0, '#525b6e');
    grad.addColorStop(1, '#3b4252');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
    ctx.fill();

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.fillText('工作檯', ax + TILE_SIZE / 2, ay + 19);

    if (app.item) {
      this.drawItem(app.item, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2 + 4);
    }
  }

  private drawSink(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;
    // Basin
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
    ctx.fill();

    // Water
    ctx.fillStyle = app.isUpgraded ? '#0284c7' : '#0369a1';
    ctx.beginPath();
    ctx.roundRect(ax + 12, ay + 14, TILE_SIZE - 24, TILE_SIZE - 26, 4);
    ctx.fill();

    // Faucet
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(ax + TILE_SIZE / 2 - 3, ay + 6, 6, 10);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(app.isUpgraded ? '強力水槽' : '洗碗槽', ax + TILE_SIZE / 2, ay + TILE_SIZE - 10);

    if (app.item) {
      this.drawItem(app.item, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2);
    }

    // Washing progress
    if (app.item && (app.progress || 0) > 0 && (app.progress || 0) < 100) {
      const p = (app.progress || 0) / 100;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, TILE_SIZE - 20, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ax + 10, ay + TILE_SIZE - 14, (TILE_SIZE - 20) * p, 6);
    }
  }

  private drawPlatesStack(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 6);
    ctx.fill();

    // Draw stack of dishes
    const count = app.count || 0;
    const baseCount = Math.min(4, count);
    for (let i = 0; i < baseCount; i++) {
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(ax + TILE_SIZE / 2, ay + 38 - i * 4, 18, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = count > 0 ? '#38bdf8' : '#f87171';
    ctx.textAlign = 'center';
    ctx.fillText(`乾淨盤: ${count}`, ax + TILE_SIZE / 2, ay + TILE_SIZE - 10);
  }

  private drawTrashBin(ax: number, ay: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(ax + 8, ay + 8, TILE_SIZE - 16, TILE_SIZE - 16, 8);
    ctx.fill();

    // Bin cylinder
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(ax + 14, ay + 14, TILE_SIZE - 28, TILE_SIZE - 24, 6);
    ctx.fill();

    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗑️', ax + TILE_SIZE / 2, ay + TILE_SIZE / 2);

    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('廚餘桶', ax + TILE_SIZE / 2, ay + TILE_SIZE - 10);
  }

  private drawDiningTable(app: Appliance, ax: number, ay: number) {
    const ctx = this.ctx;

    // Table wood top
    ctx.fillStyle = '#8b5a2b';
    ctx.beginPath();
    ctx.arc(ax + TILE_SIZE / 2, ay + TILE_SIZE / 2, 28, 0, Math.PI * 2);
    ctx.fill();

    // Table cloth / placemat
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.arc(ax + TILE_SIZE / 2, ay + TILE_SIZE / 2, 22, 0, Math.PI * 2);
    ctx.fill();

    // Table label
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.textAlign = 'center';
    ctx.fillText('餐桌', ax + TILE_SIZE / 2, ay + TILE_SIZE / 2 - 12);

    // If dirty plate left on table
    if (app.tablePlate) {
      this.drawItem(app.tablePlate, ax + TILE_SIZE / 2, ay + TILE_SIZE / 2 + 6);
    }

    // If customer seated
    if (app.customer) {
      this.drawCustomer(app.customer, ax, ay);
    }
  }

  private drawCustomer(c: Customer, ax: number, ay: number) {
    const ctx = this.ctx;
    const ratio = Math.max(0, c.patience / c.maxPatience);

    // If customer is angry (<30% patience), add slight nervous shaking jitter
    const isAngry = c.state === 'waiting' && ratio < 0.3;
    const isImpatient = c.state === 'waiting' && ratio >= 0.3 && ratio <= 0.65;
    const isHappy = c.state === 'waiting' && ratio > 0.65;
    const isEating = c.state === 'eating';

    const jitterX = isAngry ? (Math.random() - 0.5) * 2.5 : 0;
    const jitterY = isAngry ? (Math.random() - 0.5) * 2.5 : 0;

    const cx = ax + TILE_SIZE / 2 + jitterX;
    const cy = ay + TILE_SIZE / 2 + 4 + jitterY;

    // Customer body seated at chair
    ctx.fillStyle = isAngry ? '#b91c1c' : c.color;
    ctx.beginPath();
    ctx.arc(cx, cy + 28, 14, 0, Math.PI * 2);
    ctx.fill();

    // Skin face (turns slightly flushed reddish when angry)
    ctx.fillStyle = isAngry ? '#fca5a5' : c.skinColor;
    ctx.beginPath();
    ctx.arc(cx, cy + 24, 10, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Facial Expression on Face
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.2;

    if (isEating) {
      // Happy smiling curved eyes
      ctx.beginPath();
      ctx.arc(cx - 3, cy + 23, 2, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 3, cy + 23, 2, Math.PI, 0);
      ctx.stroke();
      // Smiling mouth
      ctx.beginPath();
      ctx.arc(cx, cy + 26, 2, 0, Math.PI);
      ctx.stroke();
    } else if (isHappy) {
      // Cheerful dot eyes & smile
      ctx.beginPath();
      ctx.arc(cx - 3, cy + 23, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy + 23, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Smile curve
      ctx.beginPath();
      ctx.arc(cx, cy + 26, 2.5, 0, Math.PI);
      ctx.stroke();
    } else if (isImpatient) {
      // Neutral dot eyes & flat mouth :-|
      ctx.beginPath();
      ctx.arc(cx - 3, cy + 23, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy + 23, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Straight line mouth
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 27);
      ctx.lineTo(cx + 3, cy + 27);
      ctx.stroke();
    } else {
      // Angry slanted eyes / eyebrows & frown mouth :((
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 21);
      ctx.lineTo(cx - 2, cy + 23);
      ctx.moveTo(cx + 5, cy + 21);
      ctx.lineTo(cx + 2, cy + 23);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx - 3, cy + 24, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy + 24, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Frown curve
      ctx.beginPath();
      ctx.arc(cx, cy + 29, 2.5, Math.PI, 0);
      ctx.stroke();

      // Sweat drop
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx + 9, cy + 18, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dynamic Emotion Emoticon Badge beside Avatar
    let emotionText = ':)';
    let emotionBg = '#10b981';
    let emotionTextColor = '#ffffff';

    if (isEating) {
      emotionText = '😋';
      emotionBg = '#0284c7';
    } else if (isHappy) {
      emotionText = ':)';
      emotionBg = '#10b981';
    } else if (isImpatient) {
      emotionText = ':|';
      emotionBg = '#f59e0b';
      emotionTextColor = '#0f172a';
    } else {
      emotionText = ':(( ';
      emotionBg = '#ef4444';
      emotionTextColor = '#ffffff';
    }

    // Draw emotion pill next to head
    const badgeX = cx + 13;
    const badgeY = cy + 18;
    ctx.fillStyle = emotionBg;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, 22, 14, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = emotionTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emotionText, badgeX + 11, badgeY + 7);

    // Customer Speech Bubble (Above Table)
    const bubbleW = 60;
    const bubbleH = 28;
    const bx = cx - bubbleW / 2;
    const by = ay - 24;

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Small arrow pointing down to customer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 5, by + bubbleH);
    ctx.lineTo(cx + 5, by + bubbleH);
    ctx.lineTo(cx, by + bubbleH + 6);
    ctx.fill();

    // Bubble content
    if (c.state === 'waiting') {
      const recipe = RECIPES[c.order];
      const icon = recipe ? recipe.icon : '🍔';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, cx, by + bubbleH / 2);

      // Patience progress bar under the bubble
      const barY = by + bubbleH + 1;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx + 4, barY, bubbleW - 8, 4);

      // Color warning when running out of patience
      ctx.fillStyle = ratio > 0.4 ? '#22c55e' : ratio > 0.2 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(bx + 4, barY, (bubbleW - 8) * ratio, 4);
    } else if (c.state === 'eating') {
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('😋 美味中', cx, by + bubbleH / 2);
    }
  }

  public drawItem(item: GameItem, x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    switch (item.type) {
      case 'raw_meat': {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }
      case 'cooked_meat': {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Grill marks
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, -4); ctx.lineTo(-3, 4);
        ctx.moveTo(-1, -4); ctx.lineTo(3, 4);
        ctx.moveTo(5, -4); ctx.lineTo(9, 4);
        ctx.stroke();
        break;
      }
      case 'burnt_meat': {
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#44403c';
        ctx.stroke();
        break;
      }
      case 'bun': {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Sesame seeds
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(-4, -4, 2, 2);
        ctx.fillRect(2, -2, 2, 2);
        ctx.fillRect(-2, 3, 2, 2);
        break;
      }
      case 'cheese': {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-10, 6);
        ctx.lineTo(10, 6);
        ctx.lineTo(0, -9);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'sliced_cheese': {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.roundRect(-8, -6, 16, 12, 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.stroke();
        break;
      }
      case 'lettuce': {
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Inner leaf veins
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI);
        ctx.stroke();
        break;
      }
      case 'sliced_lettuce': {
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.roundRect(-8, -4, 16, 8, 2);
        ctx.fill();
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      case 'tomato': {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 1, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Stem
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -9, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sliced_tomato': {
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Tomato seed segments
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(-3, -2, 2, 0, Math.PI * 2);
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.arc(0, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'dirty_plate': {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stains
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-3, 1, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'plate': {
        // Ceramic plate base
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const contents = item.contents || [];
        // Draw burger layers if present
        if (contents.includes('bun')) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(0, 2, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (contents.includes('cooked_meat')) {
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.ellipse(0, -1, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (contents.includes('sliced_cheese')) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.roundRect(-8, -3, 16, 5, 1);
          ctx.fill();
        }
        if (contents.includes('sliced_lettuce')) {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.roundRect(-7, -5, 14, 4, 1);
          ctx.fill();
        }
        if (contents.includes('sliced_tomato')) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(2, -4, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        if (contents.includes('raw_meat')) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();
  }

  private drawPlayer(p: PlayerState) {
    const ctx = this.ctx;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;

    // Walking vertical bob
    const walkBob = p.isMoving ? Math.sin(p.walkFrame * 0.4) * 2.5 : 0;

    ctx.save();
    ctx.translate(cx, cy + walkBob);

    // Player Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, p.h / 2 + 2, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Chef Apron / Coat)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 4, 17, 0, Math.PI * 2);
    ctx.fill();

    // Apron white bib
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-9, -4, 18, 18, 4);
    ctx.fill();

    // Chef Head
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, -9, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eyes depending on facing direction
    ctx.fillStyle = '#0f172a';
    if (p.facing === 'up') {
      // Facing away, no eyes
    } else if (p.facing === 'down') {
      ctx.beginPath();
      ctx.arc(-4, -9, 1.8, 0, Math.PI * 2);
      ctx.arc(4, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.facing === 'left') {
      ctx.beginPath();
      ctx.arc(-6, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.facing === 'right') {
      ctx.beginPath();
      ctx.arc(6, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Classic Chef Toque Hat (Tall white toque blanche)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-10, -26, 20, 14, [6, 6, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hat brim
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-12, -14, 24, 4);

    // Overhead held item
    if (p.heldItem) {
      // Item hover bubble
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.arc(0, -38, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      this.drawItem(p.heldItem, 0, -38);
    }

    ctx.restore();
  }

  private drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const pt of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    for (const ft of texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private drawPrepBanner() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, this.width, 36);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍳 準備階段：熟悉動線與備料，隨時點擊右上角「開門營業」迎接客人！', this.width / 2, 18);
    ctx.restore();
  }
}
