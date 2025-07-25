export default class WorldMap {
    constructor() {
        this.locations = [];
        this.createDefaultLocations();
    }

    createDefaultLocations() {
        // Example locations (nodes)
        this.locations.push({
            id: 'colony',
            name: 'Our Colony',
            x: 0,
            y: 0,
            description: 'The heart of our settlement.'
        });
        this.locations.push({
            id: 'forest_outpost',
            name: 'Forest Outpost',
            x: 100,
            y: 50,
            description: 'A dense forest, rich in wood and wild game.',
            discovered: false
        });
        this.locations.push({
            id: 'mountain_pass',
            name: 'Mountain Pass',
            x: 200,
            y: 100,
            description: 'A rocky pass, good for mining stone and ores.',
            discovered: false
        });
        this.locations.push({
            id: 'ancient_ruins',
            name: 'Ancient Ruins',
            x: 300,
            y: 150,
            description: 'Mysterious ruins, rumored to hold ancient artifacts.',
            discovered: false
        });
        this.locations.push({
            id: 'fertile_valley',
            name: 'Fertile Valley',
            x: 50,
            y: 200,
            description: 'A lush valley, ideal for farming.',
            discovered: false
        });
    }

    getLocation(id) {
        return this.locations.find(loc => loc.id === id);
    }

    getLocations() {
        return this.locations;
    }

    // Future methods: addLocation, removeLocation, discoverLocation, etc.

    discoverLocation(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (location) {
            location.discovered = true;
            console.log(`Location discovered: ${location.name}`);
            return true;
        }
        return false;
    }
}