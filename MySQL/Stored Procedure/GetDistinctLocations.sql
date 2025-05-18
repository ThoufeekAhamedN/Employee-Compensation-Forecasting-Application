DELIMITER $$

CREATE PROCEDURE GetDistinctLocations()
BEGIN
    SELECT DISTINCT Location FROM employee_data;
END$$

DELIMITER ;
