import Building from './building.js';

export default class Furniture extends Building {
    constructor(type, x, y, width, height, material, health, spriteManager = null) {
        super(type, x, y, width, height, material, health);
        this.spriteManager = spriteManager;
        this.sprite = spriteManager ? spriteManager.getSprite(type) : null;
        this.isFurniture = true;
        if (type === 'bed') {
            this.occupant = null; // Settler currently using the bed
        }
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);

        if (this.buildProgress === 100 && this.sprite) {
            ctx.drawImage(this.sprite, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
        } else {
            // Additional rendering for furniture if needed
            ctx.fillStyle = 'rgba(139, 69, 19, 0.7)'; // Brown for furniture
            ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(this.type, this.x * tileSize + 5, this.y * tileSize + 15);
        }
    }
}