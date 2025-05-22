/**
 * Level definitions for the Brick Breaker 3D game
 */

// Define levels with different brick layouts and configurations
export const levels = [
    {
        name: "Iniciante",
        description: "Comece sua jornada com tijolos básicos",
        brickRows: 3,
        brickCols: 6,
        brickTypes: ['normal'],
        pattern: 'simple',
        paddleSpeed: 0.35,
        ballSpeed: 0.4,
        backgroundColor: 0x001122,
        powerupChance: 0.3
    },
    {
        name: "Fortaleza Resistente",
        description: "Tijolos mais duros requerem estratégia",
        brickRows: 4,
        brickCols: 8,
        brickTypes: ['normal', 'strong'],
        pattern: 'fortress',
        brickLayout: {
            strong: [[2,3,4,5], [1,2,5,6]], // positions of strong bricks
            normal: 'fill' // fill remaining spaces
        },
        paddleSpeed: 0.4,
        ballSpeed: 0.5,
        backgroundColor: 0x002233,
        powerupChance: 0.25
    },
    {
        name: "Reação em Cadeia",
        description: "Use explosões estrategicamente",
        brickRows: 5,
        brickCols: 10,
        brickTypes: ['normal', 'explosive', 'trigger'],
        pattern: 'strategic',
        brickLayout: {
            explosive: [[2,4,6,8], [1,3,5,7]], // alternate rows
            trigger: [[0,9], [0,9]], // edges
            normal: 'fill'
        },
        paddleSpeed: 0.45,
        ballSpeed: 0.6,
        backgroundColor: 0x220011,
        powerupChance: 0.2,
        specialFeatures: {
            chainReaction: true,
            explosionRadius: 2
        }
    },
    {
        name: "Fortaleza Móvel",
        description: "Cuidado! Os tijolos se movem!",
        brickRows: 4,
        brickCols: 8,
        brickTypes: ['metal', 'strong', 'normal'],
        pattern: 'moving',
        brickLayout: {
            metal: [[0,7], [0,7]], // edges
            strong: [[3,4], [3,4]], // center
            normal: 'fill'
        },
        paddleSpeed: 0.5,
        ballSpeed: 0.65,
        backgroundColor: 0x113322,
        powerupChance: 0.15,
        specialFeatures: {
            movingBricks: true,
            movePattern: 'horizontal',
            moveSpeed: 0.1
        }
    },
    {
        name: "Desafio Final",
        description: "Todos os tipos de tijolos em movimento!",
        brickRows: 6,
        brickCols: 12,
        brickTypes: ['metal', 'strong', 'explosive', 'trigger', 'normal'],
        pattern: 'complex',
        brickLayout: {
            metal: [[0,11], [0,11]], // corners
            trigger: [[5,6], [4,7]], // center
            explosive: [[2,3,8,9], [2,3,8,9]], // strategic positions
            strong: [[1,4,7,10], [1,4,7,10]], // distributed
            normal: 'fill'
        },
        paddleSpeed: 0.6,
        ballSpeed: 0.7,
        backgroundColor: 0x331144,
        powerupChance: 0.3,
        specialFeatures: {
            movingBricks: true,
            movePattern: 'complex',
            moveSpeed: 0.15,
            chainReaction: true,
            explosionRadius: 3
        }
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