package org.example.solarapi.model;

import java.util.Date;

public class Asteroid {
    private Long idNumber;
    private String englishName;
    private String bodyType;
    private boolean isPlanet;
    //Półwiększa oś orbity.
    //Wyjaśnienie: To jest odległość pomiędzy środkiem elipsy orbity a jej dalekim punktem.
    private Long semimajorAxis;
    //Peryhelium.
    //Wyjaśnienie: Jest to najbliższy punkt w orbicie planetoidy do Słońca.
    private Long perihelion;
    //Aphelium.
    //Wyjaśnienie: Jest to najdalszy punkt w orbicie planetoidy od Słońca.
    private Long aphelion;
    //Inklinacja.
    //Wyjaśnienie: To jest kąt pomiędzy płaszczyzną orbity a płaszczyzną ekliptyki (równik niebieski).
    private Double inclination;
    //Wartość masy.
    //Wyjaśnienie: Liczba reprezentująca wartość masy.
    private Double massValue;
    //Wykładnik masy.
    //Wyjaśnienie: Wykładnik potęgi 10, do której należy przemnożyć massValue, aby uzyskać masę w jednostkach podstawowych.
    private Double massExponent;
    //Wartość objętości.
    //Wyjaśnienie: Liczba reprezentująca wartość objętości.
    private Double volValue;
    //Wykładnik objętości.
    //Wyjaśnienie: Wykładnik potęgi 10, do której należy przemnożyć volValue, aby uzyskać objętość w jednostkach podstawowych.
    private Double volExponent;
    // Grawitacja.
    //Wyjaśnienie: To jest przyspieszenie grawitacyjne na powierzchni planetoidy wyrażone w jednostkach przyspieszenia.
    private Double gravity;
    //Prędkość ucieczki w m/s.
    //Wyjaśnienie: Minimalna prędkość, którą obiekt musiałby osiągnąć, aby uniknąć zbliżania się do planetoidy.
    private Double escape;
    //Promień średni.
//Wyjaśnienie: Średni promień planetoidy.
    private Double meanRadius;
    //Promień równikowy.
    //Wyjaśnienie: Promień planetoidy mierzony w płaszczyźnie równika.
    private Double equaRadius;
    //Promień biegunowy.
    //Wyjaśnienie: Promień planetoidy mierzony wzdłuż osi biegunowej.
    private Double polarRadius;
    //Okres obiegu sideralnego.
    //Wyjaśnienie: Czas, jaki trwa pełny obrót wokół Słońca
    private Double sideralOrbit;
    //Okres rotacji sideralnej.
    //Wyjaśnienie: Czas, jaki trwa pełny obrót wokół własnej osi w odniesieniu do gwiazd
    private Double sideralRotation;
    private String discoveredBy;
    private Date discoveryDate;
    private String alternativeName;
    //nachylenie osi
    private Double axialTilt;
    //temeratura w Farenhaitach
    private Double avgTemp;

}
