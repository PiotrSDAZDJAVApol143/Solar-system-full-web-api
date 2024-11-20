// src/utils/addSunAndLight.js
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

export function addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower) {
    const loader = new THREE.TextureLoader();

    // Światło
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(sunDistance, 0, 0);
    sunLight.castShadow = true;
    // Ustawienia cienia dla sunLight
    sunLight.shadow.mapSize.width = 2048;  // Rozdzielczość mapy cienia
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;     // Minimalna odległość dla cieni
    sunLight.shadow.camera.far = 1000000;  // Maksymalna odległość dla cieni
    // Ustawienia obszaru cienia (dla DirectionalLight)
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    scene.add(sunLight);

    // Słońce
    const sunTexture = loader.load("/assets/textures/star/sun_surface.jpg");
    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunDistance, 0, 0);
    scene.add(sunMesh);

    // Rozbłysk
    const flareTexture = loader.load('/assets/textures/star/lensflare0.png');
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flareTexture, flarePower, 0));
    sunMesh.add(lensflare);

    // Przegub dla orbity Słońca
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunMesh);
    sunPivot.add(sunLight);
    scene.add(sunPivot); // Dodanie przegubu do sceny

    const ambientLight = new THREE.AmbientLight(0x404040, ambientLightPower);
    scene.add(ambientLight);

    return { sunMesh, sunLight, sunPivot, ambientLight };
}