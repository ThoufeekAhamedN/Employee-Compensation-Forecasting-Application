using Microsoft.AspNetCore.Mvc;

namespace EmployeeCompensationApp.Controllers
{
    public class HomeController : Controller
    {
        
        public IActionResult Index()
        {
            //ViewBag.Roles = _employeeService.GetRoles();
            //ViewBag.Locations = _employeeService.GetLocations();
            return View();
        }
    }
}