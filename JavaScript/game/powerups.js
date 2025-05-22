import * as THREE from 'three';
import { state, constants } from './game.js';


window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'm' && state.gameStarted && !state.levelComplete) {
        applyBarrier();
    }
    if (event.key.toLowerCase() === 'b' && state.gameStarted && !state.levelComplete) {
        applyBarrier();
    }
});
// --- Power-up Definitions ---
export const POWERUP_TYPE = {
    PADDLE_SIZE_UP: 'PADDLE_SIZE_UP',
    PADDLE_DOUBLE_SIZE: 'PADDLE_DOUBLE_SIZE', // Add the new powerup type
    MULTI_BALL: 'MULTI_BALL',
    EXPLOSIVE_BALL: 'EXPLOSIVE_BALL',
    BARRIER: 'BARRIER'
};


export function createPowerUp(position, type) {
    const powerUpGroup = new THREE.Group();

    if (type === POWERUP_TYPE.MULTI_BALL) {
        // Create three spheres for multi-ball powerup
        const sphereGeometry = new THREE.SphereGeometry(constants.BRICK_WIDTH * 0.15);
        const materials = [
            new THREE.MeshStandardMaterial({ 
                color: 0xff0000, 
                emissive: 0xff0000, 
                emissiveIntensity: 0.5 
            }),
            new THREE.MeshStandardMaterial({ 
                color: 0x00ff00, 
                emissive: 0x00ff00, 
                emissiveIntensity: 0.5 
            }),
            new THREE.MeshStandardMaterial({ 
                color: 0x0000ff, 
                emissive: 0x0000ff, 
                emissiveIntensity: 0.5 
            })
        ];

        // Create three spheres
        const sphere1 = new THREE.Mesh(sphereGeometry, materials[0]);
        const sphere2 = new THREE.Mesh(sphereGeometry, materials[1]);
        const sphere3 = new THREE.Mesh(sphereGeometry, materials[2]);

        // Position spheres (pyramid formation)
        sphere1.position.set(-constants.BRICK_WIDTH * 0.2, 0, 0);
        sphere2.position.set(constants.BRICK_WIDTH * 0.2, 0, 0);
        sphere3.position.set(0, constants.BRICK_HEIGHT * 0.3, 0);

        // Add spheres to group
        powerUpGroup.add(sphere1);
        powerUpGroup.add(sphere2);
        powerUpGroup.add(sphere3);

    } else if (type === POWERUP_TYPE.EXPLOSIVE_BALL) {
        // Create explosion shape
        const coreGeometry = new THREE.SphereGeometry(constants.BRICK_WIDTH * 0.2);
        const spikeGeometry = new THREE.ConeGeometry(
            constants.BRICK_WIDTH * 0.1, 
            constants.BRICK_WIDTH * 0.3, 
            8
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff3300,
            emissiveIntensity: 0.8
        });

        // Create core sphere
        const core = new THREE.Mesh(coreGeometry, material);
        powerUpGroup.add(core);

        // Add spikes around the sphere
        for (let i = 0; i < 8; i++) {
            const spike = new THREE.Mesh(spikeGeometry, material);
            const angle = (i / 8) * Math.PI * 2;
            spike.position.set(
                Math.cos(angle) * constants.BRICK_WIDTH * 0.3,
                Math.sin(angle) * constants.BRICK_WIDTH * 0.3,
                0
            );
            spike.rotation.z = angle + Math.PI / 2;
            powerUpGroup.add(spike);
        }

    } else if (type === POWERUP_TYPE.BARRIER) {
        // Create shield-like icon
        
        // Main shield body - curved surface
        const shieldGeometry = new THREE.SphereGeometry(
            constants.BRICK_WIDTH * 0.3, 
            16, 
            16, 
            0, 
            Math.PI, 
            0, 
            Math.PI / 2
        );
        
        const shieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366cc,  // Blue shield color
            emissive: 0x224488,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.2
        });
        
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.rotation.x = Math.PI / 2;
        shield.position.set(0, 0, 0);
        powerUpGroup.add(shield);
        
        // Add shield rim
        const rimGeometry = new THREE.TorusGeometry(
            constants.BRICK_WIDTH * 0.28, 
            constants.BRICK_WIDTH * 0.04, 
            8, 
            20, 
            Math.PI
        );
        
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            emissive: 0x666666,
            emissiveIntensity: 0.3,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.set(0, 0, 0);
        powerUpGroup.add(rim);
        
        // Add decorative elements (vertical reinforcement bars)
        for (let i = -2; i <= 2; i += 2) {
            const barGeometry = new THREE.BoxGeometry(
                constants.BRICK_WIDTH * 0.03, 
                constants.BRICK_HEIGHT * 0.25,
                constants.BRICK_DEPTH * 0.02
            );
            
            const bar = new THREE.Mesh(barGeometry, rimMaterial);
            bar.position.set(
                constants.BRICK_WIDTH * i * 0.1,
                0,
                -constants.BRICK_DEPTH * 0.05
            );
            bar.rotation.x = Math.PI / 4;
            powerUpGroup.add(bar);
        }
        
    } else {
        // Create plus shape for other powerups
        const horizontalGeometry = new THREE.BoxGeometry(
            constants.BRICK_WIDTH * 0.6,
            constants.BRICK_HEIGHT * 0.2,
            constants.BRICK_DEPTH * 0.2
        );
        
        const verticalGeometry = new THREE.BoxGeometry(
            constants.BRICK_WIDTH * 0.2,
            constants.BRICK_HEIGHT * 0.6,
            constants.BRICK_DEPTH * 0.2
        );
        
        const powerUpMaterial = new THREE.MeshStandardMaterial({
            emissive: 0x00ff00,
            color: 0x008800,
            emissiveIntensity: 0.8
        });

        // Create the horizontal and vertical parts
        const horizontalPart = new THREE.Mesh(horizontalGeometry, powerUpMaterial);
        const verticalPart = new THREE.Mesh(verticalGeometry, powerUpMaterial);

        // Add both parts to the group
        powerUpGroup.add(horizontalPart);
        powerUpGroup.add(verticalPart);
    }

    // Position the group
    powerUpGroup.position.copy(position);
    
    // Add userData for type and behavior
    powerUpGroup.userData = {
        type: type,
        isPowerUp: true,
        rotationSpeed: 0.03,
        velocity: new THREE.Vector3(0, -0.05, 0) // Slower falling speed
    };

    // Enable shadows for all meshes in the group
    powerUpGroup.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    return powerUpGroup;
}

// Then modify your updatePaddle function or wherever you update powerups to add rotation:
export function updatePowerups() {
    if (state.powerups) {
        state.powerups.forEach(powerup => {
            powerup.rotation.y += powerup.userData.rotationSpeed;
            // Existing falling logic remains the same
            powerup.position.add(powerup.userData.velocity);
        });
    }
}

// --- Power-up Effects ---
export function applyPaddleSizeUp() {
    if (state.paddle && !state.paddle.userData.isPowerUpActive) {
        state.paddle.scale.x = 1.5; // Increase paddle width
        state.paddle.position.y += constants.PADDLE_HEIGHT * 0.25; // Adjust position slightly
        state.paddle.userData.originalScale = state.paddle.scale.clone();
        state.paddle.userData.isPowerUpActive = true;

        // Revert after a duration
        setTimeout(() => {
            if (state.paddle && state.paddle.userData.originalScale) {
                state.paddle.scale.copy(state.paddle.userData.originalScale);
                state.paddle.position.y -= constants.PADDLE_HEIGHT * 0.25;
                state.paddle.userData.isPowerUpActive = false;
                delete state.paddle.userData.originalScale;
            }
        }, 5000); // 5 seconds duration
    }
}

export function applyPaddleDoubleSize() {
    if (state.paddle && !state.paddle.userData.isPowerUpActive) {
        state.paddle.scale.x = 2.0; // Double paddle width
        state.paddle.position.y += constants.PADDLE_HEIGHT * 0.25;
        state.paddle.userData.originalScale = state.paddle.scale.clone();
        state.paddle.userData.isPowerUpActive = true;

        // Revert after 10 seconds
        setTimeout(() => {
            if (state.paddle && state.paddle.userData.originalScale) {
                state.paddle.scale.copy(state.paddle.userData.originalScale);
                state.paddle.position.y -= constants.PADDLE_HEIGHT * 0.25;
                state.paddle.userData.isPowerUpActive = false;
                delete state.paddle.userData.originalScale;
            }
        }, 10000); // 10 seconds duration
    }
}


export function applyMultiBall() {
    if (state.ball) {
        // Create two additional balls
        state.extraBalls = state.extraBalls || [];

        for (let i = 0; i < 2; i++) {
            const ballGeometry = new THREE.SphereGeometry(constants.BALL_RADIUS, 32, 32);
            const ballMaterial = new THREE.MeshStandardMaterial({ 
                color: i === 0 ? 0xff0000 : 0x00ff00, // Red and green for extra balls
                emissive: i === 0 ? 0xff0000 : 0x00ff00,
                emissiveIntensity: 0.4
            });

            const newBall = new THREE.Mesh(ballGeometry, ballMaterial);
            
            // Position above paddle
            newBall.position.copy(state.paddle.position);
            newBall.position.y += constants.BALL_RADIUS * 2;

            // Random initial velocity
            const angle = (i + 1) * Math.PI / 3; // Spread the balls out
            const velocity = new THREE.Vector3(
                Math.cos(angle) * 0.2,
                Math.abs(Math.sin(angle)) * 0.2,
                (Math.random() - 0.5) * 0.1
            ).normalize().multiplyScalar(constants.BALL_SPEED);

            newBall.userData = {
                isExtraBall: true,
                velocity: velocity,
                creationTime: Date.now() // Track when the ball was created
            };

            // Add ball light
            const ballLight = new THREE.PointLight(i === 0 ? 0xff0000 : 0x00ff00, 1.2, 10);
            ballLight.position.set(0, 0, 0);
            newBall.add(ballLight);

            newBall.castShadow = true;
            newBall.receiveShadow = true;

            state.scene.add(newBall);
            state.extraBalls.push(newBall);
            
            // Set timeout to remove this ball after 5 seconds
            setTimeout(() => {
                // Remove the ball if it still exists
                if (state.extraBalls && state.scene) {
                    const index = state.extraBalls.indexOf(newBall);
                    if (index !== -1) {
                        state.extraBalls.splice(index, 1);
                        state.scene.remove(newBall);
                    }
                }
            }, 5000); // 5 seconds duration
        }
    }
}

export function applyExplosiveBall() {
    if (state.ball) {
        // Change ball color to orange and add glow
        state.ball.material.color.setHex(0xff6600);
        state.ball.material.emissive.setHex(0xff3300);
        state.ball.material.emissiveIntensity = 0.8;

        // Add explosive property
        state.ball.userData.explosive = true;

        // Reset after 10 seconds
        setTimeout(() => {
            if (state.ball) {
                state.ball.material.color.setHex(0xffffff);
                state.ball.material.emissive.setHex(0x0033ff);
                state.ball.material.emissiveIntensity = 0.4;
                state.ball.userData.explosive = false;
            }
        }, 10000);
    }
}



export function applyBarrier() {
    if (!state.barrier) {
        // Make barrier cover full width and depth
        const barrierGeometry = new THREE.BoxGeometry(
            constants.GAME_WIDTH,       // Full width
            constants.BRICK_HEIGHT,     // Keep height the same
            constants.GAME_DEPTH        // Full depth to cover entire bottom
        );

        const barrierMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            emissive: 0x404040,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });

        state.barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        
        // Position at bottom of game area
        state.barrier.position.set(
            0,                                              // Center X
            -constants.GAME_HEIGHT/2 + constants.BRICK_HEIGHT/2,  // Bottom Y (adjusted for height)
            0                                               // Center Z
        );

        state.scene.add(state.barrier);

        // Start blinking 2 seconds before disappearing
        const blinkingDuration = 2000; // 2 seconds of blinking
        const totalDuration = 15000; // 15 seconds total
        const blinkStart = totalDuration - blinkingDuration;
        
        // Set blinking interval
        let isVisible = true;
        let blinkingInterval;
        
        // Start blinking after 13 seconds
        setTimeout(() => {
            if (state.barrier) {
                blinkingInterval = setInterval(() => {
                    if (state.barrier) {
                        isVisible = !isVisible;
                        state.barrier.material.opacity = isVisible ? 0.7 : 0.2;
                    }
                }, 200); // Blink every 200ms
            }
        }, blinkStart);

        // Remove barrier after 15 seconds
        setTimeout(() => {
            if (state.barrier) {
                // Clear the blinking interval if it exists
                if (blinkingInterval) {
                    clearInterval(blinkingInterval);
                }
                state.scene.remove(state.barrier);
                state.barrier = null;
            }
        }, totalDuration);
    }
}

/**
 * Creates a fire aura effect around an object
 * @param {THREE.Object3D} targetObject - The object to apply the fire aura to
 * @param {Object} options - Configuration options
 */
export function createFireAura(targetObject, options = {}) {
    const defaults = {
        particleCount: 50,
        color: 0xff5500,
        secondaryColor: 0xffaa00,
        size: 0.15,
        lifetime: 1000,
        speed: 0.02,
        radius: 1.2
    };
    
    // Merge defaults with provided options
    const config = { ...defaults, ...options };
    
    // Create particles container
    const aura = new THREE.Group();
    aura.name = 'fireAura';
    
    // Create particles
    for (let i = 0; i < config.particleCount; i++) {
        // Alternate between primary and secondary colors
        const material = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? config.color : config.secondaryColor,
            transparent: true,
            opacity: 0.7
        });
        
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(config.size * (0.5 + Math.random() * 0.5), 8, 8),
            material
        );
        
        // Random position around the target
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = config.radius * (0.8 + Math.random() * 0.4);
        
        particle.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        // Set particle metadata
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * config.speed,
                (Math.random() * 0.5 + 0.5) * config.speed, // Mostly upward
                (Math.random() - 0.5) * config.speed
            ),
            lifetime: config.lifetime,
            age: 0,
            initialOpacity: material.opacity
        };
        
        aura.add(particle);
    }
    
    // Add the aura to the target object
    targetObject.add(aura);
    
    // Attach update method to the aura for animation
    aura.update = function(deltaTime) {
        this.children.forEach(particle => {
            // Move particle
            particle.position.add(particle.userData.velocity);
            
            // Age particle
            particle.userData.age += deltaTime;
            
            // Fade out based on age
            const lifeRatio = particle.userData.age / particle.userData.lifetime;
            if (particle.material) {
                particle.material.opacity = particle.userData.initialOpacity * (1 - lifeRatio);
            }
            
            // Shrink particle
            particle.scale.multiplyScalar(0.99);
            
            // Reset particle if it's too old
            if (particle.userData.age >= particle.userData.lifetime) {
                // Reset position
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                const radius = config.radius * (0.8 + Math.random() * 0.2);
                
                particle.position.set(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                );
                
                // Reset parameters
                particle.scale.set(1, 1, 1);
                particle.userData.age = 0;
                particle.userData.velocity.set(
                    (Math.random() - 0.5) * config.speed,
                    (Math.random() * 0.5 + 0.5) * config.speed,
                    (Math.random() - 0.5) * config.speed
                );
                
                if (particle.material) {
                    particle.material.opacity = particle.userData.initialOpacity;
                }
            }
        });
    };
    
    // Return the aura for further manipulation
    return aura;
}