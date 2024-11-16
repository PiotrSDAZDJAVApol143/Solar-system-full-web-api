package org.example.solarapi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.lang.reflect.Array;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "Moons")
@ToString
public class Moon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String moon; // Angielska nazwa księżyca
    private String originalName;
    private String rel;  // Link do szczegółów API

    @ManyToOne
    @JoinColumn(name = "solar_bodies_id")
    @JsonBackReference
    private SolarBodies solarBodies;
}
