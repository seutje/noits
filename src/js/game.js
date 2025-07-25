
export default class Game {
    constructor(ctx) {
        this.ctx = ctx;
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.gameLoop(0);
    }

    update(deltaTime) {
        // Game logic will go here
    }

    render() {
        // Drawing code will go here
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(10, 10, 100, 100);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }
}
