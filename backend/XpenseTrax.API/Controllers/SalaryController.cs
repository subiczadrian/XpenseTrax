using Microsoft.AspNetCore.Mvc;
using XpenseTrax.API.Data;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalaryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public SalaryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetSalary()
        {
            var salary = _context.Salaries.FirstOrDefault();
            if (salary == null) return NotFound();
            return Ok(salary);
        }

        [HttpPost]
        public IActionResult SetSalary(Salary salary)
        {
            _context.Salaries.Add(salary);
            _context.SaveChanges();
            return Ok(salary);
        }
    }
}
