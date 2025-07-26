import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';

jest.mock('../src/js/resourceManager.js');
jest.mock('../src/js/map.js');

describe('Settler', () => {
    let settler;
    let mockResourceManager;
    let mockMap;
    let mockRoomManager;

    beforeEach(() => {
        mockResourceManager = {
            addResource: jest.fn((type, quantity, quality) => {
                // Simulate adding resource to a mock internal state if needed for more complex tests
            }),
            removeResource: jest.fn(),
            getResourceQuantity: jest.fn(),
        };
        mockMap = {
            removeResourceNode: jest.fn(),
        };
        mockRoomManager = {
            rooms: [],
            getRoomAt: jest.fn(),
            addResourceToStorage: jest.fn(),
        };
        settler = new Settler('TestSettler', 0, 0, mockResourceManager, mockMap, mockRoomManager);
    });

    test('should initialize with correct properties', () => {
        expect(settler.name).toBe('TestSettler');
        expect(settler.x).toBe(0);
        expect(settler.y).toBe(0);
        expect(settler.health).toBe(100);
        expect(settler.bodyParts).toEqual({
            head: { health: 100, bleeding: false },
            torso: { health: 100, bleeding: false },
            leftArm: { health: 100, bleeding: false },
            rightArm: { health: 100, bleeding: false },
            leftLeg: { health: 100, bleeding: false },
            rightLeg: { health: 100, bleeding: false }
        });
        expect(settler.hunger).toBe(100);
        expect(settler.sleep).toBe(100);
        expect(settler.mood).toBe(100);
        expect(settler.state).toBe('idle');
        expect(settler.currentTask).toBe(null);
        expect(settler.skills).toEqual({
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            combat: 1,
            medical: 1
        });
    });

    test('updateNeeds should decrease hunger and sleep over time', () => {
        settler.updateNeeds(1000); // Simulate 1 second
        expect(settler.hunger).toBeLessThan(100);
        expect(settler.sleep).toBeLessThan(100);
    });

    test('updateNeeds should not let hunger or sleep go below 0', () => {
        settler.hunger = 0.001;
        settler.sleep = 0.001;
        settler.updateNeeds(1000);
        expect(settler.hunger).toBe(0);
        expect(settler.sleep).toBe(0);
    });

    test('updateNeeds should change state to seeking_food when hungry', () => {
        settler.hunger = 15;
        settler.updateNeeds(1000);
        expect(settler.state).toBe('seeking_food');
    });

    test('updateNeeds should change state to seeking_sleep when sleepy', () => {
        settler.sleep = 15;
        settler.updateNeeds(1000);
        expect(settler.state).toBe('seeking_sleep');
    });

    test('updateNeeds should change state to idle when needs are met', () => {
        settler.hunger = 50;
        settler.sleep = 50;
        settler.updateNeeds(1000);
        expect(settler.state).toBe('idle');
    });

    test('updateNeeds should decrease mood when hunger is low', () => {
        settler.hunger = 40;
        settler.mood = 100;
        settler.updateNeeds(1000);
        expect(settler.mood).toBeLessThan(100);
    });

    test('updateNeeds should decrease mood when sleep is low', () => {
        settler.sleep = 40;
        settler.mood = 100;
        settler.updateNeeds(1000);
        expect(settler.mood).toBeLessThan(100);
    });

    test('updateNeeds should not let mood go below 0', () => {
        settler.mood = 0.001;
        settler.hunger = 10;
        settler.updateNeeds(1000);
        expect(settler.mood).toBe(0);
    });

    test('getStatus should return Hungry', () => {
        settler.hunger = 10;
        expect(settler.getStatus()).toBe('Hungry');
    });

    test('getStatus should return Sleepy', () => {
        settler.sleep = 10;
        expect(settler.getStatus()).toBe('Sleepy');
    });

    test('getStatus should return OK', () => {
        settler.hunger = 50;
        settler.sleep = 50;
        expect(settler.getStatus()).toBe('OK');
    });

    test('should move towards task target', () => {
        const task = new Task('move', 10, 10);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;
        settler.updateNeeds(1000); // Simulate 1 second
        // Expect settler to have moved towards (10,10)
        expect(settler.x).toBeGreaterThan(0);
        expect(settler.y).toBeGreaterThan(0);
        expect(settler.x).toBeLessThan(10);
        expect(settler.y).toBeLessThan(10);
    });

    test('should complete task when target is reached', () => {
        const task = new Task('move', 1, 1, null, 0.0001); // Very small quantity for quick completion
        settler.currentTask = task;
        settler.x = task.targetX;
        settler.y = task.targetY;
        // Simulate enough updates for the task to complete
        for (let i = 0; i < 100; i++) {
            settler.updateNeeds(1000); // Simulate 1 second
        }
        expect(settler.currentTask).toBe(null);
    });

    test('calculateOutputQuality should return base quality for crafting skill 1', () => {
        settler.skills.crafting = 1;
        expect(settler.calculateOutputQuality(1)).toBe(1);
        expect(settler.calculateOutputQuality(0.5)).toBe(0.5);
    });

    test('calculateOutputQuality should increase quality with higher crafting skill', () => {
        settler.skills.crafting = 2;
        expect(settler.calculateOutputQuality(1)).toBe(1.1);
        settler.skills.crafting = 5;
        expect(settler.calculateOutputQuality(1)).toBe(1.4);
    });

    test('calculateOutputQuality should clamp quality between 0 and 2', () => {
        settler.skills.crafting = 1;
        expect(settler.calculateOutputQuality(-1)).toBe(0);
        settler.skills.crafting = 100;
        expect(settler.calculateOutputQuality(1)).toBe(2);
    });

    test('should produce crafted items with correct quality', () => {
        const mockRecipe = {
            inputs: [{ resourceType: "wood", quantity: 1 }],
            outputs: [{ resourceType: "plank", quantity: 1, quality: 1 }],
            time: 1
        };
        const task = new Task("craft", 0, 0, null, 0, 3, null, mockRecipe);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;
        mockResourceManager.getResourceQuantity.mockReturnValue(100); // Assume resources are available
        mockResourceManager.removeResource.mockReturnValue(true);

        settler.skills.crafting = 2; // Set crafting skill for testing quality

        settler.updateNeeds(1000); // Simulate 1 second (crafting time)

        expect(mockResourceManager.addResource).toHaveBeenCalledWith("plank", 1, 1.1); // Expect quality to be 1.1
        expect(settler.currentTask).toBe(null);
    });

    test('should handle dig_dirt task', () => {
        const task = new Task('dig_dirt', 1, 1, 'dirt', 50);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;
        settler.map.tiles = [[0, 0], [0, 0]]; // Mock map tiles
        settler.map.removeResourceNode = jest.fn(); // Mock removeResourceNode

        // Simulate enough time for the task to complete
        for (let i = 0; i < 500; i++) { // 50 quantity / 0.1 per second = 500 seconds
            settler.updateNeeds(1000);
        }
        expect(settler.map.tiles[1][1]).toBe(1); // Expect tile to be dirt
        expect(settler.currentTask).toBe(null);
    });

    test('should handle sow_crop task', () => {
        const mockFarmPlot = {
            plant: jest.fn().mockReturnValue(true)
        };
        const task = new Task('sow_crop', 1, 1, null, 0, 3, mockFarmPlot, null, 'wheat');
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockFarmPlot.plant).toHaveBeenCalledWith('wheat');
        expect(settler.currentTask).toBe(null);
    });

    test('should handle harvest_crop task', () => {
        const mockFarmPlot = {
            harvest: jest.fn().mockReturnValue('wheat')
        };
        const task = new Task('harvest_crop', 1, 1, null, 0, 3, mockFarmPlot);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockFarmPlot.harvest).toHaveBeenCalled();
        expect(mockResourceManager.addResource).toHaveBeenCalledWith('wheat', 1);
        expect(settler.currentTask).toBe(null);
    });

    test('should handle tend_animals task', () => {
        const mockAnimalPen = {};
        const task = new Task('tend_animals', 1, 1, null, 0, 3, mockAnimalPen);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(settler.currentTask).toBe(null);
    });

    test('should handle explore task', () => {
        const mockLocation = { id: 'forest_outpost', name: 'Forest Outpost' };
        settler.map.worldMap = { discoverLocation: jest.fn() }; // Mock worldMap
        const task = new Task('explore', 1, 1, null, 0, 5, null, null, null, mockLocation);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(settler.map.worldMap.discoverLocation).toHaveBeenCalledWith('forest_outpost');
        expect(settler.currentTask).toBe(null);
    });

    test('should handle haul task', () => {
        const mockRoomManager = {
            getRoomAt: jest.fn().mockReturnValue({ type: 'storage' }),
            addResourceToStorage: jest.fn()
        };
        settler.roomManager = mockRoomManager; // Assign mock roomManager
        settler.carrying = { type: 'wood', quantity: 1 };
        const task = { type: 'haul', targetX: 1, targetY: 1, resource: settler.carrying };
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockRoomManager.getRoomAt).toHaveBeenCalledWith(1, 1);
        expect(mockRoomManager.addResourceToStorage).toHaveBeenCalledWith({ type: 'storage' }, 'wood', 1);
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });
});