package org.example.solarapi.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MoonDTO {
    private String englishName;
    private String rel;
    private String bodyType;
    private Double meanRadius;
    private Long semimajorAxis;
    private Long perihelion;
    private Long aphelion;
    private Double eccentricity;
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

    private TexturesDTO textures;
    private String model;
}
