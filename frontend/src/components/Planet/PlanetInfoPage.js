// src/components/Planet/PlanetInfoPage.js
import React, { useEffect, useState } from 'react';
import Planet from './Planet';
import './Planet.css';
import axios from 'axios';
import { getScaleFactor } from "../../config/config";
import { focusOnObjectFromList } from "./PlanetScene";
import planetsConfig from "../../config/planetsConfig";
import {formatDaysToTime, formatHoursToTime} from "../../utils/formatUtils";

function PlanetInfoPage({ planetName, apiUrl }) {
    const [planetData, setPlanetData] = useState(null);
    const [currentObject, setCurrentObject] = useState('PLANET');

    useEffect(() => {
        const handleStopFollowing = () => {
            setCurrentObject('PLANET');
        };

        // Nasłuchiwanie zdarzenia
        window.addEventListener('stopFollowingEvent', handleStopFollowing);

        // Czyszczenie nasłuchiwania podczas odmontowania komponentu
        return () => {
            window.removeEventListener('stopFollowingEvent', handleStopFollowing);
        };
    }, []);

    useEffect(() => {
        axios.get(apiUrl)
            .then(response => {
                const data = response.data;
                const textures = data.textures || {};
                const scaleFactor = getScaleFactor(data.semiMajorAxis);

                const planetConfig = planetsConfig[planetName] || {};

                if (data.moons) {
                    data.moons = data.moons.map(m => ({
                        ...m,
                        name: m.englishName || 'Moon',
                        meanRadiusKm: m.meanRadius,
                        distance: m.semimajorAxis,
                        orbitDuration: m.orbitalPeriod,
                        rotationDuration: m.rotationPeriod,
                        avgTemp: m.avgTemp,
                        discoveredBy: m.discoveredBy || "Nieznany",
                        discoveryDate: m.discoveryDate || "Brak danych",
                        eccentricity: m.eccentricity || 0,
                        inclination: m.inclination || 0,
                        axialTilt: m.axialTilt || 0,
                        escapeSpeed: m.escapeSpeed || 0,
                    }));
                }

                setPlanetData({
                    name: data.englishName || planetName,
                    scaleFactor: scaleFactor,
                    bodyType: data.bodyType || null,
                    radius: data.meanRadius * scaleFactor,
                    axialTilt: data.axialTilt || 0,
                    semiMajorAxis: data.semiMajorAxis || null,
                    perihelion: data.perihelion || null,
                    aphelion: data.aphelion || null,
                    inclination: data.inclination || 0,
                    sunOrbitDuration: planetConfig.sunOrbitDuration || data.orbitalPeriod,
                    mass: data.mass ? (data.mass * 100).toFixed(2) : null,
                    vol: data.vol ? (data.vol * 100).toFixed(2) : null,
                    escapeSpeed: data.escapeSpeed || null,
                    discoveredBy: data.discoveredBy || null,
                    discoveryDate: data.discoveryDate || null,
                    avgTemp: data.avgTemp ? (data.avgTemp - 273.15).toFixed(2) : null,
                    moonCount: data.moonCount || 0,
                    rotationAngle: 60,
                    rotationSpeed: data.rotationPeriod,
                    texturePath: textures.surfaceTexture || null,
                    additionalTexture: textures.additionalTexture || null,
                    cloudTexture: textures.cloudTexture || null,
                    normalMapPath: textures.normalMapTexture || null,
                    bumpMapPath: textures.bumpMapTexture || null,
                    aoMapPath: textures.ambientOcclusionMapTexture || null,
                    specularMapPath: textures.specularMapTexture || null,
                    cloudRotationSpeed: planetConfig.cloudRotationSpeed || null,//120,
                    cloudOpacity: planetConfig.cloudOpacity || null,//0.95,
                    cloudScale: planetConfig.cloudScale || null,//1.035,
                    cameraPosition: (data.radius *2) * 1.2,
                    moons: data.moons || [],
                    rings: planetConfig.rings || data.rings || null,
                    sunDistance: data.semiMajorAxis *scaleFactor || 1, // Jednostki astronomiczne
                    sunRadius: 695700 * scaleFactor, // wielkosc slonca
                    spaceHorizonDistance: 600000,
                    flarePower: planetConfig.flarePower || 100,
                    orbitalPeriod: data.orbitalPeriod,
                    ambientLightPower: planetConfig.ambientLightPower || 1,
                    gravity: data.gravity,
                    rotationPeriod: data.rotationPeriod,
                    meanRadiusKm: data.meanRadius,
                    description: planetConfig.description || `${planetName} jest jedną z planet Układu Słonecznego.`,
                });
            })
            .catch(error => {
                console.error(`Błąd podczas pobierania danych planety ${planetName}:`, error);
            });
    }, [apiUrl, planetName]);

    const handleShowPlanet = () => setCurrentObject('PLANET');
    const handleShowMoon = (moonName) => setCurrentObject(moonName);

    const renderInfo = () => {
        if (!planetData) {
            return <p>Ładowanie danych o planecie...</p>;
        }

        if (currentObject === 'PLANET') {
            return (
                <div>
                    <p><u>{planetData.description}</u></p>
                    <p>Średnica planety: {(planetData.meanRadiusKm * 2)?.toLocaleString('pl-PL')} km</p>
                    <p>Średnia odległość od Słońca: {Math.abs(planetData.semiMajorAxis)?.toLocaleString('pl-PL')} km</p>
                    <p>Masa: {planetData.mass}% masy Ziemi</p>
                    <p>Objętość: {planetData.vol}% objętości Ziemi</p>
                    <p>Rok trwa: {Math.abs(planetData.orbitalPeriod).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} dni ziemskich / ({Math.abs(planetData.orbitalPeriod / 365).toLocaleString('pl-PL', {maximumFractionDigits: 2})} lat ziemskich)  </p>
                    <p>Doba trwa: {Math.abs(planetData.rotationPeriod).toLocaleString('pl-PL', {maximumFractionDigits: 2})} godzin
                        ziemskich / ({formatHoursToTime(planetData.rotationPeriod)})</p>
                    <p>Grawitacja: {planetData.gravity} m/s²</p>
                    <p>Średnia Temperatura: {planetData.avgTemp}°C</p>
                    <p>Liczba księżyców: {planetData.moonCount}</p>
                    <p>Księżyce:</p>
                    <ul>
                        {planetData.moons.map((moon, index) => (
                            <li key={index}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        focusOnObjectFromList(moon.name);
                                        handleShowMoon(moon.name);
                                    }}
                                >
                                    {moon.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        const foundMoon = planetData.moons.find(m => m.name === currentObject);
        if (!foundMoon) {
            return <p>Nie znaleziono księżyca o nazwie: {currentObject}</p>;
        }

        return (
            <div>
                <h2>Księżyc: {foundMoon.name}</h2>
                <p>Średnica: {(foundMoon.meanRadiusKm * 2)?.toLocaleString('pl-PL')} km</p>
                <p>Odległość od swojej planety: {foundMoon.distance?.toLocaleString('pl-PL')} km</p>
                <p>Średnia Temperatura: {foundMoon.avgTemp - 273.15}°C  /  ({foundMoon.avgTemp}°K)</p>
                <p>Nachylenie orbity: {foundMoon.inclination}°</p>
                <p>Okres obrotu wokół własnej osi: {formatHoursToTime(foundMoon.rotationPeriod)}</p>
                <p>Okres obiegu wokół planety: {formatDaysToTime(foundMoon.orbitDuration)}</p>
                <p>Grawitacja: {foundMoon.gravity} m/s²</p>
                <p>Odkryty przez: {foundMoon.discoveredBy}</p>
                <p>Data odkrycia: {foundMoon.discoveryDate}</p>
                <p>
                    Krąży wokół:
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            focusOnObjectFromList(planetData.name);
                            handleShowPlanet();
                        }}
                    >
                         {planetData.name}
                    </a>
                </p>
            </div>
        );
    };

    return (
        <div className="page">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-8 planet-container" style={{ height: '85vh' }}>
                        {planetData ? <Planet planetData={planetData} /> : <p>Ładowanie danych...</p>}
                    </div>
                    <div className="col-md-3 planet-info" id="planet-info" style={{ height: '85vh', width: '30%' }}>
                        <h2>{planetData ? planetData.name : 'Planeta'}:</h2>
                        {renderInfo()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlanetInfoPage;