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
            }
        });
    }

    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.testMeteor = new Meteor(2);
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
    }

    update(deltaTime) {
        if (this.gameState !== GAME_STATES.PLAYING) return;

        this.testMeteor.update(deltaTime);

        // Check for game over
        if (this.testMeteor.y >= GAME_HEIGHT - PADDING_BOTTOM) {
            this.gameState = GAME_STATES.GAME_OVER;
        }
    }

    draw() {
        // Draw background first
        this.drawBackground();

        if (this.gameState === GAME_STATES.MENU) {
            this.startButton.draw(this.ctx);
        } else if (this.gameState === GAME_STATES.PLAYING) {
            this.testMeteor.draw(this.ctx, this.laneWidth, PADDING_LEFT);
        } else if (this.gameState === GAME_STATES.GAME_OVER) {
            this.gameOverText.draw(this.ctx);
            this.retryButton.draw(this.ctx);
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
