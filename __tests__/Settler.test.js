import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES, HEALTH_REGEN_RATE, BUILDING_TYPES, FOOD_HUNGER_VALUES, RESOURCE_TYPES } from '../src/js/constants.js';
import ResourcePile from '../src/js/resourcePile.js';

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
            resourcePiles: [],
            addResourcePile: jest.fn(function(pile) { this.resourcePiles.push(pile); }),
            tileSize: 1,
            buildings: [],
            width: 20,
            height: 20,
            getTile: jest.fn(() => 0),
            getBuildingAt: jest.fn(() => null)
        };
        mockRoomManager = {
            rooms: [],
            getRoomAt: jest.fn(),
            addResourceToStorage: jest.fn(),
            findStorageRoomAndTile: jest.fn()
        };
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        settler = new Settler('TestSettler', 0, 0, mockResourceManager, mockMap, mockRoomManager, undefined, undefined, defaultSkills);
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
            cooking: 1,
            combat: 1,
            medical: 1
        });
        Object.values(TASK_TYPES).forEach(type => {
            expect(settler.taskPriorities[type]).toBe(5);
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
        expect(settler.x + settler.y).toBeGreaterThan(0);
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

    test('calculateOutputQuality uses cooking skill when crafting at an oven', () => {
        const ovenBuilding = { type: BUILDING_TYPES.OVEN };
        settler.currentTask = new Task(TASK_TYPES.CRAFT, 0, 0, null, 0, 3, ovenBuilding);
        settler.skills.cooking = 3;
        expect(settler.calculateOutputQuality(1)).toBeCloseTo(1.2);
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

        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const craftedPile = settler.map.addResourcePile.mock.calls[0][0];
        expect(craftedPile.type).toBe("plank");
        expect(craftedPile.quantity).toBe(1);
        expect(craftedPile.quality).toBeCloseTo(1.1);
        expect(mockResourceManager.addResource).not.toHaveBeenCalled();
        expect(settler.currentTask).toBe(null);
    });

    test('should handle dig_dirt task', () => {
        const task = new Task(TASK_TYPES.DIG_DIRT, 1, 1, 'dirt', 50);
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
        const task = new Task(TASK_TYPES.SOW_CROP, 1, 1, null, 0, 3, mockFarmPlot, null, 'wheat');
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockFarmPlot.plant).toHaveBeenCalledWith('wheat');
        expect(settler.currentTask).toBe(null);
    });

    test('should handle sow_crop task with cotton', () => {
        const mockFarmPlot = {
            plant: jest.fn().mockReturnValue(true)
        };
        const task = new Task(TASK_TYPES.SOW_CROP, 1, 1, null, 0, 3, mockFarmPlot, null, 'cotton');
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000);
        expect(mockFarmPlot.plant).toHaveBeenCalledWith('cotton');
        expect(settler.currentTask).toBe(null);
    });

    test('should handle harvest_crop task', () => {
        const mockFarmPlot = {
            harvest: jest.fn().mockReturnValue('wheat')
        };
        const task = new Task(TASK_TYPES.HARVEST_CROP, 1, 1, null, 0, 3, mockFarmPlot);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockFarmPlot.harvest).toHaveBeenCalled();
        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const addedPile = settler.map.addResourcePile.mock.calls[0][0];
        expect(addedPile.type).toBe('wheat');
        expect(addedPile.quantity).toBe(1);
        expect(settler.currentTask).toBe(null);
    });

    test('should handle tend_animals task', () => {
        const mockAnimalPen = {};
        const task = new Task(TASK_TYPES.TEND_ANIMALS, 1, 1, null, 0, 3, mockAnimalPen);
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(settler.currentTask).toBe(null);
    });

    test('should handle hunt_animal task targeting enemy', () => {
        const mockEnemy = { x: 1, y: 1, isDead: false, name: 'Deer' };
        const task = new Task(
            TASK_TYPES.HUNT_ANIMAL,
            1,
            1,
            'meat',
            0.2,
            2,
            null,
            null,
            null,
            null,
            null,
            null,
            mockEnemy
        );
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        for (let i = 0; i < 5; i++) {
            settler.updateNeeds(1000);
        }

        expect(mockEnemy.isDead).toBe(true);
        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const meatPile = settler.map.addResourcePile.mock.calls[0][0];
        expect(meatPile.type).toBe('meat');
        expect(meatPile.quantity).toBe(1);
        expect(settler.currentTask).toBe(null);
    });

    test('should handle explore task', () => {
        const mockLocation = { id: 'forest_outpost', name: 'Forest Outpost' };
        settler.map.worldMap = { discoverLocation: jest.fn() }; // Mock worldMap
        const task = new Task(TASK_TYPES.EXPLORE, 1, 1, null, 0, 5, null, null, null, mockLocation);
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
            addResourceToStorage: jest.fn().mockReturnValue(true),
            findStorageRoomAndTile: jest.fn().mockReturnValue({ room: { type: 'storage', tiles: [{ x: 1, y: 1 }] }, tile: { x: 1, y: 1 } })
        };
        settler.roomManager = mockRoomManager; // Assign mock roomManager
        settler.carrying = { type: 'wood', quantity: 1 };
        const task = { type: 'haul', targetX: 1, targetY: 1, resource: settler.carrying };
        settler.currentTask = task;
        settler.x = 1;
        settler.y = 1;

        settler.updateNeeds(1000); // Simulate enough time for task to complete
        expect(mockRoomManager.getRoomAt).toHaveBeenCalledWith(1, 1);
        expect(mockRoomManager.addResourceToStorage).toHaveBeenCalledWith(
            { type: 'storage' },
            'wood',
            1,
            undefined
        );
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });

    test('should haul pile from ground to storage', () => {
        mockMap.resourcePiles.push(new ResourcePile('wood', 1, 0, 0, 1, { getSprite: jest.fn() }));
        mockRoomManager.findStorageRoomAndTile.mockReturnValue({ room: { type: 'storage', tiles: [{ x: 1, y: 1 }], storage: {} }, tile: { x: 1, y: 1 } });
        mockRoomManager.getRoomAt.mockReturnValue({ type: 'storage', tiles: [{ x: 1, y: 1 }], storage: {} });
        mockRoomManager.addResourceToStorage.mockReturnValue(true);

        const task = new Task(TASK_TYPES.HAUL, 0, 0, 'wood', 1, 2, null, null, null, null, null, null, null, 0, 0);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        settler.updateNeeds(1000); // pick up pile
        expect(settler.carrying).toEqual({
            type: 'wood',
            quantity: 1,
            hungerRestoration: 0
        });
        expect(settler.currentTask.targetX).toBe(1);
        expect(settler.currentTask.targetY).toBe(1);

        settler.x = 1;
        settler.y = 1;
        settler.updateNeeds(1000); // deposit
        expect(mockRoomManager.addResourceToStorage).toHaveBeenCalled();
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });

    test('should eat from storage when seeking_food', () => {
        const storageRoom = { id: 1, type: 'storage', tiles: [{ x: 0, y: 0 }], storage: { berries: 1 } };
        mockRoomManager.rooms = [storageRoom];
        mockRoomManager.getRoomAt = jest.fn().mockReturnValue(storageRoom);
        mockRoomManager.removeResourceFromStorage = jest.fn((room, type, qty) => {
            room.storage[type] -= qty;
            return { type, quantity: qty, hungerRestoration: FOOD_HUNGER_VALUES[type] };
        });
        settler.hunger = 10;

        settler.updateNeeds(1000);

        expect(mockRoomManager.removeResourceFromStorage).toHaveBeenCalledWith(storageRoom, 'berries', 1);
        expect(settler.state).toBe('idle');
        const expectedHunger = 10 - 0.01 + FOOD_HUNGER_VALUES[RESOURCE_TYPES.BERRIES];
        expect(settler.hunger).toBeCloseTo(expectedHunger, 2);
    });

    test('settlers prefer meals based on hunger value', () => {
        const storageRoom = { id: 1, type: 'storage', tiles: [{ x: 0, y: 0 }], storage: { meal: 1 } };
        const mealPile = new ResourcePile(RESOURCE_TYPES.MEAL, 1, 0, 0, 1, { getSprite: jest.fn() });
        mealPile.hungerRestoration = 50;
        mockMap.resourcePiles.push(mealPile);
        mockRoomManager.rooms = [storageRoom];
        mockRoomManager.getRoomAt = jest.fn().mockReturnValue(storageRoom);
        mockRoomManager.removeResourceFromStorage = jest.fn((room, type, qty) => {
            room.storage[type] -= qty;
            mealPile.remove(1);
            return { type, quantity: qty, hungerRestoration: mealPile.hungerRestoration };
        });
        settler.hunger = 10;

        settler.updateNeeds(1000);

        expect(mockRoomManager.removeResourceFromStorage).toHaveBeenCalledWith(storageRoom, 'meal', 1);
        expect(settler.state).toBe('idle');
        const expected = 10 - 0.01 + 50;
        expect(settler.hunger).toBeCloseTo(expected, 2);
    });

    test('should butcher dead enemy', () => {
        const mockEnemy = { id: 1, name: 'Goblin', isButchered: false, isMarkedForButcher: true };
        const task = new Task(TASK_TYPES.BUTCHER, 0, 0, 'meat', 0.2, 2, null, null, null, null, null, null, mockEnemy);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        for (let i = 0; i < 10; i++) {
            settler.updateNeeds(1000);
        }

        expect(mockEnemy.isButchered).toBe(true);
        expect(mockEnemy.isMarkedForButcher).toBe(false);
        expect(settler.map.addResourcePile).toHaveBeenCalled();
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });

    test('should not butcher enemy decayed over 50%', () => {
        const mockEnemy = { id: 2, name: 'Goblin', decay: 60, isButchered: false, isMarkedForButcher: true };
        const task = new Task('butcher', 0, 0, 'meat', 0.2, 2, null, null, null, null, null, null, mockEnemy);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        for (let i = 0; i < 10; i++) {
            settler.updateNeeds(1000);
        }

        expect(mockEnemy.isButchered).toBe(false);
        expect(mockEnemy.isMarkedForButcher).toBe(false);
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });

    test('should drop carried resource if no storage room found', () => {
        settler.roomManager.rooms = [];
        settler.carrying = { type: 'wood', quantity: 2 };
        settler.x = 0;
        settler.y = 0;

        settler.updateNeeds(1000);

        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const droppedPile = settler.map.addResourcePile.mock.calls[0][0];
        expect(droppedPile.type).toBe('wood');
        expect(droppedPile.quantity).toBe(2);
        expect(settler.carrying).toBe(null);
    });

    test('should drop current pile when picking up new one', () => {
        settler.carrying = { type: 'wood', quantity: 1 };
        settler.x = 1;
        settler.y = 1;

        settler.pickUpPile('stone', 1);

        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const dropped = settler.map.addResourcePile.mock.calls[0][0];
        expect(dropped.type).toBe('wood');
        expect(dropped.quantity).toBe(1);
        expect(settler.carrying).toEqual({
            type: 'stone',
            quantity: 1,
            hungerRestoration: FOOD_HUNGER_VALUES[RESOURCE_TYPES.STONE] ?? 0
        });
    });

    test('should drop carried resource when hauling priority is 0', () => {
        settler.carrying = { type: 'wood', quantity: 2 };
        settler.taskPriorities[TASK_TYPES.HAUL] = 0;
        settler.x = 0;
        settler.y = 0;

        settler.updateNeeds(1000);

        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const dropped = settler.map.addResourcePile.mock.calls[0][0];
        expect(dropped.type).toBe('wood');
        expect(dropped.quantity).toBe(2);
        expect(settler.carrying).toBe(null);
        expect(settler.state).toBe('idle');
    });

    test('should use bandage pile for treatment', () => {
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        const patient = new Settler('Patient', 0, 0, mockResourceManager, mockMap, mockRoomManager, undefined, undefined, defaultSkills);
        patient.bodyParts.head.bleeding = true;
        mockMap.resourcePiles.push(new ResourcePile('bandage', 1, 0, 0, 1, { getSprite: jest.fn() }));
        const task = new Task('treatment', 0, 0, null, 0, 5, null, null, null, null, null, patient);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        settler.updateNeeds(1000);

        expect(patient.needsTreatment()).toBe(false);
        expect(mockResourceManager.removeResource).not.toHaveBeenCalled();
        expect(mockMap.resourcePiles.length).toBe(0);
        expect(settler.carrying).toBe(null);
        expect(settler.currentTask).toBe(null);
    });

    test('should haul bandage to patient before treatment', () => {
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        const patient = new Settler('Patient', 0, 0, mockResourceManager, mockMap, mockRoomManager, undefined, undefined, defaultSkills);
        patient.bodyParts.head.bleeding = true;
        mockMap.resourcePiles.push(new ResourcePile('bandage', 1, 1, 0, 1, { getSprite: jest.fn() }));
        const task = new Task('treatment', 0, 0, null, 0, 5, null, null, null, null, null, patient);
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        // First update - move towards bandage pile
        settler.updateNeeds(1000);
        expect(settler.currentTask.stage).toBe('pickup');
        expect(settler.currentTask.targetX).toBe(1);

        // Arrive at pile and pick up bandage
        settler.x = 1;
        settler.updateNeeds(1000);
        expect(settler.carrying).toEqual({
            type: 'bandage',
            quantity: 1,
            hungerRestoration: FOOD_HUNGER_VALUES[RESOURCE_TYPES.BANDAGE] ?? 0
        });
        expect(settler.currentTask.stage).toBe('treat');
        expect(settler.currentTask.targetX).toBe(0);

        // Return to patient and treat
        settler.x = 0;
        settler.updateNeeds(1000);
        expect(patient.needsTreatment()).toBe(false);
        expect(settler.carrying).toBe(null);
        expect(mockMap.resourcePiles.length).toBe(0);
        expect(settler.currentTask).toBe(null);
    });

    test('settler can treat themselves', () => {
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        const patient = new Settler('SelfHealer', 0, 0, mockResourceManager, mockMap, mockRoomManager, undefined, undefined, defaultSkills);
        patient.bodyParts.head.bleeding = true;
        mockMap.resourcePiles.push(new ResourcePile('bandage', 1, 0, 0, 1, { getSprite: jest.fn() }));
        const task = new Task('treatment', 0, 0, null, 0, 5, null, null, null, null, null, patient);
        patient.currentTask = task;
        patient.x = 0;
        patient.y = 0;

        patient.updateNeeds(1000);

        expect(patient.needsTreatment()).toBe(false);
        expect(mockMap.resourcePiles.length).toBe(0);
        expect(patient.currentTask).toBe(null);
    });

    test('seeking_sleep finds a bed and assigns sleep task', () => {
        const bed = { type: BUILDING_TYPES.BED, x: 1, y: 1, occupant: null };
        mockMap.buildings = [bed];
        settler.sleep = 10;

        settler.updateNeeds(1000);

        expect(settler.currentTask.type).toBe('sleep');
        expect(settler.currentTask.bed).toBe(bed);
    });

    test('settler wakes up when attacked above 20 sleep', () => {
        settler.isSleeping = true;
        settler.sleep = 25;
        settler.sleepingInBed = false;
        const enemy = {};

        settler.takeDamage('head', 5, false, enemy);

        expect(settler.isSleeping).toBe(false);
        expect(settler.state).toBe('combat');
    });

    test('prepare_meal task consumes ingredients and creates meal pile', () => {
        const oven = {
            buildProgress: 100,
            x: 0,
            y: 0,
            inventory: { meat: 1, bread: 1 },
            getResourceQuantity(type) { return this.inventory[type] || 0; },
            removeFromInventory(type, qty) {
                if ((this.inventory[type] || 0) >= qty) {
                    this.inventory[type] -= qty;
                    return true;
                }
                return false;
            }
        };
        settler.spriteManager = { getSprite: jest.fn() };
        const task = new Task(TASK_TYPES.PREPARE_MEAL, 0, 0, null, 0, 2, oven);
        task.ingredients = ['meat', 'bread'];
        task.hungerValue = 50;
        settler.currentTask = task;
        settler.x = 0;
        settler.y = 0;

        settler.updateNeeds(1000);
        settler.updateNeeds(1100);

        expect(settler.map.addResourcePile).toHaveBeenCalled();
        const mealPile = settler.map.addResourcePile.mock.calls[0][0];
        expect(mealPile.type).toBe(RESOURCE_TYPES.MEAL);
        expect(mealPile.hungerRestoration).toBe(50);
        expect(oven.inventory.meat).toBe(0);
        expect(oven.inventory.bread).toBe(0);
    });

    test('health regenerates based on hunger level', () => {
        settler.bodyParts.head.health = 50;
        settler.hunger = 100;
        settler.updateNeeds(1000);
        const expectedHigh = 50 + ((settler.hunger) / 100) * HEALTH_REGEN_RATE;
        expect(settler.bodyParts.head.health).toBeCloseTo(expectedHigh, 5);

        settler.bodyParts.head.health = 50;
        settler.hunger = 50;
        settler.updateNeeds(1000);
        const expectedLow = 50 + ((settler.hunger) / 100) * HEALTH_REGEN_RATE;
        expect(settler.bodyParts.head.health).toBeCloseTo(expectedLow, 5);
    });
});
