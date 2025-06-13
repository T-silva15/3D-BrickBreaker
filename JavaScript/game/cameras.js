import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { state, constants } from './game.js';

// Setup all cameras for the game
export function setupCameras() {
    // Check if renderer exists
    if (!state.renderer) {
        console.error("Renderer must be created before setting up cameras");
        return;
    }

    // Clear existing cameras
    state.cameras = [];
    
    // Main game camera (perspective from behind)
    // FOV, Aspect Ratio, Near, Far
    const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    mainCamera.position.set(0, 10, 40);
    mainCamera.lookAt(0, 0, 0);
    mainCamera.name = "Main Camera";
    state.cameras.push(mainCamera);
    
    // Top-right corner camera
    const topRightCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    topRightCamera.position.set(constants.GAME_WIDTH/2 - 2, constants.GAME_HEIGHT/2 - 2, constants.GAME_DEPTH/2 - 2);
    topRightCamera.lookAt(0, 0, 0);
    topRightCamera.name = "Câmera Superior Direita";
    state.cameras.push(topRightCamera);
    
    // Top-left corner camera
    const topLeftCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    topLeftCamera.position.set(-constants.GAME_WIDTH/2 + 2, constants.GAME_HEIGHT/2 - 2, constants.GAME_DEPTH/2 - 2);
    topLeftCamera.lookAt(0, 0, 0);
    topLeftCamera.name = "Câmera Superior Esquerda";
    state.cameras.push(topLeftCamera);
    
    // Follow ball camera
    const followCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    followCamera.position.set(0, 5, 15);
    followCamera.name = "Follow Ball";
    state.cameras.push(followCamera);
    
    // First-person paddle camera
    const paddleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    paddleCamera.position.set(0, 2, 0);
    paddleCamera.lookAt(0, 10, -10);
    paddleCamera.name = "Paddle Camera";
    state.cameras.push(paddleCamera);
    
    // Orthographic camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 60;
    const orthographicCamera = new THREE.OrthographicCamera(
        -viewSize * aspectRatio / 2, 
        viewSize * aspectRatio / 2, 
        viewSize / 2, 
        -viewSize / 2, 
        0.1, 
        1000
    );
    orthographicCamera.position.set(0, 10, 40);
    orthographicCamera.lookAt(0, 0, 0);
    orthographicCamera.name = "Orthographic";
    state.cameras.push(orthographicCamera);
    
    // Set the active camera
    state.camera = state.cameras[state.currentCameraIndex];
    
    // Setup orbit controls
    state.controls = new OrbitControls(state.camera, state.renderer.domElement);
    state.controls.enableDamping = true;
    state.controls.dampingFactor = 0.05;
}

// Toggle between perspective and orthographic camera
export function toggleCameraType() {
    state.usingOrthographic = !state.usingOrthographic;
    
    if (state.usingOrthographic) {
        // Switch to the orthographic camera (last in the array)
        state.camera = state.cameras[state.cameras.length - 1];
    } else {
        // Return to the previously selected perspective camera
        state.camera = state.cameras[state.currentCameraIndex];
    }
    
    // Update controls
    state.controls.object = state.camera;
}

// Switch to next camera
export function cycleCamera() {
    state.currentCameraIndex = (state.currentCameraIndex + 1) % (state.cameras.length - 1);
    if (!state.usingOrthographic) {
        state.camera = state.cameras[state.currentCameraIndex];
        state.controls.object = state.camera;
    }
}
