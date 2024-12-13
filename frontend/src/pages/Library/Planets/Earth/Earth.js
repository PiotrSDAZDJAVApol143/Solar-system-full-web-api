// src/pages/Library/Planets/Earth/Earth.js
import React, { useEffect, useState } from 'react';
import Planet from '../../../../components/Planet/Planet';
import '../../../../components/Planet/Planet.css';
import axios from 'axios';
import {getScaleFactor} from "../../../../config";

function Earth(){
    const [planetData, setPlanetData] = useState(null);
    useEffect(()=>{
        axios.get("http://localhost:8080/api/solarbodies/earth")
            .then(response => {
                const data = response.data;
                const textures = data.textures || {};
                const scaleFactor = getScaleFactor(data.semiMajorAxis);
                console.log("Obliczony scaleFactor:", scaleFactor, "dla semiMajorAxis:", data.semiMajorAxis);

                if (!scaleFactor || isNaN(scaleFactor)) {
                    console.error("Nieprawidłowy scaleFactor:", scaleFactor, "dla semiMajorAxis:", data.semiMajorAxis);
                }

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
                    sunOrbitDuration: 10957.5,
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
                    flarePower: 600, // sila rozblysku
                    ambientLightPower: 2, // sila swiatła otoczenia
                    spaceHorizonDistance: 600000, // max wielkość bańki kosmosu
                    description: data.description || 'Nasz dom',
                    moons: data.moons || [],
                    rings: null, // Jeśli dostępne
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
                                <p>Księżyce: {
                                    planetData.moons && planetData.moons.length > 0
                                        ? planetData.moons.map(moon => moon.englishName).join(', ')
                                        : 'Brak księżyców'
                                }</p>
                            </div>
                        ) : (
                            <p>Ładowanie danych o planecie...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}export default Earth;