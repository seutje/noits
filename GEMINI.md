# **GEMINI.md: AI Agent Instructions for Medieval Colony Manager Game Development**

This document provides instructions for AI agents contributing to the development of the Medieval Colony Manager Game called "Noits". Adherence to these guidelines is crucial for maintaining project integrity, facilitating collaboration, and ensuring a smooth development workflow.

## **1\. Development Process & Reporting**

* **Commit Frequency:** After successfully completing *each individual subtask* (e.g., 1.1, 1.2, 2.1, 2.2) as outlined in the PLAN.md document, you **MUST** edit the PLAN.md document and check off what you finished and commit your changes.  
* **Commit Messages:** Each commit message should be concise and clearly describe the work done for that specific subtask.  
  * **Format:** \[Phase.Subtask\] Description of work  
  * **Example:** \[1.1\] Initialized HTML5 Canvas and JS environment.  
  * **Example:** \[2.1\] Implemented basic settler hunger need.  
* **Reporting to User:** After completing and committing each subtask, you **MUST** stop and report back to the user.  
  * **Purpose:** This allows the user to review, test, and provide feedback on incremental progress.  
  * **Message Content:** Clearly state which subtask has been completed, a brief summary of the implemented functionality, and confirm that the changes are committed.  
  * **Example:** "Subtask 1.1 (Initialize HTML5 Canvas and JavaScript environment) is complete and committed. The index.html now sets up the canvas. Please review and test."

## **2\. Project Structure & Execution**

* **Single Entry Point:** The entire game, including all HTML, CSS, and JavaScript, **MUST** run from a single index.html file.  
* **CSS Location:** All CSS files should be located within the ./src/css/ directory and linked from index.html.  
* **JavaScript Location:** All JavaScript files should be located within the ./src/js/ directory.  
* **JavaScript Modules:** Leverage JavaScript modules (import/export) for organizing code into logical units.  
  * The main game logic should be imported into index.html as a module (e.g., \<script type="module" src="./src/js/main.js"\>\</script\>).

## **3\. Code Style & Best Practices**

* **Classes and Inheritance:** Utilize JavaScript classes and inheritance for defining game entities (e.g., Settler, Building, Resource) and their behaviors. This promotes organized, reusable, and scalable code.  
* **Vanilla JS:** Strictly adhere to vanilla JavaScript. No external runtime libraries or frameworks (e.g., React, Vue, jQuery) are allowed, as per the game-development-plan.  
* **Comments:** Provide clear and concise comments for complex logic, functions, and class definitions.

## **4\. Testing**

* **Test Coverage:** Implement tests for key functionality as it is developed. Focus on critical game mechanics, data structures, and core logic.  
* **Testing Framework:** Jest is the preferred testing framework for JavaScript. It should be set up as a development dependency.  
* **Test Location:** Tests should reside in a dedicated \_\_tests\_\_/ directory.  
* **Running Tests:** Ensure tests can be run easily via a npm script (e.g., npm test).

## **5\. Development Server with Autoreload**

* **Local Development Server:** Set up a simple HTTP server for local development.  
* **Autoreload:** The server **MUST** include an auto-reload feature to automatically refresh the browser upon file changes (HTML, CSS, JS).  
* **Recommended Tool:** live-server or a similar lightweight HTTP server with hot-reloading capabilities is recommended. It should be installed as a dev dependency and configured via an npm script (e.g., npm start).

By following these instructions, AI agents will contribute effectively to the project, ensuring code quality, maintainability, and a transparent development process.