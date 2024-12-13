// src/components/Moon/Moon.js
import * as THREE from 'three';
import { createPlanet } from '../../utils/createPlanet';
import { createLabel, updateLabelVisibility } from '../../utils/labelUtils';
import { OrbitTail } from '../../utils/orbitTail';
import { focusOnObject } from '../../utils/focusOnObject';

export class Moon {
    constructor(params) {
        this.name = params.name;
        this.radius = params.radius;
        this.texturePath = params.texturePath || null;
        this.bumpMapPath = params.bumpMapPath || null;
        this.normalMapPath = params.normalMapPath || null;
        this.aoMapPath = params.aoMapPath || null;
        this.specularMapPath = params.specularMapPath || null;
        this.orbitDuration = params.orbitDuration;
        this.rotationDuration = params.rotationDuration || params.orbitDuration;
        this.distance = params.distance;
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
        this.scaleFactor = params.scaleFactor
        if (isNaN(this.scaleFactor)) {
            console.error(`Nieprawidłowy scaleFactor dla księżyca ${this.name}:`, this.scaleFactor);
        }
        this.initMoon();
    }

    initMoon() {
        // Pivot orbity
        this.orbitPivot = new THREE.Object3D();
        this.parentPlanet.add(this.orbitPivot);
        this.orbitPivot.rotation.x = THREE.MathUtils.degToRad(this.orbitTilt);

        // Tworzymy mesha księżyca (kula z teksturą)
        this.mesh = createPlanet(
            this.radius,
            this.texturePath,
            5,
            this.normalMapPath,
            this.bumpMapPath,
            this.aoMapPath,
            this.specularMapPath
        );

        this.afterMeshLoad();
    }

    afterMeshLoad() {
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.position.set(this.distance, 0, 0);
        this.mesh.rotation.z = THREE.MathUtils.degToRad(this.rotationTilt);
        this.orbitPivot.add(this.mesh);

        this.setMeshProperties();

        this.occlusionObjects.push(this.mesh);

        // Etykieta
        this.label = createLabel(this.name);
        this.mesh.add(this.label);

        this.label.userData.shouldShow = this.guiParams.showObjectNames;

        const maxPoints = Math.round(0.8 * this.orbitDuration * 60);
        this.orbitTail = new OrbitTail(this.mesh, this.scene, maxPoints, { color: 0xcccccc, opacity: 0.5 });
        this.orbitTail.hide();
        this.orbitTails.push(this.orbitTail);

        this.label.element.addEventListener('click', (event) => {
            event.stopPropagation();
            focusOnObject(this.mesh, this.camera, this.controls, this.state, this.scaleFactor);
            const planetInfoDiv = document.getElementById('planet-info');
            if (planetInfoDiv) {
                planetInfoDiv.innerHTML = `
                    <h2>Informacje o ${this.name}</h2>
                    <p>${this.name} jest jednym z księżyców...</p>
                `;
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

    update(deltaTime) {
        if (this.mesh && this.rotationDuration > 0) {
            this.mesh.rotation.y += (2 * Math.PI) / (this.rotationDuration * 60) * deltaTime;
        }

        if (this.orbitPivot && this.orbitDuration > 0) {
            this.orbitPivot.rotation.y += (2 * Math.PI) / (this.orbitDuration * 60) * deltaTime;
        }

        // Aktualizujemy userData.shouldShow i widoczność label
        this.label.userData.shouldShow = this.guiParams.showObjectNames;
        updateLabelVisibility(this.label, this.mesh, this.camera, this.raycaster, this.occlusionObjects);

        // OrbitTail
        if (this.guiParams.showOrbitTails) {
            this.orbitTail.show();
        } else {
            this.orbitTail.hide();
        }

        if (this.guiParams.showOrbitTails) {
            this.orbitTail.update();
        }
    }
}
