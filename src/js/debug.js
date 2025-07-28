export let debugMode = false;

export function setDebugMode(value) {
    debugMode = value;
}

export function debugLog(...args) {
    if (debugMode) {
        console.log(...args);
    }
}

export function debugWarn(...args) {
    if (debugMode) {
        console.warn(...args);
    }
}
