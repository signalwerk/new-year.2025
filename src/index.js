// Game constants
const GAME_WIDTH = 360; // Base width, will be scaled
const GAME_HEIGHT = 640; // 16:9 ratio
const LANES = 6;
const PADDING_TOP = 80; // More space for score/level
const PADDING_BOTTOM = 100; // More space for controls/UI
const PADDING_LEFT = 80;
const PADDING_RIGHT = 40;

const INITIAL_CURRENCY = 500;

// Game area calculations
const GAME_AREA_WIDTH = GAME_WIDTH - (PADDING_LEFT + PADDING_RIGHT);
const GAME_AREA_HEIGHT = GAME_HEIGHT - (PADDING_TOP + PADDING_BOTTOM);
const LANE_WIDTH = GAME_AREA_WIDTH / LANES; // Width of each lane
const SPOT_SIZE = LANE_WIDTH; // Defense spots are same width as lanes
const METEOR_SIZE = LANE_WIDTH * 0.8; // Base size for meteors
const GRID_ROWS = Math.floor(GAME_AREA_HEIGHT / SPOT_SIZE);

// Add to game constants
const DEBUG = false; // Toggle for development visualization

const COLORS = {
  BACKGROUND: "#edf1e7",
  TEXT: "#000",
  DEFENSE_OPTION_TEXT: "#000",
  DEFENSE_OPTION_TEXT_INACTIVE: "#f00",
  BUTTON: "#444",
  BUTTON_TEXT: "#fff",
  PROGRESS_BAR: "#4CAF50",
  BORDER: "#333",
  DEBUG_LINE: "rgba(0,0,0,0.1)",
  DEBUG_TEXT: "#666",
  SELECTION: "rgba(255,80,80,0.7)",
};

// Replace the LEVELS constant with this generator
const LEVELS = generateLevels();

function generateLevels() {
  const levels = [];

  // Base multipliers for level-to-level scaling
  const levelSpawnMultiplier = 0.3;
  const levelCountMultiplier = 0.2;

  for (let i = 0; i < 10; i++) {
    const levelIndex = i + 1;
    const duration = 150000; // 2min 30sec in milliseconds

    // Level-wide difficulty multipliers
    const baseSpawnMultiplier = 1 + i * levelSpawnMultiplier;
    const baseCountMultiplier = 1 + i * levelCountMultiplier;

    // Meteor type availability
    const allowMedium = levelIndex >= 3;
    const allowLarge = levelIndex >= 5;

    const waves = [];
    let currentTime = 500;

    // Track progress through level for intra-level scaling
    while (currentTime < duration) {
      // Calculate progress through level (0 to 1)
      const levelProgress = currentTime / duration;
      
      // Increase difficulty within level (x% harder by end of level)
      const intraLevelMultiplier = 1 + (levelProgress * 0.4);
      
      // Combined multipliers for this wave
      const spawnMultiplier = baseSpawnMultiplier * intraLevelMultiplier;
      const countMultiplier = baseCountMultiplier * intraLevelMultiplier;

      // Adjusted meteor type probabilities based on level progress
      let meteorType;
      if (allowLarge && Math.random() < (0.15 + levelProgress * 0.1)) {
        meteorType = 2; // Large meteor (15-25% chance if allowed)
      } else if (allowMedium && Math.random() < (0.25 + levelProgress * 0.15)) {
        meteorType = 1; // Medium meteor (25-40% chance if allowed)
      } else {
        meteorType = 0; // Small meteor (default)
      }

      // Base counts and spacing
      const baseCount = meteorType === 2 ? 1 : meteorType === 1 ? 2 : 3;
      const count = Math.ceil(baseCount * countMultiplier);
      const spacing = meteorType === 2 ? 2500 : meteorType === 1 ? 1500 : 1000;

      waves.push({
        type: meteorType,
        count: count,
        startTime: currentTime,
        spacing: spacing / spawnMultiplier,
      });

      // Wave timing
      const waveLength = (count * spacing) / spawnMultiplier;
      const breakTime = Math.max(2000 - levelProgress * 1000, 500); // Breaks get shorter
      currentTime += waveLength + breakTime;
    }

    levels.push({
      name: `Level ${levelIndex}`,
      duration: duration,
      waves: waves,
    });
  }

  return levels;
}

const GAME_STATES = {
  LOADING: "loading",
  MENU: "menu",
  PLAYING: "playing",
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
    cost: 200,
    damage: 20,
    health: 100,
  },
  {
    id: 2,
    name: "Strong",
    color: "#9C27B0",
    cost: 300,
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
    speed: 0.05,
    damageRate: 30,
    rotateRate: 0.0005,
    wiggleRate: 0.001,
    wiggleAmount: 7,
    sizeMultiplier: { x: 1.0, y: 1.0 },
    coinReward: 10, // 1 coin
  },
  {
    id: 1,
    name: "Medium",
    color: "#FF4444",
    health: 60,
    speed: 0.035,
    damageRate: 50,
    rotateRate: 0,
    wiggleRate: 0.03,
    wiggleAmount: 0.03,
    sizeMultiplier: { x: 1, y: 2 },
    coinReward: 20, // 2 coins
  },
  {
    id: 2,
    name: "Large",
    color: "#FF0000",
    health: 90,
    speed: 0.05,
    damageRate: 50,
    rotateRate: 0,
    wiggleRate: 0.03,
    wiggleAmount: 0.03,
    sizeMultiplier: { x: 1, y: 2 },
    coinReward: 30, // 3 coins
  },
];

// Font definitions
const FONT = {
  SMALL: {
    size: "12px",
    family: "Arial",
    get full() {
      return `${this.size} ${this.family}`;
    },
  },
  LARGE: {
    size: "14px",
    family: "Arial",
    get full() {
      return `${this.size} ${this.family}`;
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
};

// Add new AssetLoader class
class AssetLoader {
  constructor() {
    this.images = new Map();
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }

  async loadAll() {
    const meteorPromises = ASSETS.METEORS.map((path, index) =>
      this.loadImage(`meteor-${index}`, path),
    );

    try {
      await Promise.all(meteorPromises);
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
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
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
    x,
    y,
    width,
    height,
    text,
    backgroundColor = COLORS.BUTTON,
    textColor = COLORS.BUTTON_TEXT,
    fontSize = 16,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
  }
}

class Projectile {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.speed = 0.3;
    this.damage = damage;
    this.size = 4;
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
    return distance < this.size + 10; // 10 is meteor radius
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
    ctx.strokeStyle = this.isEmpty() ? COLORS.DEBUG_LINE : "#888";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - size / 2, y - size / 2, size, size);

    if (!this.isEmpty()) {
      // Draw defense with health-based opacity
      ctx.fillStyle = this.type.color;
      if (isInactive) {
        ctx.globalAlpha = 0.5;
      } else {
        ctx.globalAlpha = Math.max(0.3, this.health / this.maxHealth);
      }
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1.0;

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
        ctx.lineWidth = 4;
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
    ctx.font = FONT.LARGE.full;
    ctx.textAlign = "center";
    ctx.fillText(
      `$${this.type.cost}`,
      this.x + SPOT_SIZE / 2,
      this.y + SPOT_SIZE + 15,
    );
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
    this.hitRadius = 30; // Bigger radius for hit detection

    // Size based on value
    this.size = 8 + ((value - 10) / 10) * 2; // Increases by 2 pixels for each 10 value

    // Base movement
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Wave motion parameters
    this.waveAmplitude = 2.2 + Math.random() * 0.2;
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
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw value
    ctx.fillStyle = "black";
    ctx.font = `bold ${Math.max(10, this.size)}px ${FONT.SMALL.family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${this.value}`, coinX, coinY);
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
    this.waveStates = new Map();
    this.allWavesComplete = false;
  }

  startLevel(levelIndex) {
    this.currentLevel = levelIndex;
    this.levelStartTime = performance.now();
    this.waveStates = new Map();
    this.allWavesComplete = false;

    // Initialize wave states
    LEVELS[levelIndex].waves.forEach((wave, index) => {
      this.waveStates.set(index, {
        meteorsSpawned: 0,
        nextSpawnTime: wave.startTime,
      });
    });
  }

  update(currentTime, meteors) {
    if (this.currentLevel >= LEVELS.length) return false;

    const level = LEVELS[this.currentLevel];
    const levelTime = currentTime - this.levelStartTime;

    // Check if level time is exceeded
    if (levelTime >= level.duration) {
      this.allWavesComplete = true;
      return false;
    }

    // Update each wave
    level.waves.forEach((wave, waveIndex) => {
      const state = this.waveStates.get(waveIndex);

      if (
        levelTime >= state.nextSpawnTime &&
        state.meteorsSpawned < wave.count
      ) {
        meteors.push(
          new Meteor(
            Math.floor(Math.random() * LANES),
            METEOR_TYPES[wave.type],
          ),
        );

        state.meteorsSpawned++;
        state.nextSpawnTime = levelTime + wave.spacing;
      }
    });

    return true;
  }

  isLevelComplete(meteors) {
    return this.allWavesComplete && meteors.length === 0;
  }

  getLevelProgress() {
    const levelTime = performance.now() - this.levelStartTime;
    const duration = LEVELS[this.currentLevel].duration;
    return Math.min(levelTime / duration, 1);
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

    // Load assets before starting the game
    this.loadAssets();

    // Start game loop
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));

    // Add test meteor in middle lane
    this.testMeteor = new Meteor(2); // Lane 3 (0-based index)

    // Add game state and button handling
    this.gameState = GAME_STATES.MENU;
    this.setupEventListeners();

    // Create buttons
    const buttonWidth = 100;
    const buttonHeight = 50;
    const buttonX = GAME_WIDTH / 2 - buttonWidth / 2;
    const buttonY = GAME_HEIGHT / 2 - buttonHeight / 2;

    this.startButton = new Button(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      "Start Game",
    );
    this.retryButton = new Button(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      "Try Again",
    );
    this.gameOverText = new Button(
      GAME_WIDTH / 2 - 100,
      GAME_HEIGHT / 2 - 100,
      200,
      50,
      "Game Over!",
      "transparent",
      "red",
      24,
    );

    // Initialize currency and defense options
    this.currency = INITIAL_CURRENCY;
    this.defenseOptions = this.createDefenseOptions();
    this.selectedDefense = null;

    // Initialize the defense grid
    this.defenseGrid = this.createDefenseGrid();

    this.levelManager = new LevelManager();

    // Add new buttons
    this.nextLevelButton = new Button(
      GAME_WIDTH / 2 - 60,
      GAME_HEIGHT / 2 + 50,
      120,
      40,
      "Next Level",
    );

    this.levelCompleteText = new Button(
      GAME_WIDTH / 2 - 100,
      GAME_HEIGHT / 2 - 50,
      200,
      50,
      "Level Complete!",
      "transparent",
      "#4CAF50",
      24,
    );

    this.gameCompleteText = new Button(
      GAME_WIDTH / 2 - 100,
      GAME_HEIGHT / 2 - 50,
      200,
      50,
      "Game Complete!",
      "transparent",
      "#4CAF50",
      24,
    );
  }

  initializeCanvas() {
    // Calculate scaling to fit viewport while maintaining aspect ratio
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scale = Math.min(
      viewportWidth / GAME_WIDTH,
      viewportHeight / GAME_HEIGHT,
    );

    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;

    // Scale canvas using CSS
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
            // Add coin value to currency
            this.currency += coin.value;
            // Remove coin
            this.coins.splice(i, 1);
            coinCollected = true;
            break; // Only collect one coin per click
          }
        }

        // Only check defense interactions if we didn't collect a coin
        if (!coinCollected) {
          // Check if defense option was clicked
          this.defenseOptions.forEach((option) => {
            if (option.isClicked(x, y)) {
              if (this.currency >= option.type.cost) {
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
      }
    });
  }

  startGame() {
    this.gameState = GAME_STATES.PLAYING;
    this.meteors = [];
    this.coins = [];
    this.currency = INITIAL_CURRENCY;
    this.selectedDefense = null;
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
    // Fill entire canvas with background color first
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw game area border
    this.ctx.strokeStyle = COLORS.BORDER;
    this.ctx.strokeRect(
      PADDING_LEFT,
      PADDING_TOP,
      this.gameAreaWidth,
      this.gameAreaHeight,
    );

    // Draw lanes
    for (let i = 0; i <= LANES; i++) {
      const x = PADDING_LEFT + i * this.laneWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, PADDING_TOP);
      this.ctx.lineTo(x, GAME_HEIGHT - PADDING_BOTTOM);
      this.ctx.stroke();
    }

    // Draw padding areas (slightly darker shade for visual separation)
    this.ctx.fillStyle = COLORS.BACKGROUND;
    // Top padding
    this.ctx.fillRect(0, 0, GAME_WIDTH, PADDING_TOP);
    // Bottom padding
    this.ctx.fillRect(
      0,
      GAME_HEIGHT - PADDING_BOTTOM,
      GAME_WIDTH,
      PADDING_BOTTOM,
    );
    // Left padding
    this.ctx.fillRect(0, PADDING_TOP, PADDING_LEFT, this.gameAreaHeight);
    // Right padding
    this.ctx.fillRect(
      GAME_WIDTH - PADDING_RIGHT,
      PADDING_TOP,
      PADDING_RIGHT,
      this.gameAreaHeight,
    );

    // Draw defense grid
    for (let row = 0; row < this.defenseGrid.length; row++) {
      for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
        this.defenseGrid[row][lane].draw(this.ctx);
      }
    }
  }

  update(deltaTime) {
    if (this.gameState !== GAME_STATES.PLAYING) return;

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

    // Update meteors and check for game over
    this.meteors = this.meteors.filter((meteor) => {
      meteor.update(deltaTime);
      if (meteor.y >= GAME_HEIGHT - PADDING_BOTTOM) {
        this.gameState = GAME_STATES.GAME_OVER;
        return false;
      }
      return true;
    });

    // Update coins
    this.coins = this.coins.filter((coin) => coin.update(currentTime));

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
  }

  drawCurrency() {
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = FONT.LARGE.full;
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `Currency: $${this.currency}`,
      PADDING_LEFT / 3,
      (PADDING_TOP / 4) * 3,
    );
  }

  draw() {
    this.drawBackground();

    if (this.gameState === GAME_STATES.LOADING) {
      this.drawLoadingScreen();
    } else if (this.gameState === GAME_STATES.MENU) {
      this.startButton.draw(this.ctx);
    } else if (this.gameState === GAME_STATES.PLAYING) {
      // Draw currency
      this.drawCurrency();

      // Draw progress bar
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
    } else if (this.gameState === GAME_STATES.LEVEL_COMPLETE) {
      this.levelCompleteText.draw(this.ctx);
      this.nextLevelButton.draw(this.ctx);
    } else if (this.gameState === GAME_STATES.GAME_COMPLETE) {
      this.gameCompleteText.draw(this.ctx);
    } else if (this.gameState === GAME_STATES.GAME_OVER) {
      this.gameOverText.draw(this.ctx);
      this.retryButton.draw(this.ctx);
    }
  }

  createDefenseOptions() {
    const optionsAreaY = GAME_HEIGHT - PADDING_BOTTOM + 20; // Position below game grid
    const spacing = 20; // Space between options
    const totalWidth = (SPOT_SIZE + spacing) * DEFENSE_TYPES.length - spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2; // Center the options horizontally

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
    const barWidth = GAME_WIDTH - 100; // Leave some padding
    const barHeight = 20;
    const x = 50; // Padding from left
    const y = 20; // Padding from top

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, y, barWidth, barHeight);

    // Progress (inverted to show remaining time)
    const progress = 1 - this.levelManager.getLevelProgress();
    ctx.fillStyle = COLORS.PROGRESS_BAR;
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Border
    ctx.strokeStyle = COLORS.BORDER;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Level text
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = FONT.LARGE.full;
    ctx.textAlign = "center";
    ctx.fillText(
      `${LEVELS[this.levelManager.currentLevel].name}`,
      GAME_WIDTH / 2,
      y + barHeight + 16,
    );

    // Time remaining
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

  async loadAssets() {
    const success = await this.assetLoader.loadAll();
    if (success) {
      this.gameState = GAME_STATES.MENU;
    } else {
      console.error("Failed to load assets");
      // You might want to show an error message to the user
    }
  }

  drawLoadingScreen() {
    const progress = this.assetLoader.getLoadingProgress();

    // Draw loading bar
    const barWidth = 200;
    const barHeight = 20;
    const x = (GAME_WIDTH - barWidth) / 2;
    const y = GAME_HEIGHT / 2;

    // Background
    this.ctx.fillStyle = COLORS.BUTTON;
    this.ctx.fillRect(x, y, barWidth, barHeight);

    // Progress
    this.ctx.fillStyle = "#4CAF50";
    this.ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Border
    this.ctx.strokeStyle = COLORS.TEXT;
    this.ctx.strokeRect(x, y, barWidth, barHeight);

    // Loading text
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = FONT.LARGE.full;
    this.ctx.textAlign = "center";
    this.ctx.fillText("Loading...", GAME_WIDTH / 2, y - 20);
    this.ctx.fillText(`${Math.floor(progress * 100)}%`, GAME_WIDTH / 2, y + 40);
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  game = new Game();
});
