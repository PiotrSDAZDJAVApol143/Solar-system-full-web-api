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
                                      transmission = 0.4,
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
    ringTexture.wrapS = THREE.ClampToEdgeWrapping;
    ringTexture.wrapT = THREE.ClampToEdgeWrapping;
    ringTexture.repeat.set(1, 1);
    ringTexture.rotation = Math.PI / 2;

    // Materiał (MeshPhysicalMaterial jako przykład)
    const ringMaterial = new THREE.MeshPhysicalMaterial({
        map: ringTexture,
        side,  // Widoczność z obu stron pierścienia
        transparent: true,       // Umożliwia użycie przezroczystości
        opacity,        // Ustawione w konfiguracji planety
        metalness,    // Efekt metaliczności
        roughness: 0.9,    // Chropowatość powierzchni
        transmission,  // Przezroczystość (bardziej realistyczna)
        clearcoat,    // Powłoka odbicia światła
        emissive: new THREE.Color(0x333333),  // Delikatne własne światło pierścieni
        emissiveIntensity: 0.4,
        depthWrite: true,       // Nie zapisuje głębokości, aby uniknąć problemów z przezroczystością
        blending: THREE.NormalBlending, // Lepszy efekt transparentności

    });
    ringMaterial.color.setRGB(1, 1, 1);

    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = name || 'PlanetRing';
    ringMesh.receiveShadow = true;
    //ringMesh.castShadow = true;

    // Najczęściej pierścienie są "płaskie" w płaszczyźnie równika planety:
    // => ringMesh.rotation.x = Math.PI / 2;  // ewentualnie inna oś

    return ringMesh;
}