package org.example.solarapi.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.*;

@Getter
@Setter
@Entity
@Table(name = "Solar_Bodies")
@ToString
public class SolarBodies {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_number")
    private Long idNumber;

    @Column(name = "external_id", unique = true, nullable = false)
    private String externalId;

    @Column(name = "english_name")
    private String englishName;

    @Column(name = "body_type")
    private String bodyType;

    @Column(name = "is_planet")
    private boolean isPlanet;

    @OneToMany(mappedBy = "solarBodies", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<Moon> moons;

    @Column(name = "semimajor_axis")
    private Long semimajorAxis;

    private Long perihelion;
    private Long aphelion;
    private Double eccentricity;
    private Double inclination;

    @Embedded
    private Mass mass;

    @Embedded
    private Vol vol;

    private Double gravity;
    private Double escape;
    @Column(name = "mean_radius")
    private Double meanRadius;
    @Column(name = "equa_radius")
    private Double equaRadius;
    @Column(name = "polar_radius")
    private Double polarRadius;
    @Column(name = "sideral_orbit")
    private Double sideralOrbit;
    @Column(name = "sideral_rotation")
    private Double sideralRotation;
    @Column(name = "discovered_by")
    private String discoveredBy;
    @Column(name = "discovery_date")
    private String discoveryDate;
    @Column(name = "alternative_name")
    private String alternativeName;
    @Column(name = "axial_tilt")
    private Double axialTilt;
    @Column(name = "avg_temp")
    private Double avgTemp;
    @Column(name = "moon_count")
    private Integer moonCount;

    @Transient
    private List<Map<String, String>> moonsApiData; // Tymczasowe dane z API

    // Konstruktor bezargumentowy
    public SolarBodies() {
        this.externalId = UUID.randomUUID().toString();
        this.moons = new HashSet<>();
    }

    public void setMoons(Set<Moon> moons) {
        if (this.moons == null) {
            this.moons = new HashSet<>();
        } else {
            this.moons.clear();
        }
        if (moons != null) {
            this.moons.addAll(moons);
            // Ustaw odniesienie zwrotne do SolarBodies w każdym Moon
            for (Moon moon : moons) {
                moon.setSolarBodies(this);
            }
        }
        this.moonCount = moons != null ? moons.size() : 0;
    }

}
