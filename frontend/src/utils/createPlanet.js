//src/utils/createPlanet.js
import * as THREE from 'three';

export const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess, bumpMapPath, bumpScale = 0.02, displacementMapPath, displacementScale = 0.2, normalMapPath) {
    const geometry = new THREE.SphereGeometry(planetRadius, 128, 128);

    const mapTexture = loader.load(texturePath);
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({
        map: mapTexture,
        shininess: shininess || 10,
    });

    if(bumpMapPath){
        const bumpTexture = loader.load(bumpMapPath);
        bumpTexture.colorSpace = THREE.SRGBColorSpace;
        material.bumpMap = bumpTexture;
        material.bumpScale = bumpScale;
    }
    if (normalMapPath) {
        const normalTexture = loader.load(normalMapPath);
        normalTexture.colorSpace = THREE.SRGBColorSpace;
        material.normalMap = normalTexture;
    }
    if (displacementMapPath) {
        material.displacementMap = loader.load(displacementMapPath);
        material.displacementScale = displacementScale;
    }


    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}