// src/pages/Library/Planets/Mercury/Venus.js
import React, { useEffect, useState } from 'react';
import Planet from '../../../../components/Planet/Planet';
import '../../../../components/Planet/Planet.css';
import axios from 'axios';
import {getScaleFactor} from "../../../../config/config";
import PlanetInfoPage from "../../../../components/Planet/PlanetInfoPage";
function Venus(){
    return <PlanetInfoPage planetName="Venus" apiUrl="http://localhost:8080/api/solarbodies/venus" />;
}


export default Venus;