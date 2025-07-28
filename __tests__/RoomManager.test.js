import Map from '../src/js/map.js';
import RoomManager from '../src/js/roomManager.js';
import ResourcePile from '../src/js/resourcePile.js';
import TaskManager from '../src/js/taskManager.js';
import { TASK_TYPES, RESOURCE_TYPES, FOOD_HUNGER_VALUES } from '../src/js/constants.js';

describe('RoomManager storage rules', () => {
    test('should not allow multiple piles on the same storage tile', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const taskManager = new TaskManager();
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32, taskManager);
        const room = roomManager.designateRoom(0, 0, 0, 0, 'storage');
        expect(room).not.toBeNull();

        // First pile should be added
        expect(roomManager.addResourceToStorage(room, 'wood', 5)).toBe(true);
        expect(map.resourcePiles.length).toBe(1);

        // Attempt to add a different resource on the same tile
        expect(roomManager.addResourceToStorage(room, 'stone', 5)).toBe(false);
        expect(map.resourcePiles.length).toBe(1);
        expect(map.resourcePiles[0].type).toBe('wood');
    });

    test('designating storage creates haul tasks for existing piles', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const taskManager = new TaskManager();
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32, taskManager);

        map.addResourcePile(new ResourcePile('wood', 5, 2, 2, 32, { getSprite: jest.fn() }));

        roomManager.designateRoom(3, 3, 3, 3, 'storage');

        expect(taskManager.tasks.length).toBe(1);
        expect(taskManager.tasks[0].type).toBe(TASK_TYPES.HAUL);
        expect(taskManager.tasks[0].sourceX).toBe(2);
        expect(taskManager.tasks[0].sourceY).toBe(2);
        expect(taskManager.tasks[0].targetX).toBe(2); // initial target is pile
        expect(taskManager.tasks[0].targetY).toBe(2);
    });

    test('piles already in storage do not create haul tasks', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const taskManager = new TaskManager();
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32, taskManager);

        map.addResourcePile(new ResourcePile('wood', 5, 1, 1, 32, { getSprite: jest.fn() }));

        roomManager.designateRoom(1, 1, 1, 1, 'storage');

        expect(taskManager.tasks.length).toBe(0);
    });

    test('does not create duplicate haul tasks when settler already hauling', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const taskManager = new TaskManager();
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32, taskManager);
        const settlers = [{ currentTask: { type: TASK_TYPES.HAUL, sourceX: 2, sourceY: 2, resourceType: 'wood' } }];
        roomManager.setSettlers(settlers);

        map.addResourcePile(new ResourcePile('wood', 5, 2, 2, 32, { getSprite: jest.fn() }));

        roomManager.assignHaulingTasksForDroppedPiles(settlers);

        expect(taskManager.tasks.length).toBe(0);
    });

    test('findHighestValueFoods returns top foods excluding meals', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32);
        const room = roomManager.designateRoom(0, 0, 1, 1, 'storage');
        room.storage[RESOURCE_TYPES.BERRIES] = 1; // value 10
        room.storage[RESOURCE_TYPES.MEAT] = 1; // value 30
        room.storage[RESOURCE_TYPES.BREAD] = 1; // value 20
        room.storage[RESOURCE_TYPES.MEAL] = 1; // should be ignored

        const foods = roomManager.findHighestValueFoods(2);
        expect(foods.length).toBe(2);
        expect(foods[0].type).toBe(RESOURCE_TYPES.MEAT);
        expect(foods[1].type).toBe(RESOURCE_TYPES.BREAD);
    });

    test('findHighestValueFoods returns duplicates when quantity allows', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32);
        const room = roomManager.designateRoom(0, 0, 1, 1, 'storage');
        room.storage[RESOURCE_TYPES.MEAT] = 2;

        const foods = roomManager.findHighestValueFoods(2);
        expect(foods.length).toBe(2);
        expect(foods[0].type).toBe(RESOURCE_TYPES.MEAT);
        expect(foods[1].type).toBe(RESOURCE_TYPES.MEAT);
    });

    test('removeResourceFromStorage reduces piles and counts', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32);
        const room = roomManager.designateRoom(0, 0, 0, 0, 'storage');
        roomManager.addResourceToStorage(room, RESOURCE_TYPES.BREAD, 2);

        const removed = roomManager.removeResourceFromStorage(room, RESOURCE_TYPES.BREAD, 2);
        expect(removed).toBe(true);
        expect(room.storage[RESOURCE_TYPES.BREAD]).toBe(0);
        expect(map.resourcePiles.length).toBe(0);
    });
});
