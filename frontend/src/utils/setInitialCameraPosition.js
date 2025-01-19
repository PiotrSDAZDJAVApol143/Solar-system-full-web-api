// src/utils/setInitialCameraPosition.js
import * as THREE from "three";

export function setInitialCameraPosition(object3D, camera, controls) {
    if (!object3D || !camera) return;

    // 1. Promień i średnica
    const radius = object3D.userData.radius || 1;
    const diameter = radius * 2;

    // 2. Chcemy startową odległość = 120% średnicy
    const cameraMinDistance = diameter * 1.2;

    // 3. Oblicz bieżący wektor z kamery do planety
    const objectPos = new THREE.Vector3();
    object3D.getWorldPosition(objectPos);

    // Kierunek = (aktualnaPozycjaKamery - obiekt).normalize()
    const direction = new THREE.Vector3().subVectors(camera.position, objectPos).normalize();

    // Nowa pozycja kamery = obiekt + direction * cameraMinDistance
    const newPos = new THREE.Vector3().addVectors(
        objectPos,
        direction.multiplyScalar(cameraMinDistance)
    );

    // 4. Ustaw kamerę
    camera.position.copy(newPos);

    // 5. OrbitControls – minimalne i maksymalne przybliżenie
    controls.minDistance = cameraMinDistance * 0.5;
    controls.maxDistance = cameraMinDistance * 100;

    // 6. Ustaw target = obiekt
    controls.target.copy(objectPos);
    controls.update();
}