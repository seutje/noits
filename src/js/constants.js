// Consolidated constants for the game

// General constants
export const ACTION_BEEP_URL = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAq9Dt/P3v066DWDIUBAIOKU14o8rp+/7y2baLYDgZBgELI0Zwm8Tk+P72372TaD8eCAEIHj9ok73f9v745MSbcEYjCwEGGThgi7bZ8v776cqjeE0pDgIEFDJYg67T7/387dCrf1QvEgMCECxRfKfN6/v98dayh1w1FgQBDSZJdJ/H5vn+9Ny5j2Q7GwcBCSBCbJfA4ff/9+HAl2xCIAkBBxs7ZI+53PT++ebHn3RJJg0BBBY1XIey1vH9++vNp3xRLBACAxIvVICr0O38/e/TroNYMhQEAg4pTXijyun7/vLZtotgOBkGAQsjRnCbxOT4/vbfvZNoPx4IAQgeP2iTvd/2/vjkxJtwRiMLAQYZOGCLttny/vvpyqN4TSkOAgQUMliDrtPv/fzt0KuAVC8SAwIQLFF8p83r+/3x1rKHXDUWBAENJkl0n8fm+f703LmPZDsbBwEJIEJsl8Dh9//34cCXbEIgCQEHGztkj7nc9P755sefdEkmDQEEFjVch7LW8f37682nfFEsEAIDEi9U";
export const SLEEP_GAIN_RATE = 0.01; // base sleep recovery per second
export const HEALTH_REGEN_RATE = 0.005; // base health regen per second at full hunger

// Resource types used throughout the game
export const RESOURCE_TYPES = {
  WOOD: 'wood',
  STONE: 'stone',
  IRON_ORE: 'iron_ore',
  DIRT: 'dirt',
  WHEAT: 'wheat',
  COTTON: 'cotton',
  BERRIES: 'berries',
  MUSHROOMS: 'mushrooms',
  MEAT: 'meat',
  BANDAGE: 'bandage',
  PLANK: 'plank',
  BLOCK: 'block'
};

// Categories assigned to each resource. Resources can belong to multiple
// categories (e.g., wheat is considered food).
export const RESOURCE_CATEGORIES = {
  [RESOURCE_TYPES.WOOD]: ['material'],
  [RESOURCE_TYPES.STONE]: ['material'],
  [RESOURCE_TYPES.IRON_ORE]: ['material'],
  [RESOURCE_TYPES.DIRT]: ['material'],
  [RESOURCE_TYPES.WHEAT]: ['food'],
  [RESOURCE_TYPES.COTTON]: ['material'],
  [RESOURCE_TYPES.BERRIES]: ['food'],
  [RESOURCE_TYPES.MUSHROOMS]: ['food'],
  [RESOURCE_TYPES.MEAT]: ['food'],
  [RESOURCE_TYPES.BANDAGE]: ['medical'],
  [RESOURCE_TYPES.PLANK]: ['material'],
  [RESOURCE_TYPES.BLOCK]: ['material']
};

// Individual task type constants
export const TASK_TYPES = {
  CHOP_WOOD: 'chop_wood',
  MINE_STONE: 'mine_stone',
  MINE_IRON_ORE: 'mine_iron_ore',
  GATHER_BERRIES: 'gather_berries',
  MUSHROOM: 'mushroom',
  HUNT_ANIMAL: 'hunt_animal',
  DIG_DIRT: 'dig_dirt',
  BUILD: 'build',
  CRAFT: 'craft',
  SOW_CROP: 'sow_crop',
  HARVEST_CROP: 'harvest_crop',
  TEND_ANIMALS: 'tend_animals',
  BUTCHER: 'butcher',
  EXPLORE: 'explore',
  TREATMENT: 'treatment',
  HAUL: 'haul',
  SLEEP: 'sleep'
};

// Set of task types related to gathering
export const GATHER_TASK_TYPES = new Set([
  TASK_TYPES.CHOP_WOOD,
  TASK_TYPES.GATHER_BERRIES,
  TASK_TYPES.MUSHROOM,
  TASK_TYPES.HUNT_ANIMAL,
  TASK_TYPES.MINE_STONE,
  TASK_TYPES.MINE_IRON_ORE,
  TASK_TYPES.DIG_DIRT
]);

// Movement speeds
export const SETTLER_RUN_SPEED = 0.5; // tiles per second
export const ENEMY_RUN_SPEED = 0.3; // tiles per second
