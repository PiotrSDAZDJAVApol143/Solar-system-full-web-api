// src/components/Planet/Planet.js
import React, { useLayoutEffect, useRef } from 'react';
import { initializePlanetScene, disposePlanetScene } from './PlanetScene';
import './Planet.css';

function Planet({ planetData }) {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            initializePlanetScene(container, planetData);
        } else {
            console.warn('containerRef.current is null');
        }

        return () => {
            disposePlanetScene();
        };
    }, [planetData]);

    return <div ref={containerRef} style={{ height: '100%' }}></div>;

}

export default Planet;
