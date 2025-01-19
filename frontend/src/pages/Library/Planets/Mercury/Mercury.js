// src/pages/Mercury/Mercury.js

import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Mercury() {
    return <PlanetInfoPage planetName="Mercury" apiUrl="http://localhost:8080/api/solarbodies/mercury" />;
}


export default Mercury;