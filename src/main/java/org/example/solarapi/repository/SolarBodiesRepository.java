package org.example.solarapi.repository;

import org.example.solarapi.model.SolarBodies;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolarBodiesRepository extends JpaRepository<SolarBodies, Long> {
    SolarBodies findByEnglishName(String englishName);
    Optional<SolarBodies> findById(Long id);
}

