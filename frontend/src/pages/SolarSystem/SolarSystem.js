// src/pages/SolarSystem/SolarSystem.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { initializeStarScene, disposeStarScene } from './SolarSystemScene';

import './SolarSystem.css';

function SolarSystem() {
    const containerRef = useRef(null);
    const [solarSystemData, setSolarSystemData] = useState(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        // 1. Pobieramy dane z backendu
        axios.get('/api/solarbodies/solarsystem')
     //   axios.get('http://localhost:8080/api/solarbodies/solarsystem')
            .then(response => {
                setSolarSystemData(response.data);
            })
            .catch(error => {
                console.error("Błąd", error);
            });
    }, []);

    useEffect(() => {
        if (solarSystemData && containerRef.current && !initializedRef.current) {
            initializeStarScene(containerRef.current, solarSystemData);
            initializedRef.current = true;  // ważne ustawienie flagi

            return () => {
                disposeStarScene();
                initializedRef.current = false;  // resetujemy na potrzeby cleanupu
            };
        }
    }, [solarSystemData]);

    return (
        <div className="page">
            <h4>Trójwymiarowy model Układu Słonecznego w skali</h4>

            <div className="container-fluid p-0">
                <div className="solar-container" ref={containerRef} style={{height: '80vh'}}>
                </div>
            </div>
        </div>

    );
}

export default SolarSystem;
