package org.example.solarapi.controller;

import org.example.solarapi.dto.SolarBodyDTO;
import org.example.solarapi.mapper.SolarBodyMapper;
import org.example.solarapi.model.Moon;
import org.example.solarapi.model.SolarBodies;
import org.example.solarapi.service.HttpClientService;
import org.example.solarapi.service.SolarBodiesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
    public ResponseEntity<SolarBodyDTO> getSolarBodyByName(@PathVariable String englishName) {
        SolarBodies solarBody = solarBodiesService.getSolarBodyByName(englishName);
        if (solarBody == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        SolarBodyDTO dto = solarBodiesService.convertToDTOWithFullMoons(solarBody);
        return ResponseEntity.ok(dto);

        // SolarBodyDTO dto = SolarBodyMapper.convertToDTO(solarBody);
        // return ResponseEntity.ok(dto);
    }

    @GetMapping("/{englishName}/moons")
    public Set<Moon> getMoonsBySolarBodyName(@PathVariable String englishName) {
        return solarBodiesService.getMoonsBySolarBodyName(englishName);
    }
    @PostMapping
    public ResponseEntity<SolarBodyDTO> createSolarBody(@RequestBody SolarBodyDTO solarBodyDTO) {
        SolarBodies solarBody = SolarBodyMapper.convertToEntity(solarBodyDTO);
        SolarBodies savedSolarBody = solarBodiesService.saveSolarBody(solarBody);
        SolarBodyDTO savedDTO = SolarBodyMapper.convertToDTO(savedSolarBody);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDTO);
    }
    @PutMapping("/{id}")
    public ResponseEntity<SolarBodyDTO> updateSolarBody(@PathVariable Long id, @RequestBody SolarBodyDTO solarBodyDTO) {
        SolarBodies updatedSolarBody = solarBodiesService.updateSolarBody(id, solarBodyDTO);
        if (updatedSolarBody == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        SolarBodyDTO updatedDTO = SolarBodyMapper.convertToDTO(updatedSolarBody);
        return ResponseEntity.ok(updatedDTO);
    }
    @PatchMapping("/{id}")
    public ResponseEntity<SolarBodyDTO> patchSolarBody(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        SolarBodyDTO updated = solarBodiesService.patchSolarBody(id, updates);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSolarBody(@PathVariable Long id) {
        boolean deleted = solarBodiesService.deleteSolarBody(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }


}