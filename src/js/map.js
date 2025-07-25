
export default class Map {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = this.createEmptyMap();
    }

    createEmptyMap() {
        const tiles = [];
        for (let y = 0; y < this.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                tiles[y][x] = Math.random() > 0.8 ? 1 : 0; // 0 for grass, 1 for dirt
            }
        }
        return tiles;
    }

    render(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (tile === 0) {
                    ctx.fillStyle = '#2c9f45'; // Green for grass
                } else {
                    ctx.fillStyle = '#8b4513'; // Brown for dirt
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
}
