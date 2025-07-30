# Noits

Noits is a 2D medieval colony management game built entirely with vanilla JavaScript. The game runs from a single `index.html` file and organizes all logic under the `src` folder.

## Features
- **Tile-Based World**: A scrollable map rendered on an HTML5 canvas.
- **Game Loop & Camera**: Robust update/render loop with camera panning and zoom (use WASD or arrow keys to pan).
- **Resource System**: Storage room system with piles for resources. Settlers gather wood, stone, ores and forage for berries or mushrooms.
- **Settlers with Needs**: Hunger and sleep drive behaviour. Settlers pursue tasks through a simple AI and mood system.
- **Task Queue**: Prioritised tasks for chopping trees, mining, hauling, farming and more.
- **Automatic Task Pausing**: Tasks that get unassigned repeatedly are paused to prevent infinite reassignment.
- **Building Construction**: Place walls, floors and furniture. Buildings require materials and have health.
- **Crafting & Production**: Crafting stations, ovens and wells convert resources into useful items.
- **Farming & Husbandry**: Farm plots grow crops like wheat or cotton. Animal pens hold livestock.
- **Exploration & Events**: Send settlers to new locations and face random events such as wild animal attacks or resource discoveries.
- **Wild Deer Encounters**: Non-aggressive deer occasionally appear and wander the map, eating mushrooms or berries if they find them.
- **Combat & Health**: Settlers equip weapons and armour, suffer injuries and can be treated.
- **Rooms & Storage**: Designate rooms (bedrooms, storage) and manage inventories.
- **UI & Notifications**: Tooltips, overlays and alerts keep you informed.
- **Save/Load**: Game state can be saved to and loaded from local storage.
- **Development Menu**: Provides debug tools like manual event triggering.
- **Embark Setup**: Choose a map seed and distribute skill points to starting settlers before the game begins.

## Buildings
The following building types are available:
- **Wall** – Impassable barrier for defence. Costs 1 stone to build.
- **Floor** – Basic flooring allowing passage.
- **Crafting Station** – Produces planks, bandages and buckets.
- **Oven** – Bakes bread from wheat and prepares meals.
- **Farm Plot** – Used for growing crops such as wheat or cotton.
- **Animal Pen** – Houses livestock.
- **Barricade** – Simple defensive structure.
- **Bed** – Lets settlers sleep to regain energy.
- **Door** – Allows settlers to pass while blocking enemies.
- **Table** – Furniture for rooms.
- **Well** – Draws water when supplied with a bucket.
- *Note*: Only floors may share a tile with another building. All other buildings require an empty tile.

## Crafting Recipes
Crafting stations and specialised buildings provide the following recipes:
- **Crafting Station**
  - `plank` – `1 wood` → `2 planks`
  - `bandage` – `1 cotton` → `1 bandage`
  - `bucket` – `1 plank` → `1 bucket`
- **Oven**
  - `bread` – `1 wheat` → `1 bread`
  - `meal` – prepared from various ingredients when assigned a `PREPARE_MEAL` task
- **Well**
  - `Water bucket` – `1 bucket` → `1 bucket_water`

These recipes can be queued for settlers via the task system and many buildings support automatic crafting once materials are delivered.
