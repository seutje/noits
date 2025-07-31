import { debugLog } from './debug.js';
import Building from './building.js';
import Recipe from './recipe.js';
import { RESOURCE_TYPES, BUILDING_TYPES, CRAFTING_RECIPE_DEFINITIONS } from './constants.js';

export default class CraftingStation extends Building {
    constructor(x, y, spriteManager = null, constructionMaterials = null) {
        super(
            BUILDING_TYPES.CRAFTING_STATION,
            x,
            y,
            1,
            1,
            RESOURCE_TYPES.WOOD,
            0,
            1,
            constructionMaterials,
        );
        this.drawBase = false;
        this.spriteManager = spriteManager;
        this.stationSprite = spriteManager ? spriteManager.getSprite(BUILDING_TYPES.CRAFTING_STATION) : null;
        this.recipes = CRAFTING_RECIPE_DEFINITIONS[BUILDING_TYPES.CRAFTING_STATION].map(
            (def) => new Recipe(def.name, def.inputs, def.outputs, def.time),
        );
        this.autoCraft = false;
        this.desiredRecipe = null;
    }

    addRecipe(recipe) {
        this.recipes.push(recipe);
    }

    // Crafting logic will be implemented later
    craft(recipeName, resourceManager) {
        // Placeholder for crafting logic
        debugLog(`Crafting ${recipeName} at ${this.type} station.`);
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);

        if (this.buildProgress < 100) {
            return; // Construction sprite already drawn by Building.render
        }

        if (this.stationSprite) {
            ctx.drawImage(
                this.stationSprite,
                this.x * tileSize,
                this.y * tileSize,
                tileSize,
                tileSize,
            );
        } else {
            ctx.fillStyle = "purple"; // Example color for crafting station
            ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        }
    }
}