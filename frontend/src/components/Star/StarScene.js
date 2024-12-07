// src/components/Star/StarScene.js

import * as THREE from 'three';
import { createSceneCameraAndRenderer } from '../../utils/createSceneCameraAndRenderer';
import { handleWindowResize } from '../../utils/handleWindowResize';
import { disposeScene } from '../../utils/disposeScene';
import getStarfield from '../../utils/getStarfield';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { createSpaceHorizon } from "../../utils/createSpaceHorizon";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let scene, camera, renderer, controls, container, animateId;
let labelRenderer;
let sunMesh, coronaMesh, coronaMesh2;
let onWindowResizeHandler;
let bloomComposer;
let state = {
    isTweening: false,
    isFollowingObject: false,
    currentTargetObject: null,
    previousTargetPosition: new THREE.Vector3(),
};

export function initializeStarScene(containerElement, sunData) {
    container = containerElement;

    if (scene) {
        disposeStarScene();
    }

    const w = container.clientWidth;
    const h = container.clientHeight;
    const result = createSceneCameraAndRenderer(container, w, h, sunData.cameraPosition || 500, sunData.radius || 100, sunData.rotationAngle || 0);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    renderer.shadowMap.enabled = false;
    renderer.autoClear = false;

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 0.8;
    bloomPass.radius = 0;

    bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(container.clientWidth, container.clientHeight);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const geometry = new THREE.SphereGeometry(sunData.radius || 100, 128, 128);
    const textureLoader = new THREE.TextureLoader();
    let materialParams = {};

    if (sunData.texturePath) {
        const sunTexture = textureLoader.load(sunData.texturePath);
        materialParams = { map: sunTexture };
    }

    const coronaGeometry = new THREE.SphereGeometry(sunData.radius * 1.01, 128, 128);
    const coronaTexture = textureLoader.load(sunData.texturePath);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        map: coronaTexture,
        transparent: true,
        opacity: 0.4,    // aby widzieć dolną warstwę
        blending: THREE.AdditiveBlending // dla efektu poświaty
    });
    const coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
    scene.add(coronaMesh);

    const coronaMaterial2 = new THREE.MeshBasicMaterial({
        map: coronaTexture,
        transparent: true,
        opacity: 0.5,    // aby widzieć dolną warstwę
        blending: THREE.NormalBlending // dla efektu poświaty
    });
    const coronaMesh2 = new THREE.Mesh(coronaGeometry, coronaMaterial2);
    scene.add(coronaMesh2);

    const sunMaterial = new THREE.MeshBasicMaterial(materialParams);
    sunMesh = new THREE.Mesh(geometry, sunMaterial);
    scene.add(sunMesh);

    createSpaceHorizon(scene, sunData.spaceHorizonDistance || 600000);

    const stars = getStarfield({ numStars: 800 });
    scene.add(stars);

    if (sunData.flarePower) {
        const flareTexture = textureLoader.load('/assets/textures/star/lensflare0.png');
        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(flareTexture, sunData.flarePower, 0));
        sunMesh.add(lensflare);
    }

    window.addEventListener('resize', onWindowResizeHandler = () => {
        handleWindowResize(camera, renderer, container, labelRenderer);
    });

    animate();
}

export function disposeStarScene() {
    // Zatrzymujemy animację przed czyszczeniem
    if (animateId) {
        cancelAnimationFrame(animateId);
    }

    if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
    }
    if (window && onWindowResizeHandler) {
        window.removeEventListener('resize', onWindowResizeHandler, false);
    }

    disposeScene({
        scene,
        renderer,
        controls,
        gui: null,
        labelRenderer,
        animateId,
        container,
        onWindowResizeHandler,
        occlusionObjects: []
    });

    scene = null;
    renderer = null;
    controls = null;
    animateId = null;
    container = null;
    sunMesh = null;
    bloomComposer = null; // resetujemy bloomComposer aby nie próbować go użyć ponownie
    labelRenderer = null;
    state = {
        isTweening: false,
        isFollowingObject: false,
        currentTargetObject: null,
        previousTargetPosition: new THREE.Vector3(),
    };
}

function animate(time) {
    animateId = requestAnimationFrame(animate);

    // Jeśli renderer lub bloomComposer nie istnieje, przerywamy:
    if (!renderer) return;

    controls.update();

    if (sunMesh) {
        sunMesh.rotation.y += 0.0005;
    }
    if (coronaMesh) {
        coronaMesh.rotation.y += 0.0004;
        coronaMesh.position.x = Math.sin(time * 0.5) * 5;
        coronaMesh.position.y = Math.cos(time * 0.2) * 3;
    }
    if (coronaMesh2) {
        coronaMesh2.rotation.y -= 0.0004;
        coronaMesh2.position.x = Math.sin(time * 0.5) * 5;
        coronaMesh2.position.y = Math.cos(time * 0.5) * 3;
    }

        if (labelRenderer) {
            labelRenderer.render(scene, camera);
        }

        // Najpierw sprawdzamy czy bloomComposer istnieje
        if (bloomComposer) {
            bloomComposer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    function onDocumentMouseDown(event) {
        event.preventDefault();
    }
