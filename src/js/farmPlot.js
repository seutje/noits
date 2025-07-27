import Building from './building.js';
import SpriteManager from './spriteManager.js';
import { RESOURCE_TYPES, BUILDING_TYPES } from './constants.js';

export default class FarmPlot extends Building {
    constructor(x, y, spriteManager) {
        // Farm plots require no construction materials
        super(BUILDING_TYPES.FARM_PLOT, x, y, 1, 1, null, 0, 0);
        this.drawBase = false;
        this.crop = null; // What is planted (e.g., 'wheat')
        this.growthStage = 0; // 0: empty, 1: planted, 2: growing, 3: mature
        this.growthRate = 0.01; // How fast it grows per game tick
        this.spriteManager = spriteManager;
        this.farmPlotSprite = spriteManager.getSprite('farm_plot');
        this.autoSow = false;
        this.autoHarvest = false;
        this.desiredCrop = RESOURCE_TYPES.WHEAT;
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
        if (this.growthStage >= 1 && this.growthStage < 3) {
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
        super.render(ctx, tileSize); // Render the base building (dirt tile or construction progress)

        if (this.buildProgress === 100 && this.farmPlotSprite) {
            ctx.drawImage(this.farmPlotSprite, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        }

        // Render crop based on growth stage
        if (this.crop) {
            let spriteName;
            const currentGrowthStage = Math.floor(this.growthStage);
            if (this.crop === RESOURCE_TYPES.WHEAT) {
                if (currentGrowthStage === 1) {
                    spriteName = 'wheat_1';
                } else if (currentGrowthStage === 2) {
                    spriteName = 'wheat_2';
                } else if (currentGrowthStage >= 3) {
                    spriteName = 'wheat_3';
                }
            } else if (this.crop === RESOURCE_TYPES.COTTON) {
                if (currentGrowthStage === 1) {
                    spriteName = 'cotton_1';
                } else if (currentGrowthStage === 2) {
                    spriteName = 'cotton_2';
                } else if (currentGrowthStage >= 3) {
                    spriteName = 'cotton_3';
                }
            }

            if (spriteName) {
                const sprite = this.spriteManager.getSprite(spriteName);
                if (sprite) {
                    ctx.drawImage(sprite, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}