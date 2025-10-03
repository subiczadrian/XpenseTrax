using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XpenseTrax.API.Data;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.Controllers;

[AuthToken]
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
            await _context.Salaries.AddAsync(salary);
        }
        else
        {
            existing.Amount = salary.Amount;
        }

        await _context.SaveChangesAsync();

        return Ok(salary);
    }
}

