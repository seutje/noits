
export default class Settler {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.skills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            combat: 1
        };
    }

    // Placeholder for future methods like update, render, etc.
}
