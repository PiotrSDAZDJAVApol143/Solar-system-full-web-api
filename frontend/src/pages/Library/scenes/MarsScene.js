// src/components/scenes/MarsScene.js
import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, Stars } from '@react-three/drei';
import './MarsScene.css';
import { getSolarBodyByName } from '../../../services/api';
function MarsScene() {
    const marsRef = useRef();
    const [marsData, setMarsData] = React.useState(null);

    useEffect(() => {
        // Pobieranie danych z backendu
        getSolarBodyByName('Mars')
            .then(data => setMarsData(data))
            .catch(error => console.error(error));
    }, []);

    // Ładowanie tekstur
    const marsTexture = useLoader(TextureLoader, '/assets/textures/mars/8k_mars.jpg');

    return (
        <div style={{ height: '100vh' }}>
            <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Stars />
                {marsData && (
                    <mesh ref={marsRef} rotation={[0, 0, 0]}>
                        <sphereGeometry args={[marsData.meanRadius / 1000, 64, 64]} />
                        <meshStandardMaterial map={marsTexture} />
                    </mesh>
                )}
                <OrbitControls />
            </Canvas>
            <div className="planet-info">
                {marsData ? (
                    <>
                        <h2>{marsData.englishName}</h2>
                        <p>Promień: {marsData.meanRadius} km</p>
                        <p>Grawitacja: {marsData.gravity} m/s²</p>
                        {/* ... inne dane */}
                    </>
                ) : (
                    <p>Ładowanie danych...</p>
                )}
            </div>
        </div>
    );
}

export default MarsScene;