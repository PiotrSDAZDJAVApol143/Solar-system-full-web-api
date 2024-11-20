// src/components/Library.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Library.css';

function Library() {
    const planets = [
        { name: 'Słońce', path: '/sun'},
        { name: 'Merkury', path: '/mercury' },
        { name: 'Wenus', path: '/venus' },
        { name: 'Ziemia', path: '/earth' },
        { name: 'Mars', path: '/mars' },
        { name: 'Jowisz', path: '/jupiter' },
        { name: 'Saturn', path: '/saturn' },
        { name: 'Uran', path: '/uranus' },
        { name: 'Neptun', path: '/neptune' },
    ];

    return (
        <div className="page">
            <div className="content-wrapper">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 content-column">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
                            );
                            }

                            export default Library;