using Microsoft.EntityFrameworkCore;
using XpenseTrax.API.Models;

namespace XpenseTrax.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Salary> Salaries { get; set; }
    }
}
