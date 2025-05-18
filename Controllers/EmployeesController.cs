using Dapper;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Text;
using static EmployeeCompensationApp.Models.EmployeeModel;

namespace EmployeeCompensationApp.Controllers
{       // Controllers/EmployeesController.cs
        [Route("api/[controller]")]
        [ApiController]
        public class EmployeesController : ControllerBase
        {
            private readonly string _connectionString;

            public EmployeesController(IConfiguration configuration)
            {
                _connectionString = configuration.GetConnectionString("DefaultConnection");
            }

        // GET: api/employees?role=Analyst&location=Banglore&includeInactive=false
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.EmployeeModel.Employee>>> GetEmployees(
[FromQuery] string role = null,
[FromQuery] string location = null,
[FromQuery] bool includeInactive = false)
        {
            var employees = new List<Models.EmployeeModel.Employee>();

            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var parameters = new DynamicParameters();
                parameters.Add("inputRole", role, DbType.String);
                parameters.Add("inputLocation", location, DbType.String);
                parameters.Add("includeInactive", includeInactive, DbType.Boolean);

                employees = (await connection.QueryAsync<Models.EmployeeModel.Employee>(
                    "GetFilteredEmployees",
                    parameters,
                    commandType: CommandType.StoredProcedure)).ToList();
            }

            return Ok(employees);
        }


        // GET: api/employees/average-compensation
        [HttpGet("average-compensation")]
        public async Task<ActionResult<IEnumerable<CompensationStats>>> GetAverageCompensation()
        {
            var stats = new List<CompensationStats>();

            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                stats = (await connection.QueryAsync<CompensationStats>(
                    "GetAverageCompensationByLocation",
                    commandType: CommandType.StoredProcedure)).ToList();
            }

            return Ok(stats);
        }

        // GET: api/employees/roles
        [HttpGet("roles")]
        public async Task<ActionResult<IEnumerable<string>>> GetRoles()
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var roles = (await connection.QueryAsync<string>(
                    "GetDistinctRoles",
                    commandType: CommandType.StoredProcedure)).ToList();
                return Ok(roles);
            }
        }


        // GET: api/employees/locations
        [HttpGet("locations")]
        public async Task<ActionResult<IEnumerable<string>>> GetLocations()
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var locations = (await connection.QueryAsync<string>(
                    "GetDistinctLocations",
                    commandType: CommandType.StoredProcedure)).ToList();
                return Ok(locations);
            }
        }


        // GET: api/employees/experience-groups
        [HttpGet("experience-groups")]
        public async Task<ActionResult<IEnumerable<ExperienceGroup>>> GetExperienceGroups(
    [FromQuery] string groupBy = null)
        {
            using (var connection = new MySqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                IEnumerable<ExperienceGroup> groups;

                if (string.IsNullOrEmpty(groupBy) || (groupBy != "Role" && groupBy != "Location"))
                {
                    groups = await connection.QueryAsync<ExperienceGroup>(
                        "GetExperienceGroupsBasic",
                        commandType: CommandType.StoredProcedure);
                }
                else
                {
                    var parameters = new DynamicParameters();
                    parameters.Add("groupByColumn", groupBy);
                    groups = await connection.QueryAsync<ExperienceGroup>(
                        "GetExperienceGroupsByDimension",
                        parameters,
                        commandType: CommandType.StoredProcedure);
                }

                return Ok(groups.ToList());
            }
        }

    }

}