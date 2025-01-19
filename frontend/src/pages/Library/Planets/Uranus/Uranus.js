// src/pages/Library/Planets/Uranus/Uranus.js
import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Uranus(){
    return <PlanetInfoPage planetName="Uranus" apiUrl="http://localhost:8080/api/solarbodies/uranus" />;
}

export default Uranus;