// src/utils/planetUtils.js
export function setMeshProperties(object, name, radius) {
    object.name = name;
    object.userData.radius = radius;
    object.traverse(function (child) {
        if (child.isMesh) {
            child.name = name;
            child.userData.radius = radius;
        }
    });
}

export function calculateMaxPoints(orbitDuration) {
    return Math.round(0.6 * orbitDuration * 60);
}