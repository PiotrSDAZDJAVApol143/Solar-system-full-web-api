// src/pages/Library/Planets/Jupiter/Jupiter.js
import React, { useEffect, useState } from 'react';
import Planet from '../../../../components/Planet/Planet';
import '../../../../components/Planet/Planet.css';
import axios from 'axios';
import {getScaleFactor} from "../../../../config";
import { focusOnObjectFromList } from "../../../../components/Planet/PlanetScene";

function Jupiter(){
    const [planetData, setPlanetData] = useState(null);
    useEffect(()=>{
        axios.get("http://localhost:8080/api/solarbodies/jupiter")
            .then(response => {
                const data = response.data;
                const textures = data.textures || {};
                const scaleFactor = getScaleFactor(data.semiMajorAxis);
                console.log("Obliczony scaleFactor:", scaleFactor, "dla semiMajorAxis:", data.semiMajorAxis);

                if (!scaleFactor || isNaN(scaleFactor)) {
                    console.error("Nieprawidłowy scaleFactor:", scaleFactor, "dla semiMajorAxis:", data.semiMajorAxis);
                }
                const jupiterRings = [
                    {
                        name: "Halo Ring",
                        // Wewnętrzna część pierścienia w 1.2 promienia planety
                        innerRadiusFactor: 1.2,
                        // Zewnętrzna przy 1.6 promienia planety
                        outerRadiusFactor: 1.6,
                        // Grubość pierścienia (osie Y) - do Cylinder/Ring geometry
                        thickness: 0.02,
                        // Przezroczystość
                        opacity: 0.4,
                        // Ścieżka do tekstury
                        texturePath: "assets/textures/jupiter/jupiter_ring_halo.png"
                    },
                    {
                        name: "Main Ring",
                        innerRadiusFactor: 1.6,
                        outerRadiusFactor: 1.8,
                        thickness: 0.02,
                        opacity: 0.6,
                        texturePath: "assets/textures/jupiter/jupiter_ring_main.png"
                    },
                    {
                        name: "Amalthea Gossamer Ring",
                        innerRadiusFactor: 1.8,
                        outerRadiusFactor: 2.2,
                        thickness: 0.02,
                        opacity: 0.3,
                        texturePath: "assets/textures/jupiter/jupiter_ring_amalthea.png"
                    },
                    {
                        name: "Thebe Gossamer Ring",
                        innerRadiusFactor: 2.2,
                        outerRadiusFactor: 3.0,
                        thickness: 0.02,
                        opacity: 0.2,
                        texturePath: "assets/textures/jupiter/jupiter_ring_thebe.png"
                    },
                ];

                const mappedData = {
                    name: data.englishName || 'Brak nazwy',
                    scaleFactor: scaleFactor,
                    bodyType: data.bodyType || null,
                    radius: data.meanRadius* scaleFactor,
                    axialTilt: data.axialTilt || 0,
                    semiMajorAxis: data.semiMajorAxis || null,
                    perihelion: data.perihelion || null,
                    aphelion: data.aphelion || null,
                    inclination: data.inclination || 0,
                    sunOrbitDuration: 129864,
                    mass: (data.mass * 100).toFixed(2),
                    vol: (data.vol * 100).toFixed(2),
                    escapeSpeed: data.escapeSpeed || null,
                    discoveredBy: data.discoveredBy || null,
                    discoveryDate: data.discoveryDate || null,
                    avgTemp: data.avgTemp ? (data.avgTemp - 273.15).toFixed(2) : null,
                    moonCount: data.moonCount || 0,
                    rotationAngle: 60,
                    texturePath: textures.surfaceTexture || null,
                    additionalTexture: textures.additionalTexture || null,
                    cloudTexture: textures.cloudTexture || null,
                    cloudRotationSpeed: 20,
                    cloudOpacity: 0.6,
                    cloudScale: 1.015,
                    additionalCloudTexture: textures.additionalCloudTexture || null,
                    normalMapPath: textures.normalMapTexture || null,
                    bumpMapPath: textures.bumpMapTexture || null,
                    aoMapPath: textures.ambientOcclusionMapTexture || null,
                    specularMapPath: textures.specularMapTexture || null,
                    cameraPosition: 10, // Dostosuj według potrzeb
                    rotationSpeed: data.rotationPeriod || 24,
                    sunDistance: data.semiMajorAxis *scaleFactor || 1, // Jednostki astronomiczne
                    sunRadius: 695700 * scaleFactor, // wielkosc slonca
                    flarePower: 300, // sila rozblysku
                    ambientLightPower: 1.6, // sila swiatła otoczenia
                    spaceHorizonDistance: 600000, // max wielkość bańki kosmosu
                    description: data.description || 'Czerwona Planeta',
                    moons: data.moons || [],
                    rings: jupiterRings, // Jeśli dostępne
                    orbitalPeriod: data.orbitalPeriod,
                    gravity: data.gravity,
                    rotationPeriod: data.rotationPeriod,
                    meanRadiusKm: data.meanRadius,
                    // Dodaj inne potrzebne właściwości
                };
                setPlanetData(mappedData);
            })
            .catch(error => {
                console.error('Błąd podczas pobierania danych planety:', error);
            });
    }, []);
    return (
        <div className="page">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8 planet-container" style={{height: '85vh'}}>
                        {planetData ? (
                            <Planet planetData={planetData} />
                        ) : (
                            <p>Ładowanie danych o planecie...</p>
                        )}
                    </div>
                    <div className="col-md-3 planet-info" id="planet-info" style={{height: '85vh', width: '30%'}}>
                        <h2> {planetData ? planetData.name : 'planecie'}:</h2>
                        {planetData ? (
                            <div>
                                <p><u>{planetData.description}</u></p>
                                <p>Średnica planety: {(planetData.meanRadiusKm * 2).toLocaleString('pl-PL')} km</p>
                                <p>Średnia odległość od
                                    Słońca: {planetData.semiMajorAxis ? planetData.semiMajorAxis.toLocaleString('pl-PL') : 'Brak danych'} km</p>
                                <p>Rok trwa: {planetData.orbitalPeriod} dni </p>
                                <p>Grawitacja: {planetData.gravity} m/s²</p>
                                <p>Średnia Temperatura: {planetData.avgTemp}°C
                                    / {planetData.avgTemp ? (parseFloat(planetData.avgTemp) + 273.15).toFixed(2) : null}°K</p>
                                <p>
                                    Doba
                                    trwa: {Math.abs(planetData.rotationPeriod).toLocaleString('pl-PL', {maximumFractionDigits: 2})} godzin
                                    /
                                    ({Math.abs(planetData.rotationPeriod / 24).toLocaleString('pl-PL', {maximumFractionDigits: 2})} dni)</p>
                                <p>Liczba księżyców: {planetData.moonCount}</p>
                                <p>Księżyce:</p>
                                <ul>
                                    {planetData.moons && planetData.moons.length > 0
                                        ? planetData.moons.map((moon, index) => (
                                            <li key={index}>
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    focusOnObjectFromList(moon.englishName); // Przejście do księżyca
                                                }}
                                                >
                                                    {moon.englishName}
                                                </a>
                                            </li>
                                        ))
                                        : "Brak księżyców"}
                                </ul>
                            </div>
                        ) : (
                            <p>Ładowanie danych o planecie...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Jupiter;