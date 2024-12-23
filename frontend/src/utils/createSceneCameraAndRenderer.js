// src/utils/createSceneCameraAndRenderer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle) {
    const scene = new THREE.Scene();

    const angle = THREE.MathUtils.degToRad(rotationAngle);
    const cameraX = Math.cos(angle) * (planetRadius * 2.5);
    const cameraZ = Math.sin(angle) * (planetRadius * 2.5);

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 600000);
    camera.position.set(cameraX, 0, cameraZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Zaktualizuj tonemapping i outputColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = planetRadius * 1.1;
    controls.maxDistance = planetRadius*500;

    return { scene, camera, renderer, controls };
}
