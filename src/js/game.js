
import Map from './map.js';

export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(50, 30, 32);
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.gameLoop(0);
    }

    update(deltaTime) {
        // Game logic will go here
    }

    render() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.map.render(this.ctx);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }
}
