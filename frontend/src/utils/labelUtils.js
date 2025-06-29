// src/utils/labelUtils.js
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'three';

export function initializeLabelRenderer(container) {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    return labelRenderer;
}

export function createLabel(text) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.marginTop = '-1em';
    div.style.pointerEvents = 'auto';
    div.style.cursor = 'pointer';



    const labelObject = new CSS2DObject(div);
    labelObject.position.set(0, 0, 0);
    return labelObject;
}

export function updateLabelVisibility(labelObject, targetObject, camera, raycaster, occlusionObjects) {
    if (!labelObject.userData.shouldShow) {
        labelObject.visible = false;
        return;
    }
    if (!targetObject) {
        labelObject.visible = false;
        return;
    }
    let targetPosition = new THREE.Vector3();
    targetObject.getWorldPosition(targetPosition);

    raycaster.set(camera.position, targetPosition.clone().sub(camera.position).normalize());

    // Oddziel pierścienie od innych przeszkód
    let planetOccluders = occlusionObjects.filter(obj => obj && obj !== targetObject && obj.name !== 'PlanetRing');
    let ringOccluders   = occlusionObjects.filter(obj => obj && obj.name === 'PlanetRing');

    let planetHits = raycaster.intersectObjects(planetOccluders, true);
    if (planetHits.length > 0) {
        labelObject.visible = false;
        labelObject.element.classList.remove('gray');
        return;
    }

    // Czy pierścień przysłania?
    let ringHits = raycaster.intersectObjects(ringOccluders, true);
    if (ringHits.length > 0) {
        // Przysłonięty przez pierścień: pokaż ale w innym stylu
        labelObject.visible = true;
        labelObject.element.classList.add('gray');
    } else {
        labelObject.visible = true;
        labelObject.element.classList.remove('gray');
    }
}

function isDescendant(parent, child) {
    let obj = child;
    while (obj != null) {
        if (obj === parent) {
            return true;
        }
        obj = obj.parent;
    }
    return false;
}