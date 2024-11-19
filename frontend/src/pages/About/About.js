// src/pages/About/About.js
import React from 'react';
import './About.css';

function About() {
    return (
        <div className="page">
            <div className="content-wrapper">
                <div className="overlay-text">
                    <h1>O MNIE</h1>
                    <p>
                        Cześć! Mam na imię Piotr i jestem początkującym programistą, który stawia pierwsze kroki w świecie kodowania. W 2024 roku ukończyłem kurs "Backend Java od podstaw" w Software Development Academy, co pozwoliło mi zyskać solidne fundamenty w programowaniu. Moja przygoda z programowaniem rozpoczęła się jednak wcześniej, w 2023 roku, kiedy zacząłem uczyć się samodzielnie z różnych źródeł, takich jak kursy na YouTube i Udemy oraz książki.
                    </p>
                    <p>
                        Od kilku miesięcy zgłębiam JavaScript, Three.js oraz podstawy modelowania w Blenderze, co pozwala mi rozwijać się w kierunku tworzenia interaktywnych wizualizacji i animacji 3D. Zawodowo jestem magistrem Ekonomii i pracuję jako spedytor od 13 lat, ale programowanie stało się moją prawdziwą pasją, którą realizuję z entuzjazmem i zaangażowaniem.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
