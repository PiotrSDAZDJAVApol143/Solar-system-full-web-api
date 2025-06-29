// src/components/Moon/Moon.js
import * as THREE from 'three';
import { createPlanet } from '../../utils/createPlanet';
import { createLabel, updateLabelVisibility } from '../../utils/labelUtils';
import { OrbitTail } from '../../utils/orbitTail';
import { focusOnObject } from '../../utils/focusOnObject';
import { updatePlanetInfo } from '../Planet/PlanetScene';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';

/**
 * Funkcja losująca ścieżkę do jednego z 5 domyślnych modeli oraz teksturami.
 * Możesz zmienić rozszerzenie i nazwy ścieżek według potrzeb.
 */
function getRandomDefaultModelAndTexture() {
    const randomIndex = Math.floor(Math.random() * 5) + 1; // 1..5
    return {
        modelPath: `/assets/models/3D_models/default${randomIndex}.ply`,
        texturePath: `/assets/textures/moon/default${randomIndex}.jpg`
    };
}

// Helper – zawsze zwraca null lub string zaczynający się od '/'
function fixPath(path) {
    if (!path) return null;
    // Usuwa nadmiarowe ukośniki na początku i dokładnie JEDEN
    return '/' + path.replace(/^\/+/, '');
}

function normalizeToUnitSphere(object3D) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    // Przesuwamy środek do (0,0,0)
    const center = new THREE.Vector3();
    box.getCenter(center);
    object3D.position.sub(center);
    // Normalizujemy
    const scale = 1 / (maxDim / 2);
    object3D.scale.setScalar(scale);
}

export class Moon {
    constructor(params) {
        this.name = params.name;
        this.radius = params.radius;
        this.meanRadiusKm = params.meanRadiusKm;

        this.texturePath     = fixPath(params.texturePath);
        this.bumpMapPath     = fixPath(params.bumpMapPath);
        this.normalMapPath   = fixPath(params.normalMapPath);
        this.aoMapPath       = fixPath(params.aoMapPath);
        this.specularMapPath = fixPath(params.specularMapPath);

        this.orbitDuration = (typeof params.orbitDuration === 'number')
            ? Math.abs(params.orbitDuration)
            : 100;
        this.isRetrogradeOrbit = (params.orbitDuration < 0);

        this.rotationDuration = (typeof params.rotationDuration === 'number')
            ? Math.abs(params.rotationDuration)
            : this.orbitDuration;
        this.isRetrogradeRotation = (params.rotationDuration < 0);

        this.distance = params.distance;
        this.gravity = params.gravity;
        this.avgTemp = params.avgTemp;
        this.mass = params.mass;
        this.orbitTilt = params.orbitTilt || 0;
        this.rotationTilt = params.rotationTilt || 0;
        this.parentPlanet = params.parentPlanet;
        this.scene = params.scene;
        this.camera = params.camera;
        this.controls = params.controls;
        this.state = params.state;
        this.occlusionObjects = params.occlusionObjects;
        this.orbitTails = params.orbitTails;
        this.labelRenderer = params.labelRenderer;
        this.raycaster = params.raycaster;
        this.guiParams = params.guiParams;
        this.scaleFactor = params.scaleFactor || 1;
        this.parentPlanetName = params.parentPlanetName || "Nieznana";

        this.modelPath = params.modelPath || null;

        if (isNaN(this.scaleFactor)) {
            console.error(`Nieprawidłowy scaleFactor dla księżyca ${this.name}:`, this.scaleFactor);
        }

        // Debug – sprawdzaj, jaką ścieżkę przekazujesz
         console.log(`[Moon.js] Tworzę księżyc ${this.name} z texturePath:`, this.texturePath);

        this.initMoon();
    }

    initMoon() {
        this.orbitPivot = new THREE.Object3D();
        this.parentPlanet.add(this.orbitPivot);
        this.orbitPivot.rotation.x = THREE.MathUtils.degToRad(this.orbitTilt);
        if (this.texturePath) {
         //   console.log(`[Moon.js] [${this.name}] Ma surfaceTexture -> generuję kulę z createPlanet()`);
            const sphereMesh = this.createPlanetMesh();
            this.setupMoonMesh(sphereMesh);
        } else {
            if (this.modelPath) {
              //  console.log(`[Moon.js] [${this.name}] Brak tekstury, ale mamy modelPath="${this.modelPath}" -> loadModel`);
                this.loadModel(this.modelPath).then(modelMesh => {
                    this.setupMoonMesh(modelMesh);
                }).catch(err => {
                    console.error(`[Moon.js] [${this.name}] Błąd wczytywania modelu z ${this.modelPath}:`, err);
                    const sphereMesh = this.createPlanetMesh();
                    this.setupMoonMesh(sphereMesh);
                });
            } else {
                if (this.modelPath) {
                    this.loadModel(this.modelPath).then(modelMesh => {
                        this.setupMoonMesh(modelMesh);
                    }).catch(err => {
                        console.error(`[Moon.js] [${this.name}] Błąd wczytywania modelu z ${this.modelPath}:`, err);
                        // Fallback – losowy model + tekstura!
                        const {modelPath, texturePath} = getRandomDefaultModelAndTexture();
                        this.loadModelWithTexture(modelPath, texturePath).then(mesh => {
                            this.setupMoonMesh(mesh);
                        });
                    });
                } else {
                    // Losowy model + losowa tekstura:
                    const {modelPath, texturePath} = getRandomDefaultModelAndTexture();
                    this.loadModelWithTexture(modelPath, texturePath).then(mesh => {
                        this.setupMoonMesh(mesh);
                    });
                }
            }
        }
    }

    createPlanetMesh() {
        return createPlanet(
            this.radius,
            this.texturePath,
            5,
            this.normalMapPath,
            this.bumpMapPath,
            this.aoMapPath,
            this.specularMapPath
        );

    }
    loadModelWithTexture(modelPath, texturePath) {
        return new Promise((resolve, reject) => {
            const extension = modelPath.split('.').pop().toLowerCase();
            if (extension === 'ply') {
                // Ładujemy model .ply i nakładamy teksturę
                const loader = new PLYLoader();
                loader.load(modelPath, (geometry) => {
                    // Ładujemy teksturę
                    const texLoader = new THREE.TextureLoader();
                    texLoader.load(texturePath, (texture) => {
                        const material = new THREE.MeshStandardMaterial({
                            map: texture,
                            color: 0xffffff,
                        });
                        const mesh = new THREE.Mesh(geometry, material);
                        normalizeToUnitSphere(mesh);
                        mesh.scale.set(this.radius, this.radius, this.radius);
                        resolve(mesh);
                    }, undefined, (err) => {
                        // Nie udało się załadować tekstury, fallback na biały mesh
                        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                        const mesh = new THREE.Mesh(geometry, material);
                        normalizeToUnitSphere(mesh);
                        mesh.scale.set(this.radius, this.radius, this.radius);
                        resolve(mesh);
                    });
                }, undefined, (error) => {
                    reject(error);
                });
            } else {
                reject(new Error('Nieobsługiwany format modelu: ' + extension));
            }
        });
    }

    setupMoonMesh(mesh) {
        this.mesh = mesh;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(this.distance, 0, 0);
        this.mesh.rotation.z = THREE.MathUtils.degToRad(this.rotationTilt);
        this.orbitPivot.add(this.mesh);

        this.setMeshProperties();

        this.mesh.userData = {
            bodyType: "Moon",
            name: this.name,
            radius: this.radius,
            meanRadiusKm: this.meanRadiusKm,
            distance: this.distance / this.scaleFactor,
            orbitDuration: this.orbitDuration,
            rotationDuration: this.rotationDuration,
            gravity: this.gravity,
            avgTemp: (this.avgTemp !== undefined ? this.avgTemp : null),
            mass: this.mass,
            orbitTilt: this.orbitTilt,
            rotationTilt: this.rotationTilt,
            parentPlanetName: this.parentPlanetName,
        };

        this.occlusionObjects.push(this.mesh);

        this.label = createLabel(this.name);
        this.mesh.add(this.label);
        this.label.userData.shouldShow = this.guiParams.showObjectNames;
        this.label.visible = this.guiParams.showObjectNames;

        const maxPoints = Math.round(0.95 * this.orbitDuration * 1440);
        this.orbitTail = new OrbitTail(this.mesh, this.scene, maxPoints, {
            color: 0xcccccc,
            opacity: 0.5
        });
        if (!this.guiParams.showOrbitTails) {
            this.orbitTail.hide();
        }
        this.orbitTails.push(this.orbitTail);

        this.label.element.addEventListener('click', (event) => {
            event.stopPropagation();
            focusOnObject(this.mesh, this.camera, this.controls, this.state, this.scaleFactor);
            updatePlanetInfo(this.mesh);
        });
    }

    loadModel(path) {
        return new Promise((resolve, reject) => {
            const extension = path.split('.').pop().toLowerCase();
            if (extension === 'glb' || extension === 'gltf') {
                const loader = new GLTFLoader();
                loader.load(path, (gltf) => {
                    const model = gltf.scene.clone(true);
                    normalizeToUnitSphere(model);
                    console.log("Model boundingSphere (przed skalą):", model);
                    model.scale.multiplyScalar(this.radius);
                    console.log("Model scale (po normalizacji):", model.scale);

                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    resolve(model);
                }, undefined, (error) => {
                    reject(error);
                });
            } else if (extension === 'ply') {
                const loader = new PLYLoader();
                loader.load(path, (geometry) => {
                    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                    const mesh = new THREE.Mesh(geometry, material);
                    const finalScale = this.radius;
                  //  console.log(`[Moon.js] [${this.name}] Wczytano model .ply => skala = ${finalScale}`);
                    normalizeToUnitSphere(mesh);
                    mesh.scale.set(finalScale, finalScale, finalScale);
                    resolve(mesh);
                }, undefined, (error) => {
                    reject(error);
                });
            } else {
                reject(new Error(`[Moon.js] [${this.name}] Nieobsługiwany format modelu: ${extension}`));
            }
        });
    }

    setMeshProperties() {
        this.mesh.name = this.name;
        this.mesh.userData.radius = this.radius;
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.name = this.name;
                child.userData.radius = this.radius;
            }
        });
    }

    update(cosmicDelta) {
        if (!this.mesh) return;

        if (this.rotationDuration > 0) {
            const rotationPeriodSeconds = this.rotationDuration * 3600;
            const rotationSpeed = (2 * Math.PI) / rotationPeriodSeconds;
            const directionFactor = this.isRetrogradeRotation ? -1 : 1;
            this.mesh.rotation.y += rotationSpeed * cosmicDelta * directionFactor;
        }

        if (this.orbitPivot && this.orbitDuration > 0) {
            const orbitalPeriodSeconds = this.orbitDuration * 86400;
            const orbitSpeed = (2 * Math.PI) / orbitalPeriodSeconds;
            const orbitDirection = this.isRetrogradeOrbit ? -1 : 1;
            this.orbitPivot.rotation.y += orbitSpeed * cosmicDelta * orbitDirection;
        }

        this.label.userData.shouldShow = this.guiParams.showObjectNames;
        updateLabelVisibility(
            this.label,
            this.mesh,
            this.camera,
            this.raycaster,
            this.occlusionObjects
        );

        if (this.guiParams.showOrbitTails) {
            this.orbitTail.show();
            this.orbitTail.update();
        } else {
            this.orbitTail.hide();
        }
    }
}