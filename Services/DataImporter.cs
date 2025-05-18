using System;
using System.Data;
using MySql.Data.MySqlClient;

namespace EmployeeCompensationApp.Services
{
    public class DataValidator
    {
        private readonly string _connectionString;

        public DataValidator(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void ValidateDataIntegrity()
        {
            Console.WriteLine("Starting data validation...");

            CheckReferentialIntegrity();
            ValidateCompensationData();
            CheckActiveStatusConsistency();
            ValidateRatingData();

            Console.WriteLine("Data validation completed!");
        }

        private void CheckReferentialIntegrity()
        {
            Console.WriteLine("Checking referential integrity...");

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                // Check for employees with invalid role references
                var invalidRoleCount = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees e LEFT JOIN Roles r ON e.role_id = r.role_id WHERE r.role_id IS NULL");

                // Check for employees with invalid location references
                var invalidLocationCount = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees e LEFT JOIN Locations l ON e.location_id = l.location_id WHERE l.location_id IS NULL");

                // Check for industry compensation with invalid references
                var invalidIndustryRefs = GetCount(connection,
                    "SELECT COUNT(*) FROM IndustryCompensation ic " +
                    "LEFT JOIN Roles r ON ic.role_id = r.role_id " +
                    "LEFT JOIN Locations l ON ic.location_id = l.location_id " +
                    "WHERE r.role_id IS NULL OR l.location_id IS NULL");

                Console.WriteLine($"Referential integrity issues found: {invalidRoleCount} bad role references, " +
                                $"{invalidLocationCount} bad location references, " +
                                $"{invalidIndustryRefs} bad industry compensation references");
            }
        }

        private void ValidateCompensationData()
        {
            Console.WriteLine("Validating compensation data...");

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                // Check for employees with compensation below industry average
                var belowAvgCount = GetCount(connection,
                    @"SELECT COUNT(*) FROM Employees e
                      JOIN Roles r ON e.role_id = r.role_id
                      JOIN Locations l ON e.location_id = l.location_id
                      JOIN IndustryCompensation ic ON ic.role_id = r.role_id AND ic.location_id = l.location_id
                      WHERE e.current_compensation < ic.average_compensation");

                // Check for negative compensation values
                var negativeCompCount = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees WHERE current_compensation < 0");

                Console.WriteLine($"Compensation validation: {belowAvgCount} employees below industry average, " +
                                $"{negativeCompCount} with negative compensation");
            }
        }

        private void CheckActiveStatusConsistency()
        {
            Console.WriteLine("Checking active status consistency...");

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                // Check for inactive employees without a last working day
                var inactiveWithoutDate = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees WHERE is_active = FALSE AND last_working_day IS NULL");

                // Check for active employees with a last working day
                var activeWithDate = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees WHERE is_active = TRUE AND last_working_day IS NOT NULL");

                Console.WriteLine($"Active status issues: {inactiveWithoutDate} inactive without end date, " +
                                $"{activeWithDate} active with end date");
            }
        }

        private void ValidateRatingData()
        {
            Console.WriteLine("Validating rating data...");

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                // Check for employees missing ratings
                var missingRatings = GetCount(connection,
                    "SELECT COUNT(*) FROM Employees e LEFT JOIN EmployeeRatings er ON e.employee_id = er.employee_id WHERE er.employee_id IS NULL");

                // Check for invalid rating values (outside 1-5 range)
                var invalidRatings = GetCount(connection,
                    "SELECT COUNT(*) FROM EmployeeRatings WHERE self_rating < 1 OR self_rating > 5 OR manager_rating < 1 OR manager_rating > 5");

                Console.WriteLine($"Rating validation: {missingRatings} employees without ratings, " +
                                $"{invalidRatings} invalid rating values");
            }
        }

        private int GetCount(MySqlConnection connection, string query)
        {
            using (var cmd = new MySqlCommand(query, connection))
            {
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        public void GenerateDataQualityReport()
        {
            Console.WriteLine("\nGenerating Data Quality Report:");
            Console.WriteLine("===============================");

            using (var connection = new MySqlConnection(_connectionString))
            {
                connection.Open();

                // Total records in each table
                Console.WriteLine("\nTable Record Counts:");
                Console.WriteLine($"Employees: {GetCount(connection, "SELECT COUNT(*) FROM Employees")}");
                Console.WriteLine($"Roles: {GetCount(connection, "SELECT COUNT(*) FROM Roles")}");
                Console.WriteLine($"Locations: {GetCount(connection, "SELECT COUNT(*) FROM Locations")}");
                Console.WriteLine($"Industry Compensation: {GetCount(connection, "SELECT COUNT(*) FROM IndustryCompensation")}");
                Console.WriteLine($"Employee Ratings: {GetCount(connection, "SELECT COUNT(*) FROM EmployeeRatings")}");

                // Data completeness
                Console.WriteLine("\nData Completeness:");
                Console.WriteLine($"Employees with null names: {GetCount(connection, "SELECT COUNT(*) FROM Employees WHERE name IS NULL")}");
                Console.WriteLine($"Employees with null compensation: {GetCount(connection, "SELECT COUNT(*) FROM Employees WHERE current_compensation IS NULL")}");

                // Data consistency
                Console.WriteLine("\nData Consistency:");
                Console.WriteLine($"Employees with future join dates: {GetCount(connection, "SELECT COUNT(*) FROM Employees WHERE join_date > CURDATE()")}");
                Console.WriteLine($"Ratings with manager score > self score: {GetCount(connection, "SELECT COUNT(*) FROM EmployeeRatings WHERE manager_rating > self_rating")}");
            }
        }
    }
}