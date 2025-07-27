export let debugMode = false;

export function setDebugMode(value) {
    debugMode = value;
}

export function debugLog(...args) {
    if (debugMode) {
        console.log(...args);
    }
}
