// src/utils/createPlanet.js
import * as THREE from 'three';

export const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess, normalMapPath, bumpMapPath, aoMapPath, specularMapPath) {
    const geometry = new THREE.SphereGeometry(planetRadius, 256, 256); // Używamy 256 segmentów

    const mapTexture = loader.load(texturePath);
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    const materialParams = {
        map: mapTexture,
       // shininess: shininess || 5,
        roughness: 0.9,
        metalness: 0.8,
    };

    if (normalMapPath) {
        materialParams.normalMap = loader.load(normalMapPath);
    }

    if (bumpMapPath) {
        materialParams.bumpMap = loader.load(bumpMapPath);
        materialParams.bumpScale = 0.05; // Dostosuj wartość według potrzeb
    }

    if (aoMapPath) {
        materialParams.aoMap = loader.load(aoMapPath);
        geometry.setAttribute('uv2', geometry.attributes.uv);
    }

    if (specularMapPath) {
        materialParams.metalnessMap = loader.load(specularMapPath);
    }

    const material = new THREE.MeshStandardMaterial(materialParams);

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}