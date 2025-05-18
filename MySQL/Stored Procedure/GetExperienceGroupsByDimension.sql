DELIMITER $$

CREATE PROCEDURE GetExperienceGroupsByDimension(IN groupByColumn VARCHAR(50))
BEGIN
    SET @sql = CONCAT(
        'SELECT `Years of Experience` AS ExperienceRange, COUNT(*) AS EmployeeCount, ',
        groupByColumn,
        ' AS GroupByValue FROM employee_data WHERE `Active?` = ''Y'' ',
        'GROUP BY `Years of Experience`, ', groupByColumn,
        ' ORDER BY ', groupByColumn, ', CASE ',
        'WHEN `Years of Experience` = ''0-1'' THEN 1 ',
        'WHEN `Years of Experience` = ''1-2'' THEN 2 ',
        'WHEN `Years of Experience` = ''2-3'' THEN 3 ',
        'WHEN `Years of Experience` = ''3-4'' THEN 4 ',
        'WHEN `Years of Experience` = ''4-5'' THEN 5 ',
        'WHEN `Years of Experience` = ''5-6'' THEN 6 ',
        'WHEN `Years of Experience` = ''6-7'' THEN 7 ',
        'WHEN `Years of Experience` = ''7-8'' THEN 8 ',
        'WHEN `Years of Experience` = ''8-9'' THEN 9 ',
        'WHEN `Years of Experience` = ''9-10'' THEN 10 ',
        'ELSE 11 END'
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

DELIMITER ;
