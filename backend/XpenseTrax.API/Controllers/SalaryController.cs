using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> GetSalary()
        {
            var salary = await _context.Salaries.FirstOrDefaultAsync();

            if (salary == null)
                return NotFound();

            return Ok(salary);
        }

        [HttpPost]
        public async Task<IActionResult> SetSalary(Salary salary)
        {
            var existing = await _context.Salaries.FirstOrDefaultAsync();

            if (existing == null)
            {
                // még nincs salary → új létrehozása
                await _context.Salaries.AddAsync(salary);
            }
            else
            {
                // már van → frissítjük
                existing.Amount = salary.Amount; // vagy ami a property neve
                //_context.Salaries.Update(existing);
            }

            await _context.SaveChangesAsync();

            return Ok(salary);
        }
    }
}
