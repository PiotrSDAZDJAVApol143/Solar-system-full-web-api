// src/components/Planet/Planet.js
import React, { useLayoutEffect, useRef } from 'react';
import { initializePlanetScene, disposePlanetScene } from './PlanetScene';

function Planet({ planetData }) {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current && planetData) {
            initializePlanetScene(containerRef.current, planetData);
        } else {
            console.warn('containerRef.current jest null lub planetData jest null');
        }

        return () => {
            disposePlanetScene();
        };
    }, [planetData]);

    return <div ref={containerRef} style={{ height: '100%' }}></div>;
}

export default Planet;