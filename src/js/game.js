
import Map from './map.js';
import Camera from './camera.js';
import SpriteManager from './spriteManager.js';
import UI from './ui.js';
import ResourceManager from './resourceManager.js';
import ResourcePile from './resourcePile.js';
import Settler from './settler.js';
import TaskManager from './taskManager.js';
import Building from './building.js';
import CraftingStation from './craftingStation.js';
import Task from './task.js';

export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(50, 30, 32);
        this.camera = new Camera(ctx);
        this.spriteManager = new SpriteManager();
        this.ui = new UI(ctx);
        this.ui.setGameInstance(this);
        this.resourceManager = new ResourceManager();
        this.taskManager = new TaskManager();
        this.settlers = [];
        this.keys = {};
        this.gameTime = 0;
        this.gameSpeed = 1; // Default game speed
        this.buildMode = false; // New property for build mode
        this.selectedBuilding = null; // New property to hold the selected building type

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
        this.settlers.push(new Settler("Alice", 5, 5, this.resourceManager));

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

        this.gameTime += (deltaTime / 1000) * this.gameSpeed; // Update game time in seconds
        
        // Update settler needs
        this.settlers.forEach(settler => {
            settler.updateNeeds(deltaTime * this.gameSpeed);
            if (settler.state === "idle" && !settler.currentTask) {
                const task = this.taskManager.getTask();
                if (task) {
                    settler.currentTask = task;
                    console.log(`${settler.name} picked up task: ${task.type}`);
                }
            }
            
        });

        let resourceString = "";
        for (const type in this.resourceManager.getAllResources()) {
            const resource = this.resourceManager.getAllResources()[type];
            resourceString += `${type}: ${Math.floor(resource.quantity)} (Q:${resource.quality.toFixed(2)}), `;
        }
        this.ui.update(this.gameTime, resourceString.slice(0, -2), this.settlers[0].hunger, this.settlers[0].sleep, this.settlers[0].mood); // Remove trailing comma and space
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.camera.applyTransform();
        this.map.render(this.ctx);

        const placeholderSprite = this.spriteManager.getSprite('placeholder');
        if (placeholderSprite) {
            this.ctx.drawImage(placeholderSprite, 0, 0, 32, 32);
        }

        // Render settlers
        this.settlers.forEach(settler => {
            settler.render(this.ctx);
        });

        this.camera.resetTransform();
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    toggleBuildMode(buildingType) {
        if (this.selectedBuilding === buildingType) {
            this.buildMode = false;
            this.selectedBuilding = null;
        } else {
            this.buildMode = true;
            this.selectedBuilding = buildingType;
        }
        console.log(`Build mode: ${this.buildMode}, Selected: ${this.selectedBuilding}`);
    }

    handleKeyDown(event) {
        this.keys[event.key] = true;
    }

    handleKeyUp(event) {
        this.keys[event.key] = false;
    }

    handleClick(event) {
        // Check if the click originated from a UI element
        if (event.target.closest('#ui-container') || event.target.closest('#build-menu')) {
            return; // Do not process clicks that originate from UI elements
        }

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Convert mouse coordinates to world coordinates
        const worldX = (mouseX - this.ctx.canvas.width / 2) / this.camera.zoom + this.camera.x;
        const worldY = (mouseY - this.ctx.canvas.height / 2) / this.camera.zoom + this.camera.y;

        // Convert world coordinates to tile coordinates
        const tileX = Math.floor(worldX / this.map.tileSize);
        const tileY = Math.floor(worldY / this.map.tileSize);

        const clickedTile = this.map.getTile(tileX, tileY);

        if (this.buildMode && this.selectedBuilding) {
            // Place the selected building
            let newBuilding;
            if (this.selectedBuilding === 'crafting_station') {
                newBuilding = new CraftingStation(tileX, tileY);
            } else {
                newBuilding = new Building(this.selectedBuilding, tileX, tileY, 1, 1, "wood", 0); // Start with 0 health
            }
            this.map.addBuilding(newBuilding);
            this.taskManager.addTask(new Task("build", tileX, tileY, null, 100, 3, newBuilding)); // Build task with 100 quantity (workload)
            this.buildMode = false; // Exit build mode after placing
            this.selectedBuilding = null;
        } else {
            // Check if a building was clicked
            const clickedBuilding = this.map.getBuildingAt(tileX, tileY);
            if (clickedBuilding) {
                if (clickedBuilding.type === 'crafting_station') {
                    // For now, hardcode a crafting task for testing
                    const craftingStation = clickedBuilding;
                    if (craftingStation.recipes && craftingStation.recipes.length > 0) {
                        const recipe = craftingStation.recipes[0]; // Get the first recipe
                        if (recipe) {
                            this.taskManager.addTask(new Task("craft", tileX, tileY, null, 0, 3, craftingStation, recipe));
                            console.log(`Crafting task for ${recipe.name} added at ${tileX},${tileY}`);
                        }
                    } else {
                        console.warn("Crafting station has no recipes defined.");
                    }
                } else if (typeof clickedBuilding.takeDamage === 'function') {
                    clickedBuilding.takeDamage(25); // Example: 25 damage per click
                    if (clickedBuilding.health <= 0) {
                        this.map.removeBuilding(clickedBuilding);
                        console.log(`Building at ${tileX},${tileY} destroyed.`);
                    }
                } else {
                    console.warn("Clicked object is not a valid Building instance or missing takeDamage method:", clickedBuilding);
                }
            } else if (clickedTile === 2) { // If a tree is clicked
                this.resourceManager.addResource("wood", 10);
                this.map.removeTree(tileX, tileY);
            } else {
                // Place a wood pile at the clicked tile
                this.map.addResourcePile(new ResourcePile("wood", 10, tileX, tileY, this.map.tileSize));
            }
        }
    }
}
