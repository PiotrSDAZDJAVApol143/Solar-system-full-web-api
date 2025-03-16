//src/utils/guiControls.js
import GUI from 'lil-gui';

export function initializeGUI(guiMode,guiParams, toggleObjectNames, orbitTails, resetCameraFunction, container) {
    const gui = new GUI();
    // 1) Zawsze: prędkość czasu
    const timeSpeedOptions = {
        "1x": 1,
        "500x": 500,
        "1 000x": 1000,
        "5 000x": 5000,
        "50 000x": 50000,
        "100 000x": 100000,
        "500 000x": 500000
    };
    gui.add(guiParams, 'timeScale', timeSpeedOptions)
        .name('Prędkość czasu')
        .onChange(value => {
            console.log("Ustawiono prędkość czasu na:", value);
        });
    if (guiMode === 'soloPlanet') {
        const namesFolder = gui.addFolder('Księżyce');

        const smallMoonsCheckbox = namesFolder.add(guiParams, 'showSmallMoons')
            .name('małe')
            .onChange(() => toggleObjectNames());

        const mediumMoonsCheckbox = namesFolder.add(guiParams, 'showMediumMoons')
            .name('średnie')
            .onChange(() => toggleObjectNames());

        const largeMoonsCheckbox = namesFolder.add(guiParams, 'showLargeMoons')
            .name('duże')
            .onChange(() => toggleObjectNames());

        const showObjectNamesCheckbox = namesFolder.add(guiParams, 'showObjectNames')
            .name('Pokaż nazwy księżyców:')
            .onChange((value) => {
                guiParams.showSmallMoons = value;
                guiParams.showMediumMoons = value;
                guiParams.showLargeMoons = value;
                toggleObjectNames();

                smallMoonsCheckbox.updateDisplay();
                mediumMoonsCheckbox.updateDisplay();
                largeMoonsCheckbox.updateDisplay();
            });

        namesFolder.add(guiParams, 'showOrbitTails')
            .name('Pokaż ogony orbity')
            .onChange((value) => {
                orbitTails.forEach(tail => {
                    if (value) tail.show();
                    else {
                        tail.hide();
                        tail.tailPoints = [];
                    }
                });
            });
    }
    else if (guiMode === 'solarSystem') {
        const labelsFolder = gui.addFolder('Mazwy Planet');
        labelsFolder.add(guiParams, 'showObjectNames')
            .name('Wyświetl nazwy planet')
            .onChange(() => {
                toggleObjectNames();
            });
        const orbitFolder = gui.addFolder('Orbity');
        orbitFolder.add(guiParams, 'orbitStatic')
            .name('Orbita Stała')
            .listen()  // .listen() by w locie widzieć zmianę
            .onChange((val) => {
                if (val) {
                    // jeśli user kliknął stała, to wyłącz ruchoma
                    guiParams.orbitDynamic = false;
                }
            });
        orbitFolder.add(guiParams, 'orbitDynamic')
            .name('Orbita Ruchoma')
            .listen()
            .onChange((val) => {
                if (val) {
                    guiParams.orbitStatic = false;
                }
            });
    }

    gui.add({ resetCamera: resetCameraFunction }, 'resetCamera').name('Zatrzymaj śledzenie');

    if (container) {
        container.appendChild(gui.domElement);
    } else {
        document.body.appendChild(gui.domElement);
    }
    gui.domElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.borderRadius = '10px';
    gui.domElement.style.top = '10px';
    gui.domElement.style.left = '10px';

    return gui;
}