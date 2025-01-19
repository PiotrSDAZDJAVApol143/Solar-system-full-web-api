//src/config/planetsConfig.js

const planetsConfig = {
    Mercury: {
        sunOrbitDuration: 2638,
        flarePower: 1200,
        ambientLightPower: 2.5,
        description: 'Pierwsza planeta od Słońca',
    },
    Venus: {
        sunOrbitDuration: 10957.5,
        flarePower: 800,
        ambientLightPower: 1.8,
        description: 'Najgorętsza planeta Układu Słonecznego',
        cloudRotationSpeed: 120,
        cloudOpacity: 0.95,
        cloudScale: 1.035,
    },
    Earth: {
        sunOrbitDuration: 10957.5,
        flarePower: 600,
        ambientLightPower: 1.5,
        description: 'Nasz dom',
        cloudRotationSpeed: 20,
        cloudOpacity: 0.6,
        cloudScale: 1.015,
    },
    Mars: {
        sunOrbitDuration: 20610,
        flarePower: 400,
        ambientLightPower: 1.5,
        description: 'Czerwona Planeta',
    },
    Jupiter: {
        sunOrbitDuration: 129864,
        flarePower: 300,
        ambientLightPower: 1.1,
        description: 'Największa planeta Układu Słonecznego',
        rings: [
            {
                name: "Halo Ring",
                innerRadiusFactor: 1.2,
                outerRadiusFactor: 1.6,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/jupiter/jupiter_ring_halo.png"
            },
            {
                name: "Main Ring",
                innerRadiusFactor: 1.6,
                outerRadiusFactor: 1.8,
                thickness: 0.02,
                opacity: 0.6,
                texturePath: "assets/textures/jupiter/jupiter_ring_main.png"
            },
            {
                name: "Amalthea Gossamer Ring",
                innerRadiusFactor: 1.8,
                outerRadiusFactor: 2.2,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/jupiter/jupiter_ring_amalthea.png"
            },
            {
                name: "Thebe Gossamer Ring",
                innerRadiusFactor: 2.2,
                outerRadiusFactor: 3.0,
                thickness: 0.02,
                opacity: 0.2,
                texturePath: "assets/textures/jupiter/jupiter_ring_thebe.png"
            },
        ],
    },
    Saturn: {
        sunOrbitDuration: 10759,
        flarePower: 250,
        ambientLightPower: 0.9,
        description: 'Planeta z pierścieniami',
    },
    Uranus: {
        sunOrbitDuration: 30687,
        flarePower: 200,
        ambientLightPower: 0.8,
        description: 'Planeta lodowa',
    },
    Neptune: {
        sunOrbitDuration: 60190,
        flarePower: 150,
        ambientLightPower: 0.6,
        description: 'Najbardziej oddalona planeta',
    },
};

export default planetsConfig;