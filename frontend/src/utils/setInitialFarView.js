// src/utils/setInitialFarView.js
import * as THREE from "three";

export function setInitialFarView(object3D, camera, controls, multiplier = 2.0) {
    if (!object3D || !camera) return;

    // Odczytujemy światową pozycję planety/księżyca
    const objectPos = new THREE.Vector3();
    object3D.getWorldPosition(objectPos);

    // Odczytujemy promień i średnicę
    const radius = object3D.userData.radius || 1;
    const diameter = radius * 2;

    // Dystans, na którym chcemy ustawić kamerę (np. 2× średnica)
    const initialDistance = diameter * multiplier;

    // Obecny kierunek z kamery do obiektu
    const currentCameraPos = camera.position.clone();
    const direction = currentCameraPos.sub(objectPos).normalize();

    // Nowa pozycja kamery – obiekt + (kierunek * initialDistance)
    const newCameraPos = objectPos.clone().add(direction.multiplyScalar(initialDistance));
    console.log("setInitialFarView -> planet radius:", radius, "pozycja kamery PRZED:", camera.position);
    console.log("setInitialFarView -> planetPosition:", objectPos);
    camera.position.copy(newCameraPos);
    console.log("setInitialFarView -> Ustawiam kamerę na:", newCameraPos);
    // Ustaw target
    controls.target.copy(objectPos);

    // Możesz też ustawić minDistance i maxDistance
    controls.minDistance = 0.01;  // na przykład, żeby nie kolidować
    controls.maxDistance = initialDistance * 100;
    controls.update();
}