// Game constants
const GAME_WIDTH = 360;  // Base width, will be scaled
const GAME_HEIGHT = 640; // 16:9 ratio
const LANES = 6;
const PADDING = 40; // Padding for UI elements

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

        // Calculate lane properties
        this.laneWidth = (GAME_WIDTH - (PADDING * 2)) / LANES;
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
        // Draw lanes for visualization
        this.ctx.strokeStyle = '#333';
        for (let i = 0; i <= LANES; i++) {
            const x = PADDING + (i * this.laneWidth);
            this.ctx.beginPath();
            this.ctx.moveTo(x, PADDING);
            this.ctx.lineTo(x, GAME_HEIGHT - PADDING);
            this.ctx.stroke();
        }
    }

    update(deltaTime) {
        // Update game logic here
    }

    draw() {
        // Draw game elements here
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
