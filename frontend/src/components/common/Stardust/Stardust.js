// src/components/common/Stardust/Stardust.js
import React, {useRef, useEffect, useImperativeHandle, forwardRef} from 'react';
import * as THREE from 'three';
import './Stardust.css';

const Stardust = forwardRef((props, ref) => {
    const mountRef = useRef(null);
    const requestRef = useRef();
    const starfieldPausedRef = useRef(false);
    const containerFadeRef = useRef(null);

    const fadeTo = (to, duration = 1000, cb) => {
        if (!containerFadeRef.current) return;
        const from = parseFloat(containerFadeRef.current.style.opacity) || 1;
        const step = (timestamp, startTime) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = from + (to - from) * progress;
            containerFadeRef.current.style.opacity = value;
            if (progress < 1) {
                requestAnimationFrame(ts => step(ts, startTime));
            } else {
                if (cb) cb();
            }
        };
        requestAnimationFrame(ts => step(ts, ts));
    };

    // Metody do ref
    useImperativeHandle(ref, () => ({
        fadeOut(duration = 1200) {
            fadeTo(0, duration, () => {
                starfieldPausedRef.current = true;
            });
        },
        fadeIn(duration = 1000) {
            // jeśli było zapauzowane — wznowić animację
            starfieldPausedRef.current = false;
            fadeTo(1, duration);
        }
    }));

    useEffect(() => {
        let starfieldScene, starfieldCamera, starfieldRenderer;
        let stars, starGeo;
        let velocities, accelerations;
        let starMaterial, sprite;
        const starCount = 8000;

        const current = mountRef.current;
        const width = current.clientWidth;
        const height = current.clientHeight;

        // Inicjalizacja sceny, kamery i renderera
        starfieldScene = new THREE.Scene();
        starfieldCamera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
        starfieldCamera.position.z = 1;
        starfieldCamera.rotation.x = Math.PI / 2;

        starfieldRenderer = new THREE.WebGLRenderer({ alpha: true });
        starfieldRenderer.setSize(width, height);
        current.appendChild(starfieldRenderer.domElement);

        // Inicjalizacja gwiazd
        const starPositions = new Float32Array(starCount * 3); // x, y, z dla każdej gwiazdy
        velocities = new Float32Array(starCount);
        accelerations = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * 600 - 300;
            const y = Math.random() * 600 - 300;
            const z = Math.random() * 600 - 300;

            starPositions[i * 3] = x;
            starPositions[i * 3 + 1] = y;
            starPositions[i * 3 + 2] = z;

            velocities[i] = 0;
            accelerations[i] = 0.02;
        }

        starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

        // Ładowanie tekstury gwiazdy
        sprite = new THREE.TextureLoader().load('/assets/textures/stars/circle.png');
        starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.7,
            map: sprite,
            transparent: true,
            depthWrite: false,
        });

        stars = new THREE.Points(starGeo, starMaterial);
        starfieldScene.add(stars);

        // Pętla animacji
        const animate = () => {
            if (starfieldPausedRef.current) {
                starfieldRenderer.render(starfieldScene, starfieldCamera);
                requestRef.current = requestAnimationFrame(animate);
                return;
            }

            const positions = starGeo.attributes.position.array;
            for (let i = 0; i < starCount; i++) {
                velocities[i] += accelerations[i];
                positions[i * 3 + 1] -= velocities[i]; // Ruch wzdłuż osi Y

                if (positions[i * 3 + 1] < -200) {
                    positions[i * 3 + 1] = 200;
                    velocities[i] = 0;
                }
            }
            starGeo.attributes.position.needsUpdate = true;
            stars.rotation.y += 0.002;

            starfieldRenderer.render(starfieldScene, starfieldCamera);
            requestRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Obsługa zmiany rozmiaru okna
        const onWindowResize = () => {
            const width = current.clientWidth;
            const height = current.clientHeight;
            starfieldCamera.aspect = width / height;
            starfieldCamera.updateProjectionMatrix();
            starfieldRenderer.setSize(width, height);
        };
        window.addEventListener('resize', onWindowResize);

        // Funkcja czyszcząca
        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', onWindowResize);
            starfieldRenderer.dispose();
            current.removeChild(starfieldRenderer.domElement);

            // Usuwanie geometrii i materiałów
            starGeo.dispose();
            starMaterial.dispose();
            sprite.dispose();
        };
    }, []);

    return (
        <div
            ref={el => {
                mountRef.current = el;
                containerFadeRef.current = el;
            }}
            className="stardust-container"
            style={{opacity: 1, transition: 'opacity 0.2s linear'}}
        ></div>
    );
});

export default Stardust;
