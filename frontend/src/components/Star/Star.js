// src/components/Star/Star.js
import React, { useLayoutEffect, useRef } from 'react';
import { initializeStarScene, disposeStarScene } from './StarScene';
import '../Planet/Planet.css';

function Star({ planetData }) {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;
            initializeStarScene(container, planetData);
        } else {
            console.warn('containerRef.current is null');
        }

        return () => {
            disposeStarScene();
        };
    }, [planetData]);

    return <div ref={containerRef} style={{ height: '100%' }}></div>;

}

export default Star;