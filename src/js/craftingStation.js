import Building from './building.js';
import Recipe from './recipe.js';
import { RESOURCE_TYPES, BUILDING_TYPES } from './constants.js';

export default class CraftingStation extends Building {
    constructor(x, y, spriteManager = null) {
        super(BUILDING_TYPES.CRAFTING_STATION, x, y, 1, 1, RESOURCE_TYPES.WOOD, 0);
        this.drawBase = false;
        this.spriteManager = spriteManager;
        this.stationSprite = spriteManager ? spriteManager.getSprite(BUILDING_TYPES.CRAFTING_STATION) : null;
        this.recipes = []; // List of recipes this station can craft
        this.autoCraft = false;
        this.desiredRecipe = null;

        // Default recipe: Bandage from cotton
        this.addRecipe(
            new Recipe(
                "bandage",
                [{ resourceType: RESOURCE_TYPES.COTTON, quantity: 1 }],
                [
                    {
                        resourceType: RESOURCE_TYPES.BANDAGE,
                        quantity: 1,
                        quality: 1,
                    },
                ],
                3,
            ),
        );
    }

    addRecipe(recipe) {
        this.recipes.push(recipe);
    }

    // Crafting logic will be implemented later
    craft(recipeName, resourceManager) {
        // Placeholder for crafting logic
        console.log(`Crafting ${recipeName} at ${this.type} station.`);
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);

        if (this.buildProgress === 100 && this.stationSprite) {
            ctx.drawImage(this.stationSprite, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        } else {
            ctx.fillStyle = "purple"; // Example color for crafting station
            ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
            ctx.strokeStyle = "black";
            ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        }
    }
}