// src/pages/Library/Planets/Jupiter/Jupiter.js
import React from 'react';

import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Jupiter(){
    return <PlanetInfoPage planetName="Jupiter" apiUrl="http://localhost:8080/api/solarbodies/jupiter" />;
}

export default Jupiter;