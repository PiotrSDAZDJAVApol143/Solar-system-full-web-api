// src/pages/Mercury/Mercury.js
import React, { useEffect, useRef } from 'react';
import { initializeMercuryScene, disposeMercuryScene } from './MercuryScene-old';
import './Mercury.css';

function Mercury() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        initializeMercuryScene(container);

        return () => {
            disposeMercuryScene();
        };
    }, []);

    return (
        <div className="page">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-7 planet-container" ref={containerRef} style={{ height: '80vh' }}>
                    </div>
                    <div className="col-md-4 planet-info" id="planet-info">
                        <h2>Informacje o Merkurym</h2>
                        <p>Merkury jest pierwszą planetą od Słońca...</p>
                        <p>Dane będą zaciągane z backendu z bazy danych</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Mercury;