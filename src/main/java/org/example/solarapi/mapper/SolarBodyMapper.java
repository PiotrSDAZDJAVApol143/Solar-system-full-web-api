package org.example.solarapi.mapper;

import org.example.solarapi.dto.MoonDTO;
import org.example.solarapi.dto.SolarBodyDTO;
import org.example.solarapi.dto.TexturesDTO;
import org.example.solarapi.model.Mass;
import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.model.Vol;

import java.util.HashSet;
import java.util.Set;
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

        // Mapowanie księżyców
        if (solarBody.getMoons() != null && !solarBody.getMoons().isEmpty()) {
            Set<MoonDTO> moonDTOs = solarBody.getMoons().stream()
                    .map(SolarBodyMapper::convertMoonToDTO)
                    .collect(Collectors.toSet());
            dto.setMoons(moonDTOs);
        } else {
            dto.setMoons(new HashSet<>());
        }
        dto.setTextures(generateTextures(solarBody.getEnglishName(), solarBody.getBodyType()));
        dto.setModel(generateModelPath(solarBody.getEnglishName(), solarBody.getBodyType()));

        return dto;
    }

    private static TexturesDTO generateTextures(String englishName, String bodyType) {
        TexturesDTO textures = new TexturesDTO();
        String folderName = getFolderNameFromBodyType(bodyType);
        String basePath = TEXTURES_BASE_PATH + folderName + "/";
        String baseName = englishName.replaceAll("\\s+", "_").toLowerCase();

        // Generowanie ścieżek do poszczególnych tekstur
        String surfaceTexturePath = basePath + baseName + "_surface.jpg";
        String additionalTexturePath = basePath + baseName + "_additional.jpg";
        String cloudTexturePath = basePath + baseName + "_cloud.jpg";
        String additionalCloudTexturePath = basePath + baseName + "_cloud_additional.jpg";
        String bumpMapTexturePath = basePath + baseName + "_bump.jpg";
        String normalMapTexturePath = basePath + baseName + "_normal.jpg";
        String ambientOcclusionMapTexturePath = basePath + baseName + "_ao.jpg";
        String specularMapTexturePath = basePath + baseName + "_specular.jpg";

        if (fileExists(surfaceTexturePath)) {
            textures.setSurfaceTexture(surfaceTexturePath);
        }
        if (fileExists(additionalTexturePath)) {
            textures.setAdditionalTexture(additionalTexturePath);
        }
        if (fileExists(cloudTexturePath)) {
            textures.setCloudTexture(cloudTexturePath);
        }
        if (fileExists(additionalCloudTexturePath)) {
            textures.setAdditionalCloudTexture(additionalCloudTexturePath);
        }
        if (fileExists(bumpMapTexturePath)) {
            textures.setBumpMapTexture(bumpMapTexturePath);
        }
        if (fileExists(normalMapTexturePath)) {
            textures.setNormalMapTexture(normalMapTexturePath);
        }
        if (fileExists(ambientOcclusionMapTexturePath)) {
            textures.setAmbientOcclusionMapTexture(ambientOcclusionMapTexturePath);
        }
        if (fileExists(specularMapTexturePath)) {
            textures.setSpecularMapTexture(specularMapTexturePath);
        }

        return textures;
    }
    private static String generateModelPath(String englishName, String bodyType) {
        String folderName = getFolderNameFromBodyType(bodyType);
        String basePath = MODELS_BASE_PATH + folderName + "/";

        String baseName = englishName.replaceAll("\\s+", "_").toLowerCase();
        String modelPath = basePath + baseName + ".glb";

        if (fileExists(modelPath)) {
            return modelPath;
        } else {
            return null;
        }
    }

    private static boolean fileExists(String relativePath) {
        String fullPath = "src/main/resources/static" + relativePath;

        Path path = Paths.get(fullPath);
        return Files.exists(path);
    }

    public static MoonDTO convertMoonToDTO(Moon moon) {
        MoonDTO moonDTO = new MoonDTO();
        moonDTO.setEnglishName(moon.getMoon()); // Mapowanie pola 'moon' na 'englishName'
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
    private static String getFolderNameFromBodyType(String bodyType) {
        return switch (bodyType.toLowerCase()) {
            case "planet" -> "planet";
            case "moon" -> "moon";
            case "asteroid" -> "asteroid";
            case "dwarf planet" -> "dwarf_planet";
            default -> "other";
        };
}}

