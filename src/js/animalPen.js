import Building from './building.js';
import { RESOURCE_TYPES } from './constants.js';

export default class AnimalPen extends Building {
    constructor(x, y) {
        super('animal_pen', x, y, 2, 2, RESOURCE_TYPES.WOOD, 100); // Animal pens are 2x2, built with wood, 100 health
        this.animals = []; // Array to hold animals
        this.maxAnimals = 5; // Max animals the pen can hold
    }

    addAnimal(animalType) {
        if (this.animals.length < this.maxAnimals) {
            this.animals.push(animalType);
            console.log(`Added ${animalType} to pen at ${this.x},${this.y}`);
            return true;
        }
        console.log(`Animal pen at ${this.x},${this.y} is full.`);
        return false;
    }

    removeAnimal(animalType) {
        const index = this.animals.indexOf(animalType);
        if (index > -1) {
            this.animals.splice(index, 1);
            console.log(`Removed ${animalType} from pen at ${this.x},${this.y}`);
            return true;
        }
        return false;
    }

    update(deltaTime) {
        // Future: animals can grow, reproduce, consume food, etc.
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);

        // Render a simple representation of animals inside the pen
        if (this.animals.length > 0) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`${this.animals.length} animals`, this.x * tileSize + 5, this.y * tileSize + tileSize - 5);
        }
    }
}