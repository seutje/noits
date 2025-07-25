export default class Recipe {
    constructor(name, inputs, outputs, time) {
        this.name = name; // e.g., "plank_from_wood"
        this.inputs = inputs; // Array of { resourceType: string, quantity: number }
        this.outputs = outputs; // Array of { resourceType: string, quantity: number, quality: number }
        this.time = time; // Time in seconds to craft
    }
}