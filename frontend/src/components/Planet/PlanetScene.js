// src/components/Planet/PlanetScene.js
import * as THREE from 'three';
import { createSceneCameraAndRenderer } from '../../utils/createSceneCameraAndRenderer';
import {createPlanet, loader} from '../../utils/createPlanet';
import { addSunAndLight } from '../../utils/addSunAndLight';
import { createSpaceHorizon } from '../../utils/createSpaceHorizon';
import getStarfield from '../../utils/getStarfield';
import { handleWindowResize } from '../../utils/handleWindowResize';
import { Tween, Easing, Group } from '@tweenjs/tween.js';
import { disposeScene } from '../../utils/disposeScene';
import { createPlanetRings } from '../../utils/createPlanetRings';
import { initializeLabelRenderer, createLabel, updateLabelVisibility } from '../../utils/labelUtils';
import { OrbitTail } from '../../utils/orbitTail';
import { focusOnObject } from '../../utils/focusOnObject';
import { resetCamera } from '../../utils/resetCamera';
import { initializeGUI } from '../../utils/guiControls';
import { setMeshProperties, calculateMaxPoints } from '../../utils/planetUtils';

let scene, camera, renderer, controls, container, animateId;
let planetGroup, planetMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let labelRenderer;
let onWindowResize;
let occlusionObjects = [];
let moons = [];
let orbitTails = [];
let gui;
let planetData;
let guiParams;

const tweenGroup = new Group();

let state = {
    isTweening: false,
    isFollowingObject: false,
    currentTargetObject: null,
    previousTargetPosition: new THREE.Vector3(),
};

let initialCameraPosition = new THREE.Vector3();
let initialControlsTarget = new THREE.Vector3();
let initialMinDistance, initialMaxDistance;

let raycaster = new THREE.Raycaster();
// Definiujemy progi dla księżyców
const smallMoonThreshold = 1;  // Możesz dostosować wartości według potrzeb
const mediumMoonThreshold = 3;

export function initializePlanetScene(containerElement, initPlanetData) {
    container = containerElement;
    planetData = initPlanetData;

    raycaster = new THREE.Raycaster();

    if (scene) {
        disposePlanetScene();
    }

    const w = container.clientWidth;
    const h = container.clientHeight;

    const result = createSceneCameraAndRenderer(container, w, h, planetData.cameraPosition, planetData.radius, planetData.rotationAngle || 0);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    // Zachowaj początkowe ustawienia kamery i kontrolerów
    initialCameraPosition.copy(camera.position);
    initialControlsTarget.copy(controls.target);
    initialMinDistance = controls.minDistance;
    initialMaxDistance = controls.maxDistance;


    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    planetGroup = new THREE.Group();
    if (planetData.axialTilt) {
        planetGroup.rotation.z = planetData.axialTilt * Math.PI / 180;
    }
    scene.add(planetGroup);
    const texturePath = planetData.texturePath ? `/${planetData.texturePath}` : null;
    const cloudTexture = planetData.cloudTexture ? `/${planetData.cloudTexture}` : null;
    const normalMapPath = planetData.normalMapPath ? `/${planetData.normalMapPath}` : null;
    const bumpMapPath = planetData.bumpMapPath ? `/${planetData.bumpMapPath}` : null;
    const aoMapPath = planetData.aoMapPath ? `/${planetData.aoMapPath}` : null;
    const specularMapPath = planetData.specularMapPath ? `/${planetData.specularMapPath}` : null;


    planetMesh = createPlanet(
        planetData.radius,
        texturePath,
        planetData.shininess || 5,
        normalMapPath,
        bumpMapPath,
        aoMapPath,
        specularMapPath
    );
    planetMesh.receiveShadow = true;
    setMeshProperties(planetMesh, planetData.name, planetData.radius);
    planetGroup.add(planetMesh);

    if (planetData.cloudTexture) {
        const cloudsTexturePath = `/${planetData.cloudTexture}`;
        const cloudsMaterial = new THREE.MeshStandardMaterial({
            map: loader.load(cloudsTexturePath),
            transparent: true,
            opacity: planetData.cloudOpacity || 0.8,
            blending: THREE.NormalBlending,
        });
        const cloudsMesh = new THREE.Mesh(planetMesh.geometry.clone(), cloudsMaterial);
        cloudsMesh.scale.setScalar(planetData.cloudScale);
        planetGroup.add(cloudsMesh);
        planetMesh.cloudsMesh = cloudsMesh;
    }

    // Dodaj pierścienie, jeśli są zdefiniowane
    if (planetData.rings) {
        const ringsMesh = createPlanetRings(planetData.rings);
        planetGroup.add(ringsMesh);
        occlusionObjects.push(ringsMesh);
    }

    // Dodaj księżyce, jeśli są zdefiniowane
    if (planetData.moons && planetData.moons.length > 0) {
        planetData.moons.forEach(moonData => {
            const moonMesh = createMoon(moonData);
            planetGroup.add(moonMesh);
            moons.push(moonMesh);
            occlusionObjects.push(moonMesh);

            // Dodaj ogon orbity, jeśli opcja jest włączona
            const maxPoints = calculateMaxPoints(moonData.orbitDuration || 100);
            const orbitTail = new OrbitTail(moonMesh, scene, maxPoints, { color: 0xaaaaaa, opacity: 0.5 });
            orbitTails.push(orbitTail);
        });
    }

    // Dodaj Słońce i światło
    const sunResult = addSunAndLight(scene, planetData.sunDistance || 100000, planetData.sunRadius || 1000, planetData.flarePower || 900, planetData.ambientLightPower || 5);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;
    occlusionObjects.push(sunMesh);

    // Dodaj sferę kosmiczną
    createSpaceHorizon(scene, planetData.spaceHorizonDistance || 500000);

    // Dodaj gwiazdy
    const stars = getStarfield({ numStars: 800 });
    scene.add(stars);

    // Inicjalizacja labelRenderer
    labelRenderer = initializeLabelRenderer(container);

    const resetCameraFunction = () => resetCamera(camera, controls, state, initialCameraPosition, initialControlsTarget, initialMinDistance, initialMaxDistance, tweenGroup);
    // Inicjalizacja GUI
    gui = initializeGUI(
        {
            showObjectNames: true,
            showOrbitTails: false,
            showSmallMoons: true,
            showMediumMoons: true,
            showLargeMoons: true,
        },
        toggleObjectNames,
        orbitTails,
        resetCameraFunction,
        container
    );

    // Nasłuchiwanie zdarzeń
    window.addEventListener('resize', onWindowResizeHandler, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

    animate();
}

export function disposePlanetScene() {
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
        gui,
        labelRenderer,
        animateId,
        container,
        onWindowResizeHandler,
        occlusionObjects,
    });

    // Resetuj zmienne
    scene = null;
    renderer = null;
    controls = null;
    animateId = null;
    container = null;
    planetGroup = null;
    planetMesh = null;
    sunMesh = null;
    sunLight = null;
    sunPivot = null;
    ambientLight = null;
    raycaster = null;
    occlusionObjects = [];
    moons = [];
    orbitTails = [];
    gui = null;
    labelRenderer = null;
    planetData = null;
    guiParams = null;
}

function animate(time) {
    animateId = requestAnimationFrame(animate);

    if (!planetData || !controls || !renderer) return;

    controls.update();
    tweenGroup.update(time);

    // Obrót planety uwzgledniajac kierunek
    if (planetMesh && planetData.rotationSpeed) {
        const rotationDirection = planetData.rotationSpeed < 0 ? -1 : 1;
        const rotationSpeed = Math.abs(planetData.rotationSpeed);
        planetMesh.rotation.y += rotationDirection * ((2 * Math.PI) / (rotationSpeed * 60));
    }
    if (planetMesh.cloudsMesh) {
        const cloudRotationSpeed = planetData.cloudRotationSpeed || (Math.abs(planetData.rotationSpeed) * 0.9);
        const rotationDirection = planetData.rotationSpeed < 0 ? -1 : 1;
        planetMesh.cloudsMesh.rotation.y += rotationDirection * ((2 * Math.PI) / (cloudRotationSpeed * 60));
    }
    // Obrót SunPivot
    if (sunPivot) {
        const sunOrbitSpeed = (2 * Math.PI) / (planetData.sunOrbitDuration || 2638); // Długość orbity w godzinach
        sunPivot.rotation.y += sunOrbitSpeed * 0.01; // Dostosuj szybkość obrotu
    }

    // Aktualizacja księżyców
    moons.forEach((moon, index) => {
        if (planetData.moons[index]) {
            updateMoon(moon, planetData.moons[index]);
            orbitTails[index].update();
        }
    });

    // Aktualizacja etykiet
    if (labelRenderer) {
        moons.forEach((moon) => {
            updateLabelVisibility(moon.labelObject, moon, camera, raycaster, occlusionObjects);
        });
        labelRenderer.render(scene, camera);
    }

    renderer.render(scene, camera);
}

function onWindowResizeHandler() {
    handleWindowResize(camera, renderer, container, labelRenderer);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    const mouse = new THREE.Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(moons, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        focusOnObject(selectedObject, camera, controls, state, tweenGroup);
    }
}

// Funkcje pomocnicze

function createMoon(moonData) {
    const moonMesh = createPlanet(
        moonData.radius,
        moonData.texturePath,
        moonData.shininess || 5,
        moonData.normalMapPath,
        moonData.bumpMapPath,
        moonData.aoMapPath,
        moonData.specularMapPath
    );

    setMeshProperties(moonMesh, moonData.name, moonData.radius);

    // Ustawienie pozycji księżyca na orbicie
    const orbitRadius = moonData.orbitRadius || 50;
    const orbitSpeed = (2 * Math.PI) / (moonData.orbitDuration || 100);

    moonMesh.userData = {
        orbitRadius,
        orbitSpeed,
        orbitAngle: Math.random() * 2 * Math.PI,
    };

    // Dodanie etykiety
    const labelObject = createLabel(moonData.name);
    moonMesh.add(labelObject);
    moonMesh.labelObject = labelObject;
    labelObject.userData.shouldShow = true;

    return moonMesh;
}

function updateMoon(moonMesh, moonData) {
    moonMesh.userData.orbitAngle += moonMesh.userData.orbitSpeed;

    const x = Math.cos(moonMesh.userData.orbitAngle) * moonMesh.userData.orbitRadius;
    const z = Math.sin(moonMesh.userData.orbitAngle) * moonMesh.userData.orbitRadius;

    moonMesh.position.set(x, 0, z);
}

function toggleObjectNames() {
    moons.forEach((moon) => {
        const radius = moon.userData.radius;
        let shouldShow = true;

        if (!guiParams.showObjectNames) {
            shouldShow = false;
        } else if (radius < smallMoonThreshold) {
            shouldShow = guiParams.showSmallMoons;
        } else if (radius < mediumMoonThreshold) {
            shouldShow = guiParams.showMediumMoons;
        } else {
            shouldShow = guiParams.showLargeMoons;
        }

        moon.labelObject.userData.shouldShow = shouldShow;
    });
}
