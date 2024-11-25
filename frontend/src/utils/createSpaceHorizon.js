//src/utils/createSpaceHorizon.js
import * as THREE from 'three';

export function createSpaceHorizon(scene, spaceHorizonDistance){
    const loader = new THREE.TextureLoader();
    const spaceTexture = loader.load('/assets/textures/8k_stars_milky_way.jpg');

    spaceTexture.repeat.set(1, 1);
    spaceTexture.mapping = THREE.EquirectangularReflectionMapping;

    const spaceGeometry = new THREE.SphereGeometry(spaceHorizonDistance, 128, 128);
    const spaceMaterial = new THREE.MeshBasicMaterial({
        map: spaceTexture,
        side: THREE.BackSide  // Odwrócenie normalnych, żeby tekstura była widoczna od wewnątrz
    });
    const spaceSphere = new THREE.Mesh(spaceGeometry, spaceMaterial);

    scene.add(spaceSphere);
    return spaceSphere;
}