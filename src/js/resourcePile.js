
import Resource from './resource.js';

export default class ResourcePile extends Resource {
    constructor(type, quantity, x, y, tileSize, spriteManager, quality = 1) {
        super(type, quantity, quality);
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.spriteManager = spriteManager;
    }

    render(ctx) {
        const woodSprite = this.spriteManager.getSprite('wood');
        const stonePileSprite = this.spriteManager.getSprite('stone_pile');
        const berriesSprite = this.spriteManager.getSprite('berries');
        const meatSprite = this.spriteManager.getSprite('meat');
        const mushroomsSprite = this.spriteManager.getSprite('mushrooms');
        if (this.type === 'wood' && woodSprite) {
            ctx.drawImage(woodSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === 'stone' && stonePileSprite) {
            ctx.drawImage(stonePileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === 'berries' && berriesSprite) {
            ctx.drawImage(berriesSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === 'meat' && meatSprite) {
            ctx.drawImage(meatSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === 'mushrooms' && mushroomsSprite) {
            ctx.drawImage(mushroomsSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        }
        else {
            ctx.fillStyle = 'brown'; // Placeholder color for wood piles
            ctx.fillRect(this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        }
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
}
