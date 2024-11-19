// src/components/Home.js
import React from 'react';

import './Home.css';


function Home() {
    return (
        <div className="page">
            <div className="content-wrapper">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-12 content-column">
                            <div className="overlay-text">
                                <h1>UKŁAD SŁONECZNY I JEGO TAJEMNICE</h1>
                                <p>
                                    Na tej stronie dowiesz się o faktach i śmiesznych ciekawostkach związanych z naszym Układem Słonecznym.
                                </p>
                                <p>
                                    Model Układu Słonecznego wygenerowany został w skali, aby odwzorować realizm.
                                </p>
                                <p>
                                    Wciąż pracuję nad udoskonaleniem strony, aby dawała przyjemność z nabywania wiedzy :)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;