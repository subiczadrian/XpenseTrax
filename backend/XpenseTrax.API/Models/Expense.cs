namespace XpenseTrax.API.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public double Amount { get; set; }
        public string Description { get; set; }
        public bool IsPaid { get; set; }
    }
}
