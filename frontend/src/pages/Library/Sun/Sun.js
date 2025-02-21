// src/pages/Library/Sun/Sun.js
import React, { useEffect, useState } from 'react';
import Star from '../../../components/Star/Star';
import '../../../components/Planet/Planet.css';
import axios from 'axios';
import {getScaleFactor} from "../../../config/config";
function Sun(){
    const [planetData, setPlanetData] = useState(null);
    useEffect(() => {
        // Pobierz dane z backendu
        axios.get('http://localhost:8080/api/solarbodies/sun')
            .then(response => {
                const data = response.data;
                const textures = data.textures || {};
                const scaleFactor = getScaleFactor(data.semiMajorAxis);

                // Przetwórz dane, aby dopasować je do oczekiwanego formatu
                const mappedData = {
                    name: data.englishName || 'Brak nazwy',
                    bodyType: data.bodyType || null,
                    radius: data.meanRadius* scaleFactor,
                    axialTilt: data.axialTilt || 0,
                    semiMajorAxis: data.semiMajorAxis || null,
                    perihelion: data.perihelion || null,
                    aphelion: data.aphelion || null,
                    inclination: data.inclination || 0,
                    sunOrbitDuration: 0,
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
                    cloudRotationSpeed: 120,
                    cloudOpacity: 0.95,
                    cloudScale: 1.035,
                    additionalCloudTexture: textures.additionalCloudTexture || null,
                    normalMapPath: textures.normalMapTexture || null,
                    bumpMapPath: textures.bumpMapTexture || null,
                    aoMapPath: textures.ambientOcclusionMapTexture || null,
                    specularMapPath: textures.specularMapTexture || null,
                    cameraPosition: 1300, // Dostosuj według potrzeb
                    rotationSpeed: data.rotationPeriod || 24,
                    sunDistance: data.semiMajorAxis *scaleFactor || 1, // Jednostki astronomiczne
                    sunRadius: 695700 * scaleFactor, // wielkosc slonca
                    flarePower: 1200, // sila rozblysku
                    ambientLightPower: 5.8, // sila swiatła otoczenia
                    spaceHorizonDistance: 600000, // max wielkość bańki kosmosu
                    description: data.description || 'Nasza gwiazda',
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
                            <Star planetData={planetData} />
                        ) : (
                            <p>Ładowanie danych o planecie...</p>
                        )}
                    </div>
                    <div className="col-md-3 planet-info" id="planet-info" style={{height: '85vh', width: '30%'}}>
                        <h2> {planetData ? planetData.name : 'planecie'}:</h2>
                        {planetData ? (
                            <div>
                                <p><u>{planetData.description}</u></p>
                                <p>Średnica: {(planetData.meanRadiusKm * 2).toLocaleString('pl-PL')} km</p>
                                <p>Masa: {parseFloat(planetData.mass).toLocaleString('pl-PL')}% masy Ziemi</p>
                                <p>Objętość: {parseFloat(planetData.vol).toLocaleString('pl-PL')}% objętości Ziemi</p>
                                <p>Grawitacja: {planetData.gravity} m/s²</p>
                                <p>Średnia Temperatura: {planetData.avgTemp}°C
                                    / {planetData.avgTemp ? (parseFloat(planetData.avgTemp) + 273.15).toFixed(2) : null}°K</p>
                                <p>
                                    Doba trwa: {Math.abs(planetData.rotationPeriod).toLocaleString('pl-PL', {maximumFractionDigits: 2})} godzin ziemskich /
                                    ({Math.abs(planetData.rotationPeriod / 24).toLocaleString('pl-PL', {maximumFractionDigits: 2})} dni)</p>
                                {/* Dodaj inne dane według potrzeb */}
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


export default Sun;