// src/pages/Mercury/Mercury.js
import React, { useEffect, useState } from 'react';
import Planet from '../../components/Planet/Planet';
import './Mercury.css';
import axios from 'axios';

const mercuryData = {
    name: 'Merkury',
    radius: 3.83,
    axialTilt: -0.034,
    rotationAngle: -180,
    texturePath: "assets/textures/mercury/mercury_surface.jpg",
    normalMapPath: "assets/textures/mercury/mercury_surface2_NRM.jpg",
    bumpMapPath: null, // Jeśli nie masz bump mapy, ustaw na null
    aoMapPath: null,   // Jeśli nie masz AO mapy, ustaw na null
    specularMapPath: null, // Jeśli nie masz specular mapy, ustaw na null
    cameraPosition: 10,
    rotationSpeed: 1765, // Długość dnia na Merkurym (w godzinach)
    sunDistance: 90890,
    sunRadius: 1093,
    flarePower: 900,
    ambientLightPower: 5,
    spaceHorizonDistance: 500000,
    description: 'Merkury jest pierwszą planetą od Słońca...',
    moons: [], // Merkury nie ma księżyców
    rings: null, // Merkury nie ma pierścieni
};
function Mercury() {
    const [planetData, setPlanetData] = useState(null);
    useEffect(() => {
        // Pobierz dane z backendu
        axios.get('http://localhost:8080/api/solarbodies/mercury')
            .then(response => {
                const data = response.data;
                // Przetwórz dane, aby dopasować je do oczekiwanego formatu
                const mappedData = {
                    name: data.englishName || 'Brak nazwy',
                    bodyType: data.bodyType || null,
                    radius: data.meanRadius / 6371, // Normalizacja do promieni Ziemi
                    axialTilt: data.axialTilt || 0,
                    semiMajorAxis: data.semiMajorAxis || null,
                    perihelion: data.perihelion || null,
                    aphelion: data.aphelion || null,
                    inclination: data.inclination || 0,
                    mass: (data.mass * 100).toFixed(4),
                    vol: (data.vol * 100).toFixed(4),
                    escapeSpeed: data.escapeSpeed || null,
                    discoveredBy: data.discoveredBy || null,
                    discoveryDate: data.discoveryDate || null,
                    avgTemp: data.avgTemp ? (data.avgTemp - 273.15).toFixed(2) : null,
                    moonCount: data.moonCount || 0,
                    rotationAngle: 0, // Domyślna wartość lub z danych
                    texturePath: data.textures.surfaceTexture || null,
                    normalMapPath: data.textures.normalMapTexture || null,
                    bumpMapPath: data.textures.bumpMapTexture || null,
                    aoMapPath: data.textures.ambientOcclusionMapTexture || null,
                    specularMapPath: data.textures.specularMapTexture || null,
                    cameraPosition: 10, // Dostosuj według potrzeb
                    rotationSpeed: data.rotationPeriod || 24, // Dostosuj według potrzeb
                    sunDistance: data.semiMajorAxis / 149597870.7 || 1, // Jednostki astronomiczne
                    sunRadius: 1093, // Dostosuj według potrzeb
                    flarePower: 900, // Dostosuj według potrzeb
                    ambientLightPower: 5, // Dostosuj według potrzeb
                    spaceHorizonDistance: 500000, // Dostosuj według potrzeb
                    description: data.description || 'Pierwsza planeta od Słońca',
                    moons: data.moons || [], // Dostosuj według potrzeb
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
                        <Planet planetData={mercuryData}/>
                    </div>
                    <div className="col-md-3 planet-info" id="planet-info">
                        <h2> {planetData ? planetData.name : 'planecie'}:</h2>
                        {planetData ? (
                            <div>
                                <p>{planetData.description}</p>
                                <p>Średni promień: {planetData.meanRadiusKm} km</p>
                                <p>Średnia odległość od
                                    Słońca: {planetData.semiMajorAxis ? planetData.semiMajorAxis.toLocaleString('pl-PL') : 'Brak danych'} km</p>
                                <p>Masa: {planetData.mass}% masy Ziemi</p>
                                <p>Objętość: {planetData.vol}% objętości Ziemi</p>
                                <p>Okres orbitalny: {planetData.orbitalPeriod} dni ziemskich</p>
                                <p>Grawitacja: {planetData.gravity} m/s²</p>
                                <p>Średnia Temperatura: {planetData.avgTemp}°C
                                    / {planetData.avgTemp ? (parseFloat(planetData.avgTemp) + 273.15).toFixed(2) : null}°K</p>
                                <p>Okres rotacji: {planetData.rotationPeriod} godzin ziemskich</p>
                                <p>Liczba księżyców: {planetData.moonCount}</p>
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


export default Mercury;