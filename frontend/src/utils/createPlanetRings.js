//src/utils/createPlanetRings.js
import * as THREE from 'three';

export function createPlanetRings(params) {
    const {
        innerRadius,
        outerRadius,
        texturePath,
        opacity,
    } = params;

    // Tworzenie geometrii pierścienia jako cienkiego cylindra
    const ringThickness = 0.05; // Grubość pierścienia (można dostosować)
    const ringGeometry = new THREE.CylinderGeometry(innerRadius, outerRadius, ringThickness, 128, 1, true);

    // Ładowanie tekstury pierścienia
    const ringTexture = new THREE.TextureLoader().load(texturePath);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.wrapT = THREE.RepeatWrapping;

    // Tworzenie materiału pierścienia
// const ringMaterial = new THREE.MeshBasicMaterial({
//     map: ringTexture,
//     side: THREE.DoubleSide,
//     transparent: true,
//     opacity: opacity,
// });

//const ringMaterial = new THREE.MeshStandardMaterial({
//  map: ringTexture,
//  side: THREE.DoubleSide,
//  transparent: true,
//  opacity: opacity,
//  metalness: 0.3, // Kontroluje metaliczność
//  roughness: 0.8, // Kontroluje chropowatość
//});

    const ringMaterial = new THREE.MeshPhysicalMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        metalness: 0.2,
        roughness: 0.8,
        transmission: 0.6,  // Przezroczystość
        thickness: 0.1,     // Grubość dla efektu przezroczystości
        clearcoat: 0.3,     // Powłoka dla dodatkowego połysku
        clearcoatRoughness: 0.5,
    })

// Tworzenie mesha pierścienia
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = 'PlanetRing';
    ringMesh.receiveShadow = true;
    return ringMesh;
}