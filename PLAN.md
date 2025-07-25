# **Medieval Colony Manager Game: Vanilla JS Development Plan**

This plan outlines the development process for your 2D medieval colony manager game called "Noits", broken down into several phases with numbered and checkbox-marked subtasks, using vanilla JavaScript and no external dependencies.

## **Phase 1: Foundation & Core Simulation**

This phase focuses on establishing the fundamental game engine, rendering, and basic data structures.

### **1.0 Game Engine Basics**

* [x] 1.1 Initialize HTML5 Canvas and JavaScript environment.  
* [x] 1.2 Implement a robust game loop (update, render).  
* [x] 1.3 Create a basic tile-based map data structure (2D array).  
* [x] 1.4 Implement camera controls (panning, basic zoom).

### **1.5 Basic Rendering**

* [x] 1.5.1 Render individual tiles on the canvas (e.g., grass, dirt).  
* [x] 1.5.2 Implement a simple sprite loading and rendering system for objects and characters.  
* [x] 1.5.3 Basic UI elements (e.g., top bar for time/resources).

### **1.6 Core Data Structures**

* [x] 1.6.1 Define Resource object structure (type, quantity, quality).  
* [x] 1.6.2 Define Settler object structure (name, basic skills, health, position).  
* [x] 1.6.3 Define Building object structure (type, position, material, health).

### **1.7 Basic Resource System**

* [x] 1.7.1 Implement a global resource inventory.  
* [x] 1.7.2 Allow manual placement of basic resources (e.g., wood piles).  
* [x] 1.7.3 Implement a simple resource gathering action (e.g., click tree \-\> get wood).

## **Phase 2: Settlers, Needs, and Basic Building**

This phase introduces settler needs, basic work assignments, and the initial building mechanics.

### **2.0 Settler Needs & Behavior**

* [x] 2.1 Implement basic settler needs: Hunger, Sleep.  
* [x] 2.2 Create a simple AI for settlers to fulfill basic needs (e.g., find food, find a bed).  
* [x] 2.3 Implement a basic mood system based on needs fulfillment.  
* [x] 2.4 Display settler status (e.g., "Hungry", "Sleeping") via simple text labels.

### **2.5 Basic Work System**

* [x] 2.5.1 Implement a task queue for settlers (e.g., "Chop Wood", "Mine Stone").  
* [x] 2.5.2 Implement a basic work prioritization system (e.g., manual assignment).  
* [x] 2.5.3 Settlers move to designated work locations.

### **2.6 Basic Base Construction**

* [x] 2.6.1 Implement wall and floor placement using a simple build menu.  
* [x] 2.6.2 Allow settlers to construct placed buildings using resources.  
* [x] 2.6.3 Implement basic building health and destruction.

## **Phase 3: Production, Advanced Resources, and Base Management**

This phase expands on resource chains, introduces crafting, and refines base management.

### **3.0 Production & Crafting**

* [x] 3.1 Implement Crafting Station building type (e.g., Workbench).  
* [x] 3.2 Define basic crafting recipes (e.g., wood \-\> plank, stone \-\> block).  
* [x] 3.3 Settlers can craft items at designated stations.  
* [x] 3.4 Implement a basic quality system for crafted items.

### **3.5 Diverse Resources & Gathering**

* [x] 3.5.1 Implement various resource types: Stone, Metals (basic), Fibers, Food (basic).  
* [x] 3.5.2 Implement mining functionality for stone and metal ores.  
* [x] 3.5.3 Implement hunting and foraging for wild food.

### **3.6 Farming & Animal Husbandry**

* [x] 3.6.1 Implement farm plots for cultivating basic crops (e.g., wheat).  
* [x] 3.6.2 Implement a simple animal pen for basic livestock (e.g., chickens).  
* [x] 3.6.3 Settlers can sow, harvest, and tend to animals.

### **3.7 Base Management Refinements**

* [x] 3.7.1 Implement room designation system (e.g., "Bedroom", "Storage").  
* [x] 3.7.2 Implement basic furniture placement (e.g., beds, tables).  
* [x] 3.7.3 Implement a basic storage system with designated zones.  
* [x] 3.7.4 Basic logistics: Settlers haul resources to storage.

## **Phase 4: World Interaction, Health, and Basic Combat**

This phase introduces interactions with the outside world, a more detailed health system, and initial combat mechanics.

### **4.0 World Map & Exploration**

* [x] 4.1 Create a simple world map representation (e.g., nodes for locations).  
* [x] 4.2 Implement basic exploration mechanics (send settlers to new map nodes).  
* [x] 4.3 Discover basic points of interest (e.g., ruins, resource nodes).

### **4.4 Faction Interaction (Basic)**

* [x] 4.4.1 Define a simple Faction data structure (name, relation).  
* [x] 4.4.2 Implement basic trade with friendly factions (e.g., traveling merchant event).

### **4.5 Health System**

* [ ] 4.5.1 Implement a basic body part system for settlers (e.g., head, torso, limbs).  
* [ ] 4.5.2 Implement basic injuries (e.g., cuts, bruises).  
* [ ] 4.5.3 Implement basic medical treatment (e.g., bandaging).

### **4.6 Basic Combat**

* [ ] 4.6.1 Implement Weapon and Armor item types.  
* [ ] 4.6.2 Settlers can equip weapons and armor.  
* [ ] 4.6.3 Implement simple melee combat mechanics (damage calculation).  
* [ ] 4.6.4 Basic enemy AI for simple encounters (e.g., single raider).  
* [ ] 4.6.5 Implement basic defensive structures (e.g., simple barricades).

## **Phase 5: Events, UI/UX, and Polish**

This final phase focuses on adding dynamic events, refining the user experience, and general polish.

### **5.0 Random Events**

* [ ] 5.1 Implement a system for triggering random events (e.g., "Wild Animal Attack", "Resource Discovery").  
* [ ] 5.2 Create a few simple positive and negative random events.

### **5.3 User Interface & Accessibility**

* [ ] 5.3.1 Implement a more intuitive and organized build menu.  
* [ ] 5.3.2 Add detailed tooltips for items, buildings, and settler stats.  
* [ ] 5.3.3 Implement a notification system for important in-game events.  
* [ ] 5.3.4 Implement basic information overlays (e.g., temperature, room stats).  
* [ ] 5.3.5 Refine overall visual aesthetics (colors, fonts, basic animations).

### **5.6 Game Polish**

* [ ] 5.6.1 Implement save/load functionality (using localStorage or similar).  
* [ ] 5.6.2 Basic sound effects for key actions.  
* [ ] 5.6.3 Bug fixing and performance optimization.  
* [ ] 5.6.4 Tutorial or in-game help system.