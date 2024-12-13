// src/config.js
export function getScaleFactor(distanceFromSun) {
    if (typeof distanceFromSun !== 'number' || isNaN(distanceFromSun)) {
        console.error("Nieprawidłowy `distanceFromSun`:", distanceFromSun);
        return null;
    }

    let baseDistance = 600_000_000;
    let baseScale = 1 / 1000;
    console.log("distanceFromSun przekazany do getScaleFactor:", distanceFromSun);

    for (let i = 1; i <= 10; i++) {
        if (distanceFromSun <= baseDistance) {
            console.log(`Zwracam scaleFactor ${baseScale} dla odległości ${distanceFromSun}`);
            return baseScale;
        }
        baseDistance += 600_000_000;
        baseScale = 1 / (1000 * (i + 1));
    }

    console.log(`Zwracam domyślny scaleFactor ${baseScale}`);
    return baseScale;
}