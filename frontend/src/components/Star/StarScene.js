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
let bloomPass; // globalna referencja do passu bloom
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
    const result = createSceneCameraAndRenderer(
        container,
        w,
        h,
        sunData.cameraPosition || 500,
        sunData.radius || 100,
        sunData.rotationAngle || 0
    );
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    renderer.shadowMap.enabled = false;
    renderer.autoClear = false;

    // KONFIGURACJA POSTPROCESSINGU – efekt bloom
    const renderScene = new RenderPass(scene, camera);
    // Ustawienia bloom – dostosuj te wartości według potrzeb
    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        1.2,   // strength – bazowa intensywność efektu
        0.55,  // radius – promień rozmycia
        0.2    // threshold – próg jasności (piksele poniżej tej wartości nie "bloomują")
    );
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(container.clientWidth, container.clientHeight);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    // TWORZENIE MODELU SŁOŃCA
    const geometry = new THREE.SphereGeometry(sunData.radius || 100, 128, 128);
    const textureLoader = new THREE.TextureLoader();
    let materialParams = {};

    if (sunData.texturePath) {
        const sunTexture = textureLoader.load(sunData.texturePath);
        materialParams = { map: sunTexture };
    }

    // Tworzymy koronę – dodatkowe warstwy dla efektu poświaty (opcjonalnie)
    const coronaGeometry = new THREE.SphereGeometry(sunData.radius * 1.01, 128, 128);
    const coronaTexture = textureLoader.load(sunData.texturePath);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        map: coronaTexture,
        transparent: true,
        opacity: 0.4, // umożliwia zobaczenie "dolnej" warstwy
        blending: THREE.AdditiveBlending
    });
    coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
    scene.add(coronaMesh);

    const coronaMaterial2 = new THREE.MeshBasicMaterial({
        map: coronaTexture,
        transparent: true,
        opacity: 0.5,
        blending: THREE.NormalBlending
    });
    coronaMesh2 = new THREE.Mesh(coronaGeometry, coronaMaterial2);
    scene.add(coronaMesh2);

    // Tworzymy główny model Słońca
    const sunMaterial = new THREE.MeshBasicMaterial(materialParams);
    sunMesh = new THREE.Mesh(geometry, sunMaterial);
    scene.add(sunMesh);

    if (sunData.flarePower) {
        const flareTexture = textureLoader.load('/assets/textures/star/lensflare.close.png');
        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(flareTexture, sunData.flarePower, 0));
        sunMesh.add(lensflare);
    }


    createSpaceHorizon(scene, sunData.spaceHorizonDistance || 600000);

    const stars = getStarfield({ numStars: 800 });
    scene.add(stars);

    window.addEventListener('resize', onWindowResizeHandler = () => {
        handleWindowResize(camera, renderer, container, labelRenderer);
        // Aktualizacja rozmiaru bloomComposer przy zmianie rozmiaru okna
        if (bloomComposer) {
            bloomComposer.setSize(container.clientWidth, container.clientHeight);
        }
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
    bloomComposer = null; // resetujemy bloomComposer, aby nie próbować go użyć ponownie
    bloomPass = null;
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

    // Jeśli renderer lub bloomComposer nie istnieją, przerywamy:
    if (!renderer) return;

    controls.update();

    if (sunMesh) {
        sunMesh.rotation.y += 0.0005;
    }
    if (coronaMesh) {
        coronaMesh.rotation.y += 0.0001;  // Zmniejszona prędkość rotacji
        coronaMesh.position.x = Math.sin(time * 0.001) * 5;  // Minimalny ruch
        coronaMesh.position.y = Math.cos(time * 0.001) * 5;
    }
    if (coronaMesh2) {
        coronaMesh2.rotation.y -= 0.0001;
        coronaMesh2.position.x = Math.sin(time * 0.001) * 1;
        coronaMesh2.position.y = Math.cos(time * 0.001) * 1;
    }

    if (labelRenderer) {
        labelRenderer.render(scene, camera);
    }

    // PRZYKŁADOWA DYNAMICZNA REGULACJA BLOOM:
    // Możesz modyfikować intensywność efektu bloom w zależności od odległości kamery od Słońca.
    if (bloomPass && sunMesh) {
        const distance = camera.position.distanceTo(sunMesh.position);
        // Przyjmujemy, że przy odległości 500 jednostek bloom ma bazową wartość 1.2,
        // a przy dalszych odległościach wzrasta do np. 2.0 – wartości możesz dostosować.
        bloomPass.strength = THREE.MathUtils.lerp(1.2, 2.0, THREE.MathUtils.clamp((distance - 500) / 1000, 0, 1));
    }

    // Renderujemy scenę z efektem bloom
    if (bloomComposer) {
        bloomComposer.render();
    } else {
        renderer.render(scene, camera);
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
}