import Well from '../src/js/well.js';
import SpriteManager from '../src/js/spriteManager.js';
import { BUILDING_TYPES, RESOURCE_TYPES } from '../src/js/constants.js';

describe('Well', () => {
    test('initializes with correct properties and recipe', () => {
        const well = new Well(0, 0, new SpriteManager());
        expect(well.type).toBe(BUILDING_TYPES.WELL);
        expect(well.constructionMaterials[RESOURCE_TYPES.PLANK]).toBe(1);
        expect(well.constructionMaterials[RESOURCE_TYPES.STONE]).toBe(1);
        expect(well.constructionMaterials[RESOURCE_TYPES.BUCKET]).toBe(1);
        expect(well.recipes[0].outputs[0].resourceType).toBe(RESOURCE_TYPES.BUCKET_WATER);
    });
});
