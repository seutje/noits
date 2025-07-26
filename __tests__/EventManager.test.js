import EventManager from '../src/js/eventManager.js';

// Simple Enemy stub
class EnemyStub {
    constructor(name, x, y, target) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.target = target;
    }
}

describe('EventManager', () => {
    let game;
    beforeEach(() => {
        game = {
            settlers: [{ name: 'Alice', x: 1, y: 1, takeDamage: jest.fn() }],
            enemies: [],
            map: { buildings: [] },
            resourceManager: { addResource: jest.fn() },
            notificationManager: { addNotification: jest.fn() }
        };
    });

    test('update triggers random event when interval reached', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(manager, 'triggerRandomEvent').mockImplementation(() => {});
        manager.update(61000); // exceed eventInterval of 60s
        expect(manager.triggerRandomEvent).toHaveBeenCalled();
    });

    test('Wild Animal Attack spawns enemy and adds notification', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(Math, 'random').mockReturnValue(0); // always pick first options
        manager.triggerRandomEvent();
        Math.random.mockRestore();
        expect(game.enemies.length).toBe(1);
        expect(game.enemies[0]).toBeInstanceOf(EnemyStub);
        expect(game.notificationManager.addNotification).toHaveBeenCalledWith(
            'A wild animal is attacking your colony!',
            'warning'
        );
    });

    test('Resource Discovery adds resource and notification', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.5) // pick second event
            .mockReturnValueOnce(0)    // pick resource index 0 -> wood
            .mockReturnValueOnce(0);    // quantity -> 20
        manager.triggerRandomEvent();
        Math.random.mockRestore();
        expect(game.resourceManager.addResource).toHaveBeenCalledWith('wood', 20);
        expect(game.notificationManager.addNotification).toHaveBeenCalledWith(
            'You discovered a new resource node!',
            'info'
        );
    });
});
