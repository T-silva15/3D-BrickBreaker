/**
 * Brick Breaker 3D - Main entry point
 * This file combines the original code and now uses the modular structure
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initGame, state, constants, resetGame, togglePause } from './game/game.js';
import { levels } from './game/levels.js';

// For backward compatibility - define global variables
window.THREE = THREE;
window.OrbitControls = OrbitControls;

// Game state
let currentLevel = 0;
let gameActive = false;

// Initialize the game directly
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create menu UI
        createMainMenu();
        
        // Hide loading message
        const loading = document.getElementById('loading');
        if (loading) setTimeout(() => { loading.style.display = 'none'; }, 500);
        
    } catch (error) {
        console.error("Error initializing game:", error);
        
        // Show error in loading div
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `Error: ${error.message}<br>Check console for details`;
            loading.style.color = "red";
        }
    }
});

function createMainMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.id = 'main-menu';
    menuContainer.className = 'menu-container';
    
    // Title
    const title = document.createElement('h1');
    title.textContent = 'BRICK BREAKER 3D';
    menuContainer.appendChild(title);
    
    // Level selection
    const levelSelect = document.createElement('div');
    levelSelect.className = 'level-selection';
    
    // Add level buttons
    levels.forEach((level, index) => {
        const levelBtn = document.createElement('button');
        levelBtn.className = 'level-btn';
        levelBtn.textContent = `Nível ${index + 1}: ${level.name}`;
        levelBtn.addEventListener('click', () => startLevel(index));
        levelSelect.appendChild(levelBtn);
    });
    
    menuContainer.appendChild(levelSelect);
    
    // Add menu to document
    document.body.appendChild(menuContainer);
    
    // Add styles
    addMenuStyles();
}

// Depois modificar a função startLevel() para usar a função importada:
function startLevel(levelIndex) {
    currentLevel = levelIndex;
    
    // Hide menu
    const menu = document.getElementById('main-menu');
    menu.style.display = 'none';
    
    // Initialize the game with the selected level
    initGame(levels[levelIndex]);
    gameActive = true;
    
    // Add back to menu button
    const backBtn = document.createElement('button');
    backBtn.id = 'back-to-menu';
    backBtn.textContent = 'Menu';
    backBtn.addEventListener('click', showMainMenu);
    document.body.appendChild(backBtn);
    
    // Add pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pause-button';
    pauseBtn.textContent = 'Pausa';
    pauseBtn.addEventListener('click', togglePause); 
    document.body.appendChild(pauseBtn);
}

function showMainMenu() {
    // Hide game UI elements
    const backBtn = document.getElementById('back-to-menu');
    if (backBtn) backBtn.remove();
    
    const pauseBtn = document.getElementById('pause-button');
    if (pauseBtn) pauseBtn.remove();
    
    // Reset game state
    gameActive = false;
    resetGame();
    
    // Show menu
    const menu = document.getElementById('main-menu');
    menu.style.display = 'flex';
}

function addMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .menu-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 100;
            color: white;
            font-family: 'Arial', sans-serif;
        }
        
        .menu-container h1 {
            font-size: 3em;
            margin-bottom: 40px;
            color: #ff5e3a;
            text-shadow: 0 0 10px rgba(255, 94, 58, 0.7);
        }
        
        .level-selection {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 300px;
        }
        
        .level-btn {
            padding: 15px;
            font-size: 1.2em;
            background-color: #2c3e50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .level-btn:hover {
            background-color: #3498db;
            transform: scale(1.05);
        }
        
        #back-to-menu, #pause-button {
            position: absolute;
            top: 20px;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background-color: #2c3e50;
            color: white;
            cursor: pointer;
            z-index: 50;
        }
        
        #back-to-menu {
            left: 20px;
        }
        
        #pause-button {
            right: 20px;
        }
        
        #back-to-menu:hover, #pause-button:hover {
            background-color: #3498db;
        }
    `;
    
    document.head.appendChild(style);
}

// Export state for debugging
window.gameState = state;
window.gameConstants = constants;
window.showMainMenu = showMainMenu;