import * as THREE from 'three';
import { state, constants } from './game.js';

// Set up all lighting for the game
export function setupLighting() {
    // Clear any existing lights
    for (const key in state.lights) {
        if (state.lights[key]) {
            state.scene.remove(state.lights[key]);
            state.lights[key] = null;
        }
    }
    
    // Ambient light for general scene illumination
    state.lights.ambient = new THREE.AmbientLight(0x404040, 1.5);
    state.scene.add(state.lights.ambient);

    // Main directional light (simulates sun)
    state.lights.directional = new THREE.DirectionalLight(0xffffff, 1);
    state.lights.directional.position.set(10, 30, 20);
    state.lights.directional.castShadow = true;
    state.lights.directional.shadow.camera.left = -50;
    state.lights.directional.shadow.camera.right = 50;
    state.lights.directional.shadow.camera.top = 50;
    state.lights.directional.shadow.camera.bottom = -50;
    state.lights.directional.shadow.mapSize.width = 1024;
    state.lights.directional.shadow.mapSize.height = 1024;
    
    // Add directional light helper for debugging
    const directionalHelper = new THREE.DirectionalLightHelper(state.lights.directional, 5);
    directionalHelper.visible = false;
    state.lights.directional.helper = directionalHelper;
    state.scene.add(directionalHelper);
    state.scene.add(state.lights.directional);

    // Point light
    state.lights.point = new THREE.PointLight(0x4477ff, 1, 50);
    state.lights.point.position.set(0, 5, 15);
    state.lights.point.castShadow = true;
    
    // Add point light helper
    const pointHelper = new THREE.PointLightHelper(state.lights.point, 1);
    pointHelper.visible = false;
    state.lights.point.helper = pointHelper;
    state.scene.add(pointHelper);
    state.scene.add(state.lights.point);
    
    // Spotlight
    state.lights.spotlight = new THREE.SpotLight(0xffffff, 1);
    state.lights.spotlight.position.set(0, constants.GAME_HEIGHT/2, constants.GAME_DEPTH/2);
    state.lights.spotlight.angle = Math.PI / 6;
    state.lights.spotlight.penumbra = 0.2;
    state.lights.spotlight.decay = 2;
    state.lights.spotlight.distance = 100;
    state.lights.spotlight.castShadow = true;
    state.lights.spotlight.shadow.mapSize.width = 1024;
    state.lights.spotlight.shadow.mapSize.height = 1024;
    state.lights.spotlight.target.position.set(0, 0, 0);
    state.scene.add(state.lights.spotlight.target);
    
    // Add spotlight helper
    const spotlightHelper = new THREE.SpotLightHelper(state.lights.spotlight);
    spotlightHelper.visible = false;
    state.lights.spotlight.helper = spotlightHelper;
    state.scene.add(spotlightHelper);
    state.scene.add(state.lights.spotlight);
    
    // Hemispheric light
    state.lights.hemispheric = new THREE.HemisphereLight(0x90c0ff, 0x802020, 1);
    state.lights.hemispheric.position.set(0, constants.GAME_HEIGHT/2, 0);
    
    // Add hemisphere light helper
    const hemisphereHelper = new THREE.HemisphereLightHelper(state.lights.hemispheric, 5);
    hemisphereHelper.visible = false;
    state.lights.hemispheric.helper = hemisphereHelper;
    state.scene.add(hemisphereHelper);
    state.scene.add(state.lights.hemispheric);
    
    // Apply initial light states
    updateLightVisibility();
}

// Toggle light visibility based on enabled state
export function updateLightVisibility() {
    // Update ambient light
    if (state.lights.ambient) {
        state.lights.ambient.intensity = state.lightsEnabled.ambient ? 1.5 : 0;
    }
    
    // Update directional light
    if (state.lights.directional) {
        state.lights.directional.intensity = state.lightsEnabled.directional ? 1 : 0;
        if (state.lights.directional.helper) {
            state.lights.directional.helper.visible = state.lightsEnabled.directional && state.showHelpers;
        }
    }
    
    // Update point light
    if (state.lights.point) {
        state.lights.point.intensity = state.lightsEnabled.point ? 1 : 0;
        if (state.lights.point.helper) {
            state.lights.point.helper.visible = state.lightsEnabled.point && state.showHelpers;
        }
    }
    
    // Update spotlight
    if (state.lights.spotlight) {
        state.lights.spotlight.intensity = state.lightsEnabled.spotlight ? 1 : 0;
        if (state.lights.spotlight.helper) {
            state.lights.spotlight.helper.visible = state.lightsEnabled.spotlight && state.showHelpers;
        }
    }
    
    // Update hemispheric light
    if (state.lights.hemispheric) {
        state.lights.hemispheric.intensity = state.lightsEnabled.hemispheric ? 1 : 0;
        if (state.lights.hemispheric.helper) {
            state.lights.hemispheric.helper.visible = state.lightsEnabled.hemispheric && state.showHelpers;
        }
    }
}

// Toggle a specific light on/off
export function toggleLight(lightName) {
    if (state.lightsEnabled.hasOwnProperty(lightName)) {
        state.lightsEnabled[lightName] = !state.lightsEnabled[lightName];
        updateLightVisibility();
    }
}

// Toggle helper visibility
export function toggleHelpers() {
    state.showHelpers = !state.showHelpers;
    updateLightVisibility();
}
