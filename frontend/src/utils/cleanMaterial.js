// src/utils/cleanMaterial.js
export function cleanMaterial(material) {
    material.dispose();
    // Usuwanie tekstur
    for (const key in material) {
        if (material.hasOwnProperty(key)) {
            const value = material[key];
            if (value && typeof value === 'object' && 'minFilter' in value) {
                value.dispose();
            }
        }
    }
}