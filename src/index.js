// Game constants
const GAME_WIDTH = 360;  // Base width, will be scaled
const GAME_HEIGHT = 640; // 16:9 ratio
const LANES = 6;
const PADDING_TOP = 80;    // More space for score/level
const PADDING_BOTTOM = 100; // More space for controls/UI
const PADDING_LEFT = 40;
const PADDING_RIGHT = 40;

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

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw game background
        this.drawBackground();

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
        // Update test meteor
        this.testMeteor.update(deltaTime);
    }

    draw() {
        // Draw test meteor
        this.testMeteor.draw(this.ctx, this.laneWidth, PADDING_LEFT);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
