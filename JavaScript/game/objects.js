import * as THREE from 'three';
import { state, constants } from './game.js';
import { applyBarrier, applyExplosiveBall, updatePowerups,    applyMultiBall ,createPowerUp, POWERUP_TYPE, applyPaddleSizeUp, applyPaddleDoubleSize } from './powerups.js';

import { displayMessage } from './ui.js';

const textureLoader = new THREE.TextureLoader();

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

    // Create more neon rings with different properties using blue and purple
    for (let i = 0; i < 6; i++) {  // Increased from 4 to 6 rings
        animationData.rings.push({
            radius: 0.25 + i * 0.12,  // More closely packed rings
            color: i % 2 === 0 ? '#0088ff' : '#aa00ff', // Blue and purple alternating
            phase: i * Math.PI / 3,  // More varied phases
            thickness: 4 + i * 2
        });
    }
    
    // Function to render the current frame
    const renderFrame = (time) => {
        // Clear canvas with dark background
        ctx.fillStyle = '#000820';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        const center = canvasSize / 2;
        
        // Draw more detailed net-like grid pattern
        ctx.strokeStyle = '#0066aa';  // Medium blue for grid
        ctx.lineWidth = 1;
        
        // Grid spacing - tighter for net effect
        const gridSize = 16;  // Reduced from 24 to 16 for tighter grid
        
        // Horizontal grid lines
        for (let i = 0; i < canvasSize; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i < canvasSize; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize);
            ctx.stroke();
        }
        
        // Add diagonal grid lines for net effect
        ctx.strokeStyle = '#6600aa'; // Purple for diagonals
        
        // Diagonal lines (top-left to bottom-right)
        for (let i = -canvasSize; i < canvasSize; i += gridSize * 2) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + canvasSize, canvasSize);
            ctx.stroke();
        }
        
        // Diagonal lines (top-right to bottom-left)
        for (let i = 0; i < canvasSize * 2; i += gridSize * 2) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i - canvasSize, canvasSize);
            ctx.stroke();
        }
        
        // Add hexagonal patterns in the background
        ctx.strokeStyle = '#005588';
        ctx.lineWidth = 1.5;
        const hexSize = gridSize * 4;
        for (let x = 0; x < canvasSize; x += hexSize * 1.5) {
            for (let y = 0; y < canvasSize; y += hexSize * 1.73) {
                drawHexagon(ctx, x, y, hexSize);
                drawHexagon(ctx, x + hexSize * 0.75, y + hexSize * 0.865, hexSize);
            }
        }
        
        // Draw main X pattern - thicker and more visible
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#00ccff';  // Bright blue for X
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvasSize, canvasSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(canvasSize, 0);
        ctx.lineTo(0, canvasSize);
        ctx.stroke();
        
        // Add secondary X pattern - rotated with animation
        const rotatedX = time * 0.01;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ff00ff';  // Bright magenta for second X
        
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotatedX);
        ctx.beginPath();
        ctx.moveTo(-center * 0.9, -center * 0.9);
        ctx.lineTo(center * 0.9, center * 0.9);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(center * 0.9, -center * 0.9);
        ctx.lineTo(-center * 0.9, center * 0.9);
        ctx.stroke();
        ctx.restore();
        
        // Add tertiary X pattern - different rotation
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffcc00';  // Gold for third X
        
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(-rotatedX * 1.5);
        ctx.beginPath();
        ctx.moveTo(-center * 0.7, -center * 0.7);
        ctx.lineTo(center * 0.7, center * 0.7);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(center * 0.7, -center * 0.7);
        ctx.lineTo(-center * 0.7, center * 0.7);
        ctx.stroke();
        ctx.restore();
        
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
        ctx.strokeStyle = '#00aaff'; // Bright blue
        ctx.lineWidth = 2;
        
        // Draw circuit pattern that rotates
        const rotation = time * 0.01;
        for (let i = 0; i < 12; i++) { // Increased from 8 to 12 lines
            const angle = (i / 12) * Math.PI * 2 + rotation;
            const x1 = center + Math.cos(angle) * center * 0.8;
            const y1 = center + Math.sin(angle) * center * 0.8;
            const x2 = center + Math.cos(angle + Math.PI) * center * 0.8;
            const y2 = center + Math.sin(angle + Math.PI) * center * 0.8;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Add "nodes" at intersections
            ctx.fillStyle = '#aa00ff'; // Purple for nodes
            ctx.beginPath();
            ctx.arc(x1, y1, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add circular data paths
        ctx.strokeStyle = '#22ccff';
        ctx.lineWidth = 3;
        
        const dataCircles = 3;
        for (let i = 0; i < dataCircles; i++) {
            const radius = canvasSize * (0.2 + i * 0.15);
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Add data points on circles
            const points = 8 + i * 4;
            for (let j = 0; j < points; j++) {
                const pointAngle = (j / points) * Math.PI * 2 + rotation * (i + 1);
                const px = center + Math.cos(pointAngle) * radius;
                const py = center + Math.sin(pointAngle) * radius;
                
                ctx.fillStyle = j % 2 === 0 ? '#00ffff' : '#ff00ff';
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add digital readout rectangles
        const readoutCount = 8;
        ctx.lineWidth = 1;
        for (let i = 0; i < readoutCount; i++) {
            const rectSize = 10 + Math.sin(time * 0.1 + i) * 5;
            const rectX = center + Math.cos(i/readoutCount * Math.PI * 2) * center * 0.6;
            const rectY = center + Math.sin(i/readoutCount * Math.PI * 2) * center * 0.6;
            
            ctx.strokeStyle = i % 2 === 0 ? '#00ffaa' : '#ff00aa';
            ctx.strokeRect(rectX - rectSize/2, rectY - rectSize/2, rectSize, rectSize);
            
            // Fill with a pulsing color
            const opacity = 0.5 + 0.5 * Math.sin(time * 0.2 + i);
            ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
            ctx.fillRect(rectX - rectSize/2, rectY - rectSize/2, rectSize, rectSize);
        }
        
        // Add digital noise effect
        for (let i = 0; i < 80; i++) { // Increased from 50 to 80 particles
            const x = Math.random() * canvasSize;
            const y = Math.random() * canvasSize;
            const size = 2 + Math.random() * 3;
            // Alternate between blue and purple for the noise particles
            ctx.fillStyle = Math.random() > 0.5 ? 
                `rgba(0, 136, 255, ${Math.random() * 0.7})` : 
                `rgba(170, 0, 255, ${Math.random() * 0.7})`;
            ctx.fillRect(x, y, size, size);
        }
        
        // Add binary code sprinkled around
        ctx.font = '8px monospace';
        ctx.fillStyle = '#00ffaa';
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * canvasSize;
            const y = Math.random() * canvasSize;
            const binary = Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(binary, x, y);
        }
        
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
    
    // Helper function to draw hexagon
    function drawHexagon(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
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

// In the createBall function, modify the rotation-related code:
export function createBall() {
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
    const ballLight = new THREE.PointLight(0x3366ff, 1.2, 10);
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

// Create a cyberpunk-themed brick texture
function createCyberpunkBrickTexture(color = '#aa33ff') {
    const canvasSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    
    // Dark background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    bgGradient.addColorStop(0, '#120a18');
    bgGradient.addColorStop(1, '#1a0a2a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Create tech circuit pattern
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    // Draw grid lines
    const gridSize = canvasSize / 8;
    for (let i = 0; i <= canvasSize; i += gridSize) {
        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvasSize, i);
        ctx.stroke();
        
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize);
        ctx.stroke();
    }
    
    // Add circuit patterns
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff00ff';
    
    // Circuit paths
    for (let i = 0; i < 3; i++) {
        const yPos = gridSize * (2 + i * 2);
        
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(gridSize * 3, yPos);
        ctx.lineTo(gridSize * 3, yPos + gridSize * 2);
        ctx.lineTo(gridSize * 6, yPos + gridSize * 2);
        ctx.lineTo(gridSize * 6, yPos);
        ctx.lineTo(canvasSize, yPos);
        ctx.stroke();
    }
    
    // Add "nodes" at intersections
    const nodeRadius = 6;
    ctx.fillStyle = '#00ffff';
    
    for (let x = 0; x <= canvasSize; x += gridSize * 2) {
        for (let y = 0; y <= canvasSize; y += gridSize * 2) {
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add glow effect to edges
    const edgeWidth = canvasSize * 0.03;
    const glowGradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    glowGradient.addColorStop(0, '#ff00ff66');
    glowGradient.addColorStop(0.5, '#00ffff44');
    glowGradient.addColorStop(1, '#ff00ff66');
    
    ctx.strokeStyle = glowGradient;
    ctx.lineWidth = edgeWidth;
    ctx.strokeRect(edgeWidth/2, edgeWidth/2, canvasSize - edgeWidth, canvasSize - edgeWidth);
    
    // Return the texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
}

// Create the bricks
export function createBricks() {
    // Clear existing bricks
    state.bricks.forEach(brick => state.scene.remove(brick));
    state.bricks = [];
    
    // Create cyberpunk brick textures with different color variants
    const brickTextures = [
        createCyberpunkBrickTexture('#ff00ff'), // Magenta
        createCyberpunkBrickTexture('#00ffff'), // Cyan
        createCyberpunkBrickTexture('#ffcc00')  // Gold
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
                
                // Determine brick color and texture based on layer
                let textureIndex = layer % brickTextures.length;
                let emissiveColor;
                
                // Map color to emissive for each texture
                switch(textureIndex) {
                    case 0: emissiveColor = new THREE.Color(0x330033); break; // Dim magenta
                    case 1: emissiveColor = new THREE.Color(0x003333); break; // Dim cyan
                    case 2: emissiveColor = new THREE.Color(0x332200); break; // Dim gold
                }
                
                const brickMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0xffffff, // Use white as base and let texture provide color
                    specular: 0xffffff,
                    shininess: 50,
                    map: brickTextures[textureIndex],
                    emissive: emissiveColor,
                    emissiveIntensity: 0.5
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
    updatePowerups();
    
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
    
    // Apply physical rotation to ball mesh
    state.ball.rotation.x += 0.01;
    state.ball.rotation.y += 0.03; // Increased for more visible spinning
    state.ball.rotation.z += 0.02;
    
    // Animate texture - update time for the procedural texture
    if (state.ball.userData.texture && state.ball.userData.texture.userData) {
        state.ball.userData.texture.userData.animationData.time += 0.05;
        state.ball.userData.texture.userData.renderFrame(state.ball.userData.texture.userData.animationData.time);
        state.ball.userData.texture.needsUpdate = true;
    }
    
    // Also apply UV rotation for extra animation effect
    if (state.ball.userData.texture) {
        state.ball.userData.texture.offset.x += 0.002;
        state.ball.userData.texture.offset.y += 0.001;
        state.ball.userData.texture.rotation += 0.005; // Gentle rotation of texture coordinates
        state.ball.userData.texture.needsUpdate = true;
    }
    
    // Handle boundary collisions
    handleBoundaryCollisions();
    
    // Check for game over (ball fell)
    
    // Check paddle collision
    handlePaddleCollision();
    
    // Check brick collisions
    checkBrickCollisions();
    if (state.extraBalls) {
        for (let i = state.extraBalls.length - 1; i >= 0; i--) {
            const extraBall = state.extraBalls[i];
            
            // Update position
            extraBall.position.add(extraBall.userData.velocity);

            // Handle boundary collisions for extra ball
            handleExtraBallBoundaries(extraBall, i);
            
            // Handle paddle collision
            handleExtraBallPaddleCollision(extraBall);
            
            // Handle brick collisions
            handleExtraBallBrickCollisions(extraBall);
        }
    }
if (state.ball.position.y < -constants.GAME_HEIGHT/2) {
        if (state.barrier) {
            // Bounce off barrier instead of game over
            state.ballVelocity.y = Math.abs(state.ballVelocity.y); // Make ball go up
            state.ball.position.y = -constants.GAME_HEIGHT/2 + constants.BALL_RADIUS; // Place ball above barrier
        } else {
            // Normal game over condition
            state.gameOver = true;
            displayMessage("Game Over", "Click to restart");
            resetBall();
        }
    }
}

function handleExtraBallBoundaries(ball, index) {
    // X boundaries (left/right walls)
    if (ball.position.x > constants.GAME_WIDTH/2 - constants.BALL_RADIUS || 
        ball.position.x < -constants.GAME_WIDTH/2 + constants.BALL_RADIUS) {
        ball.userData.velocity.x *= -1;
    }
    
    // Y boundaries (top)
    if (ball.position.y > constants.GAME_HEIGHT/2 - constants.BALL_RADIUS) {
        ball.userData.velocity.y *= -1;
    }
    
    // Remove ball if it goes below paddle (but don't end game)
    if (ball.position.y < -constants.GAME_HEIGHT/2) {
        state.scene.remove(ball);
        state.extraBalls.splice(index, 1);
    }
    
    // Z boundaries (back/front walls)
    if (ball.position.z < -constants.GAME_DEPTH/2 + constants.BALL_RADIUS || 
        ball.position.z > constants.GAME_DEPTH/2 - constants.BALL_RADIUS) {
        ball.userData.velocity.z *= -1;
    }
    // Check barrier collision
    if (ball.position.y < -constants.GAME_HEIGHT/2) {
        if (state.barrier) {
            // Bounce off barrier
            ball.userData.velocity.y = Math.abs(ball.userData.velocity.y);
            ball.position.y = -constants.GAME_HEIGHT/2 + constants.BALL_RADIUS;
        } else {
            state.scene.remove(ball);
            state.extraBalls.splice(index, 1);
        }
    }
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

    if (state.ball.userData.explosive) {
        // Get all bricks within radius
        const explosionRadius = constants.BRICK_WIDTH * 2;
        const brickCenter = new THREE.Vector3();
        brickBox.getCenter(brickCenter);

        state.bricks.forEach(nearbyBrick => {
            if (nearbyBrick.userData.active) {
                const nearbyCenter = new THREE.Vector3();
                new THREE.Box3().setFromObject(nearbyBrick).getCenter(nearbyCenter);
                
                if (brickCenter.distanceTo(nearbyCenter) <= explosionRadius) {
                    // Add score for each brick destroyed
                    state.score += nearbyBrick.userData.points;
                    deactivateBrick(nearbyBrick);
                }
            }
        });
    } else {
        // Normal brick collision
        state.score += brick.userData.points;
        brick.userData.hits--;
        if (brick.userData.hits <= 0) {
            deactivateBrick(brick);
        } else {
            brick.material.opacity = 0.7;
        }
    }
}

// Deactivate a brick when destroyed
// Modify the deactivateBrick function
function deactivateBrick(brick) {
    brick.userData.active = false;
    
    // chance to spawn a powerup
    if (Math.random() < 0.25) {
        // Randomly choose powerup type
        const powerupTypes = [
            POWERUP_TYPE.PADDLE_DOUBLE_SIZE,
            POWERUP_TYPE.MULTI_BALL,
            POWERUP_TYPE.EXPLOSIVE_BALL,
            POWERUP_TYPE.BARRIER
        ];
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        const powerUp = createPowerUp(brick.position.clone(), randomType);
        powerUp.userData.velocity = new THREE.Vector3(0, -0.05, 0); // Falling speed
        state.powerups = state.powerups || []; // Initialize powerups array if needed
        state.powerups.push(powerUp);
        state.scene.add(powerUp);
    }
    
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

    if (state.powerups && state.powerups.length > 0) {
        const paddleBox = new THREE.Box3().setFromObject(state.paddle);
        
        for (let i = state.powerups.length - 1; i >= 0; i--) {
            const powerup = state.powerups[i];
            
            // Update powerup position (falling)
            powerup.position.add(powerup.userData.velocity);
            
            // Check if powerup is below game area
            if (powerup.position.y < -constants.GAME_HEIGHT/2) {
                state.scene.remove(powerup);
                state.powerups.splice(i, 1);
                continue;
            }
            
            // Check collision with paddle
            const powerupBox = new THREE.Box3().setFromObject(powerup);
            if (powerupBox.intersectsBox(paddleBox)) {
                // Apply powerup effect
    if (powerup.userData.type === POWERUP_TYPE.PADDLE_DOUBLE_SIZE) {
        applyPaddleDoubleSize();
    } else if (powerup.userData.type === POWERUP_TYPE.MULTI_BALL) {
        applyMultiBall();
    } else if (powerup.userData.type === POWERUP_TYPE.EXPLOSIVE_BALL) {
        applyExplosiveBall();
    } else if (powerup.userData.type === POWERUP_TYPE.BARRIER) {
        applyBarrier();
    }
                
                // Remove powerup
                state.scene.remove(powerup);
                state.powerups.splice(i, 1);
            }
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


function handleExtraBallPaddleCollision(ball) {
    if (ball.position.y <= state.paddle.position.y + constants.PADDLE_HEIGHT/2 + constants.BALL_RADIUS && 
        ball.position.y >= state.paddle.position.y - constants.BALL_RADIUS &&
        ball.position.x >= state.paddle.position.x - constants.PADDLE_WIDTH/2 - constants.BALL_RADIUS &&
        ball.position.x <= state.paddle.position.x + constants.PADDLE_WIDTH/2 + constants.BALL_RADIUS &&
        ball.position.z >= state.paddle.position.z - constants.PADDLE_DEPTH/2 - constants.BALL_RADIUS &&
        ball.position.z <= state.paddle.position.z + constants.PADDLE_DEPTH/2 + constants.BALL_RADIUS) {
        
        // Calculate impact position relative to paddle center
        const paddleImpactX = (ball.position.x - state.paddle.position.x) / (constants.PADDLE_WIDTH/2);
        const paddleImpactZ = (ball.position.z - state.paddle.position.z) / (constants.PADDLE_DEPTH/2);
        
        // Determine if hit top of paddle
        const hitTop = ball.position.y > state.paddle.position.y;
        
        if (hitTop) {
            // Bounce off the top
            ball.userData.velocity.y = Math.abs(ball.userData.velocity.y);
            
            // Add influence from paddle impact position
            ball.userData.velocity.x += paddleImpactX * 0.2;
            ball.userData.velocity.z += paddleImpactZ * 0.2;
        } else {
            // Hit side of paddle
            if (Math.abs(paddleImpactX) > Math.abs(paddleImpactZ)) {
                // Hit left or right side
                ball.userData.velocity.x = Math.sign(paddleImpactX) * Math.abs(ball.userData.velocity.x);
            } else {
                // Hit front or back
                ball.userData.velocity.z = Math.sign(paddleImpactZ) * Math.abs(ball.userData.velocity.z);
            }
        }
        
        // Normalize velocity to maintain constant speed
        ball.userData.velocity.normalize().multiplyScalar(constants.BALL_SPEED);
    }
}

function handleExtraBallBrickCollisions(ball) {
    const ballSphere = new THREE.Sphere(ball.position, constants.BALL_RADIUS);
    
    for (let i = 0; i < state.bricks.length; i++) {
        const brick = state.bricks[i];
        
        if (!brick.userData.active) continue;
        
        const brickBox = new THREE.Box3().setFromObject(brick);
        
        if (ballSphere.intersectsBox(brickBox)) {
            handleBrickCollision(brick, brickBox);
            
            // Calculate bounce direction
            const brickCenter = new THREE.Vector3();
            brickBox.getCenter(brickCenter);
            
            // Determine which side was hit
            const dx = Math.abs(ball.position.x - brickCenter.x);
            const dy = Math.abs(ball.position.y - brickCenter.y);
            const dz = Math.abs(ball.position.z - brickCenter.z);
            
            if (dx > dy && dx > dz) {
                ball.userData.velocity.x *= -1;
            } else if (dy > dx && dy > dz) {
                ball.userData.velocity.y *= -1;
            } else {
                ball.userData.velocity.z *= -1;
            }
            
            break;
        }
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
