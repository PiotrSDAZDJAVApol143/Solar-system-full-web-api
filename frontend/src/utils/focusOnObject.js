//src/utils/focusOnObject.js
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

export function focusOnObject(object, camera, controls, state) {
    if (!controls || !camera || !object) {
        console.error("Brak niezbędnych argumentów w focusOnObject.");
        return;
    }

    const radius = object.userData.radius;
    const diameter = radius * 2;
    if (!radius || isNaN(radius)) {
        console.error("Nieprawidłowy promień obiektu:", radius, object);
        return;
    }
    let cameraMinDistance;
    let controlsMinDistance;
    let controlsMaxDistance;

    if (diameter > 0.5) {
        console.log("obiekt średni")
        // Dla obiektów o średnicy większej niż 0.5
        cameraMinDistance = diameter * 1.1;
        controlsMinDistance = cameraMinDistance *0.8;
        controlsMaxDistance = cameraMinDistance * 30;
    } else {
        console.log("obiekt mały")
        // Dla obiektów o średnicy mniejszej lub równej 0.5
        cameraMinDistance = diameter * 1.2; // Używane do pozycjonowania kamery
        controlsMinDistance = cameraMinDistance * 6;
        controlsMaxDistance = cameraMinDistance * 30;
    }


    console.log("Promień obiektu:", radius);
    console.log("obiekt mały/średni zdefiniowany przez Ciebie");
    console.log("Minimalna odległość kamery:", cameraMinDistance);

    controls.minDistance = controlsMinDistance;
    controls.maxDistance = controlsMaxDistance;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);

    state.isFollowingObject = true;
    state.currentTargetObject = object;
    state.previousTargetPosition.copy(targetPosition);


    // Oblicz kierunek od obiektu do kamery
    const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();

    // Ustawienie nowej pozycji kamery w odległości cameraMinDistance od obiektu
    const newCameraPosition = new THREE.Vector3().addVectors(
        targetPosition,
        direction.multiplyScalar(cameraMinDistance)
    );

    console.log('cameraMinDistance:', cameraMinDistance);
    console.log('newCameraPosition:', newCameraPosition);

    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const to = { x: newCameraPosition.x, y: newCameraPosition.y, z: newCameraPosition.z };

    controls.target.copy(targetPosition);
    state.previousTargetPosition.copy(targetPosition);

    // Usuwamy tweenGroup ze stworzenia Tweena:
    const tween = new TWEEN.Tween(from)
        .to(to, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.position.set(from.x, from.y, from.z);
            controls.update();
        })
        .onComplete(() => {
            controls.target.copy(targetPosition);
            controls.update();
        })
        .start();
}
