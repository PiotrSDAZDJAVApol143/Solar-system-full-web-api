package org.example.solarapi.service;

import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.repository.SolarBodiesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.logging.Logger;

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
}
