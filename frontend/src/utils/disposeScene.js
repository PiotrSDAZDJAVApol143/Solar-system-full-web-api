// src/utils/disposeScene.js

import { cleanMaterial } from './cleanMaterial.js';

export function disposeScene(objects) {
    const {
        scene,
        renderer,
        controls,
        gui,
        labelRenderer,
        animateId,
        container,
        onWindowResize,
    } = objects;

    // Usunięcie renderera
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
    }

    // Usunięcie sceny
    if (scene) {
        scene.traverse((object) => {
            if (object.isMesh) {
                object.geometry.dispose();
                if (object.material.isMaterial) {
                    cleanMaterial(object.material);
                } else {
                    // Dla materiałów jako tablica
                    for (const material of object.material) {
                        cleanMaterial(material);
                    }
                }
            }
        });
    }

    // Anulowanie animacji
    if (animateId) {
        cancelAnimationFrame(animateId);
    }

    // Usunięcie nasłuchiwaczy zdarzeń
    if (onWindowResize) {
        window.removeEventListener('resize', onWindowResize);
    }

    // Usunięcie kontrolerów
    if (controls) {
        controls.dispose();
    }

    // Zniszczenie GUI
    if (gui) {
        gui.destroy();
    }

    // Usunięcie label renderer
    if (labelRenderer && labelRenderer.domElement) {
        if (labelRenderer.domElement.parentNode) {
            labelRenderer.domElement.parentNode.removeChild(labelRenderer.domElement);
        }
    }

    // Wyczyść kontener
    if (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}