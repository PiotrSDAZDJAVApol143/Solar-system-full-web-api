//src/utils/guiControls.js
import GUI from 'lil-gui';

export function initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCameraFunction, container) {
    const gui = new GUI();

    const namesFolder = gui.addFolder('Księżyce');

    const timeSpeedOptions = {
        "1x": 1,
        "500x": 500,
        "1000x": 1000,
        "5000x": 5000,
        "50000x": 50000,
        "100000x": 100000
    };

    gui.add(guiParams, 'timeScale', timeSpeedOptions)
        .name('Prędkość czasu')
        .onChange(value => {
            console.log("Ustawiono prędkość czasu na:", value);
        });

    // const timeFolder = gui.addFolder('Prędkość Czasu');
    // const sliderController = timeFolder.add(guiParams, 'timeScale', 1, 100000, 1000)
    //     .name('Time Scale')
    //     .onChange(value => {
    //         console.log("Nowa prędkość czasu:", value);
    //     });

   //requestAnimationFrame(() => {
   //    const controllerDom = sliderController.domElement;
   //    const sliderInput = controllerDom.querySelector('input[type="range"]');
   //    if (sliderInput) {
   //        // Utwórz div na legendę
   //        const scaleDiv = document.createElement('div');
   //        scaleDiv.style.position = 'relative';
   //        scaleDiv.style.marginTop = '8px';
   //        scaleDiv.style.display = 'flex';
   //        scaleDiv.style.justifyContent = 'space-between';
   //        scaleDiv.style.fontSize = '12px';
   //        scaleDiv.style.color = '#ccc';

   //        // Nasze kluczowe wartości:
   //        const marks = [1,100000];

   //        marks.forEach(m => {
   //            const mark = document.createElement('span');
   //            mark.innerText = `${m}x`;
   //            scaleDiv.appendChild(mark);
   //        });

   //        // Dodajemy scaleDiv za sliderem
   //        controllerDom.appendChild(scaleDiv);
   //    }
   //});

    // Najpierw stwórz wszystkie checkboxy, potem w onChange możesz z nich korzystać.
    const smallMoonsCheckbox = namesFolder.add(guiParams, 'showSmallMoons')
        .name('małe')
        .onChange(() => toggleObjectNames());

    const mediumMoonsCheckbox = namesFolder.add(guiParams, 'showMediumMoons')
        .name('średnie')
        .onChange(() => toggleObjectNames());

    const largeMoonsCheckbox = namesFolder.add(guiParams, 'showLargeMoons')
        .name('duże')
        .onChange(() => toggleObjectNames());

    // Tworzymy showObjectNamesCheckbox po zdefiniowaniu pozostałych:
    const showObjectNamesCheckbox = namesFolder.add(guiParams, 'showObjectNames')
        .name('Pokaż nazwy księżyców:')
        .onChange((value) => {
            guiParams.showSmallMoons = value;
            guiParams.showMediumMoons = value;
            guiParams.showLargeMoons = value;
            toggleObjectNames();

            // Teraz możemy wywołać updateDisplay() bo są już zdefiniowane
            smallMoonsCheckbox.updateDisplay();
            mediumMoonsCheckbox.updateDisplay();
            largeMoonsCheckbox.updateDisplay();
        });

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