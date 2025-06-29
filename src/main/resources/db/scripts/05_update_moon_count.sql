UPDATE solar_bodies
SET moon_count = (
    SELECT COUNT(*)
    FROM moons
    WHERE moons.solar_bodies_id = solar_bodies.id_number
);