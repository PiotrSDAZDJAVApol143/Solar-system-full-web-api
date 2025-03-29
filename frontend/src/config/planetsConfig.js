//src/config/planetsConfig.js

const planetsConfig = {
    Mercury: {
        sunOrbitDuration: 2638,
        flarePower: 1000,
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
        cloudAlphaTexture: "/assets/textures/earth/earth_cloud_Alpha.png",
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
                innerRadiusFactor: 1.316,
                outerRadiusFactor: 1.752,
                thickness: 0.02,
                opacity: 0.15,
                texturePath: "assets/textures/jupiter/jupiter_ring_halo.png"
            },
            {
                name: "Main Ring",
                innerRadiusFactor: 1.752,
                outerRadiusFactor: 1.846,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/jupiter/jupiter_ring_main.png"
            },
            {
                name: "Amalthea Gossamer Ring",
                innerRadiusFactor: 1.846,
                outerRadiusFactor: 2.603,
                thickness: 0.02,
                opacity: 0.1,
                texturePath: "assets/textures/jupiter/jupiter_ring_amalthea.png"
            },
            {
                name: "Thebe Gossamer Ring",
                innerRadiusFactor: 2.846,
                outerRadiusFactor: 3.232,
                thickness: 0.02,
                opacity: 0.05,
                texturePath: "assets/textures/jupiter/jupiter_ring_thebe.png"
            },
        ],
    },
    Saturn: {
        sunOrbitDuration: 10759,
        flarePower: 250,
        ambientLightPower: 0.9,
        description: 'Planeta z pierścieniami',
        rings: [
            {
                name: "PlanetRing",
                innerRadiusFactor: 1.15,
                outerRadiusFactor: 2.8,
                thickness: 0.02,
                opacity: 0.85,
                texturePath: "assets/textures/saturn/saturn_ring_alpha.png"
            }
        ],
    },
    Uranus: {
        sunOrbitDuration: 30687,
        flarePower: 200,
        ambientLightPower: 0.8,
        description: 'Planeta lodowa',
        rings: [
            {
                name: "Ring 6",
                innerRadiusFactor: 1.649,
                outerRadiusFactor: 1.651,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Ring 5",
                innerRadiusFactor: 1.663,
                outerRadiusFactor: 1.667,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Ring 4",
                innerRadiusFactor: 1.678,
                outerRadiusFactor: 1.680,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Alpha",
                innerRadiusFactor: 1.760,
                outerRadiusFactor: 1.770,
                thickness: 0.02,
                opacity: 0.5,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Beta",
                innerRadiusFactor: 1.798,
                outerRadiusFactor: 1.810,
                thickness: 0.02,
                opacity: 0.5,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Eta",
                innerRadiusFactor: 1.858,
                outerRadiusFactor: 1.860,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Gamma",
                innerRadiusFactor: 1.876,
                outerRadiusFactor: 1.880,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Delta",
                innerRadiusFactor: 1.902,
                outerRadiusFactor: 1.906,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Lambda",
                innerRadiusFactor: 1.971,
                outerRadiusFactor: 1.973,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            },
            {
                name: "Epsilon",
                innerRadiusFactor: 2.008,
                outerRadiusFactor: 2.085,
                thickness: 0.02,
                opacity: 0.7,
                texturePath: "assets/textures/uranus/Uranus_rings.png"
            }
        ],
    },
    Neptune: {
        sunOrbitDuration: 60190,
        flarePower: 150,
        ambientLightPower: 0.6,
        description: 'Najbardziej oddalona planeta',
        rings: [
            {
                name: "PlanetRing",
                innerRadiusFactor: 1.702,
                outerRadiusFactor: 1.784,
                thickness: 0.02,
                opacity: 0.4,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            },
            {
                name: "PlanetRing",
                innerRadiusFactor: 2.162,
                outerRadiusFactor: 2.167,
                thickness: 0.02,
                opacity: 0.6,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            },
            {
                name: "PlanetRing",
                innerRadiusFactor: 2.242,
                outerRadiusFactor: 2.405,
                thickness: 0.02,
                opacity: 0.3,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            },
            {
                name: "PlanetRing",
                innerRadiusFactor: 2.324,
                outerRadiusFactor: 2.328,
                thickness: 0.02,
                opacity: 0.5,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            },
            {
                name: "PlanetRing",
                innerRadiusFactor: 2.515,
                outerRadiusFactor: 2.519,
                thickness: 0.02,
                opacity: 0.5,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            },
            {
                name: "PlanetRing",
                innerRadiusFactor: 2.556,
                outerRadiusFactor: 2.557,
                thickness: 0.02,
                opacity: 0.7,
                texturePath: "assets/textures/neptune/neptune_ring.png"
            }
        ],
    },
};

export default planetsConfig;