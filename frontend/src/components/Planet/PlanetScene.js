// src/components/Planet/PlanetScene.js
import * as THREE from 'three';
import { createSceneCameraAndRenderer } from '../../utils/createSceneCameraAndRenderer';
import {createPlanet, loader} from '../../utils/createPlanet';
import { addSunAndLight } from '../../utils/addSunAndLight';
import { createSpaceHorizon } from '../../utils/createSpaceHorizon';
import getStarfield from '../../utils/getStarfield';
import { handleWindowResize } from '../../utils/handleWindowResize';
import TWEEN from '@tweenjs/tween.js';
import { disposeScene } from '../../utils/disposeScene';
import { createPlanetRings } from '../../utils/createPlanetRings';
import { initializeLabelRenderer } from '../../utils/labelUtils';
import { focusOnObject } from '../../utils/focusOnObject';
import { resetCamera } from '../../utils/resetCamera';
import { initializeGUI } from '../../utils/guiControls';
import { setMeshProperties } from '../../utils/planetUtils';
import { Moon } from '../Moon/Moon';

let scene, camera, renderer, controls, container, animateId;
let planetGroup, planetMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let labelRenderer;
let occlusionObjects = [];
let moons = [];
let orbitTails = [];
let gui;
let planetData;
let additionalTextureMesh = null;

const clock = new THREE.Clock();
const tweenGroup = new TWEEN.Group();
const textureLoader = new THREE.TextureLoader();

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

let guiParams = {
    showObjectNames: false,
    showOrbitTails: true,
    showSmallMoons: true,
    showMediumMoons: true,
    showLargeMoons: true,
};

export function initializePlanetScene(containerElement, initPlanetData) {
    guiParams = {
        showObjectNames: true,
        showOrbitTails: true,
        showSmallMoons: true,
        showMediumMoons: true,
        showLargeMoons: true,
    };
    if (!containerElement) {
        console.error("Brak elementu kontenera!");
        return;
    }
    container = containerElement;
    planetData = initPlanetData;
    if (!planetData) {
        console.error("planetData jest null lub undefined");
        return;
    }
    if (!container) {
        console.error("Kontener jest null");
        return;
    }

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

    const scaleFactor = planetData.scaleFactor || 1;
    console.log("Przekazany scaleFactor do PlanetScene:", scaleFactor);
    const texturePath = planetData.texturePath ? `/${planetData.texturePath}` : null;
    const additionalTexture = planetData.additionalTexture ? `/${planetData.additionalTexture}` : null;
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
    console.log("Promień planety w PlanetScene:", planetData.radius);
    setMeshProperties(planetMesh, planetData.name, planetData.radius);
    planetGroup.add(planetMesh);

    if (planetData.cloudTexture) {
        const cloudsTexturePath = `/${planetData.cloudTexture}`;
        const cloudsTexture = loader.load(cloudsTexturePath);

        let cloudsMaterial;
        if (planetData.name === 'Earth') {
           cloudsMaterial = new THREE.MeshStandardMaterial({
                map: cloudsTexture,
               alphaMap: textureLoader.load('/assets/textures/earth/earth_cloud_Alpha.png'),
                transparent: true,
               depthWrite: false,
                opacity: planetData.cloudOpacity,
               roughness: 0.8,
                blending: THREE.NormalBlending,
            });

        } else if (planetData.name === 'Venus') {
            cloudsMaterial = new THREE.MeshPhongMaterial({
                map: cloudsTexture,
                transparent: true,
                opacity: planetData.cloudOpacity || 0.95,
                blending: THREE.NormalBlending,
            });
        }
        const cloudsMesh = new THREE.Mesh(planetMesh.geometry.clone(), cloudsMaterial);
        cloudsMesh.scale.setScalar(planetData.cloudScale);
        cloudsMesh.castShadow = true;
        cloudsMesh.receiveShadow = true;
        planetGroup.add(cloudsMesh);
        planetMesh.cloudsMesh = cloudsMesh;
    }

    if (planetData.additionalTexture) {
        const additionalTexturePath = `/${planetData.additionalTexture}`;
        const additionalMap = loader.load(additionalTexturePath);
        additionalMap.colorSpace = THREE.SRGBColorSpace;

        const additionalTextureMaterial = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: additionalMap },
                lightDirection: { value: new THREE.Vector3(1,0,0) }, // Kierunek światła - aktualizuj w animate()
                warmThreshold: { value: 0.001 }, // reguluj próg ciepła
            },
            vertexShader: `
            varying vec2 vUv;
            varying vec3 vPositionW; // pozycja w świecie

            void main() {
                vUv = uv;
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vPositionW = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
            fragmentShader: `
            uniform sampler2D map;
            uniform vec3 lightDirection;
            uniform float warmThreshold;

            varying vec2 vUv;
            varying vec3 vPositionW;

            // Zakładamy, że planeta jest centrowana w (0,0,0).
            // Wektor vPositionW jest więc także wektorem normalnej do powierzchni (dla sfery).
            void main() {
                vec3 normal = normalize(vPositionW);
                vec4 texColor = texture2D(map, vUv);

                // Filtrujemy ciepłe kolory - sprawdzamy czy R jest większe od G i B
                float r = texColor.r;
                float g = texColor.g;
                float b = texColor.b;
                if (r <= g + warmThreshold || r <= b + warmThreshold) {
                    discard; 
             
                }

                // Dot product - jeśli > 0 to jasna strona, jeśli <= 0 to ciemna
                float dotProduct = dot(normal, normalize(lightDirection));
                
                // Po jasnej stronie (dotProduct > 0) chcemy zgasić światła:
                float visibility = dotProduct < 0.0 ? 1.0 : 0.0;

                // Wyświetlamy światła z addytywnym blendingiem
                gl_FragColor = vec4(texColor.rgb * visibility, texColor.a * visibility);
            }
        `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        additionalTextureMesh = new THREE.Mesh(planetMesh.geometry, additionalTextureMaterial);
        planetGroup.add(additionalTextureMesh);
    }


    // Dodaj pierścienie, jeśli są zdefiniowane
    if (planetData.rings) {
        const ringsMesh = createPlanetRings(planetData.rings);
        planetGroup.add(ringsMesh);
        occlusionObjects.push(ringsMesh);
    }

    // Księżyce
    moons = []; //czyści i wypełnia zbiór od zera
    if (planetData.moons && planetData.moons.length > 0) {
        planetData.moons.forEach(moonData => {
            const orbitRadius = moonData.semimajorAxis ? (moonData.semimajorAxis * scaleFactor) : 50;
            const orbitDuration = moonData.orbitalPeriod || 100;
            const rotationDuration = moonData.rotationPeriod || orbitDuration;
            const moonTextures = moonData.textures || {};

            const moonParams = {
                name: moonData.englishName || 'Moon',
                radius: (moonData.meanRadius * scaleFactor),
                distance: moonData.semimajorAxis * scaleFactor,
                scaleFactor: planetData.scaleFactor,

                texturePath: moonTextures.surfaceTexture ? `/${moonTextures.surfaceTexture}` : null,
                bumpMapPath: moonTextures.bumpMapTexture ? `/${moonTextures.bumpMapTexture}` : null,
                normalMapPath: moonTextures.normalMapTexture ? `/${moonTextures.normalMapTexture}` : null,
                aoMapPath: moonTextures.ambientOcclusionMapTexture ? `/${moonTextures.ambientOcclusionMapTexture}` : null,
                specularMapPath: moonTextures.specularMapTexture ? `/${moonTextures.specularMapTexture}` : null,

                guiParams: guiParams,
                orbitDuration: moonData.orbitalPeriod || 100,
                rotationDuration: moonData.rotationPeriod || 100,
                orbitTilt: moonData.inclination || 0,
                rotationTilt: moonData.axialTilt || 0,
                parentPlanet: planetGroup,
                scene: scene,
                camera: camera,
                controls: controls,
                state: state,
                occlusionObjects: occlusionObjects,
                orbitTails: orbitTails,
                labelRenderer: labelRenderer,
                raycaster: raycaster,

                isGLTF: moonData.modelPath && moonData.modelPath.endsWith('.gltf'),
                isPLY: moonData.modelPath && moonData.modelPath.endsWith('.ply'),
                modelPath: moonData.modelPath || null,
                scale: 1 * scaleFactor
            };

            const moon = new Moon(moonParams);
            moons.push(moon);
            occlusionObjects.push(moon.mesh);
        });

    }
    occlusionObjects.push(planetMesh);

    // Dodaj Słońce i światło
    const sunResult = addSunAndLight(scene, planetData.sunDistance || 100000, planetData.sunRadius || 1000, planetData.flarePower || 900, planetData.ambientLightPower || 5);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;
    occlusionObjects.push(sunMesh);

    // Dodaj sferę kosmiczną
    createSpaceHorizon(scene, planetData.spaceHorizonDistance || 600000);

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


    const deltaTime = clock.getDelta() * 60;

    if (planetMesh && planetData.rotationSpeed) {
        const rotationDirection = planetData.rotationSpeed < 0 ? -1 : 1;
        const rotationSpeed = Math.abs(planetData.rotationSpeed);
        const rotationDelta = rotationDirection * ((2 * Math.PI) / (rotationSpeed * 60));
        planetMesh.rotation.y += rotationDelta;

        // Obróć dodatkową teksturę nocną w taki sam sposób
        if (additionalTextureMesh) {
            additionalTextureMesh.rotation.y += rotationDelta;
        }
    }

    // Obrót chmur
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

 //   // Aktualizacja księżyców
    moons.forEach(moon => {
       moon.update(deltaTime);
    });

    // Śledzenie obiektu, jeśli jest ustawione focusOnObject
    if (state.currentTargetObject && state.isFollowingObject && !state.isTweening) {
        const targetPosition = new THREE.Vector3();
        state.currentTargetObject.getWorldPosition(targetPosition);

        const deltaPosition = new THREE.Vector3().subVectors(targetPosition, state.previousTargetPosition);

        camera.position.add(deltaPosition);
        controls.target.add(deltaPosition);

        state.previousTargetPosition.copy(targetPosition);
        controls.update();
    } else {
        controls.update();
    }

    if (labelRenderer) {
        labelRenderer.render(scene, camera);
    }

    tweenGroup.update(time);
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
    const clickableObjects = moons.map(moon => moon.mesh);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        focusOnObject(selectedObject, camera, controls, state, tweenGroup);
    }
}


// Funkcje pomocnicze


function toggleObjectNames() {
    moons.forEach((moon) => {
        const radius = moon.radius;
        let shouldShow = false;

        if (radius <= 0.008 && guiParams.showSmallMoons) {
            shouldShow = true;
        } else if (radius > 0.008 && radius < 0.25 && guiParams.showMediumMoons) {
            shouldShow = true;
        } else if (radius >= 0.25 && guiParams.showLargeMoons) {
            shouldShow = true;
        }

        moon.label.userData.shouldShow = guiParams.showObjectNames && shouldShow;
    });
}
