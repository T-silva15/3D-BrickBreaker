# 🎮 Brick Breaker 3D - Computer Graphics Project

A fully-featured 3D Brick Breaker game implemented using Three.js, featuring advanced graphics techniques, dynamic lighting, multiple camera perspectives, and interactive gameplay mechanics.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-blue.svg)
![WebGL](https://img.shields.io/badge/WebGL-2.0-green.svg)
![Grade](https://img.shields.io/badge/Grade-18.81%2F20-brightgreen.svg)

> **Academic Project** | 3rd Year, 2nd Semester | **Final Grade: 18.81** 🏆

## 📋 Overview

This project implements a complete 3D Brick Breaker game from scratch using Three.js and WebGL. The game demonstrates advanced computer graphics concepts including 3D rendering, lighting systems, camera management, collision detection, and interactive user interfaces.

### Key Graphics Concepts Demonstrated

- **3D Scene Management**: Complete Three.js scene setup with optimized rendering
- **Advanced Lighting**: Multiple light sources with dynamic shadows and effects
- **Camera Systems**: Multiple camera perspectives including perspective and orthographic projections
- **3D Modeling**: Procedural generation of 3D game objects (bricks, paddles, balls)
- **Animation Systems**: Smooth animations for game objects and UI elements
- **Material Systems**: PBR materials with textures and reflections
- **Collision Detection**: 3D physics simulation and collision response
- **User Interface**: 3D-integrated UI elements and HUD systems

## ✨ Features

### Core Game Features
- ✅ **3D Brick Breaker Gameplay**: Classic brick breaker mechanics in 3D space
- ✅ **Multiple Levels**: Progressive difficulty with varied brick arrangements
- ✅ **Power-ups System**: Interactive power-ups affecting gameplay
- ✅ **Score System**: Real-time scoring with level progression
- ✅ **Audio Integration**: Sound effects and background music
- ✅ **Pause/Resume**: Game state management
- ✅ **Game Over/Victory**: Complete game flow with restart functionality

### Graphics & Visual Features
- ✅ **Multiple Camera Modes**: Switch between different camera perspectives
- ✅ **Dynamic Lighting**: Real-time lighting with shadows
- ✅ **Trajectory Visualization**: Ball trajectory prediction system
- ✅ **Particle Effects**: Visual effects for collisions and power-ups
- ✅ **3D Game Objects**: Fully modeled paddle, ball, and brick geometries
- ✅ **Material Systems**: Advanced materials with textures and shaders
- ✅ **Responsive Design**: Adaptable to different screen sizes

### Technical Features
- ✅ **Modular Architecture**: Clean separation of concerns across multiple modules
- ✅ **Event-Driven System**: Comprehensive input handling and game events
- ✅ **Performance Optimization**: Efficient rendering and memory management
- ✅ **Error Handling**: Robust error handling and fallback systems
- ✅ **Browser Compatibility**: Cross-browser WebGL support

## 📁 Project Structure

```
CG-TP1/
├── index.html                   # Main HTML entry point
├── JavaScript/
│   ├── appThree.js             # Main application entry point
│   └── game/                   # Modular game components
│       ├── audio.js            # Audio system and sound effects
│       ├── cameras.js          # Camera management and perspectives
│       ├── controls.js         # Input handling and user controls
│       ├── display.js          # Display modes and gallery system
│       ├── game.js             # Core game logic and state management
│       ├── levels.js           # Level definitions and progression
│       ├── lighting.js         # Lighting setup and effects
│       ├── objects.js          # 3D object creation and management
│       ├── powerups.js         # Power-up system and effects
│       ├── trajectory.js       # Ball trajectory visualization
│       └── ui.js               # User interface and HUD elements
└── README.md                   # This file
```

### Module Responsibilities

| Module | Purpose |
|--------|---------|
| `appThree.js` | Main application bootstrap and menu system |
| `game.js` | Core game loop, state management, and collision detection |
| `cameras.js` | Camera setup, switching, and perspective management |
| `lighting.js` | Scene lighting, shadows, and visual effects |
| `objects.js` | 3D object creation (paddle, ball, bricks, game area) |
| `controls.js` | Input handling, keyboard/mouse controls |
| `ui.js` | User interface, HUD, menus, and game information display |
| `levels.js` | Level definitions, brick arrangements, and progression |
| `audio.js` | Sound effects, background music, and audio management |
| `powerups.js` | Power-up system, effects, and player interactions |
| `trajectory.js` | Ball trajectory prediction and visualization |
| `display.js` | Display gallery and presentation modes |

## 🚀 Getting Started

### Prerequisites

- **Modern Web Browser** with WebGL 2.0 support
- **Local Web Server** (for development)

### Installation & Running

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd CG-TP1
   ```

2. **Start a local web server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Alternative: Direct File Access

For browsers that support local file access:
- Simply open `index.html` directly in your web browser
- Note: Some features may require a web server due to CORS policies

## 🎮 How to Play

### Game Controls
- **Mouse Movement**: Control paddle position
- **Left Click**: Launch ball / Activate power-ups
- **Spacebar**: Pause/Resume game
- **C Key**: Cycle through camera perspectives
- **O Key**: Toggle orthographic/perspective projection
- **H Key**: Toggle helper visualizations
- **T Key**: Toggle trajectory prediction
- **ESC**: Return to main menu

### Gameplay Objectives
1. **Break all bricks** to complete each level
2. **Keep the ball in play** by moving the paddle
3. **Collect power-ups** for special abilities
4. **Progress through levels** with increasing difficulty
5. **Achieve high scores** through efficient play

### Power-ups
- **Larger Paddle**: Increases paddle size temporarily
- **Multi-ball**: Spawns additional balls
- **Slow Motion**: Reduces ball speed
- **Extra Points**: Bonus scoring opportunities

## 🔧 Technical Implementation

### 3D Graphics Pipeline

```javascript
// Scene setup with Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Lighting system
const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(ambientLight, directionalLight);

// Game object creation
const paddle = createPaddle();
const ball = createBall();
const bricks = createBricks(level);
```

### Collision Detection

The game implements sophisticated 3D collision detection:

- **Sphere-Box Collision**: Ball-to-brick interactions
- **Sphere-Plane Collision**: Ball-to-paddle and wall bouncing
- **AABB Collision**: Power-up collection detection
- **Ray Casting**: Trajectory prediction calculations

### Camera System

Multiple camera perspectives enhance the 3D experience:

- **Perspective Camera**: Standard 3D view with depth perception
- **Orthographic Camera**: Technical/architectural view
- **Dynamic Positioning**: Cameras adjust based on game state
- **Smooth Transitions**: Animated camera switching

### Performance Optimizations

- **Object Pooling**: Efficient memory usage for game objects
- **Frustum Culling**: Only render visible objects
- **Level-of-Detail**: Adaptive quality based on distance
- **Efficient Collision**: Spatial partitioning for collision detection

## 🎨 Graphics Techniques

### Lighting & Shading
- **Ambient Lighting**: Global illumination for scene depth
- **Directional Lighting**: Primary light source with shadows
- **Material Properties**: PBR materials for realistic rendering
- **Shadow Mapping**: Dynamic shadow casting

### Visual Effects
- **Particle Systems**: Collision and destruction effects
- **Trajectory Lines**: Predictive ball path visualization
- **UI Animations**: Smooth transitions and feedback
- **Post-processing**: Screen effects and filters

### 3D Modeling
- **Procedural Generation**: Runtime creation of game objects
- **Geometric Primitives**: Optimized use of basic shapes
- **UV Mapping**: Texture coordinate assignment
- **Normal Calculation**: Proper lighting surface normals

## 📊 Academic Assessment

### Evaluation Criteria Met

| Criteria | Implementation | Score Impact |
|----------|----------------|--------------|
| **3D Scene Setup** | ✅ Complete Three.js scene with proper rendering | Excellent |
| **Camera Management** | ✅ Multiple camera types and smooth transitions | Excellent |
| **Lighting System** | ✅ Multiple light sources with shadows | Excellent |
| **3D Object Creation** | ✅ Procedural geometry generation | Excellent |
| **Animation System** | ✅ Smooth object animations and transitions | Excellent |
| **User Interaction** | ✅ Comprehensive input handling | Excellent |
| **Code Organization** | ✅ Modular, maintainable architecture | Excellent |
| **Performance** | ✅ Optimized rendering and collision detection | Very Good |
| **Documentation** | ✅ Comprehensive code documentation | Very Good |
| **Innovation** | ✅ Advanced features beyond requirements | Excellent |

**Final Grade: 18.81/20** 🏆

## 🛠️ Dependencies

### Core Technologies
- **Three.js** (v0.160.0): 3D graphics library
- **WebGL 2.0**: Hardware-accelerated graphics
- **JavaScript ES6+**: Modern JavaScript features
- **HTML5 Canvas**: Rendering context

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. This project was developed as part of academic coursework in Computer Graphics. All code and assets are original work created for educational purposes. 

## 🔮 Future Enhancements

### Potential Improvements
- [ ] **Physics Engine**: Integration with realistic physics simulation
- [ ] **Advanced Shaders**: Custom GLSL shaders for special effects
- [ ] **VR Support**: Virtual reality compatibility
- [ ] **Multiplayer**: Network multiplayer functionality
- [ ] **Level Editor**: User-created level design tools
- [ ] **Mobile Support**: Touch controls and responsive design
- [ ] **Save System**: Progress persistence and high scores
- [ ] **Advanced AI**: Intelligent ball behavior and adaptive difficulty

### Graphics Enhancements
- [ ] **HDR Rendering**: High dynamic range lighting
- [ ] **Screen Space Reflections**: Realistic surface reflections
- [ ] **Volumetric Lighting**: Advanced atmospheric effects
- [ ] **Procedural Textures**: Runtime texture generation
- [ ] **Animation System**: Skeletal animation for complex models

---

**Note**: This project demonstrates fundamental computer graphics concepts and serves as an educational implementation of 3D game development using web technologies. The modular architecture and comprehensive feature set showcase advanced understanding of 3D graphics programming.
