// src/utils/addSunAndLightSolarSystem.js
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

/**
 * Tworzy Słońce i oświetlenie dla sceny Układu Słonecznego.
 * Ta funkcja jest wyłącznie przeznaczona dla komponentu SolarSystem,
 * więc możesz w niej dowolnie modyfikować ustawienia (np. zwiększony poziom szczegółów)
 * bez wpływu na sceny pojedynczych planet.
 *
 * @param {THREE.Scene} scene - Scena, do której dodajemy Słońce i światła.
 * @param {THREE.Camera} camera - Kamera (przydatna np. dla aktualizacji efektu lensflare).
 * @param {Object} options - Opcjonalny obiekt z parametrami.
 * @returns {Object} - Obiekt zawierający utworzone obiekty: sunMesh, lensflare, sunLight, sunPivot, ambientLight.
 */
export function addSunAndLightSolarSystem(scene, camera, options = {}) {
    const {
        sunDistance = 0,
        sunRadius = 50,
        flarePower = 200,
        ambientLightPower = 1.5,
        sunTexturePath = "/assets/textures/star/sun_surface.jpg",
        // Możesz podać własne ścieżki do tekstur rozbłysku, jeśli chcesz
        lensflareTextures = [
            '/assets/textures/star/lensflare.close2.png',
            '/assets/textures/star/flare.halo2.png',
            '/assets/textures/star/flare.halo2.png'
        ]
    } = options;

    const loader = new THREE.TextureLoader();

    // Światło kierunkowe reprezentujące Słońce
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(sunDistance, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 1000000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    scene.add(sunLight);

    // Tworzymy siatkę Słońca
    const sunTex = loader.load(sunTexturePath);
    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTex });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunDistance, 0, 0);
    scene.add(sunMesh);

    // Efekt lensflare
    const flareTexs = lensflareTextures.map(path => loader.load(path));
    const naturalSunColor = new THREE.Color(0xfff5e1);
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flareTexs[0], flarePower, 0, naturalSunColor));
    lensflare.addElement(new LensflareElement(flareTexs[1], flarePower * 0.5, 0.2, naturalSunColor));
    lensflare.addElement(new LensflareElement(flareTexs[2], flarePower * 0.3, 0.4, naturalSunColor));
    sunLight.add(lensflare);

    // Tworzymy pivot, który pozwoli obracać Słońce (używany np. przy symulacji ruchu wokół centrum)
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunMesh);
    sunPivot.add(sunLight);
    scene.add(sunPivot);

    // Światło ambientowe dla ogólnego oświetlenia sceny
    const ambientLight = new THREE.AmbientLight(0x404040, ambientLightPower);
    scene.add(ambientLight);

    return { sunMesh, lensflare, sunLight, sunPivot, ambientLight };
}

/**
 * Aktualizuje efekt lensflare Słońca – wyłącznie dla sceny Układu Słonecznego.
 *
 * @param {THREE.Camera} camera - Aktualna kamera.
 * @param {THREE.Mesh} sunMesh - Mesh Słońca.
 * @param {Lensflare} lensflare - Obiekt lensflare.
 * @param {number} flarePower - Parametr określający siłę efektu.
 */
export function updateLensFlareSolarSystem(camera, sunMesh, lensflare, flarePower) {
    if (!sunMesh || !lensflare) return;
    const sunScreenPosition = sunMesh.position.clone().project(camera);
    lensflare.position.copy(sunMesh.position);
    const distanceToCamera = camera.position.distanceTo(sunMesh.position);
    const scaleFactor = THREE.MathUtils.clamp(5000 / distanceToCamera, 0.1, 1.5);
    if (lensflare.lensFlares && Array.isArray(lensflare.lensFlares)) {
        lensflare.lensFlares.forEach((element, index) => {
            element.size = flarePower * scaleFactor * (1 - index * 0.3);
        });
    }
    const isOnScreen = Math.abs(sunScreenPosition.x) <= 1 && Math.abs(sunScreenPosition.y) <= 1;
    lensflare.visible = isOnScreen;
}
