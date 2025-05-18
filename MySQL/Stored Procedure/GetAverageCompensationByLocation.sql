DELIMITER $$

CREATE PROCEDURE GetAverageCompensationByLocation()
BEGIN
    SELECT 
        Location, 
        AVG(`Current Comp (INR)`) AS AverageCompensation
    FROM 
        employee_data
    WHERE 
        `Active?` = 'Y'
    GROUP BY 
        Location;
END$$

DELIMITER ;
