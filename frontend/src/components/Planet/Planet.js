// src/components/Planet/Planet.js
import  React, { useEffect, useRef } from 'react';
import { initializePlanetScene, disposePlanetScene } from './PlanetScene';
import './Planet.css';

function Planet({ planetData }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!planetData) return;
        if (!containerRef.current) {
            console.warn('Brak kontenera, jeszcze nie wyrenderowany');
            return;
        }

        initializePlanetScene(containerRef.current, planetData);

        return () => {
            disposePlanetScene();
        };
    }, [planetData]);

    return <div ref={containerRef} style={{ height: '100%' }}></div>;

}

export default Planet;
