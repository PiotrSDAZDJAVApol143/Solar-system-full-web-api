package org.example.solarapi.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class SolarBodyDTO {
    private String englishName;
    private String bodyType;
    private boolean planet;
    private Double meanRadius;
    private Integer semiMajorAxis;
    private Integer perihelion;
    private Integer aphelion;
    private Double inclination;
    private Double mass;
    private Double vol;
    private Double gravity;
    private Double escapeSpeed;
    private Double orbitalPeriod;
    private Double rotationPeriod;
    private String discoveredBy;
    private String discoveryDate;
    private Double axialTilt;
    private Double avgTemp;

    private Integer moonCount;
    private Set<MoonDTO> moons;

    private TexturesDTO textures;
    private String model;
}
