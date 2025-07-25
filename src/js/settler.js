
export default class Settler {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.hunger = 100; // 0-100, 0 means starving
        this.sleep = 100; // 0-100, 0 means exhausted
        this.mood = 100; // 0-100, 0 means very unhappy
        this.state = "idle"; // e.g., "idle", "seeking_food", "seeking_sleep"
        this.skills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            combat: 1
        };
    }

    updateNeeds(deltaTime) {
        // Decrease hunger over time
        this.hunger -= 0.01 * (deltaTime / 1000); // Adjust rate as needed
        if (this.hunger < 0) this.hunger = 0;

        // Decrease sleep over time
        this.sleep -= 0.005 * (deltaTime / 1000); // Adjust rate as needed
        if (this.sleep < 0) this.sleep = 0;

        // Adjust mood based on hunger and sleep
        if (this.hunger < 50) {
            this.mood -= (50 - this.hunger) * 0.001 * (deltaTime / 1000);
        }
        if (this.sleep < 50) {
            this.mood -= (50 - this.sleep) * 0.001 * (deltaTime / 1000);
        }
        if (this.mood > 100) this.mood = 100;
        if (this.mood < 0) this.mood = 0;

        // Basic AI: Change state based on needs
        if (this.hunger < 20) {
            this.state = "seeking_food";
        } else if (this.sleep < 20) {
            this.state = "seeking_sleep";
        } else {
            this.state = "idle";
        }
    }

    // Placeholder for future methods like update, render, etc.

    render(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x * 32, this.y * 32, 32, 32);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.name, this.x * 32, this.y * 32 - 5);
        ctx.fillText(this.state, this.x * 32, this.y * 32 + 40);
        ctx.fillText(this.getStatus(), this.x * 32, this.y * 32 + 50);
    }

    getStatus() {
        if (this.hunger < 20) return "Hungry";
        if (this.sleep < 20) return "Sleepy";
        return "OK";
    }
}
