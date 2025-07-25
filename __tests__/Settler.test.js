import Settler from '../src/js/settler.js';

describe('Settler', () => {
    let settler;

    beforeEach(() => {
        settler = new Settler('TestSettler', 0, 0);
    });

    test('should initialize with correct properties', () => {
        expect(settler.name).toBe('TestSettler');
        expect(settler.x).toBe(0);
        expect(settler.y).toBe(0);
        expect(settler.health).toBe(100);
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
            combat: 1
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
});