CREATE TABLE IF NOT EXISTS solar_bodies
(
    id_number        BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id      VARCHAR(255) UNIQUE,
    english_name     VARCHAR(255),
    body_type        VARCHAR(255),
    is_planet        BOOLEAN,
    semimajor_axis   BIGINT,
    perihelion       BIGINT,
    aphelion         BIGINT,
    eccentricity     DOUBLE,
    inclination      DOUBLE,
    mass_value       DOUBLE,
    mass_exponent    INTEGER,
    vol_value        DOUBLE,
    vol_exponent     INTEGER,
    gravity          DOUBLE,
    escape           DOUBLE,
    mean_radius      DOUBLE,
    equa_radius      DOUBLE,
    polar_radius     DOUBLE,
    sideral_orbit    DOUBLE,
    sideral_rotation DOUBLE,
    discovered_by    VARCHAR(255),
    discovery_date   VARCHAR(255),
    alternative_name VARCHAR(255),
    axial_tilt       DOUBLE,
    avg_temp         DOUBLE,
    moon_count       INT
);

CREATE TABLE IF NOT EXISTS moons
(
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    solar_bodies_id BIGINT,
    moon            VARCHAR(255),
    rel             VARCHAR(255),
    original_name   VARCHAR(255),
    FOREIGN KEY (solar_bodies_id) REFERENCES solar_bodies (id_number)
);

UPDATE solar_bodies
SET moon_count = (
    SELECT COUNT(*)
    FROM moons
    WHERE moons.solar_bodies_id = solar_bodies.id_number
);
