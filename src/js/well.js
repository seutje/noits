import CraftingStation from './craftingStation.js';
import Recipe from './recipe.js';
import { BUILDING_TYPES, RESOURCE_TYPES, BUILDING_TYPE_PROPERTIES } from './constants.js';

export default class Well extends CraftingStation {
    constructor(x, y, spriteManager = null) {
        const materials = {
            [RESOURCE_TYPES.PLANK]: 1,
            [RESOURCE_TYPES.STONE]: 1,
            [RESOURCE_TYPES.BUCKET]: 1,
        };
        super(x, y, spriteManager, materials);
        this.type = BUILDING_TYPES.WELL;
        this.material = RESOURCE_TYPES.PLANK;
        this.constructionMaterials = materials;
        this.resourcesRequired = Object.values(materials).reduce((a, b) => a + b, 0);
        this.resourcesDelivered = 0;
        this.passable = BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;
        this.stationSprite = spriteManager ? spriteManager.getSprite(BUILDING_TYPES.WELL) : null;
        this.recipes = [];
        this.autoCraft = false;
        this.desiredRecipe = null;
        this.drawBase = false;
        this.addRecipe(
            new Recipe(
                'Water bucket',
                [{ resourceType: RESOURCE_TYPES.BUCKET, quantity: 1 }],
                [{ resourceType: RESOURCE_TYPES.BUCKET_WATER, quantity: 1, quality: 1 }],
                1,
            ),
        );
    }
}
