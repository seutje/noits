
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

    getResourcesByCategory(category) {
        return Object.values(this.resources).filter(r => r.categories.includes(category));
    }

    serialize() {
        const serializedResources = {};
        for (const type in this.resources) {
            serializedResources[type] = this.resources[type].serialize();
        }
        return serializedResources;
    }

    deserialize(data) {
        this.resources = {};
        for (const type in data) {
            const resourceData = data[type];
            const resource = new Resource(
                resourceData.type,
                resourceData.quantity,
                resourceData.quality,
                resourceData.categories,
                resourceData.hungerRestoration
            );
            this.resources[type] = resource;
        }
    }
}
