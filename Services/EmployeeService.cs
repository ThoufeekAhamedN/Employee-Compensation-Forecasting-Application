using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;

namespace EmployeeCompensationApp.Services
{
    public class EmployeeService
    {
        private readonly string _connectionString;

        public EmployeeService(string connectionString)
        {
            _connectionString = connectionString;
        }

        public DataTable CalculateAverageCompensation(int? locationId)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                using (var command = new MySqlCommand("sp_CalculateAverageCompensation", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    AddParameterWithNull(command, "p_LocationID", locationId);

                    var adapter = new MySqlDataAdapter(command);
                    var result = new DataTable();
                    adapter.Fill(result);

                    return result;
                }
            }
        }

        public DataTable GroupByExperience(bool groupByLocation, bool groupByRole)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                using (var command = new MySqlCommand("sp_GroupByExperience", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("p_GroupByLocation", groupByLocation);
                    command.Parameters.AddWithValue("p_GroupByRole", groupByRole);

                    var adapter = new MySqlDataAdapter(command);
                    var result = new DataTable();
                    adapter.Fill(result);

                    return result;
                }
            }
        }

        public DataTable SimulateIncrement(decimal globalIncrement, int? locationId, decimal locationIncrement,
                                         int? employeeId, decimal employeeIncrement)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                using (var command = new MySqlCommand("sp_SimulateIncrement", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("p_GlobalIncrement", globalIncrement);
                    AddParameterWithNull(command, "p_LocationID", locationId);
                    command.Parameters.AddWithValue("p_LocationIncrement", locationIncrement);
                    AddParameterWithNull(command, "p_EmployeeID", employeeId);
                    command.Parameters.AddWithValue("p_EmployeeIncrement", employeeIncrement);

                    var adapter = new MySqlDataAdapter(command);
                    var result = new DataTable();
                    adapter.Fill(result);

                    return result;
                }
            }
        }

        public List<Role> GetRoles()
        {
            var roles = new List<Role>();

            using (var connection = new MySqlConnection(_connectionString))
            {
                var command = new MySqlCommand("SELECT role_id, role_name FROM Roles ORDER BY role_name;", connection);
                connection.Open();

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        roles.Add(new Role
                        {
                            RoleId = Convert.ToInt32(reader["role_id"]),
                            RoleName = reader["role_name"].ToString()
                        });
                    }
                }
            }
            return roles;
        }

        public List<Location> GetLocations()
        {
            var locations = new List<Location>();

            using (var connection = new MySqlConnection(_connectionString))
            {
                var command = new MySqlCommand("SELECT location_id, location_name FROM Locations ORDER BY location_name", connection);
                connection.Open();

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        locations.Add(new Location
                        {
                            LocationId = Convert.ToInt32(reader["location_id"]),
                            LocationName = reader["location_name"].ToString()
                        });
                    }
                }
            }

            return locations;
        }

        public List<Employee> FilterEmployees(int? roleId, int? locationId, bool includeInactive)
        {
            var employees = new List<Employee>();

            using (var connection = new MySqlConnection(_connectionString))
            {
                var sql = @"SELECT e.employee_id, e.name, r.role_name AS Role, l.location_name AS Location, 
                           e.years_of_experience, e.is_active, e.current_compensation, e.last_working_day
                           FROM Employees e
                           JOIN Roles r ON e.role_id = r.role_id
                           JOIN Locations l ON e.location_id = l.location_id
                           WHERE (e.role_id = @roleId OR @roleId IS NULL)
                           AND (e.location_id = @locationId OR @locationId IS NULL)
                           AND (e.is_active = TRUE OR @includeInactive = TRUE)
                           ORDER BY e.name";

                var command = new MySqlCommand(sql, connection);

                // Add parameters with proper null handling
                AddParameterWithNull(command, "@roleId", roleId);
                AddParameterWithNull(command, "@locationId", locationId);
                command.Parameters.AddWithValue("@includeInactive", includeInactive);

                connection.Open();

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employees.Add(new Employee
                        {
                            EmployeeId = Convert.ToInt32(reader["employee_id"]),
                            Name = reader["name"].ToString(),
                            Role = reader["Role"].ToString(),
                            Location = reader["Location"].ToString(),
                            YearsOfExperience = reader["years_of_experience"].ToString(),
                            IsActive = Convert.ToBoolean(reader["is_active"]),
                            CurrentCompensation = reader["current_compensation"] != DBNull.Value ?
                                Convert.ToDecimal(reader["current_compensation"]) : 0,
                            LastWorkingDay = reader["last_working_day"] != DBNull.Value ?
                                Convert.ToDateTime(reader["last_working_day"]) : (DateTime?)null
                        });
                    }
                }
            }

            return employees;
        }

        private void AddParameterWithNull(MySqlCommand command, string parameterName, object value)
        {
            if (value == null)
            {
                command.Parameters.AddWithValue(parameterName, DBNull.Value);
            }
            else
            {
                command.Parameters.AddWithValue(parameterName, value);
            }
        }
    }

    public class Role
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }
    }

    public class Location
    {
        public int LocationId { get; set; }
        public string LocationName { get; set; }
    }

    public class Employee
    {
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Location { get; set; }
        public string YearsOfExperience { get; set; }
        public bool IsActive { get; set; }
        public decimal CurrentCompensation { get; set; }
        public DateTime? LastWorkingDay { get; set; }
    }
}