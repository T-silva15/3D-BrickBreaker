import * as THREE from 'three';

import { FBXLoader } from 'FBXLoader';

import { PointerLockControls } from 'PointerLockControls';

document.addEventListener('DOMContentLoaded', Start);

var cena = new THREE.Scene();
var camara = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
var renderer = new THREE.WebGLRenderer();

var camaraPerspetiva = new THREE.PerspectiveCamera(45, 4 / 3, 0.1, 100);

var materialTextura;

var geometriaCubo = new THREE.BoxGeometry(1, 1, 1);

var textura = new THREE.TextureLoader().load('./Images/boxImage.jpg');
var materialTextura = new THREE.MeshBasicMaterial({ map: textura });

var meshCubo = new THREE.Mesh(geometriaCubo, materialTextura);
meshCubo.translateZ(-6.0);

var objetoImportado;

var mixerAnimacao;

var relogio = new THREE.Clock();

var importer = new FBXLoader();

const controls = new PointerLockControls(camaraPerspetiva, document.body);

controls.addEventListener('lock', function () {
    console.log('lock');
});

controls.addEventListener('unlock', function () {
    console.log('unlock');
});

document.addEventListener('click', function () {
    controls.lock();
}, false);

document.addEventListener('keydown', onDocumentKeyDown, false);

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 87: // W
            controls.moveForward(0.25);
            break;
        case 83: // S
            controls.moveForward(-0.25);
            break;
        case 65: // A
            controls.moveRight(-0.25);
            break;
        case 68: // D
            controls.moveRight(0.25);
            break;
        case 32: // SPACE
            // remover cubo, se existir
            if (meshCubo.parent == cena) {
                cena.remove(meshCubo);
            }
            else {
                cena.add(meshCubo);
            }
            break;
    }
}

var texture_dir = new THREE.TextureLoader().load('./skybox/Tenerife4/posx.jpg');
var texture_esq = new THREE.TextureLoader().load('./skybox/Tenerife4/negx.jpg');
var texture_up = new THREE.TextureLoader().load('./skybox/Tenerife4/posy.jpg');
var texture_dn = new THREE.TextureLoader().load('./skybox/Tenerife4/negy.jpg');
var texture_ft = new THREE.TextureLoader().load('./skybox/Tenerife4/posz.jpg');
var texture_bk = new THREE.TextureLoader().load('./skybox/Tenerife4/negz.jpg');

var materialArray = [];

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dir, side: THREE.BackSide }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_esq, side: THREE.BackSide }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up, side: THREE.BackSide }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn, side: THREE.BackSide }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.BackSide }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.BackSide }));

var skyboxGeo = new THREE.BoxGeometry(100, 100, 100);
var skybox = new THREE.Mesh(skyboxGeo, materialArray);

cena.add(skybox);

importer.load('./Objects/Samba Dancing.fbx', function (object) {

    mixerAnimacao = new THREE.AnimationMixer(object);

    var action = mixerAnimacao.clipAction(object.animations[0]);
    action.play();

    object.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    object.scale.x = 0.01;
    object.scale.y = 0.01;
    object.scale.z = 0.01;

    object.position.x = 1.5;
    object.position.y = -0.5;
    object.position.z = -6.0;

    objetoImportado = object;
    cena.add(objetoImportado);
});

function Start() {
    cena.add(meshCubo);
    
    var luzDirecional = new THREE.DirectionalLight(0xffffff, 1);

    var luzAmbiente = new THREE.AmbientLight(0x000000);

    luzDirecional.position.set(1, 1, 1).normalize();

    cena.add(luzDirecional);
    cena.add(luzAmbiente);

    renderer.render(cena, camaraPerspetiva);
    
    requestAnimationFrame(loop);
}

renderer.setSize(window.innerWidth - 15, window.innerHeight - 80);
renderer.setClearColor(0xaaaaaa);
document.body.appendChild(renderer.domElement);

function loop() {
    meshCubo.rotateY(Math.PI / 180 * 1);

    if (mixerAnimacao) {
        mixerAnimacao.update(relogio.getDelta());
    }

    renderer.render(cena, camaraPerspetiva);
    
    requestAnimationFrame(loop);
}

