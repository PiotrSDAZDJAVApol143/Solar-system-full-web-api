//src/utils/handleWindowResize.js
export function handleWindowResize(camera, renderer, container, labelRenderer) {
    if (camera && renderer && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (labelRenderer) {
            labelRenderer.setSize(w, h);
        }
    }
}