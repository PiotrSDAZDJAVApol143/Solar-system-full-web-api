// src/pages/Library/Planets/Earth/Earth.js

import React, { useEffect, useState } from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Earth(){
    return <PlanetInfoPage planetName="Earth" apiUrl="http://localhost:8080/api/solarbodies/earth" />;
}
export default Earth;