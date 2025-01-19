// src/components/Planet/Planet.js
import  React, { useEffect, useRef } from 'react';
import {
    initializePlanetScene,
    updatePlanetScene,
    disposePlanetScene
} from './PlanetScene';
import './Planet.css';

function Planet({ planetData }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        // Najpierw usuwamy ewentualne pozostałości starej sceny
        disposePlanetScene();

        // Tworzymy nową scenę
        initializePlanetScene(containerRef.current);

        if (planetData) {
            updatePlanetScene(planetData);
        }

        return () => {
            // Gdy wychodzimy z tego komponentu:
            disposePlanetScene();
        };
    }, [planetData]);

    return <div ref={containerRef} style={{ height: '100%' }} />;
}

export default Planet;
