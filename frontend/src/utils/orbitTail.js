// src/utils/orbitTail.js
import * as THREE from 'three';

export class OrbitTail {
    /**
     * Tworzy ogon orbity dla danego księżyca.
     * @param {THREE.Object3D} moon - Obiekt reprezentujący księżyc.
     * @param {THREE.Scene} scene - Scena Three.js, do której zostanie dodany ogon.
     * @param {number} maxPoints - Maksymalna liczba punktów w ogonie.
     * @param {Object} options - Opcje konfiguracyjne.
     * @param {number} options.color - Kolor ogona (domyślnie biało-szary).
     * @param {number} options.opacity - Przezroczystość ogona (0-1).
     */
    constructor(moon, scene, maxPoints = 100, options = {}) {
        this.moon = moon;
        this.scene = scene;
        this.maxPoints = maxPoints;
        this.color = options.color || 0xcccccc; // Biało-szary
        this.opacity = options.opacity || 0.5;

        this.tailPoints = [];

        // Tworzenie geometrii i materiału dla ogona
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxPoints * 3); // x, y, z dla każdego punktu
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
            linewidth: 2,
        });
        this.line = new THREE.Line(geometry, material);
        this.line.renderOrder =50;
        this.line.visible = false; // Początkowo ukryty

        // Dodanie linii do sceny
        this.scene.add(this.line);
    }

    /**
     * Aktualizuje ogon orbity. Powinno być wywoływane w pętli animacji.
     */
    update() {
        // Pobranie pozycji księżyca w przestrzeni świata
        const pos = new THREE.Vector3();
        this.moon.getWorldPosition(pos);
        this.tailPoints.push(pos.clone());

        if (this.tailPoints.length > this.maxPoints) {
            this.tailPoints.shift();
        }

        // Aktualizacja geometrii linii
        const positionsArray = this.line.geometry.attributes.position.array;
        for (let i = 0; i < this.tailPoints.length; i++) {
            positionsArray[i * 3] = this.tailPoints[i].x;
            positionsArray[i * 3 + 1] = this.tailPoints[i].y;
            positionsArray[i * 3 + 2] = this.tailPoints[i].z;
        }

        // Wypełnienie pozostałych pozycji ostatnim punktem
        const lastPoint = this.tailPoints[this.tailPoints.length - 1] || new THREE.Vector3();
        for (let i = this.tailPoints.length; i < this.maxPoints; i++) {
            positionsArray[i * 3] = lastPoint.x;
            positionsArray[i * 3 + 1] = lastPoint.y;
            positionsArray[i * 3 + 2] = lastPoint.z;
        }

        this.line.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Pokazuje ogon orbity.
     */
    show() {
        this.line.visible = true;
    }

    /**
     * Ukrywa ogon orbity.
     */
    hide() {
        this.line.visible = false;
    }

    /**
     * Usuwa ogon orbity z sceny.
     */
    dispose() {
        if (this.line) {
            this.scene.remove(this.line);
            this.line.geometry.dispose();
            this.line.material.dispose();
            this.line = null;
        }
        this.tailPoints = [];
    }
}