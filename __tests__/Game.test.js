import Game from '../src/js/game.js';
import { BUILDING_TYPES } from '../src/js/constants.js';
import Map from '../src/js/map.js';
import UI from '../src/js/ui.js';
import ResourceManager from '../src/js/resourceManager.js';
import Settler from '../src/js/settler.js';
import TaskManager from '../src/js/taskManager.js';
import Building from '../src/js/building.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

// Mock dependencies
jest.mock('../src/js/map.js');
jest.mock('../src/js/ui.js');
jest.mock('../src/js/resourceManager.js');
jest.mock('../src/js/settler.js');
jest.mock('../src/js/taskManager.js');
jest.mock('../src/js/building.js', () => {
    return jest.fn().mockImplementation((type, x, y, width, height, material, buildProgress, resourcesRequired = 1, constructionMaterials = null) => {
        return {
            type,
            x,
            y,
            width,
            height,
            material,
            buildProgress,
            resourcesRequired,
            constructionMaterials: constructionMaterials || { [material]: resourcesRequired },
        };
    });
});
jest.mock('../src/js/well.js', () => {
    const { BUILDING_TYPES } = require('../src/js/constants.js');
    return jest.fn().mockImplementation((x, y) => ({
        type: BUILDING_TYPES.WELL,
        x,
        y,
        width: 1,
        height: 1,
        material: 'plank',
        buildProgress: 0,
        constructionMaterials: { plank: 1, stone: 1, bucket: 1 },
        resourcesRequired: 3,
    }));
});
jest.mock('../src/js/task.js', () => {
    return jest.fn().mockImplementation((type, targetX, targetY, resourceType, quantity, priority, building, recipe, cropType, targetLocation, carrying, targetSettler, targetEnemy) => {
        return {
            type,
            targetX,
            targetY,
            resourceType,
            quantity,
            priority,
            building,
            recipe,
            cropType,
            targetLocation, // Add targetLocation here
            carrying,
            targetSettler,
            targetEnemy,
            craftingProgress: 0 // Add craftingProgress for crafting tasks
        };
    });
});





describe('Game', () => {
    let game;
    let mockCtx;

    beforeEach(() => {
        mockCtx = {
            canvas: { width: 800, height: 600 },
            clearRect: jest.fn(),
            drawImage: jest.fn(),
        };
        game = new Game(mockCtx);
        // Reset mocks before each test
        Map.mockClear();
        UI.mockClear();
        ResourceManager.mockClear();
        TaskManager.mockClear();
        Settler.mockClear();
        Building.mockClear();

        // Mock instance methods if needed
        game.map = new Map();
        game.map.tileSize = 32;
        game.ui = new UI();
        game.resourceManager = new ResourceManager();
        game.taskManager = new TaskManager();
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        game.settlers = [
            new Settler(
                "Alice",
                5,
                5,
                game.resourceManager,
                undefined,
                undefined,
                undefined,
                undefined,
                defaultSkills,
            ),
        ];

        // Mock specific methods that are called
        game.map.getTile.mockReturnValue(0); // Default to grass tile
        game.map.addBuilding = jest.fn(); // Mock addBuilding
        game.map.getBuildingsAt = jest.fn().mockReturnValue([]);
        game.ui.setGameInstance = jest.fn();
        game.ui.update = jest.fn();
        game.ui.showFarmPlotMenu = jest.fn();
        game.resourceManager.addResource = jest.fn();
        game.resourceManager.getAllResources.mockReturnValue({});

        game.map.getBuildingAt = jest.fn();
        
        game.settlers[0].render = jest.fn();
        game.settlers[0].hunger = 100;
        game.settlers[0].sleep = 100;
        game.settlers[0].mood = 100;
    });

    test('should initialize with correct properties', () => {
        expect(game.ctx).toBe(mockCtx);
        expect(game.map).toBeInstanceOf(Map);
        expect(game.ui).toBeInstanceOf(UI);
        expect(game.resourceManager).toBeInstanceOf(ResourceManager);
        expect(game.taskManager).toBeInstanceOf(TaskManager);
        expect(game.settlers).toEqual([expect.any(Settler)]);
        expect(game.gameSpeed).toBe(1);
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);
    });

    test('toggleBuildMode should set buildMode and selectedBuilding', () => {
        game.toggleBuildMode(BUILDING_TYPES.WALL);
        expect(game.buildMode).toBe(true);
        expect(game.selectedBuilding).toBe(BUILDING_TYPES.WALL);

        game.toggleBuildMode(BUILDING_TYPES.WALL); // Toggle off
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);

        game.toggleBuildMode(BUILDING_TYPES.FLOOR); // Toggle on with new type
        expect(game.buildMode).toBe(true);
        expect(game.selectedBuilding).toBe(BUILDING_TYPES.FLOOR);
    });

    test('handleClick should place a building when in build mode', () => {
        // Calculate expected tile coordinates based on mock canvas size and default camera
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.WALL);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
        expect(game.map.addBuilding).toHaveBeenCalledWith(expect.any(Object));
        // Verify the Building constructor was called with correct arguments
        expect(Building).toHaveBeenCalledWith(
            BUILDING_TYPES.WALL,
            expectedTileX,
            expectedTileY,
            1,
            1,
            'stone',
            0,
            1
        );
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(2);
        expect(Task).toHaveBeenCalledWith(
            TASK_TYPES.BUILD,
            expectedTileX + 1,
            expectedTileY,
            null,
            100,
            2,
            expect.any(Object)
        );
        const haulTask = game.taskManager.addTask.mock.calls[0][0];
        expect(haulTask.type).toBe(TASK_TYPES.HAUL);
        expect(haulTask.building).toEqual(expect.any(Object));
        expect(game.buildMode).toBe(true);
        expect(game.selectedBuilding).toBe(BUILDING_TYPES.WALL);
    });

    test('handleClick should not create haul task for farm plot', () => {
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.FARM_PLOT);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
        expect(game.map.addBuilding).toHaveBeenCalledWith(expect.any(Object));
        expect(Building).toHaveBeenCalledWith(
            BUILDING_TYPES.FARM_PLOT,
            expectedTileX,
            expectedTileY,
            1,
            1,
            null,
            0,
            0
        );
        // Only build task should be added
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(1);
        const buildTask = game.taskManager.addTask.mock.calls[0][0];
        expect(buildTask.type).toBe(TASK_TYPES.BUILD);
        expect(buildTask.targetX).toBe(expectedTileX + 1);
        expect(buildTask.targetY).toBe(expectedTileY);
    });

    test('handleClick should not place a building when not in build mode', () => {
        game.buildMode = false;
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        expect(game.map.addBuilding).not.toHaveBeenCalled();
    });

    test('handleClick should not place non-floor building on water tile', () => {
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        game.map.getTile.mockReturnValue(8); // Water tile
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.WALL);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).not.toHaveBeenCalled();
    });

    test('handleClick should allow floor building on water tile', () => {
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        game.map.getTile.mockReturnValue(8); // Water tile
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.FLOOR);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
    });

    test('handleClick should allow well building on water tile', () => {
        const expectedTileX = Math.floor(
            ((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) /
                game.map.tileSize,
        );
        const expectedTileY = Math.floor(
            ((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) /
                game.map.tileSize,
        );
        game.map.getTile.mockReturnValue(8); // Water tile
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.WELL);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
    });

    test('handleClick should not allow well building on land tile', () => {
        game.map.getTile.mockReturnValue(0); // Grass tile
        game.toggleBuildMode(BUILDING_TYPES.WELL);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).not.toHaveBeenCalled();
    });

    test('handleClick should allow building on floor over water tile', () => {
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        game.map.getTile.mockReturnValue(8); // Water tile
        game.map.getBuildingAt.mockReturnValue({ type: BUILDING_TYPES.FLOOR });
        game.map.findAdjacentFreeTile = jest.fn().mockReturnValue({ x: expectedTileX + 1, y: expectedTileY });
        game.toggleBuildMode(BUILDING_TYPES.WALL);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
    });

    test('handleClick on farm plot shows menu', () => {
        const tileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const tileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        const farmPlot = { type: BUILDING_TYPES.FARM_PLOT, x: tileX, y: tileY, growthStage: 0 };
        game.map.getBuildingAt.mockReturnValue(farmPlot);
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        expect(game.ui.showFarmPlotMenu).toHaveBeenCalledWith(farmPlot, 100, 100);
        expect(game.taskManager.addTask).not.toHaveBeenCalled();
    });

    test('handleClick should add wood and remove tree when tree is clicked', () => {
        game.map.getTile.mockReturnValue(2); // Mock a tree tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(1);
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.CHOP_WOOD);
        expect(addedTask.resourceType).toBe("wood");
        expect(addedTask.quantity).toBe(2.5);
    });

    test('handleClick should add stone and remove tile when stone is clicked', () => {
        game.map.getTile.mockReturnValue(3); // Mock a stone tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.MINE_STONE);
        expect(addedTask.resourceType).toBe("stone");
        expect(addedTask.quantity).toBe(2.5);
    });

    test('handleClick should add berries and remove tile when berries are clicked', () => {
        game.map.getTile.mockReturnValue(4); // Mock a berries tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.GATHER_BERRIES);
        expect(addedTask.resourceType).toBe("berries");
        expect(addedTask.quantity).toBe(1);
    });

    test('handleClick should add iron_ore and remove tile when iron_ore is clicked', () => {
        game.map.getTile.mockReturnValue(5); // Mock an iron_ore tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.MINE_IRON_ORE);
        expect(addedTask.resourceType).toBe("iron_ore");
        expect(addedTask.quantity).toBe(10);
    });

    test('startDiggingDirt should set diggingDirtMode to true', () => {
        game.startDiggingDirt();
        expect(game.diggingDirtMode).toBe(true);
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);
        expect(game.roomDesignationStart).toBe(null);
        expect(game.selectedRoomType).toBe(null);
    });

    test('startExploration should add an explore task', () => {
        game.worldMap = { // Mock worldMap
            getLocations: jest.fn().mockReturnValue([{ id: 'forest_outpost', name: 'Forest Outpost' }]),
            getLocation: jest.fn().mockReturnValue({ id: 'forest_outpost', name: 'Forest Outpost', x: 10, y: 10 })
        };
        game.settlers = [{ name: 'Alice' }]; // Mock settler
        game.startExploration();
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(1);
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.EXPLORE);
        expect(addedTask.targetLocation.id).toBe('forest_outpost');
    });

    test('spawnTravelingMerchant should initiate trade', () => {
        game.tradeManager = { initiateTrade: jest.fn() }; // Mock tradeManager
        game.resourceManager.addResource('gold', 100); // Ensure gold is available for testing
        game.spawnTravelingMerchant();
        expect(game.tradeManager.initiateTrade).toHaveBeenCalledTimes(2);
        expect(game.tradeManager.initiateTrade).toHaveBeenCalledWith('traders', [{ type: 'buy', resource: 'wood', quantity: 10, price: 5 }]);
        expect(game.tradeManager.initiateTrade).toHaveBeenCalledWith('traders', [{ type: 'sell', resource: 'food', quantity: 5, price: 10 }]);
    });

    test('auto sow and harvest create tasks', () => {
        const farmPlot = { type: BUILDING_TYPES.FARM_PLOT, x: 1, y: 2, crop: null, growthStage: 0, autoSow: true, autoHarvest: true, desiredCrop: 'wheat', buildProgress: 100 };
        game.map.getAllBuildings.mockReturnValue([farmPlot]);
        game.taskManager.tasks = [];
        game.update(16);
        expect(game.taskManager.addTask).toHaveBeenCalledWith(expect.objectContaining({ type: TASK_TYPES.SOW_CROP }));

        game.taskManager.addTask.mockClear();
        farmPlot.crop = 'wheat';
        farmPlot.growthStage = 3;
        game.update(16);
        expect(game.taskManager.addTask).toHaveBeenCalledWith(expect.objectContaining({ type: TASK_TYPES.HARVEST_CROP }));
    });

    test('auto sow does not create task when farm plot not built', () => {
        const farmPlot = { type: BUILDING_TYPES.FARM_PLOT, x: 1, y: 2, crop: null, growthStage: 0, autoSow: true, autoHarvest: false, desiredCrop: 'wheat', buildProgress: 50 };
        game.map.getAllBuildings.mockReturnValue([farmPlot]);
        game.taskManager.tasks = [];
        game.update(16);
        expect(game.taskManager.addTask).not.toHaveBeenCalled();
    });

    test('addCraftTask queues haul and craft tasks', () => {
        const station = { x: 2, y: 3, getResourceQuantity: jest.fn().mockReturnValue(0), buildProgress: 100 };
        const recipe = { inputs: [{ resourceType: 'cotton', quantity: 1 }], outputs: [], time: 1, name: 'bandage' };
        game.addCraftTask(station, recipe);
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(2);
        const haulTask = game.taskManager.addTask.mock.calls[0][0];
        expect(haulTask.type).toBe(TASK_TYPES.HAUL);
        expect(haulTask.resourceType).toBe('cotton');
        expect(haulTask.building).toBe(station);
        const craftTask = game.taskManager.addTask.mock.calls[1][0];
        expect(craftTask.type).toBe(TASK_TYPES.CRAFT);
        expect(craftTask.recipe).toBe(recipe);
        expect(haulTask.priority).toBeGreaterThan(craftTask.priority);
    });

    test('addCraftTask uses baking task type for ovens', () => {
        const station = { x: 2, y: 3, type: BUILDING_TYPES.OVEN, getResourceQuantity: jest.fn().mockReturnValue(0), buildProgress: 100 };
        const recipe = { inputs: [], outputs: [], time: 1, name: 'bread' };
        game.addCraftTask(station, recipe);
        const craftTask = game.taskManager.addTask.mock.calls.find(c => c[0].type !== TASK_TYPES.HAUL)[0];
        expect(craftTask.type).toBe(TASK_TYPES.BAKING);
    });

    test('addCraftTask does not queue tasks if station not built', () => {
        const station = { x: 2, y: 3, getResourceQuantity: jest.fn(), buildProgress: 50 };
        const recipe = { inputs: [], outputs: [], time: 1, name: 'bandage' };
        game.addCraftTask(station, recipe);
        expect(game.taskManager.addTask).not.toHaveBeenCalled();
    });

    test('addPrepareMealTask queues haul and prepare tasks', () => {
        const oven = { x: 1, y: 1, buildProgress: 100 };
        game.roomManager.findHighestValueFoods = jest.fn().mockReturnValue([
            { type: 'meat', value: 30 },
            { type: 'bread', value: 20 },
        ]);
        game.addPrepareMealTask(oven);
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(3);
        const haulTask = game.taskManager.addTask.mock.calls[0][0];
        expect(haulTask.type).toBe(TASK_TYPES.HAUL);
        const mealTask = game.taskManager.addTask.mock.calls[2][0];
        expect(mealTask.type).toBe(TASK_TYPES.PREPARE_MEAL);
        expect(mealTask.building).toBe(oven);
    });

    test('addPrepareMealTask does not queue when oven not built', () => {
        const oven = { x: 1, y: 1, buildProgress: 20 };
        game.addPrepareMealTask(oven);
        expect(game.taskManager.addTask).not.toHaveBeenCalled();
    });

    test('handleClick marks dead enemy for butchering', () => {
        game.map.tileSize = 32;
        const tileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const tileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        const enemy = { x: tileX, y: tileY, isDead: true, decay: 0, isMarkedForButcher: false, isButchered: false };
        game.enemies = [enemy];

        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(enemy.isMarkedForButcher).toBe(true);
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(1);
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe(TASK_TYPES.BUTCHER);
        expect(addedTask.targetEnemy).toBe(enemy);
    });

    test('handleClick does not mark heavily decayed enemy for butchering', () => {
        game.map.tileSize = 32;
        const tileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const tileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);
        const enemy = { x: tileX, y: tileY, isDead: true, decay: 60, isMarkedForButcher: false, isButchered: false };
        game.enemies = [enemy];

        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        expect(enemy.isMarkedForButcher).toBe(false);
        expect(game.taskManager.addTask).not.toHaveBeenCalled();
    });

    test('setSoundVolume updates SoundManager volume', () => {
        game.setSoundVolume(0.2);
        expect(game.soundManager.volume).toBe(0.2);
    });

    test('handleWheel adjusts camera zoom', () => {
        const initialZoom = game.camera.zoom;
        game.handleWheel({ deltaY: -100, preventDefault: jest.fn() });
        expect(game.camera.zoom).toBeGreaterThan(initialZoom);
        const zoomedIn = game.camera.zoom;
        game.handleWheel({ deltaY: 100, preventDefault: jest.fn() });
        expect(game.camera.zoom).toBeLessThan(zoomedIn);
    });

    test('pause and resume toggle isPaused', () => {
        game.pause();
        expect(game.isPaused).toBe(true);
        game.resume();
        expect(game.isPaused).toBe(false);
    });

    test('gameLoop skips update but still renders when paused', () => {
        global.requestAnimationFrame = jest.fn();
        const updateSpy = jest.spyOn(game, 'update').mockImplementation(() => {});
        const renderSpy = jest.spyOn(game, 'render').mockImplementation(() => {});
        game.pause();
        game.gameLoop(16);
        expect(updateSpy).not.toHaveBeenCalled();
        expect(renderSpy).toHaveBeenCalled();
        expect(global.requestAnimationFrame).toHaveBeenCalled();
        updateSpy.mockRestore();
        renderSpy.mockRestore();
    });
});