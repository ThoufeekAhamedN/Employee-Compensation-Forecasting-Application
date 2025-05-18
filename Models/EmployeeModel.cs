namespace EmployeeCompensationApp.Models
{
    public class EmployeeModel
    {
        // Models/Employee.cs
        public class Employee
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public string Role { get; set; }
            public string Location { get; set; }
            public string ExperienceRange { get; set; }
            public decimal CurrentCompensation { get; set; }
            public bool IsActive { get; set; }
        }

        // Models/CompensationStats.cs
        public class CompensationStats
        {
            public string Location { get; set; }
            public decimal AverageCompensation { get; set; }
        }
        // Models/ExperienceGroup.cs
        public class ExperienceGroup
        {
            public string ExperienceRange { get; set; }
            public int EmployeeCount { get; set; }
            public string GroupByValue { get; set; } // For location or role grouping
        }
    }
}
