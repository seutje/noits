
import Resource from './resource.js';

export default class ResourceManager {
    constructor() {
        this.resources = {};
    }

    addResource(type, quantity, quality = 1) {
        if (this.resources[type]) {
            this.resources[type].add(quantity);
        } else {
            this.resources[type] = new Resource(type, quantity, quality);
        }
    }

    removeResource(type, quantity) {
        if (this.resources[type]) {
            return this.resources[type].remove(quantity);
        }
        return false;
    }

    getResourceQuantity(type) {
        return this.resources[type] ? this.resources[type].quantity : 0;
    }

    getAllResources() {
        return this.resources;
    }
}
