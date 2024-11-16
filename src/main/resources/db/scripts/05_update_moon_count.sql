UPDATE Solar_Bodies
SET moon_count = (
    SELECT COUNT(*)
    FROM Moons
    WHERE Moons.solar_bodies_id = Solar_Bodies.id_number
);