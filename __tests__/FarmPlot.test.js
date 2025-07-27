import FarmPlot from '../src/js/farmPlot.js';
import SpriteManager from '../src/js/spriteManager.js';

describe('FarmPlot', () => {
    let farm;
    beforeEach(() => {
        farm = new FarmPlot(0, 0, new SpriteManager());
    });

    test('plant sets crop and stage', () => {
        expect(farm.plant('wheat')).toBe(true);
        expect(farm.crop).toBe('wheat');
        expect(farm.growthStage).toBe(1);
        expect(farm.plant('wheat')).toBe(false);
    });

    test('plant cotton sets crop and stage', () => {
        farm = new FarmPlot(0, 0, new SpriteManager());
        expect(farm.plant('cotton')).toBe(true);
        expect(farm.crop).toBe('cotton');
        expect(farm.growthStage).toBe(1);
    });

    test('update advances growth and matures', () => {
        farm.plant('wheat');
        farm.update(1000); // 1 second -> growthRate 0.01
        expect(farm.growthStage).toBeGreaterThan(1);
        farm.update(300000); // large delta to reach maturity
        expect(farm.growthStage).toBe(3);
    });

    test('harvest returns crop only when mature', () => {
        farm.plant('wheat');
        expect(farm.harvest()).toBeNull();
        farm.growthStage = 3;
        expect(farm.harvest()).toBe('wheat');
        expect(farm.crop).toBeNull();
        expect(farm.growthStage).toBe(0);
    });
});
