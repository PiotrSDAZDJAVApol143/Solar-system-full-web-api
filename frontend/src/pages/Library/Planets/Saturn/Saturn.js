// src/pages/Library/Planets/Saturn/Saturn.js

import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";

function Saturn(){
    return <PlanetInfoPage planetName="Saturn" apiUrl="http://localhost:8080/api/solarbodies/saturn" />;
}
export default Saturn;