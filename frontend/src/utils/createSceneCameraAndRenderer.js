// src/utils/createSceneCameraAndRenderer.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle) {
    const scene = new THREE.Scene();
    const angle = THREE.MathUtils.degToRad(rotationAngle);
    // Tutaj było np. planetRadius * 2.5, a Ty przepisałeś to na 20
    // -> Zastąp to prostą logiką:
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 600000);
    camera.position.set(0, 0, cameraPosition || 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Zaktualizuj tonemapping i outputColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.1;
    controls.maxDistance = 1e6;

    return { scene, camera, renderer, controls };
}
