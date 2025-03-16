// src/utils/addSunAndLight.js
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

export function addSunAndLight(scene, camera, sunDistance, sunRadius, flarePower, ambientLightPower) {
    const loader = new THREE.TextureLoader();

    // Światło
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
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

    const sunGeo = new THREE.SphereGeometry(sunRadius, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunDistance, 0, 0);
    scene.add(sunMesh);

    // Rozbłysk soczewkowy
    const flareTextures = [
        loader.load('/assets/textures/star/lensflare.close2.png'),
        loader.load('/assets/textures/star/flare.halo2.png'),
        loader.load('/assets/textures/star/flare.halo2.png')
    ];

    const naturalSunColor = new THREE.Color(0xfff5e1);

    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flareTextures[0], flarePower, 0,naturalSunColor));
    lensflare.addElement(new LensflareElement(flareTextures[1], flarePower * 0.5, 0.2,naturalSunColor));
    lensflare.addElement(new LensflareElement(flareTextures[2], flarePower * 0.3, 0.4,naturalSunColor));

    sunLight.add(lensflare);

    // Przegub dla orbity Słońca
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunMesh);
    sunPivot.add(sunLight);
    scene.add(sunPivot); // Dodanie przegubu do sceny

    const ambientLight = new THREE.AmbientLight(0x404040, ambientLightPower);
    scene.add(ambientLight);

    // Dodanie do funkcji renderującej scenę
 //   function animate() {
 //       requestAnimationFrame(animate);
 //       updateLensFlare();
 //   }
 //   animate();

    return { sunMesh,lensflare, sunLight, sunPivot, ambientLight };
}
export function updateLensFlare(camera, sunMesh, lensflare, flarePower) {
    const sunScreenPosition = sunMesh.position.clone().project(camera);
    lensflare.position.copy(sunMesh.position);

    // Oblicz odległość kamery od słońca
    const distanceToCamera = camera.position.distanceTo(sunMesh.position);
    const scaleFactor = THREE.MathUtils.clamp(5000 / distanceToCamera, 0.1, 1.5);

    // Dostosowanie siły efektu do odległości
    if (lensflare.lensFlares && Array.isArray(lensflare.lensFlares)) {
        lensflare.lensFlares.forEach((element, index) => {
            element.size = flarePower * scaleFactor * (1 - index * 0.3);
        });
    } else {
      //  console.warn('Brak elementów lensflare!');
    }

    // Ukryj rozbłysk, jeśli Słońce jest poza ekranem
    //lensflare.visible = true;
   // lensflare.visible = sunScreenPosition.z < 1;
    const isOnScreen = Math.abs(sunScreenPosition.x) <= 1 && Math.abs(sunScreenPosition.y) <= 1;
    lensflare.visible = isOnScreen;
}