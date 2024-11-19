// src/components/Library.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Library.css';

function Library() {
    const planets = [
        { name: 'Mercury', path: '/mercury' },
        { name: 'Venus', path: '/venus' },
        { name: 'Earth', path: '/earth' },
        { name: 'Mars', path: '/mars' },
        { name: 'Jupiter', path: '/jupiter' },
        { name: 'Saturn', path: '/saturn' },
        { name: 'Uranus', path: '/uranus' },
        { name: 'Neptune', path: '/neptune' },
    ];

    return (
        <div className="library">
            <h1>Biblioteka Astralna</h1>
            <div className="grid-container">
                {planets.map(planet => (
                    <Link key={planet.name} to={planet.path} className="planet-button">
                        {planet.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Library;