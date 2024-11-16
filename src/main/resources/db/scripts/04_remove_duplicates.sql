DELETE FROM Solar_Bodies
WHERE id_number NOT IN (
    SELECT * FROM (
                      SELECT MIN(id_number)
                      FROM Solar_Bodies
                      GROUP BY english_name
                  ) AS temp_table
);
