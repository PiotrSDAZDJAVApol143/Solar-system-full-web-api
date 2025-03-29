// src/utils/createSolarSystemPlanet.js

import * as THREE from 'three';
import { createPlanet } from './createPlanet';
import { createPlanetRings } from './createPlanetRings';
import { OrbitTail } from './orbitTail';
import { createLabel } from './labelUtils';
import { focusOnObject } from './focusOnObject';
import planetsConfig from '../config/planetsConfig';

export function createSolarSystemPlanet({
                                            scene,
                                            planetData,
                                            scaleFactor,
                                            orbitTails,
                                            camera,
                                            controls,
                                            state,
                                            createOrbitEllipse,
                                            lowDetailMode
                                        }) {
    const planetRadius = (planetData.meanRadius || 10) * scaleFactor;
    const planetMesh = createPlanet(
        planetRadius,
        planetData.textures?.surfaceTexture,
        /* shininess */    undefined,
        /* normalMapPath */planetData.textures?.normalMapTexture,
        /* bumpMapPath */  planetData.textures?.bumpMapTexture,
        /* aoMapPath */    planetData.textures?.ambientOcclusionMapTexture,
        /* specularMap */  planetData.textures?.specularMapTexture,
        { lowDetailMode }
    );
    planetMesh.userData.englishName = planetData.englishName;
    planetMesh.userData.radius = planetRadius;
    planetMesh.userData.rotationPeriod = planetData.rotationPeriod || 24; // [godziny]
    planetMesh.userData.axialTilt = planetData.axialTilt || 0;

    planetMesh.userData.cloudRotationSpeed = planetData.cloudRotationSpeed; // np. z config
    planetMesh.userData.cloudOpacity = planetData.cloudOpacity;
    planetMesh.userData.cloudScale = planetData.cloudScale;


    const orbitPivot = new THREE.Object3D();
    orbitPivot.rotation.x = THREE.MathUtils.degToRad(planetData.inclination);
    scene.add(orbitPivot);

    planetMesh.rotation.x = THREE.MathUtils.degToRad(planetData.axialTilt);

    const inclinationDeg = planetData.inclination || 0;


    const a = (planetData.semiMajorAxis || 300) * scaleFactor;
    const e = (planetData.aphelion - planetData.perihelion) / (planetData.aphelion + planetData.perihelion);
    const b = a * Math.sqrt(1 - e*e);

    planetMesh.userData.orbitParams = {
        a,
        b,
        e,
        orbitAngle: 0,
        inclinationDeg,
        orbitalPeriodDays: planetData.orbitalPeriod || 365,
        orbitalPeriodSeconds: (planetData.orbitalPeriod || 365) * 86400,
        angularVelocity: Math.abs(2 * Math.PI / ((planetData.orbitalPeriod || 365) * 86400))
    };

    // Ustawiamy planetę w pozycji peryhelium (angle=0 => x=a)
    planetMesh.position.set(0, 0, 0);


    orbitPivot.add(planetMesh);

    // 6) elipsa orbity (opcjonalnie)
    const orbitLine = createOrbitEllipse(a, b, 0xcccccc, 128);
    orbitPivot.add(orbitLine);
    planetMesh.userData.orbitLine = orbitLine;

    if (!planetData.rings) {
        const config = planetsConfig[planetData.englishName];
        if (config && config.rings) {
            planetData.rings = config.rings;
        }
    }

    if (Array.isArray(planetData.rings)) {
        planetData.rings.forEach(ringDef => {
            const inner = ringDef.innerRadiusFactor * planetRadius;
            const outer = ringDef.outerRadiusFactor * planetRadius;
            const ring = createPlanetRings({
                name: ringDef.name,
                innerRadius: inner,
                outerRadius: outer,
                thickness: ringDef.thickness,
                opacity: ringDef.opacity,
                texturePath: ringDef.texturePath
            });
            planetMesh.add(ring);
        });
    }
    const cloudTexturePath = planetData.textures?.cloudTexture;
    if (cloudTexturePath) {
        const cloudTex = new THREE.TextureLoader().load(cloudTexturePath);
        let alphaMapTex = null;
        if (planetData.textures?.cloudAlphaTexture) {
            alphaMapTex = new THREE.TextureLoader().load( planetData.textures.cloudAlphaTexture );
        }
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudTex,
            transparent: true,
            opacity: planetData.cloudOpacity ?? 0.95,
            depthWrite: false,
            blending: THREE.NormalBlending,
            metalness: 0.0,
            roughness: 0.9,

        });
        if (alphaMapTex) {
            cloudMaterial.alphaMap = alphaMapTex;
        }

        const cloudGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
        const cloudsMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
        const scale = planetData.cloudScale ?? 1.025;
        cloudsMesh.scale.set(scale, scale, scale);
        planetMesh.userData.cloudsMesh = cloudsMesh;
        planetMesh.add(cloudsMesh);
    }
    const tail = new OrbitTail(planetMesh, scene, 800, { color: 0xF7F25B, opacity: 0.7 });
    orbitTails.push(tail);

    const labelObj = createLabel(planetData.englishName);
    planetMesh.add(labelObj);
    labelObj.element.addEventListener('click', () => {
        focusOnObject(planetMesh, camera, controls, state, 'SolarSystemScene');
    });
    labelObj.userData.shouldShow = true;
    planetMesh.userData.labelObject = labelObj;

    return planetMesh;

}