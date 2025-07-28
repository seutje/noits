import Well from '../src/js/well.js';
import Recipe from '../src/js/recipe.js';
import SpriteManager from '../src/js/spriteManager.js';
import { BUILDING_TYPES, RESOURCE_TYPES } from '../src/js/constants.js';

jest.mock('../src/js/recipe.js');

describe('Well', () => {
    let well;

    beforeEach(() => {
        well = new Well(0, 0, new SpriteManager());
    });

    test('should initialize with water recipe', () => {
        expect(well.type).toBe(BUILDING_TYPES.WELL);
        expect(well.recipes).toEqual([expect.any(Recipe)]);
        expect(well.material).toBe(RESOURCE_TYPES.STONE);
        expect(well.resourcesRequired).toBe(1);
    });
});
