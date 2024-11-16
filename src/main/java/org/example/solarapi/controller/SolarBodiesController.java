package org.example.solarapi.controller;

import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.service.HttpClientService;
import org.example.solarapi.service.SolarBodiesService;
import org.example.solarapi.service.SolarSystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Set;


@RestController
@RequestMapping("/api/solarbodies")
public class SolarBodiesController {
    @Autowired
    private SolarBodiesService solarBodiesService;

    @Autowired
    private HttpClientService<SolarBodies> httpClientService;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/sync")
    public String syncSolarBodiesData() {
        List<String> planetNames = Arrays.asList("Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune");
        for (String planetName : planetNames) {
            solarBodiesService.saveSolarBodiesData(planetName);
        }
        return "Data synchronized successfully";
    }

    @GetMapping("/sync2")
    public ResponseEntity<String> syncSolarBodiesDataAll() {
        String url = "https://api.le-systeme-solaire.net/rest/bodies/";
        List<SolarBodies> solarBodiesList = httpClientService.getAllSolarBodies(url);
        if (solarBodiesList != null) {
            solarBodiesService.saveAllSolarBodiesData(solarBodiesList);
            return ResponseEntity.ok("Data synchronized successfully");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch data from API");
        }
    }
    @GetMapping("/{englishName}")
    public SolarBodies getSolarBodyByName(@PathVariable String englishName) {
        return solarBodiesService.getSolarBodyByName(englishName);
    }

    @GetMapping("/{englishName}/moons")
    public Set<Moon> getMoonsBySolarBodyName(@PathVariable String englishName) {
        return solarBodiesService.getMoonsBySolarBodyName(englishName);
    }
}