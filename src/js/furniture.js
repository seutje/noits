import Building from './building.js';

export default class Furniture extends Building {
    constructor(type, x, y, width, height, material, health) {
        super(type, x, y, width, height, material, health);
        this.isFurniture = true;
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);
        // Additional rendering for furniture if needed
        ctx.fillStyle = 'rgba(139, 69, 19, 0.7)'; // Brown for furniture
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.type, this.x * tileSize + 5, this.y * tileSize + 15);
    }
}