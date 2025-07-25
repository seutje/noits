
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
import FarmPlot from './farmPlot.js';
import AnimalPen from './animalPen.js';
import RoomManager from './roomManager.js';
import Furniture from './furniture.js';

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
        this.roomManager = new RoomManager(this.map);
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
        this.settlers.push(new Settler("Alice", 5, 5, this.resourceManager, this.map));

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
        this.roomManager.render(this.ctx, this.map.tileSize);

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
            // Exit room designation mode if active
            this.roomDesignationStart = null;
            this.selectedRoomType = null;
        }
        console.log(`Build mode: ${this.buildMode}, Selected: ${this.selectedBuilding}`);
    }

    startRoomDesignation(roomType) {
        this.buildMode = false; // Exit build mode if active
        this.selectedBuilding = null;
        this.roomDesignationStart = { x: null, y: null };
        this.selectedRoomType = roomType;
        console.log(`Room designation mode: ${roomType}. Click to select start tile.`);
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

        // Check if a room designation is in progress
        if (this.roomDesignationStart && this.selectedRoomType) {
            if (this.roomDesignationStart.x === null) {
                // First click: set start point
                this.roomDesignationStart.x = tileX;
                this.roomDesignationStart.y = tileY;
                console.log(`Room designation started at ${tileX},${tileY}. Click again to select end tile.`);
            } else {
                // Second click: set end point and create room
                const startX = this.roomDesignationStart.x;
                const startY = this.roomDesignationStart.y;
                this.roomManager.designateRoom(startX, startY, tileX, tileY, this.selectedRoomType);
                this.roomDesignationStart = null;
                this.selectedRoomType = null;
            }
            return; // Room designation handled
        }

        if (this.buildMode && this.selectedBuilding) {
            // Place the selected building
            let newBuilding;
            if (this.selectedBuilding === 'crafting_station') {
                newBuilding = new CraftingStation(tileX, tileY);
            } else if (this.selectedBuilding === 'farm_plot') {
                newBuilding = new FarmPlot(tileX, tileY);
            } else if (this.selectedBuilding === 'animal_pen') {
                newBuilding = new AnimalPen(tileX, tileY);
            } else if (this.selectedBuilding === 'bed') {
                newBuilding = new Furniture('bed', tileX, tileY, 1, 2, 'wood', 50);
            } else if (this.selectedBuilding === 'table') {
                newBuilding = new Furniture('table', tileX, tileY, 2, 1, 'wood', 75);
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
                } else if (clickedBuilding.type === 'farm_plot') {
                    const farmPlot = clickedBuilding;
                    if (farmPlot.growthStage === 0) {
                        this.taskManager.addTask(new Task("sow_crop", tileX, tileY, null, 0, 3, farmPlot, 'wheat')); // Hardcode wheat for now
                        console.log(`Sow crop task added for wheat at ${tileX},${tileY}`);
                    } else if (farmPlot.growthStage === 3) {
                        this.taskManager.addTask(new Task("harvest_crop", tileX, tileY, null, 0, 3, farmPlot));
                        console.log(`Harvest crop task added at ${tileX},${tileY}`);
                    } else {
                        console.log(`Farm plot at ${tileX},${tileY} is not ready for action.`);
                    }
                } else if (clickedBuilding.type === 'animal_pen') {
                    const animalPen = clickedBuilding;
                    this.taskManager.addTask(new Task("tend_animals", tileX, tileY, null, 0, 3, animalPen));
                    console.log(`Tend animals task added at ${tileX},${tileY}`);
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
                this.taskManager.addTask(new Task("chop_wood", tileX, tileY, "wood", 50, 2));
                console.log(`Chop wood task added at ${tileX},${tileY}`);
            } else if (clickedTile === 3) { // If a stone is clicked
                this.taskManager.addTask(new Task("mine_stone", tileX, tileY, "stone", 50, 2));
                console.log(`Mine stone task added at ${tileX},${tileY}`);
            } else if (clickedTile === 4) { // If berries are clicked
                this.taskManager.addTask(new Task("gather_berries", tileX, tileY, "berries", 20, 2));
                console.log(`Gather berries task added at ${tileX},${tileY}`);
            } else if (clickedTile === 5) { // If iron_ore is clicked
                this.taskManager.addTask(new Task("mine_iron_ore", tileX, tileY, "iron_ore", 50, 2));
                console.log(`Mine iron ore task added at ${tileX},${tileY}`);
            } else if (clickedTile === 6) { // If wild food is clicked
                this.taskManager.addTask(new Task("forage_food", tileX, tileY, "food", 20, 2));
                console.log(`Forage food task added at ${tileX},${tileY}`);
            } else if (clickedTile === 7) { // If animal is clicked
                this.taskManager.addTask(new Task("hunt_animal", tileX, tileY, "meat", 50, 2));
                console.log(`Hunt animal task added at ${tileX},${tileY}`);
            } else {
                // Place a wood pile at the clicked tile
                this.map.addResourcePile(new ResourcePile("wood", 10, tileX, tileY, this.map.tileSize));
            }
        }
    }
}
