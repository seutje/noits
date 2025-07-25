
export default class Settler {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.hunger = 100; // 0-100, 0 means starving
        this.sleep = 100; // 0-100, 0 means exhausted
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
    }

    // Placeholder for future methods like update, render, etc.
}
