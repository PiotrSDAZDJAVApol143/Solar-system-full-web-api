package org.example.solarapi.service;

import org.example.solarapi.dto.MoonDTO;
import org.example.solarapi.dto.SolarBodyDTO;
import org.example.solarapi.mapper.SolarBodyMapper;
import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.repository.SolarBodiesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class SolarBodiesService {
    private static final Logger logger = Logger.getLogger(SolarBodiesService.class.getName());

    @Autowired
    private SolarBodiesRepository solarBodiesRepository;

    @Autowired
    private HttpClientService<SolarBodies> httpClientService;

    @Transactional
    public void saveSolarBodiesData(String englishName) {
        String encodedName = HttpClientService.encodeValue(englishName.toLowerCase());
        String url = "https://api.le-systeme-solaire.net/rest/bodies/" + encodedName;
        try {
            SolarBodies solarBodiesDetails = httpClientService.getPlanetDetails(url, SolarBodies.class);
            if (solarBodiesDetails == null) {
                logger.warning("No data found for: " + englishName);
                return;
            }

            // Zainicjalizuj pole moons, jeśli jest null
            if (solarBodiesDetails.getMoons() == null) {
                solarBodiesDetails.setMoons(new HashSet<>());
            }

            logger.info("Fetched data from API: " + solarBodiesDetails);

            // Przelicz liczbę księżyców
            solarBodiesDetails.setMoonCount(solarBodiesDetails.getMoons().size());

            SolarBodies existingSolarBody = solarBodiesRepository.findByEnglishName(englishName);

            if (existingSolarBody != null) {
                // Zainicjalizuj pole moons w istniejącym obiekcie, jeśli jest null
                if (existingSolarBody.getMoons() == null) {
                    existingSolarBody.setMoons(new HashSet<>());
                }

                // Zaktualizuj dane istniejącego obiektu
                existingSolarBody.setMoons(solarBodiesDetails.getMoons());
                existingSolarBody.setMoonCount(solarBodiesDetails.getMoonCount());
                solarBodiesRepository.save(existingSolarBody);
            } else {
                // Zapisz nowy obiekt do bazy danych
                solarBodiesRepository.save(solarBodiesDetails);
            }

            logger.info("Solar body saved successfully: " + englishName);
        } catch (Exception e) {
            logger.severe("Error saving data for " + englishName + ": " + e.getMessage());
        }
    }

    @Transactional
    public void saveAllSolarBodiesData(List<SolarBodies> solarBodiesList) {
        if (solarBodiesList == null || solarBodiesList.isEmpty()) {
            logger.warning("Received empty solar bodies list, skipping save operation.");
            return;
        }

        for (SolarBodies solarBody : solarBodiesList) {
            try {
                if (solarBody.getMoons() == null) {
                    solarBody.setMoons(new HashSet<>());
                }

                for (Moon moon : solarBody.getMoons()) {
                    moon.setSolarBodies(solarBody);
                }

                solarBody.setMoonCount(solarBody.getMoons().size());

                SolarBodies existingSolarBody = solarBodiesRepository.findByEnglishName(solarBody.getEnglishName());
                if (existingSolarBody != null) {
                    if (existingSolarBody.getMoons() == null) {
                        existingSolarBody.setMoons(new HashSet<>());
                    }

                    existingSolarBody.setMoons(solarBody.getMoons());
                    existingSolarBody.setMoonCount(solarBody.getMoonCount());
                    solarBodiesRepository.save(existingSolarBody);
                } else {
                    solarBodiesRepository.save(solarBody);
                }

                logger.info("Solar body saved: " + solarBody.getEnglishName());
            } catch (Exception e) {
                logger.severe("Error saving data for " + solarBody.getEnglishName() + ": " + e.getMessage());
            }
        }
    }

    public SolarBodies getSolarBodyByName(String englishName) {
        SolarBodies solarBody = solarBodiesRepository.findByEnglishName(englishName);
        if (solarBody == null) {
            logger.warning("No solar body found for: " + englishName);
        }
        return solarBody;
    }

    private SolarBodies fetchAndSaveFromExternalAPI(String englishName) {
        try {
            String encodedName = HttpClientService.encodeValue(englishName.toLowerCase());
            String url = "https://api.le-systeme-solaire.net/rest/bodies/" + encodedName;
            SolarBodies solarBodiesDetails = httpClientService.getPlanetDetails(url, SolarBodies.class);
            if (solarBodiesDetails == null) {
                return null;
            }

            if (solarBodiesDetails.getMoons() == null) {
                solarBodiesDetails.setMoons(new HashSet<>());
            }
            solarBodiesDetails.setMoonCount(solarBodiesDetails.getMoons().size());
            SolarBodies existingSolarBody = solarBodiesRepository.findByEnglishName(englishName);
            if (existingSolarBody != null) {
                existingSolarBody.setMoons(solarBodiesDetails.getMoons());
                existingSolarBody.setMoonCount(solarBodiesDetails.getMoonCount());
                solarBodiesRepository.save(existingSolarBody);
                return existingSolarBody;
            } else {
                solarBodiesRepository.save(solarBodiesDetails);
                return solarBodiesDetails;
            }
        } catch (Exception e) {
            logger.severe("Error fetching data from external API for: " + englishName + ": " + e.getMessage());
            return null;
        }
    }

    public Set<Moon> getMoonsBySolarBodyName(String englishName) {
        SolarBodies solarBody = solarBodiesRepository.findByEnglishName(englishName);
        if (solarBody != null) {
            return solarBody.getMoons();
        } else {
            logger.warning("No solar body found for: " + englishName);
            return Collections.emptySet();
        }
    }
    @Transactional
    public SolarBodies saveSolarBody(SolarBodies solarBody) {
        return solarBodiesRepository.save(solarBody);
    }
    @Transactional
    public SolarBodies updateSolarBody(Long id, SolarBodyDTO solarBodyDTO) {
        Optional<SolarBodies> optionalSolarBody = solarBodiesRepository.findById(id);
        if (optionalSolarBody.isPresent()) {
            SolarBodies existingSolarBody = optionalSolarBody.get();
            // Aktualizacja pól
            existingSolarBody.setEnglishName(solarBodyDTO.getEnglishName());
            existingSolarBody.setBodyType(solarBodyDTO.getBodyType());
            existingSolarBody.setPlanet(solarBodyDTO.isPlanet());
            existingSolarBody.setMeanRadius(solarBodyDTO.getMeanRadius());
            existingSolarBody.setSemimajorAxis(solarBodyDTO.getSemiMajorAxis() != null ? solarBodyDTO.getSemiMajorAxis().longValue() : null);
            existingSolarBody.setPerihelion(solarBodyDTO.getPerihelion() != null ? solarBodyDTO.getPerihelion().longValue() : null);
            existingSolarBody.setAphelion(solarBodyDTO.getAphelion() != null ? solarBodyDTO.getAphelion().longValue() : null);
            existingSolarBody.setInclination(solarBodyDTO.getInclination());
            existingSolarBody.setGravity(solarBodyDTO.getGravity());
            existingSolarBody.setEscape(solarBodyDTO.getEscapeSpeed());
            existingSolarBody.setSideralOrbit(solarBodyDTO.getOrbitalPeriod());
            existingSolarBody.setSideralRotation(solarBodyDTO.getRotationPeriod());
            existingSolarBody.setDiscoveredBy(solarBodyDTO.getDiscoveredBy());
            existingSolarBody.setDiscoveryDate(solarBodyDTO.getDiscoveryDate());
            existingSolarBody.setAxialTilt(solarBodyDTO.getAxialTilt());
            existingSolarBody.setAvgTemp(solarBodyDTO.getAvgTemp());

            if (solarBodyDTO.getMoons() != null) {
                Set<Moon> moons = solarBodyDTO.getMoons().stream()
                        .map(SolarBodyMapper::convertMoonDTOToEntity)
                        .collect(Collectors.toSet());
                existingSolarBody.setMoons(moons);
            }

            return solarBodiesRepository.save(existingSolarBody);
        } else {
            return null;
        }
    }
    @Transactional
    public SolarBodyDTO patchSolarBody(Long id, Map<String, Object> updates) {
        Optional<SolarBodies> optional = solarBodiesRepository.findById(id);
        if (optional.isEmpty()) {
            logger.warning("No solar body found for ID: " + id);
            return null;
        }

        SolarBodies existingSolarBody = optional.get();
        updates.forEach((field, value) -> {
            switch (field) {
                case "englishName":
                    existingSolarBody.setEnglishName((String) value);
                    break;
                case "bodyType":
                    existingSolarBody.setBodyType((String) value);
                    break;
                case "planet":
                    existingSolarBody.setPlanet((Boolean) value);
                    break;
                case "meanRadius":
                    existingSolarBody.setMeanRadius(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "semiMajorAxis":
                    existingSolarBody.setSemimajorAxis(value != null ? ((Number) value).longValue() : null);
                    break;
                case "perihelion":
                    existingSolarBody.setPerihelion(value != null ? ((Number) value).longValue() : null);
                    break;
                case "aphelion":
                    existingSolarBody.setAphelion(value != null ? ((Number) value).longValue() : null);
                    break;
                case "inclination":
                    existingSolarBody.setInclination(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "gravity":
                    existingSolarBody.setGravity(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "escapeSpeed":
                    existingSolarBody.setEscape(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "orbitalPeriod":
                    existingSolarBody.setSideralOrbit(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "rotationPeriod":
                    existingSolarBody.setSideralRotation(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "discoveredBy":
                    existingSolarBody.setDiscoveredBy((String) value);
                    break;
                case "discoveryDate":
                    existingSolarBody.setDiscoveryDate((String) value);
                    break;
                case "axialTilt":
                    existingSolarBody.setAxialTilt(value != null ? ((Number) value).doubleValue() : null);
                    break;
                case "avgTemp":
                    existingSolarBody.setAvgTemp(value != null ? ((Number) value).doubleValue() : null);
                    break;
                // Moons i inne pola można obsłużyć podobnie, jeśli to konieczne
                default:
                    logger.warning("Unsupported field for patch: " + field);
            }
        });

        SolarBodies saved = solarBodiesRepository.save(existingSolarBody);
        return SolarBodyMapper.convertToDTO(saved);
    }
    @Transactional
    public boolean deleteSolarBody(Long id) {
        if (solarBodiesRepository.existsById(id)) {
            solarBodiesRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
    @Transactional
    public SolarBodies fetchAndSaveSolarBody(String englishName) {
        SolarBodies existing = solarBodiesRepository.findByEnglishName(englishName);
        if (existing != null) return existing;

        String encodedName = HttpClientService.encodeValue(englishName.toLowerCase());
        String url = "https://api.le-systeme-solaire.net/rest/bodies/" + encodedName;
        SolarBodies solarBodyDetails = httpClientService.getPlanetDetails(url, SolarBodies.class);
        if (solarBodyDetails != null) {
            if (solarBodyDetails.getMoons() == null) {
                solarBodyDetails.setMoons(new HashSet<>());
            }
            solarBodyDetails.setMoonCount(solarBodyDetails.getMoons().size());
            return solarBodiesRepository.save(solarBodyDetails);
        }
        return null;
    }
    public SolarBodyDTO convertToDTOWithFullMoons(SolarBodies solarBody) {
        SolarBodyDTO dto = SolarBodyMapper.convertToDTO(solarBody);

        if (dto.getMoons() != null && !dto.getMoons().isEmpty()) {
            Set<MoonDTO> expandedMoons = new HashSet<>();
            for (MoonDTO basicMoon : dto.getMoons()) {
                // Próbujemy najpierw po englishName:
                SolarBodies moonBody = getSolarBodyByName(basicMoon.getEnglishName());
                if (moonBody == null) {
                    // Jeśli brak w bazie i API po nazwie się nie powiedzie to spróbujmy rel
                    moonBody = findOrFetchBody(basicMoon.getEnglishName(), basicMoon.getRel());
                }

                if (moonBody != null) {
                    // Konwertujemy SolarBodies na MoonDTO z pełnymi informacjami
                    // Potrzebujemy nową metodę w SolarBodyMapper do tego:
                    MoonDTO fullMoonDTO = SolarBodyMapper.convertSolarBodyToMoonDTO(moonBody);
                    expandedMoons.add(fullMoonDTO);
                } else {
                    // Jeśli nie znaleziono nawet po rel, zostawiamy minimalne informacje
                    expandedMoons.add(basicMoon);
                }
            }
            dto.setMoons(expandedMoons);
        }
        return dto;
    }
    @Transactional
    public SolarBodies findOrFetchBody(String englishName, String rel) {
        // 1. Spróbuj znaleźć w bazie
        SolarBodies body = getSolarBodyByName(englishName);
        if (body != null) {
            return body;
        }

        // 2. Nie ma w bazie - spróbuj pobrać z API po englishName
        SolarBodies fetched = fetchFromApi(englishName);
        if (fetched != null) {
            return fetched;
        }

        // 3. Jeśli nie znaleziono po englishName a mamy rel, spróbuj po rel
        if (rel != null && !rel.isEmpty()) {
            logger.info("Trying to fetch body from rel: " + rel);
            fetched = fetchFromApiByRel(rel);
            if (fetched != null) {
                return fetched;
            }
        }

        // Jeśli wszystko zawiedzie, zwróć null
        logger.warning("Could not fetch body for name: " + englishName + " and rel: " + rel);
        return null;
    }
    private SolarBodies fetchFromApi(String englishName) {
        logger.info("No local data found for: " + englishName + ", attempting to fetch from API.");
        String encodedName = HttpClientService.encodeValue(englishName.toLowerCase());
        String url = "https://api.le-systeme-solaire.net/rest/bodies/" + encodedName;
        SolarBodies solarBodyDetails = httpClientService.getPlanetDetails(url, SolarBodies.class);
        return saveIfNotNull(englishName, solarBodyDetails);
    }

    private SolarBodies fetchFromApiByRel(String rel) {
        logger.info("Attempting to fetch body from rel: " + rel);
        SolarBodies solarBodyDetails = httpClientService.getPlanetDetails(rel, SolarBodies.class);
        // W przypadku rel możemy mieć inną nazwę englishName - odczytamy z solarBodyDetails
        if (solarBodyDetails != null && solarBodyDetails.getEnglishName() != null) {
            return saveIfNotNull(solarBodyDetails.getEnglishName(), solarBodyDetails);
        }
        return null;
    }

    private SolarBodies saveIfNotNull(String englishName, SolarBodies solarBodyDetails) {
        if (solarBodyDetails == null) {
            logger.warning("Could not find data for: " + englishName + " even from external API.");
            return null;
        }

        if (solarBodyDetails.getMoons() == null) {
            solarBodyDetails.setMoons(new HashSet<>());
        }
        solarBodyDetails.setMoonCount(solarBodyDetails.getMoons().size());
        SolarBodies saved = solarBodiesRepository.save(solarBodyDetails);
        logger.info("Saved " + englishName + " from API.");
        return saved;
    }

}
