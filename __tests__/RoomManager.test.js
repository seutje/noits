import Map from '../src/js/map.js';
import RoomManager from '../src/js/roomManager.js';
import ResourcePile from '../src/js/resourcePile.js';

describe('RoomManager storage rules', () => {
    test('should not allow multiple piles on the same storage tile', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const roomManager = new RoomManager(map, { getSprite: jest.fn() }, 32);
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
});
