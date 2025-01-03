// Game constants
const UNIT = 4;

const GAME_WIDTH = UNIT * 360; // Base width, will be scaled
const GAME_HEIGHT = UNIT * 640; // 16:9 ratio

const LANES = 6;
const PADDING_TOP = UNIT * 40; // More space for score/level
const PADDING_BOTTOM = UNIT * 100; // More space for controls/UI
const PADDING_LEFT = UNIT * 40;
const PADDING_RIGHT = UNIT * 40;
const TEXT_TOP = PADDING_TOP + UNIT * 20;

const INITIAL_CURRENCY = 500;
const INITIAL_LIVES = 3;

const BUTTON_WIDTH = (GAME_WIDTH / 5) * 3;
const BUTTON_HEIGHT = BUTTON_WIDTH / 4;

const BUTTON_X = GAME_WIDTH / 2 - BUTTON_WIDTH / 2;
const BUTTON_Y = GAME_HEIGHT / 2 - BUTTON_HEIGHT / 2;

// Game area calculations
const GAME_AREA_WIDTH = GAME_WIDTH - (PADDING_LEFT + PADDING_RIGHT);
const GAME_AREA_HEIGHT = GAME_HEIGHT - (PADDING_TOP + PADDING_BOTTOM);
const LANE_WIDTH = GAME_AREA_WIDTH / LANES; // Width of each lane
const SPOT_SIZE = LANE_WIDTH; // Defense spots are same width as lanes
const METEOR_SIZE = LANE_WIDTH * 0.8; // Base size for meteors
const GRID_ROWS = Math.floor(GAME_AREA_HEIGHT / SPOT_SIZE);
const LETTER_SPACING = "0.05em";

// Add to game constants
const DEBUG = false; // Toggle for development visualization

const COLORS = {
  BACKGROUND: "#000",
  TEXT: "#c0aa9a",
  DEFENSE_OPTION_TEXT: "#c0aa9a",
  DEFENSE_OPTION_TEXT_INACTIVE: "#f00",
  BUTTON: "#5d908a",
  BUTTON_TEXT: "#fff",
  PROGRESS_BAR: "#c0aa9a",
  PROGRESS_BORDER: "#c0aa9a",
  DEFENSE_BACKGROUND: "rgba(255,255,255,0.2)",
  BORDER: "#333",
  DEBUG_LINE: "rgba(0,0,0,0.1)",
  GRID_LINE: "rgba(0,0,0,0.25)",
  DEBUG_TEXT: "#666",
  SELECTION: "rgba(255,80,80,0.7)",
  HEART_FILL: "#c0aa9a",
  HEART_STROKE: "#c0aa9a",
  GAME_OVER_COLOR: "#FF4444",
  SUCCESS_COLOR: "#5c8e8b",
};

const TEXTS = {
  TITLE: window?.TXT?.TITLE || "Meteor\nDefense",
  SUB_TITLE: window?.TXT?.SUB_TITLE || "Alles Gute im neuen Jahr!",
  INTRO: window?.TXT?.INTRO || "",
  START_GAME: "Start!",
  TRY_AGAIN: "Neustart!",
  LIVES: "Leben:",
  LEVEL: "Level",
  SCORE: "Punkte",
  COINS: "Coins:",
  CURRENCY: "Geld:",
  HIGH_SCORE: "Rekord",
  LEVEL_COMPLETE: "Geschafft!",
  GAME_OVER: "Game Over!",
  GAME_COMPLETE: "Alle\nLevels\ngeschafft!",
  LIFE_LOST: "Leben\nverloren!",
  CONTINUE: "Weiter",
  NEXT_LEVEL: "Nächstes Level",
  LIFE_REMAINING: (lives) => `noch ${lives} ${lives === 1 ? "Leben" : "Leben"}`,
};

// Level generation configuration options
const LEVEL_GEN_CONFIG = {
  levelVersion: "1.8.4",
  baseDuration: 30000, // Base duration in ms
  durationIncrease: 0, // How much to increase duration per level (15s)
  maxLevels: 30, // How many levels to generate
  difficultyMultiplier: 0.85, // NEW: Global difficulty multiplier (1.0 = normal, < 1.0 easier, > 1.0 harder)

  // Meteor type weights (chance of spawning) at start and end of level
  meteorWeights: {
    start: { small: 1, medium: 0, large: 0 },
    end: { small: 0, medium: 0.35, large: 0.65 },
  },

  // Spawn timing
  minSpawnGap: 900, // Minimum ms between meteors at start
  minSpawnGapEnd: 200, // Minimum gap by end of level

  maxSpawnGap: 1300, // Maximum ms between meteors at start
  maxSpawnGapEnd: 200, // Maximum gap by end of level (NEW)

  // Difficulty scaling
  difficultyRamp: 1.25, // Multiplier for difficulty between levels
  waveDuration: 6200, // Initial duration of attack waves in ms
  waveDurationEnd: 1200, // End duration of attack waves in ms (NEW)
  waveGap: 3200, // Initial gap between waves in ms
  waveGapEnd: 400, // End gap between waves in ms (NEW)
};

function generateLevels(config = LEVEL_GEN_CONFIG) {
  const levels = [];
  const diff = config.difficultyMultiplier;

  for (let levelNum = 0; levelNum < config.maxLevels; levelNum++) {
    const duration =
      (config.baseDuration + config.durationIncrease * levelNum) /
      Math.sqrt(diff);
    const meteors = [];
    let currentTime = 1000;

    const levelDifficulty = Math.pow(config.difficultyRamp, levelNum) * diff;

    while (currentTime < duration - 2000) {
      const levelProgress = currentTime / duration;
      const adjustedWaveDuration = quadraticLerp(
        config.waveDuration / Math.sqrt(diff),
        config.waveDurationEnd / Math.sqrt(diff),
        levelProgress,
      );

      const waveEndTime = currentTime + adjustedWaveDuration;

      while (currentTime < waveEndTime) {
        const waveProgress =
          (currentTime - (waveEndTime - adjustedWaveDuration)) /
          adjustedWaveDuration;

        // Adjust weights based on difficulty (harder = more medium/large meteors)
        const weights = {
          small: quadraticLerp(
            config.meteorWeights.start.small,
            config.meteorWeights.end.small / diff, // Reduce small meteors at higher difficulty
            waveProgress,
          ),
          medium: quadraticLerp(
            config.meteorWeights.start.medium,
            config.meteorWeights.end.medium * diff, // Increase medium meteors at higher difficulty
            waveProgress,
          ),
          large: quadraticLerp(
            config.meteorWeights.start.large,
            config.meteorWeights.end.large * diff, // Increase large meteors at higher difficulty
            waveProgress,
          ),
        };

        // Select meteor type based on weights
        const meteorType = selectMeteorType(weights);

        // Select random lane
        const lane = Math.floor(Math.random() * LANES);

        meteors.push({
          type: meteorType,
          lane: lane,
          startTime: Math.floor(currentTime),
        });

        // Adjust spawn gaps based on difficulty (harder = faster spawns)
        const minGap = quadraticLerp(
          config.minSpawnGap / diff,
          config.minSpawnGapEnd / diff,
          waveProgress,
        );
        const maxGap = quadraticLerp(
          config.maxSpawnGap / diff,
          config.maxSpawnGapEnd / diff,
          waveProgress,
        );
        currentTime += Math.random() * (maxGap - minGap) + minGap;
      }

      const adjustedWaveGap = quadraticLerp(
        config.waveGap / diff,
        config.waveGapEnd / diff,
        levelProgress,
      );
      currentTime += adjustedWaveGap;
    }

    levels.push({
      name: `${TEXTS.LEVEL} ${levelNum + 1}`,
      duration: duration,
      meteors: meteors.sort((a, b) => a.startTime - b.startTime),
    });
  }

  return levels;
}

// Helper function to linearly interpolate between two values
function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function quadraticLerp(start, end, progress) {
  return start + (end - start) * progress * progress;
}

// Helper function to select meteor type based on weights
function selectMeteorType(weights) {
  const total = weights.small + weights.medium + weights.large;
  const random = Math.random() * total;

  if (random < weights.small) return 0; // Small meteor
  if (random < weights.small + weights.medium) return 1; // Medium meteor
  return 2; // Large meteor
}

// Replace the existing LEVELS constant with generated levels
const LEVELS = generateLevels();

const GAME_STATES = {
  LOADING: "loading",
  MENU: "menu",
  PLAYING: "playing",
  LIFE_LOST: "lifeLost",
  LEVEL_COMPLETE: "levelComplete",
  GAME_OVER: "gameover",
  GAME_COMPLETE: "gameComplete",
};

// Add to game constants
const DEFENSE_TYPES = [
  {
    id: 0,
    name: "Basic",
    color: "#4CAF50",
    cost: 100,
    damage: 10,
    health: 100,
  },
  {
    id: 1,
    name: "Medium",
    color: "#2196F3",
    cost: 140,
    damage: 20,
    health: 100,
  },
  {
    id: 2,
    name: "Strong",
    color: "#9C27B0",
    cost: 180,
    damage: 30,
    health: 100,
  },
];

// Add to game constants
const METEOR_TYPES = [
  {
    id: 0,
    name: "Small",
    color: "#FF9999",
    health: 30,
    speed: UNIT * 0.05,
    damageRate: 30,
    rotateRate: 0.0005,
    wiggleRate: 0.001,
    wiggleAmount: 7,
    sizeMultiplier: { x: 1.0, y: 1.0 },
    coinReward: 20, // 1 coin
  },
  {
    id: 1,
    name: "Medium",
    color: "#FF4444",
    health: 60,
    speed: UNIT * 0.035,
    damageRate: 50,
    rotateRate: 0,
    wiggleRate: 0.03,
    wiggleAmount: 0.03,
    sizeMultiplier: { x: 1, y: 2 },
    coinReward: 40, // 2 coins
  },
  {
    id: 2,
    name: "Large",
    color: "#FF0000",
    health: 90,
    speed: UNIT * 0.05,
    damageRate: 50,
    rotateRate: 0,
    wiggleRate: 0.03,
    wiggleAmount: 0.03,
    sizeMultiplier: { x: 1, y: 2 },
    coinReward: 50, // 3 coins
  },
];

// Font definitions
const FONT = {
  TINY: {
    size: UNIT * 7,
    family: "GameText, Arial, sans-serif",
    get full() {
      return `${this.size}px ${this.family}`;
    },
  },
  SMALL: {
    size: UNIT * 13,
    family: "GameText, Arial, sans-serif",
    get full() {
      return `${this.size}px ${this.family}`;
    },
  },
  LARGE: {
    size: UNIT * 18,
    family: "GameText, Arial, sans-serif",
    get full() {
      return `${this.size}px ${this.family}`;
    },
  },
  TITLE: {
    size: UNIT * 42,
    family: "GameTitle, Arial, sans-serif",
    get full() {
      return `${this.size}px ${this.family}`;
    },
  },
};

// Add at the top of the file, after other constants
const ASSETS = {
  METEORS: [
    "/assets/img/meteor-1.png",
    "/assets/img/meteor-2.png",
    "/assets/img/meteor-3.png",
  ],
  DEFENSES: [
    "/assets/img/defense-1.png",
    "/assets/img/defense-2.png",
    "/assets/img/defense-3.png",
  ],
  BACKGROUND: "/assets/img/bg.png",
  FONTS: {
    TITLE: "/assets/fonts/pilowlava/Fonts/webfonts/Pilowlava-Regular.woff2",
    TEXT: "/assets/fonts/space-mono/SpaceMono-Regular.ttf",
  },
};

// Add new AssetLoader class
class AssetLoader {
  constructor() {
    this.images = new Map();
    this.fonts = new Map();
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }

  async loadAll() {
    // Add font loading
    const fontPromises = [
      this.loadFont("GameText", ASSETS.FONTS.TEXT),
      this.loadFont("GameTitle", ASSETS.FONTS.TITLE),
    ];

    const meteorPromises = ASSETS.METEORS.map((path, index) =>
      this.loadImage(`meteor-${index}`, path),
    );

    const defensePromises = ASSETS.DEFENSES.map((path, index) =>
      this.loadImage(`defense-${index}`, path),
    );

    const backgroundPromise = this.loadImage("background", ASSETS.BACKGROUND);

    try {
      await Promise.all([
        ...fontPromises,
        ...meteorPromises,
        ...defensePromises,
        backgroundPromise,
      ]);
      return true;
    } catch (error) {
      console.error("Error loading assets:", error);
      return false;
    }
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      this.totalAssets++;

      img.onload = () => {
        this.images.set(key, img);
        this.loadedAssets++;
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });
  }

  getImage(key) {
    return this.images.get(key);
  }

  getLoadingProgress() {
    return this.totalAssets ? this.loadedAssets / this.totalAssets : 0;
  }

  // Add new loadFont method
  async loadFont(fontFamily, url) {
    this.totalAssets++;

    const fontFace = new FontFace(fontFamily, `url(${url})`);

    try {
      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);
      this.fonts.set(fontFamily, loadedFont);
      this.loadedAssets++;
      return loadedFont;
    } catch (error) {
      console.error(`Failed to load font: ${url}`, error);
      throw error;
    }
  }
}

// Add at the top of the file, after constants
let game; // Global game instance

// Test meteor
class Meteor {
  constructor(lane, type = METEOR_TYPES[0]) {
    this.lane = lane;
    this.type = type;
    this.y = PADDING_TOP;
    this.health = type.health;
    this.speed = type.speed;
    this.isBlocked = false;
    this.blockingDefense = null;

    // Add rotation and wiggle properties
    this.baseRotation = 0; // Base rotation from type.rotateRate
    this.wiggleRotation = 0; // Additional rotation from wiggle motion
    this.wiggleOffset = 0;
    this.baseX = PADDING_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;
  }

  update(deltaTime) {
    if (!this.isBlocked) {
      this.y += this.speed * deltaTime;

      // Update base rotation
      this.baseRotation += this.type.rotateRate * deltaTime;

      // Update wiggle and calculate wiggle-based rotation
      this.wiggleOffset += this.type.wiggleRate * deltaTime;
      // Calculate rotation based on wiggle movement (adjust 0.5 to control rotation intensity)
      this.wiggleRotation =
        Math.cos(this.wiggleOffset) * this.type.wiggleAmount * 0.5;
    }
  }

  block(defense) {
    this.isBlocked = true;
    this.blockingDefense = defense;
  }

  unblock() {
    this.isBlocked = false;
    this.blockingDefense = null;
  }

  draw(ctx) {
    // Calculate wiggled x position
    const wiggleX =
      this.baseX + Math.sin(this.wiggleOffset) * this.type.wiggleAmount;

    // Get the corresponding meteor image
    const meteorImage = game?.assetLoader.getImage(`meteor-${this.type.id}`);

    if (meteorImage) {
      ctx.save(); // Save current context state

      // Translate to meteor position
      ctx.translate(wiggleX, this.y);

      // Apply combined rotation (base rotation + wiggle-based rotation)
      ctx.rotate(this.baseRotation + this.wiggleRotation);

      // Calculate size using multiplier
      const height = METEOR_SIZE * this.type.sizeMultiplier.y;
      const width = METEOR_SIZE * this.type.sizeMultiplier.x;

      // Draw the image centered at the translated position
      ctx.drawImage(meteorImage, -width / 2, -height / 2, width, height);

      ctx.restore(); // Restore context state
    } else {
      // Fallback to original circle drawing if image isn't loaded
      ctx.fillStyle = this.type.color;
      ctx.beginPath();
      ctx.arc(wiggleX, this.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    if (DEBUG) {
      // Draw collision circle
      ctx.strokeStyle = "rgba(255,0,0,0.5)";
      ctx.beginPath();
      ctx.arc(wiggleX, this.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw health
      ctx.fillStyle = "white";
      ctx.font = FONT.SMALL.full;
      ctx.textAlign = "center";
      ctx.fillText(`${this.health}`, wiggleX, this.y);
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
}

// Add to existing constants
class Button {
  constructor(
    text,
    backgroundColor = COLORS.BUTTON,
    textColor = COLORS.BUTTON_TEXT,
    fontSize = 16,
  ) {
    this.x = BUTTON_X;
    this.y = BUTTON_Y;
    this.width = BUTTON_WIDTH;
    this.height = BUTTON_HEIGHT;
    this.text = text;
    this.backgroundColor = backgroundColor;
    this.textColor = textColor;
    this.fontSize = fontSize;
  }

  isClicked(clickX, clickY) {
    return (
      clickX >= this.x &&
      clickX <= this.x + this.width &&
      clickY >= this.y &&
      clickY <= this.y + this.height
    );
  }

  draw(ctx) {
    // Draw button background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw button text
    ctx.fillStyle = this.textColor;
    ctx.font = FONT.LARGE.full;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = LETTER_SPACING;
    ctx.fillText(
      this.text,
      this.x + this.width / 2,
      this.y + this.height * 0.52,
    );
    ctx.letterSpacing = "0px";
  }
}

class Projectile {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.speed = UNIT * 0.3;
    this.damage = damage;
    this.size = UNIT * 4;
  }

  update(deltaTime) {
    this.y -= this.speed * deltaTime;
  }

  draw(ctx) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    if (DEBUG) {
      // Draw collision circle
      ctx.strokeStyle = "rgba(255,255,0,0.3)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  checkCollision(meteor) {
    const meteorX = PADDING_LEFT + meteor.lane * LANE_WIDTH + LANE_WIDTH / 2;
    const dx = this.x - meteorX;
    const dy = this.y - meteor.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.size + 10 * UNIT; // 10 is meteor radius
  }

  isOffScreen() {
    return this.y < PADDING_TOP;
  }
}

// Add to game constants
class Defense {
  constructor(type = null) {
    this.type = type;
    this.health = type ? type.health : 0;
    this.maxHealth = type ? type.health : 0;
    this.projectiles = [];
    this.lastFireTime = 0;
    this.fireRate = 1000;
    this.blockingMeteors = []; // Add array to track blocked meteors
  }

  isEmpty() {
    return this.type === null;
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  update(currentTime, x, y, meteors, coins) {
    if (!this.isEmpty()) {
      // Fire projectile if enough time has passed
      if (currentTime - this.lastFireTime > this.fireRate) {
        this.projectiles.push(new Projectile(x, y, this.type.damage));
        this.lastFireTime = currentTime;
      }

      // Check for meteor collisions with this defense
      const defenseRow = Math.floor((y - PADDING_TOP) / SPOT_SIZE);
      meteors.forEach((meteor) => {
        const meteorRow = Math.floor((meteor.y - PADDING_TOP) / SPOT_SIZE);
        if (
          meteorRow === defenseRow &&
          meteor.lane === Math.floor((x - PADDING_LEFT) / LANE_WIDTH)
        ) {
          // Block meteor if not already blocked
          if (!meteor.isBlocked) {
            meteor.block(this);
            this.blockingMeteors.push(meteor); // Track this meteor
          }

          // Take damage from meteor using meteor's damage rate
          if (meteor.blockingDefense === this) {
            const destroyed = this.takeDamage(meteor.type.damageRate / 60);
            if (destroyed) {
              // Unblock all meteors this defense was blocking
              this.blockingMeteors.forEach((m) => m.unblock());
              this.blockingMeteors = [];
              this.type = null; // Reset defense when destroyed
              this.health = 0;
              this.maxHealth = 0;
            }
          }
        }
      });

      // Update existing projectiles and check collisions
      this.projectiles = this.projectiles.filter((projectile) => {
        projectile.update(16);

        // Check for collisions with any meteor
        for (let i = 0; i < meteors.length; i++) {
          const meteor = meteors[i];
          if (projectile.checkCollision(meteor)) {
            const destroyed = meteor.takeDamage(projectile.damage);
            if (destroyed) {
              // Spawn coin at meteor's position with meteor's reward value
              const meteorX =
                PADDING_LEFT + meteor.lane * LANE_WIDTH + LANE_WIDTH / 2;
              coins.push(new Coin(meteorX, meteor.y, meteor.type.coinReward));
              meteors.splice(i, 1);
            }
            return false; // Remove projectile
          }
        }

        return !projectile.isOffScreen();
      });
    }
  }

  draw(ctx, x, y, size, isSelected = false, isInactive = false) {
    // Draw spot outline
    ctx.strokeStyle = this.isEmpty() ? COLORS.GRID_LINE : "#888";
    ctx.lineWidth = UNIT * 1;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    ctx.fillStyle = COLORS.DEFENSE_BACKGROUND; // Add black background to prevent any transparency
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    if (!this.isEmpty()) {
      if (game?.assetLoader) {
        // Draw defense image
        const defenseImage = game.assetLoader.getImage(
          `defense-${this.type.id}`,
        );
        if (defenseImage) {
          if (isInactive) {
            ctx.globalAlpha = 0.5;
          } else {
            ctx.globalAlpha = Math.max(0.3, this.health / this.maxHealth);
          }

          ctx.drawImage(defenseImage, x - size / 2, y - size / 2, size, size);

          ctx.globalAlpha = 1.0;
        }
      }

      // Draw projectiles
      this.projectiles.forEach((projectile) => projectile.draw(ctx));

      if (DEBUG) {
        // Draw health bar
        ctx.fillStyle = COLORS.TEXT;
        ctx.font = FONT.SMALL.full;
        ctx.textAlign = "center";
        ctx.fillText(
          `${Math.floor((this.health / this.maxHealth) * 100)}%`,
          x,
          y,
        );
      }

      // Draw selection highlight
      if (isSelected) {
        ctx.strokeStyle = COLORS.SELECTION;
        ctx.lineWidth = UNIT * 4;
        ctx.strokeRect(x - size / 2, y - size / 2, size, size);
      }
    }
  }
}

class DefenseOption {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.defense = new Defense(type);
  }

  draw(ctx, isSelected = false, currentCurrency = 0) {
    const isInactive = currentCurrency < this.type.cost;

    // Draw defense using Defense class
    this.defense.draw(
      ctx,
      this.x + SPOT_SIZE / 2,
      this.y + SPOT_SIZE / 2,
      SPOT_SIZE,
      isSelected,
      isInactive,
    );

    // Draw cost (red if can't afford)
    ctx.fillStyle = isInactive
      ? COLORS.DEFENSE_OPTION_TEXT_INACTIVE
      : COLORS.DEFENSE_OPTION_TEXT;
    ctx.font = FONT.SMALL.full;
    ctx.textAlign = "center";
    ctx.letterSpacing = LETTER_SPACING;
    ctx.fillText(
      `$${this.type.cost}`,
      this.x + SPOT_SIZE / 2,
      this.y + SPOT_SIZE + UNIT * 15,
    );
    ctx.letterSpacing = "0px";
  }

  isClicked(clickX, clickY) {
    return (
      clickX >= this.x &&
      clickX <= this.x + SPOT_SIZE &&
      clickY >= this.y &&
      clickY <= this.y + SPOT_SIZE
    );
  }
}

class DefenseSpot {
  constructor(x, y, row, lane) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.lane = lane;
    this.defense = new Defense();
  }

  isEmpty() {
    return this.defense.isEmpty();
  }

  placeDefense(defenseType) {
    if (this.isEmpty()) {
      this.defense = new Defense(defenseType);
      return true;
    }
    return false;
  }

  removeDefense() {
    this.defense = new Defense(); // Reset to empty defense
  }

  draw(ctx) {
    // Draw defense (or empty spot)
    this.defense.draw(ctx, this.x, this.y, SPOT_SIZE);

    if (DEBUG) {
      // Draw coordinates for debugging
      ctx.fillStyle = COLORS.DEBUG_TEXT;
      ctx.font = FONT.SMALL.full;
      ctx.textAlign = "center";
      ctx.fillText(`${this.lane},${this.row}`, this.x, this.y);
    }
  }

  update(currentTime, meteors, coins) {
    this.defense.update(currentTime, this.x, this.y, meteors, coins);
  }
}

class Coin {
  constructor(x, y, value = 10) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.lifetime = 5000; // 5 seconds lifetime
    this.createTime = performance.now();
    this.hitRadius = UNIT * 30; // Bigger radius for hit detection

    // Size based on value
    this.size = UNIT * (8 + ((value - 10) / 10) * 2); // Increases by 2 pixels for each 10 value

    // Base movement
    const angle = Math.random() * Math.PI * 2;
    const speed = UNIT * (0.3 + Math.random() * 0.1);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Wave motion parameters
    this.waveAmplitude = UNIT * (2.2 + Math.random() * 0.2);
    this.waveFrequency = 0.005 + Math.random() * 0.001;
    this.waveOffset = Math.random() * Math.PI * 2;
    this.baseX = x;
    this.baseY = y;
    this.time = 0;
  }

  draw(ctx, currentTime) {
    const age = currentTime - this.createTime;
    const remainingTime = this.lifetime - age;

    // Start blinking when less than 1.5 seconds remaining
    if (remainingTime < 1500) {
      const blinkRate = 100 + (remainingTime / 1500) * 400;
      if (Math.floor(currentTime / blinkRate) % 2 === 0) {
        return;
      }
    }

    if (DEBUG) {
      // Draw hit area
      ctx.strokeStyle = "rgba(255, 80, 80, 0.6)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.hitRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    const coinX =
      this.x +
      Math.sin(this.time * this.waveFrequency + this.waveOffset) *
        this.waveAmplitude;
    const coinY =
      this.y +
      Math.cos(this.time * this.waveFrequency + this.waveOffset) *
        this.waveAmplitude;

    // Draw coin with gradient for more depth
    const gradient = ctx.createRadialGradient(
      coinX - this.size / 3,
      coinY - this.size / 3,
      0,
      coinX,
      coinY,
      this.size,
    );
    gradient.addColorStop(0, "#FFD700"); // Bright gold
    gradient.addColorStop(1, "#DAA520"); // Darker gold

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(coinX, coinY, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add coin border
    ctx.strokeStyle = "#B8860B"; // Dark gold
    ctx.lineWidth = UNIT * 1;
    ctx.stroke();

    // Draw value
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.7;
    ctx.font = `${Math.max(10, this.size)}px ${FONT.SMALL.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = LETTER_SPACING;
    ctx.fillText(`${this.value}`, coinX, coinY + this.size / 8);
    ctx.letterSpacing = "0px";
    ctx.globalAlpha = 1;
  }

  update(currentTime) {
    this.time += 16; // Increment time (assuming ~60fps)

    // Update base position with velocity
    this.baseX += this.vx;
    this.baseY += this.vy;

    // Add wave motion
    this.x =
      this.baseX +
      Math.sin(this.time * this.waveFrequency + this.waveOffset) *
        this.waveAmplitude;
    this.y =
      this.baseY +
      Math.cos(this.time * this.waveFrequency + this.waveOffset) *
        this.waveAmplitude;

    // Calculate remaining lifetime
    const age = currentTime - this.createTime;
    return age < this.lifetime;
  }

  isClicked(clickX, clickY) {
    const dx = clickX - this.x;
    const dy = clickY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.hitRadius;
  }
}

class LevelManager {
  constructor() {
    this.currentLevel = 0;
    this.levelStartTime = 0;
    this.remainingMeteors = [];
    this.allMeteorsSpawned = false;
    this.pauseStartTime = 0; // Add new property to track pause time
    this.totalPausedTime = 0; // Add new property to track total paused time
  }

  startLevel(levelIndex) {
    this.currentLevel = levelIndex;
    this.levelStartTime = performance.now();
    this.remainingMeteors = [...LEVELS[levelIndex].meteors];
    this.allMeteorsSpawned = false;
    this.totalPausedTime = 0; // Reset paused time when starting new level
  }

  update(currentTime, meteors) {
    if (this.currentLevel >= LEVELS.length) return false;

    // Adjust level time by subtracting total paused time
    const levelTime = currentTime - this.levelStartTime - this.totalPausedTime;
    const level = LEVELS[this.currentLevel];

    // Check if level time is exceeded
    if (levelTime >= level.duration) {
      this.allMeteorsSpawned = true;
      return false;
    }

    // Spawn meteors that are due
    while (
      this.remainingMeteors.length > 0 &&
      levelTime >= this.remainingMeteors[0].startTime
    ) {
      const meteorData = this.remainingMeteors.shift();
      meteors.push(new Meteor(meteorData.lane, METEOR_TYPES[meteorData.type]));
    }

    // Check if all meteors have been spawned
    if (this.remainingMeteors.length === 0) {
      this.allMeteorsSpawned = true;
    }

    return true;
  }

  isLevelComplete(meteors) {
    return this.allMeteorsSpawned && meteors.length === 0;
  }

  getLevelProgress() {
    const currentTime = performance.now();
    let adjustedTime = currentTime - this.levelStartTime - this.totalPausedTime;
    // If currently paused, also subtract the current pause duration
    if (this.pauseStartTime) {
      adjustedTime -= currentTime - this.pauseStartTime;
    }
    const duration = LEVELS[this.currentLevel].duration;
    return Math.min(adjustedTime / duration, 1);
  }

  // Add new methods to handle pausing
  pause() {
    if (!this.pauseStartTime) {
      this.pauseStartTime = performance.now();
    }
  }

  resume() {
    if (this.pauseStartTime) {
      this.totalPausedTime += performance.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
  }
}

const STORAGE_KEY = "meteorDefenseHighScore";

// Add after other classes, before Game class
class TextRenderer {
  static drawTitle(
    ctx,
    { title = "", color = COLORS.TEXT, subtitle = null, copy = null },
  ) {
    const x = GAME_WIDTH / 2;
    const baseY = GAME_HEIGHT / 4;
    const titleLineHeight = FONT.TITLE.size * 1.2;
    const subtitleLineHeight = FONT.LARGE.size * 1.3;
    const copyLineHeight = FONT.SMALL.size * 1.35;

    // Split title into lines
    const titleLines = title.split("\n");
    // Calculate starting Y position that grows upward
    const titleStartY = baseY - (titleLines.length - 1) * titleLineHeight;

    // Draw main title lines
    ctx.fillStyle = color;
    ctx.font = FONT.TITLE.full;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    titleLines.forEach((line, index) => {
      ctx.fillText(line, x, titleStartY + index * titleLineHeight);
    });

    // Draw subtitle if provided
    if (subtitle) {
      ctx.fillStyle = COLORS.TEXT;
      ctx.font = FONT.LARGE.full;
      ctx.letterSpacing = LETTER_SPACING;
      // Split subtitle into lines and render each one
      const subtitleLines = subtitle.split("\n");
      subtitleLines.forEach((line, index) => {
        ctx.fillText(
          line,
          x,
          baseY + titleLineHeight + index * subtitleLineHeight,
        );
      });
      ctx.letterSpacing = "0px";
    }
    if (copy) {
      ctx.fillStyle = COLORS.TEXT;
      ctx.font = FONT.SMALL.full;
      ctx.letterSpacing = LETTER_SPACING;
      // Split copy into lines and render each one
      const copyLines = copy.split("\n");
      copyLines.forEach((line, index) => {
        ctx.fillText(line, x, (GAME_HEIGHT / 5) * 3 + index * copyLineHeight);
      });
      ctx.letterSpacing = "0px";
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.lastTime = 0;
    this.meteors = [];
    this.coins = [];
    this.assetLoader = new AssetLoader();
    this.gameState = GAME_STATES.LOADING;

    // Initialize game dimensions and scaling
    this.initializeCanvas();
    window.addEventListener("resize", () => this.initializeCanvas());

    // Initialize other game properties
    this.initializeGameProperties();

    // Start game loop immediately
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));

    // Load assets separately
    this.loadAssets();
  }

  initializeCanvas() {
    // Get dynamic viewport height (accounts for mobile browser UI elements)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate maximum possible game size that maintains aspect ratio
    const gameAspectRatio = GAME_WIDTH / GAME_HEIGHT;
    const viewportAspectRatio = viewportWidth / viewportHeight;

    let scale;
    if (viewportAspectRatio > gameAspectRatio) {
      // Viewport is wider than game - fit to height
      scale = viewportHeight / GAME_HEIGHT;
    } else {
      // Viewport is taller than game - fit to width
      scale = viewportWidth / GAME_WIDTH;
    }

    // Ensure the scaled size doesn't exceed viewport
    scale = Math.min(scale, 1);

    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;

    // Apply scale through CSS
    this.canvas.style.width = `${GAME_WIDTH * scale}px`;
    this.canvas.style.height = `${GAME_HEIGHT * scale}px`;
  }

  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scale;
      const y = (e.clientY - rect.top) * scale;

      if (this.gameState === GAME_STATES.MENU) {
        if (this.startButton.isClicked(x, y)) {
          this.startGame();
        }
      } else if (this.gameState === GAME_STATES.GAME_OVER) {
        if (this.retryButton.isClicked(x, y)) {
          this.startGame();
        }
      } else if (this.gameState === GAME_STATES.LEVEL_COMPLETE) {
        if (this.nextLevelButton.isClicked(x, y)) {
          this.startNextLevel();
        }
      } else if (this.gameState === GAME_STATES.PLAYING) {
        // Check for coin collection first
        let coinCollected = false;
        for (let i = this.coins.length - 1; i >= 0; i--) {
          const coin = this.coins[i];
          if (coin.isClicked(x, y)) {
            this.currency += coin.value;
            this.currentScore += coin.value; // Add to current score
            this.coins.splice(i, 1);
            coinCollected = true;
            break;
          }
        }

        // Only check defense interactions if we didn't collect a coin
        if (!coinCollected) {
          // Check if defense option was clicked
          this.defenseOptions.forEach((option) => {
            if (option.isClicked(x, y)) {
              if (this.selectedDefense === option.type) {
                // Deselect if clicking the same defense
                this.selectedDefense = null;
                console.log("Defense deselected");
              } else if (this.currency >= option.type.cost) {
                this.selectedDefense = option.type;
                console.log(`Selected ${option.type.name} defense`);
              } else {
                console.log("Not enough currency!");
              }
            }
          });

          // Check if grid spot was clicked
          if (this.selectedDefense) {
            const spot = this.getSpotAtPosition(x, y);
            if (spot && spot.isEmpty()) {
              if (this.currency >= this.selectedDefense.cost) {
                spot.placeDefense(this.selectedDefense);
                this.currency -= this.selectedDefense.cost;
                this.selectedDefense = null; // Reset selection after placing defense
              }
            }
          }
        }
      } else if (this.gameState === GAME_STATES.LIFE_LOST) {
        if (this.continueButton.isClicked(x, y)) {
          this.continuePlaying();
          this.currency += 120;
        }
      }
    });
  }

  startGame() {
    this.gameState = GAME_STATES.PLAYING;
    this.meteors = [];
    this.coins = [];
    this.currency = INITIAL_CURRENCY;
    this.selectedDefense = null;
    this.lives = INITIAL_LIVES; // Reset lives when starting new game
    this.currentScore = 0; // Reset current score
    this.levelManager.startLevel(0);

    // Reset defense grid
    for (let row = 0; row < this.defenseGrid.length; row++) {
      for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
        this.defenseGrid[row][lane].removeDefense();
      }
    }
  }

  startNextLevel() {
    this.meteors = [];
    this.coins = [];
    this.currency = INITIAL_CURRENCY;
    this.selectedDefense = null;

    // Reset defense grid
    for (let row = 0; row < this.defenseGrid.length; row++) {
      for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
        this.defenseGrid[row][lane].removeDefense();
      }
    }

    this.levelManager.startLevel(this.levelManager.currentLevel + 1);
    this.gameState = GAME_STATES.PLAYING;
  }

  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw game elements
    this.update(deltaTime);
    this.draw();

    // Continue game loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  drawBackground() {
    if (DEBUG) {
      this.ctx.fillStyle = "#666";
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      return;
    }

    // Draw background image
    const bgImage = this.assetLoader.getImage("background");
    if (bgImage) {
      // Draw the image covering the full canvas, before anything else
      this.ctx.fillStyle = COLORS.BACKGROUND; // Add black background to prevent any transparency
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.ctx.drawImage(bgImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      // Fallback to solid color if image not loaded
      this.ctx.fillStyle = COLORS.BACKGROUND;
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
  }

  drawDefenseGrid() {
    // Draw defense grid
    for (let row = 0; row < this.defenseGrid.length; row++) {
      for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
        this.defenseGrid[row][lane].draw(this.ctx);
      }
    }
  }

  update(deltaTime) {
    if (this.gameState === GAME_STATES.PLAYING) {
      const currentTime = performance.now();

      // Update all defense spots
      for (let row = 0; row < this.defenseGrid.length; row++) {
        for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
          this.defenseGrid[row][lane].update(
            currentTime,
            this.meteors,
            this.coins,
          );
        }
      }

      // Update meteors and check for lives
      this.meteors = this.meteors.filter((meteor) => {
        meteor.update(deltaTime);
        if (meteor.y >= GAME_HEIGHT - PADDING_BOTTOM) {
          this.lives--;
          if (this.lives <= 0) {
            // Update high score when game ends
            if (this.currentScore > this.highScore) {
              this.highScore = this.currentScore;
              this.saveHighScore();
            }
            // Update level high score when game ends
            if (this.levelManager.currentLevel > this.levelHighScore) {
              this.levelHighScore = this.levelManager.currentLevel;
              this.saveLevelHighScore();
            }
            this.gameState = GAME_STATES.GAME_OVER;
          } else {
            this.gameState = GAME_STATES.LIFE_LOST;
          }
          return false;
        }
        return true;
      });

      // Update coins
      this.coins = this.coins.filter((coin) => {
        return coin.update(currentTime);
      });

      // Update level manager
      this.levelManager.update(currentTime, this.meteors);

      // Check for level completion
      if (this.levelManager.isLevelComplete(this.meteors)) {
        if (this.levelManager.currentLevel >= LEVELS.length - 1) {
          this.gameState = GAME_STATES.GAME_COMPLETE;
        } else {
          this.gameState = GAME_STATES.LEVEL_COMPLETE;
        }
      }
    } else if (this.gameState === GAME_STATES.LIFE_LOST) {
      // Pause the level timer
      this.levelManager.pause();
    }
  }

  drawCurrency() {
    const currencyY = GAME_HEIGHT - PADDING_BOTTOM + UNIT * 15; // Position below game grid

    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = FONT.SMALL.full;
    this.ctx.textAlign = "center";
    this.ctx.letterSpacing = LETTER_SPACING;

    // Draw currency centered below grid
    this.ctx.fillText(
      `${TEXTS.CURRENCY} $${this.currency}`,
      GAME_WIDTH / 2,
      currencyY,
    );

    // Level text centered below progress bar
    this.ctx.fillText(
      `${LEVELS[this.levelManager.currentLevel].name}`,
      GAME_WIDTH / 2,
      TEXT_TOP,
    );

    // Draw scores in top left corner
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `${this.currentScore} ${TEXTS.SCORE}`,
      PADDING_LEFT,
      TEXT_TOP,
    );

    this.ctx.letterSpacing = "0px";
  }

  draw() {
    this.drawBackground();

    if (this.gameState === GAME_STATES.LOADING) {
      this.drawLoadingScreen();
    } else if (this.gameState === GAME_STATES.MENU) {
      TextRenderer.drawTitle(this.ctx, {
        title: TEXTS.TITLE,
        subtitle: TEXTS.SUB_TITLE,
        copy: TEXTS.INTRO,
        color: COLORS.GAME_OVER_COLOR,
      });

      this.startButton.draw(this.ctx);
      this.drawVersion();
    } else if (this.gameState === GAME_STATES.PLAYING) {
      this.drawDefenseGrid();

      // Draw currency and lives
      this.drawCurrency();
      this.drawLives();
      this.drawProgressBar(this.ctx);

      // Draw defense options
      this.defenseOptions.forEach((option) => {
        option.draw(
          this.ctx,
          this.selectedDefense && option.type.id === this.selectedDefense.id,
          this.currency,
        );
      });

      // Draw meteors
      this.meteors.forEach((meteor) => meteor.draw(this.ctx));

      // Draw coins
      const currentTime = performance.now();
      this.coins.forEach((coin) => coin.draw(this.ctx, currentTime));

      this.drawVersion();
    } else if (this.gameState === GAME_STATES.LIFE_LOST) {
      // Draw the life lost screen
      this.drawCurrency();
      this.drawLives();
      this.drawProgressBar(this.ctx);

      // Add semi-transparent overlay
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      TextRenderer.drawTitle(this.ctx, {
        title: TEXTS.LIFE_LOST,
        color: COLORS.GAME_OVER_COLOR,
        subtitle: TEXTS.LIFE_REMAINING(this.lives),
      });

      this.continueButton.draw(this.ctx);
    } else if (this.gameState === GAME_STATES.LEVEL_COMPLETE) {
      TextRenderer.drawTitle(this.ctx, {
        title: TEXTS.LEVEL_COMPLETE,
        color: COLORS.SUCCESS_COLOR,
      });
      this.nextLevelButton.draw(this.ctx);
    } else if (this.gameState === GAME_STATES.GAME_COMPLETE) {
      TextRenderer.drawTitle(this.ctx, {
        title: TEXTS.GAME_COMPLETE,
        color: COLORS.SUCCESS_COLOR,
        subtitle: `${TEXTS.SCORE}: ${this.currentScore} (${TEXTS.LEVEL} ${
          this.levelManager.currentLevel + 1
        })
${TEXTS.HIGH_SCORE}: ${this.highScore} (${TEXTS.LEVEL} ${
          this.levelHighScore + 1
        })`,
      });
    } else if (this.gameState === GAME_STATES.GAME_OVER) {
      TextRenderer.drawTitle(this.ctx, {
        title: TEXTS.GAME_OVER,
        color: COLORS.GAME_OVER_COLOR,
        subtitle: `${TEXTS.SCORE}: ${this.currentScore} (${TEXTS.LEVEL} ${
          this.levelManager.currentLevel + 1
        })
${TEXTS.HIGH_SCORE}: ${this.highScore} (${TEXTS.LEVEL} ${
          this.levelHighScore + 1
        })`,
      });
      this.retryButton.draw(this.ctx);
    }
  }

  createDefenseOptions() {
    const optionsAreaY = GAME_HEIGHT - PADDING_BOTTOM + UNIT * 30; // Move down to make room for currency
    const spacing = UNIT * 20;
    const totalWidth = (SPOT_SIZE + spacing) * DEFENSE_TYPES.length - spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2;

    return DEFENSE_TYPES.map((type, index) => {
      const x = startX + index * (SPOT_SIZE + spacing);
      const y = optionsAreaY;
      return new DefenseOption(type, x, y);
    });
  }

  createDefenseGrid() {
    const grid = [];

    // Create 2D array for easier position reference
    for (let row = 0; row < GRID_ROWS; row++) {
      const rowArray = [];
      for (let lane = 0; lane < LANES; lane++) {
        const x = PADDING_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;
        const y =
          GAME_HEIGHT - PADDING_BOTTOM - row * SPOT_SIZE - SPOT_SIZE / 2;
        rowArray.push(new DefenseSpot(x, y, row, lane));
      }
      grid.push(rowArray);
    }

    return grid;
  }

  // Helper method to get spot at specific coordinates
  getSpotAtPosition(x, y) {
    for (let row = 0; row < this.defenseGrid.length; row++) {
      for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
        const spot = this.defenseGrid[row][lane];
        if (
          x >= spot.x - SPOT_SIZE / 2 &&
          x <= spot.x + SPOT_SIZE / 2 &&
          y >= spot.y - SPOT_SIZE / 2 &&
          y <= spot.y + SPOT_SIZE / 2
        ) {
          return spot;
        }
      }
    }
    return null;
  }

  drawProgressBar(ctx) {
    // Draw progress bar background
    const barWidth = GAME_WIDTH - PADDING_LEFT - PADDING_RIGHT; // Leave some padding
    const barHeight = UNIT * 20;
    const x = PADDING_LEFT;
    const y = UNIT * 20; // Padding from top

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Progress (inverted to show remaining time)
    const progress = 1 - this.levelManager.getLevelProgress();
    ctx.fillStyle = COLORS.PROGRESS_BAR;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Border
    ctx.strokeStyle = COLORS.PROGRESS_BORDER;
    ctx.lineWidth = UNIT * 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Time remaining
    if (DEBUG) {
      const timeLeft = Math.ceil(
        (LEVELS[this.levelManager.currentLevel].duration -
          (performance.now() - this.levelManager.levelStartTime)) /
          1000,
      );
      if (timeLeft > 0) {
        ctx.font = FONT.SMALL.full;
        ctx.fillText(`${timeLeft}s`, GAME_WIDTH - 30, y + barHeight / 2 + 5);
      }
    }
  }

  async loadAssets() {
    try {
      const success = await this.assetLoader.loadAll();
      if (success) {
        this.gameState = GAME_STATES.MENU;
      } else {
        console.error("Failed to load assets");
      }
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  }

  drawLoadingScreen() {
    const progress = this.assetLoader.getLoadingProgress();

    // draw black background
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw loading bar
    const barWidth = GAME_WIDTH - PADDING_LEFT - PADDING_RIGHT; // Leave some padding
    const barHeight = UNIT * 20;
    const x = PADDING_LEFT;
    const y = GAME_HEIGHT / 2;

    // Background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Progress
    this.ctx.fillStyle = COLORS.PROGRESS_BAR;
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Border
    this.ctx.strokeStyle = COLORS.PROGRESS_BORDER;
    this.ctx.lineWidth = UNIT * 2;
    this.ctx.strokeRect(x, y, barWidth, barHeight);

    // Loading text
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = FONT.LARGE.full;
    this.ctx.textAlign = "center";
    this.ctx.fillText("Loading...", GAME_WIDTH / 2, y - UNIT * 20);
    this.ctx.fillText(
      `${Math.floor(progress * 100)}%`,
      GAME_WIDTH / 2,
      y + UNIT * 40,
    );
  }

  drawLives() {
    const heartSize = UNIT * 17;
    const spacing = UNIT * 5;
    const startX =
      GAME_WIDTH -
      PADDING_LEFT -
      heartSize / 2 -
      (heartSize + spacing) * (INITIAL_LIVES - 1);
    const y = PADDING_TOP + UNIT * 20;

    // Draw hearts
    for (let i = 0; i < INITIAL_LIVES; i++) {
      const x = startX + (heartSize + spacing) * i;

      // Draw empty heart outline
      this.ctx.strokeStyle = COLORS.HEART_STROKE;
      this.ctx.lineWidth = UNIT * 2;
      this.drawHeart(x, y - heartSize / 2, heartSize);

      // Fill heart if life is remaining
      if (i < this.lives) {
        this.ctx.fillStyle = COLORS.HEART_FILL;
        this.drawHeart(x, y - heartSize / 2, heartSize, true);
      }
    }
  }

  // Helper method to draw a heart
  drawHeart(x, y, size, fill = false) {
    const path = new Path2D();
    path.moveTo(x, y + size / 4);
    path.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    path.bezierCurveTo(
      x - size / 2,
      y + size / 2,
      x,
      y + (size * 3) / 4,
      x,
      y + (size * 3) / 4,
    );
    path.bezierCurveTo(
      x,
      y + (size * 3) / 4,
      x + size / 2,
      y + size / 2,
      x + size / 2,
      y + size / 4,
    );
    path.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);

    if (fill) {
      this.ctx.fill(path);
    } else {
      this.ctx.lineCap = "round";
      this.ctx.stroke(path);
    }
  }

  // Add new method to continue playing
  continuePlaying() {
    this.gameState = GAME_STATES.PLAYING;
    this.meteors = [];
    // Resume the level timer
    this.levelManager.resume();
  }

  // Add after constructor
  loadHighScore() {
    const saved = localStorage.getItem(STORAGE_KEY + "_coins");
    return saved ? parseInt(saved, 0) : 0;
  }

  saveHighScore() {
    localStorage.setItem(STORAGE_KEY + "_coins", this.highScore.toString());
  }

  // Add new method to draw version
  drawVersion() {
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = FONT.TINY.full; // Smaller font size
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      `v${LEVEL_GEN_CONFIG.levelVersion}`,
      GAME_WIDTH - UNIT * 5,
      GAME_HEIGHT - UNIT * 5,
    ); // Position in bottom left corner
    this.ctx.globalAlpha = 1;
  }

  // Add new method to load level high score
  loadLevelHighScore() {
    const saved = localStorage.getItem(STORAGE_KEY + "_level");
    return saved ? parseInt(saved, 0) : 0;
  }

  // Add new method to save level high score
  saveLevelHighScore() {
    localStorage.setItem(
      STORAGE_KEY + "_level",
      this.levelHighScore.toString(),
    );
  }

  // Move initialization code to separate method
  initializeGameProperties() {
    // Create buttons
    this.startButton = new Button(TEXTS.START_GAME);
    this.retryButton = new Button(TEXTS.TRY_AGAIN);

    // Initialize currency and defense options
    this.currency = INITIAL_CURRENCY;
    this.defenseOptions = this.createDefenseOptions();
    this.selectedDefense = null;

    // Initialize the defense grid
    this.defenseGrid = this.createDefenseGrid();

    this.levelManager = new LevelManager();

    // Add new buttons
    this.nextLevelButton = new Button(TEXTS.NEXT_LEVEL);

    // Add new continue button
    this.continueButton = new Button(TEXTS.CONTINUE);

    // Add lives property
    this.lives = INITIAL_LIVES;

    // Add high score properties
    this.currentScore = 0;
    this.highScore = this.loadHighScore();

    // Add level high score property
    this.levelHighScore = this.loadLevelHighScore();

    this.setupEventListeners();
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  game = new Game();
});
