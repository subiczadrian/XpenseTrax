using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XpenseTrax.API.Data;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ExpensesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetExpenses()
        {
            var expenses = _context.Expenses.ToList();
            return Ok(expenses);
        }

        [HttpPost]
        public IActionResult CreateExpense(Expense expense)
        {
            _context.Expenses.Add(expense);
            _context.SaveChanges();
            return Ok(expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExpense(int id, [FromBody] Expense updatedExpense)
        {
            if (id != updatedExpense.Id)
            {
                return BadRequest();
            }

            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            expense.Amount = updatedExpense.Amount;
            expense.Description = updatedExpense.Description;
            expense.IsPaid = updatedExpense.IsPaid;
            _context.Entry(expense).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();  
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteExpense(int id)
        {
            var expense = _context.Expenses.Find(id);
            if (expense == null) return NotFound();

            _context.Expenses.Remove(expense);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
