package org.example.solarapi.service;


import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.logging.Logger;

@Service
public class SolarBodiesFetchService {

    private static final Logger logger = Logger.getLogger(SolarBodiesFetchService.class.getName());

    @Autowired
    private HttpClientService<SolarBodies> httpClientService;

    /**
     * Mapa nazw „francuskich / włoskich” -> angielskie odpowiedniki,
     * gdy zewnętrzne API zwraca np. "La Lune" zamiast "Moon".
     * Można rozszerzać wedle potrzeb.
     */
    private static final Map<String, String> specialNameMap = Map.of(
            "Psamathée", "Psamathe",
            "La Lune", "Moon",
            "lune", "Moon"
            // dodawaj kolejne wyjątki
    );

    /**
     * Próbuje pobrać obiekt `SolarBodies` z zewnętrznego API,
     * bazując na angielskiej nazwie (englishName).
     * Zwraca wypełniony obiekt (jeszcze nie zapisany w bazie),
     * lub null jeśli nie znaleziono/ API zwróciło błąd.
     */
    public SolarBodies fetchByEnglishName(String englishName) {
        logger.info("Fetching from API by englishName: " + englishName);

        if (englishName == null || englishName.isBlank()) {
            logger.warning("englishName is null/blank, skipping fetch.");
            return null;
        }

        // Ewentualna korekta nazwy (próba w specialNameMap)
        String mappedName = specialNameMap.getOrDefault(englishName, englishName);

        String encodedName = HttpClientService.encodeValue(mappedName.toLowerCase());
        String url = "https://api.le-systeme-solaire.net/rest/bodies/" + encodedName;

        SolarBodies result = null;
        try {
            result = httpClientService.getPlanetDetails(url, SolarBodies.class);
            if (result == null) {
                logger.warning("fetchByEnglishName - No data returned for " + englishName);
            } else {
                logger.info("fetchByEnglishName - Fetched data for " + englishName + " => " + result.getEnglishName());
                // Ewentualnie: normalizuj nazwy księżyców (np. "La Lune" -> "Moon") już tutaj
                normalizeMoons(result);
            }
        } catch (Exception e) {
            logger.severe("Error in fetchByEnglishName for " + englishName + ": " + e.getMessage());
        }
        return result;
    }

    /**
     * Próbuje pobrać obiekt `SolarBodies` z API, używając pola "rel",
     * np. "https://api.le-systeme-solaire.net/rest/bodies/psamathee".
     * Zwraca obiekt (niezapisany w DB) lub null w razie błędu.
     */
    public SolarBodies fetchByRel(String rel) {
        if (rel == null || rel.isBlank()) {
            logger.warning("fetchByRel - rel is null/blank.");
            return null;
        }
        if (!(rel.startsWith("http://") || rel.startsWith("https://"))) {
            logger.warning("fetchByRel - rel does not start with http/https: " + rel);
            return null;
        }

        try {
            SolarBodies result = httpClientService.getPlanetDetails(rel, SolarBodies.class);
            if (result == null) {
                logger.warning("fetchByRel - No data returned for rel=" + rel);
            } else {
                logger.info("fetchByRel - Fetched data by rel: " + rel + " => " + result.getEnglishName());
                normalizeMoons(result);
            }
            return result;
        } catch (Exception e) {
            logger.severe("fetchByRel error: " + e.getMessage());
            return null;
        }
    }

    /**
     * Metoda pomocnicza, która iteruje po liście księżyców w obiekcie `SolarBodies`
     * i zamienia ich nazwy (moon) wg mapy `specialNameMap`, np. "La Lune" -> "Moon".
     * Pozwala to mieć spójne nazwy w całej aplikacji (baza i front).
     */
    private void normalizeMoons(SolarBodies solarBody) {
        if (solarBody.getMoons() == null) {
            return;
        }
        for (Moon moon : solarBody.getMoons()) {
            String rawName = moon.getMoon();
            String mapped = specialNameMap.getOrDefault(rawName, rawName);
            moon.setMoon(mapped);

            // Możesz też zachować oryginalną nazwę:
            if (moon.getOriginalName() == null) {
                moon.setOriginalName(rawName);
            }
        }
    }
}
