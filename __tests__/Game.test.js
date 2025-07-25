import Game from '../src/js/game.js';
import Map from '../src/js/map.js';
import UI from '../src/js/ui.js';
import ResourceManager from '../src/js/resourceManager.js';
import Settler from '../src/js/settler.js';
import TaskManager from '../src/js/taskManager.js';
import Building from '../src/js/building.js';

// Mock dependencies
jest.mock('../src/js/map.js');
jest.mock('../src/js/ui.js');
jest.mock('../src/js/resourceManager.js');
jest.mock('../src/js/settler.js');
jest.mock('../src/js/taskManager.js');
jest.mock('../src/js/building.js');

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
        Settler.mockClear();
        TaskManager.mockClear();
        Building.mockClear();

        // Mock instance methods if needed
        game.map = new Map();
        game.ui = new UI();
        game.resourceManager = new ResourceManager();
        game.taskManager = new TaskManager();
        game.settlers = [new Settler()];

        // Mock specific methods that are called
        game.map.getTile.mockReturnValue(0); // Default to grass tile
        game.map.addBuilding = jest.fn(); // Mock addBuilding
        game.ui.setGameInstance = jest.fn();
        game.ui.update = jest.fn();
        game.resourceManager.addResource = jest.fn();
        game.resourceManager.getAllResources.mockReturnValue({});
        game.settlers[0].updateNeeds = jest.fn();
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
        game.handleClick({ clientX: 100, clientY: 100 });

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
            100
        );
        expect(game.buildMode).toBe(false);
        expect(game.selectedBuilding).toBe(null);
    });

    test('handleClick should not place a building when not in build mode', () => {
        game.buildMode = false;
        game.handleClick({ clientX: 100, clientY: 100 });
        expect(game.map.addBuilding).not.toHaveBeenCalled();
    });
});