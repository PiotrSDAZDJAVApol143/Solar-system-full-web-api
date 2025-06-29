package org.example.solarapi.repository;

import org.example.solarapi.model.SolarBodies;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolarBodiesRepository extends JpaRepository<SolarBodies, Long> {
    SolarBodies findByEnglishName(String englishName);
    SolarBodies findByEnglishNameIgnoreCase(String englishName);
    Optional<SolarBodies> findById(Long id);
    List<SolarBodies> findByIsPlanetTrue();
    List<SolarBodies> findByBodyTypeIgnoreCase(String bodyType);
    @Query("SELECT sb FROM SolarBodies sb LEFT JOIN FETCH sb.moons WHERE LOWER(sb.englishName) = LOWER(:englishName)")
    SolarBodies findByEnglishNameWithMoons(@Param("englishName") String englishName);
}

