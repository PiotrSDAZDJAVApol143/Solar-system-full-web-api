// src/utils/addSunAndLight.js
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

export function addSunAndLight(scene, sunRadius, flarePower, ambientLightPower) {
    const loader = new THREE.TextureLoader();

    // Słońce
    const sunTexture = loader.load("/assets/textures/star/sun_surface.jpg");
    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);

    // Rozbłysk
    const flareTexture = loader.load('/assets/textures/star/lensflare0.png');
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flareTexture, flarePower, 0));
    sunMesh.add(lensflare);

    // Światło
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 0, 2);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunMesh.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, ambientLightPower);
    scene.add(ambientLight);

    return { sunMesh, sunLight, ambientLight };
}
