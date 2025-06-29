DELETE FROM solar_bodies
WHERE id_number NOT IN (
    SELECT * FROM (
                      SELECT MIN(id_number)
                      FROM solar_bodies
                      GROUP BY english_name
                  ) AS temp_table
);
