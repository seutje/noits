
import Resource from './resource.js';

export default class ResourcePile extends Resource {
    constructor(type, quantity, x, y, tileSize, quality = 1) {
        super(type, quantity, quality);
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
    }

    render(ctx) {
        ctx.fillStyle = 'brown'; // Placeholder color for wood piles
        ctx.fillRect(this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        ctx.fillStyle = 'white';
        ctx.fillText(this.quantity, this.x * this.tileSize + 5, this.y * this.tileSize + this.tileSize / 2);
    }

    serialize() {
        return {
            type: this.type,
            quantity: this.quantity,
            quality: this.quality,
            x: this.x,
            y: this.y,
            tileSize: this.tileSize
        };
    }

    deserialize(data) {
        this.type = data.type;
        this.quantity = data.quantity;
        this.quality = data.quality;
        this.x = data.x;
        this.y = data.y;
        this.tileSize = data.tileSize;
    }
