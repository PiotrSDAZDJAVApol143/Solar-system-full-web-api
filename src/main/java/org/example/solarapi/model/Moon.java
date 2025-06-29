package org.example.solarapi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;



@Getter
@Setter
@Entity
@Table(name = "moons")
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
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Moon)) return false;
        Moon other = (Moon) o;
        return moon != null && moon.equalsIgnoreCase(other.getMoon());
    }

    @Override
    public int hashCode() {
        return moon != null ? moon.toLowerCase().hashCode() : 0;
    }
}
