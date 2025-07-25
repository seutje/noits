import Building from './building.js';

export default class CraftingStation extends Building {
    constructor(x, y) {
        super("crafting_station", x, y, 1, 1, "wood", 0);
        this.recipes = []; // List of recipes this station can craft
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
        ctx.fillStyle = "purple"; // Example color for crafting station
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }
}