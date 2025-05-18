DELIMITER $$

CREATE PROCEDURE GetFilteredEmployees(
    IN inputRole VARCHAR(100),
    IN inputLocation VARCHAR(100),
    IN includeInactive BOOLEAN
)
BEGIN
    SELECT 
        Name, 
        Role, 
        Location,
        `Years of Experience` AS ExperienceRange, 
        `Current Comp (INR)` AS CurrentCompensation, 
        CASE WHEN `Active?` = 'Y' THEN 1 ELSE 0 END AS IsActive
    FROM 
        employee_data
    WHERE 
        (inputRole IS NULL OR Role = inputRole)
        AND (inputLocation IS NULL OR Location = inputLocation)
        AND (includeInactive OR `Active?` = 'Y');
END$$

DELIMITER ;
