// src/config.js
export function getScaleFactor(distanceFromSun) {
    let baseDistance = 600_000_000;
    let baseScale = 1 / 1000;

    for (let i = 1; i <= 10; i++) {
        if (distanceFromSun <= baseDistance) {
            return baseScale;
        }
        baseDistance += 600_000_000;
        baseScale = 1 / (1000 * (i + 1));
    }
    return baseScale;
}