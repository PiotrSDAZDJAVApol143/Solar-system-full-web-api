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
@Transactional
public class SolarBodiesService {

    private static final Logger logger = Logger.getLogger(SolarBodiesService.class.getName());

    @Autowired
    private SolarBodiesRepository solarBodiesRepository;

    @Autowired
    private SolarBodiesFetchService solarBodiesFetchService;  // musisz mieć tę klasę w swoim projekcie

    @Autowired
    private HttpClientService<SolarBodies> httpClientService; // też musisz mieć tę klasę w projekcie

    private final Set<String> alreadyFailedNames = new HashSet<>();

    // ---------------------- PODSTAWOWE METODY Z TWOJEGO KODU ----------------------

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

            // Czy mamy już w bazie?
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

    /**
     * Metoda do masowego zapisu listy obiektów.
     * Np. używana w kontrolerze do endpointu /sync2
     */
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
                // Ustaw moonCount
                solarBody.setMoonCount(solarBody.getMoons().size());

                // Zapis
                SolarBodies existing = solarBodiesRepository.findByEnglishName(solarBody.getEnglishName());
                if (existing != null) {
                    existing.setMoons(solarBody.getMoons());
                    existing.setMoonCount(solarBody.getMoonCount());
                    solarBodiesRepository.save(existing);
                } else {
                    solarBodiesRepository.save(solarBody);
                }
            } catch (Exception e) {
                logger.severe("Error saving data for " + solarBody.getEnglishName() + ": " + e.getMessage());
            }
        }
    }

    /**
     * Zwraca obiekt z bazy po englishName (lub null).
     */
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

    /**
     * Zwraca set księżyców (encje Moon) powiązanych z obiektem w bazie,
     * lub pusty set jeśli nie istnieje.
     */
    public Set<Moon> getMoonsBySolarBodyName(String englishName) {
        SolarBodies solarBody = solarBodiesRepository.findByEnglishName(englishName);
        if (solarBody != null) {
            return solarBody.getMoons();
        } else {
            logger.warning("No solar body found for: " + englishName);
            return Collections.emptySet();
        }
    }

    /**
     * Zapisuje pojedynczy obiekt w bazie (jeśli ma ID, to update,
     * jeśli nie – insert). Przykładowe uproszczenie.
     */
    public SolarBodies saveSolarBody(SolarBodies solarBody) {
        if (solarBody.getMoons() == null) {
            solarBody.setMoons(new HashSet<>());
        }
        solarBody.setMoonCount(solarBody.getMoons().size());
        return solarBodiesRepository.save(solarBody);
    }

    /**
     * Update całego obiektu (np. PUT).
     * Zwraca zaktualizowaną encję lub null, jeśli nie istnieje w DB.
     */
    public SolarBodies updateSolarBody(Long id, SolarBodyDTO solarBodyDTO) {
        Optional<SolarBodies> optionalSolarBody = solarBodiesRepository.findById(id);
        if (optionalSolarBody.isEmpty()) {
            return null;
        }
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

        // Moons
        if (solarBodyDTO.getMoons() != null) {
            Set<Moon> newMoons = solarBodyDTO.getMoons().stream()
                    .map(SolarBodyMapper::convertMoonDTOToEntity)
                    .collect(Collectors.toSet());
            existingSolarBody.setMoons(newMoons);
        }
        existingSolarBody.setMoonCount(existingSolarBody.getMoons().size());

        return solarBodiesRepository.save(existingSolarBody);
    }

    /**
     * Patch pojedynczego obiektu (np. @PatchMapping).
     * Zwraca zaktualizowane DTO, lub null jeśli brak w DB.
     */
    public SolarBodyDTO patchSolarBody(Long id, Map<String, Object> updates) {
        Optional<SolarBodies> optional = solarBodiesRepository.findById(id);
        if (optional.isEmpty()) {
            logger.warning("No solar body found for ID: " + id);
            return null;
        }
        SolarBodies existing = optional.get();

        updates.forEach((field, value) -> {
            switch (field) {
                case "englishName" -> existing.setEnglishName((String) value);
                case "bodyType" -> existing.setBodyType((String) value);
                case "planet" -> existing.setPlanet((Boolean) value);
                case "meanRadius" -> existing.setMeanRadius(value != null ? ((Number) value).doubleValue() : null);
                case "semiMajorAxis" -> existing.setSemimajorAxis(value != null ? ((Number) value).longValue() : null);
                case "perihelion" -> existing.setPerihelion(value != null ? ((Number) value).longValue() : null);
                case "aphelion" -> existing.setAphelion(value != null ? ((Number) value).longValue() : null);
                case "inclination" -> existing.setInclination(value != null ? ((Number) value).doubleValue() : null);
                case "gravity" -> existing.setGravity(value != null ? ((Number) value).doubleValue() : null);
                case "escapeSpeed" -> existing.setEscape(value != null ? ((Number) value).doubleValue() : null);
                case "orbitalPeriod" -> existing.setSideralOrbit(value != null ? ((Number) value).doubleValue() : null);
                case "rotationPeriod" -> existing.setSideralRotation(value != null ? ((Number) value).doubleValue() : null);
                case "discoveredBy" -> existing.setDiscoveredBy((String) value);
                case "discoveryDate" -> existing.setDiscoveryDate((String) value);
                case "axialTilt" -> existing.setAxialTilt(value != null ? ((Number) value).doubleValue() : null);
                case "avgTemp" -> existing.setAvgTemp(value != null ? ((Number) value).doubleValue() : null);
                // Dodawaj kolejne pola w razie potrzeby
                default -> logger.warning("Unsupported field for patch: " + field);
            }
        });

        // Przelicz moonCount
        existing.setMoonCount(existing.getMoons().size());

        SolarBodies saved = solarBodiesRepository.save(existing);
        return SolarBodyMapper.convertToDTO(saved);
    }

    /**
     * Usuwa obiekt z bazy. Zwraca true, jeśli usunięto, false jeśli nie było takiego ID.
     */
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

    /**
     * Metoda w stylu: "zwróć obiekt i dociągnij szczegóły księżyców (jeśli w bazie brak)".
     * Czyli konwertuje do DTO, a dla każdego Moon w liście – sprawdza, czy mamy go w DB,
     * jeśli nie – fetchByRel. Potem tworzy "pełny" MoonDTO.
     */
    public SolarBodyDTO convertToDTOWithFullMoons(SolarBodies solarBody) {
        SolarBodyDTO dto = SolarBodyMapper.convertToDTO(solarBody);

        if (dto.getMoons() != null && !dto.getMoons().isEmpty()) {
            Set<MoonDTO> expandedMoons = new HashSet<>();
            for (MoonDTO basicMoon : dto.getMoons()) {
                // spróbujmy znaleźć w bazie
                SolarBodies moonBody = solarBodiesRepository.findByEnglishName(basicMoon.getEnglishName());
                if (moonBody == null) {
                    // Spróbujmy fetchByRel (jeśli mamy link w rel)
                    if (basicMoon.getRel() != null) {
                        moonBody = fetchAndSaveByRel(basicMoon.getRel());
                    }
                }
                // Jeśli po fetchu mamy, konwertuj do "pełnego" MoonDTO
                if (moonBody != null) {
                    expandedMoons.add(SolarBodyMapper.convertSolarBodyToMoonDTO(moonBody));
                } else {
                    // Wstaw to co mieliśmy "surowe"
                    expandedMoons.add(basicMoon);
                }
            }
            dto.setMoons(expandedMoons);
        }

        return dto;
    }

    /**
     * Prosta metoda do masowego pobrania z API i zapisania w bazie (np. w pętli).
     * Jeżeli "planetNames" zawiera [Mercury, Venus, Earth...], to ściągnie i zapisze wszystkie.
     */
    public void saveSolarBodiesDataForPlanets(List<String> planetNames) {
        for (String planetName : planetNames) {
            logger.info("Attempting to fetch/save " + planetName);
            findOrFetchByEnglishName(planetName);
        }
    }

    /**
     * Szuka w bazie, jeśli brak, pobiera z API i zapisuje w bazie.
     * Zwraca gotową encję lub null, jeśli się nie udało.
     */
    public SolarBodies findOrFetchByEnglishName(String englishName) {
        if (englishName == null || englishName.isBlank()) {
            logger.warning("findOrFetchByEnglishName: englishName is null/blank.");
            return null;
        }

        // 1. Sprawdź w bazie
        SolarBodies existing = solarBodiesRepository.findByEnglishName(englishName);
        if (existing != null) {
            return existing;
        }

        // 2. Nie ma w bazie -> pobierz z API (korzystając z solarBodiesFetchService!)
        //    Upewnij się, że klasa SolarBodiesFetchService istnieje i jest wstrzykiwana
        SolarBodies fromApi = solarBodiesFetchService.fetchByEnglishName(englishName);
        if (fromApi == null) {
            logger.warning("findOrFetchByEnglishName - Could not fetch data for " + englishName);
            return null;
        }

        // 3. Zainicjuj moony, oblicz moonCount
        if (fromApi.getMoons() == null) {
            fromApi.setMoons(new HashSet<>());
        }
        fromApi.setMoonCount(fromApi.getMoons().size());

        // 4. Zapisz w bazie
        SolarBodies saved = solarBodiesRepository.save(fromApi);
        logger.info("findOrFetchByEnglishName - saved: " + saved.getEnglishName() + ", ID=" + saved.getIdNumber());
        return saved;
    }

    /**
     * Pobiera z API obiekt na podstawie "rel", jeśli to się uda – zapisuje w bazie.
     * Zwraca zapisany obiekt lub null, jeśli się nie udało.
     */
    public SolarBodies fetchAndSaveByRel(String rel) {
        SolarBodies fromApi = solarBodiesFetchService.fetchByRel(rel);
        if (fromApi == null) {
            logger.warning("fetchAndSaveByRel - no data from API for rel=" + rel);
            return null;
        }
        // Inicjalizacja / moonCount
        if (fromApi.getMoons() == null) {
            fromApi.setMoons(new HashSet<>());
        }
        fromApi.setMoonCount(fromApi.getMoons().size());

        SolarBodies saved = solarBodiesRepository.save(fromApi);
        logger.info("fetchAndSaveByRel - saved entity: " + saved.getEnglishName() + ", ID=" + saved.getIdNumber());
        return saved;
    }

    // ---------------------- PRZYKŁADOWE METODY POMOCNICZE (PRYWATNE) ----------------------

    /**
     * Uderzamy w API bezpośrednio po polu "rel" (np. "https://api.le-systeme-solaire.net/rest/bodies/psamathee").
     * Pozostawiam w razie potrzeby, jeśli jeszcze chcesz z tego korzystać w stary sposób,
     * ale w nowej wersji raczej używamy fetchAndSaveByRel.
     */
    private SolarBodies fetchFromApiByRel(String rel) {
        logger.info("Attempting to fetch body from rel: '" + rel + "'");
        if (rel == null || rel.isBlank()) {
            logger.severe("REL is null or blank: " + rel);
            return null;
        }

        rel = rel.trim();
        if (!(rel.startsWith("http://") || rel.startsWith("https://"))) {
            logger.severe("REL does not start with http or https: " + rel);
            return null;
        }

        // (opcjonalnie) sprawdźmy, czy rel też nie w alreadyFailed:
        if (alreadyFailedNames.contains(rel.toLowerCase())) {
            logger.warning("Skipping fetchFromApiByRel(" + rel + ") because it was flagged as failed.");
            return null;
        }

        try {
            SolarBodies solarBodyDetails = httpClientService.getPlanetDetails(rel, SolarBodies.class);
            if (solarBodyDetails != null && solarBodyDetails.getEnglishName() != null) {
                SolarBodies saved = saveIfNotNull(solarBodyDetails.getEnglishName(), solarBodyDetails);
                if (saved == null) {
                    // Znów, jeżeli się nie udało – dopisz do alreadyFailed
                    alreadyFailedNames.add(rel.toLowerCase());
                }
                return saved;
            } else {
                logger.warning("fetchFromApiByRel got null or missing englishName for rel=" + rel);
                alreadyFailedNames.add(rel.toLowerCase());
                return null;
            }
        } catch (Exception ex) {
            logger.severe("Error fetching from rel=" + rel + " : " + ex.getMessage());
            alreadyFailedNames.add(rel.toLowerCase());
            return null;
        }
    }

    /**
     * Zapisuje solarBodyDetails w bazie, o ile nie jest null.
     * Zwraca zapisany obiekt lub null, jeśli nie ma żadnych danych.
     */
    private SolarBodies saveIfNotNull(String nameAttempt, SolarBodies solarBodyDetails) {
        if (solarBodyDetails == null) {
            logger.warning("Could not find data for: " + nameAttempt
                    + " even from external API => returning null.");
            return null;
        }
        // Inicjalizacja księżyców + zliczenie
        if (solarBodyDetails.getMoons() == null) {
            solarBodyDetails.setMoons(new HashSet<>());
        }
        solarBodyDetails.setMoonCount(solarBodyDetails.getMoons().size());

        SolarBodies saved = solarBodiesRepository.save(solarBodyDetails);
        logger.info("Saved " + nameAttempt + " from API (englishName="
                + solarBodyDetails.getEnglishName() + ")");
        return saved;
    }

    /**
     * Przykład nieużywanej metody do testów
     */
    private String stringToHex(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            sb.append("\\x")
                    .append(Integer.toHexString((int) c));
        }
        return sb.toString();
    }

}
