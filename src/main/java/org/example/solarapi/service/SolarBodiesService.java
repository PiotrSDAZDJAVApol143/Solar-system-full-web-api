package org.example.solarapi.service;

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

                // Set the parent reference in Moon entities
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
    public boolean deleteSolarBody(Long id) {
        if (solarBodiesRepository.existsById(id)) {
            solarBodiesRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
