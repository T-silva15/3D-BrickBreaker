import { state } from './game.js';
import { toggleCameraType, cycleCamera } from './cameras.js';
import { toggleLight, toggleHelpers } from './lighting.js';
import { toggleTrajectory } from './trajectory.js';
import { skipLevel } from './objects.js';

// Setup input listeners for keyboard and mouse
export function setupInputListeners() {
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
}

// Handle keydown events
function handleKeyDown(event) {
    // Check if Enter key is pressed to start the game
    if (event.key === 'Enter') {
        if (state.waitingForStart && !state.gameStarted && !state.gameOver && !state.levelComplete && !state.paused && !state.displayMode) {
            // Import and call startGame
            import('./game.js').then(module => {
                module.startGame();
            });
            return;
        }
    }
    
    // Only handle movement keys if the game has started, is not waiting for start,
    // and is not paused or in display mode
    const gameActive = state.gameStarted && !state.waitingForStart && 
                      !state.gameOver && !state.levelComplete && 
                      !state.paused && !state.displayMode;
    
    switch(event.key) {
        case 'ArrowLeft':
        case 'a':
            if (gameActive) state.keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            if (gameActive) state.keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
            if (gameActive) state.keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
            if (gameActive) state.keys.down = true;
            break;
        case 'c':
            // Switch camera
            cycleCamera();
            break;
        case 'h':
            // Toggle helpers
            toggleHelpers();
            break;
        case '1': // Ambient
            toggleLight('ambient');
            break;
        case '2': // Directional
            toggleLight('directional');
            break;
        case '3': // Point
            toggleLight('point');
            break;
        case '4': // Spotlight
            toggleLight('spotlight');
            break;
        case '5': // Hemispheric
            toggleLight('hemispheric');
            break;
        case 'o':
            // Toggle between orthographic and perspective cameras
            toggleCameraType();
            break;
        case 't':
            // Toggle trajectory prediction with debugging
            console.log('Toggling trajectory');
            toggleTrajectory();
            console.log('Trajectory visible:', state.showTrajectory);
            break;
        case 'r':
            // Reset/restart game
            if (typeof window.resetGame === 'function') {
                window.resetGame();
            }
            break;
        case 'n':
            // Toggle next level
            skipLevel();
            break;
    }
}

// Handle keyup events
function handleKeyUp(event) {
    // Movement keys should always be reset on keyup, regardless of game state
    // This prevents keys from getting "stuck" when the game starts
    switch(event.key) {
        case 'ArrowLeft':
        case 'a':
            state.keys.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            state.keys.right = false;
            break;
        case 'ArrowUp':
        case 'w':
            state.keys.up = false;
            break;
        case 'ArrowDown':
        case 's':
            state.keys.down = false;
            break;
    }
}

// Handle mouse movement
function handleMouseMove(event) {
    // Calculate mouse position relative to canvas
    const rect = state.renderer.domElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convert to normalized coordinates (-1 to 1)
    const normalizedX = (mouseX / window.innerWidth) * 2 - 1;
    const normalizedY = -(mouseY / window.innerHeight) * 2 + 1;
    
    // Map normalized coordinates to game space
    state.mousePosition.x = normalizedX * (state.constants.GAME_WIDTH / 2);
    
    // Map Y mouse position to Z in game (for 3D movement)
    const zRange = state.constants.GAME_DEPTH / 3;
    state.mousePosition.z = normalizedY * zRange;
}
