// src/components/Moon/Moon.js
import * as THREE from 'three';
import { createPlanet } from '../../utils/createPlanet';
import { createLabel, updateLabelVisibility } from '../../utils/labelUtils';
import { OrbitTail } from '../../utils/orbitTail';
import { focusOnObject } from '../../utils/focusOnObject';
import { updatePlanetInfo } from '../Planet/PlanetScene';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {PLYLoader} from "three/examples/jsm/loaders/PLYLoader";

export class Moon {
    constructor(params) {
        this.name = params.name;
        this.radius = params.radius;
        this.meanRadiusKm = params.meanRadiusKm;
        this.texturePath = params.texturePath || null;
        this.bumpMapPath = params.bumpMapPath || null;
        this.normalMapPath = params.normalMapPath || null;
        this.aoMapPath = params.aoMapPath || null;
        this.specularMapPath = params.specularMapPath || null;
        this.orbitDuration = params.orbitDuration;
        this.rotationDuration = params.rotationDuration || params.orbitDuration;
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

        this.initMoon();
    }

    initMoon() {
        // Tworzymy pivot orbity i dodajemy do planety
        this.orbitPivot = new THREE.Object3D();
        this.parentPlanet.add(this.orbitPivot);
        this.orbitPivot.rotation.x = THREE.MathUtils.degToRad(this.orbitTilt);

        // Jeśli jest model, spróbuj go załadować:
        if (this.modelPath) {
            this.loadModel(this.modelPath).then(mesh => {
                this.setupMoonMesh(mesh);
            }).catch(err => {
                console.error(`Nie udało się załadować modelu dla ${this.name}:`, err);
                // W razie niepowodzenia fallback do createPlanet
                const mesh = this.createPlanetMesh();
                this.setupMoonMesh(mesh);
            });
        } else {
            // Brak modelu, fallback do createPlanet
            const mesh = this.createPlanetMesh();
            this.setupMoonMesh(mesh);
        }
    }

    createPlanetMesh() {
        return createPlanet(
            this.radius,
            this.texturePath,
            5, // Domyślna wartość shininess
            this.normalMapPath,
            this.bumpMapPath,
            this.aoMapPath,
            this.specularMapPath
        );
    }

    setupMoonMesh(mesh) {
        this.mesh = mesh;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.set(this.distance, 0, 0);
        this.mesh.rotation.z = THREE.MathUtils.degToRad(this.rotationTilt);
        this.orbitPivot.add(this.mesh);

        this.setMeshProperties();

        // Dodanie danych do userData
        this.mesh.userData = {
            bodyType: "Moon",
            name: this.name,
            radius: this.radius,
            meanRadiusKm: this.meanRadiusKm,  // wartość faktyczna bez skalowania
            distance: this.distance / this.scaleFactor,
            orbitDuration: this.orbitDuration,
            rotationDuration: this.rotationDuration,
            gravity: this.gravity,
            avgTemp: this.avgTemp !== undefined ? this.avgTemp : null,
            mass: this.mass,
            orbitTilt: this.orbitTilt,
            rotationTilt: this.rotationTilt,
            parentPlanetName: this.parentPlanetName,
        };

        // Dodanie do listy obiektów occlusionObjects
        this.occlusionObjects.push(this.mesh);

        // Tworzymy etykietę
        this.label = createLabel(this.name);
        this.mesh.add(this.label);

        // Domyślne ustawienie widoczności etykiety
        this.label.userData.shouldShow = this.guiParams.showObjectNames;
        this.label.visible = this.guiParams.showObjectNames;

        // Ogon orbity
        const maxPoints = Math.round(0.95 * this.orbitDuration * 1440);
        this.orbitTail = new OrbitTail(this.mesh, this.scene, maxPoints, { color: 0xcccccc, opacity: 0.5 });

        if (!this.guiParams.showOrbitTails) {
            this.orbitTail.hide();
        }

        this.orbitTails.push(this.orbitTail);

        // Obsługa kliknięcia na etykietę
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
                    // Ustal skalę modelu na podstawie radius, który jest już pomnożony przez scaleFactor
                    const scaleValue = (this.radius > 0) ? this.radius : 1;
                    // Jeśli potrzebujesz dodatkowo zmniejszyć model, np. o połowę:
                    const additionalScaleFactor = 0.0001;
                    const finalScale = this.radius * this.scaleFactor;
                    model.scale.set(finalScale, finalScale, finalScale);
                    resolve(model);
                }, undefined, (error) => {
                    reject(error);
                });
            } else if (extension === 'ply') {
                const loader = new PLYLoader();
                loader.load(path, (geometry) => {
                    const material = new THREE.MeshStandardMaterial({color: 0xffffff});
                    const mesh = new THREE.Mesh(geometry, material);
                    const scaleValue = (this.radius > 0) ? this.radius : 1;
                    // Ponownie możemy zmniejszyć o połowę jeśli jest za duży
                    const finalScale = scaleValue * 0.5;
                    mesh.scale.set(finalScale, finalScale, finalScale);
                    resolve(mesh);
                }, undefined, (error) => {
                    reject(error);
                });
            } else {
                reject(new Error(`Nieobsługiwany format modelu: ${extension}`));
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
        // Aktualizacja rotacji księżyca
        if (this.mesh && this.rotationDuration > 0) {
            const rotationPeriodSeconds = this.rotationDuration * 3600;
            const moonAngularVelocity = (2 * Math.PI) / rotationPeriodSeconds;
            this.mesh.rotation.y += moonAngularVelocity * cosmicDelta;
        }

        // Aktualizacja pozycji w orbicie
        if (this.orbitPivot && this.orbitDuration > 0) {
            const orbitalPeriodSeconds = this.orbitDuration * 86400;
            const orbitAngularVelocity = (2 * Math.PI) / orbitalPeriodSeconds;
            this.orbitPivot.rotation.y += orbitAngularVelocity * cosmicDelta;
        }

        // Aktualizacja widoczności etykiety
        this.label.userData.shouldShow = this.guiParams.showObjectNames;
        updateLabelVisibility(this.label, this.mesh, this.camera, this.raycaster, this.occlusionObjects);

        // Aktualizacja ogona orbity
        if (this.guiParams.showOrbitTails) {
            this.orbitTail.show();
            this.orbitTail.update();
        } else {
            this.orbitTail.hide();
        }
    }
}
