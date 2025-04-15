// Brick Breaker 3D - Phase 1
// Initial setup with basic models, camera configuration, and scene elements

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer;
let paddle, ball, bricks = [];
let gameArea;
let controls;
let gameStarted = false;

// Ball physics variables
let ballVelocity = new THREE.Vector3(0.1, 0.1, 0.08);
const BALL_SPEED = 0.2

// Constants for game dimensions
const GAME_WIDTH = 40; // Increased from 30
const GAME_HEIGHT = 50; // Increased from 40
const GAME_DEPTH = 40; // Increased from 30
const BRICK_WIDTH = 4;
const BRICK_HEIGHT = 2;
const BRICK_DEPTH = 2;
// Update paddle dimensions to make it slightly larger
const PADDLE_WIDTH = 10; // Increased from 8
const PADDLE_HEIGHT = 1;
const PADDLE_DEPTH = 10; // Increased from 8
const BALL_RADIUS = 0.8;

// Game state variables
let gameOver = false;
let levelComplete = false;

// Input handling variables
let keys = {
    left: false,
    right: false,
    up: false,
    down: false
};
let mousePosition = { x: 0, z: 0 };
let useMouse = true;
const PADDLE_SPEED = 0.5;

// Camera and lighting variables
let cameras = [];
let currentCameraIndex = 0;
let lights = {
    ambient: null,
    directional: null,
    point: null,
    spotlight: null,
    hemispheric: null
};
let lightsEnabled = {
    ambient: true,
    directional: true,
    point: true,
    spotlight: false,
    hemispheric: false
};

// Add texture loaders
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Game scoring and levels
let score = 0;
let level = 1;
const MAX_LEVELS = 3;

// Add orthographic camera
let orthographicCamera;
let usingOrthographic = false;

// Ball trajectory visualization - changing approach
let trajectoryPoints = [];
const TRAJECTORY_LENGTH = 300; // Reduced length for better performance
const TRAJECTORY_STEP = 0.5;
let trajectoryObjects = []; // Array to hold individual trajectory spheres
let showTrajectory = true;
let trajectoryColor = 0xffff00; // Bright yellow

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    // Setup cameras
    setupCameras();
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add orbit controls for development purposes
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lighting
    setupLighting();

    // Create game objects
    createGameArea();
    createPaddle();
    createBall();
    createBricks();
    
    // Create trajectory AFTER the ball
    createTrajectoryLine();
    
    // Create permanent UI
    createGameUI();

    // Setup input event listeners
    setupInputListeners();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
    
    // Add debug info
    addDebugInfo();
    
    // Make sure the background is visible
    document.body.style.backgroundColor = "#000";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    
    // Force renderer to cover whole window
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Make sure camera points at the game area
    camera.lookAt(0, 0, 0);
    
    // Set trajectory to be visible immediately
    setTimeout(() => {
        forceUpdateTrajectory();
    }, 500);
    
    // Set up a single global click handler at the end
    setupGameClickHandler();
    
    // Display initial instructions
    displayMessage("Brick Breaker 3D", "Click to Start");
}

// Set up multiple cameras for different perspectives
function setupCameras() {
    // Clear existing cameras
    cameras = [];
    
    // Main game camera (perspective from behind)
    const mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    mainCamera.position.set(0, 10, 40);
    mainCamera.lookAt(0, 0, 0);
    mainCamera.name = "Main Camera";
    cameras.push(mainCamera);
    
    // Top-down camera
    const topCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    topCamera.position.set(0, GAME_HEIGHT, 0);
    topCamera.lookAt(0, 0, 0);
    topCamera.name = "Top Camera";
    cameras.push(topCamera);
    
    // Side view camera
    const sideCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    sideCamera.position.set(GAME_WIDTH, 0, 0);
    sideCamera.lookAt(0, 0, 0);
    sideCamera.name = "Side Camera";
    cameras.push(sideCamera);
    
    // Follow ball camera
    const followCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    followCamera.position.set(0, 5, 15);
    followCamera.name = "Follow Ball";
    cameras.push(followCamera);
    
    // First-person paddle camera
    const paddleCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    paddleCamera.position.set(0, 2, 0);
    paddleCamera.lookAt(0, 10, -10);
    paddleCamera.name = "Paddle Camera";
    cameras.push(paddleCamera);
    
    // Add orthographic camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 60;
    orthographicCamera = new THREE.OrthographicCamera(
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
    cameras.push(orthographicCamera);
    
    // Set the active camera
    camera = cameras[currentCameraIndex];
}

// Set up lighting for the scene with multiple light types
function setupLighting() {
    // Clear any existing lights
    for (const key in lights) {
        if (lights[key]) {
            scene.remove(lights[key]);
            lights[key] = null;
        }
    }
    
    // Ambient light for general scene illumination
    lights.ambient = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(lights.ambient);

    // Main directional light (simulates sun)
    lights.directional = new THREE.DirectionalLight(0xffffff, 1);
    lights.directional.position.set(10, 30, 20);
    lights.directional.castShadow = true;
    lights.directional.shadow.camera.left = -50;
    lights.directional.shadow.camera.right = 50;
    lights.directional.shadow.camera.top = 50;
    lights.directional.shadow.camera.bottom = -50;
    lights.directional.shadow.mapSize.width = 1024;
    lights.directional.shadow.mapSize.height = 1024;
    
    // Add directional light helper for debugging
    const directionalHelper = new THREE.DirectionalLightHelper(lights.directional, 5);
    directionalHelper.visible = false;
    lights.directional.helper = directionalHelper;
    scene.add(directionalHelper);
    scene.add(lights.directional);

    // Point light
    lights.point = new THREE.PointLight(0x4477ff, 1, 50);
    lights.point.position.set(0, 5, 15);
    lights.point.castShadow = true;
    
    // Add point light helper
    const pointHelper = new THREE.PointLightHelper(lights.point, 1);
    pointHelper.visible = false;
    lights.point.helper = pointHelper;
    scene.add(pointHelper);
    scene.add(lights.point);
    
    // Spotlight - creates focused beam of light
    lights.spotlight = new THREE.SpotLight(0xffffff, 1);
    lights.spotlight.position.set(0, GAME_HEIGHT/2, GAME_DEPTH/2);
    lights.spotlight.angle = Math.PI / 6; // 30 degrees
    lights.spotlight.penumbra = 0.2;
    lights.spotlight.decay = 2;
    lights.spotlight.distance = 100;
    lights.spotlight.castShadow = true;
    lights.spotlight.shadow.mapSize.width = 1024;
    lights.spotlight.shadow.mapSize.height = 1024;
    lights.spotlight.target.position.set(0, 0, 0);
    scene.add(lights.spotlight.target);
    
    // Add spotlight helper
    const spotlightHelper = new THREE.SpotLightHelper(lights.spotlight);
    spotlightHelper.visible = false;
    lights.spotlight.helper = spotlightHelper;
    scene.add(spotlightHelper);
    scene.add(lights.spotlight);
    
    // Hemispheric light - different colors from sky and ground
    lights.hemispheric = new THREE.HemisphereLight(0x90c0ff, 0x802020, 1);
    lights.hemispheric.position.set(0, GAME_HEIGHT/2, 0);
    
    // Add hemisphere light helper
    const hemisphereHelper = new THREE.HemisphereLightHelper(lights.hemispheric, 5);
    hemisphereHelper.visible = false;
    lights.hemispheric.helper = hemisphereHelper;
    scene.add(hemisphereHelper);
    scene.add(lights.hemispheric);
    
    // Apply initial light states
    updateLightVisibility();
}

// Toggle light visibility based on current settings
function updateLightVisibility() {
    // Update ambient light
    if (lights.ambient) {
        lights.ambient.intensity = lightsEnabled.ambient ? 1.5 : 0;
    }
    
    // Update directional light
    if (lights.directional) {
        lights.directional.intensity = lightsEnabled.directional ? 1 : 0;
        if (lights.directional.helper) {
            lights.directional.helper.visible = lightsEnabled.directional && showHelpers;
        }
    }
    
    // Update point light
    if (lights.point) {
        lights.point.intensity = lightsEnabled.point ? 1 : 0;
        if (lights.point.helper) {
            lights.point.helper.visible = lightsEnabled.point && showHelpers;
        }
    }
    
    // Update spotlight
    if (lights.spotlight) {
        lights.spotlight.intensity = lightsEnabled.spotlight ? 1 : 0;
        if (lights.spotlight.helper) {
            lights.spotlight.helper.visible = lightsEnabled.spotlight && showHelpers;
        }
    }
    
    // Update hemispheric light
    if (lights.hemispheric) {
        lights.hemispheric.intensity = lightsEnabled.hemispheric ? 1 : 0;
        if (lights.hemispheric.helper) {
            lights.hemispheric.helper.visible = lightsEnabled.hemispheric && showHelpers;
        }
    }
}

// Create game boundaries
function createGameArea() {
    const areaGeometry = new THREE.BoxGeometry(GAME_WIDTH, GAME_HEIGHT, GAME_DEPTH);
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    gameArea = new THREE.Mesh(areaGeometry, wireframeMaterial);
    scene.add(gameArea);

    // Create bottom plane (where paddle moves)
    const bottomGeometry = new THREE.PlaneGeometry(GAME_WIDTH, GAME_DEPTH);
    const bottomMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const bottomPlane = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomPlane.rotation.x = Math.PI / 2;
    bottomPlane.position.y = -GAME_HEIGHT/2;
    bottomPlane.receiveShadow = true;
    scene.add(bottomPlane);

    // Add walls
    const wallMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.3
    });
    
    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(1, GAME_HEIGHT, GAME_DEPTH);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -GAME_WIDTH/2;
    scene.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.x = GAME_WIDTH/2;
    scene.add(rightWall);
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(GAME_WIDTH, GAME_HEIGHT, 1);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -GAME_DEPTH/2;
    scene.add(backWall);
    
    // Top wall
    const topWallGeometry = new THREE.BoxGeometry(GAME_WIDTH, 1, GAME_DEPTH);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.y = GAME_HEIGHT/2;
    scene.add(topWall);
}

// Create the paddle (platform)
function createPaddle() {
    const paddleGeometry = new THREE.BoxGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_DEPTH);
    const paddleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2277ff,
        specular: 0x99ccff,
        shininess: 30
    });
    paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.y = -GAME_HEIGHT/2 + PADDLE_HEIGHT;
    paddle.castShadow = true;
    paddle.receiveShadow = true;
    
    // Add a subtle glow effect to the paddle
    const paddleLight = new THREE.PointLight(0x3388ff, 0.6, 10);
    paddleLight.position.set(0, 1, 0);
    paddle.add(paddleLight);
    
    scene.add(paddle);
}

// Create the ball
function createBall() {
    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff5555 });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Position the ball above the paddle
    ball.position.set(0, -GAME_HEIGHT/2 + PADDLE_HEIGHT + BALL_RADIUS * 2, 0);
    
    // Add a small light to the ball to make it more visible
    const ballLight = new THREE.PointLight(0xff6666, 0.7, 10);
    ballLight.position.set(0, 0, 0);
    ball.add(ballLight);
    
    ball.castShadow = true;
    ball.receiveShadow = true;
    scene.add(ball);
    
    // Normalize the initial velocity vector to ensure consistent speed
    ballVelocity.normalize().multiplyScalar(BALL_SPEED);
}

// Create trajectory prediction using individual small spheres
function createTrajectoryLine() {
    console.log("Creating trajectory visualization with spheres");
    
    // Clear any existing trajectory elements
    clearTrajectory();
    
    // Create small spheres for each point in the trajectory
    const sphereGeometry = new THREE.SphereGeometry(BALL_RADIUS * 0.9, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: trajectoryColor,
        transparent: true,
        opacity: 0.80
    });
    
    // Create spheres for each trajectory point
    for (let i = 0; i < TRAJECTORY_LENGTH; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.visible = true;
        scene.add(sphere);
        trajectoryObjects.push(sphere);
    }
    
    // Force an immediate trajectory update
    forceUpdateTrajectory();
}

// Clear all trajectory objects
function clearTrajectory() {
    for (const obj of trajectoryObjects) {
        scene.remove(obj);
    }
    trajectoryObjects = [];
}

// Update trajectory prediction with sphere objects
function forceUpdateTrajectory() {
    if (!ball || trajectoryObjects.length === 0) return;
    
    // Start from current ball position
    const startPos = ball.position.clone();
    
    // Create a predictive velocity vector
    const velocity = ballVelocity.clone().normalize().multiplyScalar(BALL_SPEED);
    const pos = startPos.clone();
    
    // Update position of each trajectory sphere
    for (let i = 0; i < trajectoryObjects.length; i++) {
        // For first point, use ball position
        if (i === 0) {
            trajectoryObjects[i].position.copy(pos);
            continue;
        }
        
        // For subsequent points, simulate physics
        for (let step = 0; step < TRAJECTORY_STEP * 10; step++) {
            // Move forward in smaller increments for more accurate bounces
            pos.add(velocity.clone().multiplyScalar(TRAJECTORY_STEP / 10));
            
            // Handle bounces
            if (pos.x <= -GAME_WIDTH/2 + BALL_RADIUS || pos.x >= GAME_WIDTH/2 - BALL_RADIUS) {
                velocity.x *= -1;
            }
            if (pos.y >= GAME_HEIGHT/2 - BALL_RADIUS) {
                velocity.y *= -1;
            }
            if (pos.z <= -GAME_DEPTH/2 + BALL_RADIUS || pos.z >= GAME_DEPTH/2 - BALL_RADIUS) {
                velocity.z *= -1;
            }
        }
        
        // Update sphere position
        trajectoryObjects[i].position.copy(pos);
        
        // Fade out spheres as they get further from the ball
        trajectoryObjects[i].material.opacity = 0.7 * (1 - i / trajectoryObjects.length);
    }
}

// Update trajectory visibility and positions - modified to always show trajectory
function updateTrajectory() {
    // Exit if no trajectory
    if (trajectoryObjects.length === 0) return;
    
    // Update visibility based on toggle - CHANGED to always show when enabled
    const shouldBeVisible = showTrajectory; // Removed conditions that hide during gameplay
    
    trajectoryObjects.forEach(sphere => {
        sphere.visible = shouldBeVisible;
    });
    
    // Only update positions if visible
    if (shouldBeVisible) {
        forceUpdateTrajectory();
    }
}

// Reset the ball position (when player loses a ball)
function resetBall() {
    gameStarted = false;
    ball.position.set(0, -GAME_HEIGHT/2 + PADDLE_HEIGHT + BALL_RADIUS * 2, 0);
    ballVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2, // Random X direction
        0.15,                         // Upward Y direction
        (Math.random() - 0.5) * 0.1   // Random Z direction
    );
    ballVelocity.normalize().multiplyScalar(BALL_SPEED);
    
    // Ensure trajectory is visible
    clearTrajectory();
    createTrajectoryLine();
    updateTrajectory();
}

// Create the brick pattern - repositioned horizontally instead of vertically
function createBricks() {
    // Clear existing bricks if any
    for (const brick of bricks) {
        scene.remove(brick);
    }
    bricks = [];
    
    // Load brick textures
    const brickTextures = [
        textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'),
        textureLoader.load('https://threejs.org/examples/textures/brick_bump.jpg')
    ];
    
    // Configure brick layout based on level
    let config;
    switch(level) {
        case 1:
            config = { rows: 4, cols: 8, layers: 2, pattern: 'standard' };
            break;
        case 2:
            config = { rows: 5, cols: 10, layers: 3, pattern: 'pyramid' };
            break;
        case 3:
            config = { rows: 6, cols: 12, layers: 3, pattern: 'complex' };
            break;
        default:
            config = { rows: 4, cols: 8, layers: 2, pattern: 'standard' };
    }
    
    // Create a horizontal arrangement of bricks (more like traditional Brick Breaker)
    // With multiple layers in depth
    
    const rows = config.rows;        // Horizontal rows (along Z axis)
    const cols = config.cols;       // Columns (along X axis)
    const layers = config.layers;      // Vertical layers (along Y axis)
    
    // Add spacing between bricks
    const brickSpacingX = 0.8;  // Horizontal spacing
    const brickSpacingY = 1.2;  // Vertical spacing
    const brickSpacingZ = 0.8;  // Depth spacing
    
    // Calculate total width and adjust starting positions for proper centering
    const totalWidth = cols * (BRICK_WIDTH + brickSpacingX) - brickSpacingX;
    const totalDepth = rows * (BRICK_DEPTH + brickSpacingZ) - brickSpacingZ;
    
    const startX = -totalWidth / 2 + BRICK_WIDTH / 2;
    const startY = GAME_HEIGHT/3; // Position bricks in upper third of game area
    const startZ = -totalDepth / 2 + BRICK_DEPTH / 2;
    
    // Create brick layers
    for (let layer = 0; layer < layers; layer++) {
        const layerY = startY - layer * (BRICK_HEIGHT + brickSpacingY);
        
        for (let row = 0; row < rows; row++) {
            const rowZ = startZ + row * (BRICK_DEPTH + brickSpacingZ);
            
            for (let col = 0; col < cols; col++) {
                // Skip some bricks in a pattern for visual interest
                if ((layer + row + col) % 7 === 0) continue;
                
                const brickGeometry = new THREE.BoxGeometry(BRICK_WIDTH, BRICK_HEIGHT, BRICK_DEPTH);
                
                // Create more interesting color patterns based on position
                let color;
                if (layer === 0) {
                    color = (row + col) % 2 === 0 ? 0xff8844 : 0xffaa66; // Orange scheme
                } else if (layer === 1) {
                    color = (row + col) % 2 === 0 ? 0x44ff88 : 0x66ffaa; // Green scheme
                } else {
                    color = (row + col) % 2 === 0 ? 0x8844ff : 0xaa66ff; // Purple scheme
                }
                
                const brickMaterial = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0xffffff,
                    shininess: 50,
                    map: brickTextures[0],
                    bumpMap: brickTextures[1]
                });
                
                const brick = new THREE.Mesh(brickGeometry, brickMaterial);
                
                // Position the brick with proper spacing
                brick.position.set(
                    startX + col * (BRICK_WIDTH + brickSpacingX),
                    layerY,
                    rowZ
                );
                
                brick.castShadow = true;
                brick.receiveShadow = true;
                
                // Store the brick's value/points (more points for deeper layers)
                brick.userData = {
                    points: 10 * (layer + 1),
                    hits: 1, // How many hits needed to destroy
                    active: true // Flag to track if brick is active
                };
                
                // Create a bounding box for collision detection
                brick.geometry.computeBoundingBox();
                
                scene.add(brick);
                bricks.push(brick);
            }
        }
    }
}

// Set up input listeners for keyboard and mouse
function setupInputListeners() {
    // Existing keyboard events
    window.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
                keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
                keys.up = true;
                break;
            case 'ArrowDown':
            case 's':
                keys.down = true;
                break;
            case 'm':
                // Toggle between mouse and keyboard control
                useMouse = !useMouse;
                console.log(`Using ${useMouse ? 'mouse' : 'keyboard'} control`);
                break;
            case 'c':
                // Switch camera
                currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
                camera = cameras[currentCameraIndex];
                controls.object = camera;
                break;
            case 'h':
                // Toggle helpers
                showHelpers = !showHelpers;
                updateLightVisibility();
                break;
            case '1': // Ambient
                lightsEnabled.ambient = !lightsEnabled.ambient;
                updateLightVisibility();
                break;
            case '2': // Directional
                lightsEnabled.directional = !lightsEnabled.directional;
                updateLightVisibility();
                break;
            case '3': // Point
                lightsEnabled.point = !lightsEnabled.point;
                updateLightVisibility();
                break;
            case '4': // Spotlight
                lightsEnabled.spotlight = !lightsEnabled.spotlight;
                updateLightVisibility();
                break;
            case '5': // Hemispheric
                lightsEnabled.hemispheric = !lightsEnabled.hemispheric;
                updateLightVisibility();
                break;
            case 'o':
                // Toggle between orthographic and perspective cameras
                toggleCameraType();
                break;
            case 't':
                // Toggle trajectory prediction
                toggleTrajectory();
                break;
        }
    });

    window.addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
            case 'a':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
                keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
                keys.down = false;
                break;
        }
    });

    // Mouse movement - convert mouse position to game coordinates
    document.addEventListener('mousemove', (event) => {
        // Calculate mouse position relative to canvas
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Convert to normalized coordinates (-1 to 1)
        const normalizedX = (mouseX / window.innerWidth) * 2 - 1;
        const normalizedY = -(mouseY / window.innerHeight) * 2 + 1;
        
        // Map normalized coordinates to game space
        mousePosition.x = normalizedX * (GAME_WIDTH / 2);
        
        // Map Y mouse position to Z in game (for 3D movement)
        const zRange = GAME_DEPTH / 3; // Restrict to front third of game area
        mousePosition.z = normalizedY * zRange;
    });
}

// Handle window resize
function onWindowResize() {
    // Update all cameras
    for (let i = 0; i < cameras.length; i++) {
        cameras[i].aspect = window.innerWidth / window.innerHeight;
        cameras[i].updateProjectionMatrix();
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update ball position with physics
function updateBall() {
    if (!gameStarted || levelComplete) return;
    
    // Move the ball according to its velocity
    ball.position.x += ballVelocity.x;
    ball.position.y += ballVelocity.y;
    ball.position.z += ballVelocity.z;
    
    // Apply a small rotation to the ball for visual effect
    ball.rotation.x += 0.02;
    ball.rotation.z += 0.02;
    
    // Boundary collisions
    // X boundaries (left/right walls)
    if (ball.position.x > GAME_WIDTH/2 - BALL_RADIUS || ball.position.x < -GAME_WIDTH/2 + BALL_RADIUS) {
        ballVelocity.x *= -1;
    }
    
    // Y boundaries (top/bottom)
    if (ball.position.y > GAME_HEIGHT/2 - BALL_RADIUS) {
        ballVelocity.y *= -1;
    }
    
    // Z boundaries (back wall)
    if (ball.position.z < -GAME_DEPTH/2 + BALL_RADIUS || ball.position.z > GAME_DEPTH/2 - BALL_RADIUS) {
        ballVelocity.z *= -1;
    }
    
    // Check if ball fell below the paddle (game over condition)
    if (ball.position.y < -GAME_HEIGHT/2) {
        gameOver = true;
        displayMessage("Game Over", "Click to restart");
        resetBall();
    }
    
    // Basic paddle collision with improved 3D detection
    if (ball.position.y <= paddle.position.y + PADDLE_HEIGHT/2 + BALL_RADIUS && 
        ball.position.y >= paddle.position.y - BALL_RADIUS &&
        ball.position.x >= paddle.position.x - PADDLE_WIDTH/2 - BALL_RADIUS &&
        ball.position.x <= paddle.position.x + PADDLE_WIDTH/2 + BALL_RADIUS &&
        ball.position.z >= paddle.position.z - PADDLE_DEPTH/2 - BALL_RADIUS &&
        ball.position.z <= paddle.position.z + PADDLE_DEPTH/2 + BALL_RADIUS) {
        
        // Calculate where on the paddle the ball hit (both X and Z)
        const paddleImpactX = (ball.position.x - paddle.position.x) / (PADDLE_WIDTH/2);
        const paddleImpactZ = (ball.position.z - paddle.position.z) / (PADDLE_DEPTH/2);
        
        // Determine if the hit is on top or sides of the paddle
        const hitTop = ball.position.y > paddle.position.y &&
                       Math.abs(paddleImpactX) < 1 &&
                       Math.abs(paddleImpactZ) < 1;
                       
        if (hitTop) {
            // Reverse vertical direction
            ballVelocity.y = Math.abs(ballVelocity.y);
            
            // Add influence from paddle impact position
            ballVelocity.x += paddleImpactX * 0.2;
            ballVelocity.z += paddleImpactZ * 0.2;
        } else {
            // Hit the side of the paddle
            if (Math.abs(paddleImpactX) > Math.abs(paddleImpactZ)) {
                // Hit left or right side
                ballVelocity.x = Math.sign(paddleImpactX) * Math.abs(ballVelocity.x);
            } else {
                // Hit front or back
                ballVelocity.z = Math.sign(paddleImpactZ) * Math.abs(ballVelocity.z);
            }
        }
        
        // Maintain constant ball speed
        ballVelocity.normalize().multiplyScalar(BALL_SPEED);
    }
    
    // Check for collisions with bricks
    checkBrickCollisions();
}

// Check for collisions between the ball and all active bricks
function checkBrickCollisions() {
    // Create a sphere representing the ball for collision detection
    const ballSphere = new THREE.Sphere(ball.position, BALL_RADIUS);
    
    // Check each brick for collision
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        
        // Skip inactive bricks
        if (!brick.userData.active) continue;
        
        // Get the brick's bounding box in world space
        const brickBox = new THREE.Box3().setFromObject(brick);
        
        // Check if the ball intersects with the brick
        if (ballSphere.intersectsBox(brickBox)) {
            // Handle the collision
            handleBrickCollision(brick, brickBox);
            
            // Only process one brick collision per frame (prevents multiple bricks destruction in a single frame)
            break;
        }
    }
}

// Handle collision with a brick
function handleBrickCollision(brick, brickBox) {
    // Determine which face of the brick was hit
    const ballPos = ball.position.clone();
    const brickCenter = new THREE.Vector3();
    brickBox.getCenter(brickCenter);
    
    // Vector from brick center to ball
    const ballToBrick = ballPos.clone().sub(brickCenter);
    
    // Get the size of the brick
    const brickSize = new THREE.Vector3();
    brickBox.getSize(brickSize);
    
    // Calculate the penetration depths in each direction
    const xPenetration = brickSize.x/2 + BALL_RADIUS - Math.abs(ballToBrick.x);
    const yPenetration = brickSize.y/2 + BALL_RADIUS - Math.abs(ballToBrick.y);
    const zPenetration = brickSize.z/2 + BALL_RADIUS - Math.abs(ballToBrick.z);
    
    // Determine the most shallow penetration
    if (xPenetration < yPenetration && xPenetration < zPenetration) {
        // X-axis collision (left or right)
        ballVelocity.x *= -1;
    } else if (yPenetration < xPenetration && yPenetration < zPenetration) {
        // Y-axis collision (top or bottom)
        ballVelocity.y *= -1;
    } else {
        // Z-axis collision (front or back)
        ballVelocity.z *= -1;
    }
    
    // Decrease the brick's hit count
    brick.userData.hits--;
    
    // If the brick has no more hits left, deactivate it
    if (brick.userData.hits <= 0) {
        deactivateBrick(brick);
    } else {
        // Just fade the brick a bit if it's not destroyed
        brick.material.opacity = 0.7;
    }
}

// Deactivate a brick when hit
function deactivateBrick(brick) {
    // Make the brick invisible and not collidable
    brick.userData.active = false;
    
    // Add a simple animation effect
    animateBrickDestruction(brick);
    
    // Check if all bricks are destroyed
    checkLevelComplete();
}

// Simple animation for brick destruction
function animateBrickDestruction(brick) {
    // Scale down the brick
    const scaleFactor = 0.95;
    
    // Animation function
    function animateStep() {
        if (brick.scale.x > 0.1) {
            brick.scale.multiplyScalar(scaleFactor);
            brick.material.opacity *= scaleFactor;
            requestAnimationFrame(animateStep);
        } else {
            // Remove the brick from the scene
            scene.remove(brick);
        }
    }
    
    // Start animation
    animateStep();
}

// Check if all bricks are destroyed (level complete)
function checkLevelComplete() {
    // Check if any active bricks remain
    const activeBricks = bricks.filter(brick => brick.userData.active);
    
    if (activeBricks.length === 0) {
        levelComplete = true;
        
        // Create and display level complete message
        displayMessage("Level Complete!", "Click to continue");
        
        // Reset game state but don't restart automatically
        gameStarted = false;
        
        // Listen for click to restart
        document.addEventListener('click', () => {
            if (levelComplete) {
                resetGame();
                levelComplete = false;
            }
        }, { once: true });
    }
}

// Reset the entire game
function resetGame() {
    // Reset game state flags first
    gameOver = false;
    levelComplete = false;
    gameStarted = false;
    
    // Reset ball
    resetBall();
    
    // Create new bricks
    createBricks();
    
    // Reset paddle position
    paddle.position.set(0, -GAME_HEIGHT/2 + PADDLE_HEIGHT, 0);
    
    // Make sure trajectory is showing
    updateTrajectory();
    
    console.log("Game reset complete");
}

// Display a message on screen
function displayMessage(title, subtitle) {
    // Remove any existing message
    const existingMessage = document.getElementById('game-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.id = 'game-message';
    messageContainer.style.position = 'absolute';
    messageContainer.style.top = '50%';
    messageContainer.style.left = '50%';
    messageContainer.style.transform = 'translate(-50%, -50%)';
    messageContainer.style.color = 'white';
    messageContainer.style.fontFamily = 'Arial, sans-serif';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.padding = '20px';
    messageContainer.style.background = 'rgba(0, 0, 0, 0.7)';
    messageContainer.style.borderRadius = '10px';
    messageContainer.style.zIndex = '100';
    
    // Create title
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    titleElement.style.margin = '0 0 10px 0';
    messageContainer.appendChild(titleElement);
    
    // Create subtitle
    const subtitleElement = document.createElement('p');
    subtitleElement.textContent = subtitle;
    subtitleElement.style.margin = '0';
    messageContainer.appendChild(subtitleElement);
    
    // Add to document
    document.body.appendChild(messageContainer);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageContainer.style.opacity = '0';
        messageContainer.style.transition = 'opacity 1s';
        setTimeout(() => messageContainer.remove(), 1000);
    }, 5000);
}

// Start the game (launch the ball) - fixed to work with the new trajectory system
function startGame() {
    if (gameStarted) return;
    
    console.log("Starting game...");
    gameStarted = true;
    
    // Update trajectory visibility
    updateTrajectory();
    
    // Remove any displayed messages
    const existingMessage = document.getElementById('game-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Display control instructions
    console.log("Controls: Use mouse to move paddle, or WASD/arrow keys. Press 'M' to toggle between mouse and keyboard.");
}

// Update paddle position based on input
function updatePaddle() {
    if (useMouse) {
        // Mouse control - move paddle toward mouse position with smooth interpolation
        paddle.position.x += (mousePosition.x - paddle.position.x) * 0.1;
        
        // Limit Z movement to front half of game area
        const targetZ = Math.max(-GAME_DEPTH/6, Math.min(GAME_DEPTH/3, mousePosition.z));
        paddle.position.z += (targetZ - paddle.position.z) * 0.1;
    } else {
        // Keyboard control
        if (keys.left) {
            paddle.position.x -= PADDLE_SPEED;
        }
        if (keys.right) {
            paddle.position.x += PADDLE_SPEED;
        }
        if (keys.up) {
            paddle.position.z -= PADDLE_SPEED;
        }
        if (keys.down) {
            paddle.position.z += PADDLE_SPEED;
        }
    }
    
    // Constrain paddle to game boundaries
    const paddleHalfWidth = PADDLE_WIDTH / 2;
    const paddleHalfDepth = PADDLE_DEPTH / 2;
    
    // X boundaries (left/right)
    paddle.position.x = Math.max(-GAME_WIDTH/2 + paddleHalfWidth, 
                         Math.min(GAME_WIDTH/2 - paddleHalfWidth, paddle.position.x));
    
    // Z boundaries (front/back)
    paddle.position.z = Math.max(-GAME_DEPTH/2 + paddleHalfDepth, 
                         Math.min(GAME_DEPTH/2 - paddleHalfDepth, paddle.position.z));
    
    // Add a slight tilt to the paddle based on movement direction (visual effect)
    const tiltFactor = 0.1;
    if (useMouse) {
        paddle.rotation.z = (mousePosition.x - paddle.position.x) * tiltFactor;
        paddle.rotation.x = (paddle.position.z - mousePosition.z) * tiltFactor;
    } else {
        // Tilt based on keyboard input
        paddle.rotation.z = ((keys.right ? -1 : 0) + (keys.left ? 1 : 0)) * tiltFactor;
        paddle.rotation.x = ((keys.up ? -1 : 0) + (keys.down ? 1 : 0)) * tiltFactor;
    }
}

// Debugging function to log key events
function addDebugInfo() {
    // Add a debug div to show status
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.position = 'absolute';
    debugDiv.style.bottom = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.color = 'white';
    debugDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
    debugDiv.style.padding = '10px';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.zIndex = '1000';
    document.body.appendChild(debugDiv);
    
    // Update debug info
    function updateDebugInfo() {
        if (!debugDiv) return;
        debugDiv.innerHTML = `
            Camera: ${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)}<br>
            Ball: ${ball.position.x.toFixed(1)}, ${ball.position.y.toFixed(1)}, ${ball.position.z.toFixed(1)}<br>
            Ball Velocity: ${ballVelocity.x.toFixed(2)}, ${ballVelocity.y.toFixed(2)}, ${ballVelocity.z.toFixed(2)}<br>
            Game Started: ${gameStarted}<br>
            Level Complete: ${levelComplete}<br>
            Game Over: ${gameOver}<br>
            Active Bricks: ${bricks.filter(b => b.userData.active).length}<br>
            Controls: ${useMouse ? 'Mouse' : 'Keyboard'}<br>
        `;
        requestAnimationFrame(updateDebugInfo);
    }
    updateDebugInfo();
}

// Create a permanent game UI
function createGameUI() {
    // Remove any existing UI
    const existingUI = document.getElementById('game-ui');
    if (existingUI) {
        existingUI.remove();
    }
    
    // Create UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'game-ui';
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '20px';
    uiContainer.style.right = '20px';
    uiContainer.style.padding = '15px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.borderRadius = '8px';
    uiContainer.style.zIndex = '100';
    uiContainer.style.userSelect = 'none';
    uiContainer.style.minWidth = '220px';
    
    // Create game info section
    const gameInfo = document.createElement('div');
    gameInfo.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #4488ff;">Brick Breaker 3D</h3>
        <div id="game-stats">
            <div>Bricks: <span id="brick-count">0</span></div>
            <div>Camera: <span id="camera-name">Main</span></div>
        </div>
    `;
    uiContainer.appendChild(gameInfo);
    
    // Create control hints
    const controlHints = document.createElement('div');
    controlHints.style.marginTop = '10px';
    controlHints.style.fontSize = '12px';
    controlHints.innerHTML = `
        <div style="color: #aaffaa; margin-bottom: 5px;">Controls:</div>
        <div>Movement: Mouse or WASD</div>
        <div>Toggle Mouse/Keyboard: M</div>
        <div>Change Camera: C</div>
        <div>Toggle Orthographic: O</div>
        <div>Toggle Lights: 1-5</div>
        <div>Toggle Helpers: H</div>
        <div>Toggle Trajectory: T</div>
        <div>Restart: R</div>
    `;
    uiContainer.appendChild(controlHints);
    
    // Create light indicators section
    const lightIndicators = document.createElement('div');
    lightIndicators.style.marginTop = '10px';
    lightIndicators.innerHTML = `
        <div style="color: #ffaaaa; margin-bottom: 5px;">Lights:</div>
        <div id="light-indicators">
            <div>Ambient (1): <span id="ambient-status" style="color: #88ff88;">ON</span></div>
            <div>Directional (2): <span id="directional-status" style="color: #88ff88;">ON</span></div>
            <div>Point (3): <span id="point-status" style="color: #88ff88;">ON</span></div>
            <div>Spotlight (4): <span id="spotlight-status" style="color: #ff8888;">OFF</span></div>
            <div>Hemispheric (5): <span id="hemispheric-status" style="color: #ff8888;">OFF</span></div>
        </div>
    `;
    uiContainer.appendChild(lightIndicators);
    
    // Add score display
    const scoreSection = document.createElement('div');
    scoreSection.innerHTML = `
        <div style="margin-top: 10px;">
            <div>Score: <span id="score-value">0</span></div>
            <div>Level: <span id="level-value">1</span></div>
            <div>Camera Type: <span id="camera-type">Perspective</span></div>
            <div>Trajectory: <span id="trajectory-status">ON</span></div>
        </div>
    `;
    uiContainer.appendChild(scoreSection);
    
    // Add to document
    document.body.appendChild(uiContainer);
    
    // Start UI update loop
    updateUI();
}

// Update UI information
function updateUI() {
    // Update brick count
    const brickCount = document.getElementById('brick-count');
    if (brickCount) {
        brickCount.textContent = bricks.filter(brick => brick.userData.active).length;
    }
    
    // Update camera name
    const cameraName = document.getElementById('camera-name');
    if (cameraName && camera) {
        cameraName.textContent = camera.name || 'Unknown';
    }
    
    // Update light status indicators
    for (const light in lightsEnabled) {
        const statusElement = document.getElementById(`${light}-status`);
        if (statusElement) {
            statusElement.textContent = lightsEnabled[light] ? 'ON' : 'OFF';
            statusElement.style.color = lightsEnabled[light] ? '#88ff88' : '#ff8888';
        }
    }
    
    // Update score and level
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
        scoreValue.textContent = score;
    }
    
    const levelValue = document.getElementById('level-value');
    if (levelValue) {
        levelValue.textContent = level;
    }
    
    const cameraType = document.getElementById('camera-type');
    if (cameraType) {
        cameraType.textContent = usingOrthographic ? 'Orthographic' : 'Perspective';
    }
    
    // Update trajectory status
    const trajectoryStatus = document.getElementById('trajectory-status');
    if (trajectoryStatus) {
        trajectoryStatus.textContent = showTrajectory ? 'ON' : 'OFF';
        trajectoryStatus.style.color = showTrajectory ? '#88ff88' : '#ff8888';
    }
    
    // Continue updating
    requestAnimationFrame(updateUI);
}

// Variables for helpers
let showHelpers = false;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Always update trajectory (function will handle visibility)
    updateTrajectory();
    
    // Only update paddle and ball if not in level complete state
    if (!levelComplete) {
        // Update paddle position based on input
        updatePaddle();
        
        // Update ball physics (if game is started)
        updateBall();
        
        // Update follow camera to track the ball
        if (cameras[3] && ball) { // Index 3 is the follow camera
            const followOffset = new THREE.Vector3(0, 5, 15);
            cameras[3].position.copy(ball.position).add(followOffset);
            cameras[3].lookAt(ball.position);
        }
        
        // Update paddle camera
        if (cameras[4] && paddle) { // Index 4 is the paddle camera
            cameras[4].position.set(
                paddle.position.x,
                paddle.position.y + 2,
                paddle.position.z
            );
            cameras[4].lookAt(
                paddle.position.x,
                paddle.position.y + 10,
                paddle.position.z - 10
            );
        }
        
        // Update spotlight to track the ball for dynamic lighting effects
        if (lights.spotlight && ball) {
            lights.spotlight.target.position.copy(ball.position);
            if (lights.spotlight.helper) {
                lights.spotlight.helper.update();
            }
        }
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle toggle between perspective and orthographic cameras
function toggleCameraType() {
    usingOrthographic = !usingOrthographic;
    
    if (usingOrthographic) {
        // Switch to the orthographic camera (last in the cameras array)
        camera = cameras[cameras.length - 1];
    } else {
        // Return to the previously selected perspective camera
        camera = cameras[currentCameraIndex];
    }
    
    // Update controls
    controls.object = camera;
}

// Toggle trajectory on/off clearly
function toggleTrajectory() {
    showTrajectory = !showTrajectory;
    
    if (!showTrajectory) {
        trajectoryObjects.forEach(sphere => {
            sphere.visible = false;
        });
    } else {
        forceUpdateTrajectory();
    }
    
    console.log(`Trajectory ${showTrajectory ? 'enabled' : 'disabled'}`);
}

// Improved global click handler
function setupGameClickHandler() {
    // Remove any existing click handlers first
    document.removeEventListener('click', handleGameClick);
    
    // Add a single click handler for all game states
    document.addEventListener('click', handleGameClick);
}

// Centralized click handler function that handles all game states
function handleGameClick(event) {
    console.log("Click detected, game state:", gameStarted, levelComplete, gameOver);
    
    if (levelComplete) {
        console.log("Starting next level");
        resetGame();
        levelComplete = false;
        return;
    }
    
    if (gameOver) {
        console.log("Restarting after game over");
        resetGame();
        return;
    }
    
    if (!gameStarted) {
        console.log("Starting game");
        startGame();
        return;
    }
}

// Initialize the app (moved to bottom)
init();

// In case of white screen, provide fallback message
window.onload = function() {
    // If canvas isn't being rendered properly, this message will appear
    setTimeout(() => {
        if (document.body.childElementCount <= 1) {
            alert("WebGL may not be working correctly. Please ensure your browser supports WebGL and that it's enabled.");
        }
    }, 2000);
};

// Add key handler for debugging controls
document.addEventListener('keydown', (event) => {
    if (event.key === 'r') {
        console.log("Resetting game");
        resetGame();
    }
    if (event.key === 'd') {
        console.log("Debug info toggled");
        const debugDiv = document.getElementById('debug-info');
        if (debugDiv) {
            debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
        }
    }
});