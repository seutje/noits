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
            description: 'A dense forest, rich in wood and wild game.'
        });
        this.locations.push({
            id: 'mountain_pass',
            name: 'Mountain Pass',
            x: 200,
            y: 100,
            description: 'A rocky pass, good for mining stone and ores.'
        });
    }

    getLocation(id) {
        return this.locations.find(loc => loc.id === id);
    }

    getLocations() {
        return this.locations;
    }

    // Future methods: addLocation, removeLocation, discoverLocation, etc.
}