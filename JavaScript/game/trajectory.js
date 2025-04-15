import * as THREE from 'three';
import { state, constants } from './game.js';

// Constants for trajectory
const TRAJECTORY_LENGTH = 500;
const TRAJECTORY_STEP = 1;

// Create trajectory prediction using individual small spheres
export function createTrajectoryLine() {
    console.log("Creating trajectory visualization with spheres");
    
    // Clear any existing trajectory elements
    clearTrajectory();
    
    // Create small spheres for each point in the trajectory
    const sphereGeometry = new THREE.SphereGeometry(constants.BALL_RADIUS * 0.5, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: state.trajectoryColor || 0xffff00, // Default to yellow if not set
        transparent: true,
        opacity: 0.6 // Increased opacity for better visibility
    });
    
    // Create spheres for each trajectory point (reduced for better performance)
    const visiblePoints = Math.min(100, TRAJECTORY_LENGTH);
    for (let i = 0; i < visiblePoints; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone()); // Clone material for individual opacity
        sphere.visible = true;
        state.scene.add(sphere);
        state.trajectoryObjects.push(sphere);
    }
    
    // Force an immediate trajectory update
    forceUpdateTrajectory();
}

// Clear all trajectory objects
export function clearTrajectory() {
    for (const obj of state.trajectoryObjects) {
        state.scene.remove(obj);
    }
    state.trajectoryObjects = [];
}

// Update trajectory prediction with sphere objects
export function forceUpdateTrajectory() {
    if (!state.ball || state.trajectoryObjects.length === 0) return;
    
    // Start from current ball position
    const startPos = state.ball.position.clone();
    
    // Create a predictive velocity vector
    const velocity = state.ballVelocity.clone().normalize().multiplyScalar(constants.BALL_SPEED);
    const pos = startPos.clone();
    
    // Update position of each trajectory sphere
    for (let i = 0; i < state.trajectoryObjects.length; i++) {
        // For first point, use ball position
        if (i === 0) {
            state.trajectoryObjects[i].position.copy(pos);
            continue;
        }
        
        // For subsequent points, simulate physics
        for (let step = 0; step < TRAJECTORY_STEP * 10; step++) {
            // Move forward in smaller increments for more accurate bounces
            pos.add(velocity.clone().multiplyScalar(TRAJECTORY_STEP / 10));
            
            // Handle bounces with walls
            if (pos.x <= -constants.GAME_WIDTH/2 + constants.BALL_RADIUS || 
                pos.x >= constants.GAME_WIDTH/2 - constants.BALL_RADIUS) {
                velocity.x *= -1;
            }
            if (pos.y >= constants.GAME_HEIGHT/2 - constants.BALL_RADIUS) {
                velocity.y *= -1;
            }
            if (pos.z <= -constants.GAME_DEPTH/2 + constants.BALL_RADIUS || 
                pos.z >= constants.GAME_DEPTH/2 - constants.BALL_RADIUS) {
                velocity.z *= -1;
            }
        }
        
        // Update sphere position
        state.trajectoryObjects[i].position.copy(pos);
        
        // Enhanced visibility with less aggressive fading
        const fadeRatio = i / state.trajectoryObjects.length;
        state.trajectoryObjects[i].material.opacity = 0.6 * (1 - fadeRatio * 0.7);
    }
}

// Update trajectory visibility based on game state
export function updateTrajectory() {
    // Exit if no trajectory or no ball
    if (state.trajectoryObjects.length === 0 || !state.ball) return;
    
    // Always make trajectory visible when enabled (removed game state conditions)
    const shouldBeVisible = state.showTrajectory;
    
    // Update visibility for all trajectory objects
    state.trajectoryObjects.forEach(sphere => {
        sphere.visible = shouldBeVisible;
    });
    
    // Only update positions if visible
    if (shouldBeVisible) {
        forceUpdateTrajectory();
    }
}

// Toggle trajectory visibility
export function toggleTrajectory() {
    state.showTrajectory = !state.showTrajectory;
    console.log(`Trajectory ${state.showTrajectory ? 'enabled' : 'disabled'}`);
    
    // Force immediate update of trajectory visibility
    updateTrajectory();
}
