UPDATE solar_bodies
SET external_id = UUID()
WHERE external_id IS NULL;