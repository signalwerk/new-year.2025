// Game constants
const GAME_WIDTH = 360; // Base width, will be scaled
const GAME_HEIGHT = 640; // 16:9 ratio
const LANES = 6;
const PADDING_TOP = 80; // More space for score/level
const PADDING_BOTTOM = 100; // More space for controls/UI
const PADDING_LEFT = 80;
const PADDING_RIGHT = 40;

// Game area calculations
const GAME_AREA_WIDTH = GAME_WIDTH - (PADDING_LEFT + PADDING_RIGHT);
const GAME_AREA_HEIGHT = GAME_HEIGHT - (PADDING_TOP + PADDING_BOTTOM);
const LANE_WIDTH = GAME_AREA_WIDTH / LANES; // Width of each lane
const SPOT_SIZE = LANE_WIDTH; // Defense spots are same width as lanes
const GRID_ROWS = Math.floor(GAME_AREA_HEIGHT / SPOT_SIZE);

// Add to game constants
const DEBUG = true; // Toggle for development visualization

// Add to game constants
const LEVELS = [
  {
    name: "Level 1",
    duration: 30000, // 30 seconds
    waves: [
      { type: 0, count: 3, startTime: 1000, spacing: 1000 }, // 3 small meteors at 1s
      { type: 0, count: 5, startTime: 8000, spacing: 800 }, // 5 small meteors at 8s
      { type: 1, count: 2, startTime: 15000, spacing: 2000 }, // 2 medium meteors at 15s
      { type: 0, count: 4, startTime: 20000, spacing: 500 }, // 4 small meteors at 20s
      { type: 1, count: 3, startTime: 25000, spacing: 1500 }, // 3 medium meteors at 25s
    ],
  },
  {
    name: "Level 2",
    duration: 45000, // 45 seconds
    waves: [
      { type: 1, count: 3, startTime: 2000, spacing: 1200 }, // 3 medium meteors at 2s
      { type: 0, count: 6, startTime: 10000, spacing: 400 }, // 6 small meteors at 10s
      { type: 2, count: 1, startTime: 18000, spacing: 0 }, // 1 large meteor at 18s
      { type: 1, count: 4, startTime: 25000, spacing: 1000 }, // 4 medium meteors at 25s
      { type: 2, count: 2, startTime: 35000, spacing: 2000 }, // 2 large meteors at 35s
      { type: 0, count: 8, startTime: 40000, spacing: 300 }, // 8 small meteors at 40s
    ],
  },
];

const GAME_STATES = {
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
    health: 150,
  },
  {
    id: 2,
    name: "Strong",
    color: "#9C27B0",
    cost: 300,
    damage: 30,
    health: 200,
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
    damageRate: 5,
  },
  {
    id: 1,
    name: "Medium",
    color: "#FF4444",
    health: 60,
    speed: 0.02,
    damageRate: 15,
  },
  {
    id: 2,
    name: "Large",
    color: "#FF0000",
    health: 90,
    speed: 0.08,
    damageRate: 30,
  },
];

// Test meteor
class Meteor {
  constructor(lane, type = METEOR_TYPES[0]) {
    // Default to weakest type
    this.lane = lane;
    this.type = type;
    this.y = PADDING_TOP;
    this.health = type.health;
    this.speed = type.speed;
    this.isBlocked = false; // New property to track if meteor is blocked by defense
    this.blockingDefense = null; // Reference to blocking defense
  }

  update(deltaTime) {
    if (!this.isBlocked) {
      this.y += this.speed * deltaTime;
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
    const x = PADDING_LEFT + this.lane * LANE_WIDTH + LANE_WIDTH / 2;
    ctx.fillStyle = this.type.color;
    ctx.beginPath();
    ctx.arc(x, this.y, 10, 0, Math.PI * 2);
    ctx.fill();

    if (DEBUG) {
      // Draw collision circle
      ctx.strokeStyle = "rgba(255,0,0,0.3)";
      ctx.beginPath();
      ctx.arc(x, this.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Draw health
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${this.health}`, x, this.y);
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
    backgroundColor = "#444",
    textColor = "white",
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
    ctx.font = `${this.fontSize}px Arial`;
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
    ctx.fillStyle = "yellow";
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
    this.health = type ? type.health : 0; // Initialize health from type
    this.maxHealth = type ? type.health : 0; // Store max health for percentage calculations
    this.projectiles = [];
    this.lastFireTime = 0;
    this.fireRate = 1000;
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
          }

          // Take damage from meteor using meteor's damage rate
          if (meteor.blockingDefense === this) {
            const destroyed = this.takeDamage(meteor.type.damageRate / 60); // Assuming 60 FPS
            if (destroyed) {
              meteor.unblock();
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
              // Spawn coin at meteor's position
              const meteorX =
                PADDING_LEFT + meteor.lane * LANE_WIDTH + LANE_WIDTH / 2;
              coins.push(new Coin(meteorX, meteor.y));
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
    if (DEBUG) {
      // Draw spot outline
      ctx.strokeStyle = this.isEmpty() ? "#666" : "#888";
      ctx.lineWidth = 1;
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    }

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
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          `${Math.floor((this.health / this.maxHealth) * 100)}%`,
          x,
          y,
        );
      }

      // Draw selection highlight
      if (isSelected) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
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
    ctx.fillStyle = isInactive ? "red" : "white";
    ctx.font = "12px Arial";
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
      ctx.fillStyle = "#666";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${this.lane},${this.row}`, this.x, this.y);
    }
  }

  update(currentTime, meteors, coins) {
    this.defense.update(currentTime, this.x, this.y, meteors, coins);
  }
}

// Add to game constants
const INITIAL_CURRENCY = 500;

class Coin {
  constructor(x, y, value = 10) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.lifetime = 5000; // 5 seconds lifetime
    this.createTime = performance.now();
    this.size = 8;
    this.hitRadius = 20; // Bigger radius for hit detection

    // Base movement
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Wave motion parameters
    this.waveAmplitude = 2 + Math.random() * 0.5; // Random wave size
    this.waveFrequency = 0.005 + Math.random() * 0.01; // Random wave frequency
    this.waveOffset = Math.random() * Math.PI * 2; // Random wave phase
    this.baseX = x; // Keep track of base position
    this.baseY = y;
    this.time = 0;
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

    // Slow down movement
    // this.vx *= 0.98;
    // this.vy *= 0.98;
    // this.waveAmplitude *= 0.99; // Gradually reduce wave size

    // Calculate remaining lifetime
    const age = currentTime - this.createTime;
    return age < this.lifetime;
  }

  draw(ctx, currentTime) {
    const age = currentTime - this.createTime;
    const remainingTime = this.lifetime - age;

    // Start blinking when less than 1.5 seconds remaining
    if (remainingTime < 1500) {
      // Blink faster as time runs out
      const blinkRate = 100 + (remainingTime / 1500) * 400;
      if (Math.floor(currentTime / blinkRate) % 2 === 0) {
        return; // Skip drawing to create blink effect
      }
    }

    if (DEBUG) {
      // Draw hit area
      ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"; // Semi-transparent gold
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.hitRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw coin
    ctx.fillStyle = "#FFD700"; // Gold color
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw value
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`$`, this.x, this.y);
  }

  isClicked(clickX, clickY) {
    const dx = clickX - this.x;
    const dy = clickY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.hitRadius; // Use bigger radius for hit detection
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

    // Initialize game dimensions and scaling
    this.initializeCanvas();
    window.addEventListener("resize", () => this.initializeCanvas());

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
    // Draw game area border
    this.ctx.strokeStyle = "#333";
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

    // Draw padding areas (for visualization)
    this.ctx.fillStyle = "#222";
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
    this.ctx.fillStyle = "white";
    this.ctx.font = "20px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(
      `Currency: $${this.currency}`,
      PADDING_LEFT,
      PADDING_TOP / 2,
    );
  }

  draw() {
    // Draw background first
    this.drawBackground();

    if (this.gameState === GAME_STATES.MENU) {
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
    return DEFENSE_TYPES.map((type, index) => {
      const y = PADDING_TOP + 50 + index * (SPOT_SIZE + 30); // Space them vertically with room for cost
      const x = 10; // Align to left side
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

    // Progress
    const progress = this.levelManager.getLevelProgress();
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    // Border
    ctx.strokeStyle = "white";
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Level text
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
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
      ctx.fillText(`${timeLeft}s`, GAME_WIDTH - 30, y + barHeight / 2 + 5);
    }
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  new Game();
});
