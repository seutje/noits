// Consolidated constants for the game

// General constants
export const ACTION_BEEP_URL = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAq9Dt/P3v066DWDIUBAIOKU14o8rp+/7y2baLYDgZBgELI0Zwm8Tk+P72372TaD8eCAEIHj9ok73f9v745MSbcEYjCwEGGThgi7bZ8v776cqjeE0pDgIEFDJYg67T7/387dCrf1QvEgMCECxRfKfN6/v98dayh1w1FgQBDSZJdJ/H5vn+9Ny5j2Q7GwcBCSBCbJfA4ff/9+HAl2xCIAkBBxs7ZI+53PT++ebHn3RJJg0BBBY1XIey1vH9++vNp3xRLBACAxIvVICr0O38/e/TroNYMhQEAg4pTXijyun7/vLZtotgOBkGAQsjRnCbxOT4/vbfvZNoPx4IAQgeP2iTvd/2/vjkxJtwRiMLAQYZOGCLttny/vvpyqN4TSkOAgQUMliDrtPv/fzt0KuAVC8SAwIQLFF8p83r+/3x1rKHXDUWBAENJkl0n8fm+f703LmPZDsbBwEJIEJsl8Dh9//34cCXbEIgCQEHGztkj7nc9P755sefdEkmDQEEFjVch7LW8f37682nfFEsEAIDEi9U";
export const SLEEP_GAIN_RATE = 0.01; // base sleep recovery per second
export const HEALTH_REGEN_RATE = 0.005; // base health regen per second at full hunger

// Building types used across the game
export const BUILDING_TYPES = {
  WALL: 'wall',
  FLOOR: 'floor',
  CRAFTING_STATION: 'crafting_station',
  OVEN: 'oven',
  FARM_PLOT: 'farm_plot',
  ANIMAL_PEN: 'animal_pen',
  BARRICADE: 'barricade',
  BED: 'bed',
  TABLE: 'table',
  WELL: 'well'
};

// Properties for each building type
export const BUILDING_TYPE_PROPERTIES = {
  [BUILDING_TYPES.WALL]: { passable: false },
  [BUILDING_TYPES.FLOOR]: { passable: true },
  [BUILDING_TYPES.CRAFTING_STATION]: { passable: true },
  [BUILDING_TYPES.OVEN]: { passable: true },
  [BUILDING_TYPES.FARM_PLOT]: { passable: true },
  [BUILDING_TYPES.ANIMAL_PEN]: { passable: true },
  [BUILDING_TYPES.BARRICADE]: { passable: true },
  [BUILDING_TYPES.BED]: { passable: true },
  [BUILDING_TYPES.TABLE]: { passable: true },
  [BUILDING_TYPES.WELL]: { passable: true }
};

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
  BREAD: 'bread',
  BANDAGE: 'bandage',
  PLANK: 'plank',
  BUCKET: 'bucket',
  BLOCK: 'block',
  BUCKET_WATER: 'bucket_water',
  MEAL: 'meal'
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
  [RESOURCE_TYPES.BREAD]: ['food'],
  [RESOURCE_TYPES.BANDAGE]: ['medical'],
  [RESOURCE_TYPES.PLANK]: ['material'],
  [RESOURCE_TYPES.BUCKET]: ['material'],
  [RESOURCE_TYPES.BLOCK]: ['material'],
  [RESOURCE_TYPES.BUCKET_WATER]: ['material'],
  [RESOURCE_TYPES.MEAL]: ['food']
};

// Hunger restored when consuming one unit of each food resource
export const FOOD_HUNGER_VALUES = {
  [RESOURCE_TYPES.WHEAT]: 5,
  [RESOURCE_TYPES.BERRIES]: 10,
  [RESOURCE_TYPES.MUSHROOMS]: 8,
  [RESOURCE_TYPES.MEAT]: 30,
  [RESOURCE_TYPES.BREAD]: 20,
  [RESOURCE_TYPES.MEAL]: 0
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
  BAKING: 'baking',
  PREPARE_MEAL: 'prepare_meal',
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

// Sprite definitions used during game startup
export const SPRITES = [
  ['settler', 'src/assets/settler.png'],
  ['tree', 'src/assets/tree.png'],
  ['grass', 'src/assets/grass.png'],
  ['water', 'src/assets/water.png'],
  ['berry_bush', 'src/assets/berry_bush.png'],
  ['goblin', 'src/assets/goblin.png'],
  [RESOURCE_TYPES.STONE, 'src/assets/stone.png'],
  [RESOURCE_TYPES.IRON_ORE, 'src/assets/iron_ore.png'],
  ['deer', 'src/assets/deer.png'],
  [RESOURCE_TYPES.DIRT, 'src/assets/dirt.png'],
  ['wild_boar', 'src/assets/wild_boar.png'],
  ['mushroom', 'src/assets/mushroom.png'],
  ['mushrooms', 'src/assets/mushrooms.png'],
  [RESOURCE_TYPES.WOOD, 'src/assets/wood.png'],
  [RESOURCE_TYPES.PLANK, 'src/assets/plank.png'],
  [RESOURCE_TYPES.BUCKET, 'src/assets/bucket.png'],
  ['stone_pile', 'src/assets/stone_pile.png'],
  [RESOURCE_TYPES.BERRIES, 'src/assets/berries.png'],
  [RESOURCE_TYPES.MEAT, 'src/assets/meat.png'],
  ['dirt_pile', 'src/assets/dirt_pile.png'],
  [BUILDING_TYPES.FARM_PLOT, 'src/assets/farmPlot.png'],
  [RESOURCE_TYPES.BANDAGE, 'src/assets/bandage.png'],
  [BUILDING_TYPES.CRAFTING_STATION, 'src/assets/crafting_station.png'],
  [BUILDING_TYPES.OVEN, 'src/assets/oven.png'],
  [RESOURCE_TYPES.BREAD, 'src/assets/bread.png'],
  [RESOURCE_TYPES.MEAL, 'src/assets/meal.png'],
  [BUILDING_TYPES.TABLE, 'src/assets/table.png'],
  [BUILDING_TYPES.BED, 'src/assets/bed.png'],
  [BUILDING_TYPES.WELL, 'src/assets/well.png'],
  [RESOURCE_TYPES.BUCKET_WATER, 'src/assets/bucket_water.png'],
  ['wheat_1', 'src/assets/wheat_1.png'],
  ['wheat_2', 'src/assets/wheat_2.png'],
  ['wheat_3', 'src/assets/wheat_3.png'],
  ['wheat_pile', 'src/assets/wheat_pile.png'],
  ['cotton_1', 'src/assets/cotton_1.png'],
  ['cotton_2', 'src/assets/cotton_2.png'],
  ['cotton_3', 'src/assets/cotton_3.png'],
  ['cotton_pile', 'src/assets/cotton_pile.png'],
  ['iron_ore_pile', 'src/assets/iron_ore_pile.png'],
  ['construction', 'src/assets/construction.png']
];
