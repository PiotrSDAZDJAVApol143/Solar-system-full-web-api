//src/utils/resetCamera.js
import * as TWEEN from '@tweenjs/tween.js';

export function resetCamera(camera, controls, state, initialCameraPosition, initialControlsTarget, initialMinDistance, initialMaxDistance) {
    state.isTweening = true;
    state.isFollowingObject = false;
    state.currentTargetObject = null;

    const from = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z,
    };

    const to = {
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,
        z: initialCameraPosition.z,
        tx: initialControlsTarget.x,
        ty: initialControlsTarget.y,
        tz: initialControlsTarget.z,
    };

    controls.minDistance = initialMinDistance;
    controls.maxDistance = initialMaxDistance;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;

    const tween = new TWEEN.Tween(from)
        .to(to, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.position.set(from.x, from.y, from.z);
            controls.target.set(from.tx, from.ty, from.tz);
            controls.update();
        })
        .onComplete(() => {
            state.isTweening = false;
            controls.update();
        })
        .start();
}