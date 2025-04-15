import { initGame } from './game/game.js';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing game...");
    try {
        initGame();
        
        // Hide loading message when game starts
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    } catch (error) {
        console.error("Error initializing game:", error);
        
        // Update loading message with error
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `Error loading game: ${error.message}<br>Please check the console for details.`;
        }
    }
});
