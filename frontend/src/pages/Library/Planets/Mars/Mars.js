// src/pages/Library/Planets/Mars/Mars.js

import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Mars(){
    return <PlanetInfoPage planetName="Mars" apiUrl="http://localhost:8080/api/solarbodies/mars" />;
}
export default Mars;