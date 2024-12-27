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
                // Check if click is on start button
                if (this.isClickOnButton(x, y)) {
                    this.startGame();
                }
            } else if (this.gameState === GAME_STATES.GAME_OVER) {
                // Check if click is on retry button
                if (this.isClickOnButton(x, y)) {
                    this.startGame();
                }
            }
        });
    }

    isClickOnButton(x, y) {
        const buttonX = GAME_WIDTH / 2 - 50;
        const buttonY = GAME_HEIGHT / 2 - 25;
        return x >= buttonX && x <= buttonX + 100 &&
               y >= buttonY && y <= buttonY + 50;
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
            this.drawButton('Start Game');
        } else if (this.gameState === GAME_STATES.PLAYING) {
            this.testMeteor.draw(this.ctx, this.laneWidth, PADDING_LEFT);
        } else if (this.gameState === GAME_STATES.GAME_OVER) {
            this.drawButton('Try Again');
            this.drawGameOver();
        }
    }

    drawButton(text) {
        const buttonWidth = 100;
        const buttonHeight = 50;
        const x = GAME_WIDTH / 2 - buttonWidth / 2;
        const y = GAME_HEIGHT / 2 - buttonHeight / 2;

        // Draw button background
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Draw button text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'red';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
