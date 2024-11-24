//src/utils/createPlanet-old.js
import * as THREE from 'three';

export const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess, normalMapPath, displacementMapPath, aoMapPath, specularMapPath) {
    const geometry = new THREE.SphereGeometry(planetRadius, 256, 256);

    const mapTexture = loader.load(texturePath);
    mapTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshStandardMaterial({
        map: mapTexture,
        normalMap: normalMapPath ? loader.load(normalMapPath) : null,
        bumpMap: displacementMapPath ? loader.load(displacementMapPath) : null,
        bumpScale: displacementMapPath ? 0.5 : undefined, // Dostosuj wartość
        roughness: 0.9, // Zapewnia bardziej matową powierzchnię
        metalnessMap: specularMapPath ? loader.load(specularMapPath) : null,
        metalness: 0.8 // Minimalny metaliczny efekt
    });
   //if (normalMapPath) {
   //    const normalTexture = loader.load(normalMapPath);
   //    normalTexture.colorSpace = THREE.SRGBColorSpace;
   //    material.normalMap = normalTexture;
   //}
   //if(bumpOrDisplacementMapPath){
   //    const bumpTexture = loader.load(bumpOrDisplacementMapPath);
   //    bumpTexture.colorSpace = THREE.SRGBColorSpace;
   //    material.bumpMap = bumpTexture;
   //    material.bumpScale = bumpScale;
   //}

   if (aoMapPath) {
      // const aoTexture = loader.load(aoMapPath);
      // aoTexture.colorSpace = THREE.SRGBColorSpace;
      // material.aoMap = aoTexture;
       geometry.setAttribute('uv2', geometry.attributes.uv);
   }

   if (specularMapPath) {
       //const specularTexture = loader.load(specularMapPath);
       //specularTexture.colorSpace = THREE.SRGBColorSpace;
       //material.specularMap = specularTexture;
   }


    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}