// src/pages/SolarSystem/SolarSystemScene.js
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
import { initializeLabelRenderer, createLabel, updateLabelVisibility } from '../../utils/labelUtils';
import {focusOnObject} from "../../utils/focusOnObject";
import { createSolarSystemPlanet } from '../../utils/createSolarSystemPlanet';
import {initializeGUI} from "../../utils/guiControls";


// zmienne globalne
let scene, camera, renderer, controls, container, animateId;
let bloomComposer, bloomPass;
let labelRenderer;
let sunMesh, coronaMesh, coronaMesh2;
let orbitTails = [];

const clock = new THREE.Clock();
const scaleFactor = 1 / 23000;
const raycaster = new THREE.Raycaster();
function onWindowResizeHandler() {
    handleWindowResize(camera, renderer, container, labelRenderer);
}
let planetsMeshes = [];  // tablica, żeby mieć dostęp do meshów planet
let state = {
    isTweening: false,
    isFollowingObject: false,
    currentTargetObject: null,
    previousTargetPosition: new THREE.Vector3(),
};
let guiParams = {
    timeScale: 500,
    showObjectNames: true,
    orbitStatic: false,
    orbitDynamic: false
};


export function initializeStarScene(containerElement, solarSystemData) {
    container = containerElement;
    if (scene) disposeStarScene();

    const w = container.clientWidth;
    const h = container.clientHeight;

    const result = createSceneCameraAndRenderer(
        container,
        w, h,
        solarSystemData.cameraPosition || 500,
        solarSystemData.radius || 100,
        solarSystemData.rotationAngle || 0
    );
    scene    = result.scene;
    camera   = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    renderer.shadowMap.enabled = false;
    renderer.autoClear = false;

    camera.layers.enableAll();

    // Postprocessing Bloom
    const renderScene = new RenderPass(scene, camera);
    bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 2.4, 1.55, 0.3);
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.setSize(w, h);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);



    // Tło (Space Horizon + gwiazdki)
    createSpaceHorizon(scene, solarSystemData.spaceHorizonDistance || 600000);
    scene.add(getStarfield({ numStars: 800 }));

    // Słońce
    createSun(scene, solarSystemData.sun);

    // Mocne światło w słońcu
    const sunLight = new THREE.PointLight(0xfff5e1, 1e8, 600000, 2);
    sunLight.position.set(0, 0, 0);
    renderer.physicallyCorrectLights = true;
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Ambient
    const ambientLight = new THREE.AmbientLight(0xfff5e1, 0.08);
    scene.add(ambientLight);

    // Planety
    planetsMeshes = [];
    orbitTails = [];
    if (Array.isArray(solarSystemData.planets)) {
        solarSystemData.planets.forEach((planetData) => {
            const mesh = createSolarSystemPlanet({
                scene,
                planetData,
                scaleFactor,
                orbitTails,
                camera,
                controls,
                state,
                createOrbitEllipse,
                lowDetailMode: true
            });
            if (mesh) {
                planetsMeshes.push(mesh);
            }
        });
    }

    labelRenderer = initializeLabelRenderer(container);

    // Inicjalizacja GUI (raz)
    initializeGUI('solarSystem', guiParams, toggleObjectNames, orbitTails, resetCameraFunction, container);

    // Obsługa resize
    window.addEventListener('resize', onWindowResizeHandler, false);

    // Start animacji
    animate();
}

function createSun(scene, sunData) {
    if (!sunData) return;

    const textureLoader = new THREE.TextureLoader();
    const sunRadius = (sunData.meanRadius || 100) * scaleFactor;
    let lensPower = sunData.flarePower;
    lensPower = 1500;
    console.log(` -> Promień Słońca w scenie = ${sunRadius.toFixed(6)}`);

    const geometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    let sunTexture = null;
    if (sunData.textures?.surfaceTexture) {
        sunTexture = textureLoader.load(sunData.textures.surfaceTexture);
    }
    const sunMaterial = new THREE.MeshBasicMaterial(
        sunTexture ? { map: sunTexture } : { color: 0xffff00 }
    );
    sunMesh = new THREE.Mesh(geometry, sunMaterial);

    // Dla focusOnObject: musimy zapisać userData.radius
    sunMesh.userData = sunMesh.userData || {};
    sunMesh.userData.radius = sunRadius;
    sunMesh.userData.englishName = "Sun";
    sunMesh.layers.enable(0);
    sunMesh.layers.enable(1);
    scene.add(sunMesh);

    // Korona
    coronaMesh = new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius * 1.01, 64, 64),
        new THREE.MeshBasicMaterial({
            map: sunTexture || null,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        })
    );
    coronaMesh.layers.set(1);
    scene.add(coronaMesh);

    coronaMesh2 = new THREE.Mesh(
        new THREE.SphereGeometry(sunRadius * 1.01, 64, 64),
        new THREE.MeshBasicMaterial({
            map: sunTexture || null,
            transparent: true,
            opacity: 0.5,
            blending: THREE.NormalBlending
        })
    );
    coronaMesh2.layers.set(1);
    scene.add(coronaMesh2);

    // Lens Flare
    if (sunData.flarePower) {
        const flareTexture = textureLoader.load('/assets/textures/star/lensflare.close.png');
        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(flareTexture, sunData.flarePower, 0));
        lensflare.layers.set(1);
        sunMesh.add(lensflare);
    }
}

export function disposeStarScene() {
    if (animateId) {
        cancelAnimationFrame(animateId);
    }
    if (window) {
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
    // wyzerowanie zmiennych globalnych
    scene = null;
    renderer = null;
    controls = null;
    bloomComposer = null;
    bloomPass = null;
    sunMesh = null;
    coronaMesh = null;
    coronaMesh2 = null;
    planetsMeshes = [];
    container = null;
    labelRenderer = null;
    animateId = null;
}

function animate(time) {
    animateId = requestAnimationFrame(animate);
    if (!renderer) return;
    controls?.update();

    renderer.clear(true, true, true);
    camera.layers.set(1); // tylko Słońce
    bloomComposer.render();

    renderer.autoClear = false;
    renderer.clearDepth();
    camera.layers.set(0); // pozostałe obiekty (planety, chmury itp.)
    renderer.render(scene, camera);

    // labelRenderer (opcjonalnie)
    labelRenderer?.render(scene, camera);

    // ** Obliczamy daysPassed z uwzględnieniem prędkości z GUI:
    const deltaTime = clock.getDelta(); // sekundy
    const cosmicDelta = deltaTime * (guiParams.timeScale || 1);

    const doOrbitUpdate = guiParams.orbitDynamic;
    // update orbit controls

    if (sunMesh) {
        sunMesh.rotation.y += 0.001;
        sunMesh.rotation.x += 0.0005;
    }
    if (coronaMesh) {
        coronaMesh.rotation.y += 0.0001;
        coronaMesh.position.x = Math.sin(clock.elapsedTime * 0.1) * 1;
        coronaMesh.position.y = Math.cos(clock.elapsedTime * 0.1) * 1;
    }
    if (coronaMesh2) {
        coronaMesh2.rotation.y -= 0.0001;
        coronaMesh2.position.x = Math.sin(clock.elapsedTime * 0.1) * 1;
        coronaMesh2.position.y = Math.cos(clock.elapsedTime * 0.1) * 1;
    }

    // 4) Ruch planet
        planetsMeshes.forEach((planet) => {
            const op = planet.userData.orbitParams;
            if (!op) return;
            op.orbitAngle += op.angularVelocity * cosmicDelta;
            const x = op.a * Math.cos(op.orbitAngle);
            const z = op.b * Math.sin(op.orbitAngle);
            planet.position.set(x, 0, z);
        });
    planetsMeshes.forEach((planet) => {
        const orbitLine = planet.userData.orbitLine;
        if (orbitLine) {
            orbitLine.visible = guiParams.orbitStatic;
        }
    });
    planetsMeshes.forEach((planet) => {
        const rotationPeriod = planet.userData.rotationPeriod;
        if (!rotationPeriod) return;

        const rotationPeriodSeconds = rotationPeriod * 3600;
        const angularVelocity = (2 * Math.PI) / rotationPeriodSeconds;

        // TYLKO do własnej rotacji planety:
        const reverseRotation = (planet.userData.englishName === 'Uranus' || planet.userData.englishName === 'Venus') ? -1 : 1;
        planet.rotation.y += reverseRotation * angularVelocity * cosmicDelta;
    });

    planetsMeshes.forEach((planet) => {
        if (planet.userData.cloudsMesh) {
            const cloudRotationSpeed = planet.userData.cloudRotationSpeed || 20;
            const cloudPeriodSec = cloudRotationSpeed * 3600;
            const angularVelocityClouds = (2 * Math.PI) / cloudPeriodSec;
            planet.userData.cloudsMesh.rotation.y += angularVelocityClouds * cosmicDelta;
        }
    });

    // 5) OrbitTails
    orbitTails.forEach((tail) => {
        if (guiParams.orbitDynamic) {
            tail.show();
            tail.update();
        } else {
            tail.hide();
            tail.tailPoints = [];
        }
    });

    // 6) Bloom distance
    if (bloomPass && sunMesh) {
        const dist = camera.position.distanceTo(sunMesh.position);
        bloomPass.strength = THREE.MathUtils.lerp(
            1.2,
            2.0,
            THREE.MathUtils.clamp((dist - 500) / 1000, 0, 1)
        );
    }

    // 7) Śledzenie obiektów (focusOnObject)
    if (state.currentTargetObject && state.isFollowingObject && !state.isTweening) {
        const targetPos = new THREE.Vector3();
        state.currentTargetObject.getWorldPosition(targetPos);

        const deltaPos = new THREE.Vector3().subVectors(targetPos, state.previousTargetPosition);
        camera.position.add(deltaPos);
        controls.target.add(deltaPos);

        state.previousTargetPosition.copy(targetPos);
        controls.update();
    } else {
        controls.update();
    }

    // 8) LabelVisibility
    planetsMeshes.forEach((p) => {
        const lab = p.userData.labelObject;
        if (lab) {
            updateLabelVisibility(lab, p, camera, raycaster, planetsMeshes);
        }
    });

    // 9) Render
    labelRenderer?.render(scene, camera);
    if (bloomComposer) bloomComposer.render();
    else renderer.render(scene, camera);
}


function createOrbitEllipse(a, b, color = 0xffffff, segments = 128) {
    const curve = new THREE.EllipseCurve(
        0, 0,
        a, b,
        0, 2 * Math.PI,
        false,
        0
    );
    const points2D = curve.getPoints(segments);
    const points3D = points2D.map(p => new THREE.Vector3(p.x, 0, p.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points3D);
    const material = new THREE.LineBasicMaterial({
        color: color,
        depthTest: true,
        transparent: true,
        opacity: 0.9
    });
        const ellipseLine = new THREE.LineLoop(geometry, material);

        return ellipseLine;
}

function toggleObjectNames() {
planetsMeshes.forEach(planetMesh => {
    const labelObj = planetMesh.userData.labelObject;
    if (!labelObj) return;
    labelObj.userData.shouldShow = guiParams.showObjectNames;
});
    console.log("toggleObjectNames -> showObjectNames =", guiParams.showObjectNames);
}
function resetCameraFunction() {
    stopFollowing();
    console.log("Kamera zresetowana / zatrzymano śledzenie obiektu.");
}
function stopFollowing() {
    state.isTweening = false;
    let newFocusObject = null;
    state.isFollowingObject = false;
    state.currentTargetObject = null;
    if (sunMesh) {
        newFocusObject = sunMesh;
        console.log("stopFollowing -> przejście do słońca");
    } else if (planetsMeshes.length > 0) {
        newFocusObject = planetsMeshes[0];
        console.log("stopFollowing -> przejście do pierwszej planety");
    } else {
        console.warn("Nie ma słońca ani planet do focusa!");
        return;
    }
    focusOnObject(newFocusObject, camera, controls, state, 'SolarSystemScene', { stopAfterFocus: true });
}

