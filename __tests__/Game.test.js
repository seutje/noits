import Game from '../src/js/game.js';
import Map from '../src/js/map.js';
import UI from '../src/js/ui.js';
import ResourceManager from '../src/js/resourceManager.js';
import Settler from '../src/js/settler.js';
import TaskManager from '../src/js/taskManager.js';
import Building from '../src/js/building.js';
import Task from '../src/js/task.js';

// Mock dependencies
jest.mock('../src/js/map.js');
jest.mock('../src/js/ui.js');
jest.mock('../src/js/resourceManager.js');
jest.mock('../src/js/settler.js');
jest.mock('../src/js/taskManager.js');
jest.mock('../src/js/building.js');
jest.mock('../src/js/task.js', () => {
    return jest.fn().mockImplementation((type, targetX, targetY, resourceType, quantity, difficulty, building, recipe, cropType, targetLocation, carrying, targetSettler, targetEnemy) => {
        return {
            type,
            targetX,
            targetY,
            resourceType,
            quantity,
            difficulty,
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
        game.ui = new UI();
        game.resourceManager = new ResourceManager();
        game.taskManager = new TaskManager();
        game.settlers = [new Settler("Alice", 5, 5, game.resourceManager)];

        // Mock specific methods that are called
        game.map.getTile.mockReturnValue(0); // Default to grass tile
        game.map.addBuilding = jest.fn(); // Mock addBuilding
        game.ui.setGameInstance = jest.fn();
        game.ui.update = jest.fn();
        game.resourceManager.addResource = jest.fn();
        game.resourceManager.getAllResources.mockReturnValue({});
        
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
        game.toggleBuildMode('wall');
        expect(game.buildMode).toBe(true);
        expect(game.selectedBuilding).toBe('wall');

        game.toggleBuildMode('wall'); // Toggle off
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);

        game.toggleBuildMode('floor'); // Toggle on with new type
        expect(game.buildMode).toBe(true);
        expect(game.selectedBuilding).toBe('floor');
    });

    test('handleClick should place a building when in build mode', () => {
        game.toggleBuildMode('wall');
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });

        // Calculate expected tile coordinates based on mock canvas size and default camera
        const expectedTileX = Math.floor(((100 - mockCtx.canvas.width / 2) / game.camera.zoom + game.camera.x) / game.map.tileSize);
        const expectedTileY = Math.floor(((100 - mockCtx.canvas.height / 2) / game.camera.zoom + game.camera.y) / game.map.tileSize);

        expect(game.map.addBuilding).toHaveBeenCalledTimes(1);
        expect(game.map.addBuilding).toHaveBeenCalledWith(expect.any(Building));
        // Verify the Building constructor was called with correct arguments
        expect(Building).toHaveBeenCalledWith(
            'wall',
            expectedTileX,
            expectedTileY,
            1,
            1,
            'wood',
            0,
            1
        );
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(2);
        expect(Task).toHaveBeenCalledWith(
            'build',
            expectedTileX,
            expectedTileY,
            null,
            100,
            2,
            expect.any(Building)
        );
        const haulTask = game.taskManager.addTask.mock.calls[0][0];
        expect(haulTask.type).toBe('haul');
        expect(haulTask.building).toBeInstanceOf(Building);
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);
    });

    test('handleClick should not place a building when not in build mode', () => {
        game.buildMode = false;
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        expect(game.map.addBuilding).not.toHaveBeenCalled();
    });

    test('handleClick should add wood and remove tree when tree is clicked', () => {
        game.map.getTile.mockReturnValue(2); // Mock a tree tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        expect(game.taskManager.addTask).toHaveBeenCalledTimes(1);
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe("chop_wood");
        expect(addedTask.resourceType).toBe("wood");
        expect(addedTask.quantity).toBe(2.5);
    });

    test('handleClick should add stone and remove tile when stone is clicked', () => {
        game.map.getTile.mockReturnValue(3); // Mock a stone tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe("mine_stone");
        expect(addedTask.resourceType).toBe("stone");
        expect(addedTask.quantity).toBe(2.5);
    });

    test('handleClick should add berries and remove tile when berries are clicked', () => {
        game.map.getTile.mockReturnValue(4); // Mock a berries tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe("gather_berries");
        expect(addedTask.resourceType).toBe("berries");
        expect(addedTask.quantity).toBe(1);
    });

    test('handleClick should add iron_ore and remove tile when iron_ore is clicked', () => {
        game.map.getTile.mockReturnValue(5); // Mock an iron_ore tile
        game.handleClick({ clientX: 100, clientY: 100, target: { closest: () => null } });
        const addedTask = game.taskManager.addTask.mock.calls[0][0];
        expect(addedTask.type).toBe("mine_iron_ore");
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
        expect(addedTask.type).toBe("explore");
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
        expect(addedTask.type).toBe('butcher');
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
});