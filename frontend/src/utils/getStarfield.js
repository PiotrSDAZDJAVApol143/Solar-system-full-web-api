//src/utils/getStarfield.js
import * as THREE from "three";

export default function getStarfield({ numStars = 800 } = {}) {
    // Funkcja generująca gwiazdy na sferze
    function randomSpherePoint() {
        const radius = Math.random() * 100000 + 400000;  // Umieszczamy gwiazdy dalej
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        return {
            pos: new THREE.Vector3(x, y, z),
            hue: 0.6,
            minDist: radius,
        };
    }

    // Generujemy gwiazdy
    const verts = [];
    const colors = [];
    const positions = [];
    let col;

    for (let i = 0; i < numStars; i += 1) {
        const p = randomSpherePoint();
        const { pos, hue } = p;
        positions.push(p);
        col = new THREE.Color().setHSL(hue, 0.2, Math.random());
        verts.push(pos.x, pos.y, pos.z);
        colors.push(col.r, col.g, col.b);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
        size: 1200,
        vertexColors: true,
        map: new THREE.TextureLoader().load("/assets/textures/stars/circle.png"),
    });

    const points = new THREE.Points(geo, mat);
    return points;
}