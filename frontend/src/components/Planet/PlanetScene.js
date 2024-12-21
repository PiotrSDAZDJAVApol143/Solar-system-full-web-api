// src/components/Planet/PlanetScene.js
import * as THREE from 'three';
import { createSceneCameraAndRenderer } from '../../utils/createSceneCameraAndRenderer';
import {createPlanet, loader} from '../../utils/createPlanet';
import { addSunAndLight } from '../../utils/addSunAndLight';
import { createSpaceHorizon } from '../../utils/createSpaceHorizon';
import getStarfield from '../../utils/getStarfield';
import { handleWindowResize } from '../../utils/handleWindowResize';
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
let currentPlanetData = null;

const clock = new THREE.Clock();
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
    showOrbitTails: false,
    showSmallMoons: false,
    showMediumMoons: false,
    showLargeMoons: false,
    timeScale: 2000
};

export function initializePlanetScene(containerElement, initPlanetData) {

    if (!containerElement) {
        console.error("Brak elementu kontenera!");
        return;
    }
    container = containerElement;
    planetData = initPlanetData;
    planetData.bodyType = "Planet";
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

    // Dodanie referencji kamery, kontrolerów i stanu do planetData
    planetData.camera = camera;
    planetData.controls = controls;
    planetData.state = state;

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

    planetMesh.userData.bodyType = "Planet";
    planetMesh.userData.name = planetData.name;
    planetMesh.userData.description = planetData.description || '';
    planetMesh.userData.meanRadiusKm = planetData.meanRadiusKm;
    planetMesh.userData.semiMajorAxis = planetData.semiMajorAxis;
    planetMesh.userData.orbitalPeriod = planetData.orbitalPeriod;
    planetMesh.userData.gravity = planetData.gravity;
    planetMesh.userData.avgTemp = planetData.avgTemp;
    planetMesh.userData.rotationPeriod = planetData.rotationPeriod;
    planetMesh.userData.mass = planetData.mass;
    planetMesh.userData.moons = planetData.moons;

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
    planetData.moonsInstances = moons;
    if (planetData.moons && planetData.moons.length > 0) {
        planetData.moons.forEach(moonData => {
            const orbitRadius = moonData.semimajorAxis ? (moonData.semimajorAxis * scaleFactor) : 50;
            const orbitDuration = moonData.orbitalPeriod || 100;
            const rotationDuration = moonData.rotationPeriod || orbitDuration;
            const moonTextures = moonData.textures || {};

            const moonParams = {
                name: moonData.englishName || 'Moon',
                radius: (moonData.meanRadius * scaleFactor),
                meanRadiusKm: moonData.meanRadius,
                distance: moonData.semimajorAxis * scaleFactor,
                scaleFactor: planetData.scaleFactor,
                parentPlanetName: planetData.name,

                texturePath: moonTextures.surfaceTexture ? `/${moonTextures.surfaceTexture}` : null,
                bumpMapPath: moonTextures.bumpMapTexture ? `/${moonTextures.bumpMapTexture}` : null,
                normalMapPath: moonTextures.normalMapTexture ? `/${moonTextures.normalMapTexture}` : null,
                aoMapPath: moonTextures.ambientOcclusionMapTexture ? `/${moonTextures.ambientOcclusionMapTexture}` : null,
                specularMapPath: moonTextures.specularMapTexture ? `/${moonTextures.specularMapTexture}` : null,

                guiParams: guiParams,
                orbitDuration: moonData.orbitalPeriod || 100,
                rotationDuration: moonData.rotationPeriod || 100,
                mass: moonData.mass,
                gravity: moonData.gravity,
                avgTemp: moonData.avgTemp,
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

                modelPath: moonData.model || null,
                scale: 1 * scaleFactor
            };

            const moon = new Moon(moonParams);
            moons.push(moon);
            occlusionObjects.push(moon.mesh);
        });

    }
    occlusionObjects.push(planetMesh);

    currentPlanetData = {
        name: initPlanetData.name,
        moons: initPlanetData.moons || [],
        scaleFactor: initPlanetData.scaleFactor || 1,
        // Dodaj inne potrzebne dane
    };

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

    const resetCameraFunction = () => {
        stopFollowing(state, camera, controls, initialCameraPosition, initialControlsTarget, initialMinDistance, initialMaxDistance);
        resetCamera(
            camera,
            controls,
            state,
            initialCameraPosition,
            initialControlsTarget,
            initialMinDistance,
            initialMaxDistance,
        );
        updatePlanetInfo(planetMesh);
    };
    // Inicjalizacja GUI
    gui = initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCameraFunction, container);

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
}
function animate() {
    animateId = requestAnimationFrame(animate);

    if (!planetData || !controls || !renderer) return;

    controls.update();


    const deltaTime = clock.getDelta();
    const cosmicDelta = deltaTime * guiParams.timeScale;

    if (planetMesh && planetData.rotationSpeed) {
        const rotationDirection = planetData.rotationSpeed < 0 ? -1 : 1;
        const rotationPeriodSeconds = planetData.rotationPeriod * 3600;
        const angularVelocity = (2 * Math.PI) / rotationPeriodSeconds;
        const rotationSpeed = Math.abs(planetData.rotationSpeed);
        planetMesh.rotation.y += angularVelocity * cosmicDelta;
        if (additionalTextureMesh) {
            additionalTextureMesh.rotation.y += angularVelocity * cosmicDelta;
        }
    }

    // Obrót chmur
    if (planetMesh.cloudsMesh) {
        const cloudPeriodSeconds = planetData.cloudRotationSpeed * 3600;
        const cloudAngularVelocity = (2 * Math.PI) / cloudPeriodSeconds;
        const rotationDirection = planetData.rotationSpeed < 0 ? -1 : 1;
        planetMesh.cloudsMesh.rotation.y += cloudAngularVelocity * cosmicDelta;
    }
    // Obrót SunPivot
    if (sunPivot) {
        const sunOrbitSeconds = (planetData.sunOrbitDuration || 2638) * 3600;
        const sunAngularVelocity = (2 * Math.PI) / sunOrbitSeconds;
        sunPivot.rotation.y += sunAngularVelocity * cosmicDelta;
    }
    if (additionalTextureMesh) {
        const planetPosition = new THREE.Vector3();
        planetMesh.getWorldPosition(planetPosition);

        const sunPosition = new THREE.Vector3();
        sunMesh.getWorldPosition(sunPosition);

        const directionToSun = new THREE.Vector3().subVectors(sunPosition, planetPosition).normalize();
        additionalTextureMesh.material.uniforms.lightDirection.value.copy(directionToSun);
    }

 //   // Aktualizacja księżyców
    moons.forEach(moon => {
       moon.update(cosmicDelta);
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
    renderer.render(scene, camera);
}

function onWindowResizeHandler() {
    handleWindowResize(camera, renderer, container, labelRenderer);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    if (state.isTweening) {
        console.log("Animacja w toku, pomijam nowe żądanie śledzenia.");
        return;
    }

    const mouse = new THREE.Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const clickableObjects = moons.map(moon => moon.mesh);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        // Jeśli już śledzimy ten sam obiekt, pomijamy
        if (state.currentTargetObject === selectedObject && state.isFollowingObject) {
            return;
        }
        focusOnObject(selectedObject, camera, controls, state);
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
function findBodyObject(object) {
    let current = object;
    while (current) {
        if (current.userData && current.userData.bodyType) {
            return current;
        }
        current = current.parent;
    }
    return null;
}
export function updatePlanetInfo(targetObject) {
    const planetInfoDiv = document.getElementById('planet-info');
    if (!planetInfoDiv || !targetObject) return;

    const bodyObject = findBodyObject(targetObject);
    if (!bodyObject) {
        console.error('Nieznany typ obiektu:', targetObject);
        return;
    }

    const isPlanet = bodyObject.userData.bodyType === "Planet";
    const isMoon = bodyObject.userData.bodyType === "Moon";
    const data = bodyObject.userData;
    let infoHTML = '';

    if (isPlanet) {
        const planetData = data;
        infoHTML = `
            <h2>Informacje o ${planetData.name || 'Brak danych'}</h2>
            <p><u>${planetData.description || 'Brak opisu'}</u></p>
            <p>Średnica: ${(planetData.meanRadiusKm * 2).toLocaleString('pl-PL')} km</p>
            <p>Średnia odległość od Słońca: ${planetData.semiMajorAxis?.toLocaleString('pl-PL') || "Brak danych"} km</p>
            <p>Rok trwa: ${planetData.orbitalPeriod || "Brak danych"} dni</p>
            <p>Grawitacja: ${planetData.gravity?.toFixed(2) || "Brak danych"} m/s²</p>
            <p>Średnia temperatura: ${
            planetData.avgTemp ? `${planetData.avgTemp}°C / ${(parseFloat(planetData.avgTemp) + 273.15).toFixed(2)}°K` : "Brak danych"
        }</p>
            <p>Masa: ${planetData.mass || "Brak danych"}</p>
          
            <p>Rok trwa: ${planetData.orbitalPeriod || "Brak danych"} dni</p>
            <p>
                                    Doba
                                    trwa: ${Math.abs(planetData.rotationPeriod).toLocaleString('pl-PL', {maximumFractionDigits: 2})} godzin
                                    /
                                    (${Math.abs(planetData.rotationPeriod / 24).toLocaleString('pl-PL', {maximumFractionDigits: 2})} dni)</p>
            <p>Liczba księżyców: ${planetData.moons?.length || 0}</p>
            <p>Księżyce:</p>
            <ul>
                ${
            planetData.moons?.length
                ? planetData.moons.map(moon =>
                    `<li><a href="#" data-targetname="${moon.englishName}">${moon.englishName}</a></li>`
                ).join('')
                : "Brak księżyców"
        }
            </ul>
        `;
    } else if (isMoon) {
        const moonData = data;
        const parentPlanetName = moonData.parentPlanetName || "Nieznana";
        infoHTML = `
            <h2>Informacje o ${moonData.name || 'Brak danych'}</h2>
            <p>Średnica: ${ (moonData.meanRadiusKm * 2).toLocaleString('pl-PL') } km</p>
            <p>Odległość od planety macierzystej: ${moonData.distance?.toLocaleString('pl-PL') || "Brak danych"} km</p>
            <p>Okres orbitalny: ${moonData.orbitDuration?.toFixed(2) || "Brak danych"} dni</p>
            <p>Okres rotacji: ${
            moonData.rotationDuration ? `${moonData.rotationDuration.toFixed(2)} godzin` : "Brak danych"
        } (${moonData.rotationDuration / 24 || "Brak danych"} dni)</p>
            <p>Nachylenie orbity: ${moonData.orbitTilt || "Brak danych"}°</p>
            <p>Nachylenie osi: ${moonData.rotationTilt || "Brak danych"}°</p>
            <p>Grawitacja: ${moonData.gravity?.toFixed(2) || "Brak danych"} m/s²</p>
            <p>Średnia temperatura: ${
            moonData.avgTemp !== null && moonData.avgTemp !== undefined
                ? ` ${(moonData.avgTemp - 273.15).toFixed(2)}°C /${moonData.avgTemp.toFixed(2)}°K`
                : "Brak danych"
        }</p>
            <p>Masa: ${moonData.mass ? `${(moonData.mass * 100).toFixed(2)} % masy Ziemi` : "Brak danych"}</p>
            <p>Krąży wokół: <a href="#" data-targetname="${parentPlanetName}">${parentPlanetName}</a></p>
        `;
    } else {
        console.error('Nieznany typ obiektu:', targetObject);
        return;
    }

    planetInfoDiv.innerHTML = infoHTML;

    // Teraz, po wstawieniu HTML, znajdź wszystkie linki z data-targetname i dodaj im event listener
    const links = planetInfoDiv.querySelectorAll('a[data-targetname]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetName = link.getAttribute('data-targetname');
            focusOnObjectFromList(targetName);
        });
    });
}

export function focusOnObjectFromList(objectName) {
    const moon = moons.find((m) => m.name === objectName);

    // Jeśli trwa animacja, pomijamy
    if (state.isTweening) {
        console.log("Animacja w toku, pomijam nowe żądanie śledzenia.");
        return;
    }
    if (moon) {
        // Sprawdzamy czy to ten sam obiekt i już go śledzimy
        if (state.currentTargetObject === moon.mesh && state.isFollowingObject) {
            return;
        }
        console.log("Przełączanie na księżyc");
        focusOnObject(moon.mesh, camera, controls, state);
        updatePlanetInfo(moon.mesh);
    } else if (objectName === planetData.name) {
        // Sprawdzamy czy to ten sam obiekt i już go śledzimy
        if (state.currentTargetObject === planetMesh && state.isFollowingObject) {
            return;
        }
        console.log("Przełączanie na planetę:");
        focusOnObject(planetMesh, camera, controls, state);
        updatePlanetInfo(planetMesh);
    } else {
        console.error('Nie znaleziono obiektu');
    }
}
function stopFollowing(state, camera, controls, initialCameraPosition, initialControlsTarget, initialMinDistance, initialMaxDistance) {
    state.isFollowingObject = false;
    state.currentTargetObject = null;
    state.isTweening = false;

    controls.minDistance = initialMinDistance;
    controls.maxDistance = initialMaxDistance;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Przywracamy pozycję kamery i target jeśli to potrzebne:
    controls.target.copy(initialControlsTarget);
    camera.position.copy(initialCameraPosition);
    controls.update();
}
