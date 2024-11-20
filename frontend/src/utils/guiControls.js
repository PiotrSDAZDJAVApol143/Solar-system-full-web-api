//src/utils/guiControls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

export function initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCamera, container) {
    const gui = new GUI();

    const namesFolder = gui.addFolder('Księżyce');
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

    const smallMoonsCheckbox = namesFolder.add(guiParams, 'showSmallMoons')
        .name('małe')
        .onChange(() => {
            toggleObjectNames();
        });

    const mediumMoonsCheckbox = namesFolder.add(guiParams, 'showMediumMoons')
        .name('średnie')
        .onChange(() => {
            toggleObjectNames();
        });

    const largeMoonsCheckbox = namesFolder.add(guiParams, 'showLargeMoons')
        .name('duże')
        .onChange(() => {
            toggleObjectNames();
        });

    namesFolder.open();


    namesFolder.add(guiParams, 'showOrbitTails')
        .name('Pokaż ogony orbity')
        .onChange((value) => {
            orbitTails.forEach(tail => {
                if (value) {
                    tail.show();
                } else {
                    tail.hide();
                    tail.tailPoints = [];
                }
            });
        });


    gui.add({ stopFollowing: resetCamera }, 'stopFollowing').name('Zatrzymaj śledzenie');

    // Ustawienie pozycji GUI w górnym lewym rogu
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