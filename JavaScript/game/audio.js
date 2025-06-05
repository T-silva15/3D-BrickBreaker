// Audio system state
const audioState = {
    context: null,
    masterGain: null,
    enabled: true,
    volume: 0.3,
    sounds: new Map(),
    currentlyPlaying: new Set(),
    maxConcurrentSounds: 16
};

// Sound configurations
const SOUND_CONFIG = {
    ballPaddle: {
        type: 'synthesized',
        frequency: 440,
        duration: 0.1,
        volume: 0.8,
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.04 }
    },
    ballWall: {
        type: 'synthesized',
        frequency: 220,
        duration: 0.15,
        volume: 0.6,
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.2, release: 0.06 }
    },
    brickHit: {
        type: 'synthesized',
        frequency: 330,
        duration: 0.2,
        volume: 0.7,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.09 }
    },
    brickDestroy: {
        type: 'explosion',
        frequency: 150,
        duration: 0.4,
        volume: 0.8,
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.24 }
    },
    strongBrickHit: {
        type: 'metallic',
        frequency: 800,
        duration: 0.25,
        volume: 0.75,
        envelope: { attack: 0.01, decay: 0.12, sustain: 0.3, release: 0.12 }
    },
    metalBrickHit: {
        type: 'metallic',
        frequency: 1200,
        duration: 0.3,
        volume: 0.8,
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.25, release: 0.14 }
    },
    powerupSpawn: {
        type: 'powerup',
        frequency: 600,
        duration: 0.5,
        volume: 0.6,
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.28 }
    },
    powerupCollect: {
        type: 'collect',
        frequency: 800,
        duration: 0.3,
        volume: 0.8,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.19 }
    },
    gameOver: {
        type: 'descending',
        frequency: 440,
        duration: 2.0,
        volume: 0.9,
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 1.1 }
    },
    levelComplete: {
        type: 'ascending',
        frequency: 440,
        duration: 1.5,
        volume: 0.8,
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.7 }
    },
    bossHit: {
        type: 'boss',
        frequency: 100,
        duration: 0.6,
        volume: 0.9,
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.38 }
    },
    thunderStrike: {
        type: 'thunder',
        frequency: 60,
        duration: 1.0,
        volume: 1.0,
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.69 }
    },
    projectileShoot: {
        type: 'laser',
        frequency: 1000,
        duration: 0.2,
        volume: 0.7,
        envelope: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.04 }
    }
};

/**
 * Initialize the audio system
 */
export function initAudio() {
    try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioState.context = new AudioContext();
        
        // Create master gain node for volume control
        audioState.masterGain = audioState.context.createGain();
        audioState.masterGain.connect(audioState.context.destination);
        audioState.masterGain.gain.setValueAtTime(audioState.volume, audioState.context.currentTime);
        
        // Handle browser autoplay policy
        if (audioState.context.state === 'suspended') {
            const resumeAudio = () => {
                audioState.context.resume();
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            document.addEventListener('click', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        }
        
        console.log('Audio system initialized successfully');
        return true;
    } catch (error) {
        console.warn('Failed to initialize audio system:', error);
        audioState.enabled = false;
        return false;
    }
}

/**
 * Create an oscillator with the specified parameters
 */
function createOscillator(frequency, type = 'sine', detune = 0) {
    const oscillator = audioState.context.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, audioState.context.currentTime);
    oscillator.type = type;
    if (detune !== 0) {
        oscillator.detune.setValueAtTime(detune, audioState.context.currentTime);
    }
    return oscillator;
}

/**
 * Create a gain node with ADSR envelope
 */
function createEnvelope(config) {
    const gainNode = audioState.context.createGain();
    const now = audioState.context.currentTime;
    const { attack, decay, sustain, release } = config.envelope;
    
    // Start at zero
    gainNode.gain.setValueAtTime(0, now);
    
    // Attack phase
    gainNode.gain.linearRampToValueAtTime(config.volume, now + attack);
    
    // Decay phase
    gainNode.gain.linearRampToValueAtTime(config.volume * sustain, now + attack + decay);
    
    // Release phase (scheduled for later)
    const releaseStart = now + config.duration - release;
    gainNode.gain.setValueAtTime(config.volume * sustain, releaseStart);
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration);
    
    return gainNode;
}

/**
 * Create noise generator for percussion sounds
 */
function createNoise(duration) {
    const bufferSize = audioState.context.sampleRate * duration;
    const buffer = audioState.context.createBuffer(1, bufferSize, audioState.context.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioState.context.createBufferSource();
    noiseSource.buffer = buffer;
    return noiseSource;
}

/**
 * Create filter for sound shaping
 */
function createFilter(type, frequency, Q = 1) {
    const filter = audioState.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, audioState.context.currentTime);
    filter.Q.setValueAtTime(Q, audioState.context.currentTime);
    return filter;
}

/**
 * Play a synthesized sound effect
 */
function playSynthesizedSound(config) {
    const envelope = createEnvelope(config);
    const oscillator = createOscillator(config.frequency, 'square');
    
    // Add some harmonic content
    const oscillator2 = createOscillator(config.frequency * 2, 'sine');
    const gain2 = audioState.context.createGain();
    gain2.gain.setValueAtTime(0.3, audioState.context.currentTime);
    
    // Connect audio graph
    oscillator.connect(envelope);
    oscillator2.connect(gain2);
    gain2.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + config.duration);
    oscillator2.stop(now + config.duration);
    
    return { oscillator, oscillator2, envelope };
}

/**
 * Play an explosion sound effect
 */
function playExplosionSound(config) {
    const envelope = createEnvelope(config);
    
    // Create noise for explosion
    const noise = createNoise(config.duration);
    const filter = createFilter('lowpass', 800, 2);
    
    // Add low frequency boom
    const boom = createOscillator(config.frequency, 'sine');
    const boomGain = audioState.context.createGain();
    boomGain.gain.setValueAtTime(0.7, audioState.context.currentTime);
    
    // Connect audio graph
    noise.connect(filter);
    filter.connect(envelope);
    boom.connect(boomGain);
    boomGain.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    noise.start(now);
    boom.start(now);
    noise.stop(now + config.duration);
    boom.stop(now + config.duration);
    
    return { noise, boom, envelope, filter };
}

/**
 * Play a metallic sound effect
 */
function playMetallicSound(config) {
    const envelope = createEnvelope(config);
    
    // Multiple oscillators for metallic sound
    const osc1 = createOscillator(config.frequency, 'square');
    const osc2 = createOscillator(config.frequency * 1.414, 'sawtooth'); // Dissonant interval
    const osc3 = createOscillator(config.frequency * 2.618, 'triangle'); // Golden ratio harmonic
    
    const gain1 = audioState.context.createGain();
    const gain2 = audioState.context.createGain();
    const gain3 = audioState.context.createGain();
    
    gain1.gain.setValueAtTime(0.5, audioState.context.currentTime);
    gain2.gain.setValueAtTime(0.3, audioState.context.currentTime);
    gain3.gain.setValueAtTime(0.2, audioState.context.currentTime);
    
    // Add resonant filter
    const filter = createFilter('bandpass', config.frequency * 2, 10);
    
    // Connect audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    [osc1, osc2, osc3].forEach(osc => {
        osc.start(now);
        osc.stop(now + config.duration);
    });
    
    return { osc1, osc2, osc3, envelope, filter };
}

/**
 * Play a power-up sound effect
 */
function playPowerupSound(config) {
    const envelope = createEnvelope(config);
    
    // Ascending arpeggio
    const frequencies = [
        config.frequency,
        config.frequency * 1.25, // Major third
        config.frequency * 1.5,  // Perfect fifth
        config.frequency * 2     // Octave
    ];
    
    const oscillators = frequencies.map((freq, i) => {
        const osc = createOscillator(freq, 'triangle');
        const gain = audioState.context.createGain();
        const delay = i * 0.1; // Stagger the notes
        
        gain.gain.setValueAtTime(0, audioState.context.currentTime);
        gain.gain.setValueAtTime(0.3, audioState.context.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0, audioState.context.currentTime + delay + 0.2);
        
        osc.connect(gain);
        gain.connect(envelope);
        
        osc.start(audioState.context.currentTime + delay);
        osc.stop(audioState.context.currentTime + config.duration);
        
        return { osc, gain };
    });
    
    envelope.connect(audioState.masterGain);
    
    return { oscillators, envelope };
}

/**
 * Play a collection sound effect
 */
function playCollectSound(config) {
    const envelope = createEnvelope(config);
    
    // Bright, pleasant chime
    const osc1 = createOscillator(config.frequency, 'sine');
    const osc2 = createOscillator(config.frequency * 2, 'sine');
    const osc3 = createOscillator(config.frequency * 3, 'sine');
    
    const gain1 = audioState.context.createGain();
    const gain2 = audioState.context.createGain();
    const gain3 = audioState.context.createGain();
    
    gain1.gain.setValueAtTime(0.5, audioState.context.currentTime);
    gain2.gain.setValueAtTime(0.3, audioState.context.currentTime);
    gain3.gain.setValueAtTime(0.2, audioState.context.currentTime);
    
    // Connect audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(envelope);
    gain2.connect(envelope);
    gain3.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    [osc1, osc2, osc3].forEach(osc => {
        osc.start(now);
        osc.stop(now + config.duration);
    });
    
    return { osc1, osc2, osc3, envelope };
}

/**
 * Play a descending sound effect (for game over)
 */
function playDescendingSound(config) {
    const envelope = createEnvelope(config);
    const oscillator = createOscillator(config.frequency, 'sawtooth');
    
    // Sweep frequency downward
    const now = audioState.context.currentTime;
    oscillator.frequency.setValueAtTime(config.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 0.25, now + config.duration);
    
    oscillator.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
    
    return { oscillator, envelope };
}

/**
 * Play an ascending sound effect (for level complete)
 */
function playAscendingSound(config) {
    const envelope = createEnvelope(config);
    const oscillator = createOscillator(config.frequency, 'triangle');
    
    // Sweep frequency upward
    const now = audioState.context.currentTime;
    oscillator.frequency.setValueAtTime(config.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 4, now + config.duration);
    
    oscillator.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
    
    return { oscillator, envelope };
}

/**
 * Play a boss sound effect
 */
function playBossSound(config) {
    const envelope = createEnvelope(config);
    
    // Deep, threatening sound
    const osc1 = createOscillator(config.frequency, 'sawtooth');
    const osc2 = createOscillator(config.frequency * 0.5, 'square');
    const noise = createNoise(config.duration);
    
    const gain1 = audioState.context.createGain();
    const gain2 = audioState.context.createGain();
    const noiseGain = audioState.context.createGain();
    
    gain1.gain.setValueAtTime(0.6, audioState.context.currentTime);
    gain2.gain.setValueAtTime(0.4, audioState.context.currentTime);
    noiseGain.gain.setValueAtTime(0.2, audioState.context.currentTime);
    
    // Add distortion through clipping
    const filter = createFilter('lowpass', 300, 2);
    
    // Connect audio graph
    osc1.connect(gain1);
    osc2.connect(gain2);
    noise.connect(noiseGain);
    gain1.connect(filter);
    gain2.connect(filter);
    noiseGain.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    osc1.start(now);
    osc2.start(now);
    noise.start(now);
    osc1.stop(now + config.duration);
    osc2.stop(now + config.duration);
    noise.stop(now + config.duration);
    
    return { osc1, osc2, noise, envelope, filter };
}

/**
 * Play a thunder sound effect
 */
function playThunderSound(config) {
    const envelope = createEnvelope(config);
    
    // Create thunder rumble
    const noise = createNoise(config.duration);
    const filter1 = createFilter('lowpass', 200, 1);
    const filter2 = createFilter('highpass', 50, 1);
    
    // Add crackling high frequency
    const crackle = createNoise(config.duration * 0.3);
    const crackleFilter = createFilter('highpass', 2000, 2);
    const crackleGain = audioState.context.createGain();
    crackleGain.gain.setValueAtTime(0.3, audioState.context.currentTime);
    
    // Connect audio graph
    noise.connect(filter2);
    filter2.connect(filter1);
    filter1.connect(envelope);
    
    crackle.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(envelope);
    
    envelope.connect(audioState.masterGain);
    
    // Start and stop
    const now = audioState.context.currentTime;
    noise.start(now);
    crackle.start(now);
    noise.stop(now + config.duration);
    crackle.stop(now + config.duration * 0.3);
    
    return { noise, crackle, envelope, filter1, filter2, crackleFilter };
}

/**
 * Play a laser sound effect
 */
function playLaserSound(config) {
    const envelope = createEnvelope(config);
    const oscillator = createOscillator(config.frequency, 'sawtooth');
    
    // Sweep frequency for laser effect
    const now = audioState.context.currentTime;
    oscillator.frequency.setValueAtTime(config.frequency, now);
    oscillator.frequency.linearRampToValueAtTime(config.frequency * 0.5, now + config.duration);
    
    // Add filter for metallic quality
    const filter = createFilter('bandpass', config.frequency, 5);
    
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(audioState.masterGain);
    
    oscillator.start(now);
    oscillator.stop(now + config.duration);
    
    return { oscillator, envelope, filter };
}

/**
 * Main function to play a sound effect
 */
export function playSound(soundName, options = {}) {
    if (!audioState.enabled || !audioState.context || audioState.currentlyPlaying.size >= audioState.maxConcurrentSounds) {
        return null;
    }
    
    const config = SOUND_CONFIG[soundName];
    if (!config) {
        console.warn(`Unknown sound: ${soundName}`);
        return null;
    }
    
    // Apply options to config
    const finalConfig = {
        ...config,
        ...options,
        volume: (options.volume || 1.0) * config.volume * audioState.volume
    };
    
    let soundElements = null;
    
    try {
        // Create sound based on type
        switch (config.type) {
            case 'synthesized':
                soundElements = playSynthesizedSound(finalConfig);
                break;
            case 'explosion':
                soundElements = playExplosionSound(finalConfig);
                break;
            case 'metallic':
                soundElements = playMetallicSound(finalConfig);
                break;
            case 'powerup':
                soundElements = playPowerupSound(finalConfig);
                break;
            case 'collect':
                soundElements = playCollectSound(finalConfig);
                break;
            case 'descending':
                soundElements = playDescendingSound(finalConfig);
                break;
            case 'ascending':
                soundElements = playAscendingSound(finalConfig);
                break;
            case 'boss':
                soundElements = playBossSound(finalConfig);
                break;
            case 'thunder':
                soundElements = playThunderSound(finalConfig);
                break;
            case 'laser':
                soundElements = playLaserSound(finalConfig);
                break;
            default:
                soundElements = playSynthesizedSound(finalConfig);
                break;
        }
        
        // Track playing sounds
        const soundId = Date.now() + Math.random();
        audioState.currentlyPlaying.add(soundId);
        
        // Clean up after sound finishes
        setTimeout(() => {
            audioState.currentlyPlaying.delete(soundId);
        }, finalConfig.duration * 1000 + 100);
        
        return soundElements;
        
    } catch (error) {
        console.warn(`Failed to play sound ${soundName}:`, error);
        return null;
    }
}

/**
 * Set master volume
 */
export function setVolume(volume) {
    audioState.volume = Math.max(0, Math.min(1, volume));
    if (audioState.masterGain) {
        audioState.masterGain.gain.setValueAtTime(audioState.volume, audioState.context.currentTime);
    }
}

/**
 * Get current volume
 */
export function getVolume() {
    return audioState.volume;
}

/**
 * Enable or disable audio
 */
export function setAudioEnabled(enabled) {
    audioState.enabled = enabled;
    if (!enabled && audioState.masterGain) {
        audioState.masterGain.gain.setValueAtTime(0, audioState.context.currentTime);
    } else if (enabled && audioState.masterGain) {
        audioState.masterGain.gain.setValueAtTime(audioState.volume, audioState.context.currentTime);
    }
}

/**
 * Check if audio is enabled
 */
export function isAudioEnabled() {
    return audioState.enabled;
}

/**
 * Get audio context state
 */
export function getAudioState() {
    return {
        enabled: audioState.enabled,
        volume: audioState.volume,
        context: audioState.context ? audioState.context.state : 'unavailable',
        playingSounds: audioState.currentlyPlaying.size
    };
}

/**
 * Specialized functions for common game events
 */

export function playBallPaddleHit(velocity = 1.0) {
    const pitch = Math.min(2.0, 0.5 + velocity);
    return playSound('ballPaddle', { 
        frequency: SOUND_CONFIG.ballPaddle.frequency * pitch,
        volume: Math.min(1.0, 0.5 + velocity * 0.5)
    });
}

export function playBallWallHit(velocity = 1.0) {
    const pitch = Math.min(1.5, 0.7 + velocity * 0.3);
    return playSound('ballWall', { 
        frequency: SOUND_CONFIG.ballWall.frequency * pitch,
        volume: Math.min(1.0, 0.4 + velocity * 0.4)
    });
}

export function playBrickHit(brickType = 'normal', velocity = 1.0) {
    const soundMap = {
        'normal': 'brickHit',
        'strong': 'strongBrickHit',
        'metal': 'metalBrickHit',
        'explosive': 'brickDestroy',
        'boss': 'bossHit'
    };
    
    const soundName = soundMap[brickType] || 'brickHit';
    const pitch = Math.min(1.8, 0.8 + velocity * 0.2);
    
    return playSound(soundName, {
        frequency: SOUND_CONFIG[soundName].frequency * pitch,
        volume: Math.min(1.0, 0.6 + velocity * 0.3)
    });
}

export function playBrickDestroy(brickType = 'normal') {
    if (brickType === 'explosive' || brickType === 'boss') {
        return playSound('brickDestroy');
    } else {
        return playSound('brickHit', { volume: 1.2, duration: 0.3 });
    }
}

export function playPowerupSpawn() {
    return playSound('powerupSpawn');
}

export function playPowerupCollect() {
    return playSound('powerupCollect');
}

export function playGameOver() {
    return playSound('gameOver');
}

export function playLevelComplete() {
    return playSound('levelComplete');
}

export function playThunderStrike() {
    return playSound('thunderStrike');
}

export function playProjectileShoot() {
    return playSound('projectileShoot');
}
