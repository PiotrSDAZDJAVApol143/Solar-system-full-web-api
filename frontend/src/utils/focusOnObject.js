//src/utils/focusOnObject.js
import * as THREE from 'three';
import { gsap } from "gsap";
import { updatePlanetInfo } from '../components/Planet/PlanetScene';

export function focusOnObject(object, camera, controls, state) {
    if (!controls || !camera || !object) {
        console.error("Brak niezbędnych argumentów w focusOnObject.");
        return;
    }

    // Jeśli już trwa animacja, zignoruj żądanie
    if (state.isTweening) {
    //    console.log("Animacja w toku, pomijam nowe żądanie śledzenia.");
        return;
    }

    // Jeśli już śledzimy ten sam obiekt, zignoruj żądanie
    if (state.currentTargetObject === object && state.isFollowingObject) {
     //   console.log("Już śledzimy ten obiekt, pomijam nowe żądanie.");
        return;
    }

    const radius = object.userData.radius;
    const diameter = radius * 2;
    if (!radius || isNaN(radius)) {
        console.error("Nieprawidłowy promień obiektu:", radius, object);
        return;
    }
    updatePlanetInfo(object);

    let cameraMinDistance;
    let controlsMinDistance;
    let controlsMaxDistance;

    if (diameter > 0.5) {
     //   console.log("obiekt średni")
        // Dla obiektów o średnicy większej niż 0.5
        cameraMinDistance = diameter * 1.2;
        controlsMinDistance = cameraMinDistance * 0.5;
        controlsMaxDistance = cameraMinDistance * 100;
    } else {
    //    console.log("obiekt mały")
        // Dla obiektów o średnicy mniejszej lub równej 0.5
        cameraMinDistance = diameter * 1.3;
        controlsMinDistance = cameraMinDistance * 6;
        controlsMaxDistance = cameraMinDistance * 100;
    }


    console.log("Promień obiektu:", radius);
   console.log("obiekt mały/średni zdefiniowany przez Ciebie");
    console.log("Minimalna odległość kamery:", cameraMinDistance);

    controls.minDistance = controlsMinDistance;
    controls.maxDistance = controlsMaxDistance;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    state.isTweening = true;
    console.log("focusOnObject -> start camera pos:", camera.position);
    console.log("focusOnObject -> docelowy obiekt:", object.name, "radius=", radius);
    console.log("focusOnObject -> cameraMinDistance=", cameraMinDistance);

    const newTargetPosition = new THREE.Vector3();
    object.getWorldPosition(newTargetPosition);
    // Przygotowanie faz animacji
    const totalDuration = 4; // 4 sekundy
    const phase1Time = totalDuration * 0.2; // 20%
    const phase2Time = totalDuration * 0.2; // 20%
    const phase3Time = totalDuration * 0.6; // 60%

    // Aktualnie śledzony obiekt i jego pozycja
    let oldTargetPosition = new THREE.Vector3();
    let hasPreviousObject = false;

    if (state.isFollowingObject && state.currentTargetObject) {
        // Mamy stary obiekt, od którego się oddalimy
        state.currentTargetObject.getWorldPosition(oldTargetPosition);
        hasPreviousObject = true;
    } else {
        // Brak poprzedniego obiektu - pomijamy fazę 1 i 2
        hasPreviousObject = false;
    }

    state.isFollowingObject = true;
    state.currentTargetObject = object;
    state.previousTargetPosition.copy(newTargetPosition);

    // Obliczamy pozycje kamery dla poszczególnych faz
    // 1. Oddalenie od starego obiektu (o 30% dodatkowej odległości)
    let phase1EndPosition = camera.position.clone();
    if (hasPreviousObject) {
        const oldDirection = new THREE.Vector3().subVectors(camera.position, oldTargetPosition).normalize();
        const oldDistance = camera.position.distanceTo(oldTargetPosition);
        const backDistance = oldDistance * 1.3; // 130% starej odległości
        phase1EndPosition = new THREE.Vector3().addVectors(oldTargetPosition, oldDirection.multiplyScalar(backDistance));
    }

    // 2. Przekierowanie kamery na nowy obiekt (nie zmieniamy pozycji kamery, tylko target)
    // Po tej fazie camera pozostaje w faz1EndPosition, ale controls.target = newTargetPosition

    // 3. Przybliżenie do nowego obiektu na cameraMinDistance
    const directionToNew = new THREE.Vector3().subVectors(camera.position, newTargetPosition).normalize();
    // Używamy phase1EndPosition jako punkt wyjścia do fazy 3
    const directionPhase3 = new THREE.Vector3().subVectors(phase1EndPosition, newTargetPosition).normalize();
    const phase3EndPosition = new THREE.Vector3().addVectors(
        newTargetPosition,
        directionPhase3.multiplyScalar(cameraMinDistance)
    );

    // Tworzymy timeline GSAP
    const tl = gsap.timeline({
        onComplete: () => {
         //   console.log("Animacja zakończona.");
            state.isTweening = false;
            controls.target.copy(newTargetPosition);
            controls.update();
        },
        onUpdate: () => {
            controls.update();
        }
    });

    // Faza 1: jeśli nie było poprzedniego obiektu, pomijamy fazę 1 i 2
    if (hasPreviousObject) {
        // Fazę 1 (oddalenie)
        tl.to(camera.position, {
            x: phase1EndPosition.x,
            y: phase1EndPosition.y,
            z: phase1EndPosition.z,
            duration: phase1Time,
            ease: "power2.inOut"
        });

        // Faza 2 (zmiana targetu na nowy obiekt, bez zmiany pozycji kamery)
        // Tween na controls.target
        tl.to(controls.target, {
            x: newTargetPosition.x,
            y: newTargetPosition.y,
            z: newTargetPosition.z,
            duration: phase2Time,
            ease: "power2.inOut"
        });
    } else {
        // Brak poprzedniego obiektu - od razu ustawiamy target
        controls.target.copy(newTargetPosition);
    }

    // Faza 3 (zbliżenie do nowego obiektu)
    tl.to(camera.position, {
        x: phase3EndPosition.x,
        y: phase3EndPosition.y,
        z: phase3EndPosition.z,
        duration: phase3Time,
        ease: "power2.inOut"
    });
}
