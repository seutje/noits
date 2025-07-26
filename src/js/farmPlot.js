import Building from './building.js';

export default class FarmPlot extends Building {
    constructor(x, y) {
        super('farm_plot', x, y, 1, 1, null, 100); // Farm plots are built on dirt, 100 health
        this.crop = null; // What is planted (e.g., 'wheat')
        this.growthStage = 0; // 0: empty, 1: planted, 2: growing, 3: mature
        this.growthRate = 0.01; // How fast it grows per game tick
    }

    plant(cropType) {
        if (this.crop === null) {
            this.crop = cropType;
            this.growthStage = 1; // Planted
            console.log(`Farm plot at ${this.x},${this.y} planted with ${cropType}`);
            return true;
        }
        return false; // Already planted
    }

    update(deltaTime) {
        if (this.growthStage > 1 && this.growthStage < 3) {
            this.growthStage += this.growthRate * (deltaTime / 1000);
            if (this.growthStage >= 3) {
                this.growthStage = 3; // Mature
                console.log(`Farm plot at ${this.x},${this.y} has mature ${this.crop}`);
            }
        }
    }

    harvest() {
        if (this.growthStage === 3) {
            const harvestedCrop = this.crop;
            this.crop = null;
            this.growthStage = 0;
            console.log(`Farm plot at ${this.x},${this.y} harvested ${harvestedCrop}`);
            return harvestedCrop; // Return the harvested crop type
        }
        return null; // Not ready to harvest
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize); // Render the base building (dirt tile)

        // Render crop based on growth stage
        if (this.crop) {
            let color;
            switch (Math.floor(this.growthStage)) {
                case 1: // Planted
                    color = 'brown'; // Small sprout
                    break;
                case 2: // Growing
                    color = 'lightgreen'; // Growing plant
                    break;
                case 3: // Mature
                    color = 'gold'; // Ready to harvest
                    break;
                default:
                    color = 'transparent';
            }
            ctx.fillStyle = color;
            ctx.fillRect(this.x * tileSize + tileSize / 4, this.y * tileSize + tileSize / 4, tileSize / 2, tileSize / 2);
        }
    }
}