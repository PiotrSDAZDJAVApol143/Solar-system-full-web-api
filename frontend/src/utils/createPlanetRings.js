//src/utils/createPlanetRings.js

import * as THREE from 'three';

export function createPlanetRings({
                                      name,
                                      innerRadius,
                                      outerRadius,
                                      thickness = 0.05,
                                      opacity = 0.8,
                                      texturePath,
                                      side = THREE.DoubleSide,
                                      metalness = 0.2,
                                      roughness = 0.8,
                                      transmission = 0.2,
                                      clearcoat = 0.0,
                                  }) {
    // Geometria
    const ringGeometry = new THREE.CylinderGeometry(
        outerRadius,  // top radius
        innerRadius,  // bottom radius
        thickness,    // height
        128,          // radial segments
        1,            // height segments
        true          // openEnded
    );

    // Tekstura
    const ringTexture = new THREE.TextureLoader().load(texturePath);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.wrapT = THREE.RepeatWrapping;

    // Materiał (MeshPhysicalMaterial jako przykład)
    const ringMaterial = new THREE.MeshPhysicalMaterial({
        map: ringTexture,
        side,
        transparent: false,
        opacity,
        metalness,
        roughness,
        transmission,   // "przezroczystość"
        clearcoat,
        // ...
    });

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = name || 'PlanetRing';
    ringMesh.receiveShadow = true;

    // Najczęściej pierścienie są "płaskie" w płaszczyźnie równika planety:
    // => ringMesh.rotation.x = Math.PI / 2;  // ewentualnie inna oś

    return ringMesh;
}