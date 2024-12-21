package org.example.solarapi.mapper;

import org.example.solarapi.dto.MoonDTO;
import org.example.solarapi.dto.SolarBodyDTO;
import org.example.solarapi.dto.TexturesDTO;
import org.example.solarapi.model.Mass;
import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.model.Vol;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class SolarBodyMapper {

    // Stałe reprezentujące masę i objętość Ziemi
    private static final double EARTH_MASS_VALUE = 5.97237;
    private static final int EARTH_MASS_EXPONENT = 24;

    private static final double EARTH_VOL_VALUE = 1.08321;
    private static final int EARTH_VOL_EXPONENT = 12;

    private static final String TEXTURES_BASE_PATH = "/assets/textures/";
    private static final String MODELS_BASE_PATH = "/assets/models/";

    public static SolarBodyDTO convertToDTO(SolarBodies solarBody) {
        SolarBodyDTO dto = new SolarBodyDTO();
        dto.setEnglishName(solarBody.getEnglishName());
        dto.setBodyType(solarBody.getBodyType());
        dto.setPlanet(solarBody.isPlanet());
        dto.setMeanRadius(solarBody.getMeanRadius());
        dto.setMoonCount(solarBody.getMoonCount());


        dto.setSemiMajorAxis(solarBody.getSemimajorAxis() != null ? solarBody.getSemimajorAxis().intValue() : null);
        dto.setPerihelion(solarBody.getPerihelion() != null ? solarBody.getPerihelion().intValue() : null);
        dto.setAphelion(solarBody.getAphelion() != null ? solarBody.getAphelion().intValue() : null);
        dto.setInclination(solarBody.getInclination());
        dto.setGravity(solarBody.getGravity());
        dto.setEscapeSpeed(solarBody.getEscape());
        dto.setOrbitalPeriod(solarBody.getSideralOrbit());
        dto.setRotationPeriod(solarBody.getSideralRotation());
        dto.setDiscoveredBy(solarBody.getDiscoveredBy());
        dto.setDiscoveryDate(solarBody.getDiscoveryDate());
        dto.setAxialTilt(solarBody.getAxialTilt());
        dto.setAvgTemp(solarBody.getAvgTemp());

        // Przeliczenie masy względem masy Ziemi
        if (solarBody.getMass() != null && solarBody.getMass().getMassValue() != null && solarBody.getMass().getMassExponent() != null) {
            double bodyMass = solarBody.getMass().getMassValue() * Math.pow(10, solarBody.getMass().getMassExponent());
            double earthMass = EARTH_MASS_VALUE * Math.pow(10, EARTH_MASS_EXPONENT);
            double massRatio = bodyMass / earthMass;
            dto.setMass(massRatio);
        } else {
            dto.setMass(null);
        }

        // Przeliczenie objętości względem objętości Ziemi
        if (solarBody.getVol() != null && solarBody.getVol().getVolValue() != null && solarBody.getVol().getVolExponent() != null) {
            double bodyVol = solarBody.getVol().getVolValue() * Math.pow(10, solarBody.getVol().getVolExponent());
            double earthVol = EARTH_VOL_VALUE * Math.pow(10, EARTH_VOL_EXPONENT);
            double volRatio = bodyVol / earthVol;
            dto.setVol(volRatio);
        } else {
            dto.setVol(null);
        }

        dto.setTextures(generateTextures(solarBody.getEnglishName(), solarBody.getBodyType()));
        String modelPath = generateModelPath(solarBody.getEnglishName(), solarBody.getBodyType());
        dto.setModel(modelPath);

        // Mapowanie księżyców
        if (solarBody.getMoons() != null && !solarBody.getMoons().isEmpty()) {
            Set<MoonDTO> moonDTOs = solarBody.getMoons().stream()
                    .map(SolarBodyMapper::convertMoonToDTO)
                    .collect(Collectors.toSet());
            dto.setMoons(moonDTOs);
        } else {
            dto.setMoons(new HashSet<>());
        }

        return dto;
    }

    private static TexturesDTO generateTextures(String englishName, String bodyType) {
        TexturesDTO textures = new TexturesDTO();
        String baseName = englishName.replaceAll("\\s+", "_").toLowerCase();
        String basePath = "assets/textures/" + baseName + "/";

        // Generowanie ścieżek do poszczególnych tekstur bez rozszerzenia
        Map<String, Consumer<String>> textureSetters = new HashMap<>();
        textureSetters.put("_surface", textures::setSurfaceTexture);
        textureSetters.put("_additional", textures::setAdditionalTexture);
        textureSetters.put("_cloud", textures::setCloudTexture);
        textureSetters.put("_cloud_additional", textures::setAdditionalCloudTexture);
        textureSetters.put("_bump", textures::setBumpMapTexture);
        textureSetters.put("_normal", textures::setNormalMapTexture);
        textureSetters.put("_ao", textures::setAmbientOcclusionMapTexture);
        textureSetters.put("_specular", textures::setSpecularMapTexture);

        // Dla każdego klucza sprawdzamy czy istnieje plik z rozszerzeniem .jpg lub .png
        for (Map.Entry<String, Consumer<String>> entry : textureSetters.entrySet()) {
            String baseTextureName = baseName + entry.getKey(); // np. earth_surface
            String jpgPath = basePath + baseTextureName + ".jpg";
            String pngPath = basePath + baseTextureName + ".png";

            if (fileExists(jpgPath)) {
                entry.getValue().accept(jpgPath);
            } else if (fileExists(pngPath)) {
                entry.getValue().accept(pngPath);
            }
        }

        return textures;
    }
    private static String generateModelPath(String englishName, String bodyType) {
        String folderName = getFolderNameFromBodyType(bodyType);
        String basePath = "assets/models/3D_models/";
        String baseName = englishName.replaceAll("\\s+", "_").toLowerCase();
        // Najpierw sprawdzamy .glb
        String glbPath = basePath + baseName + ".glb";
        if (fileExists(glbPath)) {
            return glbPath;
        }

        // Jeśli nie ma .glb, sprawdzamy .ply
        String plyPath = basePath + baseName + ".ply";
        if (fileExists(plyPath)) {
            return plyPath;
        }
        int randDefault = (int)(Math.random() * 5) + 1;
        String defaultModel = basePath + "default" + randDefault + ".glb";
        if (fileExists(defaultModel)) {
            return defaultModel;
        }
        return null;
    }
    private static boolean fileExists(String relativePath) {
        Path projectDir = Paths.get(System.getProperty("user.dir"));
        Path fullPath = projectDir.resolve("frontend").resolve("public").resolve(relativePath);

        return Files.exists(fullPath);
    }

    public static MoonDTO convertMoonToDTO(Moon moon) {
        MoonDTO moonDTO = new MoonDTO();
        moonDTO.setEnglishName(moon.getMoon()); // Mapowanie pola 'moon' na 'englishName'
        moonDTO.setRel(moon.getRel()); // Mapowanie rel
        moonDTO.setTextures(generateTextures(moon.getMoon(), "moon"));
        String modelPath = generateModelPath(moon.getMoon(), "moon");
        moonDTO.setModel(modelPath);
        return moonDTO;
    }
    public static SolarBodies convertToEntity(SolarBodyDTO dto) {
        SolarBodies solarBody = new SolarBodies();
        solarBody.setEnglishName(dto.getEnglishName());
        solarBody.setBodyType(dto.getBodyType());
        solarBody.setPlanet(dto.isPlanet());
        solarBody.setMeanRadius(dto.getMeanRadius());
        solarBody.setSemimajorAxis(dto.getSemiMajorAxis() != null ? dto.getSemiMajorAxis().longValue() : null);
        solarBody.setPerihelion(dto.getPerihelion() != null ? dto.getPerihelion().longValue() : null);
        solarBody.setAphelion(dto.getAphelion() != null ? dto.getAphelion().longValue() : null);
        solarBody.setInclination(dto.getInclination());
        solarBody.setGravity(dto.getGravity());
        solarBody.setEscape(dto.getEscapeSpeed());
        solarBody.setSideralOrbit(dto.getOrbitalPeriod());
        solarBody.setSideralRotation(dto.getRotationPeriod());
        solarBody.setDiscoveredBy(dto.getDiscoveredBy());
        solarBody.setDiscoveryDate(dto.getDiscoveryDate());
        solarBody.setAxialTilt(dto.getAxialTilt());
        solarBody.setAvgTemp(dto.getAvgTemp());

        if (dto.getMass() != null) {
            double massRatio = dto.getMass(); // stosunek masy do masy Ziemi
            double earthMass = EARTH_MASS_VALUE * Math.pow(10, EARTH_MASS_EXPONENT);
            double bodyMass = massRatio * earthMass;

            // Rozbicie bodyMass na massValue i massExponent
            double logBodyMass = Math.log10(bodyMass);
            int massExponent = (int) Math.floor(logBodyMass);
            double massValue = bodyMass / Math.pow(10, massExponent);

            Mass mass = new Mass();
            mass.setMassValue(massValue);
            mass.setMassExponent(massExponent);
            solarBody.setMass(mass);
        } else {
            solarBody.setMass(null);
        }

        if (dto.getVol() != null) {
            double volRatio = dto.getVol(); // stosunek objętości do objętości Ziemi
            double earthVol = EARTH_VOL_VALUE * Math.pow(10, EARTH_VOL_EXPONENT);
            double bodyVol = volRatio * earthVol;

            // Rozbicie bodyVol na volValue i volExponent
            double logBodyVol = Math.log10(bodyVol);
            int volExponent = (int) Math.floor(logBodyVol);
            double volValue = bodyVol / Math.pow(10, volExponent);

            Vol vol = new Vol();
            vol.setVolValue(volValue);
            vol.setVolExponent(volExponent);
            solarBody.setVol(vol);
        } else {
            solarBody.setVol(null);
        }

        // Mapowanie księżyców
        if (dto.getMoons() != null && !dto.getMoons().isEmpty()) {
            Set<Moon> moons = dto.getMoons().stream()
                    .map(SolarBodyMapper::convertMoonDTOToEntity)
                    .collect(Collectors.toSet());
            solarBody.setMoons(moons);
        } else {
            solarBody.setMoons(new HashSet<>());
        }

        return solarBody;
    }

    public static Moon convertMoonDTOToEntity(MoonDTO dto) {
        Moon moon = new Moon();
        moon.setMoon(dto.getEnglishName());
        return moon;
    }
    public static MoonDTO convertSolarBodyToMoonDTO(SolarBodies moonBody) {
        MoonDTO moonDTO = new MoonDTO();
        moonDTO.setEnglishName(moonBody.getEnglishName());
        moonDTO.setBodyType(moonBody.getBodyType());
        moonDTO.setMeanRadius(moonBody.getMeanRadius());
        moonDTO.setSemimajorAxis(moonBody.getSemimajorAxis());
        moonDTO.setPerihelion(moonBody.getPerihelion());
        moonDTO.setAphelion(moonBody.getAphelion());
        moonDTO.setEccentricity(moonBody.getEccentricity());
        moonDTO.setGravity(moonBody.getGravity());
        moonDTO.setEscapeSpeed(moonBody.getEscape());
        moonDTO.setInclination(moonBody.getInclination());
        moonDTO.setAxialTilt(moonBody.getAxialTilt());
        moonDTO.setAvgTemp(moonBody.getAvgTemp());
        moonDTO.setOrbitalPeriod(moonBody.getSideralOrbit());
        moonDTO.setRotationPeriod(moonBody.getSideralRotation());
        moonDTO.setDiscoveredBy(moonBody.getDiscoveredBy());
        moonDTO.setDiscoveryDate(moonBody.getDiscoveryDate());
        // Przeliczenia masy
        if (moonBody.getMass() != null && moonBody.getMass().getMassValue() != null && moonBody.getMass().getMassExponent() != null) {
            double bodyMass = moonBody.getMass().getMassValue() * Math.pow(10, moonBody.getMass().getMassExponent());
            double earthMass = EARTH_MASS_VALUE * Math.pow(10, EARTH_MASS_EXPONENT);
            double massRatio = bodyMass / earthMass;
            moonDTO.setMass(massRatio);
        } else {
            moonDTO.setMass(null);
        }
        // Przeliczenia objętości
        if (moonBody.getVol() != null && moonBody.getVol().getVolValue() != null && moonBody.getVol().getVolExponent() != null) {
            double bodyVol = moonBody.getVol().getVolValue() * Math.pow(10, moonBody.getVol().getVolExponent());
            double earthVol = EARTH_VOL_VALUE * Math.pow(10, EARTH_VOL_EXPONENT);
            double volRatio = bodyVol / earthVol;
            moonDTO.setVol(volRatio);
        } else {
            moonDTO.setVol(null);
        }

        moonDTO.setTextures(generateTextures(moonBody.getEnglishName(), moonBody.getBodyType()));
        moonDTO.setModel(generateModelPath(moonBody.getEnglishName(), moonBody.getBodyType()));

        return moonDTO;
    }

    private static String getFolderNameFromBodyType(String bodyType) {
        return switch (bodyType.toLowerCase()) {
            case "planet" -> "planet";
            case "moon" -> "moon";
            case "asteroid" -> "asteroid";
            case "dwarf planet" -> "dwarf_planet";
            default -> "other";
        };
}}

