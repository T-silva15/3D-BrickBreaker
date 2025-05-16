/**
 * Level definitions for the Brick Breaker 3D game
 */

// Define levels with different brick layouts and configurations
export const levels = [
    {
        name: "Clássico",
        description: "O tradicional jogo de Brick Breaker",
        brickRows: 3,
        brickCols: 8,
        brickTypes: ['normal'],
        paddleSpeed: 0.3,
        ballSpeed: 0.5,
        backgroundColor: 0x000022
    },
    {
        name: "Fortaleza",
        description: "Uma fortaleza de tijolos resistentes",
        brickRows: 4,
        brickCols: 10,
        brickTypes: ['normal', 'strong'],
        pattern: 'fortress',
        paddleSpeed: 0.35,
        ballSpeed: 0.55,
        backgroundColor: 0x002222
    },
    {
        name: "Arco-Íris",
        description: "Tijolos de várias cores e tipos",
        brickRows: 5,
        brickCols: 10,
        brickTypes: ['normal', 'strong', 'explosive'],
        colorScheme: 'rainbow',
        paddleSpeed: 0.4,
        ballSpeed: 0.6,
        backgroundColor: 0x221144
    },
    {
        name: "Metálico",
        description: "Tijolos metálicos de alta resistência",
        brickRows: 3,
        brickCols: 6,
        brickTypes: ['metal', 'strong'],
        brickMaterial: {
            metalness: 0.9,
            roughness: 0.1,
            map: 'metal_diffuse.jpg',
            normalMap: 'metal_normal.jpg'
        },
        paddleSpeed: 0.4,
        ballSpeed: 0.7,
        backgroundColor: 0x333333
    },
    {
        name: "Explosivo",
        description: "Cuidado com os tijolos explosivos!",
        brickRows: 4,
        brickCols: 8,
        brickTypes: ['normal', 'explosive', 'trigger'],
        brickLayout: 'random',
        paddleSpeed: 0.45,
        ballSpeed: 0.65,
        backgroundColor: 0x331111
    }
];

// Brick type definitions
export const brickTypes = {
    normal: {
        health: 1,
        points: 100,
        material: 'standard',
        color: 0xff7700
    },
    strong: {
        health: 2,
        points: 200,
        material: 'phong',
        color: 0x00aa44
    },
    metal: {
        health: 3,
        points: 300,
        material: 'physical',
        color: 0xaaaaaa
    },
    explosive: {
        health: 1,
        points: 150,
        material: 'standard',
        color: 0xff3333,
        onDestroy: 'explode'
    },
    trigger: {
        health: 1,
        points: 250,
        material: 'standard',
        color: 0xffff00,
        onDestroy: 'triggerEffect'
    }
};