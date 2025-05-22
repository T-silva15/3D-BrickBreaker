import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { state, constants } from './game.js';
import { createPowerUp, POWERUP_TYPE } from './powerups.js';

// State for the display mode
const displayState = {
    active: false,
    scene: null,
    camera: null,
    controls: null,
    renderer: null,
    objects: [],
    rotating: true,
    rotationSpeed: 0.005
};

// Create a display gallery scene
export function createDisplayGallery() {
    // Use the existing renderer
    displayState.renderer = state.renderer;
    
    // Create a new scene
    displayState.scene = new THREE.Scene();
    displayState.scene.background = new THREE.Color(0x111122);
    
    // Create a camera specifically for the display
    const camera = new THREE.PerspectiveCamera(
        70, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);
    displayState.camera = camera;
    
    // Add orbit controls for easy object viewing
    displayState.controls = new OrbitControls(camera, displayState.renderer.domElement);
    displayState.controls.enableDamping = true;
    displayState.controls.dampingFactor = 0.05;
    
    // Add lighting to the display scene
    setupDisplayLighting();
    
    // Create a floor/platform for the objects
    createDisplayPlatform();
    
    // Create and position all game objects
    createDisplayObjects();
    
    // Create object labels
    createObjectLabels();
    
    // Mark display as active
    displayState.active = true;
    
    // Start rendering the display
    animateDisplay();
    
    // Add UI for display mode
    createDisplayUI();
}

// Set up lighting for the display scene
function setupDisplayLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    displayState.scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    displayState.scene.add(directionalLight);
    
    // Add a point light for better highlighting
    const pointLight = new THREE.PointLight(0x6633ff, 1, 20);
    pointLight.position.set(-5, 8, -5);
    displayState.scene.add(pointLight);
}

// Create a platform/floor for displaying objects
function createDisplayPlatform() {
    const platformGeometry = new THREE.CylinderGeometry(15, 15, 0.5, 32);
    const platformMaterial = new THREE.MeshStandardMaterial({
        color: 0x222244,
        metalness: 0.7,
        roughness: 0.2,
    });
    
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -5;
    platform.receiveShadow = true;
    
    displayState.scene.add(platform);
    
    // Add a grid for better spatial reference
    const gridHelper = new THREE.GridHelper(30, 30, 0x444444, 0x222222);
    gridHelper.position.y = -4.74;
    displayState.scene.add(gridHelper);
}

// Create all game objects for display
function createDisplayObjects() {
    // Create a ball using the same function from objects.js
    createDisplayBall();
    
    // Create a paddle using the same function
    createDisplayPaddle();
    
    // Create different types of bricks
    createDisplayBricks();
    
    // Create all powerup types
    createDisplayPowerups();
}

// Create a ball for display
function createDisplayBall() {
    // Import the actual createBall function would cause circular dependencies
    // so we'll recreate a simpler version for display
    
    const ballGeometry = new THREE.SphereGeometry(constants.BALL_RADIUS, 32, 32);
    
    // Create cyberpunk texture for the ball
    const ballTexture = createCyberpunkBallTexture();
    
    // Improve texture mapping for spherical geometry
    ballTexture.mapping = THREE.EquirectangularMapping;
    ballTexture.wrapS = THREE.RepeatWrapping;
    ballTexture.wrapT = THREE.RepeatWrapping;
    ballTexture.repeat.set(1, 1);
    
    // Create material with the texture - use emissive for better visibility
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0x0033ff,
        emissiveIntensity: 0.4,
        map: ballTexture
    });
    
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Store texture for animation
    ball.userData.texture = ballTexture;
    ball.userData.rotationSpeed = 0.02;
    ball.userData.type = "ball";
    ball.userData.label = "Game Ball";
    
    // Position the ball
    ball.position.set(-8, 0, 0);
    
    // Add a small light to the ball
    const ballLight = new THREE.PointLight(0x3366ff, 1.2, 10);
    ballLight.position.set(0, 0, 0);
    ball.add(ballLight);
    
    ball.castShadow = true;
    ball.receiveShadow = true;
    displayState.scene.add(ball);
    displayState.objects.push(ball);
}

// Create paddle for display
function createDisplayPaddle() {
    const paddleGeometry = new THREE.BoxGeometry(
        constants.PADDLE_WIDTH, 
        constants.PADDLE_HEIGHT, 
        constants.PADDLE_DEPTH
    );
    
    // Use the cyberpunk texture for the paddle
    const paddleTexture = createCyberpunkPaddleTexture();
    
    const paddleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7722aa,
        specular: 0xcc99ff,
        shininess: 30,
        map: paddleTexture,
        emissive: 0x330066,
        emissiveIntensity: 0.3
    });
    
    const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddle.position.set(8, 0, 0);
    paddle.castShadow = true;
    paddle.receiveShadow = true;
    paddle.userData.type = "paddle";
    paddle.userData.label = "Player Paddle";
    
    // Add a subtle glow effect
    const paddleLight = new THREE.PointLight(0xaa33ff, 1.0, 10);
    paddleLight.position.set(0, 1, 0);
    paddle.add(paddleLight);
    
    displayState.scene.add(paddle);
    displayState.objects.push(paddle);
}

// Create bricks for display
function createDisplayBricks() {
    // Create cyberpunk brick textures with different color variants
    const brickTextures = [
        createCyberpunkBrickTexture('#ff00ff'), // Magenta
        createCyberpunkBrickTexture('#00ffff'), // Cyan
        createCyberpunkBrickTexture('#ffcc00')  // Gold
    ];
    
    const emissiveColors = [
        new THREE.Color(0x330033), // Dim magenta
        new THREE.Color(0x003333), // Dim cyan
        new THREE.Color(0x332200)  // Dim gold
    ];
    
    // Position the bricks in a row at the top
    for (let i = 0; i < 3; i++) {
        const brickGeometry = new THREE.BoxGeometry(
            constants.BRICK_WIDTH, 
            constants.BRICK_HEIGHT, 
            constants.BRICK_DEPTH
        );
        
        const brickMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 50,
            map: brickTextures[i],
            emissive: emissiveColors[i],
            emissiveIntensity: 0.5
        });
        
        const brick = new THREE.Mesh(brickGeometry, brickMaterial);
        
        // Position in a line at the back
        brick.position.set((i - 1) * 5, 0, -8);
        
        brick.castShadow = true;
        brick.receiveShadow = true;
        brick.userData.type = "brick";
        brick.userData.label = `Brick Type ${i+1}`;
        
        displayState.scene.add(brick);
        displayState.objects.push(brick);
    }
}

// Create powerups for display
function createDisplayPowerups() {
    const powerupTypes = [
        POWERUP_TYPE.PADDLE_SIZE_UP,
        POWERUP_TYPE.PADDLE_DOUBLE_SIZE,
        POWERUP_TYPE.MULTI_BALL,
        POWERUP_TYPE.EXPLOSIVE_BALL,
        POWERUP_TYPE.BARRIER
    ];
    
    const powerupLabels = {
        [POWERUP_TYPE.PADDLE_SIZE_UP]: "Paddle Size Up",
        [POWERUP_TYPE.PADDLE_DOUBLE_SIZE]: "Paddle Double Size",
        [POWERUP_TYPE.MULTI_BALL]: "Multi Ball",
        [POWERUP_TYPE.EXPLOSIVE_BALL]: "Explosive Ball",
        [POWERUP_TYPE.BARRIER]: "Barrier"
    };
    
    // Position the powerups in a semi-circle
    for (let i = 0; i < powerupTypes.length; i++) {
        const angle = (i / powerupTypes.length) * Math.PI;
        const x = Math.cos(angle) * 8;
        const z = Math.sin(angle) * 8 + 4; // Offset forward
        
        const powerup = createPowerUp(new THREE.Vector3(0, 0, 0), powerupTypes[i]);
        powerup.position.set(x, 3, z); // Elevate the powerups
        
        // Add rotation data
        powerup.userData.type = "powerup";
        powerup.userData.powerupType = powerupTypes[i];
        powerup.userData.label = powerupLabels[powerupTypes[i]];
        powerup.userData.rotationSpeed = 0.01;
        
        displayState.scene.add(powerup);
        displayState.objects.push(powerup);
    }
}

// Create text labels for objects
function createObjectLabels() {
    // Create text labels using HTML and CSS
    // This is easier than using Three.js text geometries
    
    const labelContainer = document.createElement('div');
    labelContainer.id = 'display-labels';
    labelContainer.style.position = 'absolute';
    labelContainer.style.top = '0';
    labelContainer.style.left = '0';
    labelContainer.style.width = '100%';
    labelContainer.style.height = '100%';
    labelContainer.style.pointerEvents = 'none';
    document.body.appendChild(labelContainer);
    
    // Store for later updates
    displayState.labelContainer = labelContainer;
}

// Update the position of labels in the 2D overlay
function updateObjectLabels() {
    // Clear existing labels
    if (displayState.labelContainer) {
        displayState.labelContainer.innerHTML = '';
        
        // Create labels for each object
        displayState.objects.forEach(object => {
            // Convert 3D position to 2D screen coordinates
            const position = object.position.clone();
            position.y += 2; // Position label above object
            
            // Project position to 2D screen space
            position.project(displayState.camera);
            
            // Convert to screen coordinates
            const x = (position.x * 0.5 + 0.5) * window.innerWidth;
            const y = -(position.y * 0.5 - 0.5) * window.innerHeight;
            
            // Create label element
            const label = document.createElement('div');
            label.textContent = object.userData.label || 'Object';
            label.style.position = 'absolute';
            label.style.left = `${x}px`;
            label.style.top = `${y}px`;
            label.style.transform = 'translate(-50%, -50%)';
            label.style.color = 'white';
            label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            label.style.padding = '5px 10px';
            label.style.borderRadius = '4px';
            label.style.fontSize = '14px';
            label.style.fontFamily = 'Arial, sans-serif';
            label.style.pointerEvents = 'none';
            
            displayState.labelContainer.appendChild(label);
        });
    }
}

// Create UI controls for the display mode
function createDisplayUI() {
    // Create container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'display-ui';
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.zIndex = '100';
    document.body.appendChild(uiContainer);
    
    // Return to game button
    const returnButton = document.createElement('button');
    returnButton.textContent = 'Return to Game';
    returnButton.style.padding = '10px 20px';
    returnButton.style.marginRight = '10px';
    returnButton.style.backgroundColor = '#7722aa';
    returnButton.style.color = 'white';
    returnButton.style.border = 'none';
    returnButton.style.borderRadius = '4px';
    returnButton.style.cursor = 'pointer';
    returnButton.addEventListener('click', exitDisplayMode);
    uiContainer.appendChild(returnButton);
    
    // Toggle rotation button
    const rotateButton = document.createElement('button');
    rotateButton.textContent = 'Toggle Rotation';
    rotateButton.style.padding = '10px 20px';
    rotateButton.style.backgroundColor = '#aa33ff';
    rotateButton.style.color = 'white';
    rotateButton.style.border = 'none';
    rotateButton.style.borderRadius = '4px';
    rotateButton.style.cursor = 'pointer';
    rotateButton.addEventListener('click', () => {
        displayState.rotating = !displayState.rotating;
        rotateButton.textContent = displayState.rotating ? 'Stop Rotation' : 'Start Rotation';
    });
    uiContainer.appendChild(rotateButton);
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Game Objects Gallery';
    title.style.position = 'absolute';
    title.style.top = '20px';
    title.style.left = '50%';
    title.style.transform = 'translateX(-50%)';
    title.style.color = 'white';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.fontFamily = 'Arial, sans-serif';
    title.style.textShadow = '0 0 10px #aa33ff';
    document.body.appendChild(title);
    
    // Store UI elements
    displayState.ui = { uiContainer, title };
}

// Animation loop for the display gallery
function animateDisplay() {
    if (!displayState.active) return;
    
    requestAnimationFrame(animateDisplay);
    
    // Update controls
    if (displayState.controls) {
        displayState.controls.update();
    }
    
    // Rotate objects if enabled
    if (displayState.rotating) {
        displayState.objects.forEach(object => {
            object.rotation.y += displayState.rotationSpeed;
            
            // For the ball, also rotate on other axes
            if (object.userData.type === "ball") {
                object.rotation.x += 0.01;
                object.rotation.z += 0.005;
                
                // Update ball texture
                if (object.userData.texture && object.userData.texture.userData) {
                    object.userData.texture.userData.animationData.time += 0.05;
                    object.userData.texture.userData.renderFrame(object.userData.texture.userData.animationData.time);
                    object.userData.texture.needsUpdate = true;
                }
            }
            
            // For powerups, add some bobbing motion
            if (object.userData.type === "powerup") {
                object.position.y = 3 + Math.sin(Date.now() * 0.002) * 0.5;
            }
        });
    }
    
    // Update labels
    updateObjectLabels();
    
    // Render scene
    if (displayState.renderer && displayState.scene && displayState.camera) {
        displayState.renderer.render(displayState.scene, displayState.camera);
    }
}

// Exit display mode and return to the game
export function exitDisplayMode() {
    displayState.active = false;
    
    // Remove UI elements
    if (displayState.ui) {
        document.body.removeChild(displayState.ui.uiContainer);
        document.body.removeChild(displayState.ui.title);
    }
    
    // Remove labels
    if (displayState.labelContainer) {
        document.body.removeChild(displayState.labelContainer);
    }
    
    // Reset game state
    state.displayMode = false;
    state.paused = false;
    
    // Restart game rendering
    requestAnimationFrame(() => {
        state.renderer.render(state.scene, state.camera);
    });
}

// These functions are recreated from objects.js to avoid circular dependencies

// Create cyberpunk ball texture (simplified from objects.js)
function createCyberpunkBallTexture() {
    const canvasSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    // Animation properties to store in userData
    const animationData = {
        rings: [],
        pulseSpeed: 0.05,
        rotationSpeed: 0.02,
        time: 0
    };

    // Create neon rings with different properties
    for (let i = 0; i < 6; i++) {
        animationData.rings.push({
            radius: 0.25 + i * 0.12,
            color: i % 2 === 0 ? '#0088ff' : '#aa00ff', // Blue and purple alternating
            phase: i * Math.PI / 3,
            thickness: 4 + i * 2
        });
    }
    
    // Function to render the current frame
    const renderFrame = (time) => {
        // Clear canvas with dark background
        ctx.fillStyle = '#000820';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        const center = canvasSize / 2;
        
        // Draw grid patterns
        ctx.strokeStyle = '#0066aa';
        ctx.lineWidth = 1;
        const gridSize = 16;
        
        // Draw grid lines
        for (let i = 0; i < canvasSize; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize);
            ctx.stroke();
        }
        
        // Draw animated neon rings
        animationData.rings.forEach((ring) => {
            // Calculate pulsating radius
            const pulseFactor = 0.15 * Math.sin(time * animationData.pulseSpeed + ring.phase);
            const currentRadius = (ring.radius + pulseFactor) * canvasSize;
            
            // Draw the ring
            ctx.beginPath();
            ctx.arc(center, center, currentRadius, 0, Math.PI * 2);
            
            // Create gradient for glow effect
            const gradient = ctx.createRadialGradient(
                center, center, currentRadius - ring.thickness,
                center, center, currentRadius + ring.thickness
            );
            gradient.addColorStop(0, ring.color + '00'); // Transparent
            gradient.addColorStop(0.5, ring.color + 'ff'); // Full color
            gradient.addColorStop(1, ring.color + '00'); // Transparent
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = ring.thickness;
            ctx.stroke();
        });
        
        // Add central core
        const coreGradient = ctx.createRadialGradient(
            center, center, 0,
            center, center, canvasSize * 0.15
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.2, '#00aaff'); // Bright blue
        coreGradient.addColorStop(0.7, '#0044aa'); // Medium blue
        coreGradient.addColorStop(1, '#aa00ff'); // Bright purple
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(center, center, canvasSize * 0.15, 0, Math.PI * 2);
        ctx.fill();
    };
    
    // Initial render
    renderFrame(0);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    
    // Store animation data for updates
    texture.userData = {
        canvas: canvas,
        ctx: ctx,
        renderFrame: renderFrame,
        animationData: animationData
    };
    
    return texture;
}

// Create a cyberpunk-themed paddle texture (simplified from objects.js)
function createCyberpunkPaddleTexture() {
    const canvasSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    // Dark metallic background with purple tone
    ctx.fillStyle = '#1a0a2a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Add glowing neon edge with magenta color
    const glowWidth = canvasSize * 0.05;
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = glowWidth;
    ctx.strokeRect(glowWidth/2, glowWidth/2, canvasSize - glowWidth, canvasSize - glowWidth);
    
    // Collor for the inner part of the paddle
    ctx.strokeStyle = '#aa33ff';
    ctx.lineWidth = 2;
    
    // Circuit-like pattern
    for (let i = 0; i < 5; i++) {
        const offset = canvasSize * 0.2 + i * canvasSize * 0.15;
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset, canvasSize * 0.3);
        ctx.lineTo(canvasSize * 0.7, canvasSize * 0.3);
        ctx.lineTo(canvasSize * 0.7, canvasSize * 0.7);
        ctx.lineTo(canvasSize * 0.3, canvasSize * 0.7);
        ctx.lineTo(canvasSize * 0.3, canvasSize * 0.5);
        ctx.stroke();
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Create a cyberpunk-themed brick texture (simplified from objects.js)
function createCyberpunkBrickTexture(color = '#aa33ff') {
    const canvasSize = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    // Dark background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Add grid pattern
    const gridSize = 32;
    ctx.strokeStyle = color.replace('#', '#33');
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let i = 0; i < canvasSize; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();
    }
    
    // Add circuit patterns
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    
    // Circuit paths
    for (let i = 0; i < 3; i++) {
        const yPos = gridSize * (2 + i * 2);
        
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(gridSize * 3, yPos);
        ctx.lineTo(gridSize * 3, yPos + gridSize * 2);
        ctx.lineTo(gridSize * 6, yPos + gridSize * 2);
        ctx.stroke();
    }
    
    // Add glow effect to edges
    const edgeWidth = canvasSize * 0.03;
    ctx.strokeStyle = color;
    ctx.lineWidth = edgeWidth;
    ctx.strokeRect(edgeWidth/2, edgeWidth/2, canvasSize - edgeWidth, canvasSize - edgeWidth);
    
    // Create and return texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
}
