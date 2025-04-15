import { state } from './game.js';
import { toggleCameraType, cycleCamera } from './cameras.js';
import { toggleLight, toggleHelpers } from './lighting.js';
import { toggleTrajectory } from './trajectory.js';

// Setup input listeners for keyboard and mouse
export function setupInputListeners() {
    // Keyboard events
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Mouse movement
    document.addEventListener('mousemove', handleMouseMove);
}

// Handle keydown events
function handleKeyDown(event) {
    switch(event.key) {
        case 'ArrowLeft':
        case 'a':
            state.keys.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            state.keys.right = true;
            break;
        case 'ArrowUp':
        case 'w':
            state.keys.up = true;
            break;
        case 'ArrowDown':
        case 's':
            state.keys.down = true;
            break;
        case 'm':
            // Toggle between mouse and keyboard control
            state.useMouse = !state.useMouse;
            console.log(`Using ${state.useMouse ? 'mouse' : 'keyboard'} control`);
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
            // Toggle trajectory prediction
            toggleTrajectory();
            break;
        case 'r':
            // Reset/restart game
            if (typeof window.resetGame === 'function') {
                window.resetGame();
            }
            break;
    }
}

// Handle keyup events
function handleKeyUp(event) {
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
