
import Map from './map.js';
import Camera from './camera.js';
import SpriteManager from './spriteManager.js';
import UI from './ui.js';

export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(50, 30, 32);
        this.camera = new Camera(ctx);
        this.spriteManager = new SpriteManager();
        this.ui = new UI();
        this.keys = {};
        this.gameTime = 0;

        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    async start() {
        try {
            await this.spriteManager.loadImage('placeholder', 'src/assets/placeholder.png');
        } catch (error) {
            console.error("Failed to load sprite:", error);
        }
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        this.gameLoop(0);
    }

    update(deltaTime) {
        const panSpeed = 200; // pixels per second
        if (this.keys['a'] || this.keys['q']) {
            this.camera.x -= panSpeed * (deltaTime / 1000);
        }
        if (this.keys['d']) {
            this.camera.x += panSpeed * (deltaTime / 1000);
        }
        if (this.keys['w'] || this.keys['z']) {
            this.camera.y -= panSpeed * (deltaTime / 1000);
        }
        if (this.keys['s']) {
            this.camera.y += panSpeed * (deltaTime / 1000);
        }

        this.gameTime += deltaTime / 1000; // Update game time in seconds
        this.ui.update(this.gameTime, "Wood: 100, Stone: 50"); // Placeholder resources
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.camera.applyTransform();
        this.map.render(this.ctx);

        const placeholderSprite = this.spriteManager.getSprite('placeholder');
        if (placeholderSprite) {
            this.ctx.drawImage(placeholderSprite, 0, 0, 32, 32);
        }

        this.camera.resetTransform();
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    handleKeyDown(event) {
        this.keys[event.key] = true;
    }

    handleKeyUp(event) {
        this.keys[event.key] = false;
    }
}
