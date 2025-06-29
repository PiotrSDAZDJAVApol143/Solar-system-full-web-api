// src/pages/Library/Planets/Mercury/Venus.js
import React from 'react';
import '../../../../components/Planet/Planet.css';
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";
function Venus(){
  //  return <PlanetInfoPage planetName="Venus" apiUrl="http://localhost:8080/api/solarbodies/venus" />;
    return <PlanetInfoPage planetName="Venus" apiUrl="/api/solarbodies/venus" />;
}


export default Venus;