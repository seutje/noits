
import Map from './map.js';
import Camera from './camera.js';
import SpriteManager from './spriteManager.js';
import UI from './ui.js';
import ResourceManager from './resourceManager.js';
import ResourcePile from './resourcePile.js';
import Settler from './settler.js';

export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(50, 30, 32);
        this.camera = new Camera(ctx);
        this.spriteManager = new SpriteManager();
        this.ui = new UI(ctx);
        this.resourceManager = new ResourceManager();
        this.settlers = [];
        this.keys = {};
        this.gameTime = 0;

        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    async start() {
        try {
            await this.spriteManager.loadImage('placeholder', 'src/assets/placeholder.png');
        } catch (error) {
            console.error("Failed to load sprite:", error);
        }
        this.resourceManager.addResource("wood", 100);
        this.resourceManager.addResource("stone", 50);

        // Create a new settler
        this.settlers.push(new Settler("Alice", 5, 5));

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('click', this.handleClick);
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
        
        // Update settler needs
        this.settlers.forEach(settler => {
            settler.updateNeeds(deltaTime);
        });

        let resourceString = "";
        for (const type in this.resourceManager.getAllResources()) {
            resourceString += `${type}: ${this.resourceManager.getResourceQuantity(type)}, `;
        }
        this.ui.update(this.gameTime, resourceString.slice(0, -2), this.settlers[0].hunger, this.settlers[0].sleep); // Remove trailing comma and space
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

    handleClick(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Convert mouse coordinates to world coordinates
        const worldX = (mouseX - this.ctx.canvas.width / 2) / this.camera.zoom + this.camera.x;
        const worldY = (mouseY - this.ctx.canvas.height / 2) / this.camera.zoom + this.camera.y;

        // Convert world coordinates to tile coordinates
        const tileX = Math.floor(worldX / this.map.tileSize);
        const tileY = Math.floor(worldY / this.map.tileSize);

        const clickedTile = this.map.getTile(tileX, tileY);

        if (clickedTile === 2) { // If a tree is clicked
            this.resourceManager.addResource("wood", 10); // Add 10 wood
            this.map.removeTree(tileX, tileY); // Remove the tree
        } else {
            // Place a wood pile at the clicked tile
            this.map.addResourcePile(new ResourcePile("wood", 10, tileX, tileY, this.map.tileSize));
        }
    }
}
