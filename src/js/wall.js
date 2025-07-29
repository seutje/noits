import Building from './building.js';
import { BUILDING_TYPES, RESOURCE_TYPES } from './constants.js';

export default class Wall extends Building {
    constructor(x, y, spriteManager = null) {
        super(BUILDING_TYPES.WALL, x, y, 1, 1, RESOURCE_TYPES.STONE, 0, 1);
        this.drawBase = false;
        this.spriteManager = spriteManager;
        this.wallSprite = spriteManager ? spriteManager.getSprite('stone_texture') : null;
        this.wallPattern = null;
        this.connections = { n: false, e: false, s: false, w: false };
    }

    updateConnections() {
        if (!this.map) return;
        const dirs = {
            n: { dx: 0, dy: -1 },
            e: { dx: 1, dy: 0 },
            s: { dx: 0, dy: 1 },
            w: { dx: -1, dy: 0 },
        };
        for (const dir in dirs) {
            const { dx, dy } = dirs[dir];
            const neighbor = this.map.getBuildingAt(this.x + dx, this.y + dy);
            this.connections[dir] =
                neighbor && neighbor.type === BUILDING_TYPES.WALL;
        }
    }

    render(ctx, tileSize) {
        if (this.buildProgress < 100) {
            super.render(ctx, tileSize);
            return;
        }
        const x = this.x * tileSize;
        const y = this.y * tileSize;
        const half = tileSize / 2;
        const thickness = tileSize * 0.6;
        if (!this.wallPattern && this.wallSprite) {
            this.wallPattern = ctx.createPattern(this.wallSprite, 'repeat');
        }

        ctx.fillStyle = this.wallPattern || (this.material === RESOURCE_TYPES.WOOD ? '#8b4513' : '#808080');
        ctx.fillRect(x + half - thickness / 2, y + half - thickness / 2, thickness, thickness);
        if (this.connections.n) {
            ctx.fillRect(x + half - thickness / 2, y, thickness, half);
        }
        if (this.connections.s) {
            ctx.fillRect(x + half - thickness / 2, y + half, thickness, half);
        }
        if (this.connections.w) {
            ctx.fillRect(x, y + half - thickness / 2, half, thickness);
        }
        if (this.connections.e) {
            ctx.fillRect(x + half, y + half - thickness / 2, half, thickness);
        }
    }
}
