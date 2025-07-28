
import { BUILDING_TYPE_PROPERTIES } from './constants.js';

// A* pathfinding algorithm
export function findPath(start, end, map) {
    if (start.x === end.x && start.y === end.y) {
        return [];
    }
    const openSet = [start];
    const closedSet = [];
    const cameFrom = {};

    const gScore = new Map();
    gScore.set(start, 0);

    const fScore = new Map();
    fScore.set(start, heuristic(start, end));

    while (openSet.length > 0) {
        let current = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (fScore.get(openSet[i]) < fScore.get(current)) {
                current = openSet[i];
            }
        }

        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current).slice(1);
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);

        const neighbors = getNeighbors(current, map);
        for (const neighbor of neighbors) {
            if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            const tentativeGScore = gScore.get(current) + 1;

            if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                openSet.push(neighbor);
            } else if (tentativeGScore >= gScore.get(neighbor)) {
                continue;
            }

            cameFrom[neighbor.x + "," + neighbor.y] = current;
            gScore.set(neighbor, tentativeGScore);
            fScore.set(neighbor, gScore.get(neighbor) + heuristic(neighbor, end));
        }
    }

    // No path found
    return null;
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node, map) {
    const neighbors = [];
    const { x, y } = node;

    const currentTile = map.getTile ? map.getTile(x, y) : 0;
    const currentBuilding = map.getBuildingAt ? map.getBuildingAt(x, y) : null;
    const currentBuildingPassable = currentBuilding
        ? BUILDING_TYPE_PROPERTIES[currentBuilding.type]?.passable !== false
        : false;
    const isUnpassable =
        (currentTile === 8 && !currentBuildingPassable) ||
        (currentBuilding && !currentBuildingPassable);

    const checkAndAdd = (nx, ny) => {
        if (nx >= 0 && nx < map.width && ny >= 0 && ny < map.height) {
            const tile = map.getTile ? map.getTile(nx, ny) : 0;
            const b = map.getBuildingAt ? map.getBuildingAt(nx, ny) : null;
            const buildingPassable = b
                ? BUILDING_TYPE_PROPERTIES[b.type]?.passable !== false
                : true;

            if (tile === 8 && (!b || !buildingPassable)) return;
            if (b && !buildingPassable) return;
            neighbors.push({ x: nx, y: ny });
        }
    };

    // Cardinal directions
    checkAndAdd(x - 1, y);
    checkAndAdd(x + 1, y);
    checkAndAdd(x, y - 1);
    checkAndAdd(x, y + 1);

    // If current tile is un-passable, allow diagonal escape
    if (isUnpassable) {
        checkAndAdd(x - 1, y - 1);
        checkAndAdd(x - 1, y + 1);
        checkAndAdd(x + 1, y - 1);
        checkAndAdd(x + 1, y + 1);
    }

    return neighbors;
}

function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom[current.x + "," + current.y]) {
        current = cameFrom[current.x + "," + current.y];
        totalPath.unshift(current);
    }
    return totalPath;
}
