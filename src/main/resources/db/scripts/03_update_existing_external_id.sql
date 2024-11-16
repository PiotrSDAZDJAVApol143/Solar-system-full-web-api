UPDATE Solar_Bodies
SET external_id = UUID()
WHERE external_id IS NULL;