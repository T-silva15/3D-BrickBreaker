import { state } from './game.js';

// Create a permanent game UI
export function createGameUI() {
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
    
    // Create control hints with toggle functionality
    const controlsHeader = document.createElement('div');
    controlsHeader.style.marginTop = '10px';
    controlsHeader.style.cursor = 'pointer';
    controlsHeader.style.transition = 'color 0.3s';
    controlsHeader.innerHTML = `
        <div style="color: #aaffaa; margin-bottom: 5px;">
            Controls: <span id="controls-toggle-icon" style="color: #00ffff;">[-]</span>
        </div>
    `;
    uiContainer.appendChild(controlsHeader);
    
    // Control hints content
    const controlHints = document.createElement('div');
    controlHints.id = 'control-hints';
    controlHints.style.fontSize = '12px';
    controlHints.style.transition = 'max-height 0.3s ease-out, opacity 0.3s';
    controlHints.style.overflow = 'hidden';
    controlHints.style.maxHeight = '200px'; // Start expanded
    controlHints.style.opacity = '1';
    controlHints.innerHTML = `
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
    
    // Add click event to toggle controls visibility
    let controlsVisible = true;
    controlsHeader.addEventListener('click', () => {
        controlsVisible = !controlsVisible;
        if (controlsVisible) {
            controlHints.style.maxHeight = '200px';
            controlHints.style.opacity = '1';
            document.getElementById('controls-toggle-icon').textContent = '[-]';
        } else {
            controlHints.style.maxHeight = '0';
            controlHints.style.opacity = '0';
            document.getElementById('controls-toggle-icon').textContent = '[+]';
        }
    });
    
    // Add hover effect
    controlsHeader.addEventListener('mouseenter', () => {
        controlsHeader.style.color = '#00ffff';
    });
    
    controlsHeader.addEventListener('mouseleave', () => {
        controlsHeader.style.color = '#aaffaa';
    });
    
    // Create light indicators section
const lightsHeader = document.createElement('div');
lightsHeader.style.marginTop = '10px';
lightsHeader.style.cursor = 'pointer';
lightsHeader.style.transition = 'color 0.3s';
lightsHeader.innerHTML = `
    <div style="color: #ffaaaa; margin-bottom: 5px;">
        Lights: <span id="lights-toggle-icon" style="color: #00ffff;">[-]</span>
    </div>
`;
uiContainer.appendChild(lightsHeader);

const lightIndicators = document.createElement('div');
lightIndicators.id = 'light-indicators';
lightIndicators.style.fontSize = '12px';
lightIndicators.style.transition = 'max-height 0.3s ease-out, opacity 0.3s';
lightIndicators.style.overflow = 'hidden';
lightIndicators.style.maxHeight = '200px'; // Start expanded
lightIndicators.style.opacity = '1';
lightIndicators.innerHTML = `
    <div>Ambient (1): <span id="ambient-status" style="color: #88ff88;">ON</span></div>
    <div>Directional (2): <span id="directional-status" style="color: #88ff88;">ON</span></div>
    <div>Point (3): <span id="point-status" style="color: #88ff88;">ON</span></div>
    <div>Spotlight (4): <span id="spotlight-status" style="color: #ff8888;">OFF</span></div>
    <div>Hemispheric (5): <span id="hemispheric-status" style="color: #ff8888;">OFF</span></div>
`;
uiContainer.appendChild(lightIndicators);

    // Add click event to toggle lights visibility
    let lightsVisible = true;
    lightsHeader.addEventListener('click', () => {
        lightsVisible = !lightsVisible;
        if (lightsVisible) {
            lightIndicators.style.maxHeight = '200px';
            lightIndicators.style.opacity = '1';
            document.getElementById('lights-toggle-icon').textContent = '[-]';
        } else {
            lightIndicators.style.maxHeight = '0';
            lightIndicators.style.opacity = '0';
            document.getElementById('lights-toggle-icon').textContent = '[+]';
        }
    });

    // Add hover effect
    lightsHeader.addEventListener('mouseenter', () => {
        lightsHeader.style.color = '#ff8888';
    });

    lightsHeader.addEventListener('mouseleave', () => {
        lightsHeader.style.color = '#ffaaaa';
    });
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
export function updateUI() {
    // Update brick count
    const brickCount = document.getElementById('brick-count');
    if (brickCount) {
        brickCount.textContent = state.bricks.filter(brick => brick.userData.active).length;
    }
    
    // Update camera name
    const cameraName = document.getElementById('camera-name');
    if (cameraName && state.camera) {
        cameraName.textContent = state.camera.name || 'Unknown';
    }
    
    // Update light status indicators
    for (const light in state.lightsEnabled) {
        const statusElement = document.getElementById(`${light}-status`);
        if (statusElement) {
            statusElement.textContent = state.lightsEnabled[light] ? 'ON' : 'OFF';
            statusElement.style.color = state.lightsEnabled[light] ? '#88ff88' : '#ff8888';
        }
    }
    
    // Update score and level
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
        scoreValue.textContent = state.score;
    }
    
    const levelValue = document.getElementById('level-value');
    if (levelValue) {
        levelValue.textContent = state.level;
    }
    
    const cameraType = document.getElementById('camera-type');
    if (cameraType) {
        cameraType.textContent = state.usingOrthographic ? 'Orthographic' : 'Perspective';
    }
    
    // Update trajectory status
    const trajectoryStatus = document.getElementById('trajectory-status');
    if (trajectoryStatus) {
        trajectoryStatus.textContent = state.showTrajectory ? 'ON' : 'OFF';
        trajectoryStatus.style.color = state.showTrajectory ? '#88ff88' : '#ff8888';
    }
    
    // Continue updating
    requestAnimationFrame(updateUI);
}

// Display a message on screen
export function displayMessage(title, subtitle) {
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

// Add debugging information display
export function addDebugInfo() {
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
        
        // Only continue if state has required properties
        if (!state.camera || !state.ball) {
            requestAnimationFrame(updateDebugInfo);
            return;
        }
        
        debugDiv.innerHTML = `
            Camera: ${state.camera.position.x.toFixed(1)}, ${state.camera.position.y.toFixed(1)}, ${state.camera.position.z.toFixed(1)}<br>
            Ball: ${state.ball.position.x.toFixed(1)}, ${state.ball.position.y.toFixed(1)}, ${state.ball.position.z.toFixed(1)}<br>
            Ball Velocity: ${state.ballVelocity.x.toFixed(2)}, ${state.ballVelocity.y.toFixed(2)}, ${state.ballVelocity.z.toFixed(2)}<br>
            Game Started: ${state.gameStarted}<br>
            Level Complete: ${state.levelComplete}<br>
            Game Over: ${state.gameOver}<br>
            Active Bricks: ${state.bricks.filter(b => b.userData.active).length}<br>
            Controls: ${state.useMouse ? 'Mouse' : 'Keyboard'}<br>
        `;
        requestAnimationFrame(updateDebugInfo);
    }
    
    updateDebugInfo();
    
    // Add toggle capability
    document.addEventListener('keydown', (event) => {
        if (event.key === 'd') {
            debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
        }
    });
}

export function updateLivesDisplay() {
    const livesElement = document.getElementById('game-lives');
    if (livesElement) {
        livesElement.textContent = `Vidas: ${state.lives}`;
    } else {
        // If lives element doesn't exist yet, create it
        const livesDisplay = document.createElement('div');
        livesDisplay.id = 'game-lives';
        livesDisplay.className = 'game-info';
        livesDisplay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 20px;
            user-select: none;
        `;
        livesDisplay.textContent = `Vidas: ${state.lives}`;
        document.body.appendChild(livesDisplay);
    }
}

export function updateScoreDisplay() {
    const scoreValue = document.getElementById('score-value');
    if (scoreValue) {
        scoreValue.textContent = state.score;
    } else {
        // If score element doesn't exist in main UI, create a standalone score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.className = 'game-info';
        scoreDisplay.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 20px;
            user-select: none;
        `;
        scoreDisplay.innerHTML = `Pontuação: <span id="score-value">${state.score}</span>`;
        document.body.appendChild(scoreDisplay);
    }
}