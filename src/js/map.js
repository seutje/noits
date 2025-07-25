
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
                tiles[y][x] = 0; // 0 for grass
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
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
}
