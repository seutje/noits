
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
import WorldMap from './worldMap.js';
import Faction from './faction.js';
import TradeManager from './tradeManager.js';
import Furniture from './furniture.js';
import Enemy from './enemy.js';
import EventManager from './eventManager.js';
import NotificationManager from './notificationManager.js';
import SoundManager from './soundManager.js';
import { ACTION_BEEP_URL, GATHER_TASK_TYPES, TASK_TYPES, RESOURCE_TYPES } from './constants.js';


export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.spriteManager = new SpriteManager();
        this.map = new Map(50, 30, 32, this.spriteManager);
        this.camera = new Camera(ctx);
        // Move camera half a screen width to the right and half a screen height down
        this.camera.x += ctx.canvas.width / 2;
        this.camera.y += ctx.canvas.height / 2;
        this.ui = new UI(ctx);
        this.ui.setGameInstance(this);
        this.resourceManager = new ResourceManager();
        this.taskManager = new TaskManager();
        this.roomManager = new RoomManager(this.map, this.spriteManager, this.map.tileSize, this.taskManager);
        this.worldMap = new WorldMap();
        this.factions = {
            bandits: new Faction('Bandits', -50),
            traders: new Faction('Traders', 50)
        };
        this.tradeManager = new TradeManager(this.resourceManager, this.factions);
        this.eventManager = new EventManager(this, Enemy);
        this.soundManager = new SoundManager();
        this.notificationManager = new NotificationManager(this.soundManager);
        this.settlers = [];
        this.roomManager.setSettlers(this.settlers);
        this.enemies = [];
        this.keys = {};
        this.isPaused = false; // Track pause state
        this.gameTime = 0;
        this.gameSpeed = 1; // Default game speed
        this.haulingCheckTimer = 0; // Timer for hauling task assignment
        this.haulingCheckInterval = 1; // seconds between hauling checks
        this.uiUpdateTimer = 0; // Timer for throttling UI updates
        this.uiUpdateInterval = 100; // Minimum time between UI updates in ms
        this.temperature = 20; // Initial temperature in Celsius
        this.buildMode = false; // New property for build mode
        this.selectedBuilding = null; // New property to hold the selected building type
        this.diggingDirtMode = false; // New property for digging dirt mode

        this.gameLoop = this.gameLoop.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
    }

    async start() {
        try {
            
            await this.spriteManager.loadImage('settler', 'src/assets/settler.png');
            await this.spriteManager.loadImage('tree', 'src/assets/tree.png');
            await this.spriteManager.loadImage('grass', 'src/assets/grass.png');
            await this.spriteManager.loadImage('berry_bush', 'src/assets/berry_bush.png');
            await this.spriteManager.loadImage('goblin', 'src/assets/goblin.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.STONE, 'src/assets/stone.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.IRON_ORE, 'src/assets/iron_ore.png');
            await this.spriteManager.loadImage('deer', 'src/assets/deer.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.DIRT, 'src/assets/dirt.png');
            await this.spriteManager.loadImage('wild_boar', 'src/assets/wild_boar.png');
            await this.spriteManager.loadImage('mushroom', 'src/assets/mushroom.png');
            await this.spriteManager.loadImage('mushrooms', 'src/assets/mushrooms.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.WOOD, 'src/assets/wood.png');
            await this.spriteManager.loadImage('stone_pile', 'src/assets/stone_pile.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.BERRIES, 'src/assets/berries.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.MEAT, 'src/assets/meat.png');
            await this.soundManager.loadSound('action', ACTION_BEEP_URL);
            
            await this.spriteManager.loadImage('dirt_pile', 'src/assets/dirt_pile.png');
            await this.spriteManager.loadImage('farm_plot', 'src/assets/farmPlot.png');
            await this.spriteManager.loadImage(RESOURCE_TYPES.BANDAGE, 'src/assets/bandage.png');
            await this.spriteManager.loadImage('crafting_station', 'src/assets/crafting_station.png');
            await this.spriteManager.loadImage('table', 'src/assets/table.png');
            await this.spriteManager.loadImage('wheat_1', 'src/assets/wheat_1.png');
            await this.spriteManager.loadImage('wheat_2', 'src/assets/wheat_2.png');
            await this.spriteManager.loadImage('wheat_3', 'src/assets/wheat_3.png');
            await this.spriteManager.loadImage('wheat_pile', 'src/assets/wheat_pile.png');
            await this.spriteManager.loadImage('cotton_1', 'src/assets/cotton_1.png');
            await this.spriteManager.loadImage('cotton_2', 'src/assets/cotton_2.png');
            await this.spriteManager.loadImage('cotton_3', 'src/assets/cotton_3.png');
            await this.spriteManager.loadImage('cotton_pile', 'src/assets/cotton_pile.png');
            await this.spriteManager.loadImage('iron_ore_pile', 'src/assets/iron_ore_pile.png');
        } catch (error) {
            console.error("Failed to load sprite:", error);
        }

        // Create a new settler
        this.settlers.push(new Settler("Alice", 5, 5, this.resourceManager, this.map, this.roomManager, this.spriteManager, this.settlers));
        this.settlers.push(new Settler("Bob", 6, 5, this.resourceManager, this.map, this.roomManager, this.spriteManager, this.settlers));

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('click', this.handleClick);
        window.addEventListener('wheel', this.handleWheel, { passive: false });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            }
            // Do not automatically resume when focus returns; player must unpause manually
        });
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
        // Periodically assign hauling tasks for dropped resource piles
        this.haulingCheckTimer += (deltaTime / 1000) * this.gameSpeed;
        if (this.haulingCheckTimer >= this.haulingCheckInterval) {
            this.roomManager.assignHaulingTasksForDroppedPiles(this.settlers);
            this.haulingCheckTimer = 0;
        }

        // Accumulate real time for throttled UI updates
        this.uiUpdateTimer += deltaTime;
        
        // Update settler needs
        // Update settler needs
        this.settlers.forEach(settler => {
            settler.updateNeeds(deltaTime * this.gameSpeed);
            if (settler.needsTreatment() && this.map.resourcePiles.some(p => p.type === RESOURCE_TYPES.BANDAGE && p.quantity > 0)) {
                const availableSettler = this.settlers.find(s =>
                    !s.currentTask &&
                    (s.state === 'idle' || (s === settler && s.state === 'seeking_treatment'))
                );
                const existingTreatmentTask = this.taskManager.hasTaskForTargetSettler(settler) ||
                                             this.settlers.some(s => s.currentTask && s.currentTask.type === TASK_TYPES.TREATMENT && s.currentTask.targetSettler === settler);

                if (availableSettler && !existingTreatmentTask) {
                    this.taskManager.addTask(new Task(TASK_TYPES.TREATMENT, settler.x, settler.y, null, 0, 5, null, null, null, null, null, settler));
                    console.log(`Treatment task created for ${settler.name}`);
                }
            }

        });
        // Task assignment handled after all settlers update
        this.taskManager.assignTasks(
            this.settlers,
            (task, settler) => !(
                settler.carrying &&
                (task.type === TASK_TYPES.HAUL || GATHER_TASK_TYPES.has(task.type))
            )
        );


        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime * this.gameSpeed, this.settlers);
        });
        this.enemies = this.enemies.filter(enemy => !enemy.isButchered);

        // Update event manager
        this.eventManager.update(deltaTime * this.gameSpeed);

        // Update buildings (e.g., farm plots)
        this.map.getAllBuildings().forEach(building => {
            if (typeof building.update === 'function') {
                building.update(deltaTime * this.gameSpeed);
            }

            if (building.type === 'farm_plot') {
                const farmPlot = building;
                if (farmPlot.autoSow && farmPlot.crop === null) {
                    const hasTask = this.taskManager.tasks.some(t => t.type === TASK_TYPES.SOW_CROP && t.building === farmPlot);
                    const inProgress = this.settlers.some(s => s.currentTask && s.currentTask.type === TASK_TYPES.SOW_CROP && s.currentTask.building === farmPlot);
                    if (!hasTask && !inProgress) {
                        this.addSowCropTask(farmPlot, farmPlot.desiredCrop);
                    }
                }
                if (farmPlot.autoHarvest && farmPlot.growthStage === 3) {
                    const hasTask = this.taskManager.tasks.some(t => t.type === TASK_TYPES.HARVEST_CROP && t.building === farmPlot);
                    const inProgress = this.settlers.some(s => s.currentTask && s.currentTask.type === TASK_TYPES.HARVEST_CROP && s.currentTask.building === farmPlot);
                    if (!hasTask && !inProgress) {
                        this.addHarvestCropTask(farmPlot);
                    }
                }
            }
            if (building.type === 'crafting_station') {
                const station = building;
                if (station.autoCraft && station.desiredRecipe) {
                    const hasTask = this.taskManager.tasks.some(
                        t => t.type === TASK_TYPES.CRAFT && t.building === station,
                    );
                    const inProgress = this.settlers.some(
                        s => s.currentTask && s.currentTask.type === TASK_TYPES.CRAFT && s.currentTask.building === station,
                    );
                    if (!hasTask && !inProgress) {
                        this.addCraftTask(station, station.desiredRecipe);
                    }
                }
            }

            // Queue hauling tasks for unfinished buildings and only start build
            // tasks once materials are delivered
            if (building.buildProgress < 100) {
                if (building.resourcesDelivered < building.resourcesRequired) {
                    const hasHaul = this.taskManager.tasks.some(
                        t => t.type === TASK_TYPES.HAUL && t.building === building,
                    );
                    const hauling = this.settlers.some(
                        s =>
                            s.currentTask &&
                            s.currentTask.type === TASK_TYPES.HAUL &&
                            s.currentTask.building === building,
                    );
                    if (!hasHaul && !hauling) {
                        this.taskManager.addTask(
                            new Task(
                                TASK_TYPES.HAUL,
                                building.x,
                                building.y,
                                building.material,
                                building.resourcesRequired - building.resourcesDelivered,
                                3,
                                building,
                            ),
                        );
                    }
                }

                if (building.resourcesDelivered >= building.resourcesRequired) {
                    const hasTask = this.taskManager.tasks.some(
                        t => t.type === TASK_TYPES.BUILD && t.building === building,
                    );
                    const inProgress = this.settlers.some(
                        s =>
                            s.currentTask &&
                            s.currentTask.type === TASK_TYPES.BUILD &&
                            s.currentTask.building === building,
                    );
                    if (!hasTask && !inProgress) {
                        this.taskManager.addTask(
                            new Task(
                                TASK_TYPES.BUILD,
                                building.x,
                                building.y,
                                null,
                                100,
                                2,
                                building,
                            ),
                        );
                    }
                }
            }
        });

        let resourceString = "";
        for (const type in this.resourceManager.getAllResources()) {
            const resource = this.resourceManager.getAllResources()[type];
            resourceString += `${type}: ${Math.floor(resource.quantity)} (Q:${resource.quality.toFixed(2)}), `;
        }
        if (this.uiUpdateTimer >= this.uiUpdateInterval) {
            this.ui.update(this.gameTime, resourceString.slice(0, -2), this.settlers, this.temperature); // Remove trailing comma and space
            this.uiUpdateTimer = 0;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.camera.applyTransform();
        this.map.render(this.ctx);
        this.roomManager.render(this.ctx, this.map.tileSize);



        // Render settlers
        this.settlers.forEach(settler => {
            settler.render(this.ctx);
        });

        // Render enemies
        this.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });

        this.camera.resetTransform();

        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const centerX = this.ctx.canvas.width / 2;
        const centerY = this.ctx.canvas.height / 2;
        this.ctx.fillText('Paused', centerX, centerY - 20);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('press p to unpause', centerX, centerY + 20);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.update(deltaTime);
        }
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    setGameSpeed(speed) {
        this.gameSpeed = speed;
    }

    setSoundVolume(volume) {
        if (this.soundManager) {
            this.soundManager.setVolume(volume);
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        this.uiUpdateTimer = 0;
    }

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
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

    startDiggingDirt() {
        this.buildMode = false; // Exit build mode if active
        this.selectedBuilding = null;
        this.roomDesignationStart = null; // Exit room designation mode if active
        this.selectedRoomType = null;
        this.diggingDirtMode = true;
        console.log("Digging dirt mode: Click on a grass tile to dig dirt.");
    }

    startExploration() {
        // For now, just log the locations. In the future, this will open a world map view.
        console.log("World Map Locations:", this.worldMap.getLocations());
        // Example: send a settler to explore a specific location
        if (this.settlers.length > 0) {
            const settler = this.settlers[0]; // Get the first settler
            const targetLocation = this.worldMap.getLocation('forest_outpost'); // Example target
            if (targetLocation) {
                this.taskManager.addTask(new Task(TASK_TYPES.EXPLORE, targetLocation.x, targetLocation.y, null, 0, 5, null, null, null, targetLocation, null, null, null));
                console.log(`${settler.name} is sent to explore ${targetLocation.name}.`);
            }
        }
    }

    spawnTravelingMerchant() {
        console.log("A traveling merchant has arrived!");
        // Example trade: buy 10 wood for 5 gold
        this.tradeManager.initiateTrade('traders', [{ type: 'buy', resource: RESOURCE_TYPES.WOOD, quantity: 10, price: 5 }]);
        // Example trade: sell 5 food for 10 gold
        this.tradeManager.initiateTrade('traders', [{ type: 'sell', resource: 'food', quantity: 5, price: 10 }]);
    }

    addSowCropTask(farmPlot, cropType = RESOURCE_TYPES.WHEAT) {
        this.taskManager.addTask(
            new Task(
                TASK_TYPES.SOW_CROP,
                farmPlot.x,
                farmPlot.y,
                null,
                0,
                3,
                farmPlot,
                null,
                cropType
            )
        );
    }

    addHarvestCropTask(farmPlot) {
        this.taskManager.addTask(
            new Task(TASK_TYPES.HARVEST_CROP, farmPlot.x, farmPlot.y, null, 0, 3, farmPlot)
        );
    }

    addCraftTask(craftingStation, recipe, quantity = 1) {
        // Ensure required resources get delivered to the station
        recipe.inputs.forEach(input => {
            const existing = craftingStation.getResourceQuantity(input.resourceType);
            const required = input.quantity * quantity;
            const missing = required - existing;
            if (missing > 0) {
                this.taskManager.addTask(
                    new Task(
                        TASK_TYPES.HAUL,
                        craftingStation.x,
                        craftingStation.y,
                        input.resourceType,
                        missing,
                        3,
                        craftingStation,
                    ),
                );
            }
        });

        for (let i = 0; i < quantity; i++) {
            this.taskManager.addTask(
                new Task(
                    TASK_TYPES.CRAFT,
                    craftingStation.x,
                    craftingStation.y,
                    null,
                    0,
                    2,
                    craftingStation,
                    recipe,
                ),
            );
        }
    }

    saveGame() {
        const gameState = {
            settlers: this.settlers.map(settler => settler.serialize()),
            resources: this.resourceManager.serialize(),
            map: this.map.serialize(),
            gameTime: this.gameTime,
            gameSpeed: this.gameSpeed,
            temperature: this.temperature,
            enemies: this.enemies.map(enemy => enemy.serialize()),
            tasks: this.taskManager.serialize(),
        };
        localStorage.setItem('noitsGameState', JSON.stringify(gameState));
        console.log("Game saved!");
    }

    loadGame() {
        const savedState = localStorage.getItem('noitsGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);

            // Restore settlers
            this.settlers = [];
            gameState.settlers.forEach(sData => {
                const settler = new Settler(sData.name, sData.x, sData.y, this.resourceManager, this.map, this.roomManager, this.spriteManager, this.settlers);
                settler.deserialize(sData);
                this.settlers.push(settler);
            });

            // After all settlers and enemies are deserialized, re-link their targets
            this.settlers.forEach(settler => {
                if (settler.currentTask) {
                    if (settler.currentTask.building) {
                        settler.currentTask.building = this.map.getBuildingAt(settler.currentTask.building.x, settler.currentTask.building.y);
                    }
                    if (settler.currentTask.assignedSettler) {
                        settler.currentTask.assignedSettler = this.settlers.find(s => s.name === settler.currentTask.assignedSettler);
                    }
                    if (settler.currentTask.targetLocation) {
                        settler.currentTask.targetLocation = this.worldMap.getLocation(settler.currentTask.targetLocation.id);
                    }
                    if (settler.currentTask.targetSettler) {
                        settler.currentTask.targetSettler = this.settlers.find(s => s.name === settler.currentTask.targetSettler);
                    }
                }
                if (settler.targetEnemy && settler.targetEnemy.id) {
                    settler.setTargetEnemy(this.enemies.find(enemy => enemy.id === settler.targetEnemy.id));
                }
            });

            // Restore resources
            this.resourceManager.deserialize(gameState.resources);

            // Restore map (buildings, resource piles)
            this.map.deserialize(gameState.map);

            this.gameTime = gameState.gameTime;
            this.gameSpeed = gameState.gameSpeed;
            this.temperature = gameState.temperature;

            // Restore enemies
            this.enemies = gameState.enemies.map(eData => {
                const enemy = new Enemy(eData.name, eData.x, eData.y, null, this.spriteManager); // Target settler will be re-assigned in update
                enemy.deserialize(eData);
                return enemy;
            });

            // Restore tasks
            this.taskManager.deserialize(gameState.tasks);
            // Re-link task objects (building, recipe, assignedSettler, targetLocation, targetSettler)
            this.taskManager.tasks.forEach(task => {
                if (task.building) {
                    task.building = this.map.getBuildingAt(task.building.x, task.building.y);
                }
                if (task.assignedSettler) {
                    task.assignedSettler = this.settlers.find(s => s.name === task.assignedSettler);
                }
                if (task.targetLocation) {
                    task.targetLocation = this.worldMap.getLocation(task.targetLocation.id);
                }
                if (task.targetSettler) {
                    task.targetSettler = this.settlers.find(s => s.name === task.targetSettler);
                }
                if (task.targetEnemy) {
                    task.targetEnemy = this.enemies.find(e => e.id === task.targetEnemy.id);
                }
                // Recipes are currently hardcoded or simple objects, so direct assignment is fine for now
                // If recipes become complex objects, they would need their own serialization/deserialization
            });

            console.log("Game loaded!");
        } else {
            console.log("No saved game found.");
        }
    }

    handleKeyDown(event) {
        if (event.key === 'p') {
            this.togglePause();
        } else {
            this.keys[event.key] = true;
        }
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
                if (this.selectedRoomType === TASK_TYPES.DIG_DIRT) {
                    this.taskManager.addTask(new Task(TASK_TYPES.DIG_DIRT, tileX, tileY, "dirt", 50, 2));
                    console.log(`Dig dirt task added at ${tileX},${tileY}`);
                } else {
                    const startX = this.roomDesignationStart.x;
                    const startY = this.roomDesignationStart.y;
                    this.roomManager.designateRoom(startX, startY, tileX, tileY, this.selectedRoomType);
                }
                this.roomDesignationStart = null;
                this.selectedRoomType = null;
            }
            return; // Room designation handled
        }

        if (this.buildMode && this.selectedBuilding) {
            // Place the selected building
            let newBuilding;
            if (this.selectedBuilding === 'crafting_station') {
                newBuilding = new CraftingStation(tileX, tileY, this.spriteManager);
            } else if (this.selectedBuilding === 'farm_plot') {
                newBuilding = new FarmPlot(tileX, tileY, this.spriteManager);
            } else if (this.selectedBuilding === 'animal_pen') {
                newBuilding = new AnimalPen(tileX, tileY);
            } else if (this.selectedBuilding === 'bed') {
                newBuilding = new Furniture('bed', tileX, tileY, 1, 1, RESOURCE_TYPES.WOOD, 50, this.spriteManager);
            } else if (this.selectedBuilding === 'table') {
                newBuilding = new Furniture('table', tileX, tileY, 1, 1, RESOURCE_TYPES.WOOD, 75, this.spriteManager);
            } else if (this.selectedBuilding === 'barricade') {
                newBuilding = new Building('barricade', tileX, tileY, 1, 1, RESOURCE_TYPES.WOOD, 0); // Barricade is a simple building
            } else if (this.selectedBuilding === 'wall') {
                newBuilding = new Building('wall', tileX, tileY, 1, 1, RESOURCE_TYPES.WOOD, 0, 1); // Walls require 1 wood
            } else {
                newBuilding = new Building(this.selectedBuilding, tileX, tileY, 1, 1, RESOURCE_TYPES.WOOD, 0); // Start with 0 health
            }
            this.map.addBuilding(newBuilding);
            // Hauling should happen before building starts if resources are needed
            if (newBuilding.resourcesRequired > 0 && newBuilding.material) {
                this.taskManager.addTask(
                    // Start hauling to deliver materials to the new building
                    // Initial target is the building site; Settler will search for
                    // a resource pile when the task is picked up
                    new Task(
                        TASK_TYPES.HAUL,
                        newBuilding.x,
                        newBuilding.y,
                        newBuilding.material,
                        newBuilding.resourcesRequired,
                        3,
                        newBuilding
                    )
                );
            }
            // Build task has lower priority so it begins once resources arrive (if any)
            this.taskManager.addTask(new Task(TASK_TYPES.BUILD, tileX, tileY, null, 100, 2, newBuilding));
            this.soundManager.play('action');
            this.buildMode = false; // Exit build mode after placing
            this.selectedBuilding = null;
        } else {
            // Check if an enemy corpse was clicked first
            const clickedEnemy = this.enemies.find(
                e => Math.round(e.x) === tileX && Math.round(e.y) === tileY
            );
            if (clickedEnemy && clickedEnemy.isDead && clickedEnemy.decay <= 50 && !clickedEnemy.isMarkedForButcher && !clickedEnemy.isButchered) {
                this.taskManager.addTask(new Task(TASK_TYPES.BUTCHER, tileX, tileY, RESOURCE_TYPES.MEAT, 1, 2, null, null, null, null, null, null, clickedEnemy));
                clickedEnemy.isMarkedForButcher = true;
                console.log(`Butcher task added at ${tileX},${tileY}`);
            } else {
                // Check if a building was clicked
                const clickedBuilding = this.map.getBuildingAt(tileX, tileY);
                if (clickedBuilding) {
                    if (clickedBuilding.type === 'crafting_station') {
                        const craftingStation = clickedBuilding;
                        this.ui.showCraftingStationMenu(craftingStation, event.clientX, event.clientY);
                    } else if (clickedBuilding.type === 'farm_plot') {
                        const farmPlot = clickedBuilding;
                        this.ui.showFarmPlotMenu(farmPlot, event.clientX, event.clientY);
                    } else if (clickedBuilding.type === 'animal_pen') {
                        const animalPen = clickedBuilding;
                        this.taskManager.addTask(new Task(TASK_TYPES.TEND_ANIMALS, tileX, tileY, null, 0, 3, animalPen));
                        console.log(`Tend animals task added at ${tileX},${tileY}`);
                    } else if (typeof clickedBuilding.takeDamage === 'function') {
                        // Temporarily disabled direct damage on mouse clicks
                        // clickedBuilding.takeDamage(25); // Example: 25 damage per click
                        // if (clickedBuilding.health <= 0) {
                        //     clickedBuilding.spillInventory(this.map);
                        //     this.map.removeBuilding(clickedBuilding);
                        //     console.log(`Building at ${tileX},${tileY} destroyed.`);
                        // }
                    } else {
                        console.warn("Clicked object is not a valid Building instance or missing takeDamage method:", clickedBuilding);
                    }
                } else if (clickedTile === 2) { // If a tree is clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.CHOP_WOOD, tileX, tileY, RESOURCE_TYPES.WOOD, 2.5, 2));
                    console.log(`Chop wood task added at ${tileX},${tileY}`);
                } else if (clickedTile === 3) { // If a stone is clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.MINE_STONE, tileX, tileY, RESOURCE_TYPES.STONE, 2.5, 2));
                    console.log(`Mine stone task added at ${tileX},${tileY}`);
                } else if (clickedTile === 4) { // If berries are clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.GATHER_BERRIES, tileX, tileY, RESOURCE_TYPES.BERRIES, 1, 2));
                    console.log(`Gather berries task added at ${tileX},${tileY}`);
                } else if (clickedTile === 5) { // If iron_ore is clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.MINE_IRON_ORE, tileX, tileY, RESOURCE_TYPES.IRON_ORE, 10, 2));
                    console.log(`Mine iron ore task added at ${tileX},${tileY}`);
                } else if (clickedTile === 6) { // If wild food is clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.MUSHROOM, tileX, tileY, RESOURCE_TYPES.MUSHROOMS, 1, 2));
                    console.log(`Forage food task added at ${tileX},${tileY}`);
                } else if (clickedTile === 7) { // If animal is clicked
                    this.taskManager.addTask(new Task(TASK_TYPES.HUNT_ANIMAL, tileX, tileY, RESOURCE_TYPES.MEAT, 2.5, 2));
                    console.log(`Hunt animal task added at ${tileX},${tileY}`);
                }
            }
        }
    }

    handleWheel(event) {
        event.preventDefault();
        const zoomStep = 0.1;
        if (event.deltaY < 0) {
            this.camera.zoom = Math.min(this.camera.zoom + zoomStep, 3);
        } else if (event.deltaY > 0) {
            this.camera.zoom = Math.max(this.camera.zoom - zoomStep, 0.5);
        }
    }
}
