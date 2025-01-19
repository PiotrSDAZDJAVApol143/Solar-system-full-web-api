// src/pages/Library/Planets/Neptune/Neptune.js

import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Neptune(){
    return <PlanetInfoPage planetName="Neptune" apiUrl="http://localhost:8080/api/solarbodies/neptune" />;
}

export default Neptune;