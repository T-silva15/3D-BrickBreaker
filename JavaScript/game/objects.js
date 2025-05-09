import * as THREE from 'three';
import { state, constants, resetGame, startGame } from './game.js';
import { displayMessage } from './ui.js';

const textureLoader = new THREE.TextureLoader();

// Add this function near the top of the file
function createStarTexture() {
    const canvasSize = 512; // Larger texture for better quality
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    // Fill background with dark red
    ctx.fillStyle = '#990000';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw star
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const outerRadius = canvasSize * 0.45;
    const innerRadius = canvasSize * 0.18;
    const spikes = 5;
    
    // Use a more defined star shape with better contrast
    ctx.beginPath();
    ctx.fillStyle = '#ffdd00'; // Bright yellow
    
    // Draw star points
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / spikes) * i - Math.PI/2; // Start from top
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect around the star
    const gradient = ctx.createRadialGradient(
        centerX, centerY, innerRadius,
        centerX, centerY, outerRadius * 1.2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 100, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Add center highlight
    ctx.beginPath();
    ctx.fillStyle = '#ffffff'; 
    ctx.arc(centerX, centerY, innerRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16; // Improve texture quality
    return texture;
}

// Create the game boundaries
export function createGameArea() {
    // Create a container for the game area
    const gameArea = new THREE.Group();
    state.scene.add(gameArea);
    
    // Create static neon texture for walls
    const canvasSize = 512;
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = canvasSize;
    wallCanvas.height = canvasSize;
    const wallContext = wallCanvas.getContext('2d');
    
    // Draw static neon grid pattern
    drawNeonGridTexture(wallCanvas, wallContext);
    
    // Create texture from canvas
    const wallTexture = new THREE.CanvasTexture(wallCanvas);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(5, 5);
    
    // Create material with neon effect
    const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.7,
        metalness: 0.3,
        side: THREE.DoubleSide,
        emissive: 0x0a0a2a,
        emissiveIntensity: 1.0
    });
    
    // Game area dimensions
    const width = constants.GAME_WIDTH;
    const height = constants.GAME_HEIGHT;
    const depth = constants.GAME_DEPTH;
    
    // Create walls
    // Bottom wall
    const floorGeometry = new THREE.BoxGeometry(width, 1, depth);
    const floor = new THREE.Mesh(floorGeometry, wallMaterial);
    floor.position.y = -height/2;
    floor.receiveShadow = true;
    gameArea.add(floor);
    
    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(1, height, depth);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -width/2;
    leftWall.receiveShadow = true;
    gameArea.add(leftWall);
    
    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(1, height, depth);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.x = width/2;
    rightWall.receiveShadow = true;
    gameArea.add(rightWall);
    
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(width, height, 1);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -depth/2;
    backWall.receiveShadow = true;
    gameArea.add(backWall);
    
    // Top wall
    const ceilingGeometry = new THREE.BoxGeometry(width, 1, depth);
    const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial);
    ceiling.position.y = height/2;
    ceiling.receiveShadow = true;
    gameArea.add(ceiling);
    
    return gameArea;
}

// Function to draw neon grid texture
function drawNeonGridTexture(canvas, context) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Fill background with dark color
    context.fillStyle = '#0a0a20';
    context.fillRect(0, 0, width, height);
    
    // Set line style for neon effect
    context.lineWidth = 2;
    
    // Draw horizontal lines
    const horizontalLineCount = 12;
    const horizontalSpacing = height / horizontalLineCount;
    
    // Blue horizontal lines
    context.strokeStyle = '#3366ff';
    context.beginPath();
    for (let i = 0; i <= horizontalLineCount; i++) {
        const y = i * horizontalSpacing;
        context.moveTo(0, y);
        context.lineTo(width, y);
    }
    context.stroke();
    
    // Draw vertical lines with different color
    const verticalLineCount = 12;
    const verticalSpacing = width / verticalLineCount;
    
    // Cyan vertical lines
    context.strokeStyle = '#33ccff';
    context.beginPath();
    for (let i = 0; i <= verticalLineCount; i++) {
        const x = i * verticalSpacing;
        context.moveTo(x, 0);
        context.lineTo(x, height);
    }
    context.stroke();
    
    // Add glow effect to the lines
    context.lineWidth = 1;
    
    // Purple diagonal lines for extra visual interest
    context.strokeStyle = '#9966ff';
    context.beginPath();
    for (let i = -horizontalLineCount; i <= horizontalLineCount; i += 2) {
        const offset = i * horizontalSpacing * 2;
        context.moveTo(0, offset);
        context.lineTo(width, offset + height);
        
        context.moveTo(0, offset + height);
        context.lineTo(width, offset);
    }
    context.stroke();
}

// Create the player paddle
export function createPaddle() {
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
    
    state.paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    state.paddle.position.y = -constants.GAME_HEIGHT/2 + constants.PADDLE_HEIGHT;
    state.paddle.castShadow = true;
    state.paddle.receiveShadow = true;
    
    // Add a subtle glow effect with increased intensity
    const paddleLight = new THREE.PointLight(0xaa33ff, 1.0, 10);
    paddleLight.position.set(0, 1, 0);
    state.paddle.add(paddleLight);
    
    state.scene.add(state.paddle);
}

// Create the ball
export function createBall() {
    const ballGeometry = new THREE.SphereGeometry(constants.BALL_RADIUS, 32, 32);
    
    // Create star texture with more contrast
    const ballTexture = createStarTexture();
    
    // Create material with the texture - use emissive for better visibility
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0xff3333,
        emissiveIntensity: 0.3,
        map: ballTexture
    });
    
    state.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    // Store texture for animation
    state.ball.userData.texture = ballTexture;
    state.ball.userData.rotationSpeed = 0.02;
    
    // Position the ball above the paddle
    state.ball.position.set(
        0, 
        -constants.GAME_HEIGHT/2 + constants.PADDLE_HEIGHT + constants.BALL_RADIUS * 2, 
        0
    );
    
    // Add a small light to the ball - increased intensity
    const ballLight = new THREE.PointLight(0xff6666, 1.0, 10);
    ballLight.position.set(0, 0, 0);
    state.ball.add(ballLight);
    
    state.ball.castShadow = true;
    state.ball.receiveShadow = true;
    state.scene.add(state.ball);
    
    // Set initial velocity
    state.ballVelocity.normalize().multiplyScalar(constants.BALL_SPEED);
}

// Create a cyberpunk-themed paddle with neon edges
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

    // Create 4 neon rings with different properties
    for (let i = 0; i < 4; i++) {
        animationData.rings.push({
            radius: 0.3 + i * 0.15,
            color: i % 2 === 0 ? '#00ffff' : '#ff00ff',
            phase: i * Math.PI / 2,
            thickness: 5 + i * 3
        });
    }
    
    // Function to render the current frame
    const renderFrame = (time) => {
        // Clear canvas with dark background
        ctx.fillStyle = '#000820';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        const center = canvasSize / 2;
        
        // Draw grid pattern
        ctx.strokeStyle = '#103050';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i < canvasSize; i += 16) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i < canvasSize; i += 16) {
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
        
        // Draw intersecting circuitry lines
        ctx.strokeStyle = '#00ffaa';
        ctx.lineWidth = 2;
        
        // Draw circuit pattern that rotates
        const rotation = time * 0.01;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + rotation;
            const x1 = center + Math.cos(angle) * center * 0.8;
            const y1 = center + Math.sin(angle) * center * 0.8;
            const x2 = center + Math.cos(angle + Math.PI) * center * 0.8;
            const y2 = center + Math.sin(angle + Math.PI) * center * 0.8;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Add "nodes" at intersections
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add digital noise effect
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvasSize;
            const y = Math.random() * canvasSize;
            const size = 2 + Math.random() * 3;
            ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.7})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add central core
        const coreGradient = ctx.createRadialGradient(
            center, center, 0,
            center, center, canvasSize * 0.15
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.2, '#00ffff');
        coreGradient.addColorStop(0.7, '#0080ff');
        coreGradient.addColorStop(1, '#000080');
        
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

// Create the bricks
export function createBricks() {
    // Clear existing bricks
    state.bricks.forEach(brick => state.scene.remove(brick));
    state.bricks = [];
    
    // Load brick textures
    const brickTextures = [
        textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'),
        textureLoader.load('https://threejs.org/examples/textures/brick_bump.jpg')
    ];
    
    // Configure brick layout based on level
    let config;
    switch(state.level) {
        case 1:
            config = { rows: 4, cols: 8, layers: 2 };
            break;
        case 2:
            config = { rows: 5, cols: 10, layers: 3 };
            break;
        case 3:
            config = { rows: 6, cols: 12, layers: 3 };
            break;
        default:
            config = { rows: 4, cols: 8, layers: 2 };
    }
    
    const { rows, cols, layers } = config;
    
    // Spacing between bricks
    const brickSpacingX = 0.8;
    const brickSpacingY = 1.2;
    const brickSpacingZ = 0.8;
    
    // Calculate total width and adjust starting positions
    const totalWidth = cols * (constants.BRICK_WIDTH + brickSpacingX) - brickSpacingX;
    const totalDepth = rows * (constants.BRICK_DEPTH + brickSpacingZ) - brickSpacingZ;
    
    const startX = -totalWidth / 2 + constants.BRICK_WIDTH / 2;
    const startY = constants.GAME_HEIGHT/3;
    const startZ = -totalDepth / 2 + constants.BRICK_DEPTH / 2;
    
    // Create brick layers
    for (let layer = 0; layer < layers; layer++) {
        const layerY = startY - layer * (constants.BRICK_HEIGHT + brickSpacingY);
        
        for (let row = 0; row < rows; row++) {
            const rowZ = startZ + row * (constants.BRICK_DEPTH + brickSpacingZ);
            
            for (let col = 0; col < cols; col++) {
                // Skip some bricks for visual interest
                if ((layer + row + col) % 7 === 0) continue;
                
                const brickGeometry = new THREE.BoxGeometry(
                    constants.BRICK_WIDTH, 
                    constants.BRICK_HEIGHT, 
                    constants.BRICK_DEPTH
                );
                
                // Determine brick color based on layer
                let color;
                if (layer === 0) {
                    color = (row + col) % 2 === 0 ? 0xff8844 : 0xffaa66; // Orange
                } else if (layer === 1) {
                    color = (row + col) % 2 === 0 ? 0x44ff88 : 0x66ffaa; // Green
                } else {
                    color = (row + col) % 2 === 0 ? 0x8844ff : 0xaa66ff; // Purple
                }
                
                const brickMaterial = new THREE.MeshPhongMaterial({ 
                    color: color,
                    specular: 0xffffff,
                    shininess: 50,
                    map: brickTextures[0],
                    bumpMap: brickTextures[1]
                });
                
                const brick = new THREE.Mesh(brickGeometry, brickMaterial);
                
                // Position the brick
                brick.position.set(
                    startX + col * (constants.BRICK_WIDTH + brickSpacingX),
                    layerY,
                    rowZ
                );
                
                brick.castShadow = true;
                brick.receiveShadow = true;
                
                // Store metadata
                brick.userData = {
                    points: 10 * (layer + 1),
                    hits: 1,
                    active: true
                };
                
                // Create a bounding box for collision detection
                brick.geometry.computeBoundingBox();
                
                state.scene.add(brick);
                state.bricks.push(brick);
            }
        }
    }
}

// Reset the ball position
export function resetBall() {
    state.gameStarted = false;
    state.ball.position.set(
        0, 
        -constants.GAME_HEIGHT/2 + constants.PADDLE_HEIGHT + constants.BALL_RADIUS * 2, 
        0
    );
    
    // Randomize initial direction
    state.ballVelocity.set(
        (Math.random() - 0.5) * 0.2,
        0.15,                        
        (Math.random() - 0.5) * 0.1
    );
    
    state.ballVelocity.normalize().multiplyScalar(constants.BALL_SPEED);
    
    // Add click event listener to restart
    document.addEventListener('click', startGame, { once: true });
}

// Update all game objects
export function updateObjects() {
    // Update paddle position
    updatePaddle();
    
    // Update ball physics
    if (state.gameStarted && !state.levelComplete) {
        updateBall();
    }
    
    // Update camera positions
    updateCameras();
}

// Update ball position and handle collisions
function updateBall() {
    // Move the ball according to its velocity
    state.ball.position.x += state.ballVelocity.x;
    state.ball.position.y += state.ballVelocity.y;
    state.ball.position.z += state.ballVelocity.z;
    
    // Apply rotation for visual effect
    state.ball.rotation.y += 0.05; // Use Y rotation for more noticeable spinning
    
    // Animate texture by rotating UV coordinates - increased speed
    if (state.ball.userData.texture) {
        state.ball.userData.texture.rotation += 0.03;
        state.ball.userData.texture.needsUpdate = true;
    }
    
    // Handle boundary collisions
    handleBoundaryCollisions();
    
    // Check for game over (ball fell)
    if (state.ball.position.y < -constants.GAME_HEIGHT/2) {
        state.gameOver = true;
        displayMessage("Game Over", "Click to restart");
        resetBall();
        return;
    }
    
    // Check paddle collision
    handlePaddleCollision();
    
    // Check brick collisions
    checkBrickCollisions();
}

// Handle ball collisions with boundaries
function handleBoundaryCollisions() {
    // X boundaries (left/right walls)
    if (state.ball.position.x > constants.GAME_WIDTH/2 - constants.BALL_RADIUS || 
        state.ball.position.x < -constants.GAME_WIDTH/2 + constants.BALL_RADIUS) {
        state.ballVelocity.x *= -1;
    }
    
    // Y boundaries (top)
    if (state.ball.position.y > constants.GAME_HEIGHT/2 - constants.BALL_RADIUS) {
        state.ballVelocity.y *= -1;
    }
    
    // Z boundaries (back/front walls)
    if (state.ball.position.z < -constants.GAME_DEPTH/2 + constants.BALL_RADIUS || 
        state.ball.position.z > constants.GAME_DEPTH/2 - constants.BALL_RADIUS) {
        state.ballVelocity.z *= -1;
    }
}

// Handle ball collision with paddle
function handlePaddleCollision() {
    if (state.ball.position.y <= state.paddle.position.y + constants.PADDLE_HEIGHT/2 + constants.BALL_RADIUS && 
        state.ball.position.y >= state.paddle.position.y - constants.BALL_RADIUS &&
        state.ball.position.x >= state.paddle.position.x - constants.PADDLE_WIDTH/2 - constants.BALL_RADIUS &&
        state.ball.position.x <= state.paddle.position.x + constants.PADDLE_WIDTH/2 + constants.BALL_RADIUS &&
        state.ball.position.z >= state.paddle.position.z - constants.PADDLE_DEPTH/2 - constants.BALL_RADIUS &&
        state.ball.position.z <= state.paddle.position.z + constants.PADDLE_DEPTH/2 + constants.BALL_RADIUS) {
        
        // Calculate impact position on paddle
        const paddleImpactX = (state.ball.position.x - state.paddle.position.x) / (constants.PADDLE_WIDTH/2);
        const paddleImpactZ = (state.ball.position.z - state.paddle.position.z) / (constants.PADDLE_DEPTH/2);
        
        // Determine hit location
        const hitTop = state.ball.position.y > state.paddle.position.y &&
                     Math.abs(paddleImpactX) < 1 &&
                     Math.abs(paddleImpactZ) < 1;
        
        if (hitTop) {
            // Bounce off the top
            state.ballVelocity.y = Math.abs(state.ballVelocity.y);
            
            // Add influence from paddle impact position
            state.ballVelocity.x += paddleImpactX * 0.2;
            state.ballVelocity.z += paddleImpactZ * 0.2;
        } else {
            // Hit side of paddle
            if (Math.abs(paddleImpactX) > Math.abs(paddleImpactZ)) {
                // Hit left or right side
                state.ballVelocity.x = Math.sign(paddleImpactX) * Math.abs(state.ballVelocity.x);
            } else {
                // Hit front or back
                state.ballVelocity.z = Math.sign(paddleImpactZ) * Math.abs(state.ballVelocity.z);
            }
        }
        
        // Normalize velocity to maintain constant speed
        state.ballVelocity.normalize().multiplyScalar(constants.BALL_SPEED);
    }
}

// Check for brick collisions
function checkBrickCollisions() {
    // Create a sphere for collision detection
    const ballSphere = new THREE.Sphere(state.ball.position, constants.BALL_RADIUS);
    
    // Check each brick
    for (let i = 0; i < state.bricks.length; i++) {
        const brick = state.bricks[i];
        
        // Skip inactive bricks
        if (!brick.userData.active) continue;
        
        // Get brick's bounding box
        const brickBox = new THREE.Box3().setFromObject(brick);
        
        // Check for intersection
        if (ballSphere.intersectsBox(brickBox)) {
            // Handle the collision
            handleBrickCollision(brick, brickBox);
            
            // Only process one brick collision per frame
            break;
        }
    }
}

// Handle brick collision
function handleBrickCollision(brick, brickBox) {
    // Determine collision face
    const ballPos = state.ball.position.clone();
    const brickCenter = new THREE.Vector3();
    brickBox.getCenter(brickCenter);
    
    // Vector from brick center to ball
    const ballToBrick = ballPos.clone().sub(brickCenter);
    
    // Get the brick size
    const brickSize = new THREE.Vector3();
    brickBox.getSize(brickSize);
    
    // Calculate penetration depths
    const xPenetration = brickSize.x/2 + constants.BALL_RADIUS - Math.abs(ballToBrick.x);
    const yPenetration = brickSize.y/2 + constants.BALL_RADIUS - Math.abs(ballToBrick.y);
    const zPenetration = brickSize.z/2 + constants.BALL_RADIUS - Math.abs(ballToBrick.z);
    
    // Determine which face was hit (using the shallowest penetration)
    if (xPenetration < yPenetration && xPenetration < zPenetration) {
        // X-axis collision (left or right)
        state.ballVelocity.x *= -1;
    } else if (yPenetration < xPenetration && yPenetration < zPenetration) {
        // Y-axis collision (top or bottom)
        state.ballVelocity.y *= -1;
    } else {
        // Z-axis collision (front or back)
        state.ballVelocity.z *= -1;
    }
    
    // Add score
    state.score += brick.userData.points;
    
    // Decrease brick's hit count
    brick.userData.hits--;
    
    // Deactivate brick if no more hits left
    if (brick.userData.hits <= 0) {
        deactivateBrick(brick);
    } else {
        // Just fade the brick a bit
        brick.material.opacity = 0.7;
    }
}

// Deactivate a brick when destroyed
function deactivateBrick(brick) {
    brick.userData.active = false;
    
    // Add destruction animation
    animateBrickDestruction(brick);
    
    // Check if level is complete
    checkLevelComplete();
}

// Animate brick destruction
function animateBrickDestruction(brick) {
    const scaleFactor = 0.95;
    
    function animateStep() {
        if (brick.scale.x > 0.1) {
            brick.scale.multiplyScalar(scaleFactor);
            brick.material.opacity *= scaleFactor;
            requestAnimationFrame(animateStep);
        } else {
            state.scene.remove(brick);
        }
    }
    
    animateStep();
}

// Check if all bricks are destroyed
function checkLevelComplete() {
    const activeBricks = state.bricks.filter(brick => brick.userData.active);
    
    if (activeBricks.length === 0) {
        state.levelComplete = true;
        
        // Increase level
        state.level = Math.min(state.level + 1, constants.MAX_LEVELS);
        
        // Show level complete message
        displayMessage("Level Complete!", "Click to continue");
        
        // Reset game state
        state.gameStarted = false;
    }
}

// Update paddle position
function updatePaddle() {
    if (state.useMouse) {
        // Mouse control with responsive movement
        state.paddle.position.x += (state.mousePosition.x - state.paddle.position.x) * 0.2;
        
        // Limit Z movement to front third of game area
        const targetZ = Math.max(-constants.GAME_DEPTH/6, Math.min(constants.GAME_DEPTH/3, state.mousePosition.z));
        state.paddle.position.z += (targetZ - state.paddle.position.z) * 0.2;
    } else {
        // Keyboard control with fixed speed
        const moveSpeed = constants.PADDLE_SPEED;
        if (state.keys.left) {
            state.paddle.position.x -= moveSpeed;
        }
        if (state.keys.right) {
            state.paddle.position.x += moveSpeed;
        }
        if (state.keys.up) {
            state.paddle.position.z -= moveSpeed;
        }
        if (state.keys.down) {
            state.paddle.position.z += moveSpeed;
        }
    }
    
    // Constrain paddle to game boundaries
    const paddleHalfWidth = constants.PADDLE_WIDTH / 2;
    const paddleHalfDepth = constants.PADDLE_DEPTH / 2;
    
    // X boundaries (left/right)
    state.paddle.position.x = Math.max(-constants.GAME_WIDTH/2 + paddleHalfWidth, 
                             Math.min(constants.GAME_WIDTH/2 - paddleHalfWidth, state.paddle.position.x));
    
    // Z boundaries (front/back)
    state.paddle.position.z = Math.max(-constants.GAME_DEPTH/2 + paddleHalfDepth, 
                             Math.min(constants.GAME_DEPTH/2 - paddleHalfDepth, state.paddle.position.z));
    
    // Add tilt effect based on movement
    const tiltFactor = 0.1;
    if (state.useMouse) {
        state.paddle.rotation.z = (state.mousePosition.x - state.paddle.position.x) * tiltFactor;
        state.paddle.rotation.x = (state.paddle.position.z - state.mousePosition.z) * tiltFactor;
    } else {
        // Tilt based on keyboard input
        state.paddle.rotation.z = ((state.keys.right ? -1 : 0) + (state.keys.left ? 1 : 0)) * tiltFactor;
        state.paddle.rotation.x = ((state.keys.up ? -1 : 0) + (state.keys.down ? 1 : 0)) * tiltFactor;
    }
}

// Update camera positions
function updateCameras() {
    // Update follow camera
    if (state.cameras[3] && state.ball) {
        const followOffset = new THREE.Vector3(0, 5, 15);
        state.cameras[3].position.copy(state.ball.position).add(followOffset);
        state.cameras[3].lookAt(state.ball.position);
    }
    
    // Update paddle camera
    if (state.cameras[4] && state.paddle) {
        state.cameras[4].position.set(
            state.paddle.position.x,
            state.paddle.position.y + 2,
            state.paddle.position.z
        );
        state.cameras[4].lookAt(
            state.paddle.position.x,
            state.paddle.position.y + 10,
            state.paddle.position.z - 10
        );
    }
    
    // Update spotlight to follow ball
    if (state.lights.spotlight && state.ball) {
        state.lights.spotlight.target.position.copy(state.ball.position);
        if (state.lights.spotlight.helper) {
            state.lights.spotlight.helper.update();
        }
    }
}
