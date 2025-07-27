
// A* pathfinding algorithm
export function findPath(start, end, map) {
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
            return reconstructPath(cameFrom, current);
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

    if (x > 0 && map.getTile(x - 1, y) !== 8) neighbors.push({ x: x - 1, y });
    if (x < map.width - 1 && map.getTile(x + 1, y) !== 8) neighbors.push({ x: x + 1, y });
    if (y > 0 && map.getTile(x, y - 1) !== 8) neighbors.push({ x, y: y - 1 });
    if (y < map.height - 1 && map.getTile(x, y + 1) !== 8) neighbors.push({ x, y: y + 1 });

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
