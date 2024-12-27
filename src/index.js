// Game constants
const GAME_WIDTH = 360;  // Base width, will be scaled
const GAME_HEIGHT = 640; // 16:9 ratio
const LANES = 6;
const PADDING_TOP = 80;    // More space for score/level
const PADDING_BOTTOM = 100; // More space for controls/UI
const PADDING_LEFT = 40;
const PADDING_RIGHT = 40;

// Add to game constants
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    GAME_OVER: 'gameover'
};

// Add to game constants
const DEFENSE_TYPES = [
    { id: 0, name: 'Basic', color: '#4CAF50', cost: 100, damage: 10 },
    { id: 1, name: 'Medium', color: '#2196F3', cost: 200, damage: 20 },
    { id: 2, name: 'Strong', color: '#9C27B0', cost: 300, damage: 30 }
];

// Add to game constants
const DEBUG = true;  // Toggle for development visualization

// Calculate defense grid
const SPOT_SIZE = GAME_WIDTH / LANES;  // Each spot is as wide as a lane
const GRID_ROWS = Math.floor((GAME_HEIGHT - PADDING_TOP - PADDING_BOTTOM) / SPOT_SIZE);

// Test meteor
class Meteor {
    constructor(lane) {
        this.lane = lane;
        this.y = PADDING_TOP; // Start at top of play area
        this.speed = 0.1; // pixels per millisecond
    }

    update(deltaTime) {
        this.y += this.speed * deltaTime;
    }

    draw(ctx, laneWidth, laneStartX) {
        const x = laneStartX + (this.lane * laneWidth) + (laneWidth / 2);
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add to existing constants
class Button {
    constructor(x, y, width, height, text, backgroundColor = '#444', textColor = 'white', fontSize = 16) {
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
        return clickX >= this.x && clickX <= this.x + this.width &&
               clickY >= this.y && clickY <= this.y + this.height;
    }

    draw(ctx) {
        // Draw button background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw button text
        ctx.fillStyle = this.textColor;
        ctx.font = `${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            this.text, 
            this.x + this.width / 2, 
            this.y + this.height / 2
        );
    }
}

class DefenseOption {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
    }

    draw(ctx) {
        // Draw defense square
        ctx.fillStyle = this.type.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw cost
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`$${this.type.cost}`, this.x + this.width/2, this.y + this.height + 15);
    }

    isClicked(clickX, clickY) {
        return clickX >= this.x && clickX <= this.x + this.width &&
               clickY >= this.y && clickY <= this.y + this.height;
    }
}

class DefenseSpot {
    constructor(x, y, row, lane) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.lane = lane;
        this.defense = null; // Will store the placed defense
    }

    isEmpty() {
        return this.defense === null;
    }

    placeDefense(defenseType) {
        if (this.isEmpty()) {
            this.defense = {
                type: defenseType,
                health: 100,
                // Add more properties as needed
            };
            return true;
        }
        return false;
    }

    removeDefense() {
        this.defense = null;
    }

    draw(ctx) {
        if (DEBUG) {
            // Draw spot outline
            ctx.strokeStyle = this.isEmpty() ? '#666' : '#888';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                this.x - SPOT_SIZE/2,
                this.y - SPOT_SIZE/2,
                SPOT_SIZE,
                SPOT_SIZE
            );
            
            // Draw coordinates for debugging
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${this.lane},${this.row}`,
                this.x,
                this.y
            );
        }

        // If there's a defense placed here, draw it
        if (!this.isEmpty()) {
            ctx.fillStyle = this.defense.type.color;
            ctx.fillRect(
                this.x - SPOT_SIZE/2,
                this.y - SPOT_SIZE/2,
                SPOT_SIZE,
                SPOT_SIZE
            );
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.meteors = [];
        
        // Initialize game dimensions and scaling
        this.initializeCanvas();
        window.addEventListener('resize', () => this.initializeCanvas());
        
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
        
        this.startButton = new Button(buttonX, buttonY, buttonWidth, buttonHeight, 'Start Game');
        this.retryButton = new Button(buttonX, buttonY, buttonWidth, buttonHeight, 'Try Again');
        this.gameOverText = new Button(
            GAME_WIDTH / 2 - 100, 
            GAME_HEIGHT / 2 - 100, 
            200, 
            50, 
            'Game Over!', 
            'transparent', 
            'red', 
            24
        );
        
        // Initialize currency and defense options
        this.currency = 500;
        this.defenseOptions = this.createDefenseOptions();
        this.selectedDefense = null;
        
        // Initialize the defense grid
        this.defenseGrid = this.createDefenseGrid();
    }

    initializeCanvas() {
        // Calculate scaling to fit viewport while maintaining aspect ratio
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scale = Math.min(
            viewportWidth / GAME_WIDTH,
            viewportHeight / GAME_HEIGHT
        );

        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        // Scale canvas using CSS
        this.canvas.style.width = `${GAME_WIDTH * scale}px`;
        this.canvas.style.height = `${GAME_HEIGHT * scale}px`;

        // Calculate game area dimensions
        this.gameAreaWidth = GAME_WIDTH - (PADDING_LEFT + PADDING_RIGHT);
        this.gameAreaHeight = GAME_HEIGHT - (PADDING_TOP + PADDING_BOTTOM);
        this.laneWidth = this.gameAreaWidth / LANES;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
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
            } else if (this.gameState === GAME_STATES.PLAYING) {
                // Check if defense option was clicked
                this.defenseOptions.forEach(option => {
                    if (option.isClicked(x, y)) {
                        if (this.currency >= option.type.cost) {
                            this.selectedDefense = option.type;
                            console.log(`Selected ${option.type.name} defense`);
                        } else {
                            console.log('Not enough currency!');
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
                            this.selectedDefense = null;
                        }
                    }
                }
            }
        });
    }

    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.testMeteor = new Meteor(2);
        this.currency = 500; // Reset currency
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
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(
            PADDING_LEFT, 
            PADDING_TOP, 
            this.gameAreaWidth, 
            this.gameAreaHeight
        );

        // Draw lanes
        for (let i = 0; i <= LANES; i++) {
            const x = PADDING_LEFT + (i * this.laneWidth);
            this.ctx.beginPath();
            this.ctx.moveTo(x, PADDING_TOP);
            this.ctx.lineTo(x, GAME_HEIGHT - PADDING_BOTTOM);
            this.ctx.stroke();
        }

        // Draw padding areas (for visualization)
        this.ctx.fillStyle = '#222';
        // Top padding
        this.ctx.fillRect(0, 0, GAME_WIDTH, PADDING_TOP);
        // Bottom padding
        this.ctx.fillRect(0, GAME_HEIGHT - PADDING_BOTTOM, GAME_WIDTH, PADDING_BOTTOM);
        // Left padding
        this.ctx.fillRect(0, PADDING_TOP, PADDING_LEFT, this.gameAreaHeight);
        // Right padding
        this.ctx.fillRect(GAME_WIDTH - PADDING_RIGHT, PADDING_TOP, PADDING_RIGHT, this.gameAreaHeight);

        // Draw defense grid
        for (let row = 0; row < this.defenseGrid.length; row++) {
            for (let lane = 0; lane < this.defenseGrid[row].length; lane++) {
                this.defenseGrid[row][lane].draw(this.ctx);
            }
        }
    }

    update(deltaTime) {
        if (this.gameState !== GAME_STATES.PLAYING) return;

        this.testMeteor.update(deltaTime);

        // Check for game over
        if (this.testMeteor.y >= GAME_HEIGHT - PADDING_BOTTOM) {
            this.gameState = GAME_STATES.GAME_OVER;
        }
    }

    drawCurrency() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Currency: $${this.currency}`, PADDING_LEFT, PADDING_TOP/2);
    }

    draw() {
        // Draw background first
        this.drawBackground();

        if (this.gameState === GAME_STATES.MENU) {
            this.startButton.draw(this.ctx);
        } else if (this.gameState === GAME_STATES.PLAYING) {
            // Draw currency
            this.drawCurrency();
            
            // Draw defense options
            this.defenseOptions.forEach(option => option.draw(this.ctx));
            
            // Draw meteor
            this.testMeteor.draw(this.ctx, this.laneWidth, PADDING_LEFT);
            
            // Highlight selected defense if any
            if (this.selectedDefense) {
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 2;
                const option = this.defenseOptions[this.selectedDefense.id];
                this.ctx.strokeRect(option.x, option.y, option.width, option.height);
            }
        } else if (this.gameState === GAME_STATES.GAME_OVER) {
            this.gameOverText.draw(this.ctx);
            this.retryButton.draw(this.ctx);
        }
    }

    createDefenseOptions() {
        return DEFENSE_TYPES.map((type, index) => {
            const y = PADDING_TOP + 50 + (index * 80); // Space them vertically
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
                const x = PADDING_LEFT + (lane * SPOT_SIZE) + (SPOT_SIZE / 2);
                const y = GAME_HEIGHT - PADDING_BOTTOM - (row * SPOT_SIZE) - (SPOT_SIZE / 2);
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
                if (x >= spot.x - SPOT_SIZE/2 && x <= spot.x + SPOT_SIZE/2 &&
                    y >= spot.y - SPOT_SIZE/2 && y <= spot.y + SPOT_SIZE/2) {
                    return spot;
                }
            }
        }
        return null;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
