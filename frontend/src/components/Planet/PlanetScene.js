// src/components/Planet/PlanetScene.js
import * as THREE from 'three';
import { createSceneCameraAndRenderer } from '../../utils/createSceneCameraAndRenderer';
import { createPlanet, loader } from '../../utils/createPlanet';
import { addSunAndLight } from '../../utils/addSunAndLight';
import { createSpaceHorizon } from '../../utils/createSpaceHorizon';
import getStarfield from '../../utils/getStarfield';
import { handleWindowResize } from '../../utils/handleWindowResize';
import { disposeScene } from '../../utils/disposeScene';
import { createPlanetRings } from '../../utils/createPlanetRings';
import { initializeLabelRenderer } from '../../utils/labelUtils';
import { focusOnObject } from '../../utils/focusOnObject';
import { initializeGUI } from '../../utils/guiControls';
import { setMeshProperties } from '../../utils/planetUtils';
import { Moon } from '../Moon/Moon';
import {setInitialCameraPosition} from "../../utils/setInitialCameraPosition";

const threeState = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    animateId: null,
    planetGroup: null,
    planetMesh: null,
    additionalTextureMesh: null,
    sunMesh: null,
    sunLight: null,
    sunPivot: null,
    ambientLight: null,
    labelRenderer: null,
    gui: null,

    // Tablice / zbiory
    occlusionObjects: [],
    moons: [],
    orbitTails: [],

    // Pomocnicze
    planetData: null,
    currentPlanetData: null,
    clock: new THREE.Clock(),
    raycaster: new THREE.Raycaster(),
    controls: null,
    state: {
        isTweening: false,
        isFollowingObject: false,
        currentTargetObject: null,
        previousTargetPosition: new THREE.Vector3(),
    },

    // Pamiętamy też parametry kamery do resetowania:
    initialCameraPosition: new THREE.Vector3(),
    initialControlsTarget: new THREE.Vector3(),
    initialMinDistance: 0,
    initialMaxDistance: 0,

    guiParams: {
        showObjectNames: false,
        showOrbitTails: false,
        showSmallMoons: false,
        showMediumMoons: false,
        showLargeMoons: false,
        timeScale: 1000
    }
};

export function initializePlanetScene(containerElement) {

    if (threeState.scene) {
        console.warn('Scena już istnieje, pomijam initializePlanetScene().');
        return;
    }
    if (!containerElement) {
        console.error('Brak elementu kontenera w initializePlanetScene!');
        return;
    }
    threeState.container = containerElement;
    // Tworzymy scenę, kamerę, renderer
    const w = containerElement.clientWidth;
    const h = containerElement.clientHeight;
    const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(
        containerElement,
        w,
        h,
        /*cameraPosition=*/ 100,  // domyślne
        /*planetRadius=*/ 20,     // tymczasowo
        /*rotationAngle=*/ 0
    );

    threeState.scene = scene;
    threeState.camera = camera;
    threeState.renderer = renderer;
    threeState.controls = controls;

    // Zapinamy eventy
    window.addEventListener('resize', onWindowResizeHandler, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

    // LabelRenderer
    threeState.labelRenderer = initializeLabelRenderer(containerElement);

    // Start pętli animacji
    animate();
}

/**
 * 2) Funkcja, która ustawia / zmienia aktualną planetę na scenie.
 *    Za każdym razem, gdy chcemy pokazać inną planetę (lub te same dane zaktualizowane),
 *    możemy wywołać `updatePlanetScene(planetData)`.
 */
export function updatePlanetScene(newPlanetData) {
    if (!threeState.scene || !threeState.renderer) {
        console.warn('Scena jeszcze nie zainicjalizowana – wywołaj initializePlanetScene najpierw!');
        return;
    }
    if (!newPlanetData) {
        console.error('Brak planetData w updatePlanetScene');
        return;
    }
    // Sprzątamy poprzednią planetę / moony / ringi / etc.
    clearOldPlanetObjects();

// Zapamiętujemy newPlanetData w threeState
    threeState.planetData = newPlanetData;
    newPlanetData.bodyType = 'Planet';

    const scaleFactor = newPlanetData.scaleFactor || 1;

    // Tworzymy planetGroup
    threeState.planetGroup = new THREE.Group();
    if (newPlanetData.axialTilt) {
        threeState.planetGroup.rotation.z = THREE.MathUtils.degToRad(newPlanetData.axialTilt);
    }
    threeState.scene.add(threeState.planetGroup);

    // Tworzymy samą planetę (mesh)
    const texturePath = newPlanetData.texturePath ? `/${newPlanetData.texturePath}` : null;
    const normalMapPath = newPlanetData.normalMapPath ? `/${newPlanetData.normalMapPath}` : null;
    const bumpMapPath = newPlanetData.bumpMapPath ? `/${newPlanetData.bumpMapPath}` : null;
    const aoMapPath = newPlanetData.aoMapPath ? `/${newPlanetData.aoMapPath}` : null;
    const specularMapPath = newPlanetData.specularMapPath ? `/${newPlanetData.specularMapPath}` : null;

    const planetMesh = createPlanet(
        newPlanetData.radius || 1,
        texturePath,
        newPlanetData.shininess || 5,
        normalMapPath,
        bumpMapPath,
        aoMapPath,
        specularMapPath
    );
    planetMesh.receiveShadow = true;
    setMeshProperties(planetMesh, newPlanetData.name, newPlanetData.radius);
    threeState.planetGroup.add(planetMesh);
    threeState.planetMesh = planetMesh;

    // Podstawowe userData
    planetMesh.userData.bodyType = 'Planet';
    planetMesh.userData.name = newPlanetData.name || 'Nowa Planeta';
    planetMesh.userData.description = newPlanetData.description || '';
    planetMesh.userData.meanRadiusKm = newPlanetData.meanRadiusKm;
    planetMesh.userData.semiMajorAxis = newPlanetData.semiMajorAxis;
    planetMesh.userData.orbitalPeriod = newPlanetData.orbitalPeriod;
    planetMesh.userData.gravity = newPlanetData.gravity;
    planetMesh.userData.avgTemp = newPlanetData.avgTemp;
    planetMesh.userData.rotationPeriod = newPlanetData.rotationPeriod;
    planetMesh.userData.mass = newPlanetData.mass;
    planetMesh.userData.moons = newPlanetData.moons;

    console.log("Sprawdzam state.currentTargetObject:", threeState.state.currentTargetObject);
    if (!threeState.state.currentTargetObject) {
        console.log("Ustawiam initial camera wg diameter * 1.2...");
        setInitialCameraPosition(
            planetMesh,          // obiekt
            threeState.camera,
            threeState.controls
        );

    }

    // Obsługa chmur (dla np. Earth, Venus)
    if (newPlanetData.cloudTexture) {
        const cloudsTexturePath = `/${newPlanetData.cloudTexture}`;
        const cloudsTexture = loader.load(cloudsTexturePath);
        let cloudsMaterial = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: newPlanetData.cloudOpacity || 0.95,
        });
        if (newPlanetData.name === 'Earth') {
            cloudsMaterial = new THREE.MeshStandardMaterial({
                map: cloudsTexture,
                alphaMap: loader.load('/assets/textures/earth/earth_cloud_Alpha.png'),
                transparent: true,
                depthWrite: false,
                opacity: newPlanetData.cloudOpacity,
                roughness: 0.8,
                blending: THREE.NormalBlending,
            });
        }
        const cloudsMesh = new THREE.Mesh(planetMesh.geometry.clone(), cloudsMaterial);
        cloudsMesh.scale.setScalar(newPlanetData.cloudScale || 1.01);
        cloudsMesh.castShadow = true;
        cloudsMesh.receiveShadow = true;
        threeState.planetGroup.add(cloudsMesh);
        planetMesh.cloudsMesh = cloudsMesh;
    }

    if (newPlanetData.additionalTexture) {
        // Poprawione odwołanie:
        const additionalTexturePath = `/${newPlanetData.additionalTexture}`;
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

        // Zapisujemy w threeState
        threeState.additionalTextureMesh = new THREE.Mesh(planetMesh.geometry, additionalTextureMaterial);
        threeState.planetGroup.add(threeState.additionalTextureMesh);
        //planetMesh.add(threeState.additionalTextureMesh);
    }


    // Dodaj pierścienie, jeśli są zdefiniowane
    if (newPlanetData.rings && newPlanetData.rings.length > 0) {
        newPlanetData.rings.forEach(ringDef => {
            const planetRadius = newPlanetData.radius;
            const innerRadius = ringDef.innerRadiusFactor * planetRadius;
            const outerRadius = ringDef.outerRadiusFactor * planetRadius;
            const ringMesh = createPlanetRings({
                name: ringDef.name,
                innerRadius,
                outerRadius,
                thickness: ringDef.thickness,
                opacity: ringDef.opacity,
                texturePath: ringDef.texturePath,
            });
            threeState.planetGroup.add(ringMesh);
            threeState.occlusionObjects.push(ringMesh);
        });
    }

    // Księżyce
    threeState.moons = [];
    if (Array.isArray(newPlanetData.moons)) {
        newPlanetData.moons.forEach(moonData => {
            const moonParams = {
                name: moonData.englishName || 'Moon',
                radius: (moonData.meanRadius * scaleFactor),
                meanRadiusKm: moonData.meanRadius,
                distance: (moonData.semimajorAxis || 50) * scaleFactor,
                scaleFactor: scaleFactor,
                parentPlanetName: newPlanetData.name,
                texturePath: moonData.textures?.surfaceTexture ? `/${moonData.textures.surfaceTexture}` : null,
                bumpMapPath: moonData.textures?.bumpMapTexture ? `/${moonData.textures.bumpMapTexture}` : null,
                normalMapPath: moonData.textures?.normalMapTexture ? `/${moonData.textures.normalMapTexture}` : null,
                aoMapPath: moonData.textures?.ambientOcclusionMapTexture ? `/${moonData.textures.ambientOcclusionMapTexture}` : null,
                specularMapPath: moonData.textures?.specularMapTexture ? `/${moonData.textures.specularMapTexture}` : null,

                guiParams: threeState.guiParams,
                orbitDuration: moonData.orbitalPeriod || 100,
                rotationDuration: moonData.rotationPeriod || 100,
                mass: moonData.mass,
                gravity: moonData.gravity,
                avgTemp: moonData.avgTemp,
                orbitTilt: moonData.inclination || 0,
                rotationTilt: moonData.axialTilt || 0,
                parentPlanet: threeState.planetGroup,
                scene: threeState.scene,
                camera: threeState.camera,
                controls: threeState.controls,
                state: threeState.state,
                occlusionObjects: threeState.occlusionObjects,
                orbitTails: threeState.orbitTails,
                labelRenderer: threeState.labelRenderer,
                raycaster: threeState.raycaster,
                modelPath: moonData.model || null,
            };
            const moon = new Moon(moonParams);
            threeState.moons.push(moon);
            threeState.occlusionObjects.push(moon.mesh);
        });
    }

    // Słońce, światło, sfera kosmosu, gwiazdy itp.
    addSunAndSkyboxIfNeeded(newPlanetData);

    // GUI
    if (!threeState.gui) {
        const resetCameraFunction = () => {
            stopFollowing();
           /* resetCamera(
                threeState.camera,
                threeState.controls,
                threeState.state,
                threeState.initialCameraPosition,
                threeState.initialControlsTarget,
                threeState.initialMinDistance,
                threeState.initialMaxDistance,
            );

            */
        };
        threeState.gui = initializeGUI(
            threeState.guiParams,
            toggleObjectNames,
            threeState.orbitTails,
            resetCameraFunction,
            threeState.container
        );
    }
    // Wrzucamy planetMesh do occlusionObjects
    threeState.occlusionObjects.push(planetMesh);
    // Zapamiętujemy currentPlanetData
    threeState.currentPlanetData = {
        name: newPlanetData.name,
        rotationSpeed: newPlanetData.rotationSpeed || 0,
        cloudRotationSpeed: newPlanetData.cloudRotationSpeed || 0,
        sunOrbitDuration: newPlanetData.sunOrbitDuration || 2638,

        inclination: newPlanetData.inclination || 0,
        discoveredBy: newPlanetData.discoveredBy || '???',
        discoveryDate: newPlanetData.discoveryDate || '',
        description: newPlanetData.description || '',

        // ewentualnie
        cameraStart: newPlanetData.cameraPosition || 10,
        //...
    };
    console.log("Skala:", scaleFactor);
    console.log("Promień z newPlanetData.radius:", newPlanetData.radius);
    console.log("Obliczona średnica:", (newPlanetData.radius * 2));
}
// ================= Pomocnicze funkcje wewnętrzne ====================
function clearOldPlanetObjects() {
    // usuwamy starą planetGroup ze sceny (jeśli istnieje)
    if (threeState.planetGroup) {
        threeState.scene.remove(threeState.planetGroup);
    }
    // kasujemy moony, ringi itp. z arrays
    threeState.moons = [];
    threeState.orbitTails = [];
    threeState.occlusionObjects = [];
    threeState.planetMesh = null;
    threeState.additionalTextureMesh = null;
    // (Jeśli chcesz – tu można też wywołać .dispose() na starych meshach)
}
function addSunAndSkyboxIfNeeded(planetData) {
    // Dodaj słońce + światło
    const sunResult = addSunAndLight(
        threeState.scene,
        planetData.sunDistance || 100000,
        planetData.sunRadius   || 1000,
        planetData.flarePower  || 900,
        planetData.ambientLightPower || 5
    );
    threeState.sunMesh = sunResult.sunMesh;
    threeState.sunLight = sunResult.sunLight;
    threeState.sunPivot = sunResult.sunPivot;
    threeState.ambientLight = sunResult.ambientLight;
    threeState.occlusionObjects.push(threeState.sunMesh);

    // Sfera kosmiczna
    createSpaceHorizon(threeState.scene, planetData.spaceHorizonDistance || 600000);

    // Gwiazdy
    const stars = getStarfield({ numStars: 800 });
    threeState.scene.add(stars);
}

// Główna pętla animacji
function animate() {
    threeState.animateId = requestAnimationFrame(animate);

    if (!threeState.planetData || !threeState.controls || !threeState.renderer) return;

    const deltaTime = threeState.clock.getDelta();
    const cosmicDelta = deltaTime * threeState.guiParams.timeScale;

    // rotacja planety
    const planetRotationSpeed = threeState.planetData.rotationSpeed || 0;
    if (threeState.planetMesh && planetRotationSpeed) {
        const rotationPeriodSeconds = threeState.planetData.rotationPeriod * 3600;
        const angularVelocity = (2 * Math.PI) / rotationPeriodSeconds;

        const reverseRotation = (threeState.planetData.name === "Uranus" || threeState.planetData.name === "Venus") ? -1 : 1;

        threeState.planetMesh.rotation.y += reverseRotation * angularVelocity * cosmicDelta;

        if (threeState.additionalTextureMesh) {
            threeState.additionalTextureMesh.rotation.y += reverseRotation * angularVelocity * cosmicDelta;
        }
    }

    // Obrót chmur (jeśli Earth czy inna)
    if (threeState.planetMesh && threeState.planetMesh.cloudsMesh) {
        // Odczytujemy z currentPlanetData lub planetData
        const cloudRotationSpeed = threeState.planetData.cloudRotationSpeed || 0;
        const cloudPeriodSeconds = cloudRotationSpeed * 3600;
        if (cloudRotationSpeed !== 0) {
            const cloudAngularVelocity = (2 * Math.PI) / cloudPeriodSeconds;
            threeState.planetMesh.cloudsMesh.rotation.y += cloudAngularVelocity * cosmicDelta;
        }
    }

    // Obrót SunPivot
    if (threeState.sunPivot) {
        const sunOrbitDuration = threeState.planetData.sunOrbitDuration || 2638;
        const sunOrbitSeconds = sunOrbitDuration * 3600;
        const sunAngularVelocity = (2 * Math.PI) / sunOrbitSeconds;
        threeState.sunPivot.rotation.y += sunAngularVelocity * cosmicDelta;
    }

    // Dodatkowa tekstura -> odświeżenie "lightDirection"
    if (threeState.additionalTextureMesh) {
        const planetPosition = new THREE.Vector3();
        threeState.planetMesh.getWorldPosition(planetPosition);

        const sunPosition = new THREE.Vector3();
        threeState.sunMesh.getWorldPosition(sunPosition);

        const directionToSun = new THREE.Vector3().subVectors(sunPosition, planetPosition).normalize();
        threeState.additionalTextureMesh.material.uniforms.lightDirection.value.copy(directionToSun);
    }
    // Aktualizacja księżyców
    threeState.moons.forEach(moon => {
        moon.update(cosmicDelta);
    });


    // ewentualnie focusOnObject
    if (threeState.state.currentTargetObject && threeState.state.isFollowingObject && !threeState.state.isTweening) {
        const targetPos = new THREE.Vector3();
        threeState.state.currentTargetObject.getWorldPosition(targetPos);

        const deltaPosition = new THREE.Vector3().subVectors(targetPos, threeState.state.previousTargetPosition);
        threeState.camera.position.add(deltaPosition);
        threeState.controls.target.add(deltaPosition);

        threeState.state.previousTargetPosition.copy(targetPos);
        threeState.controls.update();
    } else {
        threeState.controls.update();
    }

    if (threeState.labelRenderer) {
        threeState.labelRenderer.render(threeState.scene, threeState.camera);
    }
    //console.log("FRAME camera:", threeState.camera.position);
    threeState.renderer.render(threeState.scene, threeState.camera);
}


export function disposePlanetScene() {
    if (threeState.renderer && threeState.renderer.domElement) {
        threeState.renderer.domElement.removeEventListener('mousedown', onDocumentMouseDown, false);
    }
    if (window) {
        window.removeEventListener('resize', onWindowResizeHandler, false);
    }

    disposeScene({
        scene: threeState.scene,
        renderer: threeState.renderer,
        controls: threeState.controls,
        gui: threeState.gui,
        labelRenderer: threeState.labelRenderer,
        animateId: threeState.animateId,
        container: threeState.container,
        onWindowResizeHandler,
        occlusionObjects: threeState.occlusionObjects,
    });

    // Czyścimy threeState
    threeState.scene = null;
    threeState.camera = null;
    threeState.renderer = null;
    threeState.controls = null;
    threeState.container = null;
    threeState.animateId = null;
    threeState.planetGroup = null;
    threeState.planetMesh = null;
    threeState.additionalTextureMesh = null;
    threeState.sunMesh = null;
    threeState.sunLight = null;
    threeState.sunPivot = null;
    threeState.ambientLight = null;
    threeState.labelRenderer = null;
    threeState.gui = null;
    threeState.occlusionObjects = [];
    threeState.moons = [];
    threeState.orbitTails = [];
    threeState.planetData = null;
    threeState.currentPlanetData = null;
}

function onWindowResizeHandler() {
    handleWindowResize(
        threeState.camera,
        threeState.renderer,
        threeState.container,
        threeState.labelRenderer
    );
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    if (threeState.state.isTweening) return;

    const mouse = new THREE.Vector2(
        (event.clientX / threeState.renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / threeState.renderer.domElement.clientHeight) * 2 + 1
    );
    threeState.raycaster.setFromCamera(mouse, threeState.camera);

    const clickableObjects = threeState.moons.map(m => m.mesh);
    const intersects = threeState.raycaster.intersectObjects(clickableObjects, true);
    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (threeState.state.currentTargetObject === selectedObject && threeState.state.isFollowingObject) return;
        focusOnObject(selectedObject, threeState.camera, threeState.controls, threeState.state);
    }
}


function stopFollowing() {
    // Przerywamy ewentualną animację
    threeState.state.isTweening = false;

    // Zwalniamy starego 'targeta'
    threeState.state.isFollowingObject = false;
    threeState.state.currentTargetObject = null;

    // Wywołaj focusOnObject – tak samo, jakbyś kliknął w planetę.
    focusOnObject(threeState.planetMesh, threeState.camera, threeState.controls, threeState.state);

    window.dispatchEvent(new Event('stopFollowingEvent'));

    console.log("Kliknięto Zatrzymaj śledzenie – przechodzę do planetMesh tak jak z linku.");
}


function toggleObjectNames() {
    threeState.moons.forEach(moon => {
        const radius = moon.radius;
        let shouldShow = false;

        if (radius <= 0.008 && threeState.guiParams.showSmallMoons) shouldShow = true;
        else if (radius > 0.008 && radius < 0.25 && threeState.guiParams.showMediumMoons) shouldShow = true;
        else if (radius >= 0.25 && threeState.guiParams.showLargeMoons) shouldShow = true;

        moon.label.userData.shouldShow = threeState.guiParams.showObjectNames && shouldShow;
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
    console.log("Aktualizacja informacji o obiekcie:", data); // Debugowanie

    if (isPlanet) {
        console.log("Dane księżyców:", data.moons);
      //  const planetData = data;
    } else if (isMoon) {
      //  const moonData = data;
     //   const parentPlanetName = moonData.parentPlanetName || "Nieznana";
    } else {
        console.error('Nieznany typ obiektu:', targetObject);
        return;
    }

    const links = planetInfoDiv.querySelectorAll('a[data-targetname]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetName = link.getAttribute('data-targetname');
            focusOnObjectFromList(targetName);
        });
    });
}
function renderMoonsList(moons) {
    if (!moons || moons.length === 0) {
        console.warn("Brak danych o księżycach!"); //Debugowanie
        return '<p>Brak księżyców</p>';
    }

    return `
        <div class="moons-grid">
            ${moons
        .map(
            (moon) => `
                        <div class="moon-item">
                            <a href="#" data-name="${moon.name}">${moon.name}</a>
                        </div>`
        )
        .join('')}
        </div>
    `;
}
// Prosta funkcja do zmiany stron
function scrollToPage(index) {
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;

    // Deaktywujemy/aktywujemy itemy
    const items = carousel.querySelectorAll(".carousel-item");
    items.forEach((item, i) => {
        item.classList.toggle("active", i === index);
    });

    // Zmieniamy klasę .active w przyciskach
    const btns = document.querySelectorAll(".carousel-page-btn");
    btns.forEach((btn, i) => {
        btn.classList.toggle("active", i === index);
    });
}

export function focusOnObjectFromList(objectName) {
    const { moons, state, camera, controls, planetData, planetMesh } = threeState;

    if (state.isTweening) {
        return;
    }
    const moon = moons.find(m => m.name === objectName);
    if (moon) {
        console.log("Przejście do księżyca:", moon.name); //Debugowanie
        if (state.currentTargetObject === moon.mesh && state.isFollowingObject) {
            return;
        }
        focusOnObject(moon.mesh, camera, controls, state);
        //updatePlanetInfo(moon.mesh);
    } else if (objectName === planetData.name) {
        console.log("Przejście do planety:", planetData.name); //Debugowanie
        if (state.currentTargetObject === planetMesh && state.isFollowingObject) {
            return;
        }
        focusOnObject(planetMesh, camera, controls, state);
       // updatePlanetInfo(planetMesh);

        // Nowy mechanizm do wymuszenia renderowania
        const planetInfoDiv = document.getElementById('planet-info');
        if (planetInfoDiv) {
            planetInfoDiv.setAttribute('data-refresh', Date.now()); // Unikalny klucz do wymuszenia odświeżenia
        }
    } else {
        console.error('Nie znaleziono obiektu:', objectName);
    }
}