/**
 * Brick Breaker 3D - Main entry point
 * This file combines the original code and now uses the modular structure
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { initGame, state, constants } from './game/game.js';

// For backward compatibility - define global variables
window.THREE = THREE;
window.OrbitControls = OrbitControls;

// Initialize the game directly
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize the game
        initGame();
        
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

// Export state for debugging
window.gameState = state;
window.gameConstants = constants;